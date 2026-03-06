from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ============== User Scehmas ==============

#for user registerations
class UserCreate(BaseModel):
    username: str
    email: EmailStr  #for auto validation
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
    created_at: datetime

    class Config:
        from_attributes = True

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
    fake_ip: str
    fake_cpu: float
    fake_ram: float
    fake_players: int
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