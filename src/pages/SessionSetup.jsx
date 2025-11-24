import React, { useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import './SessionSetup.css';

const SessionSetup = ({ event, onBack, onStart }) => {
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [gamesCount, setGamesCount] = useState(3);

    const totalGamesCompleted = event.sessions.reduce((sum, session) =>
        sum + session.games.length, 0
    );

    const handleStart = () => {
        onStart({
            date: new Date(sessionDate).toISOString(),
            gamesCount: gamesCount
        });
    };

    return (
        <div className="session-setup-container">
            <header className="session-setup-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1>New Session</h1>
            </header>

            <div className="session-info-card">
                <h2>{event.name}</h2>
                <p>{event.bowlingAlley}</p>
                <div className="progress-info">
                    {totalGamesCompleted} games played so far
                </div>
            </div>

            <div className="session-form">
                <div className="form-group">
                    <label htmlFor="date">
                        <Calendar size={16} />
                        Session Date
                    </label>
                    <input
                        id="date"
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="games">Games for this Session</label>
                    <input
                        id="games"
                        type="number"
                        min="1"
                        value={gamesCount}
                        onChange={(e) => setGamesCount(parseInt(e.target.value))}
                    />
                    <p className="help-text">
                        How many games will you bowl tonight?
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleStart}
                    disabled={gamesCount < 1}
                >
                    Start Tracking
                </button>
            </div>
        </div>
    );
};

export default SessionSetup;
