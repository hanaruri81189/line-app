
import React from 'react';
import { Button } from '../Button'; // Assuming Button is in ../Button
import { LoadingSpinner } from '../LoadingSpinner'; // Assuming LoadingSpinner is in ../LoadingSpinner

interface ChatInputAreaProps {
  inputValue: string;
  onInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && inputValue.trim()) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="flex items-start space-x-3 p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
      <textarea
        value={inputValue}
        onChange={onInputChange}
        onKeyDown={handleKeyDown}
        placeholder="AIへの修正指示を入力してください (Shift+Enterで改行)..."
        rows={2}
        className="flex-grow p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none text-sm disabled:bg-slate-100"
        disabled={isLoading}
        aria-label="AIへの修正指示入力エリア"
      />
      <Button
        onClick={onSendMessage}
        disabled={isLoading || !inputValue.trim()}
        variant="primary"
        className="h-full px-4 py-2 text-sm"
        aria-label="チャットメッセージを送信"
      >
        {isLoading ? (
          <LoadingSpinner size="h-4 w-4" color="text-white" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M3.105 3.105a1.5 1.5 0 012.087.025l6.088 5.761a1.5 1.5 0 010 2.218l-6.087 5.761a1.5 1.5 0 01-2.112-2.092l4.819-4.576-4.82-4.576a1.5 1.5 0 01.025-2.087z" />
          </svg>
        )}
      </Button>
    </div>
  );
};
