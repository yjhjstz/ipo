'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Trash2, Clock, TrendingUp } from 'lucide-react'
import FileUploadAnalyzer from '@/components/FileUploadAnalyzer'

interface UploadedFile {
  id: string
  originalName: string
  fileName: string
  size: number
  type: string
  uploadedAt: string
}

// Mock data for demonstration - in production this would come from an API
const mockUploadedFiles: UploadedFile[] = [
  {
    id: '1',
    originalName: 'apple-10k-2023.pdf',
    fileName: 'uuid-1.pdf',
    size: 2456789,
    type: 'application/pdf',
    uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2', 
    originalName: 'microsoft-earnings-q3.html',
    fileName: 'uuid-2.html',
    size: 1234567,
    type: 'text/html',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export default function FileManagementPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload')
  const [loading, setLoading] = useState(false)

  // Load uploaded files on component mount
  useEffect(() => {
    loadUploadedFiles()
  }, [])

  const loadUploadedFiles = async () => {
    setLoading(true)
    try {
      // In production, this would be an API call
      // const response = await fetch('/api/uploaded-files')
      // const result = await response.json()
      // setUploadedFiles(result.data || [])
      
      // For now, use mock data
      setTimeout(() => {
        setUploadedFiles(mockUploadedFiles)
        setLoading(false)
      }, 500)
    } catch (err) {
      console.error('Failed to load uploaded files:', err)
      setLoading(false)
    }
  }

  const deleteFile = async (fileId: string) => {
    if (!confirm('确定要删除这个文件吗？')) return

    try {
      // In production, this would be an API call
      // await fetch(`/api/uploaded-files/${fileId}`, { method: 'DELETE' })
      
      // For now, just remove from state
      setUploadedFiles(files => files.filter(f => f.id !== fileId))
    } catch (err) {
      console.error('Failed to delete file:', err)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="w-6 h-6 text-red-500" />
    }
    return <FileText className="w-6 h-6 text-blue-500" />
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">财报文件管理</h1>
        <p className="text-gray-600">上传PDF和HTML格式的财务报表进行AI分析，或管理已上传的文件</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              上传分析
            </span>
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              文件管理 ({uploadedFiles.length})
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && (
        <FileUploadAnalyzer />
      )}

      {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* File Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{uploadedFiles.length}</div>
                  <div className="text-sm text-gray-600">已上传文件</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Download className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatFileSize(uploadedFiles.reduce((total, file) => total + file.size, 0))}
                  </div>
                  <div className="text-sm text-gray-600">总存储空间</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {uploadedFiles.length > 0 ? formatDate(uploadedFiles[0].uploadedAt) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">最近上传</div>
                </div>
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">已上传的文件</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-gray-600">加载中...</div>
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-600 mb-2">暂无已上传的文件</div>
                <div className="text-sm text-gray-500">
                  点击&quot;上传分析&quot;标签开始上传财务报表
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getFileIcon(file.type)}
                        <div>
                          <div className="text-lg font-medium text-gray-900">
                            {file.originalName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • 上传于 {formatDate(file.uploadedAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            // In production, this would trigger file download
                            console.log('Download file:', file.fileName)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                          title="下载文件"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            // In production, this would trigger re-analysis
                            console.log('Re-analyze file:', file.fileName)
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                          title="重新分析"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="删除文件"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}