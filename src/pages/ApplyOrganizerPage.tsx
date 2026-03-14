import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';
import * as organizerService from '../services/organizerService';

export default function ApplyOrganizerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [existing, setExisting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ organizationName: '', bio: '', phone: user?.phone ?? '', socialLink: '', experience: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    organizerService.getMyApplication()
      .then(resp => setExisting(resp?.data ?? resp))
      .catch(() => setExisting(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organizationName || !form.bio || !form.phone) {
      setError('Organization name, bio and phone are required.');
      return;
    }
    setSubmitting(true); setError('');
    try {
      await organizerService.submitApplication(form);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally { setSubmitting(false); }
  };

  const S = {
    page:  { minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" } as React.CSSProperties,
    card:  { background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 32 } as React.CSSProperties,
    label: { fontSize: 9, letterSpacing: 3, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase' as const, fontFamily: "'DM Mono',monospace", marginBottom: 6, display: 'block' },
    input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#fff', fontFamily: "'DM Sans',sans-serif", outline: 'none', width: '100%' } as React.CSSProperties,
    btn:   { background: '#f0c040', color: '#0a0d14', border: 'none', borderRadius: 9, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif', transition: 'opacity 0.2s" } as React.CSSProperties,
  };

  const STATUS_INFO: any = {
    PENDING:  { color: '#f0c040', msg: 'Your application is under review. We\'ll email you once a decision is made.' },
    APPROVED: { color: '#22c55e', msg: 'Your application was approved! You now have access to the organizer dashboard.' },
    REJECTED: { color: '#ef4444', msg: 'Your application was not approved at this time.' },
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; }
        input:focus, textarea:focus { border-color: rgba(240,192,64,0.5) !important; }
      `}</style>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,13,20,0.97)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontSize: 18, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display',serif", textDecoration: 'none' }}>✦ TketEnt</Link>
          <Link to="/account" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← My Account</Link>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '52px 24px 80px' }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(240,192,64,0.6)', textTransform: 'uppercase', fontFamily: "'DM Mono',monospace", marginBottom: 10 }}>Grow on TketEnt</p>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, marginBottom: 12, lineHeight: 1.1 }}>
          Become an Organizer<span style={{ color: '#f0c040' }}>.</span>
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: 40, maxWidth: 520 }}>
          Create and sell tickets for your events directly on TketEnt. Fill in the form below and our team will review your application.
        </p>

        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading…</p>
        ) : existing ? (
          <div style={S.card}>
            <p style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'DM Mono',monospace", marginBottom: 12 }}>Application Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: STATUS_INFO[existing.status]?.color, fontFamily: "'DM Mono',monospace" }}>{existing.status}</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{STATUS_INFO[existing.status]?.msg}</p>
            {existing.adminNote && (
              <p style={{ marginTop: 14, fontSize: 13, color: 'rgba(239,68,68,0.7)', fontStyle: 'italic' }}>"{existing.adminNote}"</p>
            )}
            {existing.status === 'APPROVED' && (
              <button style={{ ...S.btn, marginTop: 24 }} onClick={() => navigate('/organizer/dashboard')}>Go to Organizer Dashboard →</button>
            )}
          </div>
        ) : submitted ? (
          <div style={{ ...S.card, textAlign: 'center', padding: '52px 32px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, marginBottom: 12 }}>Application Submitted!</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>We'll review your application and send you an email once a decision has been made.</p>
            <Link to="/" style={{ display: 'inline-block', marginTop: 28, fontSize: 13, color: '#f0c040', textDecoration: 'none', fontFamily: "'DM Mono',monospace", letterSpacing: 1.5 }}>Back to Home →</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={S.label}>Organization / Event Brand Name *</label>
              <input style={S.input} value={form.organizationName} onChange={e => setForm(p => ({ ...p, organizationName: e.target.value }))} placeholder="e.g. Nairobi Nights Events" />
            </div>
            <div>
              <label style={S.label}>Bio — Tell us about yourself *</label>
              <textarea style={{ ...S.input, minHeight: 100, resize: 'vertical' } as any} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Who are you and what kind of events do you organize?" />
            </div>
            <div>
              <label style={S.label}>Phone Number *</label>
              <input style={S.input} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. 0712345678" />
            </div>
            <div>
              <label style={S.label}>Social Media Link</label>
              <input style={S.input} value={form.socialLink} onChange={e => setForm(p => ({ ...p, socialLink: e.target.value }))} placeholder="Instagram, Twitter, Facebook, etc." />
            </div>
            <div>
              <label style={S.label}>Past Experience</label>
              <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' } as any} value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} placeholder="Describe any events you've organized before (optional)" />
            </div>

            {error && <p style={{ fontSize: 13, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px' }}>{error}</p>}

            <button type="submit" style={S.btn} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Application'}</button>
          </form>
        )}
      </main>
    </div>
  );
}