document.addEventListener('DOMContentLoaded', async () => {

  const baseUrl = window.location.origin;

  async function fetchPlayers() {

 const response = await fetch(`${baseUrl}/players`);

 const players = await response.json();

displayPlayers(players);
  }

  function displayPlayers(players) {

    const playerList = document.getElementById('playerList');

    playerList.innerHTML = '';

    players.forEach(player => {

  const listItem = document.createElement('li');

  listItem.textContent = `${player.lastName113} (${player.email}): ${player.preferences.join(', ')}`;

   playerList.appendChild(listItem);

    });
  }

  await fetchPlayers();
});
