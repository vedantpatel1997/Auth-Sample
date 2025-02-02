const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 8080;

// Middleware to extract the token from the request headers
app.use((req, res, next) => {
    const token = req.headers['x-ms-token-aad-access-token'];
    console.log(`Token: ${token}`)
    if (!token) {
        return res.status(401).send('Unauthorized: No token found');
    }
    req.authToken = token;
    next();
});

// Route to call the backend API
app.get('/call-backend', async (req, res) => {
    try {
        const backendUrl = 'https://backend-auth-e2e.wonderfulpebble-d4b0af35.eastus.azurecontainerapps.io/api/Sample'; // Replace with your backend API URL
        const response = await axios.get(backendUrl, {
            headers: {
                Authorization: `Bearer ${req.authToken}`,
            },
        });

        // Extract the message from the backend response
        const message = response.data.message;
        res.send(`Backend API Response: ${message}`);
    } catch (error) {
        console.error('Error calling backend API:', error.message);

        // Handle specific error responses from the backend
        if (error.response) {
            // Backend returned an error response (e.g., 401, 500)
            console.log(`Error: ${error}`)
            res.status(error.response.status).send(`Backend Error: ${error.response.data}`);
        } else {
            // Network or other errors
            res.status(500).send('Error calling backend API');
        }
    }
});

// Home route
app.get('/', (req, res) => {
    res.send('Frontend is running! Vedant Patel 1.1');
});

app.listen(port, () => {
    console.log(`Frontend app listening on port ${port}`);
});