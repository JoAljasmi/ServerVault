from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import User, GameServer, ServerStatus
from schemas import UserCreate, UserLogin, UserOut, ServerCreate, ServerOut, ServerAction, Token
from auth import hash_password, verify_password, create_access_token, get_current_user
import random

# Create all tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ServerVault API")

# Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # react dev server
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
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Log in and receive an access token"""
    
    db_user = db.query(User).filter(User.username == form_data.username).first()
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail = "Invalid username or password")
    
    token = create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the current logged in user's info"""
    return current_user

# ====== server routes ======

def generate_fake_ip() -> str:
    """Generate a fake server IP"""
    return f"{random.randint(50,200)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}:{random.choice([27015, 28015, 25565])}"

def generate_fake_stats(status: str) -> dict:
    """generate fake cpu/ram/player stats based on server status"""
    if status == ServerStatus.RUNNING:
        return{
            "fake_cpu": round(random.uniform(15, 85), 1),
            "fake_ram": round(random.uniform(20, 75), 1),
            "fake_players": random.randint(0, 20),
        }
    #if server is off put everything at 0
    return {"fake_cpu": 0.0, "fake_ram": 0.0, "fake_players": 0}

GAME_PRICING = {
    "CS2": 12.99,
    "rust": 14.99,
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
        raise HTTPException(status_code=400, detail="Unsupported game (game that is supported: CS2, rust, minecraft)")
    
    new_server = GameServer(
        name=server.name,
        game=server.game,
        status=ServerStatus.RUNNING,
        fake_ip=generate_fake_ip(),
        fake_cpu=round(random.uniform(15, 85), 1),
        fake_ram=round(random.uniform(20, 75), 1),
        fake_players=random.randint(0, server.max_players),
        max_players=server.max_players,
        monthly_cost=GAME_PRICING[server.game],
        owner_id=current_user.id,
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
    return db.query(GameServer).filter(GameServer.owner_id == current_user.id).all()


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

    # Refresh fake stats every time you check (makes dashboard feel alive)
    stats = generate_fake_stats(server.status)
    server.fake_cpu = stats["fake_cpu"]
    server.fake_ram = stats["fake_ram"]
    server.fake_players = stats["fake_players"]
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
    
    if action.action == "start":
        server.status = ServerStatus.RUNNING
    elif action.action == "stop":
        server.status = ServerStatus.STOPPED
    elif action.action == "restart":
        server.status = ServerStatus.RESTARTING
    else:
        raise HTTPException(status_code=400, detail="Invalid action (valid actions: start, stop, restart)")
    
    #updateing fake stats based on the new status
    stats = generate_fake_stats(server.status)
    server.fake_cpu = stats["fake_cpu"]
    server.fake_ram = stats["fake_ram"]
    server.fake_players = stats["fake_players"]
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
    
    db.delete(server)
    db.commit()
    return {"message": "Server deleted successfully"}    

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
        "active_servers": len([servers for servers in total_servers if servers.status == ServerStatus.RUNNING]),
        "total_players": sum([servers.fake_players for servers in total_servers]),
        "monthly cost": round(sum(servers.monthly_cost for servers in total_servers), 2)
    }