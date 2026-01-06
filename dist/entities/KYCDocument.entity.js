"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCDocument = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const enums_1 = require("./enums");
let KYCDocument = class KYCDocument {
};
exports.KYCDocument = KYCDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], KYCDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], KYCDocument.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.kycDocuments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_entity_1.User)
], KYCDocument.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.DocumentType,
        name: 'document_type'
    }),
    __metadata("design:type", String)
], KYCDocument.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'document_number' }),
    __metadata("design:type", String)
], KYCDocument.prototype, "documentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'front_image_url' }),
    __metadata("design:type", String)
], KYCDocument.prototype, "frontImageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'back_image_url', nullable: true }),
    __metadata("design:type", String)
], KYCDocument.prototype, "backImageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'selfie_url', nullable: true }),
    __metadata("design:type", String)
], KYCDocument.prototype, "selfieUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.KYCStatus,
        default: enums_1.KYCStatus.PENDING
    }),
    __metadata("design:type", String)
], KYCDocument.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_by', nullable: true }),
    __metadata("design:type", String)
], KYCDocument.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], KYCDocument.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejection_reason', nullable: true }),
    __metadata("design:type", String)
], KYCDocument.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KYCDocument.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], KYCDocument.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], KYCDocument.prototype, "updatedAt", void 0);
exports.KYCDocument = KYCDocument = __decorate([
    (0, typeorm_1.Entity)('kyc_documents'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['status'])
], KYCDocument);
