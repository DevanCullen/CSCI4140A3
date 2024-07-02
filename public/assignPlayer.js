document.addEventListener('DOMContentLoaded', async () => {

  const baseUrl = window.location.origin;

  //fetches teams from the server 
  async function fetchTeams() {

const response = await fetch(`${baseUrl}/teams`);

 const teams = await response.json();

    displayTeams(teams);
  }

  //assigns players to teams 
  async function assignPlayers() {

  const response = await fetch(`${baseUrl}/assign-players`, { method: 'POST' });

 const result = await response.json();

 displayTeams(result.teams);

  }

//displays the players and their teams 
  function displayTeams(teams) {

    const teamsContainer = document.getElementById('teamsContainer');

    teamsContainer.innerHTML = '';

    //foreach loop to create the HTML display of teams and their players
    teams.forEach(team => {

      const totalPoints = team.players.reduce((sum, player) => sum + player.points, 0);

      const teamDiv = document.createElement('div');

      teamDiv.innerHTML = `

        <h3>${team.teamName113} - Total Points: ${totalPoints}</h3>

        <ul>
          ${team.players.map(player => `<li>${player.playerName} - ${player.points} points</li>`).join('')}
        </ul>
      `;
      teamsContainer.appendChild(teamDiv);
    });
  }

  //event listener to the assign players to teams button
  document.getElementById('assignButton').addEventListener('click', async () => {
    await assignPlayers();
  });

  await fetchTeams();
});
