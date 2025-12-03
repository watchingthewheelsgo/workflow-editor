import type { StrategyPluginDetail } from '@/app/components/plugins/types'
import { get } from './base'

export const fetchStrategyList = () => {
  console.warn('[Mock] Strategy list disabled in standalone mode')
  return Promise.resolve([] as StrategyPluginDetail[])
}

export const fetchStrategyDetail = (agentProvider: string) => {
  console.warn('[Mock] Strategy detail disabled in standalone mode')
  return Promise.resolve({} as StrategyPluginDetail)
}
