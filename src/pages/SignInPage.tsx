import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';

const GOOGLE_CLIENT_ID = '749314434069-dl7t8s3aaihq8pa4bfhlrfejhapk9fks.apps.googleusercontent.com';

const SignInPage: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const { login, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => {
      (window as any).google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      (window as any).google?.accounts.id.renderButton(
        document.getElementById('google-btn-signin'),
        { theme: 'outline', size: 'large', width: 356, text: 'signin_with', shape: 'rectangular' }
      );
    };
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setGLoading(true);
    setError('');
    const success = await loginWithGoogle(response.credential);
    if (success) {
      const stored = localStorage.getItem('Eventify_user');
      const u = stored ? JSON.parse(stored) : null;
      if (u?.role === 'ADMIN') navigate('/admin');
      else if (u?.role === 'ORGANIZER') navigate('/organizer/dashboard');
      else navigate(from, { replace: true });
    } else {
      setError('Google sign in failed. Please try again.');
    }
    setGLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required'); return; }
    const success = await login(email, password);
    if (success) {
      const stored = localStorage.getItem('Eventify_user');
      const u = stored ? JSON.parse(stored) : null;
      if (u?.role === 'ADMIN') navigate('/admin');
      else if (u?.role === 'ORGANIZER') navigate('/organizer/dashboard');
      else navigate(from, { replace: true });
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0a0d14', color:'#fff', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .auth-input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:13px 16px;font-size:14px;color:#fff;font-family:'DM Sans',sans-serif;outline:none;transition:border-color 0.25s,box-shadow 0.25s;}
        .auth-input::placeholder{color:rgba(255,255,255,0.22);}
        .auth-input:focus{border-color:rgba(240,192,64,0.5);box-shadow:0 0 0 3px rgba(240,192,64,0.07);}
        .auth-btn{width:100%;background:#f0c040;color:#0a0d14;border:none;border-radius:11px;padding:14px 24px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity 0.2s,transform 0.15s;}
        .auth-btn:hover:not(:disabled){opacity:0.87;transform:translateY(-1px);}
        .auth-btn:disabled{opacity:0.45;cursor:not-allowed;}
        .auth-link{color:#f0c040;text-decoration:none;font-weight:600;}
        .auth-link:hover{opacity:0.75;}
        .ghost-link{color:rgba(255,255,255,0.35);text-decoration:none;font-size:13px;}
        .ghost-link:hover{color:rgba(255,255,255,0.7);}
        .field-label{font-size:10px;letter-spacing:2px;color:rgba(240,192,64,0.6);text-transform:uppercase;font-family:'DM Mono',monospace;display:block;margin-bottom:8px;}
        .pass-toggle{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.3);font-size:12px;font-family:'DM Mono',monospace;padding:4px;}
        .pass-toggle:hover{color:rgba(255,255,255,0.65);}
        .or-divider{display:flex;align-items:center;gap:14px;margin:20px 0;}
        .or-divider::before,.or-divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.08);}
        .or-divider span{font-size:11px;color:rgba(255,255,255,0.25);font-family:'DM Mono',monospace;letter-spacing:1px;}
      `}</style>

      <div style={{ position:'absolute', top:'-10%', right:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(240,192,64,0.06) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-5%', left:'-8%', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(96,200,240,0.05) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1, animation:'fadeUp 0.5s ease forwards' }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <Link to="/" style={{ textDecoration:'none' }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'#f0c040', letterSpacing:-0.5 }}>✦ Eventify</span>
          </Link>
        </div>

        <div style={{ background:'linear-gradient(160deg,#141927,#0f1521)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'36px 32px 32px', boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ marginBottom:28 }}>
            <p style={{ fontSize:9, letterSpacing:4, color:'rgba(240,192,64,0.55)', textTransform:'uppercase', fontFamily:"'DM Mono',monospace", marginBottom:8 }}>Welcome back</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, letterSpacing:-0.5, lineHeight:1.1 }}>Sign In<span style={{ color:'#f0c040' }}>.</span></h1>
          </div>

          {/* Google Sign In */}
          {gLoading ? (
            <div style={{ width:'100%', height:44, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.15)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>Signing in with Google…</span>
            </div>
          ) : (
            <div id="google-btn-signin" />
          )}

          <div className="or-divider"><span>OR</span></div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <label htmlFor="email" className="field-label">Email Address</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" placeholder="you@example.com" required />
            </div>
            <div>
              <label htmlFor="password" className="field-label">Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPass ? 'text' : 'password'} id="password" value={password} onChange={e => setPassword(e.target.value)} className="auth-input" placeholder="••••••••" required style={{ paddingRight:64 }} />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(p => !p)}>{showPass ? 'HIDE' : 'SHOW'}</button>
              </div>
            </div>

            {error && (
              <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:9, padding:'10px 14px', fontSize:13, color:'#f87171', textAlign:'center' }}>{error}</div>
            )}

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop:24, paddingTop:22, borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>No account? <Link to="/signup" className="auth-link">Sign up</Link></p>
            <Link to="/" className="ghost-link">← Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
