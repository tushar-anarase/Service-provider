import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!', `Logged in as ${user.name}`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'provider') navigate('/provider');
      else navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role) => {
    const creds = {
      customer: { email: 'customer@test.com', password: 'test123' },
      provider: { email: 'provider@test.com', password: 'test123' },
      admin: { email: 'admin@servicepro.com', password: 'admin123' },
    };
    setForm(creds[role]);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: 20,
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, background: 'var(--gradient-primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
            <span style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>Service<span style={{ color: 'var(--primary-light)' }}>Pro</span></span>
          </Link>
        </div>

        <div className="card" style={{ borderColor: 'var(--border-light)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Welcome back 👋</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Sign in to your account</p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#f87171' }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" name="email" value={form.email}
                onChange={handle} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" name="password" value={form.password}
                onChange={handle} placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? <><div className="loader loader-sm" />Signing in...</> : 'Sign In →'}
            </button>
          </form>

          {/* Quick Demo Login */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10 }}>QUICK DEMO LOGIN</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['customer', 'provider', 'admin'].map(r => (
                <button key={r} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: 11, textTransform: 'capitalize' }}
                  onClick={() => quickLogin(r)}>
                  {r === 'customer' ? '👤' : r === 'provider' ? '🔧' : '⚙️'} {r}
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginTop: 20 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
