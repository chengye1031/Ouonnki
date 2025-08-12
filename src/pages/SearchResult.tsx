import { useParams, useNavigate } from 'react-router'
import { useSearch } from '@/hooks'
import { apiService } from '@/services/api.service'
import { useState, useEffect, useRef } from 'react'
import { type VideoItem } from '@/types'
import { useApiStore } from '@/store/apiStore'
import { Card, CardFooter, Image, CardHeader, Chip } from '@heroui/react'

export default function SearchResult() {
  const abortCtrlRef = useRef<AbortController | null>(null)
  const { selectedAPIs, selectAllAPIs, customAPIs } = useApiStore()
  const navigate = useNavigate()

  const { query } = useParams()
  const { search, setSearch, searchMovie } = useSearch()
  const [searchRes, setSearchRes] = useState<VideoItem[]>([])
  const [totalResults, setTotalResults] = useState<number>(0) // 新增状态
  const [loading, setLoading] = useState(false)

  const fetchSearchRes = async () => {
    if (!search) return
    
    abortCtrlRef.current?.abort()
    const controller = new AbortController()
    abortCtrlRef.current = controller
    
    setLoading(true)
    setSearchRes([])
    
    try {
      await apiService.aggregatedSearch(
        search,
        selectedAPIs,
        customAPIs,
        (newResults) => {
          setSearchRes(prevResults => [...prevResults, ...newResults])
        },
        controller.signal,
      )
      
      // 搜索完成后，更新总数
      setTotalResults(searchRes.length)
    } catch (error) {
      console.error("搜索失败:", error)
    } finally {
      setLoading(false)
    }
  }

  // 其他逻辑保持不变...

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          搜索 "{search}" 的结果 ({totalResults} 个) {/* 静态显示 */}
        </h2>
        <p className="mt-1 text-sm text-gray-600">搜索结果来自 {selectedAPIs.length} 个源</p>
        {loading && <p className="mt-2 text-gray-500">正在从各资源站玩命搜索中...</p>}
      </div>

      {/* 其余 UI 保持不变... */}
    </div>
  )
}
