const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static('.')); 

const { pool } = require('./db');

app.get('/api/sprueche', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM sprueche');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Sprüche' });
    }
});

app.get('/api/sprueche/search', async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'Suchbegriff fehlt' });
    }

    try {
        const suchbegriff = `%${query}%`;
        const [rows] = await pool.execute(
            'SELECT * FROM sprueche WHERE text LIKE ? OR autor LIKE ?',
            [suchbegriff, suchbegriff]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fehler bei der Suche nach Sprüchen' });
    }
});

app.post('/api/sprueche', async (req, res) => {
    try {
        const { text, autor } = req.body;
        if (!text || !autor) {
            return res.status(400).json({ error: "Text und Autor sind erforderlich" });
        }

        const [result] = await pool.execute(
            'INSERT INTO sprueche (text, autor) VALUES (?, ?)',
            [text, autor]
        );
        const [newSpruch] = await pool.execute('SELECT * FROM sprueche WHERE id = ?', [result.insertId]);
        res.status(201).json(newSpruch[0]);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Erstellen des Spruchs' });
    }
});

app.put('/api/sprueche/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { text, autor } = req.body;

        if (!text || !autor) {
            return res.status(400).json({ error: "Text und Autor sind erforderlich" });
        }

        const [result] = await pool.execute(
            'UPDATE sprueche SET text = ?, autor = ? WHERE id = ?',
            [text, autor, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Spruch nicht gefunden' });
        }

        const [updatedSpruch] = await pool.execute(
            'SELECT * FROM sprueche WHERE id = ?',
            [id]
        );

        res.json(updatedSpruch[0]);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Spruchs' });
    }
});



app.delete('/api/sprueche/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM sprueche WHERE id = ?', [id]);
        res.status(204).send(); // 204 = Erfolg, kein Inhalt
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Löschen des Spruchs' });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
