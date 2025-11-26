export const JOB_TYPES = [
  { value: 'eyelist', label: 'アイリスト' },
  { value: 'nailist', label: 'ネイリスト' },
] as const

export const STAFF_RANKS = [
  { value: 'J-1', label: 'J-1' },
  { value: 'J-2', label: 'J-2' },
  { value: 'J-3', label: 'J-3' },
  { value: 'S-1', label: 'S-1' },
  { value: 'S-2', label: 'S-2' },
  { value: 'S-3', label: 'S-3' },
  { value: 'M', label: 'M' },
] as const

export const SEASON_TYPES: {
  value: 'normal' | 'slow' | 'busy' | 'super_busy'
  label: string
  months: number[]
  rate: number
}[] = [
  { value: 'normal', label: '通常期', months: [1, 3, 4, 9, 10, 11], rate: 100 },
  { value: 'slow', label: '閑散期', months: [2, 5, 6], rate: 98 },
  { value: 'busy', label: '繁忙期', months: [7, 8], rate: 106 },
  { value: 'super_busy', label: '超繁忙期', months: [12], rate: 110 },
]

export function getSeasonType(month: number): 'normal' | 'slow' | 'busy' | 'super_busy' {
  const season = SEASON_TYPES.find(s => s.months.includes(month))
  return season?.value || 'normal'
}

export function getSeasonLabel(month: number): string {
  const season = SEASON_TYPES.find(s => s.months.includes(month))
  return season?.label || '通常期'
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value)
}
