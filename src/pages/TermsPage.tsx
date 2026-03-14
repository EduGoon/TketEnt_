import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as organizerService from '../services/organizerService';

export default function TermsPage() {
  const { type } = useParams<{ type: string }>();
  const termType = (type?.toUpperCase() === 'ORGANIZER' ? 'ORGANIZER' : 'USER') as 'USER' | 'ORGANIZER';
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    organizerService.getTerms(termType)
      .then(resp => {
        const d = resp?.data ?? resp;
        setContent(d.content ?? '');
        setVersion(d.version ?? '1.0');
        setUpdatedAt(d.updatedAt ?? '');
      })
      .catch(() => setContent('Failed to load terms.'))
      .finally(() => setLoading(false));
  }, [termType]);

  // Simple markdown-like renderer
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 700, color: '#fff', marginBottom: 16, marginTop: 8 }}>{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 32, marginBottom: 10 }}>{line.slice(3)}</h2>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>{line.slice(2,-2)}</p>;
      if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
      // Handle inline bold
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, marginBottom: 6 }}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} style={{ color: 'rgba(255,255,255,0.8)' }}>{part.slice(2,-2)}</strong>
              : part
          )}
        </p>
      );
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap'); *{box-sizing:border-box;}`}</style>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,13,20,0.97)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontSize: 17, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display',serif", textDecoration: 'none' }}>✦ SparkVybzEnt</Link>
          <Link to="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← Back</Link>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '52px 20px 100px' }}>
        {/* Toggle between user and organizer terms */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 5, width: 'fit-content' }}>
          {(['USER', 'ORGANIZER'] as const).map(t => (
            <Link key={t} to={`/terms/${t.toLowerCase()}`} style={{ padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: termType === t ? 700 : 500, background: termType === t ? '#f0c040' : 'none', color: termType === t ? '#0a0d14' : 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' as const }}>
              {t === 'USER' ? 'User Terms' : 'Organizer Terms'}
            </Link>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 6, opacity: 1 - i * 0.15 }} />)}
          </div>
        ) : (
          <div style={{ background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '36px 32px' }}>
            {renderContent(content)}
            {(version || updatedAt) && (
              <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                {version && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Mono',monospace" }}>Version {version}</span>}
                {updatedAt && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Mono',monospace" }}>Last updated {new Date(updatedAt).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}