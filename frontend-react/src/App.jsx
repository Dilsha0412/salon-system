import React, { useState, useEffect } from 'react';
import { getServices, addService, updateService, deleteService, getAllBookings, getStylists } from './services/api';
import { getCurrentUser, logoutUser } from './services/authService';
import Login from './components/Login';
import Register from './components/Register';
import ChatWidget from './components/ChatWidget';
import BookAppointmentModal from './components/BookAppointmentModal';
import AppointmentsList from './components/AppointmentsList';
import StylistsList from './components/StylistsList';
import AdminAnalytics from './components/AdminAnalytics';
import {
  LogOut,
  Plus,
  Search,
  CheckCircle,
  Scissors,
  Calendar,
  Layers,
  UserCheck,
  Edit2,
  Trash2,
  Clock,
  Star,
  Tag
} from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Hair Care',
  'Skin & Facial',
  'Nails',
  'Bridal & Spa'
];

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [prefilledEmail, setPrefilledEmail] = useState('');

  // Dashboard tab state: 'services' | 'stylists' | 'appointments'
  const [activeTab, setActiveTab] = useState('services');

  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Category & Price Filter State
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT'); // 'DEFAULT', 'PRICE_ASC', 'PRICE_DESC', 'NAME_ASC'

  // Add / Edit service modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Hair Care');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [rating, setRating] = useState(4.8);
  const [toastMessage, setToastMessage] = useState('');

  // Book appointment modal state
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
  const [selectedStylistForBooking, setSelectedStylistForBooking] = useState(null);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      loadAllDashboardData();
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const loadAllDashboardData = async () => {
    setLoading(true);
    try {
      const [servicesData, stylistsData, bookingsData] = await Promise.all([
        getServices(),
        getStylists(),
        getAllBookings()
      ]);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setStylists(Array.isArray(stylistsData) ? stylistsData : []);
      setAllBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
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
    loadAllDashboardData();
    showToast(`Welcome back, ${userData.fullName}!`);
  };

  // Helper to format duration
  const formatDuration = (mins = 45) => {
    const m = Number(mins) || 45;
    if (m >= 60) {
      const hrs = m / 60;
      return `${hrs.toFixed(m % 60 === 0 ? 0 : 1)} ${hrs === 1 ? 'Hour' : 'Hours'}`;
    }
    return `${m} Mins`;
  };

  // Open modal for Adding a new service
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Hair Care');
    setDurationMinutes(45);
    setRating(4.8);
    setShowAddModal(true);
  };

  // Open modal for Editing an existing service
  const handleOpenEditService = (srv) => {
    setEditingServiceId(srv.id);
    setName(srv.name || '');
    setDescription(srv.description || '');
    setPrice(srv.price ? String(srv.price) : '');
    setCategory(srv.category || 'Hair Care');
    setDurationMinutes(srv.durationMinutes || 45);
    setRating(srv.rating || 4.8);
    setShowAddModal(true);
  };

  const handleDeleteService = async (srvId, srvName) => {
    if (!window.confirm(`Are you sure you want to delete "${srvName}" from the service catalog?`)) {
      return;
    }
    try {
      await deleteService(srvId);
      showToast(`Treatment "${srvName}" removed successfully.`);
      loadAllDashboardData();
    } catch (err) {
      console.error("Failed to delete service:", err);
      alert("Failed to delete service. Please ensure admin privileges.");
    }
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      const servicePayload = {
        name,
        description: description || 'Specialized salon treatment',
        price: parseFloat(price),
        category: category || 'Hair Care',
        durationMinutes: parseInt(durationMinutes) || 45,
        rating: parseFloat(rating) || 4.8,
        reviewCount: editingServiceId ? undefined : 24
      };

      if (editingServiceId) {
        await updateService(editingServiceId, servicePayload);
        showToast(`Treatment "${name}" updated successfully.`);
      } else {
        await addService(servicePayload);
        showToast(`Treatment "${name}" added to catalog.`);
      }

      setShowAddModal(false);
      setEditingServiceId(null);
      setName('');
      setDescription('');
      setPrice('');
      setCategory('Hair Care');
      setDurationMinutes(45);
      setRating(4.8);
      loadAllDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || error.response?.data || 'Failed to save service.');
    }
  };

  const handleOpenBookModal = (service = null) => {
    setSelectedServiceForBooking(service);
    setSelectedStylistForBooking(null);
    setShowBookModal(true);
  };

  const handleBookWithStylist = (stylist) => {
    setSelectedStylistForBooking(stylist);
    setSelectedServiceForBooking(null);
    setShowBookModal(true);
  };

  // Category & Price Filtered Services
  const filteredServices = services
    .filter(srv => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = srv.name?.toLowerCase().includes(query) ||
        srv.description?.toLowerCase().includes(query) ||
        srv.category?.toLowerCase().includes(query);

      const matchesCategory = selectedCategory === 'ALL' ||
        (srv.category || 'Hair Care').toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'PRICE_DESC') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'NAME_ASC') return (a.name || '').localeCompare(b.name || '');
      return (a.id || 0) - (b.id || 0);
    });

  // LANDING / AUTH VIEW (Black & White Theme)
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000000' }}>
        <header style={{
          padding: '24px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #27272a',
          background: '#09090b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ffffff 0%, #d4d4d8 100%)',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              boxShadow: '0 4px 16px rgba(255, 255, 255, 0.15)'
            }}>
              <Scissors size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h1 style={{
                fontSize: '22px',
                letterSpacing: '3.5px',
                margin: 0,
                fontWeight: '900',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: '#ffffff',
                lineHeight: 1
              }}>
                LUM<span style={{ color: '#e4e4e7' }}>É</span>RA
              </h1>
              <span style={{ fontSize: '10px', color: '#a1a1aa', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '3px', display: 'block' }}>
                HAIR • SKIN • SPA CONCIERGE
              </span>
            </div>
          </div>
        </header>

        <main style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '60px 24px',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '60px',
          alignItems: 'center'
        }}>
          {/* Left Column: Brand Statement */}
          <div className="animate-slide-up">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
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

            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.8', marginBottom: '0px', maxWidth: '480px' }}>
              An architectural salon management system engineered with Spring Cloud Gateway, JWT authentication, and an integrated 24/7 AI Concierge.
            </p>
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
      </div>
    );
  }

  // DASHBOARD VIEW (Role-Based Customer vs Admin)
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
          padding: '14px 24px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 30px rgba(255, 255, 255, 0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '700',
          fontSize: '13px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle size={17} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header style={{
        padding: '16px 40px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => setActiveTab('services')}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ffffff 0%, #d4d4d8 100%)',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(255, 255, 255, 0.12)',
            transition: 'transform 0.2s ease'
          }}>
            <Scissors size={20} strokeWidth={2.2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{
              fontSize: '22px',
              letterSpacing: '3.5px',
              margin: 0,
              fontWeight: '900',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              color: '#ffffff',
              lineHeight: 1
            }}>
              LUM<span style={{ color: '#e4e4e7' }}>É</span>RA
            </h2>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav style={{
          display: 'flex',
          gap: '6px',
          background: '#18181b',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid #27272a'
        }}>
          <button
            onClick={() => setActiveTab('services')}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'services' ? '#ffffff' : 'transparent',
              color: activeTab === 'services' ? '#000000' : 'var(--text-muted)',
              fontWeight: activeTab === 'services' ? '800' : '600',
              fontSize: '12px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} />
            <span>TREATMENTS</span>
          </button>

          <button
            onClick={() => setActiveTab('stylists')}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'stylists' ? '#ffffff' : 'transparent',
              color: activeTab === 'stylists' ? '#000000' : 'var(--text-muted)',
              fontWeight: activeTab === 'stylists' ? '800' : '600',
              fontSize: '12px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'all 0.15s ease'
            }}
          >
            <UserCheck size={14} />
            <span>OUR STYLISTS</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'appointments' ? '#ffffff' : 'transparent',
              color: activeTab === 'appointments' ? '#000000' : 'var(--text-muted)',
              fontWeight: activeTab === 'appointments' ? '800' : '600',
              fontSize: '12px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'all 0.15s ease'
            }}
          >
            <Calendar size={14} />
            <span>{isAdmin ? 'ALL BOOKINGS' : 'MY APPOINTMENTS'}</span>
          </button>
        </nav>

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
                backgroundColor: isAdmin ? '#ffffff' : '#27272a',
                color: isAdmin ? '#000000' : '#ffffff',
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
        padding: '36px 24px',
        flex: 1
      }}>

        {/* ADMIN EXCLUSIVE ANALYTICS BANNER */}
        {isAdmin && (
          <AdminAnalytics
            bookings={allBookings}
            services={services}
            stylists={stylists}
            onOpenAddService={handleOpenAddService}
            onOpenAddStylist={() => setActiveTab('stylists')}
            onSwitchTab={setActiveTab}
          />
        )}

        {/* TAB 1: TREATMENTS CATALOG */}
        {activeTab === 'services' && (
          <div>
            {/* Section Header */}
            <section style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{ fontSize: '22px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  Salon Treatments Catalog
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  {isAdmin ? 'Manage catalog offerings, categories, durations, and pricing' : 'Explore luxury treatments, duration times, and client reviews'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search Input */}
                <div style={{ position: 'relative', width: '240px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    placeholder="Search treatments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-input"
                    style={{ paddingLeft: '36px', fontSize: '13px' }}
                  />
                </div>

                {/* Price Sort Dropdown */}
                <div style={{ position: 'relative' }}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="glass-input"
                    style={{ fontSize: '12.5px', padding: '10px 14px', background: '#18181b', color: '#ffffff', cursor: 'pointer' }}
                  >
                    <option value="DEFAULT" style={{ background: '#18181b' }}>Sort: Default</option>
                    <option value="PRICE_ASC" style={{ background: '#18181b' }}>Price: Low to High (Rs. ↑)</option>
                    <option value="PRICE_DESC" style={{ background: '#18181b' }}>Price: High to Low (Rs. ↓)</option>
                    <option value="NAME_ASC" style={{ background: '#18181b' }}>Alphabetical (A - Z)</option>
                  </select>
                </div>

                {/* Book Custom Appointment Button */}
                <button
                  onClick={() => handleOpenBookModal(null)}
                  className="btn-primary"
                  style={{ padding: '10px 18px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  <Calendar size={14} />
                  <span>BOOK APPOINTMENT</span>
                </button>

                {/* Add Service Button (Admin Only) */}
                {isAdmin && (
                  <button
                    onClick={handleOpenAddService}
                    className="btn-secondary"
                    style={{ padding: '10px 16px', fontSize: '12px', textTransform: 'uppercase' }}
                  >
                    <Plus size={14} />
                    <span>ADD TREATMENT</span>
                  </button>
                )}
              </div>
            </section>

            {/* CATEGORY FILTER PILLS BAR */}
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              overflowX: 'auto',
              paddingBottom: '16px',
              marginBottom: '24px',
              borderBottom: '1px solid #27272a'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '6px' }}>
                Categories:
              </span>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                const count = cat === 'ALL'
                  ? services.length
                  : services.filter(s => (s.category || 'Hair Care').toLowerCase() === cat.toLowerCase()).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '20px',
                      border: isSelected ? '1px solid #ffffff' : '1px solid #27272a',
                      background: isSelected ? '#ffffff' : '#18181b',
                      color: isSelected ? '#000000' : '#a1a1aa',
                      fontWeight: isSelected ? '800' : '600',
                      fontSize: '12px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{cat}</span>
                    <span style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      background: isSelected ? '#000000' : '#27272a',
                      color: isSelected ? '#ffffff' : '#a1a1aa',
                      fontWeight: '700'
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Services Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <p>Loading catalog...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '16px', border: '1px solid #27272a' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#ffffff' }}>No Services Found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
                  {searchQuery || selectedCategory !== 'ALL'
                    ? `No treatments matching category "${selectedCategory}" or search query.`
                    : 'Add your first salon treatment to get started.'}
                </p>
                {selectedCategory !== 'ALL' && (
                  <button
                    onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                    className="btn-secondary"
                    style={{ marginRight: '10px', fontSize: '12px', textTransform: 'uppercase' }}
                  >
                    Reset Filters
                  </button>
                )}
                {isAdmin && (
                  <button onClick={handleOpenAddService} className="btn-primary">
                    <Plus size={15} />
                    <span>ADD TREATMENT</span>
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
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
                      {/* Top Badges (Category & Duration) */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{
                            padding: '3px 9px',
                            borderRadius: '4px',
                            background: '#18181b',
                            border: '1px solid #3f3f46',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Tag size={10} />
                            <span>{srv.category || 'Hair Care'}</span>
                          </span>

                          <span style={{
                            padding: '3px 9px',
                            borderRadius: '4px',
                            background: '#18181b',
                            border: '1px solid #27272a',
                            color: '#a1a1aa',
                            fontSize: '10px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Clock size={10} style={{ color: '#ffffff' }} />
                            <span>{formatDuration(srv.durationMinutes)}</span>
                          </span>
                        </div>

                        {/* Admin Edit & Delete Actions */}
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenEditService(srv)}
                              style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '4px' }}
                              title="Edit Treatment"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteService(srv.id, srv.name)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                              title="Delete Treatment"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '18px', marginBottom: '6px', color: '#ffffff', letterSpacing: '-0.01em' }}>
                        {srv.name}
                      </h3>

                      {/* Star Rating Display */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: '12px' }}>
                        <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '800' }}>
                          ★ {srv.rating ? Number(srv.rating).toFixed(1) : '4.8'}
                        </span>
                        <span style={{ color: '#71717a' }}>
                          ({srv.reviewCount || 24} reviews)
                        </span>
                      </div>

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
                          Rs. {Number(srv.price || 0).toLocaleString()}
                        </strong>
                      </div>

                      <button
                        onClick={() => handleOpenBookModal(srv)}
                        className="btn-primary"
                        style={{ padding: '9px 18px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                      >
                        BOOK NOW
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OUR STYLISTS */}
        {activeTab === 'stylists' && (
          <StylistsList
            currentUser={user}
            onBookWithStylist={handleBookWithStylist}
            onNotify={showToast}
          />
        )}

        {/* TAB 3: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <AppointmentsList
            currentUser={user}
            onOpenBookModal={() => handleOpenBookModal(null)}
            onNotify={showToast}
          />
        )}

      </main>

      {/* BOOK APPOINTMENT MODAL */}
      <BookAppointmentModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        selectedService={selectedServiceForBooking}
        selectedStylist={selectedStylistForBooking}
        services={services}
        currentUser={user}
        onBookingSuccess={(msg) => {
          showToast(msg);
          loadAllDashboardData();
          setActiveTab('appointments');
        }}
      />

      {/* ADD / EDIT SERVICE MODAL (Admin) */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-panel animate-scale-up" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '36px',
            background: '#09090b',
            border: '1px solid #3f3f46',
            boxShadow: '0 25px 50px rgba(0,0,0,0.95)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {editingServiceId ? 'EDIT TREATMENT' : 'ADD TREATMENT'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {editingServiceId ? 'Modify service duration, pricing and details' : 'Add new service to the booking catalog'}
                </p>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setEditingServiceId(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitService}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="glass-input"
                    style={{ width: '100%', background: '#18181b', color: '#ffffff' }}
                  >
                    <option value="Hair Care">Hair Care</option>
                    <option value="Skin & Facial">Skin & Facial</option>
                    <option value="Nails">Nails</option>
                    <option value="Bridal & Spa">Bridal & Spa</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 45"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    required
                    className="glass-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
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

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Rating (Stars) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="e.g. 4.9"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    required
                    className="glass-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
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

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingServiceId(null); }}
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
                  <span>{editingServiceId ? 'UPDATE TREATMENT' : 'SAVE TREATMENT'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating AI Chat Assistant (Dashboard only) */}
      <ChatWidget />
    </div>
  );
}

export default App;