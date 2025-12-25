'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/', label: '売上予測', shortLabel: '予測' },
  { href: '/stores', label: '店舗管理', shortLabel: '店舗' },
  { href: '/staff', label: 'スタッフ管理', shortLabel: 'スタッフ' },
  { href: '/attendance', label: 'ヘルプ入力', shortLabel: '入力' },
  { href: '/help-list', label: 'ヘルプ一覧', shortLabel: '一覧' },
  { href: '/history', label: '予測履歴', shortLabel: '履歴' },
  { href: '/guide', label: '使い方', shortLabel: '使い方' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="text-lg sm:text-xl font-bold text-gray-900">
            売上予測
          </Link>

          {/* デスクトップメニュー */}
          <div className="hidden sm:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* モバイルハンバーガー */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="sm:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* モバイルメニュー */}
        {isOpen && (
          <div className="sm:hidden pb-3 border-t">
            <div className="grid grid-cols-3 gap-2 pt-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium text-center transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {item.shortLabel}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
