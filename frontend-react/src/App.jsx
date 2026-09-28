import React, { useState, useEffect } from 'react';
import { getServices, addService } from './services/api';
import { getCurrentUser, logoutUser } from './services/authService';
import Login from './components/Login';
import Register from './components/Register';
import ChatWidget from './components/ChatWidget';
import { 
  LogOut, 
  Plus, 
  Search, 
  CheckCircle, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Bot,
  Scissors
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [prefilledEmail, setPrefilledEmail] = useState('');
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add service modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      loadServices();
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading services:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    showToast('Logged out successfully');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    loadServices();
    showToast(`Welcome back, ${userData.fullName}!`);
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      const newService = { 
        name, 
        description: description || 'Specialized salon treatment', 
        price: parseFloat(price) 
      };
      await addService(newService);

      setName('');
      setDescription('');
      setPrice('');
      setShowAddModal(false);
      loadServices();
      showToast('Treatment successfully added to catalog.');
    } catch (error) {
      alert(error.response?.data || 'Failed to add service. Please check your role permissions.');
    }
  };

  const filteredServices = services.filter(srv => {
    return srv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           srv.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // -------------------------------------------------------------
  // LANDING / AUTH VIEW (Black & White Theme)
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000000' }}>
        {/* Minimal Black & White Header */}
        <header style={{
          padding: '24px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #27272a',
          background: '#000000',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: '#ffffff',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '18px'
            }}>
              <Scissors size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', letterSpacing: '2px', textTransform: 'uppercase', margin: 0, color: '#ffffff' }}>
                SALONA
              </h2>
              <span style={{ fontSize: '10px', color: '#71717a', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                Studio & Spa
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: '#09090b', padding: '4px', borderRadius: '8px', border: '1px solid #27272a' }}>
            <button
              onClick={() => setAuthView('login')}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: 'none',
                background: authView === 'login' ? '#ffffff' : 'transparent',
                color: authView === 'login' ? '#000000' : '#a1a1aa',
                fontWeight: '700',
                fontSize: '12px',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setAuthView('register')}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: 'none',
                background: authView === 'register' ? '#ffffff' : 'transparent',
                color: authView === 'register' ? '#000000' : '#a1a1aa',
                fontWeight: '700',
                fontSize: '12px',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              REGISTER
            </button>
          </div>
        </header>

        {/* Hero & Auth Split Grid */}
        <main style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '48px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '56px',
          alignItems: 'center'
        }}>
          {/* Left Column: Editorial Showcase */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '4px',
              background: '#18181b',
              border: '1px solid #3f3f46',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}>
              <span>SALON MICROSERVICES PLATFORM</span>
            </div>

            <h1 style={{ fontSize: '52px', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.03em' }}>
              REDEFINING <span className="monochrome-gradient-text">HAIR & BEAUTY</span> EXCELLENCE.
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.8', marginBottom: '36px', maxWidth: '480px' }}>
              An architectural salon management system engineered with Spring Cloud Gateway, JWT authentication, and an integrated 24/7 AI Concierge.
            </p>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '20px', border: '1px solid #27272a' }}>
                <div style={{ color: '#ffffff', marginBottom: '8px' }}>
                  <ShieldCheck size={20} />
                </div>
                <h4 style={{ fontSize: '14px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>API Gateway</h4>
                <p style={{ color: 'var(--text-subtle)', fontSize: '12px' }}>Centralized JWT routing & load distribution</p>
              </div>

              <div className="glass-panel" style={{ padding: '20px', border: '1px solid #27272a' }}>
                <div style={{ color: '#ffffff', marginBottom: '8px' }}>
                  <Bot size={20} />
                </div>
                <h4 style={{ fontSize: '14px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Assistant</h4>
                <p style={{ color: 'var(--text-subtle)', fontSize: '12px' }}>Real-time treatment guidance & pricing</p>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Form Card */}
          <div className="animate-fade-in">
            {authView === 'login' ? (
              <Login 
                onLoginSuccess={handleLoginSuccess} 
                onSwitchToRegister={() => setAuthView('register')}
                initialEmail={prefilledEmail}
              />
            ) : (
              <Register 
                onRegisterSuccess={handleLoginSuccess} 
                onSwitchToLogin={(email) => {
                  if (email && typeof email === 'string') setPrefilledEmail(email);
                  setAuthView('login');
                }} 
              />
            )}
          </div>
        </main>

        <ChatWidget />
      </div>
    );
  }

  // -------------------------------------------------------------
  // DASHBOARD VIEW (Black & White Theme)
  // -------------------------------------------------------------
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000000' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: '#ffffff',
          color: '#000000',
          padding: '12px 22px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 30px rgba(255, 255, 255, 0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '700',
          fontSize: '13px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header style={{
        padding: '18px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #27272a',
        background: '#09090b',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: '#ffffff',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900'
          }}>
            <Scissors size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', letterSpacing: '2px', margin: 0, textTransform: 'uppercase', color: '#ffffff' }}>
              SALONA STUDIO
            </h2>
            <span style={{ fontSize: '10px', color: '#71717a', letterSpacing: '1px', textTransform: 'uppercase' }}>
              MANAGEMENT CONSOLE
            </span>
          </div>
        </div>

        {/* User Info & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px',
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: '#ffffff',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '800'
            }}>
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{user.fullName}</div>
              <span style={{
                fontSize: '9.5px',
                fontWeight: '700',
                padding: '1px 6px',
                borderRadius: '3px',
                backgroundColor: '#27272a',
                color: '#ffffff',
                border: '1px solid #3f3f46',
                textTransform: 'uppercase'
              }}>
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            title="Sign out"
          >
            <LogOut size={15} />
            <span>LOGOUT</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '40px 24px',
        flex: 1
      }}>
        
        {/* Top Metric Stats Banner */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Card 1: Total Services */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid #27272a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                SERVICES CATALOG
              </span>
              <Layers size={18} style={{ color: '#ffffff' }} />
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
              {services.length}
            </div>
            <div style={{ fontSize: '11px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AVAILABLE IN DATABASE
            </div>
          </div>

          {/* Card 2: Microservices Gateway */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid #27272a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                API GATEWAY
              </span>
              <Activity size={18} style={{ color: '#ffffff' }} />
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
              PORT 8082
            </div>
            <div style={{ fontSize: '11px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ACTIVE & SYNCHRONIZED
            </div>
          </div>

          {/* Card 3: AI Assistant */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid #27272a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                AI RECEPTIONIST
              </span>
              <Bot size={18} style={{ color: '#ffffff' }} />
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
              ONLINE
            </div>
            <div style={{ fontSize: '11px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              24/7 INTELLIGENT ASSISTANT
            </div>
          </div>
        </section>

        {/* Section Header */}
        <section style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '28px',
          borderBottom: '1px solid #27272a',
          paddingBottom: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '22px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Salon Treatments
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Explore and manage the service catalog</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '36px', fontSize: '13px' }}
              />
            </div>

            {/* Add Service Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '12.5px' }}
            >
              <Plus size={15} />
              <span>ADD TREATMENT</span>
            </button>
          </div>
        </section>

        {/* Services Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p>Loading catalog...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '16px', border: '1px solid #27272a' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#ffffff' }}>No Services Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
              {searchQuery ? 'Try changing your search term.' : 'Add your first salon treatment to get started.'}
            </p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              <Plus size={15} />
              <span>ADD FIRST TREATMENT</span>
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {filteredServices.map((srv, idx) => (
              <div
                key={srv.id || idx}
                className="glass-panel"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid #27272a',
                  background: '#0e0e11',
                  transition: 'all var(--transition-normal)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#27272a';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '3px',
                      background: '#18181b',
                      border: '1px solid #3f3f46',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}>
                      TREATMENT
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#ffffff', letterSpacing: '-0.01em' }}>
                    {srv.name}
                  </h3>

                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '24px' }}>
                    {srv.description || 'Specialized salon service with organic care.'}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #27272a',
                  paddingTop: '18px'
                }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</span>
                    <strong style={{ fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
                      LKR {srv.price?.toLocaleString()}
                    </strong>
                  </div>

                  <button
                    onClick={() => showToast(`Selected "${srv.name}" for booking`)}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  >
                    BOOK
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* -------------------------------------------------------------
          ADD NEW SERVICE MODAL (Black & White Theme)
      ------------------------------------------------------------- */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '36px',
            background: '#09090b',
            border: '1px solid #3f3f46',
            boxShadow: '0 25px 50px rgba(0,0,0,0.95)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ADD TREATMENT</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0 0' }}>Add new service to the booking catalog</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitService}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Treatment Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Keratin Therapy & Hair Spa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="glass-input"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  placeholder="Service description and benefits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input"
                  rows="3"
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Price in LKR (Rs.) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 4500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ textTransform: 'uppercase', fontSize: '12px' }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ textTransform: 'uppercase', fontSize: '12px' }}
                >
                  <Plus size={15} />
                  <span>SAVE TREATMENT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating AI Chat Assistant */}
      <ChatWidget />
    </div>
  );
}

export default App;