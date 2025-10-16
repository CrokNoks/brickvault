import { Schema, Types } from 'mongoose';

export const CommentSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  target_type: { type: String, enum: ['set', 'instruction'], required: true },
  target_id: { type: Types.ObjectId, required: true },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});
