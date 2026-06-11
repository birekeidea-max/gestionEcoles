import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  HelpCircle, 
  ArrowRight,
  MessageSquare,
  BookmarkCheck,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export function AIGuideAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        role: 'assistant',
        text: `### 🇨🇩 Bienvenue sur le SyGEC-RDC !

Je suis votre **Assistant Guide Virtuel**. Mon rôle est de vous guider à travers toutes les fonctionnalités administratives et pédagogiques de la plateforme nationale de l'enseignement primaire et secondaire (SyGEC-RDC).

**Que souhaitez-vous faire aujourd'hui ?** Sélectionnez l'une des suggestions ci-dessous ou posez-moi directement votre question en bas.`
      }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickSuggestions = [
    { label: "📑 Certifier les bulletins", query: "Comment certifier les bulletins en PDF ?" },
    { label: "💳 Reçus financiers QR", query: "Comment enregistrer un paiement et imprimer/scanner un reçu QR ?" },
    { label: "📡 Mode hors-ligne USB", query: "Comment fonctionne le mode hors-ligne et l'échange USB ?" },
    { label: "📚 Outils pédagogiques", query: "Comment utiliser la fiche de préparation et cotation pour les profs ?" },
    { label: "📝 Gérer les présences", query: "Comment faire l'appel et gérer les présences des élèves ?" }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        let errMsg = 'Erreur de communication avec le serveur.';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.text
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error("Error at AI Guide communication:", error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Oups !** Une erreur s'est produite lors de la connexion avec le Ministère de l'EPST à Kinshasa.\n\n*Détails : ${error.message}*\n\nVeuillez vérifier votre configuration ou vous assurer que le serveur Express tourne bien.`
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Helper to render basic markdown bold/list formatting manually for a crisp native UI
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-xs font-black uppercase text-slate-900 tracking-tight mt-3 mb-1 font-sans">
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-sm font-black uppercase text-indigo-950 tracking-tight mt-4 mb-1.5 font-sans">
            {trimmed.replace('## ', '')}
          </h3>
        );
      }
      
      // Unordered lists
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const itemText = trimmed.substring(2);
        return (
          <div key={idx} className="flex items-start gap-1 text-[11px] text-slate-700 font-medium pl-1.5 py-0.5 leading-normal">
            <span className="text-[#007FFF] shrink-0 font-bold">•</span>
            <span>{parseInlineBold(itemText)}</span>
          </div>
        );
      }

      // Ordered lists (numbered)
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        const num = numMatch[1];
        const itemText = numMatch[2];
        return (
          <div key={idx} className="flex items-start gap-1 pb-1 py-0.5 text-[11px] text-slate-700 font-medium leading-normal pl-1">
            <span className="text-indigo-950 font-bold font-mono text-[10px] bg-slate-100 border border-slate-200 w-4 h-4 rounded-full flex items-center justify-center shrink-0">{num}</span>
            <span className="flex-1 pt-0.5">{parseInlineBold(itemText)}</span>
          </div>
        );
      }

      // Empty lines
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      // Default paragraph
      return (
        <p key={idx} className="text-[11.5px] leading-relaxed text-slate-650 font-medium font-sans mb-1 pb-0.5">
          {parseInlineBold(trimmed)}
        </p>
      );
    });
  };

  // Parsing inline bold **text** or code `code`
  const parseInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-slate-900">{part.substring(2, part.length - 2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1 py-0.5 bg-slate-100 border border-slate-200 text-indigo-950 rounded text-[10px] font-mono font-bold leading-none">{part.substring(1, part.length - 1)}</code>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Sparkly Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto" id="ai-guide-fab-container">
        
        {/* Short welcome bubble popup if not open and first render */}
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white text-slate-800 text-[10.5px] font-bold px-3 py-2 rounded-2xl shadow-xl hover:shadow-2xl border border-slate-200 animate-bounce cursor-pointer group hover:border-[#007FFF]/40 transition-all"
          >
            <span className="text-base">🇨🇩</span>
            <span className="text-slate-600 font-medium font-sans">Besoin d'aide ? Je suis votre guide !</span>
            <ArrowRight className="w-3 h-3 text-[#007FFF] group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Main Floating Trigger Action Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-4 rounded-full shadow-2xl transition-all cursor-pointer transform hover:scale-105 duration-300 ${
            isOpen 
              ? 'bg-slate-900 hover:bg-slate-850 text-white' 
              : 'bg-gradient-to-r from-[#007FFF] to-indigo-650 text-white hover:brightness-105 border-b-4 border-b-blue-800'
          }`}
          id="ai-guide-toggle-btn"
        >
          {isOpen ? (
            <X className="w-6 h-6 animate-in spin-in duration-300" />
          ) : (
            <div className="relative">
              <Bot className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Main Chat Panel Sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-y-0 right-0 w-full sm:w-[410px] bg-slate-50/98 backdrop-blur-md shadow-2xl border-l border-slate-200 z-40 flex flex-col animate-in slide-in-from-right duration-300"
          id="ai-guide-panel"
        >
          
          {/* Header block with Ministry of EPST branding */}
          <div className="bg-gradient-to-r from-[#007FFF] to-indigo-950 text-white p-5 relative overflow-hidden flex items-center justify-between border-b-4 border-yellow-400">
            {/* Background design accents */}
            <div className="absolute right-0 bottom-0 text-[100px] font-black pointer-events-none opacity-5 font-mono select-none">
              EPST
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
                <Bot className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-black uppercase tracking-wider font-sans text-yellow-300 flex items-center gap-1.5">
                  Guidance SyGEC-RDC <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                </h3>
                <span className="text-[10px] text-slate-200 font-mono tracking-wide uppercase font-semibold">
                  Mascotte Virtuelle d'Accompagnement
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-xl transition-all text-slate-100 hover:text-white cursor-pointer relative z-10"
              title="Fermer le guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick status message banner */}
          <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 text-[10px] text-indigo-950 font-bold flex items-center gap-1.5 select-none text-left shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Direction Nationale de la Régie Scolaire de l’EPST RDC</span>
          </div>

          {/* Chat Messages and Scroll container */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 text-left scrollbar-thin">
            
            {messages.map((message) => {
              const isAssistant = message.role === 'assistant';
              return (
                <div 
                  key={message.id} 
                  className={`flex gap-2.5 max-w-[85%] animate-in fade-in duration-300 ${
                    isAssistant ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'
                  }`}
                >
                  {/* Icon or Avatar */}
                  <div className={`p-1.5 rounded-xl border shrink-0 ${
                    isAssistant 
                      ? 'bg-indigo-50 border-indigo-150 text-[#007FFF]' 
                      : 'bg-[#007FFF] border-blue-600 text-white'
                  }`}>
                    {isAssistant ? <Bot className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message Bubble text content */}
                  <div className={`p-4 rounded-3xl text-xs font-semibold ${
                    isAssistant 
                      ? 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs' 
                      : 'bg-indigo-950 text-white rounded-tr-xs'
                  }`}>
                    {isAssistant ? (
                      <div className="space-y-1">
                        {formatMarkdown(message.text)}
                      </div>
                    ) : (
                      <p className="leading-relaxed font-sans">{message.text}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Simulated typing loading dots */}
            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto items-start animate-pulse">
                <div className="p-1.5 bg-indigo-50 border border-indigo-150 text-[#007FFF] rounded-xl shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-4 bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-3xl rounded-tl-xs flex items-center gap-2">
                  <span className="text-[11.5px] font-sans font-semibold text-slate-400">Recherche d'assistance...</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#007FFF] rounded-full animate-bounce duration-300" />
                    <span className="w-1.5 h-1.5 bg-[#007FFF] rounded-full animate-bounce duration-300 delay-75" />
                    <span className="w-1.5 h-1.5 bg-[#007FFF] rounded-full animate-bounce duration-300 delay-150" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips layout inside chat */}
          <div className="border-t border-slate-150 bg-white/60 p-3 space-y-1 rounded-t-2xl shrink-0">
            <span className="text-[9.5px] uppercase font-mono tracking-wider text-slate-400 font-extrabold flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500 fill-amber-100" />
              Suggestions fréquentes :
            </span>
            <div className="flex flex-wrap gap-1.5 py-1">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSendMessage(suggestion.query)}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[10px] font-semibold py-1.5 px-3 rounded-full transition-all cursor-pointer text-left hover:scale-98"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Message Input bar */}
          <form 
            onSubmit={handleSubmit}
            className="p-4 bg-white border-t border-slate-200 flex gap-2 shrink-0 items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Posez votre question sur le SyGEC-RDC..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#007FFF] focus:bg-white text-slate-800 transition-all font-sans"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                inputValue.trim() && !isLoading
                  ? 'bg-[#007FFF] text-white hover:bg-[#006ACC]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
