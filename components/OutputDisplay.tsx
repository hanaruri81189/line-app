import React from 'react';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';

interface OutputDisplayProps {
  text: string;
  onCopy: () => void;
  isLoading: boolean;
  charCount: number;
  limit: number;
  onTextChange?: (newText: string) => void; // Added for editable textarea
}

const CopyIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 4.625v2.625a2.625 2.625 0 11-5.25 0v-2.625a2.625 2.625 0 015.25 0z" />
  </svg>
);

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ text, onCopy, isLoading, charCount, limit, onTextChange }) => {
  return (
    <div className="mt-6 p-4 border border-slate-300 rounded-lg bg-slate-50 shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">LINE最適化後の文章:</h3>
        {!isLoading && text && (
           <span className="text-sm text-gray-600" aria-live="polite">
             文字数: {charCount} / {limit}
           </span>
        )}
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[120px] p-3 bg-white border border-slate-200 rounded-md text-slate-500">
          <LoadingSpinner color="text-blue-500" size="h-8 w-8" />
          <p className="mt-2 text-sm">AIが文章を調整中です...</p>
        </div>
      ) : text ? (
        <>
          <textarea
            value={text}
            onChange={(e) => onTextChange?.(e.target.value)}
            rows={6} // Adjust rows as needed, or use CSS height
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm text-gray-700 min-h-[120px] max-h-[300px] overflow-y-auto"
            aria-label="最適化されたLINEメッセージ（編集可能）"
            aria-describedby="outputCharCount"
            
          />
           <span id="outputCharCount" className="sr-only">現在の文字数 {charCount}、制限 {limit}</span>
          <div className="mt-4 text-right">
            <Button onClick={onCopy} variant="secondary" disabled={!text}>
              <CopyIcon />
              コピーする
            </Button>
          </div>
        </>
      ) : (
         <div className="p-3 bg-white border border-slate-200 rounded-md text-sm text-gray-500 min-h-[120px] flex items-center justify-center">
            <p>ここに最適化されたテキストが表示されます。</p>
        </div>
      )}
    </div>
  );
};