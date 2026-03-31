from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ============== User Scehmas ==============

#for user registerations
class UserCreate(BaseModel):
    username: str
    email: EmailStr  
    password: str

#for user login
class UserLogin(BaseModel):
    username: str
    password: str

# what is sent back to the user
class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_verified: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class VerifyEmail(BaseModel):
    email: str
    code: str

# ============== server Scehmas ==============

#what we need to create a server
class ServerCreate(BaseModel):
    # the servers need a name and game
    name: str    
    game: str
    max_players: int = 20 #defaulting 20 slots

class ServerOut(BaseModel):
    id: int
    name: str
    game: str
    status: str
    ip_address: str
    cpu_usage: float
    ram_usage: float
    player_count: int
    max_players: int
    monthly_cost: float
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True

#for starting/stopping/restarting actions
class ServerAction(BaseModel):
    action: str  # "start", "stop", "restart"

#============= auth Scehmas ==============
#what is returned after login
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"