const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Custom ML endpoint
app.post('/customML', (req, res) => {
  try {
    console.log('Received CustomML assessment data:', req.body);
    
    // Simply return the same JSON data received
    console.log('Sending response:', req.body);
    res.json(req.body);
    
  } catch (error) {
    console.error('Error processing CustomML request:', error);
    res.status(500).json({
      error: 'Internal server error processing assessment'
    });
  }
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`CustomML Backend Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`CustomML endpoint: http://localhost:${PORT}/customML`);
});
