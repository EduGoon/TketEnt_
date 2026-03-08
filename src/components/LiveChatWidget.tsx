import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../services/api';

const LiveChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await apiFetch('/chat/history');
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        setMessages([]);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      await apiFetch('/chat/send', {
        method: 'POST',
        body: { message: input },
      });
      setMessages([...messages, { sender: 'You', message: input, createdAt: new Date().toISOString() }]);
      setInput('');
    } catch {
      // handle error
    }
    setSending(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, width: 340, background: '#111827', color: '#fff', borderRadius: 14, boxShadow: '0 6px 24px rgba(0,0,0,0.45)', zIndex: 9999 }}>
      <div style={{ padding: '12px 18px', borderBottom: '1px solid #222', fontWeight: 700, color: '#22c55e', fontSize: 18 }}>Live Support Chat</div>
      <div style={{ maxHeight: 260, overflowY: 'auto', padding: '12px 18px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, color: msg.sender === 'You' ? '#f0c040' : '#22c55e', fontSize: 14 }}>{msg.sender}</div>
            <div style={{ color: '#fff', fontSize: 14 }}>{msg.message}</div>
            <div style={{ color: '#888', fontSize: 11 }}>{new Date(msg.createdAt).toLocaleString()}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: '12px 18px', borderTop: '1px solid #222' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, borderRadius: 8, border: '1px solid #444', padding: 8, fontSize: 15 }}
        />
        <button type="submit" disabled={sending} style={{ background:'#22c55e', color:'#0a0d14', border:'none', borderRadius:8, padding:'8px 16px', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Send</button>
      </form>
    </div>
  );
};

export default LiveChatWidget;
