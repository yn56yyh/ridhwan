import React from 'react';
import { useGame } from '../context/GameContext';
import { ArrowLeft, Plus, Calendar, MapPin, Target, BarChart2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import './LeagueDetail.css';

const LeagueDetail = ({ eventId, onBack, onAddSession, onSessionClick }) => {
    const { getEventById, deleteEvent, deleteSession } = useGame();
    const event = getEventById(eventId);

    if (!event) {
        return (
            <div className="league-detail-container">
                <p>Event not found</p>
                <button onClick={onBack}>Go Back</button>
            </div>
        );
    }

    const totalGamesCompleted = event.sessions.reduce((sum, session) =>
        sum + session.games.length, 0
    );

    const averageScore = event.sessions.reduce((sum, session) => {
        const sessionTotal = session.games.reduce((s, game) => s + game.score, 0);
        return sum + sessionTotal;
    }, 0) / (totalGamesCompleted || 1);

    const highScore = event.sessions.reduce((max, session) => {
        const sessionMax = Math.max(...session.games.map(g => g.score), 0);
        return Math.max(max, sessionMax);
    }, 0);

    const handleDeleteEvent = async () => {
        if (window.confirm(`Are you sure you want to delete "${event.name}"? This will delete all sessions and games.`)) {
            await deleteEvent(eventId);
            onBack();
        }
    };

    const handleDeleteSession = async (sessionId) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            await deleteSession(sessionId);
        }
    };

    return (
        <div className="league-detail-container">
            <header className="league-detail-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1>{event.name}</h1>
                <button
                    className="delete-button"
                    onClick={handleDeleteEvent}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Trash2 size={20} />
                </button>
            </header>

            <div className="event-meta">
                <div className="meta-item">
                    <MapPin size={16} />
                    <span>{event.bowlingAlley}</span>
                </div>
                <div className="meta-item">
                    <Target size={16} />
                    <span>{totalGamesCompleted} games played</span>
                </div>
            </div>

            {totalGamesCompleted > 0 && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Average</div>
                        <div className="stat-value">{Math.round(averageScore)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">High Score</div>
                        <div className="stat-value">{highScore}</div>
                    </div>
                </div>
            )}

            {event.status !== 'completed' && (
                <button className="btn btn-primary add-session-btn" onClick={onAddSession}>
                    <Plus size={20} />
                    Add Session
                </button>
            )}

            <div className="sessions-section">
                <h2>Sessions</h2>
                {event.sessions.length === 0 ? (
                    <p className="no-sessions">No sessions yet. Add your first session to start tracking!</p>
                ) : (
                    <div className="sessions-list">
                        {event.sessions.map((session, index) => (
                            <div
                                key={session.id}
                                className="session-card"
                                onClick={() => onSessionClick(session)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="session-header">
                                    <Calendar size={16} />
                                    <span>{format(new Date(session.date), 'MMM d, yyyy')}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSession(session.id);
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                            marginLeft: 'auto',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="session-games">
                                    {session.games.map((game, gameIndex) => (
                                        <div key={gameIndex} className="game-score">
                                            Game {gameIndex + 1}: <strong>{game.score}</strong>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    style={{
                                        marginTop: '0.75rem',
                                        width: '100%',
                                        padding: '0.5rem',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSessionClick(session);
                                    }}
                                >
                                    <BarChart2 size={16} /> View Dashboard
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeagueDetail;
