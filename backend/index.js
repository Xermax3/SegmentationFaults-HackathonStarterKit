const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Add json middleware
app.use(express.json());

// Handle requests by serving index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// temp test endpoint
app.get('/test-endpoint', (req, res) => {
    res.send('Hello from the API');
});

// API endpoint
app.use('/api/products', async (req, res) => {
    const response = await axios.get('https://fakestoreapi.com/products');
    res.send(response.data);
});


// Start the server
app.listen(4000, () => {
    console.log('Server is running on port 4000');
});