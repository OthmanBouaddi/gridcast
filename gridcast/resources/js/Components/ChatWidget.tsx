import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles, ChevronDown } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

// Minimal markdown renderer (bold, code, lists)
function renderMarkdown(text: string): React.ReactNode[] {
    const lines = text.split('\n');
    const nodes: React.ReactNode[] = [];

    lines.forEach((line, i) => {
        // Heading ##
        if (line.startsWith('## ')) {
            nodes.push(
                <p key={i} className="font-semibold text-slate-100 mt-3 mb-1">
                    {line.replace('## ', '')}
                </p>
            );
            return;
        }
        // Heading ###
        if (line.startsWith('### ')) {
            nodes.push(
                <p key={i} className="font-medium text-slate-200 mt-2 mb-1">
                    {line.replace('### ', '')}
                </p>
            );
            return;
        }
        // List item
        if (line.startsWith('- ')) {
            nodes.push(
                <li key={i} className="ml-3 text-slate-200 text-sm">
                    {inlineFormat(line.replace('- ', ''))}
                </li>
            );
            return;
        }
        // Empty line = spacer
        if (line.trim() === '') {
            nodes.push(<br key={i} />);
            return;
        }
        // Normal paragraph
        nodes.push(
            <p key={i} className="text-slate-200 text-sm leading-relaxed">
                {inlineFormat(line)}
            </p>
        );
    });

    return nodes;
}

function inlineFormat(text: string): React.ReactNode {
    // Bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    return parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
            <strong key={i} className="text-white font-semibold">
                {p.slice(2, -2)}
            </strong>
        ) : (
            p
        )
    );
}

const SUGGESTIONS = [
    'Quels programmes sont validés ?',
    'Combien de créneaux cette semaine ?',
    'Quel est le CA publicitaire ?',
    'Quels programmes sont en attente de validation ?',
];

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content:
                'Bonjour ! Je suis **GridCast AI**, votre assistant intelligent. Je connais vos programmes, votre grille de diffusion et vos données publicitaires en temps réel.\n\nComment puis-je vous aider ?',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open, messages]);

    const send = async (text?: string) => {
        const content = (text ?? input).trim();
        if (!content || loading) return;

        setInput('');
        const newHistory: Message[] = [...messages, { role: 'user', content }];
        setMessages(newHistory);
        setLoading(true);

        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    message: content,
                    history: newHistory.slice(-10, -1),
                }),
            });
            const data = await res.json();
            setMessages((prev) => [...prev, { role: 'assistant', content: data.reply ?? 'Pas de réponse.' }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: '⚠️ Erreur de connexion au service IA.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-white shadow-2xl hover:bg-blue-500 transition-all duration-200"
                title="GridCast AI"
            >
                {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
                {!open && <span className="text-sm font-medium">GridCast AI</span>}
                {!open && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                )}
            </button>

            {/* Chat panel */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 flex flex-col w-96 max-h-[580px] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>

                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-slate-900/80">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">GridCast AI</p>
                            <p className="text-emerald-400 text-xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                Connecté · Gemini 2.5 Flash
                            </p>
                        </div>
                        <button onClick={() => setOpen(false)} className="ml-auto text-slate-400 hover:text-white">
                            <ChevronDown className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 flex items-start justify-center w-7 h-7 rounded-full mt-1 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                                    {msg.role === 'user' ? (
                                        <User className="h-4 w-4 text-white mt-1.5" />
                                    ) : (
                                        <Bot className="h-4 w-4 text-slate-300 mt-1.5" />
                                    )}
                                </div>
                                {/* Bubble */}
                                <div className={`max-w-[82%] rounded-2xl px-3 py-2.5 text-sm space-y-1 ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                        : 'bg-slate-800 text-slate-100 rounded-tl-sm'
                                }`}>
                                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : <p>{msg.content}</p>}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-2">
                                <div className="flex-shrink-0 flex items-start justify-center w-7 h-7 rounded-full mt-1 bg-slate-700">
                                    <Bot className="h-4 w-4 text-slate-300 mt-1.5" />
                                </div>
                                <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-3 py-3">
                                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick suggestions (only when only 1 message) */}
                    {messages.length === 1 && (
                        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => send(s)}
                                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1 rounded-full transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="border-t border-slate-700 px-3 py-3 flex gap-2 bg-slate-900/60">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Posez une question..."
                            disabled={loading}
                            className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <button
                            onClick={() => send()}
                            disabled={loading || !input.trim()}
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="h-4 w-4 text-white" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
