import OpenAI from 'openai';
import { Character, CrimeTruth, GameState } from '@/data/schemas';

// We initialize the client dynamically to allow user to input key
export const createOpenAIClient = (apiKey: string) => {
    return new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });
};

export async function generateCharacterResponse(
    apiKey: string,
    character: Character,
    userInput: string,
    fullTruth: CrimeTruth,
    gameState: GameState
): Promise<string> {
    const client = createOpenAIClient(apiKey);

    // Construct the constrained knowledge base
    // Filter facts: Only what this character knows
    const knownFactsText = character.knownFacts
        .map(f => `- ${f.content} (是否保密: ${f.isSecret ? "是" : "否"})`)
        .join('\n');

    const systemSystem = `
你现在正在参与一个剧本杀推理游戏，扮演角色：${character.name}。
真相（你可能知道也可能不知道）：
受害者: ${fullTruth.victim.name}
凶手: ${fullTruth.murdererId} (是${character.isMurderer ? "你！" : "不是你"})

你的角色设定:
角色类型: ${character.role}
性格: ${character.personality}
当前压力值: ${character.pressure}/100
耐心值: ${character.patience}/100

你所知的事实 (你只能根据这些信息回答，不要编造事实):
${knownFactsText}

你的秘密 (除非压力过大或被揭穿，不要轻易透露):
${character.knownFacts.filter(f => f.isSecret).map(f => f.content).join('\n')}

指令:
1. 完全沉浸在角色中，使用中文回答。
2. 如果你是凶手，必须撒谎以保护自己，但不要在这个角色不知道的事情上撒谎。
3. 如果你是无辜者但有秘密，尽量隐瞒，直到被迫说出。
4. 如果玩家问了你不知道的事情，就说不知道。
5. 绝不要提及游戏机制（如“压力值”、“剧本”等词汇）。
6. 回答要简短、口语化。
`;

    try {
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemSystem },
                { role: 'user', content: userInput }
            ],
            temperature: 0.7,
            max_tokens: 150,
        });

        return response.choices[0]?.message?.content || "...";
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return "[(系统) 错误: 无法连接到 AI 服务]";
    }
}
