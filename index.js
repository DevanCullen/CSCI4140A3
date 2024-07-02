const express = require('express');

const bodyParser = require('body-parser');

const { MongoClient } = require('mongodb');

const app = express();

const port = process.env.PORT || 3000;

//MongoDB connection 
const uri = 'mongodb://localhost:27017'; 

const dbName = 'Assignment3CSCI4140'; 

const client = new MongoClient(uri, { useUnifiedTopology: true });

async function connectToDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(dbName);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
}


app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(bodyParser.json());

//Make index.html as the an entry point
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/players', async (req, res) => {

  try {

 const db = await connectToDB();

 const playersCollection = db.collection('Players113');

 const players = await playersCollection.find({}).toArray();
    console.log('Players fetched:', players); 
    res.json(players);
  } 
  
  catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).send('Internal Server Error');
  }
});

//Adding route for teams and fetching the teams data
app.get('/teams', async (req, res) => {
  try {

    const db = await connectToDB();

    const teamsCollection = db.collection('Teams113');


    const teams = await teamsCollection.find({}).toArray();

    console.log('Teams fetched:', teams); 
    res.json(teams);
  } 
  
  catch (err) {

    console.error('Error fetching teams:', err);
    res.status(500).send('Internal Server Error');

  }
});

//inserts given players into the "players" array of a specific team in collection teams113
app.post('/assign-players', async (req, res) => {
  try {

    const db = await connectToDB();

    const playersCollection = db.collection('Players113');

    const teamsCollection = db.collection('Teams113');

    const players = await playersCollection.find({}).toArray();
    const teams = await teamsCollection.find({}).toArray();

    //Reset players into teams
    await teamsCollection.updateMany({}, { $set: { players: [] } });

    //Assigning each player perferred to teams
    let unassignedPlayers = [...players];

    const assignedPlayers = [];

    const maxPlayersPerTeam = 3;

    const points = { 1: 3, 2: 2, 3: 1, none: -1 };

    //Initializing empty player array for each team
    teams.forEach(team => {

      team.players = [];

    });

    //forEach loop to interate through each player and assign them to a team based on their preferences
    players.forEach(player => {
      let assigned = false;

       //for lLoop to interate through the player's preferences to find them a team
      for (let i = 0; i < player.preferences.length; i++) {
        const preferredTeam = teams.find(team => team.teamName113 === player.preferences[i]);

        //If the preferred team is found and it has less than the max players, assign the player to this team
        if (preferredTeam && preferredTeam.players.length < maxPlayersPerTeam) {

          preferredTeam.players.push({ playerName: `${player.lastName113}`, points: points[i + 1] });
          assignedPlayers.push(player);

          assigned = true;

          break;
        }

      }

      //if player is not assigned to any team add them to the unassigned players list 
      if (!assigned) {
        unassignedPlayers.push(player);
      }
    });

     //Assign remaining players to teams without preferences
     unassignedPlayers.forEach(player => {
      const availableTeam = teams.find(team => team.players.length < maxPlayersPerTeam);
      if (availableTeam) {
          availableTeam.players.push({ playerName: `${player.lastName113}`, points: points.none });
        }
      });

    //Updates teams with the correct assigned players
    const updatePromises = teams.map(async team => {

      const result = await teamsCollection.updateOne(

        { teamName113: team.teamName113 },

        { $set: { players: team.players } }

      );
      console.log(`Updated ${result.modifiedCount} document(s) for team ${team.teamName113}`);
    });
    
    await Promise.all(updatePromises);

    res.json({ success: true, message: 'Players assigned successfully', teams });
  } catch (err) {
    console.error('Error assigning players to teams:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

//Starts the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
