'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Store, Staff, HelpRecord } from '@/types/database'
import { getSeasonLabel } from '@/lib/constants'

type StaffWithStore = Staff & { stores: { name: string } }

export default function HelpPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [staff, setStaff] = useState<StaffWithStore[]>([])
  const [helpRecords, setHelpRecords] = useState<HelpRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date()
    const nextMonth = now.getMonth() + 2
    return nextMonth > 12 ? now.getFullYear() + 1 : now.getFullYear()
  })
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const nextMonth = new Date().getMonth() + 2
    return nextMonth > 12 ? 1 : nextMonth
  })
  const [selectedStore, setSelectedStore] = useState<string>('')

  const [showHelpModal, setShowHelpModal] = useState(false)
  const [helpForm, setHelpForm] = useState({
    staff_id: '',
    to_store_id: '',
    deduction_percent: 0,
    addition_percent: 0,
  })
  const [editingHelpId, setEditingHelpId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const [storesRes, staffRes] = await Promise.all([
      supabase.from('stores').select('*').order('created_at'),
      supabase.from('staff').select('*, stores(name)').order('name'),
    ])

    if (storesRes.error) console.error('Error:', storesRes.error)
    if (staffRes.error) console.error('Error:', staffRes.error)

    const storesData = (storesRes.data || []) as Store[]
    setStores(storesData)
    setStaff((staffRes.data as StaffWithStore[]) || [])

    if (storesData.length > 0) {
      setSelectedStore(storesData[0].id)
    }
    setLoading(false)
  }, [])

  const fetchHelpData = useCallback(async () => {
    const storeStaff = staff.filter((s) => s.store_id === selectedStore)
    const staffIds = storeStaff.map((s) => s.id)

    if (staffIds.length === 0) {
      setHelpRecords([])
      return
    }

    const { data } = await supabase
      .from('help_records')
      .select('*')
      .eq('year', selectedYear)
      .eq('month', selectedMonth)
      .in('staff_id', staffIds)

    setHelpRecords(data || [])
  }, [selectedMonth, selectedStore, selectedYear, staff])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (selectedStore && staff.length > 0) {
      fetchHelpData()
    }
  }, [fetchHelpData, selectedStore, staff.length])

  function openHelpModal(staffId?: string, helpRecord?: HelpRecord) {
    if (helpRecord) {
      setEditingHelpId(helpRecord.id)
      setHelpForm({
        staff_id: helpRecord.staff_id,
        to_store_id: helpRecord.to_store_id,
        deduction_percent: helpRecord.deduction_percent,
        addition_percent: helpRecord.addition_percent,
      })
    } else {
      setEditingHelpId(null)
      setHelpForm({
        staff_id: staffId || '',
        to_store_id: '',
        deduction_percent: 0,
        addition_percent: 0,
      })
    }
    setShowHelpModal(true)
  }

  async function saveHelp(e: React.FormEvent) {
    e.preventDefault()

    const data = {
      ...helpForm,
      year: selectedYear,
      month: selectedMonth,
      from_store_id: selectedStore,
    }

    if (editingHelpId) {
      await supabase.from('help_records').update(data).eq('id', editingHelpId)
    } else {
      // 新規追加（何回でも追加可能）
      await supabase.from('help_records').insert(data)
    }

    setShowHelpModal(false)
    fetchHelpData()
  }

  async function deleteHelp(id: string) {
    if (!confirm('このヘルプ記録を削除しますか？')) return
    await supabase.from('help_records').delete().eq('id', id)
    fetchHelpData()
  }

  const storeStaff = staff.filter((s) => s.store_id === selectedStore)
  const otherStores = stores.filter((s) => s.id !== selectedStore)

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">ヘルプ入力</h1>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-6">
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
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
              className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}月
                </option>
              ))}
            </select>
          </div>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs ml-auto">
            {getSeasonLabel(selectedMonth)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">スタッフ</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">職種</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">ヘルプ先</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {storeStaff.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500 text-sm">
                    この店舗にスタッフが登録されていません
                  </td>
                </tr>
              ) : (
                storeStaff.map((s) => {
                  const helps = helpRecords.filter((h) => h.staff_id === s.id)

                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">{s.name}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            s.job_type === 'eyelist'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {s.rank}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex flex-col gap-1">
                          {helps.map((h) => {
                            const toStore = stores.find((st) => st.id === h.to_store_id)
                            return (
                              <div
                                key={h.id}
                                className="flex flex-wrap items-center gap-1 text-xs bg-orange-50 px-2 py-1 rounded"
                              >
                                <span className="text-orange-700">
                                  {toStore?.name} (-{h.deduction_percent}%/+{h.addition_percent}%)
                                </span>
                                <button
                                  onClick={() => openHelpModal(s.id, h)}
                                  className="text-blue-600 hover:underline"
                                >
                                  編集
                                </button>
                                <button
                                  onClick={() => deleteHelp(h.id)}
                                  className="text-red-600 hover:underline"
                                >
                                  削除
                                </button>
                              </div>
                            )
                          })}
                          <button
                            onClick={() => openHelpModal(s.id)}
                            className="text-xs text-blue-600 hover:underline text-left"
                          >
                            + 追加
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingHelpId ? 'ヘルプ編集' : 'ヘルプ追加'}
            </h2>
            <form onSubmit={saveHelp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ヘルプ先店舗
                </label>
                <select
                  value={helpForm.to_store_id}
                  onChange={(e) => setHelpForm({ ...helpForm, to_store_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">選択してください</option>
                  {otherStores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所属店舗からの減算 (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={helpForm.deduction_percent || ''}
                  placeholder="0"
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setHelpForm({
                      ...helpForm,
                      deduction_percent: value,
                      addition_percent: value // 連動して加算も同じ値に
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ヘルプ先への加算 (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={helpForm.addition_percent || ''}
                  placeholder="0"
                  onChange={(e) =>
                    setHelpForm({ ...helpForm, addition_percent: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md placeholder-gray-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingHelpId ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
