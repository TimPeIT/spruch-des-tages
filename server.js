const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static('.')); 

let sprueche = [
  { id: 1, text: "Der Weg ist das Ziel.", autor: "Konfuzius" },
  { id: 2, text: "Phantasie ist wichtiger als Wissen.", autor: "Einstein" }
];

app.get('/api/sprueche', (req, res) => {
  res.json(sprueche);
});

app.post('/api/sprueche', (req, res) => {
  const neuer = {
    id: sprueche.length ? sprueche[sprueche.length - 1].id + 1 : 1,
    text: req.body.text,
    autor: req.body.autor
  };
  sprueche.push(neuer);
  res.status(201).json(neuer);
});

app.delete('/api/sprueche/:id', (req, res) => {
  const id = parseInt(req.params.id);
  sprueche = sprueche.filter(s => s.id !== id);
  res.status(204).send();
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
