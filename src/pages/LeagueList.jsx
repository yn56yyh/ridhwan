import React from 'react';
import { useGame } from '../context/GameContext';
import { ArrowLeft, Trophy, Target, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import './LeagueList.css';

const LeagueList = ({ type, onBack, onSelectEvent, onCreateNew }) => {
    const { getEvents } = useGame();
    const events = getEvents(type);

    const getTotalGames = (event) => {
        return event.sessions.reduce((sum, session) =>
            sum + session.games.length, 0
        );
    };

    const getLatestSessionDate = (event) => {
        if (event.sessions.length === 0) return null;
        const latestSession = event.sessions[event.sessions.length - 1];
        return latestSession.date;
    };

    const Icon = type === 'league' ? Trophy : Target;
    const title = type === 'league' ? 'Leagues' : 'Tournaments';

    return (
        <div className="league-list-container">
            <header className="league-list-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1>{title}</h1>
            </header>

            {events.length === 0 ? (
                <div className="empty-state">
                    <Icon size={64} className="empty-icon" />
                    <h2>No {title} Yet</h2>
                    <p>Create your first {type} to start tracking</p>
                    <button className="btn btn-primary" onClick={onCreateNew}>
                        Create {type === 'league' ? 'League' : 'Tournament'}
                    </button>
                </div>
            ) : (
                <>
                    <button className="btn btn-primary create-new-btn" onClick={onCreateNew}>
                        Create New
                    </button>

                    <div className="events-list">
                        {events.map(event => {
                            const totalGames = getTotalGames(event);
                            const latestDate = getLatestSessionDate(event);

                            return (
                                <div
                                    key={event.id}
                                    className="event-card"
                                    onClick={() => onSelectEvent(event.id)}
                                >
                                    <div className="event-header">
                                        <div className="event-icon">
                                            <Icon size={24} />
                                        </div>
                                        <div className="event-info">
                                            <h3>{event.name}</h3>
                                            <p className="event-location">{event.bowlingAlley}</p>
                                        </div>
                                        <ChevronRight size={20} className="event-arrow" />
                                    </div>

                                    <div className="event-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Total Games:</span>
                                            <span className="stat-value">{totalGames}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Sessions:</span>
                                            <span className="stat-value">{event.sessions.length}</span>
                                        </div>
                                    </div>

                                    {latestDate && (
                                        <div className="event-date">
                                            Last played: {format(new Date(latestDate), 'MMM d, yyyy')}
                                        </div>
                                    )}

                                    {event.status === 'completed' && (
                                        <div className="event-badge completed">Completed</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default LeagueList;
