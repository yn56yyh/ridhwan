import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import './LeagueSetup.css';

const LeagueSetup = ({ type, onBack, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        bowlingAlley: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name && formData.bowlingAlley) {
            onCreate(
                type,
                formData.name,
                formData.bowlingAlley
            );
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="league-setup-container">
            <header className="league-setup-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1>New {type === 'league' ? 'League' : 'Tournament'}</h1>
            </header>

            <form className="league-setup-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">
                        {type === 'league' ? 'League' : 'Tournament'} Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder={`e.g., ${type === 'league' ? 'Monday Night League' : 'Summer Championship'}`}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="bowlingAlley">Bowling Alley</label>
                    <input
                        id="bowlingAlley"
                        type="text"
                        value={formData.bowlingAlley}
                        onChange={(e) => handleChange('bowlingAlley', e.target.value)}
                        placeholder="e.g., Strike Zone"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!formData.name || !formData.bowlingAlley}
                >
                    Create {type === 'league' ? 'League' : 'Tournament'}
                </button>
            </form>
        </div>
    );
};

export default LeagueSetup;
