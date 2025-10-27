import { Schema } from 'mongoose';

export const SetSchema = new Schema({
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
