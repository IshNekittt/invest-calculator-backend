function randomNormal() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function calculateMonteCarlo({
  initial,
  monthly,
  expectedReturn,
  volatility,
  inflation,
  years,
}) {
  const SIMULATIONS = 2000;
  const months = Math.floor(years * 12);

  const mu = Number(expectedReturn) / 100 / 12;
  const sigma = Number(volatility) / 100 / Math.sqrt(12);
  const monthlyInflationRate = Number(inflation) / 100 / 12;

  const drift = mu - 0.5 * sigma * sigma;

  const results = [];

  for (let i = 0; i < SIMULATIONS; i++) {
    let currentNominalBalance = Number(initial);
    let currentMonthlyContribution = Number(monthly);

    let simHistory = [Number(initial)];

    for (let month = 1; month <= months; month++) {
      // 1. Рыночный шаг (GBM)
      const shock = sigma * randomNormal();
      const monthlyReturn = Math.exp(drift + shock);

      currentNominalBalance =
        currentNominalBalance * monthlyReturn + currentMonthlyContribution;

      currentMonthlyContribution *= 1 + monthlyInflationRate;

      if (month % 12 === 0) {
        const discountFactor = Math.pow(1 + monthlyInflationRate, month);
        const realBalance = currentNominalBalance / discountFactor;

        simHistory.push(Math.round(realBalance));
      }
    }
    results.push(simHistory);
  }

  const chartData = [];
  const steps = results[0].length;

  for (let t = 0; t < steps; t++) {
    const yearValues = new Float64Array(SIMULATIONS);
    for (let k = 0; k < SIMULATIONS; k++) {
      yearValues[k] = results[k][t];
    }
    yearValues.sort();

    chartData.push({
      year: t,
      worstCase: Math.round(yearValues[Math.floor(SIMULATIONS * 0.1)]),
      median: Math.round(yearValues[Math.floor(SIMULATIONS * 0.5)]),
      bestCase: Math.round(yearValues[Math.floor(SIMULATIONS * 0.9)]),
    });
  }

  const finalYear = chartData[chartData.length - 1];

  const totalInvested = Number(initial) + Number(monthly) * 12 * Number(years);
  const pureProfitMedian = finalYear.median - totalInvested;

  const summary = {
    ...finalYear,
    totalInvested: Math.round(totalInvested),
    pureProfitMedian: Math.round(pureProfitMedian),
  };

  return { chartData, summary };
}
