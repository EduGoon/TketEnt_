import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utilities/AuthContext';

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { name, email, password, confirmPassword } = formData;
    if (!name || !email || !password || !confirmPassword || !formData.phone) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const [firstName, ...lastParts] = name.trim().split(' ');
    const lastName = lastParts.join(' ') || '';

    const success = await signup({ email, password, firstName, lastName, phone: formData.phone });
    if (success) {
      navigate('/');
    } else {
      setError('Failed to create account');
    }
  };

  const passwordStrength = (() => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][passwordStrength];
  const strengthColor = ['', '#f87171', '#fb923c', '#f0c040', '#86efac', '#4ade80'][passwordStrength];

  return (
    <div style={{ minHeight:'100vh', background:'#0a0d14', color:'#fff', fontFamily:"'DM Sans', 'Helvetica Neue', sans-serif", display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px', position:'relative', overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 13px 16px;
          font-size: 14px; color: #fff;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.22); }
        .auth-input:focus {
          border-color: rgba(240,192,64,0.5);
          box-shadow: 0 0 0 3px rgba(240,192,64,0.07);
        }

        .auth-btn {
          width: 100%; background: #f0c040; color: #0a0d14;
          border: none; border-radius: 11px; padding: 14px 24px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.3px;
          transition: opacity 0.2s, transform 0.15s;
        }
        .auth-btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .auth-link { color: #f0c040; text-decoration: none; font-weight: 600; transition: opacity 0.2s; }
        .auth-link:hover { opacity: 0.75; }

        .ghost-link { color: rgba(255,255,255,0.35); text-decoration: none; font-size: 13px; transition: color 0.2s; }
        .ghost-link:hover { color: rgba(255,255,255,0.7); }

        .field-label {
          font-size: 10px; letter-spacing: 2px; color: rgba(240,192,64,0.6);
          text-transform: uppercase; font-family: 'DM Mono', monospace;
          display: block; margin-bottom: 8px;
        }

        .pass-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3); font-size: 11px;
          font-family: 'DM Mono', monospace; transition: color 0.2s; letter-spacing: 0.5px;
          padding: 4px;
        }
        .pass-toggle:hover { color: rgba(255,255,255,0.65); }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 480px) { .two-col { grid-template-columns: 1fr; } }
      `}</style>

      {/* Background glows */}
      <div style={{ position:'absolute', top:'-8%', right:'-6%', width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle,rgba(240,192,64,0.06) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-5%', left:'-8%', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(96,200,240,0.05) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:720, height:720, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.025)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', border:'1px dashed rgba(240,192,64,0.04)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:460, position:'relative', zIndex:1, animation:'fadeUp 0.5s ease forwards' }}>

        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <Link to="/" style={{ textDecoration:'none' }}>
            <span style={{ fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:700, color:'#f0c040', letterSpacing:-0.5 }}>✦ SparkVybzEnt</span>
          </Link>
        </div>

        {/* Panel */}
        <div style={{ background:'linear-gradient(160deg,#141927,#0f1521)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'36px 32px 32px', boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}>

          <div style={{ marginBottom:28 }}>
            <p style={{ fontSize:9, letterSpacing:4, color:'rgba(240,192,64,0.55)', textTransform:'uppercase', fontFamily:"'DM Mono', monospace", marginBottom:8 }}>Create account</p>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:30, fontWeight:700, letterSpacing:-0.5, lineHeight:1.1 }}>
              Join Us<span style={{ color:'#f0c040' }}>.</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* Name + Phone row */}
            <div className="two-col">
              <div>
                <label htmlFor="name" className="field-label">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="auth-input" placeholder="Stan Kroenke" required />
              </div>
              <div>
                <label htmlFor="phone" className="field-label">Phone</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="auth-input" placeholder="+254…" required />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="field-label">Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="auth-input" placeholder="you@example.com" required />
            </div>

            <div>
              <label htmlFor="password" className="field-label">Password</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} id="password" name="password"
                  value={formData.password} onChange={handleChange}
                  className="auth-input" placeholder="Min. 6 characters" required
                  style={{ paddingRight:64 }}
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(p => !p)}>
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {/* Strength bar */}
              {formData.password && (
                <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ flex:1, height:3, borderRadius:2, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                    <div style={{ width:`${(passwordStrength / 5) * 100}%`, height:'100%', background:strengthColor, borderRadius:2, transition:'width 0.3s, background 0.3s' }} />
                  </div>
                  <span style={{ fontSize:10, color:strengthColor, fontFamily:"'DM Mono', monospace", letterSpacing:0.5, minWidth:60 }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="field-label">Confirm Password</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'} id="confirmPassword" name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange}
                  className="auth-input" placeholder="Repeat password" required
                  style={{
                    paddingRight:64,
                    borderColor: formData.confirmPassword
                      ? formData.password === formData.confirmPassword
                        ? 'rgba(74,222,128,0.4)'
                        : 'rgba(248,113,113,0.4)'
                      : 'rgba(255,255,255,0.1)',
                  }}
                />
                <button type="button" className="pass-toggle" onClick={() => setShowConfirm(p => !p)}>
                  {showConfirm ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:9, padding:'10px 14px', fontSize:13, color:'#f87171', textAlign:'center' }}>
                {error}
              </div>
            )}

            <button type="submit" className="auth-btn" disabled={isLoading} style={{ marginTop:4 }}>
              {isLoading ? 'Creating Account…' : 'Create Account →'}
            </button>
          </form>

          <div style={{ marginTop:24, paddingTop:22, borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>
              Already have an account?{' '}
              <Link to="/signin" className="auth-link">Sign in</Link>
            </p>
            <Link to="/" className="ghost-link">← Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;