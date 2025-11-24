import React from 'react';
import { getScorecardData } from '../utils/bowlingLogic';
import './Scorecard.css';

const Scorecard = ({ frames, currentFrame, currentBall }) => {
    const scorecardData = getScorecardData(frames);

    // Ensure we always show 10 frames, filling empty ones
    const displayFrames = Array(10).fill(null).map((_, index) => {
        return scorecardData.find(f => f.frameNum === index + 1) || {
            frameNum: index + 1,
            b1: '',
            b2: '',
            b3: '',
            cumulativeScore: ''
        };
    });

    return (
        <div className="scorecard-container">
            <div className="scorecard-scroll">
                {displayFrames.map((frame) => {
                    const isActiveFrame = frame.frameNum === currentFrame;

                    return (
                        <div key={frame.frameNum} className={`scorecard-frame ${isActiveFrame ? 'active-frame' : ''}`}>
                            <div className="frame-header">{frame.frameNum}</div>
                            <div className="frame-rolls">
                                {frame.frameNum === 10 ? (
                                    <>
                                        <div className={`roll-box ${frame.isSplit ? 'split' : ''} ${isActiveFrame && currentBall === 1 ? 'active-shot' : ''}`}>{frame.b1}</div>
                                        <div className={`roll-box ${isActiveFrame && currentBall === 2 ? 'active-shot' : ''}`}>{frame.b2}</div>
                                        <div className={`roll-box ${isActiveFrame && currentBall === 3 ? 'active-shot' : ''}`}>{frame.b3}</div>
                                    </>
                                ) : (
                                    <>
                                        <div className={`roll-box ${frame.isSplit ? 'split' : ''} ${isActiveFrame && currentBall === 1 ? 'active-shot' : ''}`}>{frame.b1}</div>
                                        <div className={`roll-box ${isActiveFrame && currentBall === 2 ? 'active-shot' : ''}`}>{frame.b2}</div>
                                    </>
                                )}
                            </div>
                            <div className="frame-score">
                                {frame.cumulativeScore}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Scorecard;
