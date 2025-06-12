import React, { useState, useCallback, useMemo, FC } from 'react';
import { transformTextForLINE } from './services/geminiService';
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

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const NumberInput: FC<NumberInputProps> = (props) => (
  <input
    type="number"
    {...props}
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
  />
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}
const Button: FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles = variant === 'primary' 
    ? "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500" 
    : "text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-400";
  return (
    <button {...props} className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </button>
  );
};

const LoadingSpinner: FC = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
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
            <div className="flex justify-center items-center h-40 bg-gray-100 rounded-md">
                <LoadingSpinner /> <span className="ml-2 text-gray-500">AIが文章を生成中...</span>
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
    // Allow empty string to be handled by validation on submit
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
            <p className="mt-1 text-xs text-gray-500 text-right">現在の文字数: {titleCharCount}</p>
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
            <p className="mt-1 text-xs text-gray-500 text-right">現在の文字数: {originalTextCharCount}</p>
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
            <p className="mt-1 text-xs text-gray-500 text-right">現在の文字数: {ctaCharCount}</p>
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
             <p className="mt-1 text-xs text-gray-500">現在の設定: {charLimit}字 (最適化実行時に{MIN_CHAR_LIMIT}～{MAX_CHAR_LIMIT}字の範囲で処理されます)</p>
          </div>

          <div className="text-center pt-4">
            <Button 
              onClick={handleOptimize} 
              disabled={isLoading || !originalText.trim()} 
              variant="primary" 
              className="w-full sm:w-auto"
              aria-label="LINE用に最適化するボタン"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  処理中...
                </>
              ) : (
                'LINE用に最適化する ✨'
              )}
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
        </div>
      </main>
      <footer className="text-center mt-auto py-6 text-sm text-gray-500 px-4">
        <p>&copy; {new Date().getFullYear()} hanaruri / LINE Message Optimizer. AIの力でメッセージを最適化。</p>
      </footer>
    </div>
  );
};

export default App;
