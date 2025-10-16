import { Schema, Types } from 'mongoose';

export const InventorySchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  set_id: { type: Types.ObjectId, ref: 'Set' },
  piece_id: { type: Types.ObjectId, ref: 'Piece' },
  quantity: { type: Number, default: 1 },
  pieces: [
    {
      piece_id: { type: Types.ObjectId, ref: 'Piece', required: true },
      quantity: { type: Number, default: 1 },
    },
  ],
});
InventorySchema.index({ user_id: 1, set_id: 1, piece_id: 1 }, { unique: true });
