
import React from 'react';

interface ChatMessageItemProps {
  message: {
    role: 'user' | 'model'; // Corrected role type
    text: string; 
    timestamp: Date;
  };
}

// Helper to format timestamp
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Basic styling, can be enhanced
  const bubbleClass = isUser
    ? 'bg-blue-500 text-white self-end rounded-l-lg rounded-br-lg'
    : 'bg-slate-200 text-slate-800 self-start rounded-r-lg rounded-bl-lg';
  
  const alignClass = isUser ? 'items-end' : 'items-start';

  // Sanitize and format text content for display (simple new line handling)
  const formattedText = message.text.split('\n').map((line, index, arr) => (
    <React.Fragment key={index}>
      {line}
      {index < arr.length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <div className={`flex flex-col mb-3 ${alignClass}`}>
      <div className={`max-w-[80%] p-3 shadow ${bubbleClass}`}>
        <p className="text-sm whitespace-pre-wrap">{formattedText}</p>
      </div>
      <span className={`text-xs text-slate-400 mt-1 px-1 ${isUser ? 'mr-1' : 'ml-1'}`}>
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
};
