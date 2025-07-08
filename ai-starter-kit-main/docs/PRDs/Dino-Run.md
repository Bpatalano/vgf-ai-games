# 🕹️ Vii Sports Arcade – Game Specs: Flappy Bird & Dino Run

## Game 1: Flappy Bird (Voice Edition)

### 🎯 Objective
Navigate the bird through pipes without crashing. The bird flaps upward when the player **says "flap!"** or any approved command. Gravity pulls it down automatically.

### 🎮 Controls
- **Voice Command:** “Flap!” (or configurable voice equivalents like "jump!", "go!")
- Optional: Tap/remote input fallback for TV without mic

### 📜 Game Loop
1. Game starts automatically after a countdown ("3… 2… 1… Flap!")
2. Pipes move left across screen
3. Each "Flap!" voice command moves the bird up
4. Gravity pulls bird down between commands
5. Collision with pipe or ground = 1 strike
6. Player continues until 3 strikes

### 🧠 GPT-4o Integration
- Optional mode: GPT narrates/reacts to progress ("Close one!", "That was clean!")
- Speech-to-text model validates "flap" detection with low latency
- Detects false triggers and ignores background noise

### ✅ MVP Feature Set
- Responsive bird movement on valid voice input
- 3 lives system
- Basic scoring (pipes passed)
- Optional GPT reaction narration
- Mobile + TV layout support

---

## Game 2: Dino Run (Voice Edition)

### 🎯 Objective
Dino runs forward endlessly. Player must **shout "jump!"** to leap over cacti and obstacles. Based on the classic Chrome Dino game.

### 🎮 Controls
- **Voice Command:** “Jump!” (alternates: "hop!", "up!")
- Optional: Tap/remote input fallback

### 📜 Game Loop
1. Dino auto-runs at increasing speed
2. Obstacles appear (cactus, birds)
3. Player says “Jump!” to leap at correct time
4. Mistimed jump = 1 strike
5. Game ends at 3 strikes or when user exits

### 🧠 GPT-4o Integration
- Real-time voice detection for "jump"
- GPT can optionally provide humorous voiceovers ("Oof, face-first into that cactus")
- Can tune difficulty by adjusting required timing precision

### ✅ MVP Feature Set
- Running dino animation + scrolling terrain
- Voice trigger for jump
- 3-strike system
- Scoring (distance/time survived)
- GPT feedback (optional, toggleable)

