import React, { useState, useEffect } from 'react';
import { getStylists, getAvailableSlots, createBooking } from '../services/api';
import { Calendar, Clock, User, Phone, FileText, Sparkles, X, CheckCircle, AlertCircle } from 'lucide-react';

const BookAppointmentModal = ({ isOpen, onClose, selectedService, selectedStylist, services = [], currentUser, onBookingSuccess }) => {
    const [serviceName, setServiceName] = useState('');
    const [stylists, setStylists] = useState([]);
    const [selectedStylistId, setSelectedStylistId] = useState('');
    const [selectedStylistName, setSelectedStylistName] = useState('');
    
    // Default to today's date in YYYY-MM-DD format
    const todayStr = new Date().toISOString().split('T')[0];
    const [appointmentDate, setAppointmentDate] = useState(todayStr);
    
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
    const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || localStorage.getItem('user_phone') || '');
    const [notes, setNotes] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Pre-populate service & stylist when modal opens
    useEffect(() => {
        if (selectedService) {
            setServiceName(selectedService.name);
        } else if (services.length > 0) {
            setServiceName(services[0].name);
        }

        if (selectedStylist) {
            setSelectedStylistId(String(selectedStylist.id));
            setSelectedStylistName(selectedStylist.name);
        } else {
            setSelectedStylistId('');
            setSelectedStylistName('');
        }
    }, [selectedService, selectedStylist, services, isOpen]);

    // Load Stylists on mount
    useEffect(() => {
        if (isOpen) {
            loadStylists();
            if (currentUser?.fullName) setCustomerName(currentUser.fullName);
            if (currentUser?.phone) setCustomerPhone(currentUser.phone);
        }
    }, [isOpen, currentUser]);

    const loadStylists = async () => {
        try {
            const data = await getStylists();
            setStylists(data);
        } catch (err) {
            console.error("Failed to load stylists:", err);
        }
    };

    // Load available time slots whenever date or stylist changes
    useEffect(() => {
        if (isOpen && appointmentDate) {
            loadSlots();
        }
    }, [isOpen, appointmentDate, selectedStylistId]);

    const loadSlots = async () => {
        setLoadingSlots(true);
        setSelectedTimeSlot('');
        try {
            const slots = await getAvailableSlots(appointmentDate, selectedStylistId || null);
            setAvailableSlots(slots);
            if (slots.length > 0) {
                setSelectedTimeSlot(slots[0]);
            }
        } catch (err) {
            console.error("Error loading slots:", err);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleStylistChange = (e) => {
        const stylistId = e.target.value;
        setSelectedStylistId(stylistId);
        const found = stylists.find(s => String(s.id) === String(stylistId));
        setSelectedStylistName(found ? found.name : '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!serviceName) {
            setErrorMsg('Please select a salon treatment.');
            return;
        }
        if (!appointmentDate) {
            setErrorMsg('Please choose an appointment date.');
            return;
        }
        if (!selectedTimeSlot) {
            setErrorMsg('Please select a valid time slot.');
            return;
        }
        if (!customerPhone || customerPhone.trim().length < 9) {
            setErrorMsg('Please provide a valid contact phone number.');
            return;
        }

        setSubmitting(true);
        try {
            const bookingPayload = {
                customerName: customerName || currentUser?.fullName || 'Valued Guest',
                customerPhone: customerPhone.trim(),
                serviceName: serviceName,
                appointmentDate: appointmentDate,
                appointmentTime: selectedTimeSlot,
                stylistId: selectedStylistId ? Number(selectedStylistId) : null,
                stylistName: selectedStylistName || 'Any Available Stylist',
                notes: notes.trim(),
                status: 'CONFIRMED'
            };

            // Save phone to localStorage for easy subsequent bookings
            localStorage.setItem('user_phone', customerPhone.trim());

            await createBooking(bookingPayload);
            onBookingSuccess(`Appointment for "${serviceName}" booked successfully on ${appointmentDate} at ${selectedTimeSlot}!`);
            onClose();
        } catch (err) {
            console.error("Booking error:", err);
            setErrorMsg(err.response?.data?.message || err.message || 'Failed to confirm booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
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
                maxWidth: '560px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '32px',
                position: 'relative',
                border: '1px solid #3f3f46'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px'
                    }}
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: '#27272a',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                    }}>
                        <Sparkles size={13} />
                        <span>EXECUTIVE RESERVATION</span>
                    </div>
                    <h2 style={{ fontSize: '24px', letterSpacing: '0.5px', color: '#ffffff', margin: 0 }}>
                        Book Salon Appointment
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                        Select your preferred treatment, master stylist, and time slot.
                    </p>
                </div>

                {errorMsg && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '20px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <AlertCircle size={16} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    
                    {/* Treatment Selection */}
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            Selected Treatment
                        </label>
                        <select
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', fontSize: '13.5px', padding: '12px 14px' }}
                            required
                        >
                            {services.length === 0 && (
                                <option value={selectedService?.name || 'Haircut & Styling'}>
                                    {selectedService?.name || 'Haircut & Styling'}
                                </option>
                            )}
                            {services.map((srv) => (
                                <option key={srv.id || srv.name} value={srv.name} style={{ background: '#18181b', color: '#ffffff' }}>
                                    {srv.name} — Rs. {Number(srv.price || 0).toLocaleString()}
                                </option>
                            ))}
                        </select>
                        {(() => {
                            const current = services.find(s => s.name === serviceName) || selectedService;
                            if (!current) return null;
                            const dur = current.durationMinutes || 45;
                            const durText = dur >= 60 ? `${(dur / 60).toFixed(dur % 60 === 0 ? 0 : 1)} hrs` : `${dur} mins`;
                            return (
                                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff' }}>
                                        <Clock size={12} /> {durText} duration
                                    </span>
                                    <span>•</span>
                                    <span style={{ color: '#fbbf24', fontWeight: '700' }}>
                                        ★ {current.rating || 4.8} ({current.reviewCount || 24} reviews)
                                    </span>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Stylist Selection */}
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            Preferred Stylist
                        </label>
                        <select
                            value={selectedStylistId}
                            onChange={handleStylistChange}
                            className="glass-input"
                            style={{ width: '100%', fontSize: '13.5px', padding: '12px 14px' }}
                        >
                            <option value="" style={{ background: '#18181b', color: '#ffffff' }}>
                                ✨ Any Available Stylist
                            </option>
                            {stylists.map((st) => (
                                <option key={st.id} value={st.id} style={{ background: '#18181b', color: '#ffffff' }}>
                                    {st.name} ({st.specialty || 'Stylist'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Picker */}
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            Appointment Date
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="date"
                                min={todayStr}
                                value={appointmentDate}
                                onChange={(e) => setAppointmentDate(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', fontSize: '13.5px', padding: '12px 14px', colorScheme: 'dark' }}
                                required
                            />
                        </div>
                    </div>

                    {/* Time Slot Selection */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                Available Time Slots
                            </label>
                            {loadingSlots && <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Checking slots...</span>}
                        </div>

                        {availableSlots.length === 0 && !loadingSlots ? (
                            <div style={{ padding: '14px', textAlign: 'center', background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', color: '#71717a', fontSize: '12px' }}>
                                No time slots available for this date/stylist. Please choose another date.
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                                gap: '8px',
                                maxHeight: '140px',
                                overflowY: 'auto',
                                padding: '4px'
                            }}>
                                {availableSlots.map((slot) => {
                                    const isSelected = selectedTimeSlot === slot;
                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setSelectedTimeSlot(slot)}
                                            style={{
                                                padding: '9px 6px',
                                                borderRadius: '6px',
                                                border: isSelected ? '1px solid #ffffff' : '1px solid #27272a',
                                                background: isSelected ? '#ffffff' : '#18181b',
                                                color: isSelected ? '#000000' : '#d4d4d8',
                                                fontWeight: isSelected ? '800' : '500',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {slot}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Contact Phone & Name */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                Client Name
                            </label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="glass-input"
                                placeholder="Your Name"
                                style={{ width: '100%', fontSize: '13px' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="glass-input"
                                placeholder="0771234567"
                                style={{ width: '100%', fontSize: '13px' }}
                                required
                            />
                        </div>
                    </div>

                    {/* Special Notes */}
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            Special Requests / Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="glass-input"
                            rows={2}
                            placeholder="Allergies, preferences, or hair length notes..."
                            style={{ width: '100%', fontSize: '12.5px', resize: 'vertical' }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase' }}
                            disabled={submitting}
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ padding: '12px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                            disabled={submitting || availableSlots.length === 0}
                        >
                            {submitting ? 'CONFIRMING...' : 'CONFIRM APPOINTMENT'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookAppointmentModal;
