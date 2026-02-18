# neutralize-alpha-swarm
JADC2-aligned Autonomous Swarm Defense Grid with OODA Loop Protocols and Human-in-the-Loop Safeguards.

# 🦅 Autonomous Swarm Command & Control (C2) Simulator

A real-time, bidirectional Command and Control (C2) architecture for simulated drone swarms. This project integrates a headless 3D physics engine, an encrypted network tunnel, a custom binary telemetry protocol, and an asynchronous tactical CLI to pilot a swarm of autonomous agents through an urban environment.

## 🚀 Key Features

* **Custom WebSocket Server:** Implements the `foxglove.websocket.v1` subprotocol to stream high-frequency binary telemetry.
* **P-D Flight Controller:** Custom Proportional-Derivative physics logic to maintain dynamic V-Formations and execute evasive maneuvers.
* **Sensor Fusion (Lidar & Radar):** * **Lidar:** Real-time raycasting detects urban obstacles (skyscrapers) and engages autonomous emergency braking to prevent collisions.
    * **Radar:** Proximity sensors calculate spatial vectors to detect and acquire targets, pushing asynchronous interrupts to the command console.
* **Visual Payload (FPV):** OpenCV renders a virtual camera mounted to the Alpha drone, encoding the feed into Base64 JPEG for live streaming.
* **Asynchronous CLI:** A non-blocking Python terminal that allows simultaneous manual flight control (W,A,S,D) and background radar listening without freezing the network heartbeat.

## 🏗️ Architecture

1.  **Simulation Engine (Backend):** Hosted on Google Colab using `pybullet` for physics, `cv2` for image processing, and `websockets` for networking.
2.  **Encrypted Tunnel:** Utilizes Cloudflared to expose the local Colab server to the internet via a secure `wss://` tunnel.
3.  **Tactical Dashboard (Frontend):** * **Visualizer:** Foxglove Studio renders the `PosesInFrame` 3D grid and `CompressedImage` camera feed.
    * **Commander Console:** A local Python script (`kill_switch.py`) handles two-way communication and manual overrides.

## 🎮 Tactical Controls (CLI)

| Command | Action | Description |
| :--- | :--- | :--- |
| `[ F ]` | **Formation V** | Swarm resets and locks into a synchronized V-formation. |
| `[ V ]` | **Evasive** | Swarm breaks formation and executes random jitter to avoid fire. |
| `[ S ]` | **Strike** | Swarm executes a kinetic dive-bomb onto the acquired target. |
| `[ A ]` | **Abort / RTB** | Swarm cuts engines and returns to the ground (Z=0). |
| `[ W, A, S, D ]` | **Translate** | Manual override to fly the Alpha drone Forward/Left/Back/Right. |
| `[ R, C ]` | **Altitude** | Rise (Ascend) or Crouch (Descend) the swarm. |

*Note: Movement commands can be chained for burst maneuvers (e.g., `WWWD` moves 6m forward, 2m right).*