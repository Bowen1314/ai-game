'use client';

import { useState, useEffect } from 'react';

interface ApiKeyInputProps {
    onSetKey: (key: string) => void;
}

export default function ApiKeyInput({ onSetKey }: ApiKeyInputProps) {
    const [key, setKey] = useState('');
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('openai_key');
        if (stored) {
            setKey(stored);
            onSetKey(stored);
            setIsOpen(false);
        }
    }, [onSetKey]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = key.trim();
        if (trimmed.startsWith('sk-') || trimmed === 'BYPASS') {
            localStorage.setItem('openai_key', trimmed);
            onSetKey(trimmed);
            setIsOpen(false);
        } else {
            alert("请输入有效的 OpenAI Key，以 sk- 开头，或输入 BYPASS 进入测试模式");
        }
    };

    const handleClear = () => {
        localStorage.removeItem('openai_key');
        setKey('');
        onSetKey('');
    };

    // =====================
    // SETTINGS BUTTON (Floating) - LARGE SIZE
    // =====================
    if (!isOpen) return (
        <button
            onClick={() => setIsOpen(true)}
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                width: '40px',
                height: '40px',
                zIndex: 99999,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '10px',
                border: '2px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
            aria-label="打开设置"
        >
            {/* Gear Icon - Large SVG */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: '24px', height: '24px' }}
            >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        </button>
    );

    // =====================
    // SETTINGS MODAL (Full Screen)
    // =====================
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#000000',
        }}>
            {/* Close Button */}
            <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                aria-label="关闭"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {/* Settings Card */}
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-red-400">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">系统设置</h1>
                    <p className="text-sm text-white/40 mt-1">System Settings</p>
                </div>

                {/* API Key Section */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-400">
                                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-white">API 密钥</h2>
                            <p className="text-xs text-white/40">OpenAI API Key</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type="password"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="sk-... 或输入 BYPASS"
                                className="w-full h-12 px-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all font-mono text-sm"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 h-12 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
                            >
                                保存密钥
                            </button>
                            {key && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="h-12 px-5 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-all"
                                >
                                    清除
                                </button>
                            )}
                        </div>
                    </form>

                    <p className="text-xs text-white/30 mt-4 leading-relaxed">
                        您的密钥仅存储在本地浏览器中，不会发送到我们的服务器。
                        <br />
                        输入 <code className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">BYPASS</code> 可进入测试模式。
                    </p>
                </div>

                {/* Info Footer */}
                <div className="text-center text-xs text-white/20">
                    AI Interrogation Game v1.0
                </div>
            </div>
        </div>
    );
}
