"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class CryptoService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        const secret = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!';
        // scryptSync garantit 32 bytes
        this.key = crypto_1.default.scryptSync(secret, 'salt', 32);
    }
    encrypt(text) {
        // IV recommandé pour GCM : 12 bytes (96 bits)
        const iv = crypto_1.default.randomBytes(12);
        const cipher = crypto_1.default.createCipheriv(this.algorithm, this.key, iv);
        const encrypted = Buffer.concat([
            cipher.update(Buffer.from(text, 'utf8')),
            cipher.final()
        ]);
        const authTag = cipher.getAuthTag();
        // Format en base64 pour éviter problèmes de séparateurs
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
    }
    decrypt(encryptedText) {
        const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
        if (!ivHex || !authTagHex || !encryptedHex) {
            throw new Error('Format invalide du texte chiffré');
        }
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const decipher = crypto_1.default.createDecipheriv(this.algorithm, this.key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);
        return decrypted.toString('utf8');
    }
}
exports.CryptoService = CryptoService;
