from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import User, GameServer, ServerStatus
from schemas import UserCreate, UserLogin, UserOut, ServerCreate, ServerOut, ServerAction, Token, VerifyEmail
from auth import hash_password, verify_password, create_token, get_current_user, delete_token, oauth2_scheme
from mcstatus import JavaServer
import os
import subprocess
from openai import OpenAI
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string


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
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    
    code = generate_verification_code()

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        is_verified=False,
        verification_code=code,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

#sending a verification email with a code
    try:
        send_verification_email(user.email, code)
    except Exception as e:
        print(f"Email error: {e}")

    return new_user

@app.post("/auth/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Log in and get an access token"""
    
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail = "Invalid username or password")
    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please verify your email before logging in.")
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

@app.post("/auth/verify")
def verify_email(data: VerifyEmail, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.verification_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    user.is_verified = True
    user.verification_code = None
    db.commit()
    return {"message": "Email verified successfully"}

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

def generate_verification_code() -> str:
    """generate a 6 digit verify code"""
    return ''.join(random.choices(string.digits, k=6))

def send_verification_email(to_email:str, code: str):
    """send a verification code through email"""
    from_email = os.getenv("EMAIL_ADDRESS")
    password = os.getenv("EMAIL_PASSWORD")

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = "ServerVault Email Verification"

    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #1f2937; color: #ffffff; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #374151; padding: 30px; border-radius: 12px;">
            <h2 style="color: #3b82f6;">ServerVault</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #3b82f6; letter-spacing: 8px; text-align: center;">{code}</h1>
            <p>Enter this code to verify your email.</p>
            <p style="color: #9ca3af; font-size: 12px;">This code expires in 10 mintues.</p>
        </div>
    </body>
    </html>
    """     

    msg.attach(MIMEText(body, 'html'))

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login(from_email, password)
        server.send_message(msg)

def get_admin_user(current_user: User = Depends(get_current_user)):
    """Ensure the current user is an admin."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


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
    
    system_prompt = f"""You are ServerVault AI, the built-in assistant for the ServerVault game server hosting platform.
    IMPORTANT: Users are on the ServerVault website. They don't need to set up servers manually.
    On ServerVault, creating a server is simple:
    1. Click "+ New Server" on the dashboard
    2. Enter a server name and max players
    3. Click "Deploy Server"
    4. Wait 30-60 seconds for it to start
    5. The server IP is shown on the server card — share it with friends to join

    Users can also:
    - Start/Stop/Restart servers with buttons on each server card
    - See real-time CPU, RAM, and player count
    - Delete servers they no longer need
    - Talk to you (the AI assistant) for help

    The platform currently supports Minecraft Java Edition servers.
    Each user can have up to 3 servers. Cost is $9.99/month per server.

    The user currently has these servers:
    {server_info if server_info else "No servers yet."}

    When answering:
    - Always reference how things work ON ServerVault, not general setup guides
    - Be concise and friendly
    - If they ask about server config like plugins, mods, or game settings, you can help with that
    - If asked about things completely unrelated to gaming or servers, politely redirect"""
    
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
    

# ============ ADMIN ROUTES ============

@app.get("/admin/users")
def admin_get_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Get all users (admin only)."""
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_verified": u.is_verified,
            "is_admin": u.is_admin,
            "created_at": u.created_at.isoformat(),
            "server_count": db.query(GameServer).filter(GameServer.owner_id == u.id).count(),
        }
        for u in users
    ]


@app.get("/admin/servers")
def admin_get_servers(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Get all servers from all users (admin only)."""
    servers = db.query(GameServer).all()
    result = []
    for s in servers:
        owner = db.query(User).filter(User.id == s.owner_id).first()
        port = s.ip_address.split(":")[-1]
        container_name = f"mc-{s.owner_id}-{port}"
        s.status = get_container_status(container_name)
        stats = get_container_stats(container_name)
        result.append({
            "id": s.id,
            "name": s.name,
            "game": s.game,
            "status": s.status,
            "ip_address": s.ip_address,
            "cpu_usage": stats["cpu"],
            "ram_usage": stats["ram"],
            "owner": owner.username if owner else "Unknown",
            "created_at": s.created_at.isoformat(),
        })
    return result


@app.get("/admin/stats")
def admin_get_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Get platform-wide stats (admin only)."""
    total_users = db.query(User).count()
    verified_users = db.query(User).filter(User.is_verified == True).count()
    total_servers = db.query(GameServer).count()
    running_servers = db.query(GameServer).filter(GameServer.status == ServerStatus.RUNNING).count()

    return {
        "total_users": total_users,
        "verified_users": verified_users,
        "total_servers": total_servers,
        "running_servers": running_servers,
    }


@app.delete("/admin/users/{user_id}")
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Delete a user and all their servers (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot delete an admin")

    # Delete all their servers and containers
    servers = db.query(GameServer).filter(GameServer.owner_id == user_id).all()
    for s in servers:
        port = s.ip_address.split(":")[-1]
        container_name = f"mc-{s.owner_id}-{port}"
        run_docker(["docker", "stop", container_name])
        run_docker(["docker", "rm", container_name])
        db.delete(s)

    # Delete their sessions
    from models import UserSession
    db.query(UserSession).filter(UserSession.user_id == user_id).delete()

    db.delete(user)
    db.commit()
    return {"message": f"User {user.username} deleted"}


@app.delete("/admin/servers/{server_id}")
def admin_delete_server(
    server_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Delete any server (admin only)."""
    server = db.query(GameServer).filter(GameServer.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    port = server.ip_address.split(":")[-1]
    container_name = f"mc-{server.owner_id}-{port}"
    run_docker(["docker", "stop", container_name])
    run_docker(["docker", "rm", container_name])

    db.delete(server)
    db.commit()
    return {"message": "Server deleted"}



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