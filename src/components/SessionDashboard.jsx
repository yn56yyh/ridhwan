import React, { useState, useMemo } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, BarChart2, Target, Percent } from 'lucide-react';
import { format } from 'date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ScorecardWithPins from './ScorecardWithPins';
import './SessionDashboard.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const SessionDashboard = ({ sessionData, onBack }) => {
    const [expandedGameIndex, setExpandedGameIndex] = useState(null);

    const toggleGame = (index) => {
        setExpandedGameIndex(expandedGameIndex === index ? null : index);
    };

    // Calculate Metrics
    const stats = useMemo(() => {
        if (!sessionData || !sessionData.games || sessionData.games.length === 0) return null;

        const games = sessionData.games;
        const totalGames = games.length;
        const totalScore = games.reduce((sum, game) => sum + game.score, 0);
        const average = Math.round(totalScore / totalGames);
        const highScore = Math.max(...games.map(g => g.score));
        const lowScore = Math.min(...games.map(g => g.score));

        // Detailed Stats
        let totalFrames = 0;
        let totalStrikes = 0;
        let totalSpares = 0;
        let totalOpens = 0;
        let totalBall1Pins = 0;
        let totalBall1Count = 0;

        // Spare Breakdown
        let singlePinSpares = 0;
        let singlePinOpportunities = 0;
        let multiPinSpares = 0;
        let multiPinOpportunities = 0;
        let splitSpares = 0;
        let splitOpportunities = 0;

        games.forEach(game => {
            game.frames.forEach((frame, i) => {
                if (i >= 10) return;
                totalFrames++;

                const b1 = frame.ball1 || 0;
                const b2 = frame.ball2 || 0;

                // First Ball Average
                totalBall1Pins += b1;
                totalBall1Count++;

                if (b1 === 10) {
                    totalStrikes++;
                } else {
                    // Not a strike, so we have a spare opportunity
                    const pinsLeft = 10 - b1;
                    const isSplit = frame.isSplit;
                    const isSpare = b1 + b2 === 10;

                    if (isSplit) {
                        splitOpportunities++;
                        if (isSpare) splitSpares++;
                    } else if (pinsLeft === 1) {
                        singlePinOpportunities++;
                        if (isSpare) singlePinSpares++;
                    } else {
                        multiPinOpportunities++;
                        if (isSpare) multiPinSpares++;
                    }

                    if (isSpare) {
                        totalSpares++;
                    } else {
                        totalOpens++;
                    }
                }
            });
        });

        const strikePct = Math.round((totalStrikes / totalFrames) * 100);
        const sparePct = Math.round((totalSpares / (totalFrames - totalStrikes)) * 100); // Spares / Non-Strike Frames
        const openPct = Math.round((totalOpens / totalFrames) * 100);
        const firstBallAvg = (totalBall1Pins / totalBall1Count).toFixed(1);

        const singlePinSparePct = singlePinOpportunities > 0 ? Math.round((singlePinSpares / singlePinOpportunities) * 100) : 0;
        const multiPinSparePct = multiPinOpportunities > 0 ? Math.round((multiPinSpares / multiPinOpportunities) * 100) : 0;
        const splitSparePct = splitOpportunities > 0 ? Math.round((splitSpares / splitOpportunities) * 100) : 0;

        return {
            totalGames,
            average,
            highScore,
            lowScore,
            strikePct,
            sparePct,
            openPct,
            totalPins: totalScore,
            firstBallAvg,
            singlePinSparePct,
            multiPinSparePct,
            splitSparePct
        };
    }, [sessionData]);

    // Chart Data
    const chartData = useMemo(() => {
        if (!sessionData || !sessionData.games) return null;

        return {
            labels: sessionData.games.map((_, i) => `Game ${i + 1}`),
            datasets: [
                {
                    label: 'Score',
                    data: sessionData.games.map(g => g.score),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue-500
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        };
    }, [sessionData]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: 10,
                cornerRadius: 4,
            }
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
        },
        maintainAspectRatio: false,
    };

    if (!sessionData) return <div>Loading...</div>;

    return (
        <div className="session-dashboard">
            <header className="dashboard-header">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <div className="header-content">
                    <h1>Session Dashboard</h1>
                    <span className="session-date">
                        {format(new Date(sessionData.date), 'MMMM d, yyyy')}
                    </span>
                </div>
            </header>

            <div className="dashboard-content">
                {/* Key Metrics Grid */}
                <section className="metrics-section">
                    <div className="metric-card highlight">
                        <div className="metric-icon"><Target size={20} /></div>
                        <div className="metric-label">Average</div>
                        <div className="metric-value">{stats.average}</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">High Score</div>
                        <div className="metric-value">{stats.highScore}</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">Total Pins</div>
                        <div className="metric-value">{stats.totalPins}</div>
                    </div>
                </section>

                {/* Performance Percentages */}
                <section className="stats-row">
                    <div className="stat-box">
                        <div className="stat-label">First Ball Avg</div>
                        <div className="stat-value">{stats.firstBallAvg}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Strikes</div>
                        <div className="stat-value text-success">{stats.strikePct}%</div>
                        <div className="stat-bar">
                            <div className="stat-fill success" style={{ width: `${stats.strikePct}%` }}></div>
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Spares</div>
                        <div className="stat-value text-warning">{stats.sparePct}%</div>
                        <div className="stat-bar">
                            <div className="stat-fill warning" style={{ width: `${stats.sparePct}%` }}></div>
                        </div>
                    </div>
                </section>

                {/* Spare Breakdown */}
                <section className="stats-row" style={{ marginTop: '1rem' }}>
                    <div className="stat-box">
                        <div className="stat-label">Single Pin Spares</div>
                        <div className="stat-value">{stats.singlePinSparePct}%</div>
                        <div className="stat-bar">
                            <div className="stat-fill" style={{ width: `${stats.singlePinSparePct}%`, backgroundColor: '#8b5cf6' }}></div>
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Multi Pin Spares</div>
                        <div className="stat-value">{stats.multiPinSparePct}%</div>
                        <div className="stat-bar">
                            <div className="stat-fill" style={{ width: `${stats.multiPinSparePct}%`, backgroundColor: '#ec4899' }}></div>
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Split Spares</div>
                        <div className="stat-value">{stats.splitSparePct}%</div>
                        <div className="stat-bar">
                            <div className="stat-fill" style={{ width: `${stats.splitSparePct}%`, backgroundColor: '#f43f5e' }}></div>
                        </div>
                    </div>
                </section>

                {/* Score Chart */}
                <section className="chart-section">
                    <h3>Score Progression</h3>
                    <div className="chart-container">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </section>

                {/* Game Breakdown */}
                <section className="breakdown-section">
                    <h3>Game Breakdown</h3>
                    <div className="games-accordion">
                        {sessionData.games.map((game, index) => (
                            <div key={index} className="game-accordion-item">
                                <button
                                    className={`accordion-header ${expandedGameIndex === index ? 'active' : ''}`}
                                    onClick={() => toggleGame(index)}
                                >
                                    <div className="game-info">
                                        <span className="game-num">Game {index + 1}</span>
                                        <span className="game-score-badge">{game.score}</span>
                                    </div>
                                    {expandedGameIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>

                                {expandedGameIndex === index && (
                                    <div className="accordion-content">
                                        <ScorecardWithPins
                                            frames={game.frames}
                                            currentFrame={11} // Show full completed game
                                            currentBall={1}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SessionDashboard;
