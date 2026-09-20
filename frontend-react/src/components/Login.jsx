import React, { useState, useEffect } from 'react';
import { loginUser } from '../services/authService';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

function Login({ onLoginSuccess, onSwitchToRegister, initialEmail = '' }) {
    const [credentials, setCredentials] = useState({
        email: initialEmail || '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (initialEmail) {
            setCredentials(prev => ({ ...prev, email: initialEmail }));
        }
    }, [initialEmail]);

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await loginUser(credentials);
            if (onLoginSuccess) {
                onLoginSuccess(data);
            }
        } catch (err) {
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '440px', width: '100%', margin: '0 auto', textAlign: 'left', border: '1px solid #27272a' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
                    S
                </div>
                <h2 style={{ fontSize: '24px', letterSpacing: '-0.02em', marginBottom: '6px', color: '#ffffff' }}>AUTHENTICATION</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', letterSpacing: '0.3px' }}>Sign in to access your luxury salon account</p>
            </div>

            {error && (
                <div style={{
                    background: '#18181b',
                    border: '1px solid #52525b',
                    color: '#ffffff',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, color: '#ffffff' }} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                        <input
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            className="glass-input"
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '26px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={handleChange}
                            required
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

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ width: '100%', padding: '14px', fontSize: '14px' }}
                >
                    {loading ? (
                        <span>AUTHENTICATING...</span>
                    ) : (
                        <>
                            <span>SIGN IN</span>
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>

            <div style={{ marginTop: '28px', textAlign: 'center', borderTop: '1px solid var(--black-border)', paddingTop: '20px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
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
                        Create Account
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;
