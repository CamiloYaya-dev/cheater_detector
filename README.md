# Irregularity Detector

## English documentation

## Installation and Usage

1. **Install Dependencies:**

   Run the following command in the console to install the necessary dependencies:

   npm install

2. **Set Up Environment Variables:**

    In the .env file, insert the user ID you wish to investigate by assigning it to the TARGET_PLAYER_ID variable.

    Example:

    TARGET_PLAYER_ID=gp-hhoes-a9b08b16186ec8c9be235ada44f5e777

    This id is from my Emo. user and I did some unethical practices to see if the cheat detector would work, I am not participating in the competition and I just made this program to try to make the competition more fair for everyone.

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

3.  **hasSuspiciousLargeDifferences - win boosting/agree on games**

    allTilesStolenLowGlobal This flag basically serves as a bridge (if you want it) to help detect suspicious behavior from all players in the game, basically it detects if there were few tiles stolen by ALL players in the game. The threshold is less than 10 tiles stolen by each player.

    stealing few tiles in a game that is all about painting tiles and stealing the enemy's tiles is basically pointless.

4. **hasSuspiciousPlayersGlobal - collusion**

    The hasSuspiciousPlayersGlobal flag detects when all players in a match have played more than 50 matches (default), but it is important to know what “collusion” is.

    This flag is configurable on line 60 of the suspiciousGames.js file

    The term commonly used in competitions to describe the practice of repeatedly playing with the same people to exclude others and secure prizes within a group is “collusion.”

    Collusion in this context refers to a secret agreement or cooperation between participants to manipulate the results of the competition in their favor, unfairly excluding other competitors. It is a practice generally prohibited in competitions, tournaments, and organized games.

    The information in this flag can be verified with the player_counts.json, repeat_offender_players.json, and suspicious_matches.json files.

    Suppose there are 20 people in a lobby, and a game is created in which 4 players are randomly selected to participate. The chance of the exact same combination of players (regardless of order) being repeated in another game is extremely low. Specifically, the probability of this same combination of 4 people being repeated is 1 in 4845, or approximately 0.02064%.

    If you play 1000 games, in the same 20-person lobby, the expected number of times a specific combination of 4 players will be repeated is also very low, around 0.21 times. This means that on average you might not see any repetition, but if you do, it would be a fairly rare situation.

    That's why this flag is so important, because it detects irregularity in the same combination of players (collusion).

## GRATITUDE

    Finally, I would like to thank anyone who has seen my code, it is free to use, you can do with it whatever you like, I know that the code may have many improvements, errors, etc... however, it is what I was able to do in a couple of hours, I hope that if someone finds it useful, they can improve it in terms of loading times and perhaps detect more irregularities, everything I do and do not do, has always been and will be to help the beautiful Habbo community, thank you for reading and using my code.

    Sincerely, Emo. - Origins ES

## Español documentacion

## Instalación y uso

1. **Instalar dependencias:**

    Ejecutar el siguiente comando en la consola para instalar las dependencias necesarias:

    npm install

2. **Configurar variables de entorno:**

    En el archivo .env, inserte el ID de usuario que desea investigar asignándolo a la variable TARGET_PLAYER_ID.

    Ejemplo:

    TARGET_PLAYER_ID=gp-hhoes-a9b08b16186ec8c9be235ada44f5e777

    Este ID es de mi usuario Emo. y realicé algunas prácticas poco éticas para ver si funcionaba el detector de trampas. No estoy participando en la competencia y solo hice este programa para intentar que la competencia sea más justa para todos.

3. **Ejecutar el script:**

    Ejecute el siguiente comando en la consola para iniciar el proceso:

    node .

4. **Tiempo de procesamiento:**

    El proceso puede tardar un tiempo en completarse, dependiendo de la cantidad de juegos que se analicen. Cuantos más juegos haya, más tiempo tardará.

## Explicación del flujo y los archivos JSON generados

    El flujo se realiza en orden de lista.

1. **Ejecución del script**

    El script comienza recuperando todos los juegos de Battleball relacionados con el jugador objetivo. Esto lo administra el script games.js

2. **games.json**

    Este archivo se genera para almacenar todos los juegos en los que ha participado el jugador objetivo. Actúa como referencia para un análisis posterior.

3. **gamesDetails.js**

    Este script se utiliza principalmente para detectar cuántas veces has jugado juegos con los mismos jugadores, también su tasa de victorias, puntaje, juegos totales, juegos casuales totales y juegos clasificados totales.

4. **player_counts.json**

    Este archivo contiene el número total de partidos en los que ha participado el jugador objetivo (bajo investigación), junto con un recuento de cuántas veces se ha encontrado con otros jugadores en esos partidos. (Este recuento no discrimina si los partidos que ha compartido con un jugador son en el mismo equipo o en equipos enemigos).

5. **total_game_score_and_win_rate.json**

    Este archivo contiene información básica, para usuarios menos técnicos.

6. **suspiciousGames.js y la detección de irregularidades**

    El script psychologicalGames.js se utiliza para detectar comportamientos sospechosos en los partidos, como patrones inusuales de similitudes en los puntajes o diferencias significativas en los puntajes que podrían indicar irregularidades.

7. **suspicious_matches.json**

    Este archivo contiene información sobre todos los juegos sospechosos (por defecto, todos los juegos donde el número de participantes es menor o igual a 4 (1vs1, 2vs2, 3vs1) se consideran juegos sospechosos; sin embargo, esto es configurable "ingresando y leyendo la documentación del archivo").

    En este archivo vemos los detalles de cada juego sospechoso, así como sus flags asignados, tanto de forma individual para cada jugador como de forma global para el juego. También hay otra información relevante como el marcador, casillas pintadas, robadas, bloqueadas, etc.

8. **repeat_offender_players.json**

    En este archivo hay información de cuantas veces reincidiste jugando con un jugador, discriminado si compartiste la partida jugando con o contra el jugador (aquí solo aparecen jugadores con los que has compartido 50 partidas SOSPECHOSAS por defecto, si quieres cambiar el número de partidas sospechosas es configurable desde el archivo concernedGames.js línea 64) IMPORTANTE A TENER EN CUENTA PARA TI QUÉ ES UNA PARTIDA SOSPECHOSA "recuerda que por defecto es en 1vs1, 2vs2 y 3vs1"

    La información de este archivo es muy importante porque es la validación entre player_counts.json y concerned_matches.json para detectar la trampa conocida como "collusion"

9. **flag_counts.json**

    Por último, este archivo resume las flags o alertas (como quieras llamarlas ellos) que este jugador tiene en juegos sospechosos "solo hace que la lectura sea más fácil".

## Explicación de las banderas

1. **hasSuspiciousEqualScores - acuerdo sobre juegos**

    La bandera hasSuspiciousEqualScores se activa cuando los puntajes de los jugadores en un juego son muy similares, lo que sugiere que los jugadores podrían haber acordado de antemano terminar el juego con puntajes casi idénticos. El umbral predeterminado para esta bandera es una diferencia de 5 puntos o menos entre los puntajes. Por ejemplo, en un juego 1 contra 1, si un jugador obtiene 90 y el otro 88, esta bandera se establecerá como verdadera. En un partido con cuatro participantes, si sus puntajes son 90, 85, 87 y 89, la bandera también se activará porque las diferencias están dentro del umbral de 5 puntos.

    Este umbral se puede ajustar en el archivo concernedGames.js en la línea 107.

    Explicación de ponerse de acuerdo sobre los juegos:
    Ponerse de acuerdo sobre los juegos se refiere a una situación en la que los jugadores de una partida acuerdan en secreto lograr puntuaciones similares, asegurándose de que ningún jugador supere significativamente a los demás. Esto se hace a menudo para beneficiar mutuamente a todos los jugadores involucrados, por ejemplo, evitando sospechas o asegurándose de que todos reciban las mismas recompensas o reconocimientos. Este tipo de comportamiento se considera poco ético ya que manipula el resultado del juego, socavando la competencia justa.

2. **hasSuspiciousLargeDifferences - aumento de victorias**

    El indicador hasSuspiciousLargeDifferences se utiliza para detectar situaciones en las que el jugador objetivo (bajo investigación) tiene una puntuación significativamente más alta que todos los demás participantes en una partida, específicamente por más de 50 puntos (por defecto). Esta gran diferencia en las puntuaciones podría indicar que el jugador objetivo recibió ayuda de otros que podrían no haber estado tratando de ganar, sino que estaban jugando de una manera que le permitió al jugador objetivo lograr una puntuación mucho más alta.

    Este umbral se puede ajustar en el archivo sospechosoGames.js en la línea 113.

    Explicación de Win Boosting:
    Win Boosting es una táctica en la que los jugadores tienen un rendimiento inferior o pierden intencionalmente en un juego para ayudar a otro jugador a ganar o lograr una puntuación más alta. En el contexto de este script, significa que otros jugadores podrían estar haciendo movimientos malos deliberadamente, no disputando objetivos o no tratando de ganar la partida, todo para garantizar que el jugador objetivo se beneficie, generalmente aumentando su puntuación o mejorando su tasa de victorias. Esta práctica a menudo está mal vista porque socava la integridad competitiva del juego.

3. **hasSuspiciousLargeDifferences - aumento de victorias/acuerdo sobre juegos**

    allTilesStolenLowGlobal Esta bandera básicamente sirve como un puente (si lo deseas) para ayudar a detectar comportamiento sospechoso de todos los jugadores en el juego, básicamente detecta si hubo pocas fichas robadas por TODOS los jugadores en el juego. El umbral es menos de 10 fichas robadas por cada jugador.

    robar pocas fichas en un juego que se trata de pintar fichas y robar las fichas del enemigo es básicamente inútil.

4. **hasSuspiciousPlayersGlobal - colusión**

    La bandera hasSuspiciousPlayersGlobal detecta cuando todos los jugadores en una partida han jugado más de 50 partidas (predeterminado), pero es importante saber qué es la "colusión".

    Esta bandera se puede configurar en la línea 60 del archivo concernedGames.js

    El término que se usa comúnmente en las competiciones para describir la práctica de jugar repetidamente con las mismas personas para excluir a otros y asegurarse premios dentro de un grupo es “colusión”.

    La colusión en este contexto se refiere a un acuerdo secreto o cooperación entre los participantes para manipular los resultados de la competición a su favor, excluyendo injustamente a otros competidores. Es una práctica generalmente prohibida en competiciones, torneos y juegos organizados.

    La información de esta bandera se puede verificar con los archivos player_counts.json, repeat_offender_players.json y concerned_matches.json.

    Supongamos que en una sala (lobby) hay 20 personas, y se crea una partida en la que 4 jugadores son seleccionados al azar para participar. La posibilidad de que se repita exactamente la misma combinación de jugadores (sin considerar el orden) en otra partida es extremadamente baja. Específicamente, la probabilidad de que esta misma combinación de 4 personas se repita es de 1 entre 4845, o aproximadamente 0.02064%.

    Si juegas 1000 partidas, en la misma loby de 20 personas, la cantidad esperada de veces que se repetirá una combinación específica de 4 jugadores es también muy baja, alrededor de 0.21 veces. Esto significa que, en promedio, es posible que no veas ninguna repetición, pero si ocurre, sería una situación bastante rara.

    Por eso es tan importante esta bandera, por que detecta la iregularidad en la misma convinacion de jugadores (collusion)
    
## Agradecimiento 

    Por ultimo de gustaria agradecer a cualquier que halla visto mi codigo, es de uso libre, pueden hacer con el lo que gusten, se que talvez el codigo puede tener muchas mejoras, fallas, etc... sin embargo es lo que pude hacer en un par de horas, espero que si alguien lo ve util lo pueda perfeccionar en los tiempos de carga y talvez detectando mas irregularidades, todo lo que hago y dejo de hacer, siempre a sido y sera por ayudar a la hermosa comunidad de habbo, gracias por leer y utilizar mi codigo.

    atentamente Emo. - Origins ES