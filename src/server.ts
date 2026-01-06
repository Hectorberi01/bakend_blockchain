import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { databaseInitializer } from './config/database.init';
import app from './app';
import {userRouter} from "./routes/user.route";
import {walletRouter} from "./routes/wallets.route";
//import { exchangeRouter } from './routes/exchange.routes';
import { treasuryRouter } from './routes/treasury.routes';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-private-key']
}));

app.use(express.json({ limit: '10mb' }));
//app.use(express.urlencoded({ extended: true }));


app.use('/api/users', userRouter)
app.use('/api/wallets', walletRouter)
// Routes business principales
app.use('/api/treasury', treasuryRouter);


const startServer = async () => {
  try {
    await databaseInitializer.initialize();
    const server = app.listen(PORT, () => {});

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} reçu, arrêt en cours...`);
      
      server.close(async (err) => {
        if (err) {
          console.error('Erreur lors de l\'arrêt du serveur:', err);
        } else {
          console.log('Serveur HTTP arrêté');
        }
        
        try {
          await databaseInitializer.close();
        } catch (error) {
          console.error('Erreur lors de la fermeture de la DB:', error);
        }
        
        console.log('Arrêt propre terminé');
        process.exit(err ? 1 : 0);
      });

      setTimeout(() => {
        console.error('Arrêt forcé après timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    
    if (databaseInitializer.isConnected()) {
      await databaseInitializer.close();
    }
    
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejet de promesse non géré:', promise, 'Raison:', reason);
});

process.on('uncaughtException', async (error) => {
  console.error('Exception non capturée:', error);
  if (databaseInitializer.isConnected()) {
    await databaseInitializer.close();
  }
  process.exit(1);
});

// Démarrer le serveur
if (require.main === module) {
  startServer();
}

export default app;
export { startServer };