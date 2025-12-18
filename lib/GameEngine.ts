import { GameState, Character, CrimeTruth } from '@/data/schemas';
import case01 from '@/data/scenarios/case01.json';

// In a real app, we would load strictly typed JSON or from DB
const SCENARIO_MAP: Record<string, any> = {
    'case01': case01
};

export class GameEngine {
    private scenarioId: string;
    private truth: CrimeTruth;

    constructor(scenarioId: string) {
        this.scenarioId = scenarioId;
        const scenarioData = SCENARIO_MAP[scenarioId];
        if (!scenarioData) throw new Error("Scenario not found");
        this.truth = scenarioData.truth as CrimeTruth;
    }

    public getInitialState(): GameState {
        const scenarioData = SCENARIO_MAP[this.scenarioId];
        const initialChars: Record<string, Character> = {};

        // transform list to map
        scenarioData.characters.forEach((c: Character) => {
            initialChars[c.id] = c;
        });

        return {
            currentScenarioId: this.scenarioId,
            turnCount: 0,
            isGameOver: false,
            discoveredFactIds: [],
            characters: initialChars
        };
    }

    public getTruth(): CrimeTruth {
        return this.truth;
    }

    // Determine if input is valid or off-topic (Simple heuristic for now, could be AI based)
    public classifyInput(input: string): 'interrogation' | 'meta' | 'accusation' {
        const lower = input.toLowerCase();
        if (lower.startsWith('/accuse') || lower.startsWith('/指认')) return 'accusation';
        if (lower.startsWith('/restart') || lower.startsWith('/重置')) return 'meta';

        return 'interrogation';
    }

    // Update logic: Change pressure, patience based on keywords
    // A naive implementation of "State Update"
    public updateCharacterState(
        characterId: string,
        input: string,
        currentState: GameState
    ): GameState {
        const char = currentState.characters[characterId];
        if (!char) return currentState;

        let newPressure = char.pressure;
        let newPatience = char.patience;

        // Simple keyword based logic for demo purposes
        // Updated for Chinese context
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes("杀") || lowerInput.includes("死") || lowerInput.includes("血") || lowerInput.includes("murder")) {
            newPressure += 10;
            newPatience -= 5;
        }
        if (lowerInput.includes("帮") || lowerInput.includes("请") || lowerInput.includes("help") || lowerInput.includes("please")) {
            newPressure -= 5;
        }

        // Clamp
        newPressure = Math.min(100, Math.max(0, newPressure));
        newPatience = Math.min(100, Math.max(0, newPatience));

        return {
            ...currentState,
            characters: {
                ...currentState.characters,
                [characterId]: {
                    ...char,
                    pressure: newPressure,
                    patience: newPatience,
                    isBreaking: newPressure > 80
                }
            },
            turnCount: currentState.turnCount + 1
        };
    }

    public verifyAccusation(accusedId: string): { correct: boolean; message: string } {
        const correct = this.truth.murdererId === accusedId;
        if (correct) {
            return { correct: true, message: "正确！证据确凿，你抓住了真凶。" };
        } else {
            return { correct: false, message: "错误！你指控了无辜的人，真凶逃脱了……" };
        }
    }
}
