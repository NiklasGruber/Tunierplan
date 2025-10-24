const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'tournament-data.json');

app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
async function initDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialData = {
      teamInput: "Team A\nTeam B\nTeam C\nTeam D",
      fields: 2,
      matchMin: 20,
      breakMin: 5,
      startLocal: new Date().toISOString().slice(0, 16),
      scores: {}
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// GET - Load tournament data
app.get('/api/tournament', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// POST - Save tournament data
app.post('/api/tournament', async (req, res) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// PATCH - Update only scores
app.patch('/api/tournament/scores', async (req, res) => {
  try {
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
    data.scores = { ...data.scores, ...req.body.scores };
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating scores:', error);
    res.status(500).json({ error: 'Failed to update scores' });
  }
});

initDataFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
