'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Store } from '@/types/database'

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [newStoreName, setNewStoreName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchStores = useCallback(async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching stores:', error)
    } else {
      setStores(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  async function addStore(e: React.FormEvent) {
    e.preventDefault()
    if (!newStoreName.trim()) return

    const { error } = await supabase
      .from('stores')
      .insert({ name: newStoreName.trim() })

    if (error) {
      console.error('Error adding store:', error)
      alert('店舗の追加に失敗しました')
    } else {
      setNewStoreName('')
      fetchStores()
    }
  }

  async function updateStore(id: string) {
    if (!editingName.trim()) return

    const { error } = await supabase
      .from('stores')
      .update({ name: editingName.trim() })
      .eq('id', id)

    if (error) {
      console.error('Error updating store:', error)
      alert('店舗の更新に失敗しました')
    } else {
      setEditingId(null)
      setEditingName('')
      fetchStores()
    }
  }

  async function deleteStore(id: string) {
    if (!confirm('この店舗を削除しますか？関連するスタッフやデータも削除されます。')) return

    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting store:', error)
      alert('店舗の削除に失敗しました')
    } else {
      fetchStores()
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">店舗管理</h1>

      <form onSubmit={addStore} className="mb-8 flex gap-2">
        <input
          type="text"
          value={newStoreName}
          onChange={(e) => setNewStoreName(e.target.value)}
          placeholder="新しい店舗名"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          追加
        </button>
      </form>

      <div className="bg-white rounded-lg shadow">
        {stores.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">店舗が登録されていません</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {stores.map((store) => (
              <li key={store.id} className="p-4 flex items-center justify-between">
                {editingId === store.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => updateStore(store.id)}
                      className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditingName('')
                      }}
                      className="px-4 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-500 text-sm"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-900">{store.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(store.id)
                          setEditingName(store.name)
                        }}
                        className="px-4 py-1 text-blue-600 hover:bg-blue-50 rounded-md text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => deleteStore(store.id)}
                        className="px-4 py-1 text-red-600 hover:bg-red-50 rounded-md text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
