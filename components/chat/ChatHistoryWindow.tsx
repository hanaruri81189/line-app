
import React, { forwardRef } from 'react';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatMessageForDisplay {
  role: 'user' | 'model'; // Corrected role type
  text: string;
  timestamp: Date;
}

interface ChatHistoryWindowProps {
  messages: ChatMessageForDisplay[];
}

export const ChatHistoryWindow = forwardRef<HTMLDivElement, ChatHistoryWindowProps>(({ messages }, ref) => {
  return (
    <div 
      ref={ref} 
      className="h-64 overflow-y-auto p-4 border border-slate-300 rounded-lg bg-white space-y-2 shadow-inner"
      aria-live="polite"
      aria-label="チャット履歴"
    >
      {messages.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">
          最適化後にAIとチャットで修正内容を指示できます。
        </p>
      )}
      {messages.map((msg, index) => (
        <ChatMessageItem key={index} message={msg} />
      ))}
    </div>
  );
});

ChatHistoryWindow.displayName = 'ChatHistoryWindow';
