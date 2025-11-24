import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [sessions, setSessions] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch events from Supabase on mount
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select(`
                    *,
                    sessions (
                        *,
                        games (
                            *,
                            frames (*)
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSession = async (gameData) => {
        // This function is kept for backward compatibility but not used with events
        console.warn('saveSession called - this should be handled through events');
        return null;
    };

    const deleteSession = async (id) => {
        try {
            const { error } = await supabase
                .from('sessions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchEvents(); // Refresh
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    const createEvent = async (type, name, bowlingAlley) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('events')
                .insert([
                    {
                        user_id: user.id,
                        type,
                        name,
                        bowling_alley: bowlingAlley,
                        status: 'active'
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            await fetchEvents(); // Refresh
            return data;
        } catch (error) {
            console.error('Error creating event:', error);
            return null;
        }
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

    const addSessionToEvent = async (eventId, sessionData) => {
        try {
            // 1. Create session
            const { data: session, error: sessionError } = await supabase
                .from('sessions')
                .insert([
                    {
                        event_id: eventId,
                        date: sessionData.date || new Date().toISOString(),
                        games_count: sessionData.games?.length || 0
                    }
                ])
                .select()
                .single();

            if (sessionError) throw sessionError;

            // 2. Create games and frames
            for (let i = 0; i < sessionData.games.length; i++) {
                const gameData = sessionData.games[i];

                const { data: game, error: gameError } = await supabase
                    .from('games')
                    .insert([
                        {
                            session_id: session.id,
                            game_number: i + 1,
                            score: gameData.score
                        }
                    ])
                    .select()
                    .single();

                if (gameError) throw gameError;

                // 3. Create frames for this game
                const framesData = gameData.frames.map((frame, frameIndex) => ({
                    game_id: game.id,
                    frame_number: frameIndex + 1,
                    ball1: frame.ball1 || 0,
                    ball2: frame.ball2,
                    ball3: frame.ball3,
                    ball1_pins: frame.ball1Pins || [],
                    ball2_pins: frame.ball2Pins || [],
                    ball3_pins: frame.ball3Pins || [],
                    is_split: frame.isSplit || false
                }));

                const { error: framesError } = await supabase
                    .from('frames')
                    .insert(framesData);

                if (framesError) throw framesError;
            }

            await fetchEvents(); // Refresh
        } catch (error) {
            console.error('Error adding session to event:', error);
        }
    };

    const updateEventStatus = async (eventId, status) => {
        try {
            const { error } = await supabase
                .from('events')
                .update({ status })
                .eq('id', eventId);

            if (error) throw error;
            await fetchEvents(); // Refresh
        } catch (error) {
            console.error('Error updating event status:', error);
        }
    };

    const deleteEvent = async (id) => {
        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchEvents(); // Refresh
        } catch (error) {
            console.error('Error deleting event:', error);
        }
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
            deleteEvent,
            loading
        }}>
            {children}
        </GameContext.Provider>
    );
};
