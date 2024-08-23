async function runScripts() {
    //await require('./games.js')();
    //await require('./gamesDetails.js')();
    await require('./suspiciousGames.js')();
}

runScripts().then(() => {
    console.log('All scripts executed successfully.');
}).catch(error => {
    console.error('Error executing scripts:', error);
});