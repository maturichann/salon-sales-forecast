export type JobType = 'eyelist' | 'nailist'
export type StaffRank = 'J-1' | 'J-2' | 'J-3' | 'S-1' | 'S-2' | 'S-3' | 'M'
export type SeasonType = 'normal' | 'slow' | 'busy' | 'super_busy'

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          name: string
          store_id: string
          job_type: JobType
          rank: StaffRank
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          store_id: string
          job_type: JobType
          rank: StaffRank
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          store_id?: string
          job_type?: JobType
          rank?: StaffRank
          created_at?: string
        }
      }
      sales_standards: {
        Row: {
          id: string
          job_type: JobType
          rank: StaffRank
          season_type: SeasonType
          total: number
          treatment: number
          retail: number
          created_at: string
        }
        Insert: {
          id?: string
          job_type: JobType
          rank: StaffRank
          season_type: SeasonType
          total: number
          treatment: number
          retail: number
          created_at?: string
        }
        Update: {
          id?: string
          job_type?: JobType
          rank?: StaffRank
          season_type?: SeasonType
          total?: number
          treatment?: number
          retail?: number
          created_at?: string
        }
      }
      monthly_attendance: {
        Row: {
          id: string
          staff_id: string
          year: number
          month: number
          working_days: number
          created_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          year: number
          month: number
          working_days: number
          created_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          year?: number
          month?: number
          working_days?: number
          created_at?: string
        }
      }
      help_records: {
        Row: {
          id: string
          staff_id: string
          year: number
          month: number
          from_store_id: string
          to_store_id: string
          deduction_percent: number
          addition_percent: number
          created_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          year: number
          month: number
          from_store_id: string
          to_store_id: string
          deduction_percent: number
          addition_percent: number
          created_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          year?: number
          month?: number
          from_store_id?: string
          to_store_id?: string
          deduction_percent?: number
          addition_percent?: number
          created_at?: string
        }
      }
      forecast_history: {
        Row: {
          id: string
          year: number
          month: number
          store_id: string
          total_sales: number
          treatment_sales: number
          retail_sales: number
          created_at: string
        }
        Insert: {
          id?: string
          year: number
          month: number
          store_id: string
          total_sales: number
          treatment_sales: number
          retail_sales: number
          created_at?: string
        }
        Update: {
          id?: string
          year?: number
          month?: number
          store_id?: string
          total_sales?: number
          treatment_sales?: number
          retail_sales?: number
          created_at?: string
        }
      }
    }
  }
}

export type Store = Database['public']['Tables']['stores']['Row']
export type Staff = Database['public']['Tables']['staff']['Row']
export type SalesStandard = Database['public']['Tables']['sales_standards']['Row']
export type MonthlyAttendance = Database['public']['Tables']['monthly_attendance']['Row']
export type HelpRecord = Database['public']['Tables']['help_records']['Row']
export type ForecastHistory = Database['public']['Tables']['forecast_history']['Row']
