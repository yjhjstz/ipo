import ProspectusAnalyzer from '@/components/ProspectusAnalyzer'

export default function ProspectusPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">招股书分析</h1>
          <p className="text-gray-600">
            使用AI技术深度分析IPO招股书，提供投资建议和风险评估
          </p>
        </div>
        
        <ProspectusAnalyzer />
      </div>
    </div>
  )
}