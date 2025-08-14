import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  letterFile: { type: String, required: true }
}, { timestamps: true });

export default model('User', UserSchema);
