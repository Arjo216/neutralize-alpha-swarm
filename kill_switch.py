# ==========================================
# 🦅 SWARM COMMANDER: CITY OPS (LIDAR)
# ==========================================
import asyncio
import websockets
import time

URL = "wss://governance-knives-reunion-situation.trycloudflare.com"

async def listen_to_radar(ws):
    try:
        async for message in ws:
            if isinstance(message, str):
                if "RADAR_ALERT" in message:
                    coords = message.split(":")[1].strip()
                    print(f"\n🚨 TARGET ACQUIRED AT [{coords}] - READY STRIKE [S] 🚨")
                    print("COMMAND >> ", end="", flush=True)
                elif "LIDAR_WARNING" in message:
                    # 🛡️ COLLISION ALERT 🛡️
                    print(f"\n⚠️ OBSTACLE DETECTED! AUTONOMOUS BRAKING ENGAGED ⚠️")
                    print("COMMAND >> ", end="", flush=True)
    except Exception: pass 

async def tactical_console():
    print(f"\n🔍 CONNECTING TO URBAN SWARM: {URL}...")
    while True:
        try:
            async with websockets.connect(URL, subprotocols=["foxglove.websocket.v1"], ping_interval=10, ping_timeout=10) as ws:
                print("✅ UPLINK SECURED.\n")
                print("   [ F ] TAKEOFF")
                print("   [ V ] EVASIVE")
                print("   [ S ] STRIKE")
                print("   [ W,A,S,D ] FLY ALPHA")
                print("   (LIDAR ACTIVE: Will auto-brake on obstacles)")
                print("========================================\n")
                
                radar_task = asyncio.create_task(listen_to_radar(ws))
                
                while True:
                    cmd = await asyncio.to_thread(input, "COMMAND >> ")
                    cmd = cmd.strip().upper()
                    
                    if cmd == "F": await ws.send("FORMATION"); print("   📐 SENT: RESET")
                    elif cmd == "V": await ws.send("EVASIVE"); print("   🌪️ SENT: EVASIVE")
                    elif cmd == "S": await ws.send("STRIKE"); print("   🎯 SENT: STRIKE")
                    elif cmd == "A": await ws.send("ABORT"); print("   🛑 SENT: ABORT")
                    elif cmd == "Q": return
                    elif any(char in "WSADRC" for char in cmd):
                        clean_cmd = "".join([c for c in cmd if c in "WSADRC"])
                        if clean_cmd:
                            await ws.send(f"MOVE_{clean_cmd}")
                            print(f"   🚁 SENT: MOVE [{clean_cmd}]")
                    elif cmd != "": print("   ❌ UNKNOWN COMMAND")
                    
                radar_task.cancel() 
                
        except Exception as e:
            print(f"\n⚠️ LINK LOST. Retrying in 3 seconds...")
            time.sleep(3)

if __name__ == "__main__":
    try: asyncio.run(tactical_console())
    except KeyboardInterrupt: pass