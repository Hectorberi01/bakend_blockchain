import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from './User.entity';
import { KYCStatus, DocumentType } from './enums';

@Entity('kyc_documents')
@Index(['userId'])
@Index(['status'])
export class KYCDocument {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, (user) => user.kycDocuments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'enum',
    enum: DocumentType,
    name: 'document_type'
  })
  documentType!: DocumentType;

  @Column({ name: 'document_number' })
  documentNumber!: string;

  @Column({ name: 'front_image_url' })
  frontImageUrl!: string;

  @Column({ name: 'back_image_url', nullable: true })
  backImageUrl?: string;

  @Column({ name: 'selfie_url', nullable: true })
  selfieUrl?: string;

  @Column({
    type: 'enum',
    enum: KYCStatus,
    default: KYCStatus.PENDING
  })
  status!: KYCStatus;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy?: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'rejection_reason', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}