const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api', (req, res) => {
    res.json({ message: 'Hello from the back-end!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
