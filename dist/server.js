"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_init_1 = require("./config/database.init");
const app_1 = __importDefault(require("./app"));
const user_route_1 = require("./routes/user.route");
const wallets_route_1 = require("./routes/wallets.route");
//import { exchangeRouter } from './routes/exchange.routes';
const treasury_routes_1 = require("./routes/treasury.routes");
dotenv_1.default.config();
const PORT = process.env.PORT || 3001;
app_1.default.use((0, cors_1.default)({
    origin: ['http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-private-key']
}));
app_1.default.use(express_1.default.json({ limit: '10mb' }));
//app.use(express.urlencoded({ extended: true }));
app_1.default.use('/api/users', user_route_1.userRouter);
app_1.default.use('/api/wallets', wallets_route_1.walletRouter);
// Routes business principales
app_1.default.use('/api/treasury', treasury_routes_1.treasuryRouter);
const startServer = async () => {
    try {
        await database_init_1.databaseInitializer.initialize();
        const server = app_1.default.listen(PORT, () => { });
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} reçu, arrêt en cours...`);
            server.close(async (err) => {
                if (err) {
                    console.error('Erreur lors de l\'arrêt du serveur:', err);
                }
                else {
                    console.log('Serveur HTTP arrêté');
                }
                try {
                    await database_init_1.databaseInitializer.close();
                }
                catch (error) {
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
    }
    catch (error) {
        console.error('Erreur lors du démarrage du serveur:', error);
        if (database_init_1.databaseInitializer.isConnected()) {
            await database_init_1.databaseInitializer.close();
        }
        process.exit(1);
    }
};
exports.startServer = startServer;
// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejet de promesse non géré:', promise, 'Raison:', reason);
});
process.on('uncaughtException', async (error) => {
    console.error('Exception non capturée:', error);
    if (database_init_1.databaseInitializer.isConnected()) {
        await database_init_1.databaseInitializer.close();
    }
    process.exit(1);
});
// Démarrer le serveur
if (require.main === module) {
    startServer();
}
exports.default = app_1.default;
