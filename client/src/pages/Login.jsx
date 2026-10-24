import React, { useState } from 'react';
import { Gift, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function LoginPage({ mode, setMode, onSubmit, onRequestCode, onVerifyCode, error, loading }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [notice, setNotice] = useState('');

  const sendCode = async event => {
    event?.preventDefault();
    setNotice('');
    try {
      const result = await onRequestCode(email);
      setCodeSent(true);
      setNotice(result.message);
    } catch {}
  };

  const verifyCode = event => {
    event.preventDefault();
    onVerifyCode(email, code);
  };

  const switchMode = next => {
    setMode(next);
    setCodeSent(false);
    setCode('');
    setNotice('');
  };

  return <main className="login-screen">
    <div className="login-orb login-orb-one"/><div className="login-orb login-orb-two"/><div className="login-orb login-orb-three"/>
    <section className="login-glass">
      <div className="login-icon"><Gift size={22}/></div>
      <div className="login-eyebrow">YOUR PERSONAL CELEBRATION SPACE</div>
      <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="login-subtitle">{mode === 'login' ? 'We’ll email you a one-time sign-in code.' : 'Start keeping every special date close.'}</p>
      <form onSubmit={mode === 'register' ? onSubmit : codeSent ? verifyCode : sendCode}>
        {mode === 'register' && <label>Your name<input name="name" placeholder="e.g. Alex Morgan" required minLength="2" autoComplete="name"/></label>}
        <label>Email address<input name="email" type="email" placeholder="you@example.com" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)}/></label>
        {mode === 'register' && <label>Password<input name="password" type="password" placeholder="At least 8 characters" required minLength="8" autoComplete="new-password"/></label>}
        {mode === 'login' && codeSent && <label>One-time code<input name="code" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" required minLength="6" maxLength="6" pattern="[0-9]{6}" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}/></label>}
        {error && <div className="form-error" role="alert">{error}</div>}
        {notice && <div className="form-success" role="status">{notice}</div>}
        <button className="primary-btn login-submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'register' ? 'Create account' : codeSent ? 'Verify code' : 'Email me a sign-in code'}<ArrowUpRight size={18}/></button>
      </form>
      {mode === 'login' && codeSent && <div className="auth-switch"><button type="button" onClick={() => { setCode(''); sendCode(); }} disabled={loading}>Send another code</button><span> · </span><button type="button" onClick={() => { setCodeSent(false); setCode(''); setNotice(''); }}>Use a different email</button></div>}
      <div className="auth-switch">{mode === 'login' ? <>New to Momentra? <button type="button" onClick={() => switchMode('register')}>Create an account</button></> : <>Already have an account? <button type="button" onClick={() => switchMode('login')}>Sign in</button></>}</div>
      <div className="login-privacy"><ShieldCheck size={16}/> Your moments are private to your account.</div>
    </section>
    <div className="login-footer">Make every moment count. <span>&#10022;</span></div>
  </main>;
}
