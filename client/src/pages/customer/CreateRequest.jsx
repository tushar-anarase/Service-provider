import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const SERVICES_LIST = [
  { icon: '⚡', name: 'Electrical Repair' }, { icon: '🔧', name: 'Plumbing' },
  { icon: '❄️', name: 'AC Service & Repair' }, { icon: '🪚', name: 'Carpentry' },
  { icon: '🧹', name: 'Home Cleaning' }, { icon: '🔩', name: 'Vehicle Mechanic' },
  { icon: '🔌', name: 'Appliance Repair' }, { icon: '🎨', name: 'Painting' },
  { icon: '🪲', name: 'Pest Control' }, { icon: '📹', name: 'CCTV Installation' },
];

const URGENCY = [
  { value: 'low', label: '🟢 Low — Flexible timing', desc: 'No rush, anytime this week' },
  { value: 'medium', label: '🟡 Medium — Within 24 hours', desc: 'Needed today or tomorrow' },
  { value: 'high', label: '🟠 High — Within a few hours', desc: 'Urgent, needed ASAP' },
  { value: 'emergency', label: '🔴 Emergency — Right now!', desc: 'Critical issue, call immediately' },
];

const STEPS = ['Service', 'Details', 'Location', 'Review'];

export default function CreateRequest() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [form, setForm] = useState({
    selectedService: searchParams.get('service') || '',
    serviceId: '',
    title: '', description: '',
    urgency: 'medium',
    scheduledDate: '', scheduledTime: '',
    location: { address: '', city: '', pincode: '' },
    payment: { method: 'cash' },
  });

  useEffect(() => {
    api.get('/services').then(({ data }) => setServices(data)).catch(() => setServices(SERVICES_LIST.map(s => ({ _id: s.name, ...s }))));
  }, []);

  const handle = (name, value) => {
    if (name.startsWith('location.')) {
      const f = name.split('.')[1];
      setForm(p => ({ ...p, location: { ...p.location, [f]: value } }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files].slice(0, 5));
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...previews].slice(0, 5));
  };

  const canNext = () => {
    if (step === 0) return !!form.selectedService;
    if (step === 1) return form.title.length >= 5 && form.description.length >= 10;
    if (step === 2) return form.location.city && form.location.address;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    try {
      const selectedSvc = services.find(s => s.name === form.selectedService);
      const requestData = {
        service: selectedSvc?._id || form.selectedService,
        title: form.title || form.selectedService,
        description: form.description,
        urgency: form.urgency,
        location: form.location,
        scheduledDate: form.scheduledDate || null,
        scheduledTime: form.scheduledTime || null,
        serviceType: form.selectedService,
        payment: { method: form.payment.method },
      };
      const fd = new FormData();
      fd.append('data', JSON.stringify(requestData));
      images.forEach(img => fd.append('images', img));

      const { data } = await api.post('/requests', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Request Created!', 'Looking for nearby providers...');
      navigate(`/customer/requests/${data._id}`);
    } catch (err) {
      toast.error('Failed', err.response?.data?.message || 'Could not create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
              background: i === step ? 'var(--primary)' : i < step ? 'var(--success)' : 'var(--bg-elevated)',
              color: i <= step ? 'white' : 'var(--text-muted)',
              border: `2px solid ${i === step ? 'var(--primary)' : i < step ? 'var(--success)' : 'var(--border)'}`,
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 13, fontWeight: i === step ? 700 : 400, color: i === step ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</span>
            {i < STEPS.length - 1 && <div style={{ width: 24, height: 2, background: i < step ? 'var(--success)' : 'var(--border)' }} />}
          </div>
        ))}
      </div>

      <div className="card">
        {/* Step 0 - Service Selection */}
        {step === 0 && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Select a Service</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>What type of service do you need?</p>
            <div className="services-grid">
              {SERVICES_LIST.map(s => (
                <div
                  key={s.name}
                  className={`service-card ${form.selectedService === s.name ? 'selected' : ''}`}
                  onClick={() => handle('selectedService', s.name)}
                >
                  <span className="service-card-icon">{s.icon}</span>
                  <div className="service-card-name">{s.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 - Details */}
        {step === 1 && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Describe Your Problem</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Help the provider understand your issue</p>
            <div className="form-group">
              <label className="form-label">Title / Short Description</label>
              <input className="form-control" value={form.title} onChange={e => handle('title', e.target.value)} placeholder={`e.g. Bathroom tap leaking badly`} />
            </div>
            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea className="form-control" rows={4} value={form.description} onChange={e => handle('description', e.target.value)}
                placeholder="Describe the problem in detail — what happened, when it started, any specific requirements..." />
            </div>

            {/* Images */}
            <div className="form-group">
              <label className="form-label">Upload Photos (Optional)</label>
              <div className="upload-area" onClick={() => document.getElementById('imgInput').click()}>
                <div className="upload-icon">📷</div>
                <div className="upload-text">Click to upload photos of the issue (max 5)</div>
                <input id="imgInput" type="file" accept="image/*" multiple hidden onChange={handleImages} />
              </div>
              {imagePreviews.length > 0 && (
                <div className="upload-previews">
                  {imagePreviews.map((p, i) => (
                    <div key={i} className="upload-preview">
                      <img src={p} alt={`Preview ${i}`} />
                      <div className="upload-remove" onClick={() => {
                        setImages(prev => prev.filter((_, idx) => idx !== i));
                        setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                      }}>✕</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Urgency */}
            <div className="form-group">
              <label className="form-label">Urgency Level</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {URGENCY.map(u => (
                  <div
                    key={u.value}
                    onClick={() => handle('urgency', u.value)}
                    style={{
                      padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                      border: `2px solid ${form.urgency === u.value ? 'var(--primary)' : 'var(--border)'}`,
                      background: form.urgency === u.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-input)',
                      transition: 'var(--transition)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{u.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Preferred Date (Optional)</label>
                <input className="form-control" type="date" value={form.scheduledDate} onChange={e => handle('scheduledDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Time (Optional)</label>
                <input className="form-control" type="time" value={form.scheduledTime} onChange={e => handle('scheduledTime', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Location */}
        {step === 2 && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Service Location</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Where do you need the service?</p>
            <div className="form-group">
              <label className="form-label">Full Address</label>
              <textarea className="form-control" rows={2} value={form.location.address} onChange={e => handle('location.address', e.target.value)}
                placeholder="Flat No, Building Name, Street, Area" />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-control" value={form.location.city} onChange={e => handle('location.city', e.target.value)} placeholder="Mumbai" />
              </div>
              <div className="form-group">
                <label className="form-label">PIN Code</label>
                <input className="form-control" value={form.location.pincode} onChange={e => handle('location.pincode', e.target.value)} placeholder="400001" maxLength={6} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ v: 'cash', l: '💵 Cash' }, { v: 'upi', l: '📱 UPI' }, { v: 'online', l: '💳 Online' }].map(p => (
                  <div
                    key={p.v}
                    onClick={() => setForm(f => ({ ...f, payment: { method: p.v } }))}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
                      border: `2px solid ${form.payment.method === p.v ? 'var(--primary)' : 'var(--border)'}`,
                      background: form.payment.method === p.v ? 'rgba(99,102,241,0.1)' : 'var(--bg-input)',
                      fontWeight: 600, fontSize: 13, transition: 'var(--transition)',
                    }}
                  >{p.l}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Review */}
        {step === 3 && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Review & Submit</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Confirm your service request details</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Service', value: form.selectedService },
                { label: 'Title', value: form.title },
                { label: 'Urgency', value: form.urgency.toUpperCase() },
                { label: 'Location', value: `${form.location.address}, ${form.location.city} - ${form.location.pincode}` },
                { label: 'Payment', value: form.payment.method.toUpperCase() },
                { label: 'Photos', value: images.length > 0 ? `${images.length} photo(s) attached` : 'No photos' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{item.label}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-secondary" onClick={() => step === 0 ? navigate('/customer') : setStep(s => s - 1)}>
            ← {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              Next →
            </button>
          ) : (
            <button className="btn btn-success" onClick={submit} disabled={loading}>
              {loading ? <><div className="loader loader-sm" />Submitting...</> : '✅ Submit Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
