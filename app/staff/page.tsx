'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Store, Staff, JobType, StaffRank, StaffLeave } from '@/types/database'
import { JOB_TYPES, STAFF_RANKS, getSeasonLabel } from '@/lib/constants'

type StaffWithStore = Staff & { stores: { name: string } }

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffWithStore[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [staffLeaves, setStaffLeaves] = useState<StaffLeave[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [filterStore, setFilterStore] = useState<string>('')
  const [filterJobType, setFilterJobType] = useState<string>('')

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 2 > 12 ? 1 : new Date().getMonth() + 2
  )

  const [formData, setFormData] = useState({
    name: '',
    store_id: '',
    job_type: 'eyelist' as JobType,
    rank: 'J-1' as StaffRank,
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchLeaveData()
  }, [selectedYear, selectedMonth])

  async function fetchData() {
    const [staffRes, storesRes] = await Promise.all([
      supabase
        .from('staff')
        .select('*, stores(name)')
        .order('store_id')
        .order('job_type')
        .order('rank'),
      supabase.from('stores').select('*').order('created_at'),
    ])

    if (staffRes.error) console.error('Error fetching staff:', staffRes.error)
    if (storesRes.error) console.error('Error fetching stores:', storesRes.error)

    setStaff((staffRes.data as StaffWithStore[]) || [])
    setStores(storesRes.data || [])
    setLoading(false)
  }

  async function fetchLeaveData() {
    const { data } = await supabase
      .from('staff_leaves')
      .select('*')
      .eq('year', selectedYear)
      .eq('month', selectedMonth)

    setStaffLeaves(data || [])
  }

  async function updateWorkRatio(staffId: string, workRatio: number) {
    const existingLeave = staffLeaves.find((l) => l.staff_id === staffId)

    if (workRatio === 1) {
      // 100%稼働の場合はレコードを削除
      if (existingLeave) {
        await supabase.from('staff_leaves').delete().eq('id', existingLeave.id)
      }
    } else if (existingLeave) {
      // 既存レコードを更新
      await supabase.from('staff_leaves').update({ work_ratio: workRatio }).eq('id', existingLeave.id)
    } else {
      // 新規レコードを追加
      await supabase.from('staff_leaves').insert({
        staff_id: staffId,
        year: selectedYear,
        month: selectedMonth,
        work_ratio: workRatio,
      })
    }

    fetchLeaveData()
  }

  function openModal(staffMember?: Staff) {
    if (staffMember) {
      setEditingStaff(staffMember)
      setFormData({
        name: staffMember.name,
        store_id: staffMember.store_id,
        job_type: staffMember.job_type,
        rank: staffMember.rank,
      })
    } else {
      setEditingStaff(null)
      setFormData({
        name: '',
        store_id: stores[0]?.id || '',
        job_type: 'eyelist',
        rank: 'J-1',
      })
    }
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim() || !formData.store_id) return

    if (editingStaff) {
      const { error } = await supabase
        .from('staff')
        .update(formData)
        .eq('id', editingStaff.id)

      if (error) {
        console.error('Error updating staff:', error)
        alert('スタッフの更新に失敗しました')
        return
      }
    } else {
      const { error } = await supabase.from('staff').insert(formData)

      if (error) {
        console.error('Error adding staff:', error)
        alert('スタッフの追加に失敗しました')
        return
      }
    }

    setShowModal(false)
    fetchData()
  }

  async function deleteStaff(id: string) {
    if (!confirm('このスタッフを削除しますか？')) return

    const { error } = await supabase.from('staff').delete().eq('id', id)

    if (error) {
      console.error('Error deleting staff:', error)
      alert('スタッフの削除に失敗しました')
    } else {
      fetchData()
    }
  }

  const filteredStaff = staff.filter((s) => {
    if (filterStore && s.store_id !== filterStore) return false
    if (filterJobType && s.job_type !== filterJobType) return false
    return true
  })

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">スタッフ管理</h1>
        <button
          onClick={() => openModal()}
          className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          disabled={stores.length === 0}
        >
          追加
        </button>
      </div>

      {stores.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-yellow-800">先に店舗を登録してください</p>
        </div>
      )}

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
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value)}
            className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">全店舗</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <select
            value={filterJobType}
            onChange={(e) => setFilterJobType(e.target.value)}
            className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">全職種</option>
            {JOB_TYPES.map((job) => (
              <option key={job.value} value={job.value}>
                {job.label}
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
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">名前</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">店舗</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">職種</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-600">
                  稼働率
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                    スタッフが登録されていません
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => {
                  const leaveRecord = staffLeaves.find((l) => l.staff_id === s.id)
                  const workRatio = leaveRecord ? leaveRecord.work_ratio : 1
                  return (
                    <tr key={s.id} className={`hover:bg-gray-50 ${workRatio < 1 ? 'bg-gray-100' : ''}`}>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{s.name}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{s.stores.name}</td>
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
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <select
                          value={workRatio}
                          onChange={(e) => updateWorkRatio(s.id, Number(e.target.value))}
                          className={`px-1 sm:px-2 py-1 border rounded text-xs sm:text-sm ${
                            workRatio === 0
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : workRatio < 1
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                              : 'bg-green-100 text-green-700 border-green-300'
                          }`}
                        >
                          {[...Array(21)].map((_, i) => {
                            const value = (100 - i * 5) / 100
                            return (
                              <option key={value} value={value}>
                                {value === 0 ? '休職' : `${Math.round(value * 100)}%`}
                              </option>
                            )
                          })}
                        </select>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                        <button
                          onClick={() => openModal(s)}
                          className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs sm:text-sm mr-1"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => deleteStaff(s.id)}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs sm:text-sm"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? 'スタッフ編集' : 'スタッフ追加'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">店舗</label>
                <select
                  value={formData.store_id}
                  onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">選択してください</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">職種</label>
                <select
                  value={formData.job_type}
                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value as JobType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {JOB_TYPES.map((job) => (
                    <option key={job.value} value={job.value}>
                      {job.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ランク</label>
                <select
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value as StaffRank })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STAFF_RANKS.map((rank) => (
                    <option key={rank.value} value={rank.value}>
                      {rank.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingStaff ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
