import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const StatisticsDashboard = () => {
    const { events } = useGame();

    // Aggregate all games from all events
    const allGames = useMemo(() => {
        const games = [];
        events.forEach(event => {
            event.sessions?.forEach(session => {
                session.games?.forEach(game => {
                    games.push({
                        ...game,
                        date: session.date
                    });
                });
            });
        });
        return games.sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [events]);

    if (allGames.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Play some games to see your stats!</p>
            </div>
        );
    }

    // Calculate Metrics
    const totalGames = allGames.length;
    const totalScore = allGames.reduce((sum, g) => sum + g.score, 0);
    const averageScore = Math.round(totalScore / totalGames);
    const highScore = Math.max(...allGames.map(g => g.score));

    // Chart Data
    const data = {
        labels: allGames.map(g => format(new Date(g.date), 'MMM d')),
        datasets: [
            {
                label: 'Score',
                data: allGames.map(g => g.score),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#9ca3af',
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#9ca3af',
                }
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Average</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{averageScore}</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Best</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{highScore}</div>
                </div>
            </div>

            {/* Chart */}
            <div className="card">
                <h3>Performance Trend</h3>
                <div style={{ marginTop: '1rem', height: '200px' }}>
                    <Line options={options} data={data} />
                </div>
            </div>

            {/* Additional Stats */}
            <div className="card">
                <h3>Details</h3>
                <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Total Games: {totalGames}
                </div>
            </div>
        </div>
    );
};

export default StatisticsDashboard;
