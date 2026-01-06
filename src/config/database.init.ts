import { AppDataSource } from './database';

export class DatabaseInitializer {
  private static instance: DatabaseInitializer;

  private constructor() {}

  public static getInstance(): DatabaseInitializer {
    if (!DatabaseInitializer.instance) {
      DatabaseInitializer.instance = new DatabaseInitializer();
    }
    return DatabaseInitializer.instance;
  }

  async initialize(): Promise<void> {
    try {
      console.log('🔄 Connexion à la base de données...');
      
      if (AppDataSource.isInitialized) {
        console.log('⚠️  Base de données déjà initialisée');
        return;
      }

      console.log('Configuration');
      
      await AppDataSource.initialize();
      
      console.log('✅ Base de données connectée');
      console.log(`   Type: ${AppDataSource.options.type}`);
      console.log(`   Database: ${AppDataSource.options.database}`);
      console.log(`   Synchronize: ${AppDataSource.options.synchronize}`);
      
      // Vérifier la connexion
      await this.healthCheck();
      
      // Exécuter les migrations en production si configuré
      if (this.shouldRunMigrations()) {
        await this.runMigrations();
      }
      
    } catch (error: any) {
      console.error('❌ Échec de connexion à la base de données:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.error('💡 Vérifiez que PostgreSQL est démarré et accessible');
      } else if (error.code === '28P01') {
        console.error('💡 Erreur d\'authentification - vérifiez les credentials');
      } else if (error.code === '3D000') {
        console.error('💡 La base de données n\'existe pas - créez-la d\'abord');
      }
      
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await AppDataSource.query('SELECT 1');
      console.log('✅ Health check DB: OK');
      return true;
    } catch (error) {
      console.error('❌ Health check DB: FAILED');
      throw error;
    }
  }

  private shouldRunMigrations(): boolean {
    return (
      process.env.NODE_ENV === 'production' && 
      process.env.RUN_MIGRATIONS === 'true'
    );
  }

  private async runMigrations(): Promise<void> {
    try {
      console.log('🔄 Exécution des migrations...');
      
      const pendingMigrations = await AppDataSource.showMigrations();
      
      if (!pendingMigrations) {
        console.log('✅ Aucune migration en attente');
        return;
      }

      const migrations = await AppDataSource.runMigrations({
        transaction: 'all'
      });

      if (migrations.length === 0) {
        console.log('✅ Aucune migration à exécuter');
      } else {
        console.log(`✅ ${migrations.length} migration(s) exécutée(s):`);
        migrations.forEach(migration => {
          console.log(`   - ${migration.name}`);
        });
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'exécution des migrations:', error.message);
      throw error;
    }
  }


  async close(): Promise<void> {
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.log('✅ Connexion à la base de données fermée');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la fermeture de la DB:', error.message);
      throw error;
    }
  }

  getDataSource() {
    if (!AppDataSource.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return AppDataSource;
  }

  isConnected(): boolean {
    return AppDataSource.isInitialized;
  }
}

export const databaseInitializer = DatabaseInitializer.getInstance();