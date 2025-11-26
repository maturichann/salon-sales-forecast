import { Staff, SalesStandard, HelpRecord, StaffLeave } from '@/types/database'
import { getSeasonType } from './constants'

export interface StaffForecast {
  staffId: string
  staffName: string
  jobType: string
  rank: string
  baseSales: {
    total: number
    treatment: number
    retail: number
  }
  adjustedSales: {
    total: number
    treatment: number
    retail: number
  }
  helpDeductions: number
  helpAdditions: number
  isOnLeave: boolean
}

export interface StoreForecast {
  storeId: string
  storeName: string
  staffForecasts: StaffForecast[]
  totalSales: {
    total: number
    treatment: number
    retail: number
  }
  helpReceived: {
    total: number
    treatment: number
    retail: number
  }
  finalSales: {
    total: number
    treatment: number
    retail: number
  }
}

export function calculateForecast(
  stores: { id: string; name: string }[],
  allStaff: Staff[],
  salesStandards: SalesStandard[],
  helpRecords: HelpRecord[],
  staffLeaves: StaffLeave[],
  month: number,
  isFukubukuroYear: boolean = false
): StoreForecast[] {
  const seasonType = getSeasonType(month)
  const results: StoreForecast[] = []

  // 休職中のスタッフIDセット
  const leaveStaffIds = new Set(staffLeaves.map(l => l.staff_id))

  // 各店舗のヘルプ受入分を集計するためのマップ
  const helpAdditionsMap: Map<string, { total: number; treatment: number; retail: number }> = new Map()

  for (const store of stores) {
    const storeStaff = allStaff.filter((s) => s.store_id === store.id)
    const staffForecasts: StaffForecast[] = []

    let storeTotalTreatment = 0
    let storeTotalRetail = 0

    for (const staff of storeStaff) {
      const isOnLeave = leaveStaffIds.has(staff.id)

      // 基準売上を取得（出勤日数に関係なく固定）
      const standard = salesStandards.find(
        (s) => s.job_type === staff.job_type && s.rank === staff.rank && s.season_type === seasonType
      )

      if (!standard) continue

      // 休職中の場合は売上0
      if (isOnLeave) {
        staffForecasts.push({
          staffId: staff.id,
          staffName: staff.name,
          jobType: staff.job_type,
          rank: staff.rank,
          baseSales: { total: 0, treatment: 0, retail: 0 },
          adjustedSales: { total: 0, treatment: 0, retail: 0 },
          helpDeductions: 0,
          helpAdditions: 0,
          isOnLeave: true,
        })
        continue
      }

      // 基準売上（固定金額）
      const baseTreatment = standard.treatment
      // 福袋実施年は物販2倍
      const baseRetail = isFukubukuroYear ? standard.retail * 2 : standard.retail
      const baseTotal = baseTreatment + baseRetail

      // ヘルプによる減算を計算
      const staffHelps = helpRecords.filter((h) => h.staff_id === staff.id)
      let totalDeductionPercent = 0
      for (const help of staffHelps) {
        totalDeductionPercent += help.deduction_percent

        // ヘルプ先への加算を集計
        const additionTreatment = Math.round(baseTreatment * (help.addition_percent / 100))
        const additionRetail = Math.round(baseRetail * (help.addition_percent / 100))
        const additionTotal = additionTreatment + additionRetail

        const existing = helpAdditionsMap.get(help.to_store_id) || { total: 0, treatment: 0, retail: 0 }
        helpAdditionsMap.set(help.to_store_id, {
          total: existing.total + additionTotal,
          treatment: existing.treatment + additionTreatment,
          retail: existing.retail + additionRetail,
        })
      }

      // 減算後の売上
      const deductionRatio = 1 - totalDeductionPercent / 100
      const adjustedTreatment = Math.round(baseTreatment * deductionRatio)
      const adjustedRetail = Math.round(baseRetail * deductionRatio)
      const adjustedTotal = adjustedTreatment + adjustedRetail

      staffForecasts.push({
        staffId: staff.id,
        staffName: staff.name,
        jobType: staff.job_type,
        rank: staff.rank,
        baseSales: {
          total: baseTotal,
          treatment: baseTreatment,
          retail: baseRetail,
        },
        adjustedSales: {
          total: adjustedTotal,
          treatment: adjustedTreatment,
          retail: adjustedRetail,
        },
        helpDeductions: totalDeductionPercent,
        helpAdditions: 0,
        isOnLeave: false,
      })

      storeTotalTreatment += adjustedTreatment
      storeTotalRetail += adjustedRetail
    }

    results.push({
      storeId: store.id,
      storeName: store.name,
      staffForecasts,
      totalSales: {
        total: storeTotalTreatment + storeTotalRetail,
        treatment: storeTotalTreatment,
        retail: storeTotalRetail,
      },
      helpReceived: { total: 0, treatment: 0, retail: 0 },
      finalSales: {
        total: storeTotalTreatment + storeTotalRetail,
        treatment: storeTotalTreatment,
        retail: storeTotalRetail,
      },
    })
  }

  // ヘルプ受入分を各店舗に反映
  for (const result of results) {
    const helpReceived = helpAdditionsMap.get(result.storeId) || { total: 0, treatment: 0, retail: 0 }
    result.helpReceived = helpReceived
    result.finalSales = {
      total: result.totalSales.total + helpReceived.total,
      treatment: result.totalSales.treatment + helpReceived.treatment,
      retail: result.totalSales.retail + helpReceived.retail,
    }
  }

  return results
}
