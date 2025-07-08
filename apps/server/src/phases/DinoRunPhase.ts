import type { Phase } from "@volley/vgf/server"

import type { GameState } from "../shared/types/GameState"

interface DinoEntity {
    x: number
    y: number
    width: number
    height: number
    velocityY: number
    isJumping: boolean
    isGrounded: boolean
}

interface Obstacle {
    x: number
    y: number
    width: number
    height: number
    speed: number
}

interface DinoRunState {
    dino: DinoEntity
    obstacles: Obstacle[]
    score: number
    gameSpeed: number
    isGameActive: boolean
    groundY: number
    lastObstacleTime: number
    strikes: number
    maxStrikes: number
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const GROUND_Y = 500
const DINO_WIDTH = 60
const DINO_HEIGHT = 60
const JUMP_FORCE = -15
const GRAVITY = 0.8
const OBSTACLE_SPAWN_INTERVAL = 2000 // 2 seconds
const BASE_GAME_SPEED = 2

export const DinoRunPhase: Phase<GameState> = {
    onEnter: (state, _action) => {
        const dinoRunState: DinoRunState = {
            dino: {
                x: 100,
                y: GROUND_Y - DINO_HEIGHT,
                width: DINO_WIDTH,
                height: DINO_HEIGHT,
                velocityY: 0,
                isJumping: false,
                isGrounded: true,
            },
            obstacles: [],
            score: 0,
            gameSpeed: BASE_GAME_SPEED,
            isGameActive: false,
            groundY: GROUND_Y,
            lastObstacleTime: 0,
            strikes: 0,
            maxStrikes: 3,
        }

        return {
            ...state,
            dinoRunState,
        }
    },

    onAction: (state, action) => {
        const dinoRunState = state.dinoRunState as DinoRunState

        switch (action.type) {
            case "START_GAME": {
                return {
                    ...state,
                    dinoRunState: {
                        ...dinoRunState,
                        isGameActive: true,
                        score: 0,
                        strikes: 0,
                        obstacles: [],
                        lastObstacleTime: Date.now(),
                        dino: {
                            ...dinoRunState.dino,
                            y: GROUND_Y - DINO_HEIGHT,
                            velocityY: 0,
                            isJumping: false,
                            isGrounded: true,
                        },
                    },
                }
            }

            case "PLAYER_JUMP": {
                const { playerId } = action.payload
                
                if (!dinoRunState.isGameActive || !dinoRunState.dino.isGrounded) {
                    return state
                }

                return {
                    ...state,
                    dinoRunState: {
                        ...dinoRunState,
                        dino: {
                            ...dinoRunState.dino,
                            velocityY: JUMP_FORCE,
                            isJumping: true,
                            isGrounded: false,
                        },
                    },
                }
            }

            case "GAME_UPDATE": {
                if (!dinoRunState.isGameActive) {
                    return state
                }

                const currentTime = Date.now()
                let newDino = { ...dinoRunState.dino }
                let newObstacles = [...dinoRunState.obstacles]
                let newScore = dinoRunState.score
                let newStrikes = dinoRunState.strikes
                let newGameSpeed = dinoRunState.gameSpeed
                let newLastObstacleTime = dinoRunState.lastObstacleTime
                let isGameActive = dinoRunState.isGameActive

                // Update dino physics
                newDino.velocityY += GRAVITY
                newDino.y += newDino.velocityY

                // Check ground collision
                if (newDino.y >= GROUND_Y - DINO_HEIGHT) {
                    newDino.y = GROUND_Y - DINO_HEIGHT
                    newDino.velocityY = 0
                    newDino.isJumping = false
                    newDino.isGrounded = true
                }

                // Update obstacles
                newObstacles = newObstacles.map(obstacle => ({
                    ...obstacle,
                    x: obstacle.x - obstacle.speed,
                })).filter(obstacle => obstacle.x > -obstacle.width)

                // Spawn new obstacles
                if (currentTime - newLastObstacleTime > OBSTACLE_SPAWN_INTERVAL) {
                    newObstacles.push({
                        x: CANVAS_WIDTH,
                        y: GROUND_Y - 40,
                        width: 30,
                        height: 40,
                        speed: newGameSpeed,
                    })
                    newLastObstacleTime = currentTime
                }

                // Check collisions
                for (const obstacle of newObstacles) {
                    if (isColliding(newDino, obstacle)) {
                        newStrikes++
                        // Remove the obstacle that was hit
                        newObstacles = newObstacles.filter(o => o !== obstacle)
                        
                        if (newStrikes >= dinoRunState.maxStrikes) {
                            isGameActive = false
                        }
                        break
                    }
                }

                // Update score and speed
                newScore += 1
                newGameSpeed = BASE_GAME_SPEED + (newScore / 1000)

                return {
                    ...state,
                    dinoRunState: {
                        ...dinoRunState,
                        dino: newDino,
                        obstacles: newObstacles,
                        score: newScore,
                        strikes: newStrikes,
                        gameSpeed: newGameSpeed,
                        lastObstacleTime: newLastObstacleTime,
                        isGameActive,
                    },
                }
            }

            case "RESET_GAME": {
                return {
                    ...state,
                    dinoRunState: {
                        ...dinoRunState,
                        dino: {
                            x: 100,
                            y: GROUND_Y - DINO_HEIGHT,
                            width: DINO_WIDTH,
                            height: DINO_HEIGHT,
                            velocityY: 0,
                            isJumping: false,
                            isGrounded: true,
                        },
                        obstacles: [],
                        score: 0,
                        gameSpeed: BASE_GAME_SPEED,
                        isGameActive: false,
                        strikes: 0,
                        lastObstacleTime: 0,
                    },
                }
            }

            default:
                return state
        }
    },

    onExit: (state, _action) => {
        // Clean up game state when leaving phase
        const { dinoRunState, ...cleanState } = state
        return cleanState
    },
}

function isColliding(dino: DinoEntity, obstacle: Obstacle): boolean {
    return (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
    )
}