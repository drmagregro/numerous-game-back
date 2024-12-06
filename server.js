const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const uuid = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Front-end React
    methods: ['GET', 'POST'],
  },
});

let games = {}; // Stocke les jeux actifs

// Middleware pour accepter les requêtes JSON
app.use(express.json());

// Route pour créer une nouvelle partie
app.post('/api/new-game', (req, res) => {
  const gameId = uuid.v4();  // Créer un ID unique pour chaque partie
  games[gameId] = { 
    number: generateMysteryNumber(),  // Nombre mystère à deviner (6 chiffres)
    players: [], 
    guesses: [] 
  };  // Ajouter la partie à notre "base de données" en mémoire
  res.json({ gameId }); // Retourner l'ID de la nouvelle partie
});

// Fonction pour générer un nombre mystère de 6 chiffres
function generateMysteryNumber() {
  let num = '';
  while (num.length < 6) {
    num += Math.floor(Math.random() * 10); // Génère un nombre de 6 chiffres
  }
  return num;
}

// Lorsqu'un joueur se connecte via WebSocket
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');

  // Le joueur rejoint une partie existante
  socket.on('joinGame', (gameId) => {
    if (games[gameId]) {
      games[gameId].players.push(socket.id); // Ajouter le joueur à la liste des joueurs
      socket.join(gameId); // Joindre la salle du jeu
      io.to(gameId).emit('message', `Un joueur a rejoint la partie ${gameId}`);
    } else {
      socket.emit('message', `La partie ${gameId} n'existe pas.`);
    }
  });

  // Écoute des devinettes
  socket.on('guess', (gameId, guess) => {
    if (games[gameId]) {
      // Vérifier combien de chiffres sont corrects
      const mysteryNumber = games[gameId].number;
      let correctCount = 0;
      
      for (let i = 0; i < 6; i++) {
        if (guess[i] === mysteryNumber[i]) {
          correctCount++;
        }
      }

      games[gameId].guesses.push({ playerId: socket.id, guess, correctCount });
      
      // Si le joueur a deviné correctement
      if (correctCount === 6) {
        io.to(gameId).emit('message', `Le joueur ${socket.id} a gagné ! Nombre mystère : ${mysteryNumber}`);
      } else {
        io.to(gameId).emit('message', `Le joueur ${socket.id} a deviné ${correctCount} chiffres corrects.`);
      }
    } else {
      socket.emit('message', 'La partie n\'existe pas.');
    }
  });

  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté');
  });
});

// Démarrer le serveur
server.listen(5000, () => {
  console.log('Serveur démarré sur http://localhost:5000');
});
