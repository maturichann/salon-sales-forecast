'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Store, Staff, SalesStandard, MonthlyAttendance, HelpRecord } from '@/types/database'
import { calculateForecast, StoreForecast } from '@/lib/forecast'
import { formatCurrency, getSeasonLabel, JOB_TYPES } from '@/lib/constants'

export default function HomePage() {
  const [stores, setStores] = useState<Store[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [salesStandards, setSalesStandards] = useState<SalesStandard[]>([])
  const [attendance, setAttendance] = useState<MonthlyAttendance[]>([])
  const [helpRecords, setHelpRecords] = useState<HelpRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [forecasts, setForecasts] = useState<StoreForecast[]>([])

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 2 > 12 ? 1 : new Date().getMonth() + 2
  )
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchMasterData()
  }, [])

  useEffect(() => {
    fetchMonthlyData()
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    if (stores.length && staff.length && salesStandards.length) {
      const results = calculateForecast(
        stores,
        staff,
        salesStandards,
        attendance,
        helpRecords,
        selectedMonth
      )
      setForecasts(results)
    }
  }, [stores, staff, salesStandards, attendance, helpRecords, selectedMonth])

  async function fetchMasterData() {
    const [storesRes, staffRes, standardsRes] = await Promise.all([
      supabase.from('stores').select('*').order('created_at'),
      supabase.from('staff').select('*').order('name'),
      supabase.from('sales_standards').select('*'),
    ])

    setStores(storesRes.data || [])
    setStaff(staffRes.data || [])
    setSalesStandards(standardsRes.data || [])
    setLoading(false)
  }

  async function fetchMonthlyData() {
    const [attendanceRes, helpRes] = await Promise.all([
      supabase
        .from('monthly_attendance')
        .select('*')
        .eq('year', selectedYear)
        .eq('month', selectedMonth),
      supabase
        .from('help_records')
        .select('*')
        .eq('year', selectedYear)
        .eq('month', selectedMonth),
    ])

    setAttendance(attendanceRes.data || [])
    setHelpRecords(helpRes.data || [])
  }

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
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm text-gray-600 mb-1">年</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md"
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
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">月</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}月
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {getSeasonLabel(selectedMonth)}
            </span>
          </div>
          <div className="ml-auto">
            <button
              onClick={saveForecast}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              予測を保存
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow p-6 mb-6 text-white">
        <h2 className="text-lg font-medium mb-4">
          {selectedYear}年{selectedMonth}月 全店舗合計
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-blue-200 text-sm">施術売上</p>
            <p className="text-2xl font-bold">{formatCurrency(grandTotal.treatment)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">物販売上</p>
            <p className="text-2xl font-bold">{formatCurrency(grandTotal.retail)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">総売上</p>
            <p className="text-3xl font-bold">{formatCurrency(grandTotal.total)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {forecasts.map((forecast) => (
          <div key={forecast.storeId} className="bg-white rounded-lg shadow overflow-hidden">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => toggleStore(forecast.storeId)}
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium">{forecast.storeName}</span>
                {forecast.helpReceived.total > 0 && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    ヘルプ受入: {formatCurrency(forecast.helpReceived.total)}
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
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(forecast.finalSales.total)}
                  </p>
                </div>
                <span className="text-gray-400">
                  {expandedStores.has(forecast.storeId) ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {expandedStores.has(forecast.storeId) && (
              <div className="border-t">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        スタッフ
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        職種/ランク
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                        出勤日数
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        施術
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        物販
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        合計
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                        ヘルプ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {forecast.staffForecasts.map((sf) => (
                      <tr key={sf.staffId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{sf.staffName}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              sf.jobType === 'eyelist'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-pink-100 text-pink-700'
                            }`}
                          >
                            {JOB_TYPES.find((j) => j.value === sf.jobType)?.label}
                          </span>
                          <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {sf.rank}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">{sf.workingDays}日</td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(sf.adjustedSales.treatment)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(sf.adjustedSales.retail)}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatCurrency(sf.adjustedSales.total)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {sf.helpDeductions > 0 && (
                            <span className="text-xs text-red-600">-{sf.helpDeductions}%</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {forecast.staffForecasts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 text-center text-gray-500 text-sm">
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
