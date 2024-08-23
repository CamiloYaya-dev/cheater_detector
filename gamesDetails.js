const axios = require('axios');
const fs = require('fs');

const apiUrlMatchDetails = 'https://origins.habbo.es/api/public/matches/v1';
let playerCounts = {};
let totalGameScore = 0;
let winCount = 0;
let totalRankedMatches = 0;
let totalMatches = 0;  // Total de partidas
let totalNonRankedMatches = 0;  // Partidas con ranked: false
const targetPlayerId = process.env.TARGET_PLAYER_ID;

async function fetchMatchDetails() {
    let matches;

    try {
        const fileContent = fs.readFileSync('games.json', 'utf-8');
        
        if (!fileContent || fileContent.trim() === '') {
            throw new Error('games.json is empty or unreadable');
        }

        matches = JSON.parse(fileContent);
        
        if (!Array.isArray(matches)) {
            throw new Error('games.json does not contain a valid JSON array');
        }

    } catch (error) {
        console.error('Error reading or parsing games.json:', error.message);
        return;  // Abort further execution if the file cannot be read or parsed
    }

    for (const matchId of matches) {
        try {
            const response = await axios.get(`${apiUrlMatchDetails}/${matchId}`);
            const matchInfo = response.data.info;
            const participants = response.data.metadata.participantPlayerIds;

            // Incrementar el total de partidas
            totalMatches++;

            if (matchInfo.ranked) {
                totalRankedMatches++;

                // Contar la aparición de cada participante, excluyendo al jugador objetivo
                for (const playerId of participants) {
                    if (playerId !== targetPlayerId) {
                        if (playerCounts[playerId]) {
                            playerCounts[playerId] += 1;
                        } else {
                            playerCounts[playerId] = 1;
                        }
                    }
                }

                // Sumar el gameScore del jugador objetivo
                const targetPlayer = matchInfo.participants.find(p => p.gamePlayerId === targetPlayerId);
                if (targetPlayer) {
                    totalGameScore += targetPlayer.gameScore;

                    // Verificar si el equipo del jugador objetivo ganó
                    const playerTeam = matchInfo.teams.find(t => t.teamId === targetPlayer.teamId);
                    if (playerTeam && playerTeam.win) {
                        winCount++;
                    }
                }

            } else {
                totalNonRankedMatches++;  // Incrementar el contador de partidas no rankeadas
            }

            console.log(`Processed match: ${matchId}`);

        } catch (error) {
            console.error(`Error fetching match details for match ID ${matchId}:`, error);
        }
    }

    await savePlayerCountsToFile();
    await saveTotalGameScoreAndWinRateToFile();
}

async function savePlayerCountsToFile() {
    return new Promise((resolve, reject) => {
        fs.writeFile('player_counts.json', JSON.stringify(playerCounts, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                reject(err);
            } else {
                console.log('Data successfully saved to player_counts.json');
                resolve();
            }
        });
    });
}

async function saveTotalGameScoreAndWinRateToFile() {
    const winRate = (winCount / totalRankedMatches) * 100;
    const result = {
        totalGameScore,
        winRate: `${winRate.toFixed(2)}%`,
        totalMatches,  // Total de partidas jugadas
        totalRankedMatches,  // Partidas con ranked: true
        totalNonRankedMatches  // Partidas con ranked: false
    };

    return new Promise((resolve, reject) => {
        fs.writeFile('total_game_score_and_win_rate.json', JSON.stringify(result, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                reject(err);
            } else {
                console.log('Total game score and win rate successfully saved to total_game_score_and_win_rate.json');
                resolve();
            }
        });
    });
}

module.exports = fetchMatchDetails;
