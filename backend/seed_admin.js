const mysql = require('mysql2/promise');

async function seed() {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'Ecampus'
        });

        // On insère ton compte admin de test
        // Email: admin@ecampus.fr | MDP: admin123
        await db.execute(`
            INSERT IGNORE INTO users (nom, email, password, roles, status) 
            VALUES ('Samuel Admin', 'admin@ecampus.fr', 'admin123', '["ROLE_ADMIN"]', 'ACTIVE')
        `);

        console.log("✅ Compte Admin créé avec succès !");
        console.log("📧 Email : admin@ecampus.fr");
        console.log("🔑 MDP : admin123");
        
        await db.end();
    } catch (err) {
        console.error("❌ Erreur :", err.message);
    }
    process.exit();
}

seed();