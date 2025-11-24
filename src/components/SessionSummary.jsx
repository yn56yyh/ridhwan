import React from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import './SessionSummary.css';

const SessionSummary = ({ sessionData, onComplete }) => {
    const totalGames = sessionData.games.length;
    const totalScore = sessionData.games.reduce((sum, game) => sum + game.score, 0);
    const averageScore = Math.round(totalScore / totalGames);
    const highScore = Math.max(...sessionData.games.map(g => g.score));
    const lowScore = Math.min(...sessionData.games.map(g => g.score));

    return (
        <div className="session-summary-container">
            <div className="session-summary-header">
                <CheckCircle size={64} color="var(--success-color)" />
                <h1>Session Complete!</h1>
                <p className="session-date">
                    {format(new Date(sessionData.date), 'MMMM d, yyyy')}
                </p>
            </div>

            <div className="session-stats-grid">
                <div className="stat-card-large">
                    <div className="stat-label">Total Games</div>
                    <div className="stat-value-large">{totalGames}</div>
                </div>
                <div className="stat-card-large">
                    <div className="stat-label">Average Score</div>
                    <div className="stat-value-large">{averageScore}</div>
                </div>
            </div>

            <div className="session-stats-grid">
                <div className="stat-card">
                    <div className="stat-label">High Score</div>
                    <div className="stat-value">{highScore}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Low Score</div>
                    <div className="stat-value">{lowScore}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Pins</div>
                    <div className="stat-value">{totalScore}</div>
                </div>
            </div>

            <div className="games-list">
                <h3>Game Scores</h3>
                {sessionData.games.map((game, index) => (
                    <div key={index} className="game-item">
                        <span className="game-number">Game {index + 1}</span>
                        <span className="game-score">{game.score}</span>
                    </div>
                ))}
            </div>

            <button className="btn btn-primary" onClick={onComplete}>
                <ArrowLeft size={20} /> Back to League
            </button>
        </div>
    );
};

export default SessionSummary;
