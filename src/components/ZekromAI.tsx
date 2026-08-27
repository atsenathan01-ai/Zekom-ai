import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  RotateCcw,
  Plus,
  Clock,
  User,
  Bot,
} from "lucide-react";
import { ChatMessage } from "../types";
import { recordActivity } from "../lib/storage";

interface ZekromAIProps {
  onScoreUpdate: (points: number) => void;
}

const CHAT_STORAGE_KEY = "zekrom_chat_history_v3";

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome-msg",
  role: "assistant",
  content:
    "Bienvenue sur **ZEKROM IA**. Je suis votre partenaire de réflexion stratégique et d'architecture produit. Posez-moi vos questions, explorez des concepts ou développez vos idées les plus ambitieuses.",
  timestamp: Date.now(),
};

const SUGGESTED_PROMPTS = [
  "Donne-moi une idée de startup hors du commun",
  "Comment monétiser une application communautaire ?",
  "Conçois un jeu vidéo narratif sans graphismes",
  "Trouve 3 faiblesses critiques dans mon projet",
];

const ERROR_MESSAGE_FRENCH =
  "ZEKROM n'arrive pas à joindre son intelligence pour le moment. Vérifie ta connexion et réessaie.";

export default function ZekromAI({ onScoreUpdate }: ZekromAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
    } catch {
      return [INITIAL_MESSAGE];
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Erreur sauvegarde chat:", e);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, error]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);
    setLastFailedMessage(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 28000);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur serveur ${res.status}`);
      }

      const data = await res.json();
      const replyText =
        data.text ||
        "Je n'ai pas pu formuler de réponse précise. Peux-tu reformuler ?";

      const botMessage: ChatMessage = {
        id: "msg-" + Date.now() + "-ai",
        role: "assistant",
        content: replyText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
      recordActivity("chat", `Discussion : ${text.slice(0, 30)}...`, 15);
      onScoreUpdate(15);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("[ZEKROM AI Frontend] Chat error:", err);
      setLastFailedMessage(text);
      setError(ERROR_MESSAGE_FRENCH);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      setMessages((prev) => {
        if (
          prev.length > 0 &&
          prev[prev.length - 1].content === lastFailedMessage
        ) {
          return prev.slice(0, prev.length - 1);
        }
        return prev;
      });
      handleSendMessage(lastFailedMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content:
          "Nouvelle conversation démarrée. De quoi souhaites-tu parler aujourd'hui ?",
        timestamp: Date.now(),
      },
    ]);
    setError(null);
    setLastFailedMessage(null);
  };

  const handleClearChat = () => {
    if (window.confirm("Voulez-vous vraiment effacer tout l'historique ?")) {
      setMessages([INITIAL_MESSAGE]);
      setError(null);
      setLastFailedMessage(null);
      try {
        localStorage.removeItem(CHAT_STORAGE_KEY);
      } catch {}
    }
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-16 flex flex-col h-[calc(100vh-6.5rem)] min-h-[580px]">
      {/* En-tête du module */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#202330] shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#181C28] border border-[#273046] text-xs font-mono uppercase text-[#3B82F6] mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
            Intelligence Stratégique & Réflexion
          </div>
          <h1
            id="ai-view-title"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white"
          >
            ZEKROM AI
          </h1>
          <p id="ai-view-subtitle" className="text-xs sm:text-sm text-[#9CA3AF]">
            Une intelligence pour explorer et développer des idées.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="new-chat-btn"
            onClick={handleNewConversation}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-[#1D202D] hover:bg-[#272B3D] text-white border border-[#2B3042] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Nouvelle conversation"
          >
            <Plus className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="hidden sm:inline">Nouvelle conversation</span>
          </button>

          <button
            id="clear-chat-btn"
            onClick={handleClearChat}
            disabled={loading}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#181A22] hover:bg-[#202330] text-[#9CA3AF] hover:text-white border border-[#282C3C] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Effacer l'historique"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Effacer</span>
          </button>
        </div>
      </div>

      {/* Zone d'affichage des messages */}
      <div
        id="chat-messages-container"
        className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 rounded-2xl bg-[#14161E]/80 border border-[#232634] p-4 sm:p-6 mb-4 backdrop-blur-sm"
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar Assistant */}
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#191D2B] border border-[#2C344C] flex items-center justify-center text-[#3B82F6] shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              {/* Bulle de Message */}
              <div
                className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-[#FF5500] text-white rounded-br-sm shadow-md shadow-[#FF5500]/15"
                    : "bg-[#181B26] text-[#E5E7EB] border border-[#272B3B] rounded-bl-sm shadow-md"
                }`}
              >
                {/* Horodatage */}
                <div
                  className={`text-[10px] font-mono mb-1.5 flex items-center gap-1 ${
                    isUser ? "text-white/75 justify-end" : "text-[#8E95A8]"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(msg.timestamp)}</span>
                </div>

                {/* Rendu du texte */}
                <div className="whitespace-pre-wrap font-normal leading-relaxed space-y-2">
                  {msg.content}
                </div>

                {/* Bouton de copie pour l'assistant */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-[#252A3C] flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]">
                      ZEKROM AI
                    </span>
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="hover:text-white transition-colors flex items-center gap-1 p-1 rounded hover:bg-[#202536] cursor-pointer"
                      title="Copier la réponse"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copier la réponse</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Avatar Utilisateur */}
              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#232736] border border-[#33394E] flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-[#A0A8C0]" />
                </div>
              )}
            </motion.div>
          );
        })}

        {/* État de chargement "ZEKROM réfléchit..." */}
        <AnimatePresence>
          {loading && (
            <motion.div
              id="ai-loading-indicator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3 items-start justify-start"
            >
              <div className="w-8 h-8 rounded-xl bg-[#191D2B] border border-[#2C344C] flex items-center justify-center text-[#3B82F6] shrink-0 mt-0.5 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-[#181B26] border border-[#272B3B] rounded-2xl rounded-bl-sm p-4 text-sm text-[#9CA3AF] flex items-center gap-3 shadow-md">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce" />
                </div>
                <span className="text-xs font-medium tracking-wide text-[#E5E7EB]">
                  ZEKROM réfléchit...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bloc d'erreur avec bouton Réessayer */}
        <AnimatePresence>
          {error && (
            <motion.div
              id="ai-error-banner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>

              {lastFailedMessage && (
                <button
                  id="retry-ai-btn"
                  onClick={handleRetry}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réessayer</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions de Prompts */}
      <div className="mb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-mono text-[#6B7280] uppercase tracking-wider shrink-0 mr-1">
            Suggestions :
          </span>
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              id={`suggested-prompt-${i}`}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#181B26] hover:bg-[#202534] border border-[#272B3C] hover:border-[#3B82F6]/50 text-[#9CA3AF] hover:text-white transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Zone de Saisie */}
      <div className="relative rounded-2xl bg-[#171922] border border-[#262A3C] focus-within:border-[#3B82F6] focus-within:ring-1 focus-within:ring-[#3B82F6] transition-all p-2 flex items-end gap-2 shadow-xl">
        <textarea
          ref={inputRef}
          id="chat-input-textarea"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Posez une question ou explorez une idée avec ZEKROM IA..."
          className="flex-1 bg-transparent border-0 outline-none text-white placeholder-[#5A6275] text-sm sm:text-base p-2 resize-none disabled:opacity-50"
        />

        <button
          id="send-chat-btn"
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || loading}
          className={`p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            input.trim() && !loading
              ? "bg-[#FF5500] hover:bg-[#FF6B2B] text-white shadow-md shadow-[#FF5500]/20"
              : "bg-[#202330] text-[#555C70] cursor-not-allowed"
          }`}
          aria-label="Envoyer le message"
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="mt-2 text-center text-[10px] text-[#555C70]">
        Propulsé par Google Gemini • Persistance locale & sécurité des échanges
      </div>
    </div>
  );
}
