# ServerVault

A game server hosting platform where users can deploy, manage, and monitor Minecraft servers through a web dashboard.

## Features

- **Real Server Deployment** — Deploys actual Minecraft servers using Docker containers on AWS
- **Real-time Monitoring** — Live CPU, RAM, and player count stats
- **Server Controls** — Start, stop, restart, and delete servers from the dashboard
- **Email Verification** — Secure registration with email verification codes
- **AI Assistant** — Built-in AI chatbot for server help and troubleshooting
- **Responsive Dashboard** — Clean dark-themed UI built with React and Tailwind CSS

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** PostgreSQL
- **Server Management:** Docker
- **AI:** OpenAI API (GPT-4o-mini)
- **Deployment:** AWS EC2, Nginx

## How It Works

1. Users register with email verification
2. From the dashboard, users can deploy Minecraft servers
3. Each server runs as an isolated Docker container
4. The backend monitors real CPU/RAM usage and player count
5. Users can start, stop, restart, and delete servers