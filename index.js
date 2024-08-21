const axios = require('axios');
const fs = require('fs');

const apiUrl = 'https://origins.habbo.es/api/public/matches/v1/gp-hhoes-c7e8fee0d326d9f2cae28073b6b88fba/ids';
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

    saveResultsToFile();
}

function saveResultsToFile() {
    fs.writeFile('matches.json', JSON.stringify(allResults, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Data successfully saved to matches.json');
        }
    });
}

fetchMatches();
