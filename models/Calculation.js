import mongoose from 'mongoose';

const calculationSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, index: true },
  inputs: { type: Object, required: true },
  summary: { type: Object, required: true },
  chartData: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Calculation', calculationSchema);
