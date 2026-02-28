from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone
import enum

#games that are supported by the server
class GameType(str, enum):
    CS2 = "CS2"
    Minecraft = "Minecraft"
    Rust = "Rust"


class ServerStatus(str, enum):
    STARTING = "Starting"
    RUNNING = "Running"
    STOPPED = "Stopped"
    RESTARTING = "Restarting"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key = True, index = True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    #one user could have many servers
    servers = relationship("GameServer", back_populates="owner")

class GameServer(Base):
    __tablename__ = "game_servers"

    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, nullable=False)
    game = Column(String, nullable=False)
    status = Column(String, default=ServerStatus.STOPPED)
    #simulating the the ip,cpu and ram of the server
    fake_ip = Column(String, nullable=True)
    fake_cpu = Column(Float, default=0.0)
    fake_ram = Column(Float, default=0.0)
    fake_players = Column(Integer, default=0)
    max_players = Column(Integer, default=20)
    monthly_cost = Column(Float, default=9.99) #fake billing for testing purposes
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    owner_id = Column(Integer, ForeignKey("users.id"))

    #linking back to the user
    owner = relationship("User", back_populates="servers")