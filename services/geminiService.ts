import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
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
    "\n# 元の文章:",
    originalText
  ];

  if (title && title.trim() !== '') {
    promptSegments.push("\n# タイトル:", title.trim());
  }

  if (cta && cta.trim() !== '') {
    promptSegments.push("\n# CTA (Call to Action):", cta.trim());
  }

  promptSegments.push(`
\n# 条件:
1.  **全体の構成**:
    *   もし「タイトル」が提供されていれば、それをメッセージの冒頭に自然に配置してください。
    *   「元の文章」を主要な内容として扱ってください。
    *   もし「CTA」が提供されていれば、それをメッセージの末尾に自然に配置してください。
    *   これら全てを、指定された文字数制限内で、LINEで魅力的な一つのメッセージとして成立させてください。
2.  **文字数厳守**: 生成する文章全体（タイトル、本文、CTA、改行、絵文字を含む全て）は、厳密に ${charLimit} 文字以内にしてください。1文字でも超えてはいけません。
3.  **雰囲気の維持**: 元の文章が持つ雰囲気やトーンを忠実に再現してください。タイトルやCTAもその雰囲気に合わせてください。
4.  **情報の正確性**: 重要な情報は決して省略せず、元の文章の意図を正確に伝えてください。冗長な表現は削除しても問題ありません。タイトルやCTAの内容も正確に反映してください。
5.  **表現の忠実性**: 元の文章で使われている言葉や表現を最大限尊重し、不必要な脚色や変更は加えないでください。
6.  **LINEでの可読性**:
    *   改行や句読点の使い方を工夫し、LINEのトーク画面で自然かつスムーズに読めるようにしてください。
    *   意味のまとまりを考慮し、短い改行を多用するのではなく、関連性の高い内容は一つの段落としてまとめてください。
7.  **記号・顔文字の排除**: 元の文章に含まれる顔文字（例: (^_^) (T_T)）や、LINEのメッセージとして不適切な特殊記号は全て削除してください。ただし、句読点（、。）や一般的な記号（！や？）は適切に使用してください。
8.  **絵文字の戦略的活用**: 内容や感情が伝わりやすくなるよう、適切な絵文字を効果的に使用してください。絵文字は1文字としてカウントされます。過度な使用は避け、文章全体の品位を損なわない範囲でお願いします。
9.  **簡潔な要約**: 情報を省略することなく、要点を的確に捉え、簡潔にまとめてください。

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

    // Final check for character limit
    const finalLength = Array.from(cleanText).length;
    if (finalLength > charLimit) {
      console.warn(`Gemini response exceeded character limit. Expected: ${charLimit}, Got: ${finalLength}. Truncating.`);
      return Array.from(cleanText).slice(0, charLimit).join('');
    }

    return cleanText;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && (error.message.toLowerCase().includes("api key") || error.message.toLowerCase().includes("permission denied"))) {
        throw new Error("APIキーが無効か、必要な権限がありません。設定を確認してください。");
    }
    throw new Error(`AIによる処理に失敗しました。詳細: ${error instanceof Error ? error.message : String(error)}`);
  }
};