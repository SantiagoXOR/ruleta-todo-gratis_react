import { Schema, model, Document } from 'mongoose';

export interface IUniqueCode extends Document {
  code: string;
  prizeId: number;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date;
  usedBy?: string;
}

const UniqueCodeSchema = new Schema<IUniqueCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  prizeId: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedAt: {
    type: Date,
  },
  usedBy: {
    type: String,
  },
});

// Índices para mejorar el rendimiento de las consultas
UniqueCodeSchema.index({ prizeId: 1 });
UniqueCodeSchema.index({ expiresAt: 1 });
UniqueCodeSchema.index({ isUsed: 1 });

export const UniqueCode = model<IUniqueCode>('UniqueCode', UniqueCodeSchema);
