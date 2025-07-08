# 🎮 Vii Sports Arcade – Game Spec: "Shout It!" (Bop It Voice Edition)

## 🧠 Elevator Pitch
“Shout It!” is a fast-paced, voice-controlled minigame inspired by the classic *Bop It*. The user must shout out commands as they appear on screen — faster and louder as the game progresses. It’s chaotic, fun, and built entirely around vocal interaction.

---

## 🎯 Objective
Repeat the command on screen using your voice before the timer runs out. Commands appear faster over time. Special commands like **"BOP IT!!!!!!!"** require **louder vocal input** to register successfully.

---

## 🕹️ Core Gameplay Loop
1. The game starts with a slow tempo (e.g. 1 command every 3s).
2. A random command appears on screen (e.g. "Spin it", "Clap it", "Shout it").
3. Player has X milliseconds to say the command aloud.
4. GPT-4o verifies:
   - That the spoken phrase matches the prompt (STT match)
   - That the volume meets the threshold (for special loud prompts)
5. If the player is correct: tempo speeds up
6. If the player is wrong, silent, or too quiet: they get a strike
7. 3 strikes = game over
8. Optional end screen displays score, commands completed, reaction time stats

---

## 🎤 Voice Controls
- Game expects a **1:1 match** to on-screen command via speech
- **Volume threshold system**:
  - Normal commands require base-level volume
  - “BOP IT!!!!!!!” or other power prompts require a loud voice, visualized by an **audio meter UI**
- STT system filters background noise and accounts for latency

---

## 🔊 Audio Meter UI
- Real-time visual feedback while the user speaks
- Shows if volume is **too low**, **just right**, or **nailed it**
- Meter animates live as player talks, encouraging louder/faster shouting

---

## 🧠 GPT-4o Integration
- Voice transcription (speech-to-text)
- Volume evaluation (e.g. via audio stream parsing or Web Audio API)
- Optional: GPT gives live commentary ("Oof, you missed 'Spin it' by a whisper.")
- Optional: GPT dynamically generates funny new commands based on player streak

---

## 🖥️ UI Design
- Large command text (center screen)
- Timer ring or pulse animation
- Audio meter bar (bottom or side)
- Strike indicators (e.g. Xs, broken buttons)
- Optional face animation or assistant reacting to performance

---

## 🧪 MVP Feature List
- Game loop with 10+ predefined voice prompts
- Audio meter UI with volume threshold feedback
- 3-strike fail condition
- Increasing tempo mechanic (configurable ramp rate)
- GPT-4o-powered STT + loudness validation
- Mobile + TV responsive layout

---

## ✅ Acceptance Criteria
- Game accepts clearly spoken commands
- Loud prompts only register with volume threshold met
- Audio meter displays in sync with voice input
- Tempo increases after each correct response
- 3 failures ends game and shows score
