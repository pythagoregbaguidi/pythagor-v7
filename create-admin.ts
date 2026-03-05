import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres:vEiFiqdjTlCweCUakDXbgTtjNCOZPZFb@nozomi.proxy.rlwy.net:54546/railway";
const client = new Client({ connectionString });

async function setupAdmin() {
  try {
    await client.connect();
    
    // Création de la table admin
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // Ajout de ton compte (tu pourras changer le mot de passe plus tard)
    await client.query(`
      INSERT INTO admin (username, password) 
      VALUES ('admin', 'pythagor2026')
      ON CONFLICT (username) DO NOTHING;
    `);

    console.log("✅ Table Admin prête et compte créé !");
    await client.end();
  } catch (err) {
    console.error("❌ Erreur :", err);
  }
}

setupAdmin();
