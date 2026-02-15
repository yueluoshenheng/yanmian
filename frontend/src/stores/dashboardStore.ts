import { create } from 'zustand'
import { apiFetch } from '../services/api'

export interface DashboardData {
  line_status?: {
    running: number; warning: number; stopped: number
    lines: Array<{ line_number: string; line_name: string; status: string }>
  }
  alerts?: Array<{ equipment: string; line: string; issue: string; severity: string }>
  alerts_7d?: Array<{ date: string; count: number }>
  today_shipping?: { orders: number; cubic_volume: number; amount: number }
  shipping_7d?: Array<{ date: string; volume: number; amount: number }>
  knowledge_updates: { recent_count: number; last_update: string }
}

interface DashboardState {
  data: DashboardData | null
  loading: boolean
  fetchDashboard: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  data: null,
  loading: false,

  fetchDashboard: async () => {
    set({ loading: true })
    try {
      const res = await apiFetch('/api/dashboard')
      if (!res.ok) throw new Error('获取仪表盘数据失败')
      const data = await res.json()
      set({ data, loading: false })
    } catch {
      set({ loading: false })
    }
  },
}))
