import { Schema } from 'mongoose';

export const PieceSchema = new Schema({
  ref: { type: String, unique: true, required: true },
  name: String,
  color: String,
  image_url: String,
});
