
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TextAreaInput } from './components/TextAreaInput';
import { NumberInput } from './components/NumberInput';
import { Button } from './components/Button';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Alert } from './components/Alert';
import { OutputDisplay } from './components/OutputDisplay';
import { transformTextForLINE, startChatSession } from './services/geminiService';
import { DEFAULT_CHAR_LIMIT, MAX_CHAR_LIMIT, MIN_CHAR_LIMIT } from './constants';
import type { Chat } from '@google/genai';
import { ChatHistoryWindow } from './components/chat/ChatHistoryWindow';
import { ChatInputArea } from './components/chat/ChatInputArea';

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  text: string; 
  timestamp: Date;
}
<<<<<<< HEAD
=======
const Button: FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles = {
    primary: "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500",
    secondary: "text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-400",
    chat: "text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-400 px-4 py-2 text-sm"
  };
  return (
    <button {...props} className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </button>
  );
};

// 猫キャラクター対応版ローディングスピナー
const CatLoadingSpinner: FC = () => (
  <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg">
    <img 
      src="https://i.imgur.com/8NNEFhO.png" 
      alt="作成中の猫キャラクター" 
      className="w-32 h-32 animate-bounce"
    />
    <p className="mt-4 text-lg font-semibold text-green-800">ただいま、もっと良い文章を作成中ニャ...🐾</p>
  </div>
);


interface AlertProps { message: string; type: 'success' | 'error'; onClose: () => void; }
const Alert: FC<AlertProps> = ({ message, type, onClose }) => {
  const alertStyles = type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700';
  return (
    <div className={`p-4 border-l-4 ${alertStyles} rounded-md shadow-md flex justify-between items-center`}>
      <p>{message}</p>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 transition-colors">&times;</button>
    </div>
  );
};

interface OutputDisplayProps {
  text: string;
  onCopy: () => void;
  isLoading: boolean;
  charCount: number;
  limit: number;
  onTextChange: (newText: string) => void;
}
const OutputDisplay: FC<OutputDisplayProps> = ({ text, onCopy, isLoading, charCount, limit, onTextChange }) => (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-6 animate-fade-in">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">最適化された文章</h3>
            <Button onClick={onCopy} variant="secondary" className="px-4 py-2 text-sm" disabled={!text}>コピー</Button>
        </div>
        {isLoading ? (
            <div className="flex justify-center items-center h-48 bg-gray-100 rounded-md">
                <CatLoadingSpinner />
            </div>
        ) : (
            <TextAreaInput
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                rows={8}
                aria-label="最適化された文章の出力エリア"
            />
        )}
        <div className="text-right text-sm text-gray-500 mt-2">
            <span className={charCount > limit ? 'text-red-500 font-bold' : 'text-gray-600'}>
                {charCount}
            </span> / {limit} 字
        </div>
    </div>
);

// 新しいチャットでの修正用コンポーネント
interface ChatRefinementProps {
    onRefine: (instruction: string) => Promise<void>;
    isRefining: boolean;
}
const ChatRefinement: FC<ChatRefinementProps> = ({ onRefine, isRefining }) => {
    const [instruction, setInstruction] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!instruction.trim() || isRefining) return;
        onRefine(instruction);
        setInstruction('');
    };

    return (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">もっとこうして！(追加指示)</h3>
            {isRefining ? (
                <div className="flex justify-center items-center h-24">
                     <CatLoadingSpinner />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <Input
                        type="text"
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="例: もっと絵文字を増やして、親しみやすくして"
                        className="flex-grow"
                        disabled={isRefining}
                    />
                    <Button type="submit" variant="chat" disabled={!instruction.trim() || isRefining}>
                        指示を送る
                    </Button>
                </form>
            )}
        </div>
    );
};

>>>>>>> 68d51c6791b4d382761d8ee847393c71eb0eafe2

const App: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [cta, setCta] = useState<string>('');
  const [charLimit, setCharLimit] = useState<number>(DEFAULT_CHAR_LIMIT);
  const [optimizedText, setOptimizedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const titleCharCount = useMemo(() => Array.from(title).length, [title]);
  const originalTextCharCount = useMemo(() => Array.from(originalText).length, [originalText]);
  const ctaCharCount = useMemo(() => Array.from(cta).length, [cta]);
  const optimizedTextCharCount = useMemo(() => Array.from(optimizedText).length, [optimizedText]);

  // Chat state
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const getChatSystemInstruction = useCallback((limit: number) => {
    return `あなたはプロのLINEメッセージ編集アシスタントです。
ユーザーは最初にシステムによって最適化されたLINEメッセージを受け取ります。
その後、ユーザーはそのメッセージに対する修正指示をチャット形式で行います。
あなたは各指示に従って、ユーザーから提示される最新のメッセージを修正し、修正後の完全なメッセージ全体を返答してください。
返答は修正後のメッセージのみとし、余計な挨拶や説明は含めないでください。
常に以下の制約を厳守してください:
1. 生成する文章全体（タイトル、本文、CTA、全ての改行、全ての絵文字を含む全て）は、絶対に ${limit} 文字以内に厳密に収めてください。1文字でも超過することは許容されません。この条件は他のどの条件よりも優先されます。
2. LINEで読みやすい形式（適切な改行、句読点、絵文字）。絵文字は1文字としてカウントされます。過度な使用は避け、文章全体の品位を損なわない範囲でお願いします。
3. 元の文章の重要な情報は保持してください。
4. 元の文章に含まれる顔文字（例: (^_^) (T_T)）や、LINEのメッセージとして不適切または過度に装飾的な特殊記号は全て削除してください。
5. 句読点（、。）や一般的な記号（例:！、？）は、メッセージの明確性とLINEでの読みやすさのために必要最小限で使用し、その総数は生成メッセージ全体で厳密に5個以内にしてください。
6. タイトルとCTAがユーザーの指示に含まれている場合は、それらを変更せずにメッセージの冒頭と末尾に配置してください。`;
  }, []);


  const handleOptimize = useCallback(async () => {
    if (!originalText.trim()) {
      setError('元の文章を入力してください。（タイトルとCTAのみでの最適化は現在サポートされていません）');
      return;
    }

    const currentNumericLimit = Number(charLimit);
    if (isNaN(currentNumericLimit) || currentNumericLimit < MIN_CHAR_LIMIT || currentNumericLimit > MAX_CHAR_LIMIT) {
      setError(`文字数制限は${MIN_CHAR_LIMIT}字から${MAX_CHAR_LIMIT}字の間で指定してください。現在の入力値「${charLimit}」は範囲外か無効です。`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setOptimizedText('');
    setChatMessages([]);
    setChatSession(null);

    try {
      const result = await transformTextForLINE(originalText, currentNumericLimit, title, cta);
      setOptimizedText(result);

      // Start chat session
      const newChatSession = startChatSession(getChatSystemInstruction(currentNumericLimit));
      setChatSession(newChatSession);
      
       const primingUserMessageContent = `これが最適化されたメッセージです。文字数制限は${currentNumericLimit}字です。準備ができたら「はい」と返事してください。\n\n${result}`;
       const initialHistory: ChatMessage[] = [{ 
         role: 'user', 
         parts: [{text: primingUserMessageContent}], 
         text: primingUserMessageContent, 
         timestamp: new Date() 
       }];
       
       if (newChatSession) {
        setIsChatLoading(true); // Show loading for this initial AI "ack"
        const initialResponse = await newChatSession.sendMessage({message:primingUserMessageContent});
        setIsChatLoading(false);
        initialHistory.push({ 
          role: 'model', 
          parts: [{text: initialResponse.text}], 
          text: initialResponse.text, 
          timestamp: new Date() 
        });
       }
       setChatMessages(initialHistory);


    } catch (err) {
      if (err instanceof Error) {
        setError(`最適化処理中にエラーが発生しました：${err.message}`);
      } else {
        setError('最適化処理中に不明なエラーが発生しました。');
      }
      setChatSession(null); // Clear chat session on error
    } finally {
      setIsLoading(false);
    }
  }, [originalText, charLimit, title, cta, getChatSystemInstruction]);

  const handleSendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || !chatSession || !optimizedText) return;

    const userMessageContent = `現在のメッセージは以下です。このメッセージに対して、次の指示を適用してください。\n\n現在のメッセージ:\n${optimizedText}\n\n指示:\n${chatInput}`;
    
    const newUserMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: userMessageContent }],
      text: chatInput, // Display only the user's actual instruction in UI
      timestamp: new Date(),
    };

    setChatMessages(prevMessages => [...prevMessages, newUserMessage]);
    setChatInput('');
    setIsChatLoading(true);
    setError(null);

    try {
      const response = await chatSession.sendMessage({message:userMessageContent});
      const aiResponseText = response.text.trim();
      setOptimizedText(aiResponseText); // Update the main text area
      
      const newAiMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: aiResponseText }],
        text: aiResponseText,
        timestamp: new Date(),
      };
      setChatMessages(prevMessages => [...prevMessages, newAiMessage]);

    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = err instanceof Error ? err.message : "不明なエラー";
      setError(`チャットでの処理中にエラーが発生しました：${errorMessage}`);
      // Optionally add an error message to chat history
      const errorAiMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: `エラーが発生しました: ${errorMessage}` }],
        text: `エラーが発生しました: ${errorMessage}`,
        timestamp: new Date(),
      };
      setChatMessages(prevMessages => [...prevMessages, errorAiMessage]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, chatSession, optimizedText]);


  const handleCopy = useCallback(() => {
    if (optimizedText) {
      navigator.clipboard.writeText(optimizedText)
        .then(() => {
          setSuccessMessage('コピーしました！');
          setError(null);
          setTimeout(() => setSuccessMessage(null), 3000);
        })
        .catch(err => {
          setError('テキストのコピーに失敗しました。');
          setSuccessMessage(null);
          console.error('Failed to copy text: ', err);
        });
    }
  }, [optimizedText]);

  const handleOptimizedTextChange = useCallback((newText: string) => {
    setOptimizedText(newText);
  }, []);

  const handleCharLimitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const valueStr = e.target.value;
    if (valueStr === '') {
      setCharLimit(DEFAULT_CHAR_LIMIT);
    } else {
      const num = parseInt(valueStr, 10);
      if (!isNaN(num)) {
        setCharLimit(num);
      }
    }
  }, []);

  const currentChatLimit = Number.isFinite(Number(charLimit)) && Number(charLimit) >= MIN_CHAR_LIMIT && Number(charLimit) <= MAX_CHAR_LIMIT ? Number(charLimit) : MAX_CHAR_LIMIT;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-6 sm:py-12">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 max-w-2xl w-full bg-white shadow-xl rounded-lg mt-4">
        <div className="space-y-6">
          {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
          {successMessage && <Alert message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />}

          <div>
            <label htmlFor="titleText" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル (任意)
            </label>
            <TextAreaInput
              id="titleText"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: ✨新商品のお知らせ✨"
              rows={2}
            />
            <p className="mt-1 text-xs text-gray-500">現在の文字数: {titleCharCount}</p>
          </div>

          <div>
            <label htmlFor="originalText" className="block text-sm font-medium text-gray-700 mb-1">
              元の文章 (メルマガなど) <span className="text-red-500">*必須</span>
            </label>
            <TextAreaInput
              id="originalText"
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="ここにLINE用に最適化したい文章を貼り付けてください..."
              rows={6}
            />
            <p className="mt-1 text-xs text-gray-500">現在の文字数: {originalTextCharCount}</p>
          </div>

          <div>
            <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700 mb-1">
              CTA (Call to Action - 任意)
            </label>
            <TextAreaInput
              id="ctaText"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="例: 詳細はこちらをチェック！ 👉 [リンク]"
              rows={2}
            />
            <p className="mt-1 text-xs text-gray-500">現在の文字数: {ctaCharCount}</p>
          </div>

          <div>
            <label htmlFor="charLimit" className="block text-sm font-medium text-gray-700 mb-1">
              全体の目標文字数 (改行・絵文字含む、{MIN_CHAR_LIMIT}〜{MAX_CHAR_LIMIT}字)
            </label>
            <NumberInput
              id="charLimit"
              value={charLimit}
              onChange={handleCharLimitChange}
              min={MIN_CHAR_LIMIT}
              max={MAX_CHAR_LIMIT}
            />
             <p className="mt-1 text-xs text-gray-500">現在の設定: {charLimit}字 (最適化実行時に{MIN_CHAR_LIMIT}～{MAX_CHAR_LIMIT}字の範囲で処理されます。チャットでの修正時もこの文字数が適用されます)</p>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleOptimize} 
              disabled={isLoading || !originalText.trim()} 
              variant="primary" 
              className="w-full sm:w-auto"
              aria-label="LINE用に最適化するボタン"
            >
              {isLoading && !isChatLoading ? ( // Ensure this doesn't show during chat loading
                <>
                  <LoadingSpinner />
                  処理中...
                </>
              ) : (
                'LINE用に最適化する ✨'
              )}
            </Button>
          </div>
          
          {(optimizedText || isLoading) && !error && (
             <OutputDisplay 
                text={optimizedText} 
                onCopy={handleCopy} 
                isLoading={isLoading && !chatSession} // Main loading is only when no chat session (initial optimize)
                charCount={optimizedTextCharCount}
                limit={currentChatLimit}
                onTextChange={handleOptimizedTextChange}
             />
          )}

<<<<<<< HEAD
          {chatSession && !isLoading && ( // Show chat interface if session exists and not initial loading
            <div className="mt-6 space-y-4">
              <ChatHistoryWindow messages={chatMessages} ref={chatHistoryRef} />
              <ChatInputArea
                inputValue={chatInput}
                onInputChange={(e) => setChatInput(e.target.value)}
                onSendMessage={handleSendChatMessage}
                isLoading={isChatLoading}
              />
               {isChatLoading && (
                <div className="flex items-center text-sm text-slate-500">
                  <LoadingSpinner color="text-blue-500" size="h-4 w-4" />
                  <span className="ml-2">AIが返信中...</span>
                </div>
              )}
            </div>
=======
          {optimizedText && !isLoading && !isRefining && (
            <ChatRefinement onRefine={handleRefine} isRefining={isRefining} />
>>>>>>> 68d51c6791b4d382761d8ee847393c71eb0eafe2
          )}
        </div>
      </main>
      <footer className="text-center mt-auto py-6 text-sm text-gray-500 px-4">
        <p>&copy; {new Date().getFullYear()} hanaruri / LINE Message Optimizer. AIの力でメッセージを最適化。</p>
      </footer>
    </div>
  );
};

export default App;
