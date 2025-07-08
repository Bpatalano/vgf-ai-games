import type { Phase } from "@volley/vgf/server"

import type { GameState } from "../shared/types/GameState"

interface BopItCommand {
    command: "BOP" | "TWIST" | "PULL" | "FLICK" | "SPIN" | "PASS"
    timestamp: number
    timeLimit: number
}

interface BopItState {
    currentCommand: BopItCommand | null
    score: number
    round: number
    highScore: number
    isGameActive: boolean
    gameSpeed: number
    correctStreak: number
}

const COMMANDS = ["BOP", "TWIST", "PULL", "FLICK", "SPIN", "PASS"] as const
const BASE_TIME_LIMIT = 3000 // 3 seconds
const SPEED_INCREASE_RATE = 0.95 // 5% faster each round

export const BopItPhase: Phase<GameState> = {
    onEnter: (state, _action) => {
        const bopItState: BopItState = {
            currentCommand: null,
            score: 0,
            round: 1,
            highScore: 0,
            isGameActive: false,
            gameSpeed: 1.0,
            correctStreak: 0,
        }

        return {
            ...state,
            bopItState,
        }
    },

    onAction: (state, action) => {
        const bopItState = state.bopItState as BopItState

        switch (action.type) {
            case "START_GAME": {
                const newCommand = generateNewCommand(bopItState.gameSpeed)
                return {
                    ...state,
                    bopItState: {
                        ...bopItState,
                        isGameActive: true,
                        currentCommand: newCommand,
                        score: 0,
                        round: 1,
                        correctStreak: 0,
                    },
                }
            }

            case "PLAYER_COMMAND": {
                const { command, playerId } = action.payload
                
                if (!bopItState.isGameActive || !bopItState.currentCommand) {
                    return state
                }

                const isCorrect = command === bopItState.currentCommand.command
                const isOnTime = Date.now() - bopItState.currentCommand.timestamp < bopItState.currentCommand.timeLimit

                if (isCorrect && isOnTime) {
                    // Correct command
                    const newScore = bopItState.score + 10
                    const newStreak = bopItState.correctStreak + 1
                    const newRound = bopItState.round + 1
                    const newSpeed = Math.min(bopItState.gameSpeed * SPEED_INCREASE_RATE, 3.0)
                    const newCommand = generateNewCommand(newSpeed)

                    return {
                        ...state,
                        bopItState: {
                            ...bopItState,
                            score: newScore,
                            round: newRound,
                            correctStreak: newStreak,
                            gameSpeed: newSpeed,
                            currentCommand: newCommand,
                        },
                    }
                } else {
                    // Wrong command or too late - game over
                    const newHighScore = Math.max(bopItState.highScore, bopItState.score)
                    
                    return {
                        ...state,
                        bopItState: {
                            ...bopItState,
                            isGameActive: false,
                            currentCommand: null,
                            highScore: newHighScore,
                        },
                    }
                }
            }

            case "RESET_GAME": {
                return {
                    ...state,
                    bopItState: {
                        ...bopItState,
                        currentCommand: null,
                        score: 0,
                        round: 1,
                        isGameActive: false,
                        gameSpeed: 1.0,
                        correctStreak: 0,
                    },
                }
            }

            default:
                return state
        }
    },

    onExit: (state, _action) => {
        // Clean up game state when leaving phase
        const { bopItState, ...cleanState } = state
        return cleanState
    },
}

function generateNewCommand(gameSpeed: number): BopItCommand {
    const command = COMMANDS[Math.floor(Math.random() * COMMANDS.length)]
    const timeLimit = BASE_TIME_LIMIT / gameSpeed
    
    return {
        command,
        timestamp: Date.now(),
        timeLimit,
    }
}