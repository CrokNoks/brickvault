// Script de nettoyage de la base MongoDB pour BrickVault (dev/test)
const { MongoClient } = require('mongodb');

if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
  console.error(
    'Ce script ne peut être exécuté que dans les environnements de test ou de développement.',
  );
  process.exit(1);
}

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/brickvault_test';

async function cleanDb() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db();
    await db.dropDatabase();
    console.log(`✔️  Base de données nettoyée : ${db.databaseName}`);
  } catch (err) {
    console.error('Erreur lors du nettoyage de la base :', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

cleanDb();
