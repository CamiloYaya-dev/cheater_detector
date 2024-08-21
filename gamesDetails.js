const axios = require('axios');
const fs = require('fs');

const apiUrlMatchDetails = 'https://origins.habbo.es/api/public/matches/v1';
let playerCounts = {};
let totalGameScore = 0;
let winCount = 0;
let totalRankedMatches = 0;
const targetPlayerId = 'gp-hhoes-c249e750401e525d80ca74c390b6a343';

async function fetchMatchDetails() {
    const matches = JSON.parse(fs.readFileSync('games.json'));

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

    savePlayerCountsToFile();
    saveTotalGameScoreAndWinRateToFile();
}

function savePlayerCountsToFile() {
    fs.writeFile('player_counts.json', JSON.stringify(playerCounts, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Data successfully saved to player_counts.json');
        }
    });
}

function saveTotalGameScoreAndWinRateToFile() {
    const winRate = (winCount / totalRankedMatches) * 100;
    const result = {
        totalGameScore,
        winRate: `${winRate.toFixed(2)}%`
    };

    fs.writeFile('total_game_score_and_win_rate.json', JSON.stringify(result, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Total game score and win rate successfully saved to total_game_score_and_win_rate.json');
        }
    });
}

fetchMatchDetails();
