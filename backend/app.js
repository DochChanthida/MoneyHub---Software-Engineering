const express = require('express');
const app = express();
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const routes = require('./routes');
app.use('/api', routes);

app.listen(3000, () => console.log('Server is running on port 3000'));