const axios = require('axios');
const fs = require('fs');

const apiUrl = 'https://origins.habbo.es/api/public/matches/v1/gp-hhoes-931112b96c7a9bd3afa5c1f5ed0276a5/ids';
const limit = 100; // Límite máximo por la API
let offset = 0;
let allResults = [];

async function fetchMatches() {
    let hasMoreData = true;

    while (hasMoreData) {
        try {
            const response = await axios.get(apiUrl, {
                params: {
                    limit: limit,
                    offset: offset
                }
            });

            const data = response.data;
            if (data.length > 0) {
                allResults = allResults.concat(data);
                offset += limit;
                console.log(`Fetched ${data.length} records, total so far: ${allResults.length}`);
            } else {
                hasMoreData = false;
                console.log('No more records to fetch.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            hasMoreData = false; // Stop if there's an error
        }
    }

    await saveResultsToFile();  // Ensure the file is saved before returning
}

async function saveResultsToFile() {
    return new Promise((resolve, reject) => {
        fs.writeFile('games.json', JSON.stringify(allResults, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                reject(err);
            } else {
                console.log('Data successfully saved to games.json');
                resolve();
            }
        });
    });
}

module.exports = fetchMatches;
