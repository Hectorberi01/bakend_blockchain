"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseInitializer = exports.DatabaseInitializer = void 0;
const database_1 = require("./database");
class DatabaseInitializer {
    constructor() { }
    static getInstance() {
        if (!DatabaseInitializer.instance) {
            DatabaseInitializer.instance = new DatabaseInitializer();
        }
        return DatabaseInitializer.instance;
    }
    async initialize() {
        try {
            console.log('🔄 Connexion à la base de données...');
            if (database_1.AppDataSource.isInitialized) {
                console.log('⚠️  Base de données déjà initialisée');
                return;
            }
            console.log('Configuration');
            await database_1.AppDataSource.initialize();
            console.log('✅ Base de données connectée');
            console.log(`   Type: ${database_1.AppDataSource.options.type}`);
            console.log(`   Database: ${database_1.AppDataSource.options.database}`);
            console.log(`   Synchronize: ${database_1.AppDataSource.options.synchronize}`);
            // Vérifier la connexion
            await this.healthCheck();
            // Exécuter les migrations en production si configuré
            if (this.shouldRunMigrations()) {
                await this.runMigrations();
            }
        }
        catch (error) {
            console.error('❌ Échec de connexion à la base de données:', error.message);
            if (error.code === 'ECONNREFUSED') {
                console.error('💡 Vérifiez que PostgreSQL est démarré et accessible');
            }
            else if (error.code === '28P01') {
                console.error('💡 Erreur d\'authentification - vérifiez les credentials');
            }
            else if (error.code === '3D000') {
                console.error('💡 La base de données n\'existe pas - créez-la d\'abord');
            }
            throw error;
        }
    }
    async healthCheck() {
        try {
            await database_1.AppDataSource.query('SELECT 1');
            console.log('✅ Health check DB: OK');
            return true;
        }
        catch (error) {
            console.error('❌ Health check DB: FAILED');
            throw error;
        }
    }
    shouldRunMigrations() {
        return (process.env.NODE_ENV === 'production' &&
            process.env.RUN_MIGRATIONS === 'true');
    }
    async runMigrations() {
        try {
            console.log('🔄 Exécution des migrations...');
            const pendingMigrations = await database_1.AppDataSource.showMigrations();
            if (!pendingMigrations) {
                console.log('✅ Aucune migration en attente');
                return;
            }
            const migrations = await database_1.AppDataSource.runMigrations({
                transaction: 'all'
            });
            if (migrations.length === 0) {
                console.log('✅ Aucune migration à exécuter');
            }
            else {
                console.log(`✅ ${migrations.length} migration(s) exécutée(s):`);
                migrations.forEach(migration => {
                    console.log(`   - ${migration.name}`);
                });
            }
        }
        catch (error) {
            console.error('❌ Erreur lors de l\'exécution des migrations:', error.message);
            throw error;
        }
    }
    async close() {
        try {
            if (database_1.AppDataSource.isInitialized) {
                await database_1.AppDataSource.destroy();
                console.log('✅ Connexion à la base de données fermée');
            }
        }
        catch (error) {
            console.error('❌ Erreur lors de la fermeture de la DB:', error.message);
            throw error;
        }
    }
    getDataSource() {
        if (!database_1.AppDataSource.isInitialized) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return database_1.AppDataSource;
    }
    isConnected() {
        return database_1.AppDataSource.isInitialized;
    }
}
exports.DatabaseInitializer = DatabaseInitializer;
exports.databaseInitializer = DatabaseInitializer.getInstance();
