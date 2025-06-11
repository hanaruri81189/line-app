import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        LINEメッセージ最適化ツール ✍️➡️📱
      </h1>
      <p className="mt-2 text-md text-slate-600 max-w-md mx-auto">
        AIがあなたの文章をLINEで読みやすい形に変換します。文字数、トーン、絵文字もバッチリ調整！
      </p>
    </header>
  );
};