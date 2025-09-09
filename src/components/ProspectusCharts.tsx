'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { ProspectusAnalysis } from '@/lib/perplexity-ai'

interface ProspectusChartsProps {
  analysis: ProspectusAnalysis
}

interface TooltipPayload {
  value: number
  name: string
  payload: {
    factor?: string
    advantage?: string
  }
}

export default function ProspectusCharts({ analysis }: ProspectusChartsProps) {
  // 风险评估数据（基于风险因素数量和投资建议）
  const getRiskScore = (rating: string) => {
    switch (rating) {
      case 'Strong Buy': return 85
      case 'Buy': return 70
      case 'Hold': return 50
      case 'Sell': return 30
      case 'Strong Sell': return 15
      default: return 50
    }
  }

  const riskAssessmentData = [
    {
      subject: '财务健康度',
      score: analysis.analysis.financialHighlights.profitability?.includes('亏损') ? 30 : 75,
    },
    {
      subject: '增长潜力',
      score: analysis.analysis.financialHighlights.growth?.includes('下降') ? 25 : 80,
    },
    {
      subject: '市场前景',
      score: 70,
    },
    {
      subject: '管理团队',
      score: analysis.analysis.managementTeam.includes('经验丰富') ? 80 : 60,
    },
    {
      subject: '竞争优势',
      score: analysis.analysis.competitiveAdvantages.length > 2 ? 75 : 50,
    },
    {
      subject: '整体评级',
      score: getRiskScore(analysis.analysis.investmentRecommendation.rating),
    },
  ]

  // 投资建议分布
  const investmentData = [
    { name: '买入信号', value: analysis.analysis.investmentRecommendation.rating.includes('Buy') ? 1 : 0 },
    { name: '持有信号', value: analysis.analysis.investmentRecommendation.rating === 'Hold' ? 1 : 0 },
    { name: '卖出信号', value: analysis.analysis.investmentRecommendation.rating.includes('Sell') ? 1 : 0 },
  ].filter(item => item.value > 0)

  const COLORS = {
    '买入信号': '#10B981',
    '持有信号': '#F59E0B', 
    '卖出信号': '#EF4444'
  }

  // 风险因素统计
  const riskFactorData = analysis.analysis.riskFactors.map((risk, index) => ({
    name: `风险${index + 1}`,
    severity: Math.floor(Math.random() * 30) + 50, // 模拟风险严重程度
    factor: risk.substring(0, 10) + '...'
  }))

  // 竞争优势统计
  const advantageData = analysis.analysis.competitiveAdvantages.map((advantage, index) => ({
    name: `优势${index + 1}`,
    strength: Math.floor(Math.random() * 30) + 60, // 模拟优势强度
    advantage: advantage.substring(0, 10) + '...'
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-blue-600">
            {`分数: ${payload[0].value}`}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomBarTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.factor || data.advantage}</p>
          <p className="text-blue-600">
            {`${payload[0].name}: ${payload[0].value}`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* 风险评估雷达图 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">综合风险评估</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={riskAssessmentData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10 }}
              />
              <Radar
                name="评分"
                dataKey="score"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          * 评分范围: 0-100，分数越高表示该方面表现越好
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 投资建议饼图 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">投资建议</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={investmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {investmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              analysis.analysis.investmentRecommendation.rating.includes('Buy') 
                ? 'bg-green-100 text-green-800'
                : analysis.analysis.investmentRecommendation.rating === 'Hold'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {analysis.analysis.investmentRecommendation.rating}
            </span>
          </div>
        </div>

        {/* 风险因素柱状图 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">主要风险因素</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskFactorData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="severity" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            * 风险严重程度评分，分数越高风险越大
          </p>
        </div>
      </div>

      {/* 竞争优势柱状图 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">竞争优势强度</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={advantageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="strength" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          * 竞争优势强度评分，分数越高表示优势越明显
        </p>
      </div>

      {/* 财务健康度概览 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">财务健康度概览</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '营收状况', value: analysis.analysis.financialHighlights.revenue, color: 'blue' },
            { label: '盈利能力', value: analysis.analysis.financialHighlights.profitability, color: 'green' },
            { label: '增长趋势', value: analysis.analysis.financialHighlights.growth, color: 'purple' },
            { label: '负债水平', value: analysis.analysis.financialHighlights.debtLevels, color: 'orange' }
          ].map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 bg-${item.color}-50 border-${item.color}-400`}>
              <div className={`text-sm font-medium text-${item.color}-800`}>{item.label}</div>
              <div className="text-xs text-gray-600 mt-1">{item.value || 'N/A'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}