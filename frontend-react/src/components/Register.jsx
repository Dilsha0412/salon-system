import React, { useState } from 'react';
import { registerUser } from '../services/authService';
import { User, Mail, Lock, Phone, ArrowRight, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'CUSTOMER'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await registerUser(formData);
            if (onRegisterSuccess) {
                onRegisterSuccess(data);
            }
        } catch (err) {
            setError(err.message || 'Registration failed. Please check your information.');
        } finally {
            setLoading(false);
        }
    };

    const isEmailAlreadyExists = error.toLowerCase().includes('already exists') || error.toLowerCase().includes('already registered');

    return (
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '480px', width: '100%', margin: '0 auto', textAlign: 'left', border: '1px solid #27272a' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    fontWeight: '900',
                    fontSize: '20px'
                }}>
                    +
                </div>
                <h2 style={{ fontSize: '24px', letterSpacing: '-0.02em', marginBottom: '6px', color: '#ffffff' }}>REGISTRATION</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', letterSpacing: '0.3px' }}>Create an account to manage bookings & treatments</p>
            </div>

            {error && (
                <div style={{
                    background: '#18181b',
                    border: '1px solid #52525b',
                    color: '#ffffff',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertCircle size={18} style={{ flexShrink: 0, color: '#ffffff' }} />
                        <span>{error}</span>
                    </div>
                    {isEmailAlreadyExists && (
                        <button
                            type="button"
                            onClick={() => onSwitchToLogin(formData.email)}
                            style={{
                                background: '#ffffff',
                                color: '#000000',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontWeight: '700',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <LogIn size={14} />
                            <span>This account exists! Click here to Sign In instead</span>
                        </button>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                        <input
                            type="text"
                            name="fullName"
                            placeholder="e.g. Chamal Silva"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="glass-input"
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>

                {/* Email Address */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                        <input
                            type="email"
                            name="email"
                            placeholder="new.email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="glass-input"
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>

                {/* Phone Number */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Phone Number
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="0771234567"
                            value={formData.phone}
                            onChange={handleChange}
                            className="glass-input"
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Password (Min. 6 Characters)
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="glass-input"
                            style={{ paddingLeft: '40px', paddingRight: '40px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-subtle)',
                                cursor: 'pointer',
                                display: 'flex'
                            }}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Role Selector */}
                <div style={{ marginBottom: '26px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Select Role
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {[
                            { id: 'CUSTOMER', label: 'Customer' },
                            { id: 'STYLIST', label: 'Stylist' },
                            { id: 'ADMIN', label: 'Admin' }
                        ].map(item => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleRoleSelect(item.id)}
                                style={{
                                    padding: '12px 8px',
                                    borderRadius: 'var(--radius-md)',
                                    border: formData.role === item.id ? '1px solid #ffffff' : '1px solid #27272a',
                                    background: formData.role === item.id ? '#ffffff' : '#09090b',
                                    color: formData.role === item.id ? '#000000' : 'var(--text-muted)',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)'
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ width: '100%', padding: '14px', fontSize: '14px' }}
                >
                    {loading ? (
                        <span>CREATING ACCOUNT...</span>
                    ) : (
                        <>
                            <span>REGISTER</span>
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>

            <div style={{ marginTop: '28px', textAlign: 'center', borderTop: '1px solid var(--black-border)', paddingTop: '20px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Already registered?{' '}
                    <button
                        type="button"
                        onClick={() => onSwitchToLogin(formData.email)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#ffffff',
                            fontWeight: '700',
                            cursor: 'pointer',
                            padding: '0 4px',
                            textDecoration: 'underline'
                        }}
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Register;
