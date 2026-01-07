// src/swagger.ts
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API Auth / UserManager",
      version: "1.0.0",
      description: "Documentation de l'API Auth / UserManager (SIWE, OTP, JWT, KYC)",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Serveur local",
      },
    ],
  },
  apis: [
    path.resolve(__dirname, "../../routes/*.ts"),
    path.resolve(__dirname, "../routes/**/*.ts"),
    path.resolve(__dirname, "./components/*.ts"),
    path.resolve(__dirname, "../../routes/*.js"),
    path.resolve(__dirname, "../routes/**/*.js"),
    path.resolve(__dirname, "./components/*.js"),
  ],
};

export const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
};

//export default swaggerSpec;
