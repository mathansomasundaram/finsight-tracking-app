import { Asset } from '../../types/index';

export interface AssetSeederOptions {
  userId: string;
}

interface StockHolding {
  symbol: string;
  quantity: number;
  currentPrice: number;
}

interface MutualFundHolding {
  name: string;
  units: number;
  currentPrice: number;
  subType: 'direct' | 'growth';
}

interface CryptoHolding {
  symbol: string;
  amount: number;
  currentPrice: number;
}

// Realistic stock holdings (NSE)
const STOCK_HOLDINGS: StockHolding[] = [
  { symbol: 'RELIANCE', quantity: 10, currentPrice: 2800 },
  { symbol: 'TCS', quantity: 5, currentPrice: 3500 },
  { symbol: 'INFY', quantity: 20, currentPrice: 1600 },
  { symbol: 'HDFC BANK', quantity: 8, currentPrice: 1800 },
  { symbol: 'ICICI BANK', quantity: 12, currentPrice: 950 },
  { symbol: 'BAJAJ AUTO', quantity: 6, currentPrice: 7500 },
  { symbol: 'MARUTI', quantity: 4, currentPrice: 9200 },
  { symbol: 'AXIS BANK', quantity: 15, currentPrice: 1100 },
  { symbol: 'WIPRO', quantity: 25, currentPrice: 450 },
  { symbol: 'HUL', quantity: 3, currentPrice: 2700 },
];

// Realistic mutual fund holdings
const MUTUAL_FUND_HOLDINGS: MutualFundHolding[] = [
  { name: 'ICICI Prudential Bluechip', units: 150, currentPrice: 85, subType: 'growth' },
  { name: 'Axis Growth Fund', units: 200, currentPrice: 45, subType: 'growth' },
  { name: 'Kotak Emerging Opportunities', units: 100, currentPrice: 70, subType: 'growth' },
  {
    name: 'SBI Magnum Balanced Fund',
    units: 250,
    currentPrice: 32,
    subType: 'direct',
  },
  {
    name: 'HDFC Top 100 Fund',
    units: 180,
    currentPrice: 52,
    subType: 'growth',
  },
  { name: 'Mirae Asset Large Cap Fund', units: 120, currentPrice: 68, subType: 'growth' },
  {
    name: 'Franklin India High Growth Companies',
    units: 90,
    currentPrice: 95,
    subType: 'growth',
  },
  { name: 'Nippon India Small Cap Fund', units: 75, currentPrice: 125, subType: 'direct' },
];

// Realistic crypto holdings
const CRYPTO_HOLDINGS: CryptoHolding[] = [
  { symbol: 'BTC', amount: 0.25, currentPrice: 4500000 },
  { symbol: 'ETH', amount: 2.5, currentPrice: 300000 },
  { symbol: 'ADA', amount: 500, currentPrice: 40 },
];

export function generateAssets(options: AssetSeederOptions): Asset[] {
  const { userId } = options;
  const assets: Asset[] = [];
  let assetId = 1;

  // Generate stock holdings
  const stocksToAdd = STOCK_HOLDINGS.slice(
    0,
    Math.floor(Math.random() * 5) + 10
  );
  stocksToAdd.forEach((stock) => {
    assets.push({
      id: `ast_${userId}_${assetId++}`,
      userId,
      name: stock.symbol,
      type: 'stocks',
      currentValue: stock.quantity * stock.currentPrice,
      units: stock.quantity,
      exchange: Math.random() > 0.5 ? 'NSE' : 'BSE',
      notes: `${stock.quantity} shares @ ₹${stock.currentPrice}/share`,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  });

  // Generate mutual fund holdings
  const mfToAdd = MUTUAL_FUND_HOLDINGS.slice(0, Math.floor(Math.random() * 2) + 6);
  mfToAdd.forEach((mf) => {
    assets.push({
      id: `ast_${userId}_${assetId++}`,
      userId,
      name: mf.name,
      type: 'mutual_funds',
      currentValue: mf.units * mf.currentPrice,
      units: mf.units,
      subType: mf.subType,
      notes: `${mf.units} units @ ₹${mf.currentPrice}/unit (${mf.subType})`,
      createdAt: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  });

  // Generate gold holdings (in grams)
  const goldQuantity = Math.floor(Math.random() * 400) + 100; // 100-500 grams
  const goldPricePerGram = 6500; // Approximate INR per gram
  assets.push({
    id: `ast_${userId}_${assetId++}`,
    userId,
    name: 'Physical Gold',
    type: 'gold',
    currentValue: goldQuantity * goldPricePerGram,
    units: goldQuantity,
    notes: `${goldQuantity} grams @ ₹${goldPricePerGram}/gram`,
    createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  });

  // Generate crypto holdings
  CRYPTO_HOLDINGS.forEach((crypto) => {
    assets.push({
      id: `ast_${userId}_${assetId++}`,
      userId,
      name: crypto.symbol,
      type: 'crypto',
      currentValue: crypto.amount * crypto.currentPrice,
      units: crypto.amount,
      notes: `${crypto.amount} ${crypto.symbol} @ ₹${crypto.currentPrice}/${crypto.symbol}`,
      createdAt: new Date(Date.now() - Math.random() * 150 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  });

  // Generate bank FDs (Fixed Deposits)
  const fdCount = Math.floor(Math.random() * 2) + 2; // 2-3 FDs
  for (let i = 0; i < fdCount; i++) {
    const fdAmount = Math.floor(Math.random() * 800000) + 200000; // ₹2-10 lakhs
    const rate = Math.random() * 1.5 + 6.5; // 6.5-8% interest rate
    assets.push({
      id: `ast_${userId}_${assetId++}`,
      userId,
      name: `Bank FD ${i + 1}`,
      type: 'bank_fd',
      currentValue: fdAmount,
      units: 1,
      notes: `Amount: ₹${fdAmount}, Rate: ${rate.toFixed(2)}% p.a.`,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  // Generate cash holdings
  const cashAmount = Math.floor(Math.random() * 150000) + 50000; // ₹50k-2 lakhs
  assets.push({
    id: `ast_${userId}_${assetId++}`,
    userId,
    name: 'Cash on Hand',
    type: 'cash',
    currentValue: cashAmount,
    units: cashAmount,
    notes: `Liquid cash holdings`,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return assets;
}
