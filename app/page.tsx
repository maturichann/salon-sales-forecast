'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Store, Staff, SalesStandard, HelpRecord, StaffLeave } from '@/types/database'
import { calculateForecast, StoreForecast } from '@/lib/forecast'
import { formatCurrency, getSeasonLabel } from '@/lib/constants'

export default function HomePage() {
  const [stores, setStores] = useState<Store[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [salesStandards, setSalesStandards] = useState<SalesStandard[]>([])
  const [helpRecords, setHelpRecords] = useState<HelpRecord[]>([])
  const [staffLeaves, setStaffLeaves] = useState<StaffLeave[]>([])
  const [loading, setLoading] = useState(true)
  const [forecasts, setForecasts] = useState<StoreForecast[]>([])

  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date()
    const nextMonth = now.getMonth() + 2
    return nextMonth > 12 ? now.getFullYear() + 1 : now.getFullYear()
  })
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const nextMonth = new Date().getMonth() + 2
    return nextMonth > 12 ? nextMonth - 12 : nextMonth
  })
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set())
  const [isFukubukuroYear, setIsFukubukuroYear] = useState(false)

  const fetchMasterData = useCallback(async () => {
    const [storesRes, staffRes, standardsRes] = await Promise.all([
      supabase.from('stores').select('*').order('created_at'),
      supabase.from('staff').select('*').order('name'),
      supabase.from('sales_standards').select('*'),
    ])

    setStores(storesRes.data || [])
    setStaff(staffRes.data || [])
    setSalesStandards(standardsRes.data || [])
    setLoading(false)
  }, [])

  const fetchMonthlyData = useCallback(async () => {
    const [helpRes, leavesRes] = await Promise.all([
      supabase
        .from('help_records')
        .select('*')
        .eq('year', selectedYear)
        .eq('month', selectedMonth),
      supabase
        .from('staff_leaves')
        .select('*')
        .eq('year', selectedYear)
        .eq('month', selectedMonth),
    ])

    setHelpRecords(helpRes.data || [])
    setStaffLeaves(leavesRes.data || [])
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    fetchMasterData()
  }, [fetchMasterData])

  useEffect(() => {
    fetchMonthlyData()
  }, [fetchMonthlyData])

  useEffect(() => {
    if (stores.length && staff.length && salesStandards.length) {
      const results = calculateForecast(
        stores,
        staff,
        salesStandards,
        helpRecords,
        staffLeaves,
        selectedMonth,
        isFukubukuroYear
      )
      setForecasts(results)
    }
  }, [stores, staff, salesStandards, helpRecords, staffLeaves, selectedMonth, isFukubukuroYear])

  async function saveForecast() {
    for (const forecast of forecasts) {
      await supabase.from('forecast_history').upsert(
        {
          year: selectedYear,
          month: selectedMonth,
          store_id: forecast.storeId,
          total_sales: forecast.finalSales.total,
          treatment_sales: forecast.finalSales.treatment,
          retail_sales: forecast.finalSales.retail,
        },
        { onConflict: 'year,month,store_id' }
      )
    }
    alert('予測を保存しました')
  }

  function toggleStore(storeId: string) {
    const newExpanded = new Set(expandedStores)
    if (newExpanded.has(storeId)) {
      newExpanded.delete(storeId)
    } else {
      newExpanded.add(storeId)
    }
    setExpandedStores(newExpanded)
  }

  const grandTotal = forecasts.reduce(
    (acc, f) => ({
      total: acc.total + f.finalSales.total,
      treatment: acc.treatment + f.finalSales.treatment,
      retail: acc.retail + f.finalSales.retail,
    }),
    { total: 0, treatment: 0, retail: 0 }
  )

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">売上予測</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {[...Array(3)].map((_, i) => {
                const year = new Date().getFullYear() + i
                return (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                )
              })}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}月
                </option>
              ))}
            </select>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
            {getSeasonLabel(selectedMonth)}
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isFukubukuroYear}
              onChange={(e) => setIsFukubukuroYear(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <span className="text-xs text-gray-700">福袋</span>
          </label>
          <button
            onClick={saveForecast}
            className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            保存
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow p-4 sm:p-6 mb-6 text-white">
        <h2 className="text-base sm:text-lg font-medium mb-3">
          {selectedYear}年{selectedMonth}月 全店舗合計
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div>
            <p className="text-blue-200 text-xs sm:text-sm">施術</p>
            <p className="text-sm sm:text-2xl font-bold">{formatCurrency(grandTotal.treatment)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs sm:text-sm">物販</p>
            <p className="text-sm sm:text-2xl font-bold">{formatCurrency(grandTotal.retail)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs sm:text-sm">総売上</p>
            <p className="text-lg sm:text-3xl font-bold">{formatCurrency(grandTotal.total)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-4">
        {forecasts.map((forecast) => (
          <div key={forecast.storeId} className="bg-white rounded-lg shadow overflow-hidden">
            <div
              className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleStore(forecast.storeId)}
            >
              {/* モバイル: 縦並び */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{forecast.storeName}</span>
                    {forecast.helpReceived.total > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                        +{formatCurrency(forecast.helpReceived.total)}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400">
                    {expandedStores.has(forecast.storeId) ? '▲' : '▼'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">施術</p>
                    <p className="text-xs font-medium">{formatCurrency(forecast.finalSales.treatment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">物販</p>
                    <p className="text-xs font-medium">{formatCurrency(forecast.finalSales.retail)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">合計</p>
                    <p className="text-xs font-bold text-blue-600">{formatCurrency(forecast.finalSales.total)}</p>
                  </div>
                </div>
              </div>
              {/* デスクトップ: 横並び */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">{forecast.storeName}</span>
                  {forecast.helpReceived.total > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                      +{formatCurrency(forecast.helpReceived.total)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">施術</p>
                    <p className="font-medium">{formatCurrency(forecast.finalSales.treatment)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">物販</p>
                    <p className="font-medium">{formatCurrency(forecast.finalSales.retail)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">合計</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(forecast.finalSales.total)}</p>
                  </div>
                  <span className="text-gray-400">
                    {expandedStores.has(forecast.storeId) ? '▲' : '▼'}
                  </span>
                </div>
              </div>
            </div>

            {expandedStores.has(forecast.storeId) && (
              <div className="border-t overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">
                        スタッフ
                      </th>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">
                        職種
                      </th>
                      <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500">
                        施術
                      </th>
                      <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500">
                        物販
                      </th>
                      <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500">
                        合計
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {forecast.staffForecasts.map((sf) => (
                      <tr key={sf.staffId} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">
                          {sf.staffName}
                          {sf.helpDeductions > 0 && (
                            <span className="ml-1 text-xs text-red-600">-{sf.helpDeductions}%</span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${
                              sf.jobType === 'eyelist'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-pink-100 text-pink-700'
                            }`}
                          >
                            {sf.rank}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">
                          {formatCurrency(sf.adjustedSales.treatment)}
                        </td>
                        <td className="px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">
                          {formatCurrency(sf.adjustedSales.retail)}
                        </td>
                        <td className="px-2 sm:px-4 py-2 text-right text-xs sm:text-sm font-medium">
                          {formatCurrency(sf.adjustedSales.total)}
                        </td>
                      </tr>
                    ))}
                    {forecast.staffForecasts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center text-gray-500 text-sm">
                          スタッフが登録されていません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {forecasts.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          店舗が登録されていません
        </div>
      )}
    </div>
  )
}
