import React from 'react';
import { useGame } from '../context/GameContext';
import { Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const GameHistory = () => {
    const { sessions, deleteSession } = useGame();

    if (sessions.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No games played yet.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sessions.map(session => (
                <div key={session.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            <Calendar size={14} />
                            {format(new Date(session.date), 'MMM d, yyyy h:mm a')}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                            {session.score} <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 'normal' }}>pts</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this game?')) {
                                deleteSession(session.id);
                            }
                        }}
                        style={{ color: 'var(--danger-color)', background: 'none', padding: '0.5rem' }}
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default GameHistory;
