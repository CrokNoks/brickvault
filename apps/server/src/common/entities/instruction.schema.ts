import { Schema, Types } from 'mongoose';

export const InstructionSchema = new Schema({
  set_id: { type: Types.ObjectId, ref: 'Set', required: true },
  title: String,
  file_url: String,
  language: String,
  uploader_id: { type: Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now },
  steps: { type: Array, default: [] },
});
