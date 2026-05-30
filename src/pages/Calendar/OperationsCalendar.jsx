import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCalendarEvents } from '../../api/reports';
import Loader from '../../components/ui/Loader';
import { useNotification } from '../../context/NotificationContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, ArrowRight, Info, AlertTriangle } from 'lucide-react';

export default function OperationsCalendar() {
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Month navigation state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Filter states
  const [filters, setFilters] = useState({
    expiry: true,
    po: true,
    inbound: true,
    spoilage: true
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const loadEvents = async () => {
    try {
      const res = await getCalendarEvents();
      setEvents(res.data.data);
    } catch (e) {
      showToast('Failed to load operations calendar data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Standard Month math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // Helper: Format Date key for event matching (YYYY-MM-DD)
  const formatDateKey = (year, month, day) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Get active events for a specific day
  const getDayEvents = (year, month, day) => {
    const key = formatDateKey(year, month, day);
    return events.filter(e => {
      if (e.date !== key) return false;
      return filters[e.type] === true;
    });
  };

  // Toggle filters
  const toggleFilter = (type) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  if (loading) return <Loader />;

  // Generate grid days
  const gridCells = [];
  // 1. Add padding cells for offset
  for (let i = 0; i < firstDayIndex; i++) {
    gridCells.push({ isPadding: true, key: `pad-${i}` });
  }
  // 2. Add actual day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(currentYear, currentMonth, day);
    const dayEvents = getDayEvents(currentYear, currentMonth, day);
    const isTodayCell = 
      today.getDate() === day && 
      today.getMonth() === currentMonth && 
      today.getFullYear() === currentYear;

    gridCells.push({
      isPadding: false,
      day,
      dateKey,
      events: dayEvents,
      isToday: isTodayCell,
      key: `day-${day}`
    });
  }

  // Active drawer data
  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
  const activeEvents = selectedDate 
    ? events.filter(e => e.date === selectedDate && filters[e.type] === true)
    : [];

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 120px)' }}>
      {/* Visual Transitions Style Tag */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .calendar-day-cell {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--border-color);
          background-color: #fff;
          min-height: 110px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          position: relative;
        }

        .calendar-day-cell:hover {
          background-color: var(--bg-secondary) !important;
          box-shadow: inset 0 0 0 1px var(--teal-500);
        }

        .calendar-day-cell.today {
          background-color: rgba(20, 184, 166, 0.03);
          border: 1.5px solid var(--teal-500) !important;
          box-shadow: 0 0 8px rgba(20, 184, 166, 0.1);
        }

        .event-pill {
          font-size: 0.72rem;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          max-width: 100%;
          color: #fff;
          display: block;
          margin-bottom: 3px;
        }

        .event-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
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

      {/* Main Header & Controls card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(20, 184, 166, 0.1)', color: 'var(--teal-500)' }}>
              <CalendarIcon size={22} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>WMS Operations Calendar</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Consolidated monitoring dashboard of key warehouse milestones</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={handlePrevMonth}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              margin: '0 12px',
              fontSize: '1.2rem',
              minWidth: '150px',
              textAlign: 'center'
            }}>
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button 
              onClick={handleNextMonth}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={handleJumpToToday}
              style={{
                marginLeft: '12px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: '500',
                border: '1px solid var(--border-color)',
                cursor: 'pointer'
              }}
            >
              Today
            </button>
          </div>

        </div>
      </div>

      {/* Legend & Filter Controls */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
          <strong style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Toggle Legend:</strong>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              checked={filters.expiry} 
              onChange={() => toggleFilter('expiry')} 
              style={{ accentColor: 'var(--status-red)' }} 
            />
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--status-red)' }} />
            <span>Medicine Expirations</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              checked={filters.po} 
              onChange={() => toggleFilter('po')} 
              style={{ accentColor: '#8b5cf6' }} 
            />
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
            <span>Purchase Orders</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              checked={filters.inbound} 
              onChange={() => toggleFilter('inbound')} 
              style={{ accentColor: 'var(--status-green)' }} 
            />
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--status-green)' }} />
            <span>Inbound Deliveries</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              checked={filters.spoilage} 
              onChange={() => toggleFilter('spoilage')} 
              style={{ accentColor: '#f59e0b' }} 
            />
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span>Spoilage Logs</span>
          </label>
        </div>
      </div>

      {/* Main Grid Calendar Container */}
      <div className="card" style={{ padding: '12px', overflowX: 'auto', borderRadius: '12px' }}>
        <div style={{ minWidth: '700px' }}>
          
          {/* Weekday Labels Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px', textAlign: 'center' }}>
            {weekdayNames.map(day => (
              <div key={day} style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', padding: '8px 0' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Month Day Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {gridCells.map((cell) => {
              if (cell.isPadding) {
                return (
                  <div key={cell.key} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '6px', minHeight: '110px' }} />
                );
              }

              return (
                <div
                  key={cell.key}
                  onClick={() => setSelectedDate(cell.dateKey)}
                  className={`calendar-day-cell ${cell.isToday ? 'today' : ''}`}
                  style={{ borderRadius: '6px' }}
                >
                  {/* Day Number */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: cell.isToday ? '700' : '500', 
                      color: cell.isToday ? 'var(--teal-600)' : 'var(--text-primary)' 
                    }}>
                      {cell.day}
                    </span>
                    {cell.events.length > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        {cell.events.length} event{cell.events.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Day Events Indicator Preview List */}
                  <div style={{ flex: 1, marginTop: '8px', overflow: 'hidden' }}>
                    {/* Render top 2 events as badges */}
                    {cell.events.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="event-pill"
                        style={{ backgroundColor: ev.color }}
                      >
                        {ev.title.split(':')[1]?.trim() || ev.title}
                      </div>
                    ))}

                    {/* Show counts if there are more than 2 events */}
                    {cell.events.length > 2 && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '500', paddingLeft: '4px' }}>
                        + {cell.events.length - 2} more...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Side drawer detailed audit panel overlay */}
      {selectedDate && (
        <>
          {/* Drawer backdrop blur */}
          <div
            onClick={() => setSelectedDate(null)}
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

          {/* Actual Drawer */}
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
                <h3 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '1.2rem' }}>
                  {selectedDateObj?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Detailed Operations Log</span>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
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
              
              <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', margin: '0 0 16px 0' }}>
                Day Events ({activeEvents.length})
              </h4>

              {activeEvents.length === 0 ? (
                <div style={{
                  padding: '40px 16px',
                  textAlign: 'center',
                  border: '2px dashed var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  <Info size={24} style={{ display: 'block', margin: '0 auto 8px auto', color: 'var(--text-secondary)' }} />
                  No audited WMS events scheduled or recorded on this date.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeEvents.map(ev => (
                    <div
                      key={ev.id}
                      style={{
                        padding: '16px',
                        border: '1.5px solid var(--border-color)',
                        borderLeft: `4px solid ${ev.color}`,
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {ev.title}
                      </strong>
                      
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                        {ev.details}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '8px', marginTop: '4px' }}>
                        <button
                          onClick={() => {
                            setSelectedDate(null);
                            if (ev.type === 'po') {
                              navigate('/orders');
                            } else {
                              navigate(`/batches/${ev.ref_id}`);
                            }
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: 'var(--teal-600)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Inspect Event details <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div style={{
              padding: '24px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setSelectedDate(null)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontWeight: '500'
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
