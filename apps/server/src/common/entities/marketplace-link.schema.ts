import { Schema, Types } from 'mongoose';

export const MarketplaceLinkSchema = new Schema({
  piece_id: { type: Types.ObjectId, ref: 'Piece', required: true },
  supplier: String,
  url: String,
  price: Number,
  currency: String,
});
