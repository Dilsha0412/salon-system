import React from 'react';
import { TrendingUp, DollarSign, Calendar, Users, CheckCircle, Clock, AlertTriangle, Layers } from 'lucide-react';

const AdminAnalytics = ({ bookings = [], services = [], stylists = [], onOpenAddService, onOpenAddStylist, onSwitchTab }) => {
    // Analytics calculations
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => (b.status || 'CONFIRMED').toUpperCase() === 'CONFIRMED');
    const completedBookings = bookings.filter(b => (b.status || '').toUpperCase() === 'COMPLETED');
    const cancelledBookings = bookings.filter(b => (b.status || '').toUpperCase() === 'CANCELLED');

    // Calculate Estimated Revenue based on matched services
    const estimatedRevenue = bookings.reduce((acc, b) => {
        if ((b.status || '').toUpperCase() === 'CANCELLED') return acc;
        const matched = services.find(s => s.name?.toLowerCase() === b.serviceName?.toLowerCase());
        const price = matched ? Number(matched.price || 0) : 3500;
        return acc + price;
    }, 0);

    const completedRevenue = completedBookings.reduce((acc, b) => {
        const matched = services.find(s => s.name?.toLowerCase() === b.serviceName?.toLowerCase());
        const price = matched ? Number(matched.price || 0) : 3500;
        return acc + price;
    }, 0);

    return (
        <div className="animate-fade-in" style={{ marginBottom: '36px' }}>
            {/* KPI Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '28px'
            }}>
                {/* KPI 1: Estimated Revenue */}
                <div className="glass-panel" style={{ padding: '24px', border: '1px solid #27272a', background: '#09090b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            ESTIMATED REVENUE
                        </span>
                        <div style={{ padding: '6px', borderRadius: '6px', background: '#18181b', color: '#ffffff' }}>
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', marginBottom: '4px' }}>
                        Rs. {estimatedRevenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#a1a1aa' }}>
                        Completed: Rs. {completedRevenue.toLocaleString()}
                    </div>
                </div>

                {/* KPI 2: Total Bookings */}
                <div className="glass-panel" style={{ padding: '24px', border: '1px solid #27272a', background: '#09090b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            ACTIVE APPOINTMENTS
                        </span>
                        <div style={{ padding: '6px', borderRadius: '6px', background: '#18181b', color: '#ffffff' }}>
                            <Calendar size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', marginBottom: '4px' }}>
                        {confirmedBookings.length}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#a1a1aa' }}>
                        Total: {totalBookings} | Cancelled: {cancelledBookings.length}
                    </div>
                </div>

                {/* KPI 3: Total Services */}
                <div className="glass-panel" style={{ padding: '24px', border: '1px solid #27272a', background: '#09090b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            TREATMENTS CATALOG
                        </span>
                        <div style={{ padding: '6px', borderRadius: '6px', background: '#18181b', color: '#ffffff' }}>
                            <Layers size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', marginBottom: '4px' }}>
                        {services.length}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#a1a1aa' }}>
                        Active Salon Services
                    </div>
                </div>

                {/* KPI 4: Stylists On Duty */}
                <div className="glass-panel" style={{ padding: '24px', border: '1px solid #27272a', background: '#09090b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            MASTER STYLISTS
                        </span>
                        <div style={{ padding: '6px', borderRadius: '6px', background: '#18181b', color: '#ffffff' }}>
                            <Users size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', marginBottom: '4px' }}>
                        {stylists.length}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#a1a1aa' }}>
                        Certified Team Members
                    </div>
                </div>
            </div>

            {/* Quick Management Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
                border: '1px solid #27272a',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 28px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
            }}>
                <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Executive Management Mode Active
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', margin: 0 }}>
                        You have full authorization to manage service offerings, stylist staffing, and oversee all client reservations.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={onOpenAddService}
                        className="btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '11.5px', textTransform: 'uppercase' }}
                    >
                        + Add Service
                    </button>
                    <button
                        onClick={onOpenAddStylist}
                        className="btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '11.5px', textTransform: 'uppercase' }}
                    >
                        + Add Stylist
                    </button>
                    <button
                        onClick={() => onSwitchTab('appointments')}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '11.5px', textTransform: 'uppercase' }}
                    >
                        View All Client Bookings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
