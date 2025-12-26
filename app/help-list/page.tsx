'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Store, Staff, HelpRecord } from '@/types/database'
import { getSeasonLabel } from '@/lib/constants'

type HelpWithDetails = HelpRecord & {
  staffName: string
  fromStoreName: string
  toStoreName: string
}

export default function HelpListPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [helpList, setHelpList] = useState<HelpWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedYear, setSelectedYear] = useState(() => {
    const nextMonth = new Date().getMonth() + 2
    return nextMonth > 12 ? 2026 : 2026
  })
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const nextMonth = new Date().getMonth() + 2
    return nextMonth > 12 ? nextMonth - 12 : nextMonth
  })
  const [filterFromStore, setFilterFromStore] = useState<string>('')
  const [filterToStore, setFilterToStore] = useState<string>('')

  useEffect(() => {
    fetchMasterData()
  }, [])

  useEffect(() => {
    if (stores.length && staff.length) {
      fetchHelpData()
    }
  }, [selectedYear, selectedMonth, stores, staff])

  async function fetchMasterData() {
    const [storesRes, staffRes] = await Promise.all([
      supabase.from('stores').select('*').order('created_at'),
      supabase.from('staff').select('*').order('name'),
    ])

    setStores(storesRes.data || [])
    setStaff(staffRes.data || [])
    setLoading(false)
  }

  async function fetchHelpData() {
    const { data } = await supabase
      .from('help_records')
      .select('*')
      .eq('year', selectedYear)
      .eq('month', selectedMonth)

    if (data) {
      const helpWithDetails = data.map((h) => {
        const staffMember = staff.find((s) => s.id === h.staff_id)
        const fromStore = stores.find((s) => s.id === h.from_store_id)
        const toStore = stores.find((s) => s.id === h.to_store_id)
        return {
          ...h,
          staffName: staffMember?.name || '不明',
          fromStoreName: fromStore?.name || '不明',
          toStoreName: toStore?.name || '不明',
        }
      })
      // 所属店舗でグループ化してソート
      helpWithDetails.sort((a, b) => a.fromStoreName.localeCompare(b.fromStoreName))
      setHelpList(helpWithDetails)
    } else {
      setHelpList([])
    }
  }

  // フィルタリング
  const filteredHelpList = helpList.filter((h) => {
    if (filterFromStore && h.from_store_id !== filterFromStore) return false
    if (filterToStore && h.to_store_id !== filterToStore) return false
    return true
  })

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">ヘルプ一覧</h1>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-6">
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {[...Array(3)].map((_, i) => {
                const year = 2026 + i
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
              className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
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
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center mt-3 pt-3 border-t">
          <select
            value={filterFromStore}
            onChange={(e) => setFilterFromStore(e.target.value)}
            className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">所属店舗: 全て</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <select
            value={filterToStore}
            onChange={(e) => setFilterToStore(e.target.value)}
            className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">ヘルプ先: 全て</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <span className="ml-auto text-sm text-gray-600">
            {filteredHelpList.length}件
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredHelpList.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            {helpList.length === 0 ? 'この月のヘルプはありません' : '該当するヘルプはありません'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">
                    スタッフ
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">
                    所属店舗
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-600">
                    →
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">
                    ヘルプ先
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-600">
                    減算
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-600">
                    加算
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHelpList.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">
                      {h.staffName}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600">
                      {h.fromStoreName}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-gray-400">
                      →
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                        {h.toStoreName}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-red-600">
                      -{h.deduction_percent}%
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-green-600">
                      +{h.addition_percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
