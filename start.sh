#!/bin/bash
echo "🔌 POWERING UP TACTICAL UPLINK..."
pip install websockets stable-baselines3[extra] gymnasium pybullet
cd swarm-dashboard
echo "📦 INSTALLING DASHBOARD DEPENDENCIES..."
npm install
echo "🚀 LAUNCHING MISSION CONTROL..."
npm run dev
#to make this executable- "chmod +x start.sh"