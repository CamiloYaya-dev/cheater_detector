const axios = require('axios');
const fs = require('fs');

const apiUrlMatchDetails = 'https://origins.habbo.es/api/public/matches/v1';
let playerCounts = {};
let totalGameScore = 0;
let winCount = 0;
let totalRankedMatches = 0;
const targetPlayerId = 'gp-hhoes-931112b96c7a9bd3afa5c1f5ed0276a5';

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

            // Solo procesar si la partida es ranked
            if (matchInfo.ranked) {
                totalRankedMatches++;

                // Contar la aparición de cada participante
                for (const playerId of participants) {
                    if (playerCounts[playerId]) {
                        playerCounts[playerId] += 1;
                    } else {
                        playerCounts[playerId] = 1;
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

                console.log(`Processed ranked match: ${matchId}`);
            }

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
        winRate: `${winRate.toFixed(2)}%`
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
