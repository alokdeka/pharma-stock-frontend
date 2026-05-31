import React, { useState, useEffect } from 'react';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../../api/locations';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import { useNotification } from '../../context/NotificationContext';
import { Grid, Plus, Edit2, Trash2, MapPin, AlertTriangle, Layers, Thermometer, Lock } from 'lucide-react';

export default function LocationList() {
  const { showToast } = useNotification();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Control States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null); // null means adding, object means editing
  const [form, setForm] = useState({ name: '', zone: 'aisle-a', capacity: '1000' });

  // Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

  const loadData = async () => {
    try {
      const res = await getLocations();
      setLocations(res.data.data);
    } catch (e) {
      showToast('Failed to load locations directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setForm({ name: '', zone: 'aisle-a', capacity: '1000' });
    setModalOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setForm({ 
      name: loc.name, 
      zone: loc.zone, 
      capacity: String(loc.capacity) 
    });
    setModalOpen(true);
  };

  const handleOpenDelete = (loc) => {
    if (loc.current_occupancy > 0) {
      return showToast(`Cannot delete location while it houses ${loc.current_occupancy} active units.`, 'warning');
    }
    setDeleteConfirm({ isOpen: true, id: loc.id, name: loc.name });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(form.capacity) <= 0) {
      return showToast('Capacity must be greater than zero', 'warning');
    }

    try {
      const payload = {
        name: form.name,
        zone: form.zone,
        capacity: parseInt(form.capacity)
      };

      if (editingLoc) {
        await updateLocation(editingLoc.id, payload);
        showToast('Location bin details updated successfully', 'success');
      } else {
        await createLocation(payload);
        showToast('New location bin registered successfully', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing request', 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteLocation(deleteConfirm.id);
      showToast('Location retired successfully', 'success');
      setDeleteConfirm({ isOpen: false, id: null, name: '' });
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting location', 'error');
    }
  };

  const getZoneMeta = (zone) => {
    switch (zone) {
      case 'aisle-a':
        return { label: 'Aisle A (Tablets)', icon: MapPin, color: '#0ea5e9' };
      case 'aisle-b':
        return { label: 'Aisle B (Liquids)', icon: Layers, color: '#0d9488' };
      case 'cold-storage':
        return { label: 'Cold Storage (Serums)', icon: Thermometer, color: '#3b82f6' };
      case 'secured-vault':
        return { label: 'Secured Vault (Controlled)', icon: Lock, color: '#f59e0b' };
      default:
        return { label: 'General Warehouse', icon: Grid, color: 'var(--text-secondary)' };
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Visual Transitions / Progress style */}
      <style dangerouslySetInnerHTML={{__html: `
        .loc-grid-card {
          transition: all 0.2s ease;
          border: 1px solid var(--border-color);
        }
        .loc-grid-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px -8px rgba(0, 0, 0, 0.1);
        }
        .progress-bar-container {
          width: 100%;
          height: 8px;
          background-color: var(--border-color);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 6px;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease-out;
        }
      `}} />

      {/* Header and Add Action */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 4px 0' }}>Manage Warehouse Locations</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Audit shelf capacities and direct visual storage bin limits inside sectors
            </p>
          </div>
          <button 
            onClick={handleOpenAdd}
            style={{ 
              backgroundColor: 'var(--teal-500)', 
              color: '#fff', 
              padding: '10px 18px', 
              borderRadius: '6px', 
              fontWeight: '500', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            <Plus size={18} /> Register New Bin
          </button>
        </div>
      </div>

      {/* Location Slots Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {locations.map(loc => {
          const occupancyPercent = loc.capacity > 0 ? (loc.current_occupancy / loc.capacity) * 100 : 0;
          const displayPercent = Math.min(100, Math.round(occupancyPercent));
          
          // Color coding progress bar
          let progressFillColor = 'var(--status-green)';
          if (occupancyPercent >= 85) {
            progressFillColor = 'var(--status-red)';
          } else if (occupancyPercent >= 50) {
            progressFillColor = 'var(--status-yellow)';
          }

          const zoneMeta = getZoneMeta(loc.zone);
          const ZoneIcon = zoneMeta.icon;

          return (
            <div 
              key={loc.id}
              className="card loc-grid-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                borderRadius: '10px',
                position: 'relative'
              }}
            >
              <div>
                {/* Zone Icon Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: zoneMeta.color }}>
                    <ZoneIcon size={18} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {zoneMeta.label.split(' ')[0]}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={() => handleOpenEdit(loc)}
                      style={{ padding: '6px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleOpenDelete(loc)}
                      disabled={loc.current_occupancy > 0}
                      style={{ 
                        padding: '6px', 
                        color: loc.current_occupancy > 0 ? 'rgba(0,0,0,0.15)' : 'var(--status-red)', 
                        background: 'none', 
                        border: 'none', 
                        cursor: loc.current_occupancy > 0 ? 'not-allowed' : 'pointer' 
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
                  {loc.name}
                </h3>
              </div>

              {/* Occupancy and Progress audits */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '14px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Capacity Audit:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {loc.current_occupancy} / {loc.capacity} Units
                  </strong>
                </div>

                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${displayPercent}%`, 
                      backgroundColor: progressFillColor 
                    }} 
                  />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '6px', color: 'var(--text-secondary)' }}>
                  <span>{displayPercent}% Occupied</span>
                  {occupancyPercent >= 85 && (
                    <span style={{ color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '600' }}>
                      <AlertTriangle size={12} /> DENSE OVERFLOW
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Creation & Edit dialog Overlay Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLoc ? 'Modify Storage Bin Details' : 'Register New Storage Bin'}
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Location Name / Label</label>
            <input 
              required 
              name="name" 
              value={form.name} 
              onChange={handleFormChange} 
              placeholder="e.g. Aisle A - Shelf 4" 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Warehouse Zone Category</label>
            <select name="zone" value={form.zone} onChange={handleFormChange}>
              <option value="aisle-a">Aisle A (Ambient dry/tablets)</option>
              <option value="aisle-b">Aisle B (Ambient liquid/suspensions)</option>
              <option value="cold-storage">Cold Storage (Vaccines/insulins 2-8°C)</option>
              <option value="secured-vault">Secured Vault (Controlled substances)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Maximum Unit Capacity Limit</label>
            <input 
              required 
              type="number" 
              min="1" 
              name="capacity" 
              value={form.capacity} 
              onChange={handleFormChange} 
              placeholder="Maximum units e.g. 1000" 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button 
              type="button" 
              onClick={() => setModalOpen(false)}
              style={{ padding: '8px 16px', border: '1px solid var(--border-color)', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{ padding: '8px 20px', backgroundColor: 'var(--teal-500)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
            >
              {editingLoc ? 'Update Bin' : 'Save Bin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Alert dialogue */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        title="Retire Bin Location"
        message={`Are you sure you want to completely retire and delete location bin '${deleteConfirm.name}'? This action is permanent.`}
        confirmText="Yes, Retire Bin"
        danger={true}
      />

    </div>
  );
}
