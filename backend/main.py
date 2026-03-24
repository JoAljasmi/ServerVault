from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import User, GameServer, ServerStatus
from schemas import UserCreate, UserLogin, UserOut, ServerCreate, ServerOut, ServerAction, Token
from auth import hash_password, verify_password, create_token, get_current_user, delete_token, oauth2_scheme
from mcstatus import JavaServer
import os
import subprocess
from openai import OpenAI


# Create all tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ServerVault API")

# Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://13.63.101.221:3000", "http://localhost:3000", "http://13.63.101.221"],  # react dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====== auth routes ======

@app.post("/auth/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new account"""

    # checking if username or email already exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Log in and get an access token"""
    
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail = "Invalid username or password")
    
    token = create_token(db_user.id, db)
    return {"access_token": token, "token_type": "bearer"}

@app.post("/auth/logout")
def logout(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """log out by deleting the token"""
    delete_token(token, db)
    return {"message": "Logged out successfully"}


@app.get("/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the current logged in user's info"""
    return current_user

# ====== Docker Helpers ======

def get_public_ip() -> str:
    """ Get the ec2 public ip address"""
    try:
        result = subprocess.run(["curl", "-s", "http://checkip.amazonaws.com"],
        capture_output=True, text=True, timeout=5)
        return result.stdout.strip()
    except:
        return "0.0.0.0"
    
def get_next_port(db: Session) -> int:
    """Find the next available port starting from 25565"""
    servers = db.query(GameServer).all()
    used_ports = set()
    for s in servers:
        try:
            port = int(s.ip_address.split(":")[-1])
            used_ports.add(port)
        except:
            pass
    port = 25565
    while port in used_ports:
        port += 1
    return port

def run_docker(command: list) -> str:
    """Run a docker command and return the output"""
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=30,
        )
        return result.stdout.strip()
    except Exception as e:
        return str(e)

def get_container_stats(container_name: str) -> dict:
    """Get cpu and ram usage from the running container"""
    try:
        result = subprocess.run(
        ["docker", "stats", container_name, "--no-stream", "--format", "table {{.CPUPerc}}\t{{.MemPerc}}"],
        capture_output=True,
        text=True,
        timeout=10
        )
        output = result.stdout.strip()
        print(f"Raw stats output: {repr(output)}")  # Debugging line
        lines = output.split("\n")
        if len(lines) >= 2:
            values = lines[1].split()
            cpu = float(values[0].replace("%", ""))
            ram = float(values[1].replace("%", ""))
            return {"cpu": round(cpu, 1), "ram": round(ram, 1)}
    except Exception as e:
        print(f"stats error: {e}")
    return {"cpu": 0.0, "ram": 0.0}

def get_container_status(container_name: str) -> str:
    """Check if the contaienr is running"""
    result = run_docker(["docker", "inspect", "-f", "{{.State.Status}}", container_name])
    if "running" in result:
        return ServerStatus.RUNNING
    elif "exited" in result or "created" in result:
        return ServerStatus.STOPPED
    return ServerStatus.STOPPED

def get_player_count(ip_address: str) -> int:
    """Get the current player count"""
    try:
        host, port = ip_address.split(":")
        server = JavaServer.lookup(f"{host}:{port}")
        status = server.status()
        return status.players.online
    except:
        return 0

# ====== server routes ======

GAME_PRICING = {
    "minecraft": 9.99,
}

@app.post("/servers", response_model=ServerOut)
def create_server(
    server: ServerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ Deploy a new game server"""
    if server.game not in GAME_PRICING:
        raise HTTPException(status_code=400, detail="only minecraft is supported for now")
    
    #limited to 3 servers per user
    user_servers = db.query(GameServer).filter(GameServer.owner_id == current_user.id).all()
    if len(user_servers) >= 3:
        raise HTTPException(status_code=400, detail="Server limit reached per user (max 3)")

    port = get_next_port(db)
    container_name = f"mc-{current_user.id}-{port}"

    # start the minecraft server in docker
    run_docker([
        "docker", "run", "-d",
        "--name", container_name,
        "-p", f"{port}:25565",
        "-e", "EULA=TRUE",
        "-e", f"MAX_PLAYERS={server.max_players}",
        "-e", "MEMORY=512M",
        "-e", f"MOTD=ServerVault - {server.name}",
        "--restart", "unless-stopped",
        "itzg/minecraft-server"
    ])

    public = get_public_ip()

    new_server = GameServer(
        name=server.name,
        game=server.game,
        status=ServerStatus.RUNNING,
        ip_address=f"{public}:{port}",
        cpu_usage=0.0,
        ram_usage=0.0,
        player_count=0,
        max_players=server.max_players,
        monthly_cost=GAME_PRICING[server.game],
        owner_id=current_user.id
    )
    db.add(new_server)
    db.commit()
    db.refresh(new_server)
    return new_server

@app.get("/servers", response_model=list[ServerOut])
def list_servers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all servers owned by the current user."""
    servers = db.query(GameServer).filter(GameServer.owner_id == current_user.id).all()

    for server in servers:
        port = server.ip_address.split(":")[-1]
        container_name = f"mc-{current_user.id}-{port}"
        server.status = get_container_status(container_name)
        stats = get_container_stats(container_name)
        server.cpu_usage = stats["cpu"]
        server.ram_usage = stats["ram"]
        server.player_count = get_player_count(server.ip_address)

    db.commit()
    return servers

@app.get("/servers/{server_id}", response_model=ServerOut)
def get_server(
    server_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get details of a specific server."""

    server = db.query(GameServer).filter(
        GameServer.id == server_id,
        GameServer.owner_id == current_user.id,
    ).first()

    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    port = server.ip_address.split(":")[-1]
    container_name = f"mc-{current_user.id}-{port}"
    server.status = get_container_status(container_name)
    stats = get_container_stats(container_name)
    server.cpu_usage = stats["cpu"]
    server.ram_usage = stats["ram"]
    server.player_count = get_player_count(server.ip_address)
    db.commit()
    return server

@app.post("/servers/{server_id}/action", response_model=ServerOut)
def server_action(
    server_id: int,
    action: ServerAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """start, stop or restart a server"""

    server = db.query(GameServer).filter(
        GameServer.id == server_id,
        GameServer.owner_id == current_user.id
    ).first()

    if not server:
        raise HTTPException(status_code=404, detail= "Server not found")

    port = server.ip_address.split(":")[-1]
    container_name = f"mc-{current_user.id}-{port}"
    
    if action.action == "start":
        run_docker(["docker", "start", container_name])
        server.status = ServerStatus.RUNNING
    elif action.action == "stop":
        run_docker(["docker", "stop", container_name])
        server.status = ServerStatus.STOPPED
    elif action.action == "restart":
        run_docker(["docker", "restart", container_name])
        server.status = ServerStatus.RUNNING
    else:
        raise HTTPException(status_code=400, detail="Invalid action (valid actions: start, stop, restart)")
    
    db.commit()
    db.refresh(server)
    return server

@app.delete("/servers/{server_id}")
def delete_server(
    server_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete or cancel a server"""
    server = db.query(GameServer).filter(
        GameServer.id == server_id,
        GameServer.owner_id == current_user.id
    ).first()

    if not server:
        raise HTTPException(status_code=404, detail= "Server not found")
    
    port = server.ip_address.split(":")[-1]
    container_name = f"mc-{current_user.id}-{port}"

    run_docker(["docker", "stop", container_name])
    run_docker(["docker", "rm", container_name])
    
    db.delete(server)
    db.commit()
    return {"message": "Server deleted successfully"}    


# ====== Ai Chat =======
@app.post("/ai/chat")
def ai_chat(
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ai assistant that helps with server questions"""
    user_message = request.get("message", "")

    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    #get users server question
    servers = db.query(GameServer).filter(GameServer.owner_id == current_user.id).all()
    server_info = ""
    for s in servers:
        server_info += f"- {s.name}: {s.game}, status={s.status}, players={s.player_count}/{s.max_players}, cpu={s.cpu_usage}%, ram={s.ram_usage}%\n"
    
    system_prompt = f"""You are ServerVault AI, a helpfulassistant for a Minecraft server hosting platform.
    You help users with:
- Minecraft server setup and configuration
- Performance optimization tips
- Troubleshooting server issues
- Game settings and plugins
- General Minecraft questions

The user currently has these servers:
{server_info if server_info else 'No servers yet.'}

Keep responses concise and helpful. If asked about things unrelated to Minecraft or server hosting, politely redirect.
"""
    
    try:
        client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
    )
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
        ],
        max_tokens=300,
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        print(f"AI error: {e}")
        raise HTTPException(status_code=500, detail=f"AI service error")
    

# ======= Dashboard Stats =======

@app.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get overview stats for the users dashboard"""

    total_servers = db.query(GameServer).filter(GameServer.owner_id == current_user.id).all()

    return { 
        "total_servers": len(total_servers),
        "active_servers": len([s for s in total_servers if s.status == ServerStatus.RUNNING]),
        "total_players": sum([s.player_count for s in total_servers]),
        "monthly_cost": round(sum(s.monthly_cost for s in total_servers), 2)
    }