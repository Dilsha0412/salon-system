import { useState, useEffect } from 'react';
import { getServices, addService } from './services/api';
import { getCurrentUser, logoutUser } from './services/authService';
import Login from './components/Login';
import Register from './components/Register';
import ChatWidget from './components/ChatWidget';

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    // Check if user already logged in from localStorage
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      loadServices();
    }
  }, []);

  const loadServices = async () => {
    const data = await getServices();
    setServices(data);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    loadServices();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      const newService = { name, description, price: parseFloat(price) };
      await addService(newService);

      // Clear form and reload list
      setName('');
      setDescription('');
      setPrice('');
      loadServices();
      alert('Service added successfully! ✨');
    } catch (error) {
      alert(error.response?.data || 'Failed to add service. Please check your role permissions.');
    }
  };

  // If user is not logged in, show Login & Register forms
  if (!user) {
    return (
      <div style={{ padding: '40px 20px', fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ color: '#db2777', marginBottom: '8px' }}>Salon Management System</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Please login or register to access the salon dashboard</p>

        {/* Auth Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setAuthView('login')}
            style={{
              flex: 1,
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderRadius: '6px',
              border: 'none',
              background: authView === 'login' ? '#3b82f6' : '#e5e7eb',
              color: authView === 'login' ? 'white' : '#374151'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setAuthView('register')}
            style={{
              flex: 1,
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderRadius: '6px',
              border: 'none',
              background: authView === 'register' ? '#10b981' : '#e5e7eb',
              color: authView === 'register' ? 'white' : '#374151'
            }}
          >
            Register
          </button>
        </div>

        {authView === 'login' ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <Register onRegisterSuccess={handleLoginSuccess} />
        )}
      </div>
    );
  }

  // If user is logged in, show Dashboard
  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header with User Info & Logout Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px', marginBottom: '25px' }}>
        <div>
          <h1 style={{ color: '#db2777', margin: '0 0 5px 0' }}>Salon Dashboard</h1>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>
            Logged in as: <strong>{user.fullName}</strong> (<span style={{ color: '#2563eb', fontWeight: 'bold' }}>{user.role}</span>)
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </div>

      {/* Form to add service (Admin / Stylist) */}
      <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Add New Salon Service</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="Service Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
          />
          <input
            type="number"
            placeholder="Price (LKR)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
          />
          <button type="submit" style={{ background: '#db2777', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Add Service
          </button>
        </form>
      </div>

      {/* List of services */}
      <div>
        <h3>Available Salon Services</h3>
        {services.length === 0 ? (
          <p>No services found. Add one above!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {services.map((srv) => (
              <li key={srv.id} style={{ background: 'white', border: '1px solid #e5e7eb', padding: '15px', marginBottom: '10px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>{srv.name}</h4>
                <p style={{ margin: '0 0 5px 0', color: '#4b5563' }}>{srv.description}</p>
                <strong style={{ color: '#059669' }}>LKR {srv.price}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ChatWidget />
    </div>
  );
}

export default App;