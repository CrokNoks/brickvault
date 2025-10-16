import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  username: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});
