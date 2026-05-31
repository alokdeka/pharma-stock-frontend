import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBatches } from '../../api/batches';
import { getMedicines } from '../../api/medicines';
import Loader from '../../components/ui/Loader';
import { useNotification } from '../../context/NotificationContext';
import { Search, MapPin, Layers, Thermometer, Lock, ArrowRight, X, AlertTriangle } from 'lucide-react';

export default function WarehouseMap() {
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [medicines, setMedicines] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedSectors, setHighlightedSectors] = useState([]);
  const [activeSector, setActiveSector] = useState(null);

  const sectors = [
    {
      id: 'aisle-a',
      name: 'Aisle A: Ambient Tablet Zone',
      icon: MapPin,
      themeColor: '#0ea5e9', // Sky Blue
      bgGradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(14, 165, 233, 0.03))',
      locations: ['Aisle A - Shelf 1', 'Aisle A - Shelf 2', 'Aisle A - Shelf 3'],
      desc: 'Tablets, capsules, and general dry medications. Temperature-regulated between 20°C - 25°C.'
    },
    {
      id: 'aisle-b',
      name: 'Aisle B: Ambient Liquid Zone',
      icon: Layers,
      themeColor: '#0d9488', // Teal
      bgGradient: 'linear-gradient(135deg, rgba(13, 148, 136, 0.1), rgba(13, 148, 136, 0.03))',
      locations: ['Aisle B - Shelf 1', 'Aisle B - Shelf 2', 'Aisle B - Shelf 3'],
      desc: 'Liquid suspensions, syrups, and topical creams. Temperature-regulated between 20°C - 25°C.'
    },
    {
      id: 'cold-storage',
      name: 'Cold Storage (Refrigerated Zone)',
      icon: Thermometer,
      themeColor: '#3b82f6', // Indigo/Blue
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.03))',
      locations: ['Cold Storage Zone A', 'Cold Storage Zone B'],
      desc: 'Insulins, vaccines, and biological serums. Monitored strictly between 2°C - 8°C.'
    },
    {
      id: 'secured-vault',
      name: 'Secured Controlled Vault',
      icon: Lock,
      themeColor: '#f59e0b', // Amber
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.03))',
      locations: ['Secured Vault Zone A', 'Secured Vault Zone B'],
      desc: 'High-alert regulated controlled substances. Biometric secure lockbox access only.'
    }
  ];

  const loadData = async () => {
    try {
      const [bRes, mRes] = await Promise.all([getBatches(), getMedicines()]);
      const medMap = {};
      mRes.data.data.forEach(m => medMap[m.id] = m.name);
      setMedicines(medMap);
      setBatches(bRes.data.data);
    } catch (e) {
      showToast('Failed to load warehouse inventory maps', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSectorForLocation = (locationStr) => {
    if (!locationStr) return 'aisle-a';
    const loc = locationStr.toLowerCase();
    if (loc.includes('aisle b') || loc.includes('aisle-b')) {
      return 'aisle-b';
    }
    if (loc.includes('cold') || loc.includes('fridge') || loc.includes('refrigerated') || loc.includes('refrigerator')) {
      return 'cold-storage';
    }
    if (loc.includes('vault') || loc.includes('secured') || loc.includes('secure')) {
      return 'secured-vault';
    }
    // Default fallback is Aisle A
    return 'aisle-a';
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setHighlightedSectors([]);
      return;
    }

    const query = val.toLowerCase();
    const matches = [];

    batches.forEach(b => {
      const medName = medicines[b.medicine_id]?.toLowerCase() || '';
      const batchNum = b.batch_number.toLowerCase();
      if (medName.includes(query) || batchNum.includes(query)) {
        const sectorId = getSectorForLocation(b.location);
        if (!matches.includes(sectorId)) {
          matches.push(sectorId);
        }
      }
    });

    setHighlightedSectors(matches);
  };

  // Helper to categorize batches per sector
  const getSectorBatches = (sectorId) => {
    return batches.filter(b => getSectorForLocation(b.location) === sectorId);
  };

  // Helper to calculate statistics for each sector
  const getSectorStats = (sectorId) => {
    const sectorBatches = getSectorBatches(sectorId);
    const totalQty = sectorBatches.reduce((acc, b) => acc + parseInt(b.quantity), 0);
    const totalBatches = sectorBatches.length;

    // Check if there are expiring batches or low-stock issues
    let alertLevel = 'safe'; // 'safe', 'warning', 'critical'
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

    sectorBatches.forEach(b => {
      const expiry = new Date(b.expiry_date);
      if (expiry <= today) {
        alertLevel = 'critical';
      } else if (expiry <= thirtyDaysLater && alertLevel !== 'critical') {
        alertLevel = 'warning';
      }
    });

    return { totalQty, totalBatches, alertLevel };
  };

  if (loading) return <Loader />;

  const activeSectorData = activeSector ? sectors.find(s => s.id === activeSector) : null;
  const activeSectorBatches = activeSector ? getSectorBatches(activeSector) : [];

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 120px)' }}>
      {/* Dynamic Keyframe Style Override */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes mapPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4);
            background-color: rgba(20, 184, 166, 0.12);
            border-color: var(--teal-500);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(20, 184, 166, 0);
            background-color: rgba(20, 184, 166, 0.22);
            border-color: var(--teal-600);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(20, 184, 166, 0);
            background-color: rgba(20, 184, 166, 0.12);
            border-color: var(--teal-500);
          }
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .pulse-active {
          animation: mapPulse 1.8s infinite ease-in-out !important;
          border: 2px dashed var(--teal-500) !important;
        }
        
        .map-sector-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .map-sector-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.12);
          cursor: pointer;
        }

        .drawer-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .drawer-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        .drawer-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
        }
        .drawer-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }
      `}} />

      {/* Page Header and Search Widget */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 4px 0' }}>Interactive Warehouse Bin Map</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
              Visual storage distribution map. Type a medicine or batch to locate its physical shelving sector.
            </p>
          </div>
          
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search medicine or batch number..."
              value={searchQuery}
              onChange={handleSearch}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Floor Plan Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {sectors.map(sec => {
          const stats = getSectorStats(sec.id);
          const isHighlighted = highlightedSectors.includes(sec.id);
          const IconComponent = sec.icon;

          // Alert level colors
          const badgeStyles = stats.alertLevel === 'critical' 
            ? { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--status-red)', label: 'CRITICAL EXPIRY' }
            : stats.alertLevel === 'warning'
              ? { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--status-yellow)', label: 'NEAR EXPIRY' }
              : { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--status-green)', label: 'OPTIMAL' };

          return (
            <div
              key={sec.id}
              onClick={() => setActiveSector(sec.id)}
              className={`card map-sector-card ${isHighlighted ? 'pulse-active' : ''}`}
              style={{
                border: `1.5px solid ${isHighlighted ? 'var(--teal-500)' : 'var(--border-color)'}`,
                background: sec.bgGradient,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fff', color: sec.themeColor, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <IconComponent size={24} />
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    backgroundColor: badgeStyles.bg,
                    color: badgeStyles.text,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.05em'
                  }}>
                    {badgeStyles.label}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  {sec.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 20px 0', lineHeight: '1.4' }}>
                  {sec.desc}
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batches</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{stats.totalBatches}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Units</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{stats.totalQty}</strong>
                  </div>
                </div>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '500' }}>
                  View Zone <ArrowRight size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Map Layout Graphic */}
      <div className="card" style={{ padding: '24px', borderRadius: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px', fontSize: '1rem' }}>Physical Warehouse Grid Floorplan</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '12px',
          height: '240px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          {sectors.map(sec => {
            const isHighlighted = highlightedSectors.includes(sec.id);
            return (
              <div
                key={`grid-${sec.id}`}
                onClick={() => setActiveSector(sec.id)}
                className={`map-sector-card ${isHighlighted ? 'pulse-active' : ''}`}
                style={{
                  border: `1.5px solid ${isHighlighted ? 'var(--teal-500)' : 'rgba(0,0,0,0.06)'}`,
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{sec.name.split(':')[0]}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{getSectorBatches(sec.id).length} Active Lot(s)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-Drawer Details Panel Overlay */}
      {activeSector && (
        <>
          {/* Drawer Backdrop blur */}
          <div
            onClick={() => setActiveSector(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(3px)',
              zIndex: 999
            }}
          />

          {/* Actual Drawer Component */}
          <div
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: '460px',
              maxWidth: '100%',
              backgroundColor: '#fff',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '1.2rem' }}>{activeSectorData?.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Inventory Batch Directory</span>
              </div>
              <button
                onClick={() => setActiveSector(null)}
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="drawer-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 24px 0' }}>
                {activeSectorData?.desc}
              </p>

              <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', margin: '0 0 12px 0' }}>
                Active Stock List ({activeSectorBatches.length})
              </h4>

              {activeSectorBatches.length === 0 ? (
                <div style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  border: '2px dashed var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  <AlertTriangle size={24} style={{ display: 'block', margin: '0 auto 8px auto', color: 'var(--status-yellow)' }} />
                  No medication batches are currently stored in this bin area.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeSectorBatches.map(b => {
                    const expiry = new Date(b.expiry_date);
                    const today = new Date();
                    const thirtyDaysLater = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
                    
                    let expiryBadgeColor = '#d1fae5';
                    let expiryBadgeText = '#059669';
                    if (expiry <= today) {
                      expiryBadgeColor = '#fee2e2';
                      expiryBadgeText = '#dc2626';
                    } else if (expiry <= thirtyDaysLater) {
                      expiryBadgeColor = '#fef3c7';
                      expiryBadgeText = '#d97706';
                    }

                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          setActiveSector(null);
                          navigate(`/batches/${b.id}`);
                        }}
                        style={{
                          padding: '16px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: 'var(--bg-secondary)',
                          transition: 'border-color 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--teal-500)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {medicines[b.medicine_id] || 'Unknown Drug'}
                          </strong>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: expiryBadgeColor,
                            color: expiryBadgeText,
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {expiry <= today ? 'EXPIRED' : expiry <= thirtyDaysLater ? 'WARN' : 'GOOD'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span>Batch: <strong>{b.batch_number}</strong></span>
                          <span>Location: <strong>{b.location}</strong></span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '6px', marginTop: '2px' }}>
                          <span>Quantity: <strong style={{ color: 'var(--text-primary)' }}>{b.quantity} units</strong></span>
                          <span style={{ color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '500' }}>
                            Inspect batch <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div style={{
              padding: '24px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  setActiveSector(null);
                  navigate('/batches/new');
                }}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--teal-500)',
                  color: '#fff',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                + Record Batch Intake
              </button>
              <button
                onClick={() => setActiveSector(null)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
