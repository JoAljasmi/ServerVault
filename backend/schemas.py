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



# ============== server Scehmas ==============

#what we need to create a server
class ServerCreate(BaseModel):
    # the servers need a name and game
    name: str    
    game: str
    max_players: int = 20 #defaulting 20 slots

