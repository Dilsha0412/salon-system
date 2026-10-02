import React, { useState, useEffect } from 'react';
import { getAllBookings, getCustomerBookings, cancelBooking, updateBookingStatus } from '../services/api';
import { Calendar, Clock, User, Scissors, XCircle, CheckCircle, RefreshCw, AlertCircle, Plus, Check, ShieldCheck } from 'lucide-react';

const AppointmentsList = ({ currentUser, onOpenBookModal, onNotify }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const isAdmin = currentUser?.role === 'ADMIN';
    const savedPhone = localStorage.getItem('user_phone') || currentUser?.phone || '';

    useEffect(() => {
        loadBookings();
    }, [currentUser]);

    const loadBookings = async () => {
        setLoading(true);
        try {
            let data = [];
            if (isAdmin) {
                data = await getAllBookings();
            } else if (savedPhone) {
                data = await getCustomerBookings(savedPhone);
                if (data.length === 0) {
                    const all = await getAllBookings();
                    data = all.filter(b => b.customerName?.toLowerCase() === currentUser?.fullName?.toLowerCase());
                }
            } else {
                const all = await getAllBookings();
                data = all.filter(b => b.customerName?.toLowerCase() === currentUser?.fullName?.toLowerCase());
            }

            data.sort((a, b) => (b.id || 0) - (a.id || 0));
            setBookings(data);
        } catch (err) {
            console.error("Failed to load bookings:", err);
            onNotify("Could not refresh appointments list.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId, newStatus, serviceName) => {
        setActionLoadingId(bookingId);
        try {
            await updateBookingStatus(bookingId, newStatus);
            onNotify(`Booking for "${serviceName}" marked as ${newStatus}!`);
            loadBookings();
        } catch (err) {
            console.error("Failed to update status:", err);
            onNotify("Failed to update booking status.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCancel = async (bookingId, serviceName) => {
        if (!window.confirm(`Are you sure you want to cancel the appointment for "${serviceName}"?`)) {
            return;
        }

        setActionLoadingId(bookingId);
        try {
            await cancelBooking(bookingId);
            onNotify(`Appointment for "${serviceName}" has been cancelled.`);
            loadBookings();
        } catch (err) {
            console.error("Failed to cancel appointment:", err);
            onNotify("Failed to cancel appointment. Please try again.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (filter === 'ALL') return true;
        return (b.status || 'CONFIRMED').toUpperCase() === filter;
    });

    const getStatusBadge = (status = 'CONFIRMED') => {
        const st = status.toUpperCase();
        if (st === 'CONFIRMED') {
            return (
                <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    background: '#ffffff',
                    color: '#000000',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    CONFIRMED
                </span>
            );
        }
        if (st === 'COMPLETED') {
            return (
                <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    background: '#15803d',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    COMPLETED
                </span>
            );
        }
        if (st === 'CANCELLED') {
            return (
                <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    background: '#27272a',
                    color: '#a1a1aa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textDecoration: 'line-through'
                }}>
                    CANCELLED
                </span>
            );
        }
        return (
            <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: '4px',
                background: '#18181b',
                color: '#d4d4d8',
                border: '1px solid #3f3f46',
                textTransform: 'uppercase'
            }}>
                {st}
            </span>
        );
    };

    return (
        <div>
            {/* Action Bar & Filters */}
            <div style={{
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isAdmin && <ShieldCheck size={20} style={{ color: '#ffffff' }} />}
                        <h2 style={{ fontSize: '22px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                            {isAdmin ? 'ALL CLIENT APPOINTMENTS (ADMIN)' : 'MY APPOINTMENTS'}
                        </h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                        {isAdmin
                            ? `Master oversight of all client reservations across the entire salon (${bookings.length} total)`
                            : 'Track and manage your personal salon sessions and booking status'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Status Filter Pills */}
                    <div style={{ display: 'flex', background: '#18181b', padding: '3px', borderRadius: '6px', border: '1px solid #27272a' }}>
                        {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: filter === tab ? '#ffffff' : 'transparent',
                                    color: filter === tab ? '#000000' : 'var(--text-muted)',
                                    fontWeight: filter === tab ? '800' : '600',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={loadBookings}
                        className="btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '12px' }}
                        title="Refresh List"
                        disabled={loading}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>

                    {/* Book New Button */}
                    <button
                        onClick={onOpenBookModal}
                        className="btn-primary"
                        style={{ padding: '9px 18px', fontSize: '12px', textTransform: 'uppercase' }}
                    >
                        <Plus size={14} />
                        <span>BOOK APPOINTMENT</span>
                    </button>
                </div>
            </div>

            {/* List Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Loading appointment schedule...
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="glass-panel" style={{
                    padding: '60px 24px',
                    textAlign: 'center',
                    border: '1px solid #27272a',
                    borderRadius: 'var(--radius-lg)'
                }}>
                    <Calendar size={40} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#ffffff' }}>
                        No Appointments Found
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', maxWidth: '400px', margin: '0 auto 24px' }}>
                        {filter === 'ALL'
                            ? "No reservations found in the database. Book a luxurious treatment today!"
                            : `No appointments matching the status "${filter}".`}
                    </p>
                    <button
                        onClick={onOpenBookModal}
                        className="btn-primary"
                        style={{ padding: '12px 24px', fontSize: '12px', textTransform: 'uppercase' }}
                    >
                        <Plus size={15} />
                        <span>BOOK FIRST APPOINTMENT</span>
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                    {filteredBookings.map((booking) => {
                        const status = (booking.status || 'CONFIRMED').toUpperCase();
                        const isCancelled = status === 'CANCELLED';
                        const isCompleted = status === 'COMPLETED';

                        return (
                            <div
                                key={booking.id}
                                className="glass-panel"
                                style={{
                                    padding: '24px',
                                    border: isCancelled ? '1px solid #27272a' : isCompleted ? '1px solid #166534' : '1px solid #3f3f46',
                                    opacity: isCancelled ? 0.65 : 1,
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    background: '#09090b'
                                }}
                            >
                                <div>
                                    {/* Card Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                                        <div>
                                            <span style={{ fontSize: '10px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '2px' }}>
                                                ID #{booking.id}
                                            </span>
                                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                                                {booking.serviceName || 'Custom Salon Treatment'}
                                            </h3>
                                        </div>
                                        {getStatusBadge(booking.status)}
                                    </div>

                                    {/* Date & Time Info */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'center',
                                        background: '#18181b',
                                        padding: '10px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid #27272a',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontSize: '13px', fontWeight: '700' }}>
                                            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                                            <span>{booking.appointmentDate || 'Today'}</span>
                                        </div>
                                        <span style={{ color: '#3f3f46' }}>•</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontSize: '13px', fontWeight: '700' }}>
                                            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                                            <span>{booking.appointmentTime || '09:00 AM'}</span>
                                        </div>
                                    </div>

                                    {/* Stylist & Customer Details */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Scissors size={13} style={{ color: '#a1a1aa' }} />
                                            <span>Stylist: <strong style={{ color: '#ffffff' }}>{booking.stylistName || 'Any Available Stylist'}</strong></span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <User size={13} style={{ color: '#a1a1aa' }} />
                                            <span>Client: <strong style={{ color: '#ffffff' }}>{booking.customerName}</strong> <span style={{ color: '#a1a1aa' }}>({booking.customerPhone})</span></span>
                                        </div>
                                        {booking.notes && (
                                            <div style={{ fontSize: '12px', color: '#a1a1aa', fontStyle: 'italic', marginTop: '4px', background: '#18181b', padding: '6px 10px', borderRadius: '4px', border: '1px solid #27272a' }}>
                                                "{booking.notes}"
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Area */}
                                <div style={{
                                    borderTop: '1px solid #27272a',
                                    paddingTop: '14px',
                                    marginTop: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}>
                                    {/* Admin Quick Status Actions */}
                                    {isAdmin ? (
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                                            {status !== 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED', booking.serviceName)}
                                                    disabled={actionLoadingId === booking.id}
                                                    style={{
                                                        background: '#ffffff',
                                                        color: '#000000',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    Approve
                                                </button>
                                            )}

                                            {status !== 'COMPLETED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'COMPLETED', booking.serviceName)}
                                                    disabled={actionLoadingId === booking.id}
                                                    style={{
                                                        background: '#15803d',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    Complete
                                                </button>
                                            )}

                                            {!isCancelled && (
                                                <button
                                                    onClick={() => handleCancel(booking.id, booking.serviceName)}
                                                    disabled={actionLoadingId === booking.id}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid #3f3f46',
                                                        color: '#ef4444',
                                                        padding: '6px 12px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        /* Customer Action */
                                        !isCancelled && status !== 'COMPLETED' && (
                                            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleCancel(booking.id, booking.serviceName)}
                                                    disabled={actionLoadingId === booking.id}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid #3f3f46',
                                                        color: '#ef4444',
                                                        padding: '6px 14px',
                                                        borderRadius: '4px',
                                                        fontSize: '11.5px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    <XCircle size={13} />
                                                    <span>{actionLoadingId === booking.id ? 'CANCELLING...' : 'CANCEL APPOINTMENT'}</span>
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AppointmentsList;
