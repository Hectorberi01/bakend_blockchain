"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = exports.swaggerSpec = void 0;
// src/swagger.ts
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const options = {
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
        path_1.default.resolve(__dirname, "../../routes/*.ts"),
        path_1.default.resolve(__dirname, "../routes/**/*.ts"),
        path_1.default.resolve(__dirname, "./components/*.ts"),
        path_1.default.resolve(__dirname, "../../routes/*.js"),
        path_1.default.resolve(__dirname, "../routes/**/*.js"),
        path_1.default.resolve(__dirname, "./components/*.js"),
    ],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(exports.swaggerSpec, { explorer: true }));
};
exports.setupSwagger = setupSwagger;
//export default swaggerSpec;
