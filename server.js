const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname)); // serve HTML, CSS, JS

// GET eventi dal file
app.get('/events', (req, res) => {
  if (fs.existsSync('events.json')) {
    const data = fs.readFileSync('events.json');
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});

// POST per salvare eventi
app.post('/events', (req, res) => {
  fs.writeFileSync('events.json', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));
