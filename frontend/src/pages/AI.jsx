import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { Send, Bot, User, RotateCcw, Copy, Check, Sparkles, Wind } from 'lucide-react';
import { sendAIMessage, getAISuggestions } from '../services/api';
import { AppContext } from '../context/AppContext';
import { formatTime } from '../utils/formatters';

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0ea5e9,#22c55e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bot size={14} color="white" />
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '8px 12px',
        background: 'var(--bg-surface-2)', borderRadius: '0 12px 12px 12px' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)',
            animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
        ))}
        <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:.5} 40%{transform:scale(1.2);opacity:1} }`}</style>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser  = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ display: 'flex', gap: 10, padding: '8px 16px', flexDirection: isUser ? 'row-reverse' : 'row' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%',
        background: isUser ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#0ea5e9,#22c55e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
        {isUser ? <User size={15} color="white" /> : <Bot size={15} color="white" />}
      </div>
      <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{ padding: '10px 14px',
          borderRadius: isUser ? '12px 0 12px 12px' : '0 12px 12px 12px',
          background: isUser ? 'var(--primary)' : 'var(--bg-surface-2)',
          color: isUser ? 'white' : 'var(--text-primary)',
          fontSize: 'var(--text-sm)', lineHeight: 1.65, boxShadow: 'var(--shadow-xs)',
          whiteSpace: 'pre-wrap' }}>
          {msg.content}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatTime(msg.timestamp)}</span>
          {!isUser && (
            <button className="btn btn-ghost"
              style={{ padding: '2px 6px', fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}
              onClick={handleCopy} aria-label="Copy message">
              {copied ? <Check size={10} color="var(--success)" /> : <Copy size={10} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIPage() {
  const { locationLabel } = useContext(AppContext);
  // derive city name from locationLabel (e.g. "Pune, Maharashtra" -> "Pune")
  const city = (locationLabel ?? 'Pune').split(',')[0].trim();

  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError]       = useState(null);
  const suggestions             = getAISuggestions();
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text) => {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;

    const userMsg = { id: Date.now(), role: 'user', content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const aiMsg = await sendAIMessage(content, city);
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setError(err.message ?? 'Failed to get response.');
      // Remove user message optimistically if AI failed
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }, [input, isTyping, city]);

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', height: 'calc(100vh - 140px)', minHeight: 500 }}>
      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg,#0ea5e9,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>AirHealth AI Assistant</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                Powered by Gemini ? Context: {city}
              </div>
            </div>
            {messages.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setMessages([])} aria-label="Clear conversation">
                <RotateCcw size={14} /> Clear
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 16, padding: 'var(--space-8)', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#0ea5e9,#22c55e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wind size={28} color="white" />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text-primary)', margin: '0 0 8px' }}>Ask about air quality</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 340 }}>
                    Powered by Gemini with live data context for {city}. Ask anything about air quality, health impacts, or pollutants.
                  </p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 480 }}>
                  {suggestions.slice(0, 4).map(s => (
                    <button key={s} className="btn btn-secondary btn-sm"
                      style={{ fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-full)' }}
                      onClick={() => sendMessage(s)}>{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map(msg => <Message key={msg.id} msg={msg} />)}
                {isTyping && <TypingIndicator />}
                {error && (
                  <div style={{ margin: '8px 16px', padding: '10px 14px', background: 'var(--danger-light)',
                    color: 'var(--danger-dark)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
                    {error}
                  </div>
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexShrink: 0 }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={`Ask about air quality in ${city}...`} rows={1} aria-label="Message input"
              style={{ flex: 1, resize: 'none', padding: '10px 12px', fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)', color: 'var(--text-primary)', background: 'var(--bg-surface-2)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none',
                lineHeight: 1.5, maxHeight: 120, overflowY: 'auto' }}
              onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.12)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border)';       e.target.style.boxShadow = 'none'; }} />
            <button className="btn btn-primary btn-md" onClick={() => sendMessage()} disabled={!input.trim() || isTyping}
              aria-label="Send message" style={{ alignSelf: 'flex-end', padding: '10px 16px' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions sidebar */}
      <div className="ai-suggestions-panel" style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>Suggested Questions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => sendMessage(s)} disabled={isTyping}
                style={{ padding: '8px 10px', background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                  textAlign: 'left', cursor: 'pointer', lineHeight: 1.4, transition: 'all var(--transition-fast)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
