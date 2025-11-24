import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [sessions, setSessions] = useState(() => {
        const saved = localStorage.getItem('bowling_sessions');
        return saved ? JSON.parse(saved) : [];
    });

    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('bowling_events');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('bowling_sessions', JSON.stringify(sessions));
    }, [sessions]);

    useEffect(() => {
        localStorage.setItem('bowling_events', JSON.stringify(events));
    }, [events]);

    const saveSession = (gameData) => {
        const newSession = {
            id: uuidv4(),
            date: new Date().toISOString(),
            ...gameData
        };
        setSessions(prev => [newSession, ...prev]);
        return newSession;
    };

    const deleteSession = (id) => {
        setSessions(prev => prev.filter(session => session.id !== id));
    };

    // Event management functions
    const createEvent = (type, name, bowlingAlley) => {
        const newEvent = {
            id: uuidv4(),
            type, // 'league' or 'tournament'
            name,
            bowlingAlley,
            createdDate: new Date().toISOString(),
            status: 'active',
            sessions: []
        };
        setEvents(prev => [newEvent, ...prev]);
        return newEvent;
    };

    const getEvents = (type) => {
        if (type) {
            return events.filter(event => event.type === type);
        }
        return events;
    };

    const getEventById = (id) => {
        return events.find(event => event.id === id);
    };

    const addSessionToEvent = (eventId, sessionData) => {
        setEvents(prev => prev.map(event => {
            if (event.id === eventId) {
                const updatedSessions = [...event.sessions, {
                    id: uuidv4(),
                    date: sessionData.date || new Date().toISOString(),
                    games: sessionData.games || []
                }];

                return {
                    ...event,
                    sessions: updatedSessions
                };
            }
            return event;
        }));
    };

    const updateEventStatus = (eventId, status) => {
        setEvents(prev => prev.map(event =>
            event.id === eventId ? { ...event, status } : event
        ));
    };

    const deleteEvent = (id) => {
        setEvents(prev => prev.filter(event => event.id !== id));
    };

    return (
        <GameContext.Provider value={{
            sessions,
            saveSession,
            deleteSession,
            events,
            createEvent,
            getEvents,
            getEventById,
            addSessionToEvent,
            updateEventStatus,
            deleteEvent
        }}>
            {children}
        </GameContext.Provider>
    );
};
