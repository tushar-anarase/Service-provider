import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/helpers';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'electrician',
    description: '',
    icon: '⚡',
    basePrice: '',
    priceUnit: 'per hour',
  });
  const toast = useToast();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/services');
      setServices(data || []);
    } catch {
      toast.error('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'electrician',
      description: '',
      icon: '⚡',
      basePrice: '',
      priceUnit: 'per hour',
    });
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description || '',
      icon: service.icon || '🛠️',
      basePrice: service.basePrice || '',
      priceUnit: service.priceUnit || 'per hour',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/services/${editingService._id}`, formData);
        toast.success('Updated', 'Service updated successfully');
      } else {
        await api.post('/services', formData);
        toast.success('Created', 'New service added successfully');
      }
      setShowModal(false);
      fetchServices();
    } catch {
      toast.error('Error', 'Failed to save service');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Deactivated', 'Service deactivated');
      fetchServices();
    } catch {
      toast.error('Error', 'Failed to deactivate service');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Service Catalog</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage available trades, base rates, and service offerings.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary btn-sm">+ Add New Service</button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20
      }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center' }}><div className="loader" /></div>
        ) : services.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No services found.</div>
        ) : (
          services.map(s => (
            <div key={s._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                  }}>
                    {s.icon || '🛠️'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</h3>
                    <span className="badge badge-info" style={{ fontSize: 11 }}>{s.category}</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, minHeight: 38 }}>
                  {s.description || 'Professional and reliable services for residential and commercial needs.'}
                </p>
                <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 15 }}>
                  From {formatCurrency(s.basePrice || 0)} <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>/{s.priceUnit || 'hr'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16, borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                <button onClick={() => openEditModal(s)} className="btn btn-outline btn-xs" style={{ flex: 1 }}>Edit</button>
                <button onClick={() => handleDelete(s._id)} className="btn btn-danger btn-xs">Deactivate</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
        }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Service Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Electrical Wiring & Repair"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="electrician">Electrician</option>
                    <option value="plumber">Plumber</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="ac_technician">AC Technician</option>
                    <option value="cleaner">Cleaner</option>
                    <option value="mechanic">Mechanic</option>
                    <option value="appliance_repair">Appliance Repair</option>
                  </select>
                </div>
                <div>
                  <label className="label">Emoji Icon</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="⚡"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    className="input"
                    placeholder="299"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Price Unit</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="per hour / visit"
                    value={formData.priceUnit}
                    onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  rows="3"
                  className="input"
                  placeholder="Brief description of service scope..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editingService ? 'Save Changes' : 'Create Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
