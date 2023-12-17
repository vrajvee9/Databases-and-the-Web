const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Sample in-memory database
const exercises = [
  { id: 1, name: 'Running', category: 'Cardio' },
  { id: 2, name: 'Weightlifting', category: 'Strength' },
];

const users = [
  { id: 1, username: 'john_doe', email: 'john@example.com' },
];

const activityLogs = [{
  "exercise": "Running",
  "duration": 30
}];

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Get all exercises
app.get('/api/exercises', (req, res) => {
  res.json({ exercises });
});

// Log exercise
app.post('/api/log/exercise', (req, res) => {
  const { userId, exerciseId, duration } = req.body;
  const logEntry = { userId, exerciseId, duration, timestamp: new Date() };
  activityLogs.push(logEntry);
  res.json({ success: true, message: 'Exercise logged successfully.' });
});

// Get user profile
app.get('/api/user/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  if (user) {
    res.json({ user });
  } else {
    res.status(404).json({ success: false, message: 'User not found.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
