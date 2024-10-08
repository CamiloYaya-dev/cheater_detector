const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const apiUrlMatchDetails = 'https://origins.habbo.es/api/public/matches/v1';
let playerCounts = {};
let matches = [];
const targetPlayerId = process.env.TARGET_PLAYER_ID;

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
        return false; 
    }

    return true;
}

async function analyzeMatches() {
    if (!(await loadFiles())) return;

    let suspiciousMatches = [];

    for (const matchId of matches) {
        try {
            const response = await axios.get(`${apiUrlMatchDetails}/${matchId}`);
            const matchInfo = response.data.info;
            const participants = response.data.metadata.participantPlayerIds;

            if (matchInfo.ranked && participants.length <= 4) {
                let allPlayersSuspicious = true;
                let allTilesStolenLowGlobal = true;
                let suspiciousPlayerData = [];
                let scores = [];
                let targetPlayerScore = 0;
                let enemyTeamScores = [];

                for (const player of matchInfo.participants) {
                    let isSuspiciousPlayer = false;

                    if (player.gamePlayerId === targetPlayerId) {
                        isSuspiciousPlayer = true;
                        targetPlayerScore = player.gameScore;
                    } else {
                        enemyTeamScores.push(player.gameScore);

                        if (playerCounts[player.gamePlayerId] && playerCounts[player.gamePlayerId] >= 50) {
                            isSuspiciousPlayer = true;
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
                        tilesStolenLow: player.tilesStolen < 10, // Flag for individual player
                        isSuspiciousPlayer: isSuspiciousPlayer
                    };
                   
                    if (!playerData.tilesStolenLow) {
                        allTilesStolenLowGlobal = false; 
                    }

                    suspiciousPlayerData.push(playerData);
                    scores.push(player.gameScore);

                    if (!isSuspiciousPlayer) {
                        allPlayersSuspicious = false;
                    }
                }

                scores.sort((a, b) => a - b);

                let hasSuspiciousEqualScores = scores.every((score, index, arr) => {
                    if (index === 0) return true;
                    return Math.abs(score - arr[index - 1]) <= 5;
                });

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
            } else {
                console.log(`Match ${matchId} is not ranked or has more than 4 players.`);
            }
        } catch (error) {
            console.error(`Error fetching match details for match ID ${matchId}:`, error);
        }
    }

    saveSuspiciousMatchesToFile(suspiciousMatches);
    await calculateAndSaveFlagCounts(suspiciousMatches);
    await calculateAndSaveRepeatOffenderPlayers(suspiciousMatches);
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

async function calculateAndSaveRepeatOffenderPlayers(suspiciousMatches) {
    let repeatOffenderPlayers = {};

    suspiciousMatches.forEach(match => {
        match.players.forEach(player => {
            if (player.isSuspiciousPlayer) {
                if (!repeatOffenderPlayers[player.gamePlayerId]) {
                    repeatOffenderPlayers[player.gamePlayerId] = {
                        gamePlayerId: player.gamePlayerId,
                        appearances: 0,
                        gamesWith: 0,
                        gamesAgainst: 0
                    };
                }

                repeatOffenderPlayers[player.gamePlayerId].appearances++;

                const targetPlayer = match.players.find(p => p.gamePlayerId === targetPlayerId);
                if (player.teamId === targetPlayer.teamId) {
                    repeatOffenderPlayers[player.gamePlayerId].gamesWith++;
                } else {
                    repeatOffenderPlayers[player.gamePlayerId].gamesAgainst++;
                }
            }
        });
    });

    const repeatOffenderArray = Object.values(repeatOffenderPlayers);

    fs.writeFile('repeat_offender_players.json', JSON.stringify(repeatOffenderArray, null, 2), (err) => {
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
