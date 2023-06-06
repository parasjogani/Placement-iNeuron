const express = require('express');

const app = express();

// Middleware
const checkAuthentication = (req, res, next) => {
    // if the user is authenticated ot not
    const isAuthenticated = checkUserAuthentication(req); // Custom function to check authentication

    // If the user is authenticated, allow the request to proceed
    if (isAuthenticated) {
        next();
    } else {
        // If the user is not authenticated, return a response with an error message
        res.status(401).json({ error: 'User not authenticated' });
    }
};

// Middleware function to check authentication for specific routes
app.use('/api/posts', checkAuthentication);

// Route to handle a POST request
app.post('/api/posts', (req, res) => {
    // Assuming the user is authenticated at this point
    // Retrieve the data from the request body
    const postData = req.body;

    // Perform any required operations with the post data

    // Return a response indicating success
    res.json({ message: 'Post created successfully' });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});