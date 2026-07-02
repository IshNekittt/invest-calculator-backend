import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  inputs: { type: Object, required: true },
  result: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Calculation', schema);
