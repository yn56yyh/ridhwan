import React from 'react';
import { getScorecardData } from '../utils/bowlingLogic';
import './ScorecardWithPins.css';

const ScorecardWithPins = ({ frames, currentFrame, currentBall }) => {
    const scorecardData = getScorecardData(frames);

    // Ensure we always show 10 frames
    const displayFrames = Array(10).fill(null).map((_, index) => {
        return scorecardData.find(f => f.frameNum === index + 1) || {
            frameNum: index + 1,
            b1: '',
            b2: '',
            b3: '',
            cumulativeScore: ''
        };
    });

    // Pin positions for visual layout (standard bowling pin arrangement)
    // Using a 7-column grid to allow for proper spacing
    const pinPositions = [
        { pin: 7, row: 0, col: 1 },
        { pin: 8, row: 0, col: 3 },
        { pin: 9, row: 0, col: 5 },
        { pin: 10, row: 0, col: 7 },
        { pin: 4, row: 1, col: 2 },
        { pin: 5, row: 1, col: 4 },
        { pin: 6, row: 1, col: 6 },
        { pin: 2, row: 2, col: 3 },
        { pin: 3, row: 2, col: 5 },
        { pin: 1, row: 3, col: 4 }
    ];

    const renderPinDeck = (frame, frameIndex) => {
        // Get the actual frame data (not formatted scorecard data)
        const actualFrame = frames[frameIndex];

        if (actualFrame) {
            console.log(`[Scorecard] Frame ${frameIndex + 1}:`, actualFrame);
        }

        if (!actualFrame) {
            // Empty frame
            return (
                <div className="pin-deck">
                    {pinPositions.map(({ pin, row, col }) => (
                        <div
                            key={pin}
                            className="scorecard-pin standing"
                            style={{
                                gridRow: row + 1,
                                gridColumn: col
                            }}
                        />
                    ))}
                </div>
            );
        }

        // Get numeric values
        const ball1Count = actualFrame.ball1 || 0;
        const ball2Count = actualFrame.ball2 || 0;

        // Determine which pins were knocked down
        let knockedInBall1 = [];
        let knockedInBall2 = [];

        if (actualFrame.ball1Pins) {
            // Use recorded specific pins if available
            knockedInBall1 = actualFrame.ball1Pins;

            if (actualFrame.ball2Pins) {
                // ball2Pins is cumulative in our storage logic
                // knockedInBall2 should be pins knocked in ball 2 specifically?
                // The visualization logic below checks:
                // isKnockedBall1 -> White
                // isKnockedBall2 -> White border/Black fill

                // If ball2Pins is cumulative, then:
                // knockedInBall1 = ball1Pins
                // knockedInBall2 = ball2Pins (cumulative)
                // Logic below:
                // if (knockedInBall1.includes(pin)) -> knocked
                // else if (knockedInBall2.includes(pin)) -> knocked-ball2

                // This works perfectly with cumulative arrays!
                knockedInBall2 = actualFrame.ball2Pins;
            }
            console.log(`[Scorecard] Frame ${frameIndex + 1} Pins:`, { ball1: knockedInBall1, ball2: knockedInBall2 });
        } else {
            // Fallback to count-based estimation (legacy support)
            if (frameIndex < 9) {
                // Frames 1-9
                if (ball1Count === 10) {
                    knockedInBall1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                } else if (ball1Count > 0) {
                    knockedInBall1 = Array.from({ length: ball1Count }, (_, i) => i + 1);
                    if (ball2Count > 0) {
                        knockedInBall2 = Array.from({ length: ball1Count + ball2Count }, (_, i) => i + 1);
                    }
                }
            } else {
                // Frame 10
                if (ball1Count === 10) {
                    knockedInBall1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                } else if (ball1Count > 0) {
                    knockedInBall1 = Array.from({ length: ball1Count }, (_, i) => i + 1);
                }
            }
        }

        const isSpare = frameIndex < 9 && ball1Count !== 10 && ball1Count + ball2Count === 10;

        return (
            <div className={`pin-deck ${isSpare ? 'spare-frame' : ''}`}>
                {pinPositions.map(({ pin, row, col }) => {
                    const isKnockedBall1 = knockedInBall1.includes(pin);
                    const isKnockedBall2 = knockedInBall2.includes(pin);

                    let pinClass = 'standing';
                    if (isKnockedBall1) {
                        pinClass = 'knocked'; // White
                    } else if (isKnockedBall2) {
                        pinClass = 'knocked-ball2'; // White border with black fill
                    }

                    return (
                        <div
                            key={pin}
                            className={`scorecard-pin ${pinClass}`}
                            style={{
                                gridRow: row + 1,
                                gridColumn: col
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    const renderFrame10PinDecks = (actualFrame) => {
        if (!actualFrame) {
            return (
                <div className="pin-deck">
                    {pinPositions.map(({ pin, row, col }) => (
                        <div
                            key={pin}
                            className="scorecard-pin standing"
                            style={{
                                gridRow: row + 1,
                                gridColumn: col
                            }}
                        />
                    ))}
                </div>
            );
        }

        const ball1Count = actualFrame.ball1 || 0;
        const ball2Count = actualFrame.ball2 || 0;
        const ball3Count = actualFrame.ball3 || 0;

        const decks = [];

        // Ball 1 deck
        let ball1Knocked = [];
        if (actualFrame.ball1Pins) {
            ball1Knocked = actualFrame.ball1Pins;
        } else {
            ball1Knocked = ball1Count === 10 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : Array.from({ length: ball1Count }, (_, i) => i + 1);
        }

        decks.push(
            <div key="ball1" className="pin-deck">
                {pinPositions.map(({ pin, row, col }) => (
                    <div
                        key={pin}
                        className={`scorecard-pin ${ball1Knocked.includes(pin) ? 'knocked' : 'standing'}`}
                        style={{
                            gridRow: row + 1,
                            gridColumn: col
                        }}
                    />
                ))}
            </div>
        );

        // Ball 2 deck (if strike on ball 1, or spare earned)
        let ball2Knocked = []; // Define outside if block for scope access
        if (ball1Count === 10 || (ball1Count > 0 && ball1Count + ball2Count === 10)) {
            if (actualFrame.ball2Pins) {
                ball2Knocked = actualFrame.ball2Pins;
            } else {
                ball2Knocked = ball2Count === 10 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : Array.from({ length: ball2Count }, (_, i) => i + 1);
            }

            const isSpare = ball1Count !== 10 && ball1Count + ball2Count === 10;

            decks.push(
                <div key="ball2" className={`pin-deck ${isSpare ? 'spare-frame' : ''}`}>
                    {pinPositions.map(({ pin, row, col }) => {
                        let pinClass = 'standing';
                        if (isSpare) {
                            // For spare, show ball1 pins as knocked, ball2 pins as knocked-ball2
                            if (ball1Knocked.includes(pin)) {
                                pinClass = 'knocked';
                            } else if (ball2Knocked.includes(pin)) {
                                pinClass = 'knocked-ball2';
                            }
                        } else {
                            // Fresh rack after strike
                            if (ball2Knocked.includes(pin)) {
                                pinClass = 'knocked';
                            }
                        }

                        return (
                            <div
                                key={pin}
                                className={`scorecard-pin ${pinClass}`}
                                style={{
                                    gridRow: row + 1,
                                    gridColumn: col
                                }}
                            />
                        );
                    })}
                </div>
            );
        }

        // Ball 3 deck (if strike on ball 1 and ball 2, or spare on ball 2)
        if ((ball1Count === 10 && ball2Count === 10) || (ball1Count === 10 && ball1Count !== 10 && ball2Count > 0 && ball1Count + ball2Count === 10) || (ball1Count === 10 && ball2Count !== 10 && ball2Count + ball3Count === 10)) {
            let ball3Knocked = [];
            if (actualFrame.ball3Pins) {
                ball3Knocked = actualFrame.ball3Pins;
            } else {
                ball3Knocked = ball3Count === 10 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : Array.from({ length: ball3Count }, (_, i) => i + 1);
            }

            const isSpare = ball2Count !== 10 && ball2Count + ball3Count === 10;

            decks.push(
                <div key="ball3" className={`pin-deck ${isSpare ? 'spare-frame' : ''}`}>
                    {pinPositions.map(({ pin, row, col }) => {
                        let pinClass = 'standing';
                        if (isSpare) {
                            // Show ball2 pins as knocked, ball3 pins as knocked-ball2
                            // Need ball2 pins for this context. 
                            // If ball1 was strike, ball2 pins are in ball2Knocked (which is fresh rack).
                            // If ball1 was spare, ball2 pins are fresh rack (strike) or partial?
                            // Wait, if ball1 spare, ball2 is fresh rack.
                            // So ball2Knocked is always relative to a fresh rack here?
                            // Yes, because we only get to Ball 3 if Ball 2 was Strike/Spare (after B1 Strike) or B2 Spare (after B1 Spare? No, B1 Spare ends frame).
                            // Wait, B1 Spare -> B2 is Bonus Ball (Ball 3 in array logic? No).
                            // In standard bowling:
                            // Frame 10:
                            // 1. Strike -> 2 more balls.
                            // 2. Spare -> 1 more ball.
                            // 3. Open -> End.

                            // My data structure:
                            // If B1 Strike: ball1=10. Next is ball2.
                            // If B1 Spare: ball1=X, ball2=Y (sum 10). Next is ball3 (Bonus).

                            // So if isSpare (B2+B3=10), it implies B2 was NOT strike.
                            // And B1 must have been Strike for us to be at B3 with B2+B3=10?
                            // Yes: X (10) -> 6 -> / (4).

                            // So ball2Knocked contains the pins from Ball 2.
                            if (ball2Knocked.includes(pin)) {
                                pinClass = 'knocked';
                            } else if (ball3Knocked.includes(pin)) {
                                pinClass = 'knocked-ball2';
                            }
                        } else {
                            // Fresh rack
                            if (ball3Knocked.includes(pin)) {
                                pinClass = 'knocked';
                            }
                        }

                        return (
                            <div
                                key={pin}
                                className={`scorecard-pin ${pinClass}`}
                                style={{
                                    gridRow: row + 1,
                                    gridColumn: col
                                }}
                            />
                        );
                    })}
                </div>
            );
        }

        return <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>{decks}</div>;
    };

    // Determine if Frame 10 has multiple decks to adjust grid
    const actualFrame10 = frames[9];
    const hasMultipleDecks = actualFrame10 && (
        actualFrame10.ball1 === 10 ||
        (actualFrame10.ball1 > 0 && actualFrame10.ball1 + actualFrame10.ball2 === 10)
    );

    return (
        <div className="scorecard-with-pins-container">
            <div className={`scorecard-with-pins-scroll ${hasMultipleDecks ? 'grid-9' : 'grid-10'}`}>
                {/* Frames 1-9 */}
                {displayFrames.slice(0, 9).map((frame, index) => {
                    const isActiveFrame = frame.frameNum === currentFrame;

                    return (
                        <div key={frame.frameNum} className={`scorecard-with-pins-frame ${isActiveFrame ? 'active-frame' : ''}`}>
                            <div className="frame-header">{frame.frameNum}</div>

                            {renderPinDeck(frame, index)}

                            <div className="frame-rolls">
                                <div className={`roll-box ${frame.isSplit ? 'split' : ''} ${isActiveFrame && currentBall === 1 ? 'active-shot' : ''}`}>{frame.b1}</div>
                                <div className={`roll-box ${isActiveFrame && currentBall === 2 ? 'active-shot' : ''}`}>{frame.b2}</div>
                            </div>
                            <div className="frame-score">
                                {frame.cumulativeScore}
                            </div>
                        </div>
                    );
                })}

                {/* Frame 10 - conditionally on its own row if multiple decks */}
                {(() => {
                    const frame10 = displayFrames[9];
                    const actualFrame10 = frames[9];
                    const isActiveFrame = frame10.frameNum === currentFrame;

                    // Determine if Frame 10 has multiple decks (2 or more visualizations)
                    const hasMultipleDecks = actualFrame10 && (
                        actualFrame10.ball1 === 10 ||
                        (actualFrame10.ball1 > 0 && actualFrame10.ball1 + actualFrame10.ball2 === 10)
                    );

                    if (hasMultipleDecks) {
                        // Render Frame 10 on its own row when it has multiple decks
                        return (
                            <div className="scorecard-with-pins-frame-10-wrapper">
                                <div className={`scorecard-with-pins-frame frame-10-multi ${isActiveFrame ? 'active-frame' : ''}`}>
                                    <div className="frame-header">{frame10.frameNum}</div>

                                    {renderFrame10PinDecks(actualFrame10)}

                                    <div className="frame-rolls">
                                        <div className={`roll-box ${frame10.isSplit ? 'split' : ''} ${isActiveFrame && currentBall === 1 ? 'active-shot' : ''}`}>{frame10.b1}</div>
                                        <div className={`roll-box ${isActiveFrame && currentBall === 2 ? 'active-shot' : ''}`}>{frame10.b2}</div>
                                        <div className={`roll-box ${isActiveFrame && currentBall === 3 ? 'active-shot' : ''}`}>{frame10.b3}</div>
                                    </div>
                                    <div className="frame-score">
                                        {frame10.cumulativeScore}
                                    </div>
                                </div>
                            </div>
                        );
                    } else {
                        // Render Frame 10 inline when it has only 1 deck
                        return (
                            <div key={frame10.frameNum} className={`scorecard-with-pins-frame ${isActiveFrame ? 'active-frame' : ''}`}>
                                <div className="frame-header">{frame10.frameNum}</div>

                                {renderFrame10PinDecks(actualFrame10)}

                                <div className="frame-rolls">
                                    <div className={`roll-box ${frame10.isSplit ? 'split' : ''} ${isActiveFrame && currentBall === 1 ? 'active-shot' : ''}`}>{frame10.b1}</div>
                                    <div className={`roll-box ${isActiveFrame && currentBall === 2 ? 'active-shot' : ''}`}>{frame10.b2}</div>
                                    <div className={`roll-box ${isActiveFrame && currentBall === 3 ? 'active-shot' : ''}`}>{frame10.b3}</div>
                                </div>
                                <div className="frame-score">
                                    {frame10.cumulativeScore}
                                </div>
                            </div>
                        );
                    }
                })()}
            </div>
        </div>
    );
};

export default ScorecardWithPins;
