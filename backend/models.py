from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone
import enum

#games that are supported by the server
class GameType(str, enum.Enum):
    Minecraft = "Minecraft"


class ServerStatus(str, enum.Enum):
    STARTING = "starting"
    RUNNING = "running"
    STOPPED = "stopped"
    RESTARTING = "restarting"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key = True, index = True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    #one user could have many servers
    servers = relationship("GameServer", back_populates="owner")

class GameServer(Base):

    __tablename__ = "game_servers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    game = Column(String, nullable=False)
    status = Column(String, default=ServerStatus.STOPPED)
    ip_address = Column(String)
    cpu_usage = Column(Float, default=0.0)
    ram_usage = Column(Float, default=0.0)
    player_count = Column(Integer, default=0)
    max_players = Column(Integer, default=20)
    monthly_cost = Column(Float, default=9.99)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="servers")

class UserSession(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")