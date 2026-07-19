import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Info, AlertCircle, BookOpen, Globe } from 'lucide-react';
import type { ChatMessage } from '../../../shared/types';

interface ConciergeProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
}

export default function Concierge({ currentLang, onLanguageChange }: ConciergeProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: getWelcomeMessage(currentLang),
      timestamp: Date.now(),
      citations: ['System Initialization']
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Update welcome message if language changes and only welcome is present
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: getWelcomeMessage(currentLang),
          timestamp: Date.now(),
          citations: ['System Initialization']
        }
      ]);
    }
  }, [currentLang]);

  function getWelcomeMessage(lang: string) {
    switch (lang) {
      case 'es': return '¡Hola! Soy su Asistente de IA para el MetLife Stadium. Pregúnteme sobre accesibilidad, políticas de bolsas, el calendario de partidos u opciones de transporte.';
      case 'fr': return 'Bonjour! Je suis votre assistant IA pour le MetLife Stadium. Posez-moi des questions sur l\'accessibilité, la politique des sacs, les matchs ou le transport.';
      case 'ar': return 'مرحبًا! أنا المساعد الذكي لملعب MetLife. يمكنك سؤالي عن إمكانية الوصول، سياسة الحقائب، جدول المباريات، أو خيارات النقل.';
      case 'hi': return 'नमस्ते! मैं मेटलाइफ स्टेडियम के लिए आपका एआई सहायक हूँ। मुझसे बैग नीति, मैच शेड्यूल, सुगम रास्तों या परिवहन के बारे में पूछें।';
      case 'pt': return 'Olá! Sou o seu assistente de IA do MetLife Stadium. Pergunte-me sobre acessibilidade, política de bolsas, calendário de jogos ou transporte.';
      default: return 'Hello! I am your StadiumSense AI Concierge. Ask me about accessibility routing, bag policies, match schedules, or eco-friendly transportation option.';
    }
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setLoading(true);

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatHistory,
          language: currentLang
        })
      });

      if (!res.ok) {
        throw new Error('API server returned error');
      }

      const data = await res.json();
      
      const modelMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        content: data.content,
        timestamp: Date.now(),
        citations: data.citations || ['Stadium sense RAG Database']
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      // Fail gracefully with a cached query matching offline logic
      const fallbackText = `[Offline Mode] Sorry, I encountered a communication error. Here is a localized guideline answer: We allow clear plastic bags not exceeding 12x6x12 inches inside the stadium. Ramps are fully accessible at Gates A, B, and C.`;
      
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'model',
          content: fallbackText,
          timestamp: Date.now(),
          citations: ['Local Fallback Cache']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mock Voice input trigger
  const toggleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate speech detection
      setTimeout(() => {
        setInput("How do I get to Gate C accessible entrance?");
        setIsListening(false);
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* Chat Widget Panel */}
      <div className="lg:col-span-3 glass-card flex flex-col justify-between overflow-hidden h-full">
        {/* Banner notifying local execution */}
        <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Notice: Running in Grounded retrieval mode. If Gemini API is unreachable, local cached context is utilized.</span>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar placeholder */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {m.role === 'user' ? 'U' : 'AI'}
              </div>
              <div>
                <div className={`p-3.5 rounded-xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-gray-800/80 text-gray-100 border border-gray-700/50 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
                {/* Citations drawer */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-400 pl-1.5">
                    <Info className="w-3 h-3 text-emerald-400" />
                    <span>Citations: {m.citations.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 mr-auto max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs animate-pulse">
                AI
              </div>
              <div className="p-3 bg-gray-800 border border-gray-700 rounded-xl rounded-tl-none text-sm text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-800 bg-gray-900/40 flex items-center gap-3">
          {/* Language shortcuts */}
          <div className="flex items-center gap-1.5 border-r border-gray-800 pr-3">
            <button
              type="button"
              onClick={() => onLanguageChange(currentLang === 'en' ? 'es' : 'en')}
              className="text-xs px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 flex items-center gap-1 hover:text-white"
              title="Toggle English/Spanish"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase font-semibold">{currentLang}</span>
            </button>
          </div>

          <input
            type="text"
            className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
            placeholder="Type your question about MetLife stadium..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            aria-label="Concierge query text input"
          />

          {/* Voice active recorder indicator */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-lg border transition-all relative ${
              isListening 
                ? 'bg-red-600/20 text-red-500 border-red-500 animate-pulse' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
            }`}
            title={isListening ? "Listening - Click to stop" : "Speak to Concierge (Voice-Ready)"}
            aria-label="Toggle voice input microphone"
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>

          <button
            type="submit"
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white rounded-lg transition-colors flex items-center justify-center"
            disabled={loading || !input.trim()}
            aria-label="Send message to AI Concierge"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Grounded context sidebar panel */}
      <div className="glass-card p-4 overflow-y-auto h-full flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Retrieval Facts</h2>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          The AI Concierge is strictly bounded by the following vetted database. Attempts to override these parameters are discarded by the sanitization boundary.
        </p>
        <div className="space-y-3 mt-2 text-xs">
          <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
            <h4 className="font-bold text-white mb-1.5">Bag Limits</h4>
            <p className="text-gray-400 leading-normal">
              Only clear bags not exceeding 12" x 6" x 12" allowed inside. No exceptions.
            </p>
          </div>
          <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
            <h4 className="font-bold text-white mb-1.5">Entrances (Gates A-D)</h4>
            <p className="text-gray-400 leading-normal">
              Gate B is fully flat grade and recommended for wheelchairs. Elevator tower EL-B is adjacent.
            </p>
          </div>
          <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
            <h4 className="font-bold text-white mb-1.5">Transit Connections</h4>
            <p className="text-gray-400 leading-normal">
              NJ Transit runs directly from Secaucus Junction to Meadowlands Station (Meadowlands Rail).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
