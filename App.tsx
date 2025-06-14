import React, { useState, useCallback, useMemo, FC } from 'react';
import { transformTextForLINE, refineText } from './services/geminiService';
import { DEFAULT_CHAR_LIMIT, MAX_CHAR_LIMIT, MIN_CHAR_LIMIT } from './constants';

// --- UIコンポーネントをこのファイルに統合 ---

const Header: FC = () => (
  <header className="text-center">
    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center justify-center">
      <span className="text-4xl sm:text-5xl mr-2">✍️</span>
      LINEメッセージ最適化ツール
    </h1>
    <p className="mt-2 text-gray-600">メルマガなどの長い文章を、LINE用に短く最適化します。</p>
  </header>
);

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const TextAreaInput: FC<TextAreaInputProps> = (props) => (
  <textarea
    {...props}
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
  />
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const Input: FC<InputProps> = (props) => (
    <input
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    />
);


interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const NumberInput: FC<NumberInputProps> = (props) => (
  <input
    type="number"
    {...props}
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
  />
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'chat';
}
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


const App: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [cta, setCta] = useState<string>('');
  const [charLimit, setCharLimit] = useState<number>(DEFAULT_CHAR_LIMIT);
  
  const [optimizedText, setOptimizedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false); // 修正中のローディング状態

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const titleCharCount = useMemo(() => Array.from(title).length, [title]);
  const originalTextCharCount = useMemo(() => Array.from(originalText).length, [originalText]);
  const ctaCharCount = useMemo(() => Array.from(cta).length, [cta]);
  const optimizedTextCharCount = useMemo(() => Array.from(optimizedText).length, [optimizedText]);

  const handleOptimize = useCallback(async () => {
    if (!originalText.trim()) {
      setError('元の文章を入力してください。');
      return;
    }

    const currentNumericLimit = Number(charLimit);
    if (isNaN(currentNumericLimit) || currentNumericLimit < MIN_CHAR_LIMIT || currentNumericLimit > MAX_CHAR_LIMIT) {
      setError(`文字数制限は${MIN_CHAR_LIMIT}字から${MAX_CHAR_LIMIT}字の間で指定してください。`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setOptimizedText('');

    try {
      const result = await transformTextForLINE(originalText, currentNumericLimit, title, cta);
      setOptimizedText(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(`最適化処理中にエラーが発生しました：${err.message}`);
      } else {
        setError('最適化処理中に不明なエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  }, [originalText, charLimit, title, cta]);

  const handleRefine = useCallback(async (instruction: string) => {
    if(!optimizedText) return;

    setIsRefining(true);
    setError(null);
    setSuccessMessage(null);

    try {
        const result = await refineText(optimizedText, instruction);
        setOptimizedText(result);
    } catch (err) {
        if(err instanceof Error) {
            setError(`修正処理中にエラーが発生しました：${err.message}`);
        } else {
            setError('修正処理中に不明なエラーが発生しました。');
        }
    } finally {
        setIsRefining(false);
    }
  }, [optimizedText]);


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
          console.error('テキストのコピーに失敗しました: ', err);
        });
    }
  }, [optimizedText]);

  const handleOptimizedTextChange = useCallback((newText: string) => {
    setOptimizedText(newText);
  }, []);

  const handleCharLimitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const valueStr = e.target.value;
    setCharLimit(valueStr === '' ? 0 : parseInt(valueStr, 10));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 sm:py-12 px-4">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 max-w-2xl w-full bg-white shadow-xl rounded-lg mt-4">
        <div className="space-y-6">
          {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
          {successMessage && <Alert message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />}

          <div>
            <label htmlFor="titleText" className="block text-sm font-medium text-gray-700 mb-1">タイトル (任意)</label>
            <TextAreaInput id="titleText" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: ✨新商品のお知らせ✨" rows={2}/>
            <p className="mt-1 text-xs text-gray-500 text-right">現在の文字数: {titleCharCount}</p>
          </div>

          <div>
            <label htmlFor="originalText" className="block text-sm font-medium text-gray-700 mb-1">元の文章 (メルマガなど) <span className="text-red-500">*必須</span></label>
            <TextAreaInput id="originalText" value={originalText} onChange={(e) => setOriginalText(e.target.value)} placeholder="ここにLINE用に最適化したい文章を貼り付けてください..." rows={6}/>
            <p className="mt-1 text-xs text-gray-500 text-right">現在の文字数: {originalTextCharCount}</p>
          </div>

          <div>
            <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700 mb-1">CTA (Call to Action - 任意)</label>
            <TextAreaInput id="ctaText" value={cta} onChange={(e) => setCta(e.target.value)} placeholder="例: 詳細はこちらをチェック！ 👉 [リンク]" rows={2}/>
            <p className="mt-1 text-xs text-gray-500 text-right">現在の文字数: {ctaCharCount}</p>
          </div>

          <div>
            <label htmlFor="charLimit" className="block text-sm font-medium text-gray-700 mb-1">全体の目標文字数 (改行・絵文字含む、{MIN_CHAR_LIMIT}〜{MAX_CHAR_LIMIT}字)</label>
            <NumberInput id="charLimit" value={charLimit} onChange={handleCharLimitChange} min={MIN_CHAR_LIMIT} max={MAX_CHAR_LIMIT}/>
            <p className="mt-1 text-xs text-gray-500">現在の設定: {charLimit}字</p>
          </div>

          <div className="text-center pt-4">
            <Button onClick={handleOptimize} disabled={isLoading || isRefining} variant="primary" className="w-full sm:w-auto" aria-label="LINE用に最適化するボタン">
              {isLoading ? '処理中...' : 'LINE用に最適化する ✨'}
            </Button>
          </div>
          
          {(optimizedText || isLoading) && (
             <OutputDisplay 
                text={optimizedText} 
                onCopy={handleCopy} 
                isLoading={isLoading}
                charCount={optimizedTextCharCount}
                limit={Number.isFinite(Number(charLimit)) && Number(charLimit) >= MIN_CHAR_LIMIT && Number(charLimit) <= MAX_CHAR_LIMIT ? Number(charLimit) : MAX_CHAR_LIMIT}
                onTextChange={handleOptimizedTextChange}
             />
          )}

          {optimizedText && !isLoading && !isRefining && (
            <ChatRefinement onRefine={handleRefine} isRefining={isRefining} />
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
