# 🦅 NEUTRALIZE ALPHA: Autonomous Drone Swarm Command

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)
![PyBullet](https://img.shields.io/badge/Physics-PyBullet-FF6F00.svg)
![PyTorch](https://img.shields.io/badge/AI-Stable%20Baselines%203-EE4C2C.svg)
![WebSockets](https://img.shields.io/badge/Network-WebSockets-black.svg)

**Neutralize Alpha** is a full-stack, real-time autonomous robotics simulation. It integrates a headless physics engine, A* pathfinding, and a Deep Reinforcement Learning (DRL) neural network, all controlled via a secure, dark-mode React tactical dashboard.

## 🚀 Project Overview

This project simulates a swarm of 5 quadcopters operating in a dynamically generated 3D urban environment. The swarm is tasked with navigating around obstacles, tracking a hostile AI drone, and executing autonomous strike commands. 

The backend runs entirely in the cloud (Google Colab) using a headless PyBullet physics engine. It streams high-speed binary telemetry (poses, camera feeds, lidar warnings, and fuel metrics) over a secure Cloudflare WebSocket tunnel directly to a local React.js dashboard and Foxglove Studio for 3D visualization.

## 🧠 System Architecture

The architecture is divided into two distinct environments communicating via secure binary payloads:

1. **The Backend Engine (Python / Google Colab)**
   * **Physics:** PyBullet calculates gravity, thrust, inertia, and raycast (Lidar) collisions at high frequencies.
   * **Navigation:** A custom A* (A-Star) algorithm routes the swarm through generated skyscrapers.
   * **Artificial Intelligence:** A Proximal Policy Optimization (PPO) Neural Network trained over 50,000 episodes takes over flight controls during combat to hunt the hostile target.
   * **Network:** An Asyncio WebSocket server broadcasts real-time JSON and binary telemetry.

2. **The Frontend Command Center (React.js / Foxglove)**
   * **Tactical UI:** A custom React dashboard processes incoming binary streams to display live coordinates, battery levels, and system alerts.
   * **3D Visualization:** Foxglove Studio renders the physical PyBullet world, drawing dynamic A* path lines and live camera feeds from the Alpha drone.

## ⚙️ Key Features

* **Real-Time Telemetry:** Live parsing of X/Y/Z coordinates, fuel depletion, and combat states.
* **A* Pathfinding Autopilot:** Input target coordinates to dynamically generate and follow a collision-free path.
* **Lidar & Radar Systems:** Automatic emergency braking when facing obstacles and proximity alerts for hostile tracking.
* **Hostile AI FSM:** The enemy drone utilizes a Finite State Machine (Idle, Evasive, Combat) to dynamically react to the swarm's approach.
* **Deep RL Neural Link:** Engaging "STRIKE TARGET" disables hardcoded math and hands flight control over to a PyTorch Neural Network for organic target interception.

## 🛠️ Installation & Setup

### 1. The Colab Backend (Physics & AI)
1. Open Google Colab and create a new notebook.
2. Install dependencies: `!pip install stable-baselines3[extra] gymnasium pybullet websockets nest_asyncio`
3. Train the AI (optional) or load a pre-trained `alpha_brain.zip` model.
4. Run the Master Server script. 
5. Copy the generated `wss://...trycloudflare.com` URL from the terminal output.

### 2. The React Frontend (Dashboard)
1. Clone this repository to your local machine or GitHub Codespaces.
2. Navigate to the dashboard directory:
   ```bash
   cd swarm-dashboard
   npm install
   npm run dev
Open the local host link in your browser.

Paste the wss:// URL into the INITIALIZE UPLINK bar and connect.

Open Foxglove Studio, connect to the same WebSocket, and subscribe to the 3D Pose and Camera channels.

🎮 Controls & Operation
📐 FORMATION V: Standard swarm takeoff and hovering pattern.

🌪️ EVASIVE: Breaks formation and scatters the swarm to dodge incoming fire.

🚀 AUTOPILOT: Uses A* pathfinding to navigate to the inputted X/Y coordinates.

🎯 STRIKE TARGET: Engages the PyTorch Neural Network to autonomously hunt and neutralize the hostile drone.

🛑 ABORT / RTB: Halts all actions, returns drones to a holding pattern, and refuels the swarm.

MANUAL OVERRIDE: W, A, S, D, R (Rise), C (Crouch) for direct pilot control.

🛡️ License
Distributed under the MIT License. See LICENSE for more information.