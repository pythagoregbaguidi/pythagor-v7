import pg from 'pg';
const { Client } = pg;

// On utilise directement ton lien Railway ici
const connectionString = "postgresql://postgres:vEiFiqdjTlCweCUakDXbgTtjNCOZPZFb@nozomi.proxy.rlwy.net:54546/railway";

const client = new Client({
  connectionString: connectionString,
});

async function testConnexion() {
  try {
    console.log("⏳ Tentative de connexion à Railway...");
    await client.connect();
    console.log("✅ Connexion à Railway réussie !");
    
    const res = await client.query('SELECT NOW()');
    console.log("Heure du serveur Railway :", res.rows[0].now);
    
    await client.end();
  } catch (err) {
    console.error("❌ Erreur de connexion :", err);
  }
}

testConnexion();
	
