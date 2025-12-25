'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Store, ForecastHistory } from '@/types/database'
import { formatCurrency, getSeasonLabel } from '@/lib/constants'

type HistoryWithStore = ForecastHistory & { stores: { name: string } }

export default function HistoryPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [history, setHistory] = useState<HistoryWithStore[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedStore, setSelectedStore] = useState<string>('')

  const fetchStores = useCallback(async () => {
    const { data } = await supabase.from('stores').select('*').order('created_at')
    setStores(data || [])
    setLoading(false)
  }, [])

  const fetchHistory = useCallback(async () => {
    let query = supabase
      .from('forecast_history')
      .select('*, stores(name)')
      .eq('year', selectedYear)
      .order('month', { ascending: true })
      .order('store_id')

    if (selectedStore) {
      query = query.eq('store_id', selectedStore)
    }

    const { data } = await query
    setHistory((data as HistoryWithStore[]) || [])
  }, [selectedStore, selectedYear])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // 月ごとにグループ化
  const groupedByMonth = history.reduce((acc, h) => {
    const key = h.month
    if (!acc[key]) acc[key] = []
    acc[key].push(h)
    return acc
  }, {} as Record<number, HistoryWithStore[]>)

  // 年間合計
  const yearlyTotal = history.reduce(
    (acc, h) => ({
      total: acc.total + h.total_sales,
      treatment: acc.treatment + h.treatment_sales,
      retail: acc.retail + h.retail_sales,
    }),
    { total: 0, treatment: 0, retail: 0 }
  )

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">予測履歴</h1>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-6">
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {[...Array(3)].map((_, i) => {
              const year = new Date().getFullYear() - 1 + i
              return (
                <option key={year} value={year}>
                  {year}年
                </option>
              )
            })}
          </select>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">全店舗</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {history.length > 0 && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow p-4 sm:p-6 mb-6 text-white">
          <h2 className="text-sm sm:text-lg font-medium mb-3">
            {selectedYear}年 {selectedStore ? stores.find((s) => s.id === selectedStore)?.name : '全店舗'} 年間合計
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center sm:text-left">
              <p className="text-green-200 text-xs sm:text-sm">施術</p>
              <p className="text-xs sm:text-2xl font-bold">{formatCurrency(yearlyTotal.treatment)}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-green-200 text-xs sm:text-sm">物販</p>
              <p className="text-xs sm:text-2xl font-bold">{formatCurrency(yearlyTotal.retail)}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-green-200 text-xs sm:text-sm">総売上</p>
              <p className="text-sm sm:text-3xl font-bold">{formatCurrency(yearlyTotal.total)}</p>
            </div>
          </div>
        </div>
      )}

      {Object.keys(groupedByMonth).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          予測履歴がありません
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(groupedByMonth)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([month, records]) => {
              const monthTotal = records.reduce(
                (acc, r) => ({
                  total: acc.total + r.total_sales,
                  treatment: acc.treatment + r.treatment_sales,
                  retail: acc.retail + r.retail_sales,
                }),
                { total: 0, treatment: 0, retail: 0 }
              )

              return (
                <div key={month} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center justify-between mb-2 sm:mb-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-lg">{month}月</h3>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {getSeasonLabel(Number(month))}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center sm:hidden">
                      <div>
                        <p className="text-xs text-gray-500">施術</p>
                        <p className="text-xs font-medium">{formatCurrency(monthTotal.treatment)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">物販</p>
                        <p className="text-xs font-medium">{formatCurrency(monthTotal.retail)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">合計</p>
                        <p className="text-xs font-bold text-blue-600">{formatCurrency(monthTotal.total)}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        施術: <span className="font-medium text-gray-900">{formatCurrency(monthTotal.treatment)}</span>
                      </span>
                      <span className="text-gray-500">
                        物販: <span className="font-medium text-gray-900">{formatCurrency(monthTotal.retail)}</span>
                      </span>
                      <span className="text-gray-500">
                        合計: <span className="font-bold text-blue-600">{formatCurrency(monthTotal.total)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <thead>
                        <tr className="border-b">
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">店舗</th>
                          <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500">施術</th>
                          <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500">物販</th>
                          <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500">合計</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {records.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">{record.stores.name}</td>
                            <td className="px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">{formatCurrency(record.treatment_sales)}</td>
                            <td className="px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">{formatCurrency(record.retail_sales)}</td>
                            <td className="px-2 sm:px-4 py-2 text-right text-xs sm:text-sm font-medium">{formatCurrency(record.total_sales)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
