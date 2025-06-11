
import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { TextAreaInput } from './components/TextAreaInput';
import { NumberInput } from './components/NumberInput';
import { Button } from './components/Button';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Alert } from './components/Alert';
import { OutputDisplay } from './components/OutputDisplay';
import { transformTextForLINE } from './services/geminiService';
import { DEFAULT_CHAR_LIMIT, MAX_CHAR_LIMIT, MIN_CHAR_LIMIT } from './constants';

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
      if (!process.env.API_KEY) {
        console.warn("API_KEY might not be available to the frontend. Ensure it's handled by the environment/build process.");
      }
      // Use the validated currentNumericLimit for the API call
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
      // Reset to default if input is cleared
      setCharLimit(DEFAULT_CHAR_LIMIT);
    } else {
      const num = parseInt(valueStr, 10);
      if (!isNaN(num)) {
        // Allow user to type, validation happens on submit
        setCharLimit(num);
      }
      // If not a number (e.g. "abc"), do nothing, keep previous charLimit
    }
  }, []);

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
             <p className="mt-1 text-xs text-gray-500">現在の設定: {charLimit}字 (最適化実行時に{MIN_CHAR_LIMIT}～{MAX_CHAR_LIMIT}字の範囲で処理されます)</p>
          </div>

          <div className="text-center">
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
          
          {(optimizedText || isLoading) && !error && (
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
