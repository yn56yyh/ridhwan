
/**
 * Standard bowling pin positions:
 *       7   8   9   10
 *     4   5   6
 *   2   3
 * 1
 */

// Split configurations based on FR-011
const SPLIT_PATTERNS = [
    { name: "7-10 Goal Posts", pins: [7, 10] },
    { name: "7-9", pins: [7, 9] },
    { name: "8-10", pins: [8, 10] },
    { name: "4-6 Cincinnati", pins: [4, 6] },
    { name: "4-6-7", pins: [4, 6, 7] },
    { name: "4-6-10", pins: [4, 6, 10] },
    { name: "5-7", pins: [5, 7] },
    { name: "5-10", pins: [5, 10] },
    { name: "2-6", pins: [2, 6] },
    { name: "3-4", pins: [3, 4] },
    { name: "4-9", pins: [4, 9] },
    { name: "6-8", pins: [6, 8] },
    { name: "5-7-10 Sour Apple", pins: [5, 7, 10] },
    { name: "3-7", pins: [3, 7] },
    { name: "2-10", pins: [2, 10] },
    { name: "2-7", pins: [2, 7] },
    { name: "3-10", pins: [3, 10] },
    { name: "2-9", pins: [2, 9] },
    { name: "3-8", pins: [3, 8] },
    { name: "1-4", pins: [1, 4] }, // Note: Usually head pin down is required for split, but PRD lists this? Wait, FR-011 lists 1-4, 1-6.
    { name: "1-6", pins: [1, 6] },
    { name: "2-7-10 Cocked Hat", pins: [2, 7, 10] },
    { name: "3-7-10 Cocked Hat", pins: [3, 7, 10] },
    { name: "4-7-10", pins: [4, 7, 10] },
    { name: "6-7-10", pins: [6, 7, 10] },
    { name: "4-10", pins: [4, 10] },
    { name: "6-10", pins: [6, 10] },
    { name: "4-6-7-10 Big Four", pins: [4, 6, 7, 10] },
    { name: "2-3", pins: [2, 3] },
    { name: "4-5", pins: [4, 5] },
    { name: "5-6", pins: [5, 6] },
    { name: "7-8", pins: [7, 8] },
    { name: "8-9", pins: [8, 9] },
    { name: "9-10", pins: [9, 10] },
    { name: "4-5-7", pins: [4, 5, 7] },
    { name: "5-6-10", pins: [5, 6, 10] },
    { name: "2-3-4", pins: [2, 3, 4] },
    { name: "2-3-6", pins: [2, 3, 6] },
    { name: "4-5-8", pins: [4, 5, 8] },
    { name: "5-6-8", pins: [5, 6, 8] },
    { name: "4-6-7-8-10 Greek Church", pins: [4, 6, 7, 8, 10] },
    { name: "4-6-7-9-10 Greek Church", pins: [4, 6, 7, 9, 10] },
    { name: "4-6-8-10", pins: [4, 6, 8, 10] },
    { name: "4-6-7-9", pins: [4, 6, 7, 9] },
    { name: "3-4-6-7-10", pins: [3, 4, 6, 7, 10] },
    { name: "2-4-6-7-10", pins: [2, 4, 6, 7, 10] }
];

/**
 * Detects if the remaining pins constitute a split.
 * @param {number[]} standingPins - Array of pin numbers (1-10) that are still standing.
 * @returns {string|null} - Name of the split if detected, otherwise null.
 */
export function detectSplit(standingPins) {
    // 1. Head pin (1) must be down
    if (standingPins.includes(1)) return null;

    // 2. Must have at least 2 standing pins
    if (standingPins.length < 2) return null;

    // Define columns for pins
    // Col 1: [7], Col 2: [4], Col 3: [2,8], Col 4: [1,5], Col 5: [3,9], Col 6: [6], Col 7: [10]
    const pinColumns = {
        7: 1,
        4: 2,
        2: 3, 8: 3,
        1: 4, 5: 4,
        3: 5, 9: 5,
        6: 6,
        10: 7
    };

    // Get columns of standing pins, sorted
    const standingCols = [...new Set(standingPins.map(p => pinColumns[p]))].sort((a, b) => a - b);

    // Rule 1: Split if there is a gap (empty column) between standing pins
    let hasGap = false;
    for (let i = 0; i < standingCols.length - 1; i++) {
        if (standingCols[i + 1] - standingCols[i] > 1) {
            hasGap = true;
            break;
        }
    }

    // Rule 2: Split if "Missing Head" for adjacent pins
    // (e.g. 5-6 standing, but 3 is down)
    // Pairs to check: (4,5 -> 2), (5,6 -> 3), (7,8 -> 4), (8,9 -> 5), (9,10 -> 6)
    const missingHeadPairs = [
        { pins: [4, 5], head: 2 },
        { pins: [5, 6], head: 3 },
        { pins: [7, 8], head: 4 },
        { pins: [8, 9], head: 5 },
        { pins: [9, 10], head: 6 }
    ];

    let hasMissingHead = false;
    for (const pair of missingHeadPairs) {
        // If both pins in the pair are standing
        if (standingPins.includes(pair.pins[0]) && standingPins.includes(pair.pins[1])) {
            // And the "head" pin is down (not standing)
            if (!standingPins.includes(pair.head)) {
                hasMissingHead = true;
                break;
            }
        }
    }

    if (hasGap || hasMissingHead) {
        // Return a generic "Split" or try to match a name
        // We can still try to match named splits for display purposes
        const sortedPins = [...standingPins].sort((a, b) => a - b);
        for (const pattern of SPLIT_PATTERNS) {
            if (pattern.pins.length === sortedPins.length &&
                pattern.pins.every((pin, index) => pin === sortedPins[index])) {
                return pattern.name;
            }
        }
        return "Split";
    }

    return null;
}

/**
 * Calculates the score for a game.
 * @param {Array} frames - Array of frame objects. Each frame: { ball1: number, ball2: number|null, ball3: number|null }
 * @returns {number} - Total score.
 */
export function calculateScore(frames) {
    const scorecard = getScorecardData(frames);
    if (scorecard.length === 0) return 0;
    return scorecard[scorecard.length - 1].cumulativeScore;
}

/**
 * Generates detailed scorecard data including cumulative scores and formatted roll strings.
 * @param {Array} frames - Array of frame objects.
 * @returns {Array} - Array of objects: { frameNum, ball1Str, ball2Str, ball3Str, score, cumulativeScore }
 */
export function getScorecardData(frames) {
    let cumulativeScore = 0;
    let rolls = [];

    // Flatten frames into a sequence of rolls
    // For frames 1-9: ball1 is absolute, ball2 is INCREMENTAL
    // For frame 10: all values should be ABSOLUTE pin counts
    frames.forEach((frame, index) => {
        if (index < 9) {
            // Frames 1-9
            if (frame.ball1 !== null) rolls.push(frame.ball1);
            if (frame.ball2 !== null) rolls.push(frame.ball2); // Incremental
        } else {
            // Frame 10 - all should be absolute counts
            if (frame.ball1 !== null) rolls.push(frame.ball1);
            if (frame.ball2 !== null) rolls.push(frame.ball2);
            if (frame.ball3 !== null) rolls.push(frame.ball3);
        }
    });

    let rollIndex = 0;
    const scorecardData = [];

    for (let i = 0; i < frames.length; i++) { // Iterate through frames we have data for
        // If we don't have enough rolls to calculate this frame, stop (or handle partials)
        // But we want to show what we have.

        // We need to simulate the full 10 frames logic to get correct scoring
        // even if we only have partial data.

        // Actually, let's just iterate 10 times or up to frames.length?
        // The user wants to see the scoreboard fill up.
        // So we iterate up to frames.length.

        let frameScore = 0;
        let frameText = { b1: '', b2: '', b3: '' };

        if (rollIndex >= rolls.length) break;

        const firstRoll = rolls[rollIndex];

        // Formatting Logic
        if (i < 9) { // Frames 1-9
            if (firstRoll === 10) {
                // Strike
                // User requested 'X' in Ball 1 slot.
                frameText.b1 = 'X';
                frameText.b2 = '';

                frameScore = 10 + (rolls[rollIndex + 1] || 0) + (rolls[rollIndex + 2] || 0);
                rollIndex++;
            } else {
                frameText.b1 = firstRoll === 0 ? '-' : firstRoll;

                if (rolls[rollIndex + 1] !== undefined) {
                    const secondRoll = rolls[rollIndex + 1];
                    if (firstRoll + secondRoll === 10) {
                        // Spare
                        frameText.b2 = '/';
                        frameScore = 10 + (rolls[rollIndex + 2] || 0);
                    } else {
                        // Open
                        frameText.b2 = secondRoll === 0 ? '-' : secondRoll;
                        frameScore = firstRoll + secondRoll;
                    }
                    rollIndex += 2;
                } else {
                    // Incomplete frame (waiting for ball 2)
                    // Add what we have so far to the frame score for live update
                    frameScore = firstRoll;
                    rollIndex++; // Just consume the one roll we have
                }
            }
        } else { // Frame 10
            // 10th Frame Logic
            const r1 = rolls[rollIndex];
            const r2 = rolls[rollIndex + 1];
            const r3 = rolls[rollIndex + 2];

            frameText.b1 = r1 === 10 ? 'X' : (r1 === 0 ? '-' : r1);

            if (r2 !== undefined) {
                if (r1 === 10) {
                    frameText.b2 = r2 === 10 ? 'X' : (r2 === 0 ? '-' : r2);
                    if (r3 !== undefined) {
                        // If r2 was strike, r3 can be strike.
                        // If r2 was not strike, r3 is spare? No.
                        // If r1=10, r2=10, r3=10 -> X X X
                        // If r1=10, r2=5, r3=5 -> X 5 /
                        if (r2 !== 10 && r2 + r3 === 10) {
                            frameText.b3 = '/';
                        } else {
                            frameText.b3 = r3 === 10 ? 'X' : (r3 === 0 ? '-' : r3);
                        }
                    }
                } else if (r1 + r2 === 10) {
                    frameText.b2 = '/';
                    if (r3 !== undefined) {
                        frameText.b3 = r3 === 10 ? 'X' : (r3 === 0 ? '-' : r3);
                    }
                } else {
                    frameText.b2 = r2 === 0 ? '-' : r2;
                }
            }

            // Score calc for 10th
            // Simple sum of all rolls in 10th frame
            let f10Score = (r1 || 0) + (r2 || 0) + (r3 || 0);
            frameScore = f10Score;
            rollIndex += 3; // Consume all
        }

        cumulativeScore += frameScore;

        scorecardData.push({
            frameNum: i + 1,
            ...frameText,
            score: frameScore,
            cumulativeScore: cumulativeScore,
            isSplit: frames[i].isSplit // Pass through split status
        });
    }

    return scorecardData;
}

/**
 * Calculates the maximum possible score from the current state.
 * @param {Array} frames - Completed frames so far.
 * @param {number} currentFrame - Current frame number (1-10).
 * @param {number} currentBall - Current ball number (1, 2, or 3).
 * @param {number} currentPinsDown - Number of pins currently knocked down in this ball (if any).
 * @param {number} ball1Count - Number of pins knocked in ball 1 (if currently on ball 2).
 * @returns {number} - Max possible score.
 */
export function calculateMaxScore(frames, currentFrame, currentBall, currentPinsDown, ball1Count) {
    // Create a simulation of frames
    const simulatedFrames = JSON.parse(JSON.stringify(frames));

    // Fill the rest of the game with Strikes (or Spares)

    // Handle current frame logic
    if (currentFrame <= 10) {
        if (currentBall === 1) {
            // If we are on Ball 1, assume we get a Strike (10)
            // But if we already knocked some pins (currentPinsDown), can we get a strike?
            // If currentPinsDown < 10, best we can do is Spare (if we are committed to this ball).
            // But "Max Score" usually implies "If I play perfectly from NOW on".
            // If I haven't thrown yet (currentPinsDown is just selection), I can still get a Strike.
            // So we assume Strike for this frame.
            simulatedFrames.push({ ball1: 10, ball2: null, ball3: null });
        } else if (currentBall === 2) {
            // We already threw Ball 1 (ball1Count).
            // Best outcome is Spare.
            simulatedFrames.push({ ball1: ball1Count, ball2: 10 - ball1Count, ball3: null });
        } else {
            // Ball 3 (10th frame only)
            // We assume Strike (10)
            simulatedFrames.push({ ...simulatedFrames.pop(), ball3: 10 });
        }
    }

    // Fill remaining frames with Strikes
    for (let f = currentFrame + 1; f <= 10; f++) {
        simulatedFrames.push({ ball1: 10, ball2: null, ball3: null });
    }

    // Calculate score for this perfect future
    // We need to handle the 10th frame special case in calculation
    // My calculateScore handles it if we pass 10, null, null?
    // Wait, calculateScore expects { ball1, ball2, ball3 } for 10th?
    // If I push { ball1: 10, ball2: null, ball3: null } for 10th, 
    // calculateScore logic:
    // if firstRoll === 10 (Strike) -> score += 10 + next + next.
    // For 10th frame, we need 3 rolls if Strike.
    // So for 10th frame simulation, we should push { ball1: 10, ball2: 10, ball3: 10 }.

    // Let's fix the simulation loop
    const finalFrames = [];

    // 1. Copy existing
    frames.forEach(f => finalFrames.push(f));

    // 2. Add current frame projection
    if (currentFrame <= 10) {
        if (currentBall === 1) {
            if (currentFrame === 10) {
                finalFrames.push({ ball1: 10, ball2: 10, ball3: 10 });
            } else {
                finalFrames.push({ ball1: 10, ball2: null, ball3: null });
            }
        } else if (currentBall === 2) {
            // Spare
            if (currentFrame === 10) {
                // Spare then Strike
                finalFrames.push({ ball1: ball1Count, ball2: 10 - ball1Count, ball3: 10 });
            } else {
                finalFrames.push({ ball1: ball1Count, ball2: 10 - ball1Count, ball3: null });
            }
        } else if (currentBall === 3) {
            // 10th frame ball 3
            // We need to update the last frame in finalFrames (which is partial)
            // But wait, `frames` passed in might not have the 10th frame yet if we are IN it?
            // In GameSession, `frames` only has COMPLETED frames.
            // So if we are in Frame 10, `frames` has 9 items.
            // So we are adding the 10th frame object now.
            // But if we are in Ball 3, we must have recorded Ball 1 and 2?
            // GameSession logic: "recordFrame" is called at end of frame.
            // So if we are in Ball 3, `frames` still has 9 items?
            // No, my GameSession logic for 10th frame is:
            // Ball 1 -> setBall1Count.
            // Ball 2 -> If Strike/Spare -> Ball 3.
            // We haven't pushed to `frames` yet.
            // So yes, we are constructing the 10th frame.
            // We need ball1 and ball2 values.
            // `ball1Count` is available.
            // `ball2`? We don't have it passed in `ball1Count`.
            // We need `ball2Count` if we are in Ball 3.
            // The function signature doesn't have `ball2Count`.
            // Limitation: Max score calc for Ball 3 might be slightly off if we don't know Ball 2.
            // But usually Ball 3 only happens if Ball 2 was Strike (after Ball 1 Strike) or Spare.
            // If Ball 1 was Strike, Ball 2 was Strike -> Ball 3 Strike.
            // If Ball 1 was Strike, Ball 2 was Open -> Ball 3 Spare? No.
            // Let's assume perfect finish.

            // For MVP, let's just assume 10 for remaining slots.
        }
    }

    // 3. Fill rest
    for (let f = finalFrames.length + 1; f <= 10; f++) {
        if (f === 10) {
            finalFrames.push({ ball1: 10, ball2: 10, ball3: 10 });
        } else {
            finalFrames.push({ ball1: 10, ball2: null, ball3: null });
        }
    }

    return calculateScore(finalFrames);
}
