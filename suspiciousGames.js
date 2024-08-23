const axios = require('axios');
const fs = require('fs');

const apiUrlMatchDetails = 'https://origins.habbo.es/api/public/matches/v1';
let playerCounts = {};
let matches = [];
const targetPlayerId = process.env.TARGET_PLAYER_ID; // Jugador objetivo

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

            // Si la partida es ranked y tiene menos de 4 jugadores (1 vs 1 o 2 vs 2)
            if (matchInfo.ranked && participants.length <= 4) {
                let allPlayersSuspicious = true; // Global flag for the match
                let suspiciousPlayerData = [];
                let scores = [];
                let allTilesStolenLowGlobal = true;  // Global flag for the match
                let targetPlayerScore = 0;
                let enemyTeamScores = [];

                // Determine the team of the target player
                const targetPlayerTeam = matchInfo.participants.find(p => p.gamePlayerId === targetPlayerId)?.teamId;

                for (const player of matchInfo.participants) {
                    let isSuspiciousPlayer = false;

                    // Mark the player as suspicious if they are not the target player and have participated in 50+ matches
                    if (playerCounts[player.gamePlayerId] && playerCounts[player.gamePlayerId] >= 50) {
                        isSuspiciousPlayer = true;

                        // Add player to repeat offender list if not already present
                        let existingPlayer = repeatOffenderPlayers.find(p => p.gamePlayerId === player.gamePlayerId);
                        if (!existingPlayer) {
                            repeatOffenderPlayers.push({
                                gamePlayerId: player.gamePlayerId,
                                appearances: playerCounts[player.gamePlayerId],
                                gamesWith: 0, // Initialize count of games played with the target player
                                gamesAgainst: 0, // Initialize count of games played against the target player
                                gamesWon: 0, // Initialize games won
                                gamesLost: 0  // Initialize games lost
                            });
                            existingPlayer = repeatOffenderPlayers[repeatOffenderPlayers.length - 1];
                        }

                        // Increment gamesWith or gamesAgainst based on team association
                        if (player.teamId === targetPlayerTeam) {
                            existingPlayer.gamesWith++;
                        } else {
                            existingPlayer.gamesAgainst++;
                        }
                    }

                    if (player.gamePlayerId === targetPlayerId) {
                        targetPlayerScore = player.gameScore;
                    } else {
                        enemyTeamScores.push(player.gameScore);
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

                    // If any non-target player is not suspicious, set allPlayersSuspicious to false
                    if (!isSuspiciousPlayer && player.gamePlayerId !== targetPlayerId) {
                        allPlayersSuspicious = false;
                    }
                }

                // Sort scores to easily compare adjacent values
                scores.sort((a, b) => a - b);

                // Check for nearly equal scores
                let hasSuspiciousEqualScores = scores.every((score, index, arr) => {
                    if (index === 0) return true;
                    return Math.abs(score - arr[index - 1]) <= 5; // Adjust threshold as needed
                });

                // Check for large differences in scores where the target player benefits
                let hasSuspiciousLargeDifferences = false;
                if (enemyTeamScores.length > 0) {
                    hasSuspiciousLargeDifferences = enemyTeamScores.every(score => Math.abs(targetPlayerScore - score) > 50);
                }

                if (hasSuspiciousEqualScores || hasSuspiciousLargeDifferences || allTilesStolenLowGlobal || allPlayersSuspicious) {
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
                        allTilesStolenLowGlobal,
                        hasSuspiciousPlayersGlobal: allPlayersSuspicious
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
    await calculateAndSaveFlagCounts(suspiciousMatches);
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

async function calculateAndSaveFlagCounts(suspiciousMatches) {
    const flagCounts = {
        hasSuspiciousEqualScores: 0,
        hasSuspiciousLargeDifferences: 0,
        allTilesStolenLowGlobal: 0,
        hasSuspiciousPlayersGlobal: 0
    };

    for (const match of suspiciousMatches) {
        if (match.hasSuspiciousEqualScores) flagCounts.hasSuspiciousEqualScores++;
        if (match.hasSuspiciousLargeDifferences) flagCounts.hasSuspiciousLargeDifferences++;
        if (match.allTilesStolenLowGlobal) flagCounts.allTilesStolenLowGlobal++;
        if (match.hasSuspiciousPlayersGlobal) flagCounts.hasSuspiciousPlayersGlobal++;
    }

    fs.writeFile('flag_counts.json', JSON.stringify(flagCounts, null, 2), (err) => {
        if (err) {
            console.error('Error writing to flag_counts.json:', err);
        } else {
            console.log('Flag counts successfully saved to flag_counts.json');
        }
    });
}

// Export the analyzeMatches function so it can be called from index.js
module.exports = analyzeMatches;
