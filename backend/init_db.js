const mysql = require('mysql2/promise');

async function setup() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root', 
        password: '' // Config par défaut Codespaces
    });

    try {
        await db.query("CREATE DATABASE IF NOT EXISTS Ecampus");
        await db.query("USE Ecampus");

        // Table Users avec statut de validation pour les inscriptions
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                roles JSON NOT NULL,
                status ENUM('PENDING', 'ACTIVE') DEFAULT 'ACTIVE'
            )
        `);

        // Table SAE avec statut de modération
        await db.query(`
            CREATE TABLE IF NOT EXISTS saes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titre VARCHAR(255) NOT NULL,
                enseignant_id INT,
                status ENUM('PENDING', 'VALIDATED', 'REJECTED') DEFAULT 'PENDING'
            )
        `);

        console.log("✅ Base de données initialisée avec succès.");
    } catch (err) { console.error("❌ Erreur:", err.message); }
    finally { await db.end(); process.exit(); }
}
setup();