import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres:vEiFiqdjTlCweCUakDXbgTtjNCOZPZFb@nozomi.proxy.rlwy.net:54546/railway";

const client = new Client({ connectionString });

async function initDatabase() {
  try {
    await client.connect();
    console.log("⏳ Création des tables pour Pythagor Pro v7...");

    // Table des Clients
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        nom TEXT NOT NULL,
        telephone TEXT,
        date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table des Ventes
    await client.query(`
      CREATE TABLE IF NOT EXISTS ventes (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        details TEXT NOT NULL,
        prix_unitaire DECIMAL(10,2),
        total DECIMAL(10,2),
        date_vente TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tables 'clients' et 'ventes' créées avec succès !");
    await client.end();
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation :", err);
  }
}

initDatabase();
