export type DashboardMetric = {
  label: string
  value: string
  helper: string
  icon: string
}

export type DashboardAction = {
  label: string
  description: string
  icon: string
  to: string
  primary?: boolean
}

export type DashboardListItem = {
  id: string
  title: string
  meta: string
  amount: string
  status: 'piutang' | 'lunas' | 'bonus'
}

export type DashboardData = {
  isConfigured: boolean
  metrics: DashboardMetric[]
  urgentReceivables: DashboardListItem[]
  bonusCustomers: DashboardListItem[]
  setupMessage: string | null
}
