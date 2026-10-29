import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '⚡', title: 'Instant Matching', desc: 'Get matched with verified professionals near you in minutes' },
  { icon: '🛡️', title: 'Verified Pros', desc: 'All service providers are background-checked and verified' },
  { icon: '📍', title: 'Nearby Service', desc: 'Find professionals in your locality for fast response' },
  { icon: '💬', title: 'Real-time Chat', desc: 'Communicate directly with your service provider' },
  { icon: '💳', title: 'Secure Payments', desc: 'Multiple payment options with transparent invoicing' },
  { icon: '⭐', title: 'Ratings & Reviews', desc: 'Community-driven quality assurance system' },
];

const services = [
  { icon: '⚡', name: 'Electrician', count: '200+ Pros' },
  { icon: '🔧', name: 'Plumber', count: '180+ Pros' },
  { icon: '❄️', name: 'AC Repair', count: '150+ Pros' },
  { icon: '🪚', name: 'Carpenter', count: '120+ Pros' },
  { icon: '🧹', name: 'Cleaning', count: '300+ Pros' },
  { icon: '🔩', name: 'Mechanic', count: '100+ Pros' },
  { icon: '🔌', name: 'Appliance', count: '160+ Pros' },
  { icon: '🎨', name: 'Painting', count: '90+ Pros' },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) { navigate('/dashboard'); return; }
    navigate('/register');
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--gradient-primary)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>⚡</div>
          <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
            Service<span style={{ color: 'var(--primary-light)' }}>Pro</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {user ? (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="hero-content">
          <div className="hero-tag">🚀 India's Fastest Growing Service Platform</div>
          <h1 className="hero-title">
            Find Trusted <span>Local Pros</span> at Your Doorstep
          </h1>
          <p className="hero-desc">
            Connect with verified electricians, plumbers, AC technicians, carpenters, cleaners and more.
            Get quotes, track your service, and pay securely — all in one place.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
              Book a Service ⚡
            </button>
            <Link to="/register?role=provider" className="btn btn-secondary btn-lg">
              Join as Provider 🔧
            </Link>
          </div>
          <div className="hero-stats">
            {[
              { value: '50K+', label: 'Happy Customers' },
              { value: '5K+', label: 'Verified Pros' },
              { value: '100K+', label: 'Jobs Completed' },
              { value: '4.8★', label: 'Average Rating' },
            ].map(s => (
              <div key={s.label}>
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '80px 40px', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
              Services We Offer
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 16 }}>
              From quick fixes to complete home transformations
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16 }}>
            {services.map(s => (
              <div
                key={s.name}
                className="service-card"
                onClick={handleGetStarted}
              >
                <span className="service-card-icon">{s.icon}</span>
                <div className="service-card-name">{s.name}</div>
                <div className="service-card-price">{s.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
              Why Choose ServicePro?
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ display: 'flex', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(99,102,241,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0
                }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 40px', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 48 }}>
            How It Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
            {[
              { num: '01', icon: '📝', title: 'Describe Issue', desc: 'Tell us what you need with photos' },
              { num: '02', icon: '🎯', title: 'Get Matched', desc: 'We find the best pros near you' },
              { num: '03', icon: '✅', title: 'Accept & Track', desc: 'Approve quote and track in real-time' },
              { num: '04', icon: '💳', title: 'Pay Securely', desc: 'Pay after job is done, rate the pro' },
            ].map(s => (
              <div key={s.num} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', marginBottom: 12, letterSpacing: 2 }}>{s.num}</div>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 16 }}>
            Ready to Get Started?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32 }}>
            Join thousands of satisfied customers and service providers
          </p>
          <button className="btn btn-primary btn-lg btn-full" style={{ maxWidth: 300, margin: '0 auto' }} onClick={handleGetStarted}>
            Get Started for Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 40px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        © 2024 ServicePro. All rights reserved. Built for India 🇮🇳
      </footer>
    </div>
  );
}
