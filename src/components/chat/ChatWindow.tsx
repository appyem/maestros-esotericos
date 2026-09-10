'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SPECIALTY_MAP: Record<string, string> = {
  tarot: 'TAROT',
  amor: 'AMOR_RELACIONES',
  prosperidad: 'PROSPERIDAD',
  astrologia: 'ASTROLOGIA',
  general: 'GENERAL'
};

const SERVICE_THEMES: Record<string, { name: string; color: string; bg: string; border: string; welcome: string }> = {
  tarot: { 
    name: 'Tarot', 
    color: 'text-purple-600 dark:text-purple-400', 
    bg: 'bg-purple-600', 
    border: 'border-purple-200 dark:border-purple-800',
    welcome: 'Hola, soy Ariel. Estoy aquí para escucharte con calma y ayudarte a ordenar lo que sientes, paso a paso. Para comenzar, ¿cómo te llamas? (Si prefieres, puedes darme un alias o apodo mientras entramos en confianza, lo importante es que te sientas a gusto).' 
  },
  amor: { 
    name: 'Amor y Relaciones', 
    color: 'text-rose-600 dark:text-rose-400', 
    bg: 'bg-rose-600', 
    border: 'border-rose-200 dark:border-rose-800',
    welcome: 'Hola, soy Ariel. Estoy aquí para escucharte con calma y ayudarte a ordenar lo que sientes, paso a paso. Para comenzar, ¿cómo te llamas? (Si prefieres, puedes darme un alias o apodo mientras entramos en confianza, lo importante es que te sientas a gusto).' 
  },
  prosperidad: { 
    name: 'Prosperidad', 
    color: 'text-emerald-600 dark:text-emerald-400', 
    bg: 'bg-emerald-600', 
    border: 'border-emerald-200 dark:border-emerald-800',
    welcome: 'Hola, soy Ariel. Estoy aquí para escucharte con calma y ayudarte a ordenar lo que sientes, paso a paso. Para comenzar, ¿cómo te llamas? (Si prefieres, puedes darme un alias o apodo mientras entramos en confianza, lo importante es que te sientas a gusto).' 
  },
  astrologia: { 
    name: 'Astrología', 
    color: 'text-indigo-600 dark:text-indigo-400', 
    bg: 'bg-indigo-600', 
    border: 'border-indigo-200 dark:border-indigo-800',
    welcome: 'Hola, soy Ariel. Estoy aquí para escucharte con calma y ayudarte a ordenar lo que sientes, paso a paso. Para comenzar, ¿cómo te llamas? (Si prefieres, puedes darme un alias o apodo mientras entramos en confianza, lo importante es que te sientas a gusto).' 
  },
  general: { 
    name: 'Orientación General', 
    color: 'text-primary', 
    bg: 'bg-primary', 
    border: 'border-border',
    welcome: 'Hola, soy Ariel. Estoy aquí para escucharte con calma y ayudarte a ordenar lo que sientes, paso a paso. Para comenzar, ¿cómo te llamas? (Si prefieres, puedes darme un alias o apodo mientras entramos en confianza, lo importante es que te sientas a gusto).' 
  }
};

export default function ChatWindow() {
  const searchParams = useSearchParams();
  const serviceKey = searchParams.get('service') || 'general';
  const theme = SERVICE_THEMES[serviceKey] || SERVICE_THEMES.general;
  const backendSpecialty = SPECIALTY_MAP[serviceKey] || 'GENERAL';
  
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    { id: uuidv4(), role: 'assistant', content: theme.welcome, timestamp: new Date().toISOString() }
  ]);
  
  const [typingMessage, setTypingMessage] = useState<{ id: string; text: string } | null>(null);
  const [displayedTypingText, setDisplayedTypingText] = useState('');
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage, isThinking]);

  useEffect(() => {
    if (!typingMessage) return;
    
    let currentIndex = 0;
    const text = typingMessage.text;
    
    const typeInterval = setInterval(() => {
      currentIndex++;
      setDisplayedTypingText(text.substring(0, currentIndex));
      
      if (currentIndex >= text.length) {
        clearInterval(typeInterval);
        setMessages(prev => [...prev, {
          id: typingMessage.id,
          role: 'assistant',
          content: text,
          timestamp: new Date().toISOString()
        }]);
        setTypingMessage(null);
        setDisplayedTypingText('');
        setIsProcessing(false);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [typingMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setIsThinking(true);
    setError(null);

    try {
      const fetchStart = Date.now();
      
      // Enviamos los últimos 8 mensajes para que Ariel tenga contexto y memoria
      const recentHistory = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userInput: userMessage.content,
          context: {
            specialty: backendSpecialty,
            messageHistory: recentHistory,
          }
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error del servidor (${response.status})`);
      }

      const data = await response.json();
      const fullText = data.text || 'No pude generar una respuesta en este momento.';
      
      const elapsed = Date.now() - fetchStart;
      const minThinkingTime = 4000; 
      const delay = Math.max(0, minThinkingTime - elapsed);
      
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      setIsThinking(false);
      setTypingMessage({ id: uuidv4(), text: fullText });
      
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión. Por favor, intenta de nuevo.');
      setIsProcessing(false);
      setIsThinking(false);
    }
  };

  const handleTransferToHuman = async () => {
    setIsTransferring(true);
    setError(null);

    try {
      const response = await fetch('/api/consultations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: serviceKey,
          contextSummary: messages.map((m: Message) => `${m.role}: ${m.content}`).join('\n'),
          urgency: 'NORMAL',
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'No se pudo solicitar la consulta.');
      }

      const data = await response.json();
      router.push(`/consulta/${data.consultationId}/reservar`);
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err instanceof Error ? err.message : 'Error al conectar con un maestro.');
      setIsTransferring(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-4rem)] md:h-[600px] bg-card border ${theme.border} rounded-xl overflow-hidden shadow-lg transition-colors duration-300`}>
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full ${theme.bg} bg-opacity-20 flex items-center justify-center text-lg font-bold ${theme.color}`}>
            {theme.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Guía de {theme.name}</h2>
            <p className="text-xs text-muted-foreground">Escucha activa • Indagación profunda</p>
          </div>
        </div>
        <button
          onClick={handleTransferToHuman}
          disabled={isTransferring || messages.length < 4 || isProcessing}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 ${theme.bg}`}
          aria-label="Solicitar conexión con un maestro"
        >
          {isTransferring ? (
            <span className="animate-pulse">Conectando...</span>
          ) : (
            <>
              <span>👤</span> Conectar con un Maestro
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background" role="log" aria-live="polite" aria-label="Historial de conversación">
        {messages.map((msg: Message) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user'
                ? `${theme.bg} text-white rounded-br-none`
                : 'bg-secondary text-secondary-foreground rounded-bl-none border border-border'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className="text-[10px] opacity-70 mt-1 block text-right" suppressHydrationWarning>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-secondary/50 border border-border rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-3">
              <span className="text-xs text-muted-foreground italic">Ariel está leyendo y reflexionando...</span>
              <span className="flex gap-1">
                <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${theme.color.replace('text-', 'bg-')}`} style={{ animationDelay: '0ms' }} />
                <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${theme.color.replace('text-', 'bg-')}`} style={{ animationDelay: '150ms' }} />
                <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${theme.color.replace('text-', 'bg-')}`} style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        {typingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[85%] md:max-w-[70%] rounded-2xl rounded-bl-none px-4 py-3 text-sm leading-relaxed shadow-sm bg-secondary text-secondary-foreground border border-border">
              <p className="whitespace-pre-wrap">{displayedTypingText}<span className="animate-pulse">▌</span></p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs px-4 py-3 rounded-lg max-w-md text-center">
              <p className="font-semibold mb-1">No se pudo procesar el mensaje</p>
              <p>{error}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Cuéntame un poco más..."
            disabled={isProcessing || isTransferring}
            className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50"
            aria-label="Escribe tu mensaje"
          />
          <button
            type="submit"
            disabled={isProcessing || isTransferring || !input.trim()}
            className={`px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm ${theme.bg}`}
            aria-label="Enviar mensaje"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
