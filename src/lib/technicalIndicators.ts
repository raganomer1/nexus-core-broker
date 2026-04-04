import type { CandleData } from '@/services/marketDataService';

type IndicatorPoint = {
  time: number;
  value: number;
};

export function calculateSma(candles: CandleData[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];

  const result: IndicatorPoint[] = [];
  let rollingSum = 0;

  candles.forEach((candle, index) => {
    rollingSum += candle.close;
    if (index >= period) rollingSum -= candles[index - period].close;
    if (index >= period - 1) {
      result.push({
        time: candle.time,
        value: Number((rollingSum / period).toFixed(6)),
      });
    }
  });

  return result;
}

export function calculateEma(candles: CandleData[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];

  const multiplier = 2 / (period + 1);
  const result: IndicatorPoint[] = [];
  let ema = candles.slice(0, period).reduce((sum, candle) => sum + candle.close, 0) / period;

  result.push({
    time: candles[period - 1].time,
    value: Number(ema.toFixed(6)),
  });

  for (let index = period; index < candles.length; index++) {
    ema = (candles[index].close - ema) * multiplier + ema;
    result.push({
      time: candles[index].time,
      value: Number(ema.toFixed(6)),
    });
  }

  return result;
}

export function calculateBollingerBands(candles: CandleData[], period: number, stdDeviation: number) {
  if (candles.length < period) {
    return { upper: [] as IndicatorPoint[], middle: [] as IndicatorPoint[], lower: [] as IndicatorPoint[] };
  }

  const upper: IndicatorPoint[] = [];
  const middle: IndicatorPoint[] = [];
  const lower: IndicatorPoint[] = [];

  for (let index = period - 1; index < candles.length; index++) {
    const slice = candles.slice(index - period + 1, index + 1);
    const mean = slice.reduce((sum, candle) => sum + candle.close, 0) / period;
    const variance = slice.reduce((sum, candle) => sum + Math.pow(candle.close - mean, 2), 0) / period;
    const deviation = Math.sqrt(variance) * stdDeviation;

    middle.push({ time: candles[index].time, value: Number(mean.toFixed(6)) });
    upper.push({ time: candles[index].time, value: Number((mean + deviation).toFixed(6)) });
    lower.push({ time: candles[index].time, value: Number((mean - deviation).toFixed(6)) });
  }

  return { upper, middle, lower };
}
