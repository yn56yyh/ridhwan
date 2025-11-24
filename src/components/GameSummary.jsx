import React from 'react';
import { CheckCircle, ChevronRight, Edit } from 'lucide-react';
import Scorecard from './Scorecard';

const GameSummary = ({ score, frames, onHome, onRestart, isLastGame }) => {
    // Calculate stats - need to handle 10th frame specially
    let strikes = 0;
    let spares = 0;
    let openFrames = 0;

    frames.forEach((frame, index) => {
        if (index < 9) {
            // Frames 1-9
            if (frame.ball1 === 10) {
                strikes++;
            } else if (frame.ball1 + frame.ball2 === 10) {
                spares++;
            } else {
                openFrames++;
            }
        } else {
            // Frame 10 - count each ball separately
            if (frame.ball1 === 10) strikes++;
            if (frame.ball2 === 10) strikes++;
            if (frame.ball3 === 10) strikes++;

            // For spares in 10th frame
            // Ball 1 + Ball 2 = spare (if Ball 1 wasn't strike)
            if (frame.ball1 !== 10 && frame.ball1 + frame.ball2 === 10) {
                spares++;
            }
            // Ball 2 + Ball 3 = spare (if Ball 1 was strike and Ball 2 wasn't)
            if (frame.ball1 === 10 && frame.ball2 !== 10 && frame.ball2 + frame.ball3 === 10) {
                spares++;
            }

            // Open frame in 10th only if Ball 1 + Ball 2 < 10
            if (frame.ball1 !== 10 && frame.ball1 + frame.ball2 < 10) {
                openFrames++;
            }
        }
    });

    return (
        <div className="container" style={{ textAlign: 'center', paddingTop: '2rem' }}>
            <div className="card" style={{ marginBottom: '2rem' }}>
                <CheckCircle size={64} color="var(--success-color)" style={{ marginBottom: '1rem' }} />
                <h2>Game Complete!</h2>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--accent-color)', margin: '1rem 0' }}>
                    {score}
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>Final Score</p>
                <div style={{ marginTop: '1rem', textAlign: 'left' }}>
                    <Scorecard frames={frames} />
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Statistics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{strikes}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Strikes</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{spares}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Spares</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{openFrames}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Open</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={onRestart} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {isLastGame ? (
                        <>
                            <CheckCircle size={20} /> View Summary
                        </>
                    ) : (
                        <>
                            <ChevronRight size={20} /> Next Game
                        </>
                    )}
                </button>
                <button className="btn" onClick={onHome} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-tertiary)' }}>
                    <Edit size={20} /> Edit Game
                </button>
            </div>
        </div>
    );
};

export default GameSummary;
