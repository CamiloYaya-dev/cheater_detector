const axios = require('axios');
const fs = require('fs');

const apiUrlMatchDetails = 'https://origins.habbo.es/api/public/matches/v1';
let playerCounts = {};
let matches = [];

async function loadFiles() {
    try {
        const playerCountsContent = fs.readFileSync('player_counts.json', 'utf-8');
        if (!playerCountsContent || playerCountsContent.trim() === '') {
            throw new Error('player_counts.json is empty or unreadable');
        }
        playerCounts = JSON.parse(playerCountsContent);

        const matchesContent = fs.readFileSync('games.json', 'utf-8');
        if (!matchesContent || matchesContent.trim() === '') {
            throw new Error('games.json is empty or unreadable');
        }
        matches = JSON.parse(matchesContent);

    } catch (error) {
        console.error('Error reading or parsing input files:', error.message);
        return false;  // Abort further execution if any file cannot be read or parsed
    }

    return true;
}

async function analyzeMatches() {
    if (!(await loadFiles())) return;

    let suspiciousMatches = [];
    let repeatOffenderPlayers = [];

    for (const matchId of matches) {
        try {
            const response = await axios.get(`${apiUrlMatchDetails}/${matchId}`);
            const matchInfo = response.data.info;
            const participants = response.data.metadata.participantPlayerIds;

            // If the game is ranked and has less than 4 players (1 vs 1 or 2 vs 2)
            if (matchInfo.ranked && participants.length <= 4) {
                let hasSuspiciousPlayersGlobal = false; // Global flag for the match
                let suspiciousPlayerData = [];
                let scores = [];
                let allTilesStolenLowGlobal = true;  // Global flag for the match

                // Gather all player scores and check tilesStolen
                for (const player of matchInfo.participants) {
                    let isSuspiciousPlayer = false;

                    // Check if the player has appeared in many games (repeat offender)
                    if (playerCounts[player.gamePlayerId] && playerCounts[player.gamePlayerId] >= 50) { // Adjust the threshold as needed
                        isSuspiciousPlayer = true;
                        hasSuspiciousPlayersGlobal = true; // Mark the match as having suspicious players

                        // Add player to repeat offender list if not already present
                        if (!repeatOffenderPlayers.some(p => p.gamePlayerId === player.gamePlayerId)) {
                            repeatOffenderPlayers.push({
                                gamePlayerId: player.gamePlayerId,
                                appearances: playerCounts[player.gamePlayerId]
                            });
                        }
                    }

                    const playerData = {
                        gamePlayerId: player.gamePlayerId,
                        gameScore: player.gameScore,
                        playerPlacement: player.playerPlacement,
                        teamId: player.teamId,
                        teamPlacement: player.teamPlacement,
                        timesStunned: player.timesStunned,
                        powerUpPickups: player.powerUpPickups,
                        powerUpActivations: player.powerUpActivations,
                        tilesCleaned: player.tilesCleaned,
                        tilesColoured: player.tilesColoured,
                        tilesStolen: player.tilesStolen,
                        tilesLocked: player.tilesLocked,
                        tilesColouredForOpponents: player.tilesColouredForOpponents,
                        tilesStolenLow: player.tilesStolen < 5, // Flag for individual player
                        isSuspiciousPlayer // Flag indicating if the player is suspicious based on repetitions
                    };
                    suspiciousPlayerData.push(playerData);
                    scores.push(player.gameScore);

                    // Check if this player's tilesStolen is low
                    if (player.tilesStolen >= 5) {
                        allTilesStolenLowGlobal = false;
                    }
                }

                // Sort scores to easily compare adjacent values
                scores.sort((a, b) => a - b);

                // Check for nearly equal scores
                let hasSuspiciousEqualScores = scores.every((score, index, arr) => {
                    if (index === 0) return true;
                    return Math.abs(score - arr[index - 1]) <= 5; // Adjust threshold as needed
                });

                // Check for large differences in scores
                let hasSuspiciousLargeDifferences = scores.some((score, index, arr) => {
                    if (index === 0) return false;
                    return Math.abs(score - arr[index - 1]) > 50; // Adjust threshold as needed
                });

                if (hasSuspiciousPlayersGlobal || hasSuspiciousEqualScores || hasSuspiciousLargeDifferences || allTilesStolenLowGlobal) {
                    suspiciousMatches.push({
                        matchId,
                        participants,
                        playerCount: participants.length,
                        matchType: participants.length === 2 ? '1 vs 1' : '2 vs 2',
                        ranked: matchInfo.ranked,
                        gameMode: matchInfo.gameMode,
                        gameDuration: matchInfo.gameDuration,
                        players: suspiciousPlayerData,
                        hasSuspiciousEqualScores,
                        hasSuspiciousLargeDifferences,
                        allTilesStolenLowGlobal, // Global flag indicating if all players stole fewer than 5 tiles
                        hasSuspiciousPlayersGlobal // Global flag indicating if there are any suspicious players based on repetitions
                    });
                    console.log(`Suspicious match found: ${matchId}`);
                }
            }
        } catch (error) {
            console.error(`Error fetching match details for match ID ${matchId}:`, error);
        }
    }

    saveSuspiciousMatchesToFile(suspiciousMatches);
    saveRepeatOffenderPlayersToFile(repeatOffenderPlayers);
}

function saveSuspiciousMatchesToFile(suspiciousMatches) {
    fs.writeFile('suspicious_matches.json', JSON.stringify(suspiciousMatches, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Suspicious matches successfully saved to suspicious_matches.json');
        }
    });
}

function saveRepeatOffenderPlayersToFile(repeatOffenderPlayers) {
    fs.writeFile('repeat_offender_players.json', JSON.stringify(repeatOffenderPlayers, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Repeat offender players successfully saved to repeat_offender_players.json');
        }
    });
}

// Export the analyzeMatches function so it can be called from index.js
module.exports = analyzeMatches;