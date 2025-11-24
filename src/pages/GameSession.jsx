import React, { useState, useEffect } from 'react';
import PinSelector from '../components/PinSelector';
import GameSummary from '../components/GameSummary';
import ScorecardWithPins from '../components/ScorecardWithPins';
import { detectSplit, calculateScore, calculateMaxScore } from '../utils/bowlingLogic';
import { ChevronRight, X, RotateCcw, Check } from 'lucide-react';
import { useGame } from '../context/GameContext';

const GameSession = ({ onEndSession, isLastGame }) => {
    const { saveSession } = useGame();
    // ... state declarations ...
    const [currentFrame, setCurrentFrame] = useState(1);
    const [currentBall, setCurrentBall] = useState(1);
    const [knockedPins, setKnockedPins] = useState([]);
    const [ball1Count, setBall1Count] = useState(0);
    const [ball2Count, setBall2Count] = useState(0); // New state for Frame 10 Ball 2
    const [storedPins, setStoredPins] = useState({ ball1: [], ball2: [] }); // Track specific pins
    const [splitName, setSplitName] = useState(null);
    const [isSplit, setIsSplit] = useState(false); // Track if current frame has a split
    const [message, setMessage] = useState("Ball 1");

    // Game State
    const [frames, setFrames] = useState([]);
    const [totalScore, setTotalScore] = useState(0);
    const [maxScore, setMaxScore] = useState(300);
    const [isGameOver, setIsGameOver] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    // Calculate standing pins based on knocked pins
    const allPins = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const standingPins = allPins.filter(pin => !knockedPins.includes(pin));

    useEffect(() => {
        if (currentBall === 2 && currentFrame < 10) {
            // We rely on isSplit state set during handleNext for consistency,
            // but for the message we can re-detect or use state.
            // Actually, handleNext sets the state, so we can just use isSplit?
            // No, render happens after state change.
            // Let's use the detectSplit here for the message to be safe and reactive.
            // But wait, if user toggles pins in Ball 2, standingPins changes.
            // We only want to detect split based on Ball 1 result.
            // So we should use the `isSplit` state which we will set in handleNext.

            if (isSplit) {
                setMessage(`Split: ${splitName || "Detected"}`);
            } else {
                setMessage("Ball 2 - Spare Attempt");
            }
        } else if (currentBall === 1) {
            setSplitName(null);
            setIsSplit(false);
            setMessage(`Frame ${currentFrame} - Ball 1`);
        } else if (currentFrame === 10 && currentBall === 2) {
            if (ball1Count === 10) {
                setMessage("Frame 10 - Ball 2 (Bonus)");
            } else {
                if (isSplit) {
                    setMessage(`Split: ${splitName || "Detected"}`);
                } else {
                    setMessage("Frame 10 - Ball 2 (Spare Attempt)");
                }
            }
        } else if (currentFrame === 10 && currentBall === 3) {
            setMessage("Frame 10 - Ball 3 (Bonus)");
        }
    }, [currentBall, currentFrame, ball1Count, isSplit, splitName]);

    useEffect(() => {
        setTotalScore(calculateScore(frames));
        setMaxScore(calculateMaxScore(frames, currentFrame, currentBall, knockedPins.length, ball1Count));
    }, [frames, currentFrame, currentBall, knockedPins, ball1Count]);

    useEffect(() => {
        if (isGameOver && !hasSaved) {
            // Calculate score directly to avoid race condition with totalScore state
            const finalScore = calculateScore(frames);
            saveSession({
                score: finalScore,
                frames: frames,
                date: new Date().toISOString()
            });
            setHasSaved(true);
        }
    }, [isGameOver, hasSaved, frames, saveSession]);

    const handlePinToggle = (pin) => {
        if (knockedPins.includes(pin)) {
            setKnockedPins(prev => prev.filter(p => p !== pin));
        } else {
            setKnockedPins(prev => [...prev, pin]);
        }
    };

    const handleStrike = () => {
        // Mark all pins
        const allPins = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        setKnockedPins(allPins);

        if (currentFrame < 10) {
            recordFrame(10, null, null, false, allPins, [], []); // Strike is never a split
            advanceFrame();
        } else {
            // Frame 10 Logic
            if (currentBall === 1) {
                setBall1Count(10);
                // Store pins for Ball 1
                setStoredPins(prev => ({ ...prev, ball1: allPins }));
                setCurrentBall(2);
                setKnockedPins([]);
                setIsSplit(false); // Strike is not a split
            } else if (currentBall === 2) {
                setBall2Count(10);
                // Store pins for Ball 2
                setStoredPins(prev => ({ ...prev, ball2: allPins }));
                setCurrentBall(3);
                setKnockedPins([]);
                setIsSplit(false); // Strike is not a split
            } else {
                // Ball 3 Strike -> Finish
                recordFrame(ball1Count, ball2Count, 10, false, storedPins.ball1, storedPins.ball2, allPins); // Strike is not a split
                setIsGameOver(true);
            }
        }
    };

    const handleSpare = () => {
        // Only valid on Ball 2
        if (currentBall !== 2) return;

        // Calculate how many pins needed for spare
        const pinsNeeded = 10 - ball1Count;

        // Set knocked pins to include all pins for spare
        const allPinsForSpare = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        setKnockedPins(allPinsForSpare);

        // Record the spare immediately
        if (currentFrame < 10) {
            recordFrame(ball1Count, pinsNeeded, null, isSplit, storedPins.ball1, allPinsForSpare, []);
            advanceFrame();
        } else {
            // Frame 10 spare logic
            setBall2Count(pinsNeeded);
            // Store the spare pins (all 10) for Ball 2
            setStoredPins(prev => ({ ...prev, ball2: allPinsForSpare }));
            setCurrentBall(3);
            setKnockedPins([]);
        }
    };

    const handleUndo = () => {
        if (currentFrame === 10) {
            if (currentBall === 3) {
                // Go back to Ball 2 of 10th frame
                setCurrentBall(2);
                setKnockedPins([]); // Reset pins (user has to re-enter Ball 2)
                setBall2Count(0);
                // isSplit state should reflect Ball 1's outcome if Ball 1 wasn't a strike
                // For simplicity, reset and let the user re-enter.
                // Or, if we want to be precise, we'd need to store previous isSplit state.
                // For now, let's reset.
                setIsSplit(false);
                setSplitName(null);
            } else if (currentBall === 2) {
                // Go back to Ball 1 of 10th frame
                setCurrentBall(1);
                setKnockedPins([]); // Reset pins (user has to re-enter Ball 1)
                setBall1Count(0);
                setIsSplit(false);
                setSplitName(null);
            } else {
                // If currentBall is 1 in frame 10, and we undo, it means we undo the previous frame.
                // This case is handled by the general undo for previous frames.
                // But if it's the very first ball of frame 10, we should undo frame 9.
                // This logic needs to be careful not to go below frame 1.
                if (currentFrame > 1) {
                    const newFrames = [...frames];
                    newFrames.pop(); // Remove the last recorded frame (frame 9)
                    setFrames(newFrames);
                    setCurrentFrame(prev => prev - 1);
                    setCurrentBall(1);
                    setKnockedPins([]);
                    setBall1Count(0);
                    setBall2Count(0); // Reset ball2Count as well
                    setIsSplit(false);
                    setSplitName(null);
                }
            }
        } else if (currentBall === 2) {
            // Go back to Ball 1 of current frame (not 10th)
            setCurrentBall(1);
            setKnockedPins([]); // Reset pins (user has to re-enter Ball 1)
            setBall1Count(0);
            setIsSplit(false);
            setSplitName(null);
        } else if (currentFrame > 1) {
            // Go back to previous frame (not 10th)
            const newFrames = [...frames];
            const lastFrame = newFrames.pop();
            setFrames(newFrames);
            setCurrentFrame(prev => prev - 1);

            // Reset to start of that frame
            setCurrentBall(1);
            setKnockedPins([]);
            setBall1Count(0);
            setBall2Count(0); // Reset ball2Count as well
            setIsSplit(false);
            setSplitName(null);
        }
    };

    const handleNext = () => {
        const pinsDownCount = knockedPins.length;
        const currentPins = [...knockedPins];

        if (currentFrame < 10) {
            if (currentBall === 1) {
                if (pinsDownCount === 10) {
                    // Strike
                    recordFrame(10, null, null, false, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [], []);
                    advanceFrame();
                } else {
                    setBall1Count(pinsDownCount);
                    setStoredPins(prev => ({ ...prev, ball1: currentPins }));

                    // Detect Split
                    const standing = allPins.filter(p => !knockedPins.includes(p));
                    const split = detectSplit(standing);
                    setSplitName(split);
                    setIsSplit(!!split);

                    setCurrentBall(2);
                }
            } else {
                const ball2Score = pinsDownCount - ball1Count;
                recordFrame(ball1Count, ball2Score, null, isSplit, storedPins.ball1, currentPins, []);
                advanceFrame();
            }
        } else {
            // Frame 10 Logic
            if (currentBall === 1) {
                setBall1Count(pinsDownCount);
                setStoredPins(prev => ({ ...prev, ball1: currentPins }));

                if (pinsDownCount === 10) {
                    setCurrentBall(2);
                    setKnockedPins([]);
                    setIsSplit(false);
                    setSplitName(null);
                } else {
                    // Detect Split for Frame 10 Ball 1
                    const standing = allPins.filter(p => !knockedPins.includes(p));
                    const split = detectSplit(standing);
                    setSplitName(split);
                    setIsSplit(!!split);

                    setCurrentBall(2);
                }
            } else if (currentBall === 2) {
                let b2Score = 0;
                if (ball1Count === 10) {
                    b2Score = pinsDownCount;
                } else {
                    b2Score = pinsDownCount - ball1Count;
                }

                setBall2Count(b2Score);
                setStoredPins(prev => ({ ...prev, ball2: currentPins }));

                const isStrike = ball1Count === 10;
                const isSpare = !isStrike && (ball1Count + b2Score === 10);

                if (isStrike || isSpare) {
                    setCurrentBall(3);
                    if (isSpare || pinsDownCount === 10) {
                        setKnockedPins([]);
                    }
                } else {
                    recordFrame(ball1Count, b2Score, null, isSplit, storedPins.ball1, currentPins, []);
                    setIsGameOver(true);
                }
            } else {
                let b3Score = 0;
                if (ball2Count === 10 || (ball1Count !== 10 && ball1Count + ball2Count === 10)) {
                    b3Score = pinsDownCount;
                } else {
                    b3Score = pinsDownCount - ball2Count;
                }

                recordFrame(ball1Count, ball2Count, b3Score, isSplit, storedPins.ball1, storedPins.ball2, currentPins);
                setIsGameOver(true);
            }
        }
    };

    const recordFrame = (b1, b2, b3, split = false, p1 = [], p2 = [], p3 = []) => {
        console.log('[GameSession] Recording Frame:', { b1, b2, b3, split, p1, p2, p3 });
        setFrames(prev => [...prev, {
            ball1: b1, ball2: b2, ball3: b3,
            isSplit: split,
            ball1Pins: p1, ball2Pins: p2, ball3Pins: p3
        }]);
    };

    const advanceFrame = () => {
        if (currentFrame < 10) {
            setCurrentFrame(prev => prev + 1);
            setCurrentBall(1);
            setKnockedPins([]);
            setBall1Count(0);
            setStoredPins({ ball1: [], ball2: [] });
        } else {
            setIsGameOver(true);
        }
    };

    if (isGameOver) {
        return (
            <GameSummary
                score={totalScore}
                frames={frames}
                isLastGame={isLastGame}
                onHome={() => setIsGameOver(false)} // Edit Game
                onRestart={() => {
                    // Next Game -> Send data to parent
                    onEndSession({
                        score: totalScore,
                        frames: frames,
                        date: new Date().toISOString()
                    });
                }}
            />
        );
    }

    // Construct frames to show (including current partial frame with live updates)
    const framesToShow = [...frames];
    if (currentFrame <= 10 && !isGameOver) {
        const currentPinsCount = knockedPins.length;

        if (currentBall === 1) {
            // Show live count for Ball 1
            // Detect split live
            const standingPins = allPins.filter(p => !knockedPins.includes(p));
            const liveSplit = detectSplit(standingPins);

            // If 0, pass null to show empty box instead of '-'
            framesToShow.push({
                ball1: currentPinsCount === 0 ? null : currentPinsCount,
                ball2: null,
                ball3: null,
                isSplit: !!liveSplit,
                ball1Pins: knockedPins, // Pass live pins
                ball2Pins: [],
                ball3Pins: []
            });
        } else if (currentBall === 2) {
            // Calculate Ball 2 live score
            let b2Score = 0;
            if (ball1Count === 10) {
                // Frame 10 Ball 2 (after Strike) -> Fresh pins
                b2Score = currentPinsCount;
            } else {
                // Standard Ball 2 -> Cumulative pins - Ball 1
                b2Score = currentPinsCount - ball1Count;
            }
            // Pass isSplit if we are in Ball 2 (it was detected in Ball 1)
            framesToShow.push({
                ball1: ball1Count,
                ball2: b2Score === 0 ? null : b2Score,
                ball3: null,
                isSplit: isSplit,
                ball1Pins: storedPins.ball1, // Use stored pins from Ball 1
                ball2Pins: knockedPins,      // Live pins for Ball 2 (cumulative)
                ball3Pins: []
            });
        } else if (currentBall === 3) {
            // Calculate Ball 3 live score
            let b3Score = 0;
            // Logic from handleNext for Ball 3 score
            if (ball2Count === 10 || (ball1Count !== 10 && ball1Count + ball2Count === 10)) {
                // Fresh rack for Ball 3
                b3Score = currentPinsCount;
            } else {
                // Remaining pins
                b3Score = currentPinsCount - ball2Count;
            }
            framesToShow.push({
                ball1: ball1Count,
                ball2: ball2Count,
                ball3: b3Score === 0 ? null : b3Score,
                isSplit: isSplit,
                ball1Pins: storedPins.ball1,
                ball2Pins: storedPins.ball2,
                ball3Pins: knockedPins // Live pins for Ball 3
            });
        }
    }

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button onClick={onEndSession} style={{ background: 'none', color: 'var(--text-secondary)' }}>
                    <X />
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h2>Frame {currentFrame}</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)' }}>Score: {totalScore}</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    Max<br />
                    <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>{maxScore}</span>
                </div>
            </header>

            <ScorecardWithPins
                frames={framesToShow}
                currentFrame={currentFrame}
                currentBall={currentBall}
            />

            {/* Message card removed as per user request */}

            <PinSelector
                selectedPins={knockedPins}
                onPinToggle={handlePinToggle}
            />

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button
                    className="btn"
                    onClick={handleUndo}
                    disabled={currentFrame === 1 && currentBall === 1}
                    style={{
                        backgroundColor: '#4b5563',
                        color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flex: 1,
                        padding: '1rem',
                        fontSize: '1.2rem'
                    }}
                >
                    <RotateCcw size={24} />
                </button>

                {/* Show Strike button if:
                    1. Ball 1 (any frame)
                    2. Frame 10 Ball 2/3 (only if previous ball was a strike/spare, meaning pins are reset)
                */}
                {(currentBall === 1 || (currentFrame === 10 && knockedPins.length === 0)) && (
                    <button
                        className="btn"
                        onClick={handleStrike}
                        style={{
                            backgroundColor: 'var(--success-color)',
                            color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '0.5rem',
                            flex: 1,
                            padding: '1rem',
                            fontSize: '1.2rem'
                        }}
                    >
                        <Check size={24} /> Strike
                    </button>
                )}

                {/* Show Spare button if Ball 2 and not already spared */}
                {currentBall === 2 && ball1Count < 10 && (
                    <button
                        className="btn"
                        onClick={handleSpare}
                        style={{
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '0.5rem',
                            flex: 1,
                            padding: '1rem',
                            fontSize: '1.2rem'
                        }}
                    >
                        <Check size={24} /> Spare
                    </button>
                )}

                {!(currentBall === 1 && knockedPins.length === 10) && (
                    <button
                        className="btn btn-primary"
                        onClick={handleNext}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            flex: 1,
                            padding: '1rem',
                            fontSize: '1.2rem'
                        }}
                    >
                        {currentBall === 1 && knockedPins.length === 10 ? 'STRIKE!' : 'Next'} <ChevronRight size={24} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default GameSession;
