import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../services/api';

const LiveChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
useEffect(() => {
    async function loadHistory() {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const data = await apiFetch('/user/chat/history');
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        setMessages([]);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (!open && messages.length > 0) setUnread(n => n + 1);
  }, [messages.length]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      await apiFetch('/user/chat/send', {
        method: 'POST',
        body: { content: input, sender: 'user' },
      });
      setMessages([...messages, { sender: 'You', content: input, createdAt: new Date().toISOString() }]);
      setInput('');
    } catch {
      // handle error
    }
    setSending(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400&display=swap');

        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatSlideDown {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(16px) scale(0.97); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .chat-fab {
  position: fixed; bottom: 28px; right: 28px; z-index: 9999;
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #f0c040, #c8920a);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 28px rgba(240,192,64,0.35), 0 2px 8px rgba(0,0,0,0.5);
  transition: box-shadow 0.25s, transform 0.2s;
  will-change: transform;
  isolation: isolate;
}
.chat-fab:hover {
  box-shadow: 0 12px 36px rgba(240,192,64,0.5), 0 4px 12px rgba(0,0,0,0.5);
  transform: scale(1.08);
}
        .chat-fab:hover {
          box-shadow: 0 12px 36px rgba(240,192,64,0.5), 0 4px 12px rgba(0,0,0,0.5);
          transform: scale(1.08);
          animation: none;
        }
        .chat-fab:active { transform: scale(0.95); }

        .pulse-ring {
          position: absolute; inset: -4px; border-radius: 50%;
          border: 2px solid rgba(240,192,64,0.5);
          animation: pulse-ring 2.5s ease-out infinite;
        }

        .chat-window {
          position: fixed; bottom: 92px; right: 28px; z-index: 9998;
          width: 340px;
          background: linear-gradient(160deg, #141927 0%, #0e1320 100%);
          border: 1px solid rgba(240,192,64,0.18);
          border-radius: 18px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04);
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }
        .chat-window.entering { animation: chatSlideUp 0.3s cubic-bezier(0.22,1,0.36,1) forwards; }
        .chat-window.exiting  { animation: chatSlideDown 0.2s ease forwards; }

        .chat-header {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.02);
        }

        .chat-messages {
          max-height: 256px; overflow-y: auto;
          padding: 14px 18px; display: flex; flex-direction: column; gap: 12px;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .msg-bubble {
          max-width: 86%; padding: 9px 13px; border-radius: 12px; font-size: 13px; line-height: 1.55;
        }
        .msg-you {
          align-self: flex-end;
          background: rgba(240,192,64,0.12); border: 1px solid rgba(240,192,64,0.2);
          color: #fff; border-bottom-right-radius: 4px;
        }
        .msg-other {
          align-self: flex-start;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8); border-bottom-left-radius: 4px;
        }

        .chat-input {
          flex: 1; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 9px;
          padding: 9px 13px; font-size: 13px; color: #fff;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.2s;
        }
        .chat-input::placeholder { color: rgba(255,255,255,0.22); }
        .chat-input:focus { border-color: rgba(240,192,64,0.45); }

        .chat-send {
          background: #f0c040; color: #0a0d14; border: none;
          border-radius: 9px; padding: 9px 16px; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s, transform 0.15s; white-space: nowrap; flex-shrink: 0;
        }
        .chat-send:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
        .chat-send:disabled { opacity: 0.45; cursor: not-allowed; }

        .close-btn {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); border-radius: 7px;
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 14px; transition: all 0.2s; flex-shrink: 0;
          font-family: monospace;
        }
        .close-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .unread-badge {
          position: absolute; top: -3px; right: -3px;
          background: #f87171; color: #fff; border-radius: 50%;
          width: 18px; height: 18px; font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace; border: 2px solid #0a0d14;
        }

        .online-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4ade80; box-shadow: 0 0 6px rgba(74,222,128,0.6);
          flex-shrink: 0;
        }
      `}</style>

      {/* ── Chat Window ─────────────────────────────────────────────────── */}
      {open && (
        <div className={`chat-window entering`}>
          {/* Header */}
          <div className="chat-header">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#f0c040,#c8920a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                ✦
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#fff', lineHeight:1.2 }}>Support</p>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div className="online-dot" />
                  <p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontFamily:"'DM Mono', monospace", letterSpacing:0.5 }}>Online</p>
                </div>
              </div>
            </div>
            <button className="close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.25)', fontFamily:"'DM Mono', monospace", fontStyle:'italic' }}>
                  No messages yet.
                </p>
              </div>
            )}
            {messages.map((msg, idx) => {
              const isMe = msg.sender === 'You' || msg.sender === 'user';
              return (
                <div key={idx} style={{ display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap:3 }}>
                  <span style={{ fontSize:9, letterSpacing:1.5, color:'rgba(255,255,255,0.28)', fontFamily:"'DM Mono', monospace", textTransform:'uppercase', paddingLeft:2, paddingRight:2 }}>
                    {isMe ? 'You' : msg.sender}
                  </span>
                  <div className={`msg-bubble ${isMe ? 'msg-you' : 'msg-other'}`}>
                    {msg.content ?? msg.message}
                  </div>
                  <span style={{ fontSize:9, color:'rgba(255,255,255,0.18)', fontFamily:"'DM Mono', monospace", paddingLeft:2, paddingRight:2 }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{ display:'flex', gap:8, padding:'12px 14px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            <input
              type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type a message…" className="chat-input"
              autoFocus
            />
            <button type="submit" disabled={sending || !input.trim()} className="chat-send">
              {sending ? '…' : '↑'}
            </button>
          </form>
        </div>
      )}

      {/* ── FAB Toggle ──────────────────────────────────────────────────── */}
<button className="chat-fab" onClick={() => setOpen(o => !o)} title="Chat with us">
          {unread > 0 && !open && (
          <span className="unread-badge">{unread > 9 ? '9+' : unread}</span>
        )}
        <div className="pulse-ring" />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0d14" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {open
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>
          }
        </svg>
      </button>
    </>
  );
};

export default LiveChatWidget;