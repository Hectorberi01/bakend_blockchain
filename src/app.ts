import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { setupSwagger } from './config/swagger';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialiser Swagger
setupSwagger(app);

export default app;