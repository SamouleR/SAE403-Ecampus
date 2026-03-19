const mysql = require('mysql2/promise');

async function migrate() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'Ecampus'
    });

    try {
        console.log("🔍 Vérification de la structure des tables...");

        // 1. Ajouter 'status' à la table 'users' si elle n'existe pas
        const [userCols] = await db.query("SHOW COLUMNS FROM users LIKE 'status'");
        if (userCols.length === 0) {
            await db.query("ALTER TABLE users ADD COLUMN status ENUM('PENDING', 'ACTIVE') DEFAULT 'ACTIVE'");
            console.log("✅ Colonne 'status' ajoutée à 'users'.");
        } else {
            console.log("ℹ️ La colonne 'status' existe déjà dans 'users'.");
        }

        // 2. Ajouter 'status' à la table 'saes' si elle n'existe pas
        const [saeCols] = await db.query("SHOW COLUMNS FROM saes LIKE 'status'");
        if (saeCols.length === 0) {
            await db.query("ALTER TABLE saes ADD COLUMN status ENUM('PENDING', 'VALIDATED', 'REJECTED') DEFAULT 'PENDING'");
            console.log("✅ Colonne 'status' ajoutée à 'saes'.");
        } else {
            console.log("ℹ️ La colonne 'status' existe déjà dans 'saes'.");
        }

        console.log("🏁 Migration terminée avec succès.");
    } catch (err) {
        console.error("❌ Erreur de migration :", err.message);
    } finally {
        await db.end();
        process.exit();
    }
}

migrate();