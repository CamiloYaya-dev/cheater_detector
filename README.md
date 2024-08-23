# Irregularity Detector

## Installation and Usage

1. **Install Dependencies:**

   Run the following command in the console to install the necessary dependencies:

   ```bash
   npm install

2. **Set Up Environment Variables:**

    In the .env file, insert the user ID you wish to investigate by assigning it to the TARGET_PLAYER_ID variable.

    Example:

    TARGET_PLAYER_ID=gp-hhoes-a0e19d7c2f6070aaa301d43afbef59a8

3. **Run the Script:**

    Execute the following command in the console to start the process:

    node .

4. **Processing Time:**

    The process might take some time to complete, depending on the number of games being analyzed. The more games there are, the longer it will take.

## Explanation of the Flow and the Generated JSON Files

    the flow goes in list order.

1. **Script Execution**

    The script begins by fetching all the Battleball games related to the target player. This is managed by the games.js script

2. **games.json**

    This file is generated to store all the games in which the target player has participated. It acts as a reference for further analysis.

3. **gamesDetails.js**

    This script is used to detect mainly how many times you have played games with the same players, also their winRate, score, total games, total casual games and total ranked games.

4. **player_counts.json**

    This file contains the total number of matches the target player (under investigation) has participated in, along with a count of how many times he has encountered other players in those matches. (This count does not discriminate whether the matches he has shared with a player are on the same team or on enemy teams.)

5. **total_game_score_and_win_rate.json**

    This file contains basic information, for less technical users.

6. **suspiciousGames.js and the detection of irregularities**

    The suspiciousGames.js script is used to detect suspicious behavior in matches, such as unusual patterns of score similarities or significant score differences that could indicate irregularities.

7. **suspicious_matches.json**

    This file contains information about all suspicious games (by default, all games where the number of participants is less than or equal to 4 (1vs1, 2vs2, 3vs1) are considered suspicious games; however, this is configurable by "entering and reading the file documentation").

    In this file we see the details of each suspicious game, as well as their assigned flags, both individually for each player and globally for the game. There is also other relevant information such as the score, painted, stolen, blocked squares, etc.

8. **repeat_offender_players.json**

    In this file there is information about how many times you reoffended playing with a player, discriminated if you shared the game playing with or against the player (here only players with whom you have shared 50 SUSPICIOUS games appear by default, if you want to change the number of suspicious games it is configurable from the suspiciousGames.js file line 64) IMPORTANT TO KEEP IN MIND FOR YOU WHAT A SUSPICIOUS GAME IS "remember that by default it is in 1vs1, 2vs2 and 3vs1"

    The information in this file is very important because it is the validation between player_counts.json and suspicious_matches.json to detect the cheat known as "collusion"

9. **flag_counts.json**

    Finally, this file sums up the flags or alerts (as you want to call them) that this player has in suspicious games "it only makes readability easier."

## Explanation of the flags

1. **hasSuspiciousEqualScores - agree on games**

    The hasSuspiciousEqualScores flag is triggered when the scores of the players in a game are very close, suggesting that the players might have agreed beforehand to end the game with nearly identical scores. The default threshold for this flag is a difference of 5 points or less between the scores. For example, in a 1 vs 1 game, if one player scores 90 and the other scores 88, this flag will be set to true. In a match with four participants, if their scores are 90, 85, 87, and 89, the flag would also be activated because the differences are within the 5-point threshold.

    This threshold can be adjusted in the suspiciousGames.js file on line 107.

    Explanation of Agreeing on Games:
    Agreeing on games, refers to a situation where the players in a match secretly agree to achieve similar scores, ensuring that no one player significantly outperforms the others. This is often done to mutually benefit all involved players, for example, by avoiding suspicion or ensuring that everyone receives the same rewards or recognition. This kind of behavior is considered unethical as it manipulates the game's outcome, undermining fair competition.

2. **hasSuspiciousLargeDifferences - win boosting**

    The hasSuspiciousLargeDifferences flag is used to detect situations where the target player (under investigation) has a significantly higher score than every other participant in a match, specifically by more than 50 points (by default). This large difference in scores could indicate that the target player received help from others who might not have been trying to win, but instead were playing in a way that allowed the target player to achieve a much higher score.

    This threshold can be adjusted in the suspiciousGames.js file on line 113.

    Explanation of Win Boosting:
    Win boosting is a tactic where players intentionally underperform or lose in a game to help another player win or achieve a higher score. In the context of this script, it means that other players might be deliberately making poor moves, not contesting objectives, or otherwise not trying to win the match, all to ensure that the target player benefits, typically by increasing their score or improving their win rate. This practice is often frowned upon because it undermines the competitive integrity of the game.

3.  **hasSuspiciousLargeDifferences - win boosting**