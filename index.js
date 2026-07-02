import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Calculation from './models/Calculation.js';
import { calculateMonteCarlo } from './utils/monteCarlo.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Роут 1: Расчет и сохранение
app.post('/api/calculate', async (req, res) => {
  try {
    const { deviceId, inputs } = req.body;
    if (!deviceId || !inputs) {
      return res
        .status(400)
        .json({ message: 'Отсутствуют обязательные данные' });
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
    console.error('Ошибка калькуляции:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера при расчете' });
  }
});

// Роут 2: Получение истории по deviceId
app.get('/api/history/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    // Отдаем последние 10 расчетов, сортировка от новых к старым
    const history = await Calculation.find({ deviceId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-chartData'); // Не тянем тяжелые массивы графиков для списка

    res.status(200).json(history);
  } catch (error) {
    console.error('Ошибка получения истории:', error);
    res.status(500).json({ message: 'Ошибка при загрузке истории' });
  }
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB подключена');
    app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
  })
  .catch((err) => console.error('Ошибка подключения к БД:', err));
