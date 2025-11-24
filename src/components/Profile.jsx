import React from 'react';
import { useGame } from '../context/GameContext';
import { User, Trash2, Database } from 'lucide-react';

const Profile = () => {
    const { sessions } = useGame();

    const handleClearData = () => {
        if (confirm('WARNING: This will delete ALL your game history. This action cannot be undone. Are you sure?')) {
            localStorage.removeItem('bowling_sessions');
            window.location.reload();
        }
    };

    // Calculate stats
    const totalGames = sessions.length;
    const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
    const averageScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
    const highScore = totalGames > 0 ? Math.max(...sessions.map(s => s.score)) : 0;

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)',
                    margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <User size={40} color="var(--accent-color)" />
                </div>
                <h2>Local User</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Member since {new Date().getFullYear()}</p>
            </div>

            <div className="card">
                <h3>Career Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Games Bowled</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{totalGames}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Average</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{averageScore}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>High Score</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{highScore}</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Data Management</h3>
                <button
                    onClick={handleClearData}
                    className="btn"
                    style={{
                        width: '100%', marginTop: '1rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--danger-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                >
                    <Trash2 size={18} /> Clear All Data
                </button>
            </div>
        </div>
    );
};

export default Profile;
