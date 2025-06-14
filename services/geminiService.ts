
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (ai) {
    return ai;
  }
  if (!process.env.API_KEY) {
    console.error("Gemini API Key is not configured in environment variables (process.env.API_KEY). The application might not work correctly.");
    throw new Error("APIキーが設定されていません。環境設定を確認してください。");
  }
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai;
};

export const transformTextForLINE = async (
  originalText: string, 
  charLimit: number,
  title?: string,
  cta?: string
): Promise<string> => {
  const client = getAiClient();

  let promptSegments = [
    "あなたはプロのLINEメッセージ編集者です。以下の情報を元に、指定された「条件」に従って、LINEで共有するのに最適な文章に編集してください。",
  ];

  if (title && title.trim() !== '') {
    promptSegments.push("\n# タイトル:", title.trim());
  }
  
  promptSegments.push("\n# 元の文章:", originalText);

  if (cta && cta.trim() !== '') {
    promptSegments.push("\n# CTA (Call to Action):", cta.trim());
  }

  promptSegments.push(`
\n# 条件:
1.  **全体の構成**:
    *   **タイトル**: 提供されている場合、その内容を**変更せずにそのまま**メッセージの冒頭に配置してください。
    *   **元の文章**: 主要な内容として扱ってください。元の文章の情報は正確に、かつ魅力的に伝わるように編集してください。
    *   **CTA (Call to Action)**: 提供されている場合、その内容を**変更せずにそのまま**メッセージの末尾に配置してください。
    *   これら全てを統合し、指定された文字数制限内で、LINEで魅力的な一つのメッセージとして成立させてください。
2.  **最重要: 文字数厳守**: 生成する文章全体（タイトル、本文、CTA、全ての改行、全ての絵文字を含む全て）は、**絶対に** ${charLimit} 文字以内に厳密に収めてください。**1文字でも超過することは許容されません。** この条件は他のどの条件よりも優先されます。この文字数制限を必ず守った上で、可能な限り最高のメッセージを作成してください。
3.  **雰囲気の維持**: 元の文章が持つ雰囲気やトーンを忠実に再現してください。もしタイトルやCTAが提供されている場合、それらも元の文章の雰囲気に合わせてください（ただし、内容は変更しないこと）。
4.  **情報の正確性**: 「元の文章」から重要な情報を省略せず、意図を正確に伝えてください。冗長な表現は削除しても問題ありません。「タイトル」と「CTA」については、提供された内容を**正確に、変更せずに**反映してください。
5.  **表現の忠実性**: 「元の文章」で使われている言葉や表現を最大限尊重し、不必要な脚色や変更は加えないでください。「タイトル」と「CTA」に関しては、提供されたテキストを**そのまま使用**してください。
6.  **LINEでの可読性**:
    *   改行や句読点の使い方を工夫し、LINEのトーク画面で自然かつスムーズに読めるようにしてください。
    *   意味のまとまりを考慮し、短い改行を多用するのではなく、関連性の高い内容は一つの段落としてまとめてください。
7.  **記号・顔文字の管理と使用制限**:
    *   元の文章に含まれる顔文字（例: (^_^) (T_T)）や、LINEのメッセージとして不適切または過度に装飾的な特殊記号は全て削除してください。
    *   句読点（、。）や一般的な記号（例:！、？）は、メッセージの明確性とLINEでの読みやすさのために必要最小限で使用してください。
    *   これら、句読点を含む全ての一般的に使用される記号の総数は、生成メッセージ全体で**厳密に5個以内**にしてください。この制限内で、最も自然で効果的な表現を心がけてください。
8.  **絵文字の戦略的活用**: 内容や感情が伝わりやすくなるよう、適切な絵文字を効果的に使用してください。絵文字は1文字としてカウントされます。過度な使用は避け、文章全体の品位を損なわない範囲でお願いします。
9.  **簡潔な要約**: 「元の文章」の情報を省略することなく、要点を的確に捉え、簡潔にまとめてください。

# 出力:
編集後の文章のみを、他の余計なテキストや説明なしに返してください。markdownのコードブロックなども含めないでください。純粋なテキストのみを返してください。
`);

  const prompt = promptSegments.join('\n');

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
    });
    
    const transformedText = response.text;

    if (!transformedText) {
        throw new Error("AIからの応答が空でした。");
    }
    
    const cleanText = transformedText.trim(); 

    const finalLength = Array.from(cleanText).length;
    if (finalLength > charLimit) {
      console.warn(`Gemini response exceeded character limit. Prompted for: ${charLimit}, Got: ${finalLength}. Applying client-side truncation.`);
      return Array.from(cleanText).slice(0, charLimit).join('');
    }

    return cleanText;

  } catch (error) {
    console.error("Error calling Gemini API for initial transformation:", error);
    if (error instanceof Error && (error.message.toLowerCase().includes("api key") || error.message.toLowerCase().includes("permission denied") || error.message.toLowerCase().includes("authentication"))) {
        throw new Error("APIキーが無効か、必要な権限がありません。設定を確認してください。");
    }
    throw new Error(`AIによる初回処理に失敗しました。詳細: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const startChatSession = (systemInstruction: string): Chat => {
  const client = getAiClient();
  try {
    const chat = client.chats.create({
      model: GEMINI_MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return chat;
  } catch (error) {
    console.error("Error starting chat session:", error);
    if (error instanceof Error && (error.message.toLowerCase().includes("api key") || error.message.toLowerCase().includes("permission denied") || error.message.toLowerCase().includes("authentication"))) {
        throw new Error("チャットセッションの開始に失敗しました: APIキーが無効か、必要な権限がありません。");
    }
    throw new Error(`チャットセッションの開始に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Note: No explicit sendMessageToChat function here as chat interactions
// (sending messages, managing history for API calls) are handled directly 
// in App.tsx using the Chat object returned by startChatSession.
// The Chat object itself maintains the conversation history for the API.
// App.tsx will manage displaying that history and constructing user prompts.
