const mysql = require('mysql2/promise');
async function run() {
    const db = await mysql.createConnection({host:'localhost', user:'root', database:'Ecampus'});
    await db.execute(`INSERT IGNORE INTO users (nom, email, password, roles) VALUES 
        ('Samuel RALAIKOA', 'samuel@ecampus.fr', 'password', '["ROLE_STUDENT"]')`);
    await db.execute(`INSERT IGNORE INTO saes (titre, description, semestre, note) VALUES 
        ('UX/ UI - Kourkoulakou', 'Réalisation d\\'un jeu avec une préférence UX/ UI', 'Semestre 4', '10/11')`);
    console.log("✅ Données de test insérées.");
    process.exit();
}
run();