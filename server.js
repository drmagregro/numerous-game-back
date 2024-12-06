const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Configuration du serveur Express
const app = express();
const PORT = 5000;

// Middleware pour analyser le JSON
app.use(express.json());

// Route API de test
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from REST API!' });
});

// Création d'un serveur HTTP pour combiner Express et Socket.IO
const server = http.createServer(app);

// Création du serveur Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Permet les connexions depuis n'importe quelle origine (à ajuster pour la sécurité)
  },
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log(`Client connecté : ${socket.id}`);

  // Envoi d'un message de bienvenue au client
  socket.emit('message', { message: 'Bienvenue sur le serveur Socket.IO!' });

  // Gestion des messages envoyés par le client
  socket.on('sendMessage', (data) => {
    console.log(`Message reçu de ${socket.id} : ${data.message}`);

    // Réponse au client
    socket.emit('message', { message: `Message reçu : ${data.message}` });

    // Broadcasting (envoyer à tous les autres clients)
    socket.broadcast.emit('message', {
      message: `Un autre utilisateur a envoyé : ${data.message}`,
    });
  });

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log(`Client déconnecté : ${socket.id}`);
  });
});

// Démarrage du serveur HTTP et Socket.IO
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
