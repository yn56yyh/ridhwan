import React from 'react';
import { Trophy, Target, BarChart3, Settings } from 'lucide-react';
import './Home.css';

const Home = ({ onNavigate }) => {
    const menuItems = [
        {
            id: 'league',
            title: 'League',
            icon: Trophy,
            description: 'Track league games',
            color: '#3b82f6'
        },
        {
            id: 'tournament',
            title: 'Tournament',
            icon: Target,
            description: 'Tournament mode',
            color: '#8b5cf6'
        },
        {
            id: 'statistics',
            title: 'Statistics',
            icon: BarChart3,
            description: 'View your stats',
            color: '#10b981'
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: Settings,
            description: 'App settings',
            color: '#6b7280'
        }
    ];

    return (
        <div className="home-container">
            <header className="home-header">
                <h1 className="home-title">Bowling Tracker</h1>
                <p className="home-subtitle">Track your performance</p>
            </header>

            <div className="menu-grid">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className="menu-card"
                            onClick={() => onNavigate(item.id)}
                            style={{ '--card-color': item.color }}
                        >
                            <div className="menu-icon">
                                <Icon size={48} />
                            </div>
                            <h2 className="menu-title">{item.title}</h2>
                            <p className="menu-description">{item.description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Home;
