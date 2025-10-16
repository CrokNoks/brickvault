import { Schema } from 'mongoose';

export const SetSchema = new Schema({
  manufacturer_reference: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  year: Number,
  theme: String,
  piece_count: Number,
  image_url: String,
  manufacturer: {
    type: Schema.Types.ObjectId,
    ref: 'Manufacturer',
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});
