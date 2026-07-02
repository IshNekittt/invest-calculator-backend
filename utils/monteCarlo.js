// Генерация нормально распределенного числа (Метод Бокса-Мюллера)
function randomNormal(mean, stdDev) {
  let u1 = Math.random();
  let u2 = Math.random();
  let randStdNormal =
    Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
  return mean + stdDev * randStdNormal;
}

export function calculateMonteCarlo(
  initial,
  monthly,
  expectedReturn,
  volatility,
  inflation,
  years,
) {
  const simulations = 500; // Количество симуляций
  const results = [];

  for (let i = 0; i < simulations; i++) {
    let currentBalance = initial;
    let simHistory = [currentBalance];

    for (let year = 1; year <= years; year++) {
      // Случайная доходность для конкретного года
      const randomReturn = randomNormal(expectedReturn, volatility) / 100;
      // Сложный процент + пополнения (упрощенно считаем пополнения в конце года)
      currentBalance = currentBalance * (1 + randomReturn) + monthly * 12;
      // Учет инфляции (дисконтирование реальной стоимости денег)
      const realBalance = currentBalance / Math.pow(1 + inflation / 100, year);
      simHistory.push(realBalance);
    }
    results.push(simHistory);
  }

  // Вычисляем процентили (коридор вероятностей)
  const chartData = [];
  for (let year = 0; year <= years; year++) {
    const yearValues = results.map((sim) => sim[year]).sort((a, b) => a - b);
    chartData.push({
      year: year,
      worstCase: Math.round(yearValues[Math.floor(simulations * 0.1)]), // 10-й процентиль
      median: Math.round(yearValues[Math.floor(simulations * 0.5)]), // 50-й процентиль
      bestCase: Math.round(yearValues[Math.floor(simulations * 0.9)]), // 90-й процентиль
    });
  }

  return chartData;
}
