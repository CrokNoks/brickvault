import { Schema } from 'mongoose';

export const ManufacturerSchema = new Schema({
  name: { type: String, required: true, unique: true },
  country: String,
  website: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  sets: [{ type: Schema.Types.ObjectId, ref: 'Set' }],
});
