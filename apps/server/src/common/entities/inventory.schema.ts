import { Schema, Types } from 'mongoose';

const InventoryPieceSchema = new Schema({
  piece_id: { type: Types.ObjectId, ref: 'Piece', required: true },
  quantity: { type: Number, default: 1, required: true },
});

export const InventorySchema = new Schema({
  set_id: { type: Types.ObjectId, ref: 'Set' },
  pieces: [InventoryPieceSchema],
});

InventorySchema.index({ set_id: 1 }, { unique: true });
