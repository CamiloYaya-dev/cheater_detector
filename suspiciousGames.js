const axios = require('axios');
const fs = require('fs');

const apiUrlMatchDetails = 'https://origins.habbo.es/api/public/matches/v1';
const playerCounts = JSON.parse(fs.readFileSync('player_counts.json'));
const matches = JSON.parse(fs.readFileSync('games.json'));
let suspiciousMatches = [];

async function analyzeMatches() {
    for (const matchId of matches) {
        try {
            const response = await axios.get(`${apiUrlMatchDetails
            }/${matchId
            }`);
            const matchInfo = response.data.info;
            const participants = response.data.metadata.participantPlayerIds;

            //If the game is ranked and has less than 4 players (1 vs 1 or 2 vs 2)
            if (matchInfo.ranked && participants.length <= 4) {
                let hasSuspiciousPlayers = false;

                // Check if any of the participants appear in the player_counts.json with a high number of repetitions
                for (const playerId of participants) {
                    if (playerCounts[playerId
                    ] && playerCounts[playerId
                    ] >= 50) { // Adjust the threshold as needed (of repeated players per game)
                        hasSuspiciousPlayers = true;
                        break;
                    }
                }

                if (hasSuspiciousPlayers) {
                    suspiciousMatches.push({
                        matchId,
                        participants,
                        playerCount: participants.length,
                        matchType: participants.length === 2 ? '1 vs 1' : '2 vs 2'
                    });
                    console.log(`Suspicious match found: ${matchId
                    }`);
                }
            }
        } catch (error) {
            console.error(`Error fetching match details for match ID ${matchId
            }:`, error);
        }
    }

    saveSuspiciousMatchesToFile();
}

function saveSuspiciousMatchesToFile() {
    fs.writeFile('suspicious_matches.json', JSON.stringify(suspiciousMatches,
    null,
    2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Suspicious matches successfully saved to suspicious_matches.json');
        }
    });
}

analyzeMatches();
