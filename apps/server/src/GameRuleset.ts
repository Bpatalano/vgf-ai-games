import type { GameRuleset } from "@volley/vgf/server"

import { BopItPhase } from "./phases/BopItPhase"
import { DinoRunPhase } from "./phases/DinoRunPhase"
import { HomePhase } from "./phases/HomePhase"
import type { GameState } from "./shared/types/GameState"
import { PhaseName } from "./shared/types/PhaseName"
import { setupGameState } from "./utils/setupGame"

export const DemoGameRuleset = {
    setup: setupGameState,
    actions: {},
    phases: {
        [PhaseName.Home]: HomePhase,
        [PhaseName.BopIt]: BopItPhase,
        [PhaseName.DinoRun]: DinoRunPhase,
    },
} as const satisfies GameRuleset<GameState>
