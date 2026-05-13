import { onMounted } from 'vue'
import { useRateStore } from '@/stores/rate'
import { getRateData, getPolicyList } from '@/cloud'

const mockLprData = {
  standardrate: 3.5,
  gjjrate: 2.6,
  gjj_2_rate: 3.075,
  year: '2026年4月',
  lprTimeStr: '2026年4月最新LPR',
  gjjTimeStr: '2026年4月公积金利率'
}

const mockNewData = [
  { id: 1, title: '2026年最新LPR利率下调', url: '', sort: 1 },
  { id: 2, title: '公积金贷款政策调整', url: '', sort: 2 },
  { id: 3, title: '房贷还款技巧分享', url: '', sort: 3 }
]

const parsePercentToNumber = (value) => {
  if (typeof value === 'string' && value.includes('%')) {
    return parseFloat(value.replace('%', ''))
  }
  return parseFloat(value) || 0
}

export function useRateData() {
  const rateStore = useRateStore()

  const loadRateData = async () => {
    try {
      const rateData = await getRateData()
      if (rateData) {
        rateStore.setLprList({
          standardrate: rateData.standardrate || parsePercentToNumber(rateData.fiveyearlpr || rateData.oneyearlpr),
          gjjrate: rateData.gjjrate || parsePercentToNumber(rateData.gjjlpr),
          gjj_2_rate: rateData.gjj_2_rate,
          year: rateData.timestr || '未知时间',
          lprTimeStr: rateData.timestr || '',
          gjjTimeStr: rateData.gjjtimestr || ''
        })
      } else {
        rateStore.setLprList(mockLprData)
      }

      const policyData = await getPolicyList()
      if (policyData && policyData.length > 0) {
        rateStore.setNewList(policyData)
      } else {
        rateStore.setNewList(mockNewData)
      }
    } catch (error) {
      console.error('加载云开发数据失败:', error)
      rateStore.setLprList(mockLprData)
      rateStore.setNewList(mockNewData)
    }
  }

  onMounted(() => {
    loadRateData()
  })

  return {
    loadRateData
  }
}
