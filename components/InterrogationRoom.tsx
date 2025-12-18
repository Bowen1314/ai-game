'use client';

import { useState, useEffect, useRef } from 'react';
import { GameState, Character } from '@/data/schemas';

interface Props {
    apiKey: string;
}

type Message = { role: 'user' | 'ai' | 'system', content: string, charName?: string };

export default function InterrogationRoom({ apiKey }: Props) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedCharId, setSelectedCharId] = useState<string>('char_A');
    const [showIntro, setShowIntro] = useState(true);
    const [showAccuseModal, setShowAccuseModal] = useState(false);

    const endRef = useRef<HTMLDivElement>(null);

    // Initialize Game
    useEffect(() => {
        const fetchInit = async () => {
            try {
                const res = await fetch('/api/interrogate', {
                    method: 'POST',
                    body: JSON.stringify({ message: 'INIT', apiKey, gameState: null, action: 'interrogate' })
                });
                if (!res.ok) throw new Error(`Server Error: ${res.status}`);
                const data = await res.json();
                if (data.gameState) {
                    setGameState(data.gameState);
                    const initialHistories: Record<string, Message[]> = {};
                    Object.keys(data.gameState.characters).forEach(id => {
                        initialHistories[id] = [];
                    });
                    setChatHistories(initialHistories);
                }
            } catch (e) {
                console.error(e);
                alert("无法连接服务器，请检查控制台日志");
            }
        };
        fetchInit();
    }, [apiKey]);

    const addMessage = (charId: string, msg: Message) => {
        setChatHistories(prev => ({
            ...prev,
            [charId]: [...(prev[charId] || []), msg]
        }));
    };

    const sendMessage = async (action: 'interrogate' | 'accuse' = 'interrogate') => {
        if (!input.trim() && action === 'interrogate') return;
        if (!gameState) return;

        const currentId = selectedCharId;
        const userMsg = input;

        if (action === 'interrogate') {
            addMessage(currentId, { role: 'user', content: userMsg });
            setInput('');
        }
        setLoading(true);
        if (action === 'accuse') setShowAccuseModal(false);

        try {
            const res = await fetch('/api/interrogate', {
                method: 'POST',
                body: JSON.stringify({
                    message: userMsg,
                    characterId: currentId,
                    gameState,
                    apiKey,
                    action
                })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server API Error: ${res.status} ${text.substring(0, 50)}`);
            }

            const data = await res.json();

            if (data.gameState) setGameState(data.gameState);

            if (data.isGameOver) {
                addMessage(currentId, { role: 'system', content: `游戏结束: ${data.response}` });
            } else {
                const charName = gameState.characters[currentId].name;
                addMessage(currentId, { role: 'ai', content: data.response, charName });
            }

        } catch (e: any) {
            console.error(e);
            addMessage(currentId, { role: 'system', content: `系统错误: ${e.message}` });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Delay slightly to ensure layout paint
        const timer = setTimeout(() => {
            endRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
    }, [chatHistories, selectedCharId, showIntro]);

    if (!gameState) return <div className="flex items-center justify-center h-screen bg-black text-white font-mono animate-pulse">建立神经连接... (Establishing Connection)</div>;

    // --- INTRO SCREEN ---
    if (showIntro) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white overflow-hidden p-8 font-sans">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black z-0"></div>

                <div className="relative z-10 max-w-3xl w-full space-y-8 animate-fade-in-up">
                    <div className="border-l-4 border-red-600 pl-6">
                        <h2 className="text-red-500 text-sm tracking-[0.5em] font-bold uppercase mb-2">Internal Police Database</h2>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                            CASE <span className="text-red-600">001</span><br />
                            MIDNIGHT
                        </h1>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-md p-6 border border-gray-800 rounded-lg shadow-2xl">
                        <p className="text-gray-300 text-lg leading-relaxed font-light">
                            <strong className="text-white block mb-2 text-xl">摘要 (BRIEF):</strong>
                            知名古籍收藏家 <strong>Arthur Blackwood</strong> 被发现死于自己的密室图书馆。
                            <br /><br />
                            现场只有三人：
                            <span className="text-red-400">关系疏远的妻子</span>,
                            <span className="text-purple-400">野心勃勃的竞争对手</span>,
                            <span className="text-blue-400">沉默寡言的图书管理员</span>。
                            <br /><br />
                            作为首席探员，你必须通过对话找出破绽。每个人都有秘密，但只有一个是凶手。
                        </p>
                    </div>

                    <button
                        onClick={() => setShowIntro(false)}
                        className="group relative w-full md:w-auto px-10 py-5 bg-white text-black font-bold text-xl uppercase tracking-widest overflow-hidden rounded transition-transform hover:scale-105"
                    >
                        <span className="relative z-10 group-hover:text-white transition-colors">接入审讯系统 (START)</span>
                        <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left ease-out"></div>
                    </button>
                </div>
            </div>
        );
    }

    const currentChar = gameState.characters[selectedCharId];
    const currentMessages = chatHistories[selectedCharId] || [];

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden overscroll-none relative bg-[#0a0a0a] text-gray-100 font-sans">

            {/* BACKGROUND ACCENTS */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 z-50"></div>

            {/* LEFT: SIDEBAR (Suspects & Stats) */}
            <div className="w-full md:w-80 flex flex-col border-r border-gray-700 bg-zinc-900 z-[60] shadow-xl">

                {/* Header */}
                <div className="p-6 pt-12 md:pt-6 border-b border-gray-700 bg-zinc-900">
                    <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">Investigation Active</div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        档案室 (ARCHIVE)
                    </h1>
                </div>

                {/* Character List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-900">
                    <div className="text-xs font-bold text-gray-400 uppercase px-2 mb-2 tracking-wider">Suspects In Custody</div>
                    {Object.values(gameState.characters).map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCharId(c.id)}
                            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 group border ${c.id === selectedCharId
                                ? 'bg-red-950/40 border-red-500 shadow-lg ring-1 ring-red-500 z-10'
                                : 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700 hover:border-zinc-500'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${c.id === selectedCharId ? 'bg-red-600 text-white ring-2 ring-white' : 'bg-black border border-gray-500 text-gray-300'
                                }`}>
                                {c.name[0]}
                            </div>
                            <div className="text-left flex-1">
                                <div className={`text-sm font-black ${c.id === selectedCharId ? 'text-white' : 'text-gray-100'}`}>
                                    {c.name.split(' ')[0]}
                                </div>
                                <div className={`text-[11px] uppercase font-bold ${c.id === selectedCharId ? 'text-red-300' : 'text-gray-400'}`}>
                                    {c.role}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Active Suspect Stats (Bottom of Sidebar) */}
                <div className="p-6 bg-zinc-900 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest">Mental State</h3>
                        <span className={`px-3 py-1 rounded text-xs font-bold ${currentChar.isBreaking ? 'bg-red-600 text-white border border-red-400' : 'bg-green-700 text-white border border-green-500'}`}>
                            {currentChar.isBreaking ? 'BREAKING' : 'STABLE'}
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs text-gray-300 mb-2 font-bold tracking-wider">
                                <span>PRESSURE</span>
                                <span className="text-white text-sm">{currentChar.pressure}%</span>
                            </div>
                            <div className="h-3 w-full bg-black rounded-full overflow-hidden border border-gray-600 relative">
                                <div className="absolute inset-0 bg-gray-800/50"></div>
                                <div className="h-full bg-gradient-to-r from-orange-600 to-red-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${currentChar.pressure}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-gray-300 mb-2 font-bold tracking-wider">
                                <span>COMPOSURE</span>
                                <span className="text-white text-sm">{currentChar.patience}%</span>
                            </div>
                            <div className="h-3 w-full bg-black rounded-full overflow-hidden border border-gray-600 relative">
                                <div className="absolute inset-0 bg-gray-800/50"></div>
                                <div className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${currentChar.patience}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAccuseModal(true)}
                        className="w-full mt-6 py-4 bg-red-800 hover:bg-red-700 text-white border border-red-500 rounded font-black text-sm tracking-widest uppercase shadow-lg transition-transform active:scale-95"
                    >
                        🚨 指认凶手 (Accuse)
                    </button>
                </div>
            </div>

            {/* RIGHT: MAIN CONTENT */}
            <div className="flex-1 flex flex-col relative bg-[#0a0a0a]">

                {/* Top Bar */}
                <div className="h-16 px-6 flex items-center justify-between border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{currentChar.name}</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{currentChar.role}</p>
                        </div>
                    </div>
                    <div className="text-gray-600 text-xs font-mono hidden md:block">
                        ENCRYPTED CONNECTION // {selectedCharId.toUpperCase()}
                    </div>
                </div>

                {/* Chat Layout */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                    {currentMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4 opacity-50">
                            <div className="w-16 h-16 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center font-bold text-2xl">?</div>
                            <p className="font-mono text-sm">开始审讯。注意寻找矛盾之处。</p>
                        </div>
                    )}

                    {currentMessages.map((m, i) => (
                        <div key={i} className={`flex gap-4 fade-in ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {/* Bot Icon */}
                            {m.role === 'ai' && (
                                <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 mt-1 flex-shrink-0 border border-gray-700">
                                    {currentChar.name[0]}
                                </div>
                            )}

                            <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-xl text-sm md:text-base leading-relaxed shadow-sm ${m.role === 'user'
                                ? 'bg-[#2a2a2a] text-white rounded-tr-none'
                                : m.role === 'system'
                                    ? 'bg-red-900/20 text-red-200 border border-red-900/50 w-full text-center font-mono py-2 rounded'
                                    : 'bg-black border border-gray-800 text-gray-300 rounded-tl-none'
                                }`}>
                                {m.content}
                            </div>

                            {/* User Icon */}
                            {m.role === 'user' && (
                                <div className="w-8 h-8 rounded bg-blue-900/20 flex items-center justify-center text-xs font-bold text-blue-500 mt-1 flex-shrink-0 border border-blue-900/30">
                                    ME
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={endRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 pb-20 md:pb-10 bg-[#0f0f0f] border-t border-gray-800 relative z-30">
                    <form onSubmit={(e) => { e.preventDefault(); sendMessage('interrogate'); }} className="max-w-4xl mx-auto flex gap-3">
                        <input
                            className="flex-1 bg-zinc-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-sans"
                            placeholder="输入问题..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            disabled={gameState.isGameOver || loading || showAccuseModal}
                        />
                        <button
                            disabled={gameState.isGameOver || loading || showAccuseModal}
                            className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? '...' : '发送'}
                        </button>
                    </form>
                </div>
            </div>

            {/* --- FIXED CENTERED MODAL --- */}
            {showAccuseModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#111] border border-red-600/50 w-full max-w-md p-8 rounded-xl shadow-2xl relative overflow-hidden">

                        {/* Decorative background pulse */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse"></div>

                        <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">FINAL DECISION</h2>
                        <div className="h-px w-10 bg-red-600 mb-6"></div>

                        <p className="text-gray-400 mb-8 leading-relaxed">
                            你确定要指认 <span className="text-white font-bold text-lg border-b border-gray-600">{currentChar.name}</span> 吗？
                            <br /><br />
                            <span className="text-red-500 font-mono text-xs uppercase tracking-widest">Warning:</span><br />
                            如果指认错误，真正的凶手就会逃脱。此操作无法撤销。
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAccuseModal(false)}
                                className="flex-1 py-3 px-4 rounded border border-gray-700 text-gray-400 font-bold hover:bg-gray-800 hover:text-white transition-colors"
                            >
                                取消 (CANCEL)
                            </button>
                            <button
                                onClick={() => sendMessage('accuse')}
                                className="flex-1 py-3 px-4 rounded bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all transform hover:-translate-y-0.5"
                            >
                                确认指认 (CONFIRM)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
