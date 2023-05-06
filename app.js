const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// return a list of all the players from the team
// API 1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team;`;
  const playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
//
app.post("/players/", async (request, response) => {
  const techuko = request.body;
  const { playerName, jerseyNumber, role } = techuko;
  const create = `INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES('${playerName}',${jerseyNumber},'${role}');`;
  const dbR = await database.run(create);
  response.send("Player Added to Team");
});

//
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const returnPlayer = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const dbRes = await database.get(returnPlayer);
  response.send(convertDbObjectToResponseObject(dbRes));
});
//
app.put("/players/:playerId/", async (request, response) => {
  const techuko = request.body;
  const { playerName, jerseyNumber, role } = techuko;
  const { playerId } = request.params;
  const update = `UPDATE cricket_team SET 
  player_name='${playerName}',
  jersey_number=${jerseyNumber},
   role='${role}' 
   WHERE player_id=${playerId};`;
  await database.run(update);
  response.send("Player Details Updated");
});
//
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const de = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  const db = await database.run(de);
  response.send("Player Removed");
});
module.exports = app;
