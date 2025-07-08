# Issue #1: Core Bop-It Game Engine

## Summary
Implement the foundational game engine for the Bop-It voice-controlled game with command generation, timing mechanics, and score tracking.

## Description
Create the core game logic that manages game state, generates random commands, tracks player progress, and handles difficulty progression. This forms the backbone of the Bop-It experience.

## Acceptance Criteria

### Game State Management
- [ ] Implement game states: `START`, `PLAYING`, `GAME_OVER`
- [ ] Handle transitions between states
- [ ] Game initialization and reset functionality

### Command System
- [ ] Generate random commands from pool: BOP, TWIST, PULL, FLICK, SPIN, PASS
- [ ] Ensure no consecutive duplicate commands
- [ ] Command announcement system

### Timing Mechanics
- [ ] Implement response timer with decreasing time limits
- [ ] Level 1-5: 3 seconds response time
- [ ] Level 6-10: 2.5 seconds response time
- [ ] Level 11-15: 2 seconds response time
- [ ] Level 16+: 1.5 seconds response time

### Scoring System
- [ ] Track current score (+1 per correct command)
- [ ] Calculate time bonus for quick responses
- [ ] Implement high score persistence (localStorage)
- [ ] Level/round progression tracking

### Game Loop
- [ ] Main game loop with proper timing
- [ ] Command generation and validation
- [ ] Automatic progression to next round
- [ ] End game conditions

## Technical Requirements

### File Structure
```
games/bop-it/
├── index.html
├── js/
│   ├── game.js (THIS ISSUE)
│   ├── GameEngine.js
│   ├── CommandManager.js
│   └── ScoreManager.js
```

### Key Classes/Modules
- `GameEngine`: Main game controller
- `CommandManager`: Command generation and validation
- `ScoreManager`: Score tracking and persistence
- `Timer`: Response time management

### Performance
- Consistent 60fps gameplay
- Responsive command generation (<50ms)
- Smooth state transitions

## Definition of Done
- [ ] Game engine successfully generates and validates commands
- [ ] Timing mechanics work correctly with progressive difficulty
- [ ] Score system accurately tracks progress
- [ ] Game state transitions work smoothly
- [ ] High score persistence functions properly
- [ ] Code is tested and documented
- [ ] No memory leaks or performance issues

## Priority: High
**Milestone**: Core Game Foundation
**Estimated Time**: 2-3 hours