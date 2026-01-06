import crypto from 'crypto';

export class CryptoService {
    private algorithm = 'aes-256-gcm';
    private key: Buffer;

    constructor() {
        const secret = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!';
        // scryptSync garantit 32 bytes
        this.key = crypto.scryptSync(secret, 'salt', 32);
    }

    encrypt(text: string): string {
        // IV recommandé pour GCM : 12 bytes (96 bits)
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv) as crypto.CipherGCM;

        const encrypted = Buffer.concat([
            cipher.update(Buffer.from(text, 'utf8')),
            cipher.final()
        ]);

        const authTag = cipher.getAuthTag();

        // Format en base64 pour éviter problèmes de séparateurs
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
    }

    decrypt(encryptedText: string): string {
        const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
        if (!ivHex || !authTagHex || !encryptedHex) {
            throw new Error('Format invalide du texte chiffré');
        }

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv) as crypto.DecipherGCM;
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);

        return decrypted.toString('utf8');
    }
}
