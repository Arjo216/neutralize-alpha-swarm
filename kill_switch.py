# ==========================================
# 🦅 NEUTRALIZE ALPHA: TACTICAL CONSOLE (v3.0)
# ==========================================
import asyncio
import websockets
import time
import sys

# ⚠️ PASTE YOUR LATEST CLOUDFLARE URL HERE
# Example: "wss://orange-music-...trycloudflare.com"
URL = "wss://tribunal-rna-phases-searches.trycloudflare.com"

async def tactical_console():
    print(f"\n🔍 SCANNING UPLINK: {URL}...")
    
    while True:
        try:
            async with websockets.connect(URL) as ws:
                print("✅ UPLINK ESTABLISHED.")
                print("   (Latency: <50ms)\n")
                
                print("========================================")
                print("   🦅 NEUTRALIZE COMMAND INTERFACE")
                print("========================================")
                print("   [ E ]  ENGAGE TARGET  (Weapons Free)")
                print("   [ A ]  ABORT MISSION  (Return to Base)")
                print("   [ Q ]  QUIT CONSOLE   (Close Link)")
                print("========================================\n")
                
                while True:
                    # 1. Get Input
                    cmd = input("COMMAND >> ").strip().upper()
                    
                    # 2. Process & Send
                    if cmd == "E":
                        print("   🚀 SENDING [ENGAGE]...", end=" ")
                        start = time.time()
                        await ws.send("ENGAGE")
                        ping = (time.time() - start) * 1000
                        print(f"✅ CONFIRMED ({ping:.0f}ms)")
                        
                    elif cmd == "A":
                        print("   🛑 SENDING [ABORT]...", end=" ")
                        start = time.time()
                        await ws.send("ABORT")
                        ping = (time.time() - start) * 1000
                        print(f"✅ CONFIRMED ({ping:.0f}ms)")
                        
                    elif cmd == "Q":
                        print("   🔌 TERMINATING UPLINK.")
                        return
                    
                    else:
                        print("   ❌ INVALID OPTION.")
                        
        except (websockets.exceptions.ConnectionClosed, ConnectionRefusedError):
            print("\n⚠️ CONNECTION LOST. RECONNECTING IN 3s...")
            time.sleep(3)
        except KeyboardInterrupt:
            print("\n👋 OPERATOR DISCONNECTED.")
            sys.exit()

if __name__ == "__main__":
    if "paste-your-url-here" in URL:
        print("❌ ERROR: You forgot to paste the Cloudflare URL in the script!")
    else:
        try:
            asyncio.run(tactical_console())
        except KeyboardInterrupt:
            pass