import { useState, useEffect } from 'react';
import { getServices, addService } from './services/api';

function App() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  // Fetch services when page loads
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const data = await getServices();
    setServices(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    const newService = { name, description, price: parseFloat(price) };
    await addService(newService);

    // Clear form and reload list
    setName('');
    setDescription('');
    setPrice('');
    loadServices();
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#db2777' }}>Salon Management System</h1>

      {/* Form to add service */}
      <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Add New Salon Service </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="Service Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: '8px' }}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: '8px' }}
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{ padding: '8px' }}
          />
          <button type="submit" style={{ background: '#db2777', color: 'white', padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
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
    </div>
  );
}

export default App;