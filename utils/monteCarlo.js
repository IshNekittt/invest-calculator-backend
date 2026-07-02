function randomNormal(mean, stdDev) {
  let u1 = Math.random();
  let u2 = Math.random();
  let randStdNormal =
    Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
  return mean + stdDev * randStdNormal;
}

export function calculateMonteCarlo({
  initial,
  monthly,
  expectedReturn,
  volatility,
  inflation,
  years,
}) {
  const simulations = 500;
  const results = [];

  for (let i = 0; i < simulations; i++) {
    let currentBalance = Number(initial);
    let simHistory = [currentBalance];

    for (let year = 1; year <= years; year++) {
      const randomReturn =
        randomNormal(Number(expectedReturn), Number(volatility)) / 100;
      currentBalance =
        currentBalance * (1 + randomReturn) + Number(monthly) * 12;
      const realBalance =
        currentBalance / Math.pow(1 + Number(inflation) / 100, year);
      simHistory.push(realBalance);
    }
    results.push(simHistory);
  }

  const chartData = [];
  for (let year = 0; year <= years; year++) {
    const yearValues = results.map((sim) => sim[year]).sort((a, b) => a - b);
    chartData.push({
      year: year,
      worstCase: Math.round(yearValues[Math.floor(simulations * 0.1)]),
      median: Math.round(yearValues[Math.floor(simulations * 0.5)]),
      bestCase: Math.round(yearValues[Math.floor(simulations * 0.9)]),
    });
  }

  const finalYear = chartData[chartData.length - 1];
  return { chartData, summary: finalYear };
}
