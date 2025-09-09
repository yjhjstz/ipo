// 热门美股代码数据
export const popularStocks = [
  // 科技股
  { symbol: 'AAPL', name: 'Apple Inc.', sector: '科技' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: '科技' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: '科技' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: '科技' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: '科技' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: '汽车/科技' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: '科技' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: '媒体' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: '科技' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: '科技' },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: '科技' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: '科技' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', sector: '科技' },
  { symbol: 'SNAP', name: 'Snap Inc.', sector: '科技' },
  { symbol: 'TWTR', name: 'Twitter Inc.', sector: '科技' },

  // 金融股
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: '金融' },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: '金融' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', sector: '金融' },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.', sector: '金融' },
  { symbol: 'MS', name: 'Morgan Stanley', sector: '金融' },
  { symbol: 'V', name: 'Visa Inc.', sector: '金融' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: '金融' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', sector: '金融科技' },
  { symbol: 'SQ', name: 'Block Inc.', sector: '金融科技' },
  { symbol: 'SOFI', name: 'SoFi Technologies Inc.', sector: '金融科技' },

  // 医疗健康
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: '医疗' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: '医疗' },
  { symbol: 'MRNA', name: 'Moderna Inc.', sector: '生物医药' },
  { symbol: 'BNTX', name: 'BioNTech SE', sector: '生物医药' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: '医疗' },

  // 消费品
  { symbol: 'KO', name: 'Coca-Cola Company', sector: '消费品' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: '消费品' },
  { symbol: 'MCD', name: 'McDonalds Corporation', sector: '餐饮' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', sector: '餐饮' },
  { symbol: 'NKE', name: 'Nike Inc.', sector: '消费品' },

  // 能源
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: '能源' },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: '能源' },
  
  // 新兴公司
  { symbol: 'RIVN', name: 'Rivian Automotive Inc.', sector: '电动车' },
  { symbol: 'LCID', name: 'Lucid Group Inc.', sector: '电动车' },
  { symbol: 'PLTR', name: 'Palantir Technologies Inc.', sector: '科技' },
  { symbol: 'ROKU', name: 'Roku Inc.', sector: '媒体' },
  { symbol: 'ZM', name: 'Zoom Video Communications', sector: '科技' },
  { symbol: 'DOCU', name: 'DocuSign Inc.', sector: '科技' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', sector: '科技' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', sector: '加密货币' },
  { symbol: 'RBLX', name: 'Roblox Corporation', sector: '游戏' },
  { symbol: 'HOOD', name: 'Robinhood Markets Inc.', sector: '金融科技' }
]

// 搜索函数
export const searchStocks = (query: string, limit: number = 8) => {
  if (!query || query.length < 1) return []
  
  const searchTerm = query.toUpperCase()
  
  return popularStocks
    .filter(stock => 
      stock.symbol.includes(searchTerm) || 
      stock.name.toUpperCase().includes(searchTerm) ||
      stock.sector.includes(query)
    )
    .slice(0, limit)
}