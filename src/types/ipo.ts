export type IpoStock = {
  id: string
  symbol: string
  companyName: string
  market: 'US' | 'HK'
  expectedPrice?: number
  priceRange?: string
  sharesOffered?: number
  ipoDate?: Date
  status: 'UPCOMING' | 'PRICING' | 'LISTED' | 'WITHDRAWN' | 'POSTPONED'
  description?: string
  sector?: string
  industry?: string
  underwriters: string[]
  marketCap?: number
  revenue?: number
  netIncome?: number
  employees?: number
  website?: string
  createdAt: Date
  updatedAt: Date
}

export type CreateIpoStock = Omit<IpoStock, 'id' | 'createdAt' | 'updatedAt'>

export type UpdateIpoStock = Partial<CreateIpoStock> & { id: string }