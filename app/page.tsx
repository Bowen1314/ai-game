'use client';

import { useState } from 'react';
import ApiKeyInput from '@/components/ApiKeyInput';
import InterrogationRoom from '@/components/InterrogationRoom';

export default function Home() {
  const [apiKey, setApiKey] = useState('');

  return (
    <main className="min-h-screen bg-black text-gray-200 font-mono">
      <ApiKeyInput onSetKey={setApiKey} />

      {apiKey ? (
        <InterrogationRoom apiKey={apiKey} />
      ) : (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">等待授权 (WAITING FOR AUTHORIZATION)</h1>
            <p className="text-gray-600 animate-pulse">请输入 API Key 继续...</p>
          </div>
        </div>
      )}
    </main>
  );
}
