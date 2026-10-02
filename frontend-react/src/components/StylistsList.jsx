import React, { useState, useEffect } from 'react';
import { getStylists, addStylist } from '../services/api';
import { Scissors, UserCheck, Plus, Search, Phone, Mail, Sparkles, CheckCircle, Trash2, Calendar } from 'lucide-react';

const StylistsList = ({ currentUser, onBookWithStylist, onNotify }) => {
    const [stylists, setStylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Add Stylist Modal State (Admin)
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadStylists();
    }, []);

    const loadStylists = async () => {
        setLoading(true);
        try {
            const data = await getStylists();
            setStylists(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading stylists:", err);
            onNotify("Could not load stylists list.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddStylist = async (e) => {
        e.preventDefault();
        if (!name || !specialty) return;

        setSubmitting(true);
        try {
            const payload = {
                name: name.trim(),
                specialty: specialty.trim(),
                phone: phone.trim() || '0770000000',
                email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@salon.com`,
                active: true
            };
            await addStylist(payload);
            onNotify(`Stylist "${name}" added successfully!`);
            setShowAddModal(false);
            setName('');
            setSpecialty('');
            setPhone('');
            setEmail('');
            loadStylists();
        } catch (err) {
            console.error("Failed to add stylist:", err);
            alert("Failed to add stylist. Please ensure admin privileges.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStylists = stylists.filter(st => {
        const query = searchQuery.toLowerCase();
        return st.name?.toLowerCase().includes(query) ||
               st.specialty?.toLowerCase().includes(query) ||
               st.email?.toLowerCase().includes(query);
    });

    const getInitials = (fullName = '') => {
        const parts = fullName.trim().split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return fullName.slice(0, 2).toUpperCase() || 'ST';
    };

    return (
        <div>
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
                        Master Stylists & Artists
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        Meet our certified hair sculptors, colorists, and skin therapists
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Search Input */}
                    <div style={{ position: 'relative', width: '260px' }}>
                        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                        <input
                            type="text"
                            placeholder="Search stylists..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="glass-input"
                            style={{ paddingLeft: '36px', fontSize: '13px' }}
                        />
                    </div>

                    {/* Add Stylist Button (Admin) */}
                    {currentUser?.role === 'ADMIN' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary"
                            style={{ padding: '10px 18px', fontSize: '12px', textTransform: 'uppercase' }}
                        >
                            <Plus size={14} />
                            <span>ADD STYLIST</span>
                        </button>
                    )}
                </div>
            </section>

            {/* Stylists Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    <p>Loading stylists...</p>
                </div>
            ) : filteredStylists.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid #27272a' }}>
                    <UserCheck size={40} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#ffffff' }}>No Stylists Found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
                        {searchQuery ? 'Try another search query.' : 'Add your first salon stylist to get started.'}
                    </p>
                    {currentUser?.role === 'ADMIN' && (
                        <button onClick={() => setShowAddModal(true)} className="btn-primary">
                            <Plus size={15} />
                            <span>ADD FIRST STYLIST</span>
                        </button>
                    )}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '24px'
                }}>
                    {filteredStylists.map((st) => (
                        <div
                            key={st.id}
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
                                {/* Top Avatar & Active Status */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: '#ffffff',
                                        color: '#000000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                        fontWeight: '900',
                                        boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)'
                                    }}>
                                        {getInitials(st.name)}
                                    </div>

                                    <span style={{
                                        fontSize: '10.5px',
                                        fontWeight: '700',
                                        padding: '3px 10px',
                                        borderRadius: '20px',
                                        background: '#18181b',
                                        border: '1px solid #3f3f46',
                                        color: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                                        AVAILABLE
                                    </span>
                                </div>

                                {/* Stylist Info */}
                                <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
                                    {st.name}
                                </h3>

                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: '#d4d4d8',
                                    marginBottom: '16px',
                                    display: 'inline-block',
                                    background: '#18181b',
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    border: '1px solid #27272a'
                                }}>
                                    {st.specialty || 'General Hair & Beauty Specialist'}
                                </div>

                                {/* Contact Details */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '22px' }}>
                                    {st.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Phone size={13} style={{ color: '#a1a1aa' }} />
                                            <span>{st.phone}</span>
                                        </div>
                                    )}
                                    {st.email && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Mail size={13} style={{ color: '#a1a1aa' }} />
                                            <span style={{ fontSize: '12px' }}>{st.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Book With Stylist Button */}
                            <div style={{ borderTop: '1px solid #27272a', paddingTop: '16px' }}>
                                <button
                                    onClick={() => onBookWithStylist(st)}
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Calendar size={14} />
                                    <span>BOOK WITH {st.name.split(' ')[0].toUpperCase()}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD STYLIST MODAL (Admin) */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="glass-panel animate-scale-up" style={{
                        maxWidth: '480px',
                        width: '100%',
                        padding: '36px',
                        background: '#09090b',
                        border: '1px solid #3f3f46',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ADD STYLIST</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0 0' }}>Register a new professional to the salon team</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddStylist}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Kasun Fernando"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="glass-input"
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                    Specialty / Title *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Creative Hair Director & Color Specialist"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    required
                                    className="glass-input"
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="0771234567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="glass-input"
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="kasun@salon.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    disabled={submitting}
                                >
                                    <Plus size={15} />
                                    <span>{submitting ? 'SAVING...' : 'SAVE STYLIST'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StylistsList;
