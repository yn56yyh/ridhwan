import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User, Mail, LogOut, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUser();
    }, []);

    const getUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            window.location.reload(); // Reload to show auth screen
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (loading) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* User Info Card */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-color), var(--success-color))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <User size={32} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Profile</h2>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Manage your account
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Email */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '0.5rem'
                    }}>
                        <Mail size={20} color="var(--accent-color)" />
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email</div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{user?.email}</div>
                        </div>
                    </div>

                    {/* User ID */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '0.5rem'
                    }}>
                        <User size={20} color="var(--accent-color)" />
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>User ID</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                                {user?.id?.substring(0, 8)}...
                            </div>
                        </div>
                    </div>

                    {/* Account Created */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '0.5rem'
                    }}>
                        <Calendar size={20} color="var(--accent-color)" />
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Member Since</div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                {user?.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sign Out Button */}
            <button
                onClick={handleSignOut}
                className="btn"
                style={{
                    background: '#ef4444',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: '600'
                }}
            >
                <LogOut size={20} />
                Sign Out
            </button>

            {/* App Info */}
            <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Bowling Performance Tracker
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Version 1.0.0
                </p>
            </div>
        </div>
    );
};

export default Profile;
