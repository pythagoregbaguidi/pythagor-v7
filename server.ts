import express from 'express';
import pg from 'pg';
import cors from 'cors';

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  connectionString: "postgresql://postgres:vEiFiqdjTlCweCUakDXbgTtjNCOZPZFb@nozomi.proxy.rlwy.net:54546/railway",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Empêche le serveur de couper en cas d'erreur de connexion Railway
pool.on('error', (err) => {
  console.error('⚠️ Erreur PostgreSQL:', err);
});

// --- ROUTES AUTHENTIFICATION ---
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM admin WHERE username = $1 AND password = $2', [username, password]);
    if (result.rows.length > 0) res.json({ success: true });
    else res.status(401).json({ success: false });
  } catch (err) { res.status(500).send(err); }
});

// --- ROUTES CLIENTS ---
app.get('/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY nom ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).send(err); }
});

app.post('/clients', async (req, res) => {
  const { nom, telephone } = req.body;
  try {
    const result = await pool.query('INSERT INTO clients (nom, telephone) VALUES ($1, $2) RETURNING *', [nom, telephone]);
    res.json({ success: true, client: result.rows[0] });
  } catch (err) { res.status(500).send(err); }
});

app.delete('/clients/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).send(err); }
});

// --- ROUTES VENTES ---
app.get('/ventes', async (req, res) => {
  try {
    // Jointure pour avoir le nom du client directement
    const result = await pool.query(`
      SELECT v.*, c.nom as client_nom, c.telephone as client_tel 
      FROM ventes v 
      LEFT JOIN clients c ON v.client_id = c.id 
      ORDER BY v.id DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).send(err); }
});

app.post('/ventes', async (req, res) => {
  const { client_id, details, prix_unitaire, total } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ventes (client_id, details, prix_unitaire, total) VALUES ($1, $2, $3, $4) RETURNING *',
      [client_id, details, prix_unitaire, total]
    );
    res.json({ success: true, vente: result.rows[0] });
  } catch (err) { res.status(500).send(err); }
});


app.delete('/ventes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM ventes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/stats', async (req, res) => {
  try {
    const totalVentes = await pool.query('SELECT SUM(total) as total FROM ventes');
    const nbClients = await pool.query('SELECT COUNT(*) as count FROM clients');
    const maxVente = await pool.query('SELECT MAX(total) as max FROM ventes');
    
    res.json({
      chiffreAffaire: totalVentes.rows[0].total || 0,
      clients: nbClients.rows[0].count,
      record: maxVente.rows[0].max || 0
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`🚀 Pythagor v7 opérationnel sur le port ${port}`);
});

