import { Schema, Types } from 'mongoose';

export const SetPieceSchema = new Schema({
  set_id: { type: Types.ObjectId, ref: 'Set', required: true },
  piece_id: { type: Types.ObjectId, ref: 'Piece', required: true },
  quantity: { type: Number, default: 1 },
});
