import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Calculation from './models/Calculation.js';
import { calculateMonteCarlo } from './utils/monteCarlo.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      'https://invest-calculator-frontend.vercel.app',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  }),
);

app.use(express.json());

// Роут 1: Розрахунок та збереження
app.post('/api/calculate', async (req, res) => {
  try {
    const { deviceId, inputs } = req.body;
    if (!deviceId || !inputs) {
      return res
        .status(400)
        .json({ message: "Відсутні обов'язкові дані для розрахунку" });
    }

    const { chartData, summary } = calculateMonteCarlo(inputs);

    const newCalculation = new Calculation({
      deviceId,
      inputs,
      summary,
      chartData,
    });

    await newCalculation.save();
    res.status(201).json(newCalculation);
  } catch (error) {
    console.error('Помилка калькуляції:', error);
    res
      .status(500)
      .json({ message: 'Внутрішня помилка сервера під час розрахунку' });
  }
});

// Роут 2: Отримання історії за deviceId
app.get('/api/history/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const history = await Calculation.find({ deviceId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-chartData');

    res.status(200).json(history);
  } catch (error) {
    console.error('Помилка отримання історії:', error);
    res.status(500).json({ message: 'Помилка під час завантаження історії' });
  }
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB успішно підключена');
    app.listen(PORT, () => console.log(`🚀 Сервер запущено на порту ${PORT}`));
  })
  .catch((err) => console.error('❌ Помилка підключення до БД:', err));
