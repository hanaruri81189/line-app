import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL_NAME } from './constants';

const getApiKey = (): string => {
  // Viteが.env.localから環境変数を読み込みます
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("APIキーが設定されていません。.env.localファイルを確認してください。");
  }
  return apiKey;
};

// GoogleGenerativeAIをAPIキーで初期化
const genAI = new GoogleGenerativeAI(getApiKey());

/**
 * テキストをLINE用に最適化する関数
 * @param originalText 最適化したい元の文章
 * @param charLimit 目標の文字数
 * @param title メッセージのタイトル（任意）
 * @param cta メッセージのCTA（任意）
 * @returns 最適化されたテキスト
 */
export const transformTextForLINE = async (
  originalText: string,
  charLimit: number,
  title?: string,
  cta?: string
): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });

  // AIへの指示（プロンプト）をユーザーの要望に合わせて強化
  const prompt = `
あなたは、文章をLINE公式アカウント用に最適化するプロの編集者です。

# あなたへの指示書:
以下の「# 元の情報」と「# 守るべきルール」を厳密に守り、最適なLINEメッセージを作成してください。

# 元の情報:
- **タイトル（もしあれば、このまま使用）:** ${title || 'なし'}
- **元の文章（この内容を要約・最適化）:**
---
${originalText}
---
- **CTA（もしあれば、このまま使用）:** ${cta || 'なし'}


# 守るべきルール:

## 1. 文字数に関する絶対的なルール:
- **最終的な出力の総文字数（タイトル、本文、CTAの全てを含む）は、必ず${charLimit}文字以内に厳密に収めてください。**
- ${charLimit}文字を超えることは絶対に許可されません。

## 2. 内容と表現に関するルール:
- **元の文章の雰囲気やトーンは、そのまま維持してください。**
- **元の文章の表現を最大限尊重し、不必要に脚色したり、新しい情報を付け加えたりしないでください。**
- **重要な情報は絶対に省略しないでください。** ただし、冗長な表現や重複している部分は削除しても構いません。
- ポイントを絞り、要点をまとめてください。

## 3. 見た目に関するルール:
- **LINEで読みやすくなるように、改行や句読点を調整してください。**
- 短い文でむやみに改行するのではなく、意味のまとまりごとに段落（空行を挟む）を作ることを意識してください。
- 元の文章に含まれる**顔文字（例: (^_^)）や、装飾目的の記号（例: ★、♪）は全て削除してください。**
- **絵文字は、文章全体で3〜5個程度に抑え、**感情や内容を効果的に伝えるために使用してください。

# 出力形式:
- タイトル、最適化された本文、CTAを組み合わせた、最終的なLINEメッセージの全文のみを出力してください。
- 説明や前置き、注釈（例：「最適化された文章：」など）は一切含めないでください。
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("テキストの最適化中にエラーが発生しました:", error);
    if (error instanceof Error) {
        throw new Error(`AIとの通信中にエラーが発生しました: ${error.message}`);
    }
    throw new Error("AIとの通信中に不明なエラーが発生しました。");
  }
};
