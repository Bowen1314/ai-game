import { NextRequest, NextResponse } from 'next/server';
import { GameEngine } from '@/lib/GameEngine';
import { generateCharacterResponse } from '@/lib/OpenAIService';
import { GameState } from '@/data/schemas';

interface InterrogateRequest {
    message: string;
    characterId: string;
    gameState: GameState | null;
    apiKey: string;
    action?: 'interrogate' | 'accuse';
}

export async function GET() {
    return NextResponse.json({ status: 'API Online' });
}

export async function POST(req: NextRequest) {
    console.log("DEBUG: POST /api/interrogate HIT");
    try {
        const body = await req.json() as InterrogateRequest;
        console.log("DEBUG: Body parsed", body.action);
        const { message, characterId, apiKey, action = 'interrogate' } = body;

        // Validate Inputs
        if (!apiKey) return NextResponse.json({ error: 'API Key missing' }, { status: 401 });
        if (!message && action === 'interrogate') return NextResponse.json({ error: 'Message missing' }, { status: 400 });

        // Initialize Engine
        const engine = new GameEngine('case01');

        // Resume State or Start New
        let currentState = body.gameState;
        if (!currentState) {
            currentState = engine.getInitialState();
        }

        if (message === 'INIT') {
            return NextResponse.json({
                response: "System Ready",
                gameState: currentState
            });
        }

        // Handle Accusation
        if (action === 'accuse') {
            const result = engine.verifyAccusation(characterId);
            currentState.isGameOver = true;
            currentState.gameResult = result.correct ? 'WIN' : 'LOSE';
            return NextResponse.json({
                response: result.message,
                gameState: currentState,
                isGameOver: true
            });
        }

        // Handle Interrogation
        // 1. Update State (Pressure, etc)
        const updatedState = engine.updateCharacterState(characterId, message, currentState);

        // 2. Classify Input (sanity check)
        const inputType = engine.classifyInput(message);
        if (inputType === 'meta') {
            return NextResponse.json({
                response: "[Select 'Restart' in the menu to reset]",
                gameState: updatedState
            });
        }

        // 3. Generate AI Response
        const character = updatedState.characters[characterId];
        if (!character) return NextResponse.json({ error: 'Character not found' }, { status: 404 });

        let aiResponse = "";
        if (apiKey === 'BYPASS') {
            aiResponse = `[MOCK MODE] 我是 ${character.name}。这是 bypass 模式下的测试回复。你刚才说了: "${message}"`;
            // Simulate network delay
            await new Promise(r => setTimeout(r, 600));
        } else {
            aiResponse = await generateCharacterResponse(
                apiKey,
                character,
                message,
                engine.getTruth(),
                updatedState
            );
        }

        return NextResponse.json({
            response: aiResponse,
            gameState: updatedState
        });

    } catch (error: any) {
        console.error("API ROUTE ERROR:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
