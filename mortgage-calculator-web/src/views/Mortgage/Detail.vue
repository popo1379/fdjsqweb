<template>
  <div class="detail-page">
    <div class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <span class="title">计算结果</span>
    </div>

    <div v-if="result" class="content">
      <!-- Tab切换 -->
      <div class="tab-container">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'ai' }"
          @click="activeTab = 'ai'"
        >
          等额本息
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'ap' }"
          @click="activeTab = 'ap'"
        >
          等额本金
        </div>
      </div>

      <!-- 等额本息内容 -->
      <div v-if="activeTab === 'ai' && hasResult" class="tab-content">
        <!-- 基本信息 -->
        <div class="card">
          <div class="card-title">还款概览</div>
          <div class="result-summary">
            <div class="summary-item">
              <div class="label">每月月供</div>
              <div class="value primary">{{ formatMoney(monthlyPaymentAi) }} 元</div>
            </div>
            <div class="summary-item">
              <div class="label">还款期数</div>
              <div class="value">{{ result.years * 12 }} 期</div>
            </div>
            <div class="summary-item">
              <div class="label">总利息</div>
              <div class="value warning">{{ formatMoney(totalInterestAi) }} 元</div>
            </div>
            <div class="summary-item">
              <div class="label">还款总额</div>
              <div class="value">{{ formatMoney(totalRepayAi) }} 元</div>
            </div>
          </div>
          <!-- 利率信息 -->
          <div class="rate-info-section">
            <div v-if="result.commercialResult" class="rate-info-item">
              <span class="rate-label">商业贷款利率：</span>
              <span class="rate-value">{{ commercialRateInfo.rate }}%</span>
              <span class="rate-time">({{ commercialRateInfo.timeStr }})</span>
            </div>
            <div v-if="result.gjjResult" class="rate-info-item">
              <span class="rate-label">公积金利率：</span>
              <span class="rate-value">{{ fundRateInfo.rate }}%</span>
              <span class="rate-time">({{ fundRateInfo.timeStr }})</span>
            </div>
          </div>
        </div>

        <!-- 本金利息占比 -->
        <div class="card">
          <div class="card-title">本金利息占比</div>
          <div class="ratio-section">
            <div class="ratio-bar">
              <div class="ratio-principal" :style="{ width: principalRatioAi + '%' }">
                <span>本金 {{ principalRatioAi.toFixed(1) }}%</span>
              </div>
              <div class="ratio-interest" :style="{ width: interestRatioAi + '%' }">
                <span>利息 {{ interestRatioAi.toFixed(1) }}%</span>
              </div>
            </div>
            <div class="ratio-details">
              <div class="ratio-item">
                <span class="dot principal"></span>
                <span>本金：{{ formatMoney(loanAmount) }} 元</span>
              </div>
              <div class="ratio-item">
                <span class="dot interest"></span>
                <span>利息：{{ formatMoney(totalInterestAi) }} 元</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 还款计划图 -->
        <div class="card">
          <div class="card-title">还款计划图</div>
          <div class="chart-container">
            <div ref="chartAiRef" class="chart"></div>
          </div>
        </div>

        <!-- 还款明细 -->
        <div class="card">
          <div class="card-title">还款明细</div>
          <div class="table-container">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>期数</th>
                  <th>月供</th>
                  <th>本金</th>
                  <th>利息</th>
                  <th>剩余本金</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in displayDetailAi" :key="index">
                  <td>第{{ index + 1 }}期</td>
                  <td>{{ item.totalRepay }}元</td>
                  <td>{{ item.principal }}元</td>
                  <td>{{ item.interest }}元</td>
                  <td>{{ item.balance }}元</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button v-if="repaymentDetailAi.length > 24" class="expand-btn" @click="toggleShowAllAi">
            {{ showAllDetailAi ? '收起明细' : '展开全部 ' + repaymentDetailAi.length + ' 期' }}
          </button>
        </div>
      </div>

      <!-- 等额本金内容 -->
      <div v-if="activeTab === 'ap' && hasResult" class="tab-content">
        <!-- 基本信息 -->
        <div class="card">
          <div class="card-title">还款概览</div>
          <div class="result-summary">
            <div class="summary-item">
              <div class="label">首月还款</div>
              <div class="value primary">{{ formatMoney(firstMonthPayment) }} 元</div>
            </div>
            <div class="summary-item">
              <div class="label">每月递减</div>
              <div class="value">{{ formatMoney(decreasePerMonth) }} 元</div>
            </div>
            <div class="summary-item">
              <div class="label">总利息</div>
              <div class="value warning">{{ formatMoney(totalInterestAp) }} 元</div>
            </div>
            <div class="summary-item">
              <div class="label">还款总额</div>
              <div class="value">{{ formatMoney(totalRepayAp) }} 元</div>
            </div>
          </div>
          <!-- 利率信息 -->
          <div class="rate-info-section">
            <div v-if="result.commercialResult" class="rate-info-item">
              <span class="rate-label">商业贷款利率：</span>
              <span class="rate-value">{{ commercialRateInfo.rate }}%</span>
              <span class="rate-time">({{ commercialRateInfo.timeStr }})</span>
            </div>
            <div v-if="result.gjjResult" class="rate-info-item">
              <span class="rate-label">公积金利率：</span>
              <span class="rate-value">{{ fundRateInfo.rate }}%</span>
              <span class="rate-time">({{ fundRateInfo.timeStr }})</span>
            </div>
          </div>
        </div>

        <!-- 本金利息占比 -->
        <div class="card">
          <div class="card-title">本金利息占比</div>
          <div class="ratio-section">
            <div class="ratio-bar">
              <div class="ratio-principal" :style="{ width: principalRatioAp + '%' }">
                <span>本金 {{ principalRatioAp.toFixed(1) }}%</span>
              </div>
              <div class="ratio-interest" :style="{ width: interestRatioAp + '%' }">
                <span>利息 {{ interestRatioAp.toFixed(1) }}%</span>
              </div>
            </div>
            <div class="ratio-details">
              <div class="ratio-item">
                <span class="dot principal"></span>
                <span>本金：{{ formatMoney(loanAmount) }} 元</span>
              </div>
              <div class="ratio-item">
                <span class="dot interest"></span>
                <span>利息：{{ formatMoney(totalInterestAp) }} 元</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 还款计划图 -->
        <div class="card">
          <div class="card-title">还款计划图</div>
          <div class="chart-container">
            <div ref="chartApRef" class="chart"></div>
          </div>
        </div>

        <!-- 还款明细 -->
        <div class="card">
          <div class="card-title">还款明细</div>
          <div class="table-container">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>期数</th>
                  <th>月供</th>
                  <th>本金</th>
                  <th>利息</th>
                  <th>剩余本金</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in displayDetailAp" :key="index">
                  <td>第{{ index + 1 }}期</td>
                  <td>{{ item.totalRepay }}元</td>
                  <td>{{ item.principal }}元</td>
                  <td>{{ item.interest }}元</td>
                  <td>{{ item.balance }}元</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button v-if="repaymentDetailAp.length > 24" class="expand-btn" @click="toggleShowAllAp">
            {{ showAllDetailAp ? '收起明细' : '展开全部 ' + repaymentDetailAp.length + ' 期' }}
          </button>
        </div>
      </div>

      <!-- 两种方式对比 -->
      <div class="card comparison-card">
        <div class="card-title">两种方式对比</div>
        <div class="compare-result">
          <div class="compare-item">
            <span>利息差额</span>
            <span class="highlight">等额本金比等额本息少付 {{ formatMoney(interestDiff) }} 元</span>
          </div>
          <div class="compare-tip">
            💡 提示：等额本金前期还款压力较大，但总利息支出更少
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <div>暂无数据，请先计算</div>
      <button class="btn btn-primary" @click="goBack">返回计算</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { formatMoney } from '@/utils/format'
import { useRateStore } from '@/stores/rate'
import * as echarts from 'echarts'

const router = useRouter()
const route = useRoute()
const rateStore = useRateStore()

const result = ref(null)
const activeTab = ref('ai')
const chartAiRef = ref(null)
const chartApRef = ref(null)
const showAllDetailAi = ref(false)
const showAllDetailAp = ref(false)
let chartAi = null
let chartAp = null

// 商业贷款利率信息
const commercialRateInfo = computed(() => {
  return {
    rate: result.value?.rates || 0,
    timeStr: rateStore.lprList.lprTimeStr || '自定义利率'
  }
})

// 公积金贷款利率信息
const fundRateInfo = computed(() => {
  return {
    rate: result.value?.fundrates || 0,
    timeStr: rateStore.lprList.gjjTimeStr || '自定义利率'
  }
})

onMounted(() => {
  const data = route.query.data
  if (data) {
    try {
      result.value = JSON.parse(decodeURIComponent(atob(data)))
      console.log('接收到的结果数据:', result.value)
      nextTick(() => {
        initCharts()
      })
    } catch (e) {
      console.error('解析数据失败:', e)
    }
  }
})

watch(activeTab, (newTab, oldTab) => {
  nextTick(() => {
    if (newTab === 'ai') {
      if (chartAiRef.value) {
        if (!chartAi) {
          initChartAi()
        } else {
          chartAi.resize()
        }
      }
    } else {
      if (chartApRef.value) {
        if (!chartAp) {
          initChartAp()
        } else {
          chartAp.resize()
        }
      }
    }
  })
})

// 是否有计算结果
const hasResult = computed(() => {
  return result.value?.commercialResult || result.value?.gjjResult
})

// 贷款总额
const loanAmount = computed(() => {
  const res = result.value
  if (!res) return 0
  let total = 0
  if (res.commercialResult?.loanTotal) {
    total += parseFloat(res.commercialResult.loanTotal)
  }
  if (res.gjjResult?.loanTotal) {
    total += parseFloat(res.gjjResult.loanTotal)
  }
  return total
})

// 等额本息数据
const monthlyPaymentAi = computed(() => {
  let total = 0
  const res = result.value
  if (res?.commercialResult?.repayPerMouAi) {
    total += parseFloat(res.commercialResult.repayPerMouAi)
  }
  if (res?.gjjResult?.repayPerMouAi) {
    total += parseFloat(res.gjjResult.repayPerMouAi)
  }
  return total
})

const totalInterestAi = computed(() => {
  let total = 0
  const res = result.value
  if (res?.commercialResult?.totalInterestAi) {
    total += parseFloat(res.commercialResult.totalInterestAi)
  }
  if (res?.gjjResult?.totalInterestAi) {
    total += parseFloat(res.gjjResult.totalInterestAi)
  }
  return total
})

const totalRepayAi = computed(() => {
  let total = 0
  const res = result.value
  if (res?.commercialResult?.totalRepayAi) {
    total += parseFloat(res.commercialResult.totalRepayAi)
  }
  if (res?.gjjResult?.totalRepayAi) {
    total += parseFloat(res.gjjResult.totalRepayAi)
  }
  return total
})

// 等额本金数据
const firstMonthPayment = computed(() => {
  let total = 0
  const res = result.value
  if (res?.commercialResult?.repayPerMouthAp) {
    total += parseFloat(res.commercialResult.repayPerMouthAp)
  }
  if (res?.gjjResult?.repayPerMouthAp) {
    total += parseFloat(res.gjjResult.repayPerMouthAp)
  }
  return total
})

const decreasePerMonth = computed(() => {
  let total = 0
  const res = result.value
  if (res?.commercialResult?.decreasePerMouAp) {
    total += parseFloat(res.commercialResult.decreasePerMouAp)
  }
  if (res?.gjjResult?.decreasePerMouAp) {
    total += parseFloat(res.gjjResult.decreasePerMouAp)
  }
  return total
})

const totalInterestAp = computed(() => {
  let total = 0
  const res = result.value
  if (res?.commercialResult?.totalInterestAp) {
    total += parseFloat(res.commercialResult.totalInterestAp)
  }
  if (res?.gjjResult?.totalInterestAp) {
    total += parseFloat(res.gjjResult.totalInterestAp)
  }
  return total
})

const totalRepayAp = computed(() => {
  let total = 0
  const res = result.value
  if (res?.commercialResult?.totalRepayPriceAp) {
    total += parseFloat(res.commercialResult.totalRepayPriceAp)
  }
  if (res?.gjjResult?.totalRepayPriceAp) {
    total += parseFloat(res.gjjResult.totalRepayPriceAp)
  }
  return total
})

// 利息差
const interestDiff = computed(() => totalInterestAi.value - totalInterestAp.value)

// 本金利息占比（等额本息）
const principalRatioAi = computed(() => {
  const total = totalRepayAi.value
  return total > 0 ? (loanAmount.value / total) * 100 : 0
})

const interestRatioAi = computed(() => {
  const total = totalRepayAi.value
  return total > 0 ? (totalInterestAi.value / total) * 100 : 0
})

// 本金利息占比（等额本金）
const principalRatioAp = computed(() => {
  const total = totalRepayAp.value
  return total > 0 ? (loanAmount.value / total) * 100 : 0
})

const interestRatioAp = computed(() => {
  const total = totalRepayAp.value
  return total > 0 ? (totalInterestAp.value / total) * 100 : 0
})

// 等额本息还款明细
const repaymentDetailAi = computed(() => {
  const res = result.value
  if (!res) return []

  let principalArr = []
  let interestArr = []
  let balanceArr = []

  if (res.commercialResult?.repayPerMouObjAi) {
    const ai = res.commercialResult.repayPerMouObjAi
    principalArr = ai.repayPrincipalPerMouArrAi || []
    interestArr = ai.repayInterestPerMouArrAi || []
    balanceArr = ai.balanceArrAi || []
  }

  if (res.gjjResult?.repayPerMouObjAi) {
    const gi = res.gjjResult.repayPerMouObjAi
    gi.repayPrincipalPerMouArrAi?.forEach((v, i) => {
      principalArr[i] = (parseFloat(principalArr[i] || 0) + parseFloat(v)).toFixed(2)
    })
    gi.repayInterestPerMouArrAi?.forEach((v, i) => {
      interestArr[i] = (parseFloat(interestArr[i] || 0) + parseFloat(v)).toFixed(2)
    })
    gi.balanceArrAi?.forEach((v, i) => {
      balanceArr[i] = (parseFloat(balanceArr[i] || 0) + parseFloat(v)).toFixed(2)
    })
  }

  return principalArr.map((p, i) => ({
    principal: p,
    interest: interestArr[i] || '0.00',
    balance: balanceArr[i] || '0.00',
    totalRepay: (parseFloat(p) + parseFloat(interestArr[i] || 0)).toFixed(2)
  }))
})

// 等额本息还款明细（显示用）
const displayDetailAi = computed(() => {
  return showAllDetailAi.value
    ? repaymentDetailAi.value
    : repaymentDetailAi.value.slice(0, 24)
})

// 等额本金还款明细
const repaymentDetailAp = computed(() => {
  const res = result.value
  if (!res) return []

  let repayArr = []
  let interestArr = []
  let balanceArr = []

  if (res.commercialResult?.repayPerMouObjAp) {
    const ap = res.commercialResult.repayPerMouObjAp
    repayArr = ap.repayPerMouPriceArrAp || []
    interestArr = ap.repayInterestPerMouArrAp || []
    balanceArr = ap.balanceArrAp || []
  }

  if (res.gjjResult?.repayPerMouObjAp) {
    const gp = res.gjjResult.repayPerMouObjAp
    gp.repayPerMouPriceArrAp?.forEach((v, i) => {
      repayArr[i] = (parseFloat(repayArr[i] || 0) + parseFloat(v)).toFixed(2)
    })
    gp.repayInterestPerMouArrAp?.forEach((v, i) => {
      interestArr[i] = (parseFloat(interestArr[i] || 0) + parseFloat(v)).toFixed(2)
    })
    gp.balanceArrAp?.forEach((v, i) => {
      balanceArr[i] = (parseFloat(balanceArr[i] || 0) + parseFloat(v)).toFixed(2)
    })
  }

  return repayArr.map((total, i) => {
    const principal = i === 0 ? (parseFloat(repayArr[0]) - parseFloat(interestArr[0])) : (parseFloat(repayArr[0]) - parseFloat(repayArr[1]) + parseFloat(repayArr[0]) - parseFloat(interestArr[0]))
    return {
      principal: principal.toFixed(2),
      interest: interestArr[i] || '0.00',
      balance: balanceArr[i] || '0.00',
      totalRepay: total
    }
  })
})

// 等额本金还款明细（显示用）
const displayDetailAp = computed(() => {
  return showAllDetailAp.value
    ? repaymentDetailAp.value
    : repaymentDetailAp.value.slice(0, 24)
})

// 切换显示全部明细
const toggleShowAllAi = () => {
  showAllDetailAi.value = !showAllDetailAi.value
}

const toggleShowAllAp = () => {
  showAllDetailAp.value = !showAllDetailAp.value
}

// 初始化图表
const initCharts = () => {
  initChartAi()
  initChartAp()
}

const initChartAi = () => {
  if (!chartAiRef.value || !result.value) return
  chartAi = echarts.init(chartAiRef.value)
  const aiData = prepareChartData('ai')
  chartAi.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['本金', '利息'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: aiData.xAxisData,
      name: '期数',
      axisLabel: {
        interval: Math.floor(aiData.xAxisData.length / 10),
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '金额(元)',
      axisLabel: {
        formatter: (value) => {
          if (value >= 10000) return (value / 10000).toFixed(1) + '万'
          return value
        }
      }
    },
    series: [
      {
        name: '本金',
        type: 'bar',
        stack: '总量',
        itemStyle: { color: '#1678ff' },
        data: aiData.principalData
      },
      {
        name: '利息',
        type: 'bar',
        stack: '总量',
        itemStyle: { color: '#ff6b6b' },
        data: aiData.interestData
      }
    ]
  })
}

const initChartAp = () => {
  if (!chartApRef.value || !result.value) return
  chartAp = echarts.init(chartApRef.value)
  const apData = prepareChartData('ap')
  chartAp.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['本金', '利息'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: apData.xAxisData,
      name: '期数',
      axisLabel: {
        interval: Math.floor(apData.xAxisData.length / 10),
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '金额(元)',
      axisLabel: {
        formatter: (value) => {
          if (value >= 10000) return (value / 10000).toFixed(1) + '万'
          return value
        }
      }
    },
    series: [
      {
        name: '本金',
        type: 'bar',
        stack: '总量',
        itemStyle: { color: '#1678ff' },
        data: apData.principalData
      },
      {
        name: '利息',
        type: 'bar',
        stack: '总量',
        itemStyle: { color: '#ff6b6b' },
        data: apData.interestData
      }
    ]
  })
}

const prepareChartData = (type) => {
  const res = result.value
  let principalArr = []
  let interestArr = []
  let totalArr = []
  
  if (type === 'ai') {
    if (res.commercialResult?.repayPerMouObjAi) {
      const ai = res.commercialResult.repayPerMouObjAi
      principalArr = ai.repayPrincipalPerMouArrAi || []
      interestArr = ai.repayInterestPerMouArrAi || []
      totalArr = ai.totalRepayPerMouArrAi || []
    }
    if (res.gjjResult?.repayPerMouObjAi) {
      const gi = res.gjjResult.repayPerMouObjAi
      gi.repayPrincipalPerMouArrAi?.forEach((v, i) => {
        principalArr[i] = (parseFloat(principalArr[i] || 0) + parseFloat(v)).toFixed(2)
      })
      gi.repayInterestPerMouArrAi?.forEach((v, i) => {
        interestArr[i] = (parseFloat(interestArr[i] || 0) + parseFloat(v)).toFixed(2)
      })
    }
  } else {
    if (res.commercialResult?.repayPerMouObjAp) {
      const ap = res.commercialResult.repayPerMouObjAp
      interestArr = ap.repayInterestPerMouArrAp || []
      totalArr = ap.repayPerMouPriceArrAp || []
    }
    if (res.gjjResult?.repayPerMouObjAp) {
      const gp = res.gjjResult.repayPerMouObjAp
      gp.repayInterestPerMouArrAp?.forEach((v, i) => {
        interestArr[i] = (parseFloat(interestArr[i] || 0) + parseFloat(v)).toFixed(2)
      })
      gp.repayPerMouPriceArrAp?.forEach((v, i) => {
        totalArr[i] = (parseFloat(totalArr[i] || 0) + parseFloat(v)).toFixed(2)
      })
    }
  }
  
  const xAxisData = totalArr.map((_, i) => i + 1)
  const principalData = type === 'ai' ? principalArr : totalArr.map((t, i) => (parseFloat(t) - parseFloat(interestArr[i] || 0)).toFixed(2))
  
  return {
    xAxisData,
    principalData,
    interestData: interestArr
  }
}

const goBack = () => {
  router.push('/mortgage')
}
</script>

<style scoped lang="scss">
.detail-page {
  min-height: 100vh;
  background-color: $bg-color;
}

.header {
  background: linear-gradient(135deg, $primary-color 0%, #4096ff 100%);
  padding: $spacing-md;
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.back-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: $font-size-lg;
  cursor: pointer;
}

.title {
  color: #fff;
  font-size: $font-size-lg;
  font-weight: 500;
}

.content {
  padding: $spacing-md;
}

.tab-container {
  display: flex;
  background-color: $bg-color-white;
  border-radius: $border-radius-md;
  padding: 4px;
  margin-bottom: $spacing-md;
  box-shadow: $box-shadow;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-sm;
  cursor: pointer;
  color: $text-color-secondary;
  transition: all 0.3s;
  font-weight: 500;

  &.active {
    background-color: $primary-color;
    color: #fff;
  }
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  background-color: $bg-color-white;
  border-radius: $border-radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  box-shadow: $box-shadow;
}

.card-title {
  font-size: $font-size-base;
  color: $text-color;
  margin-bottom: $spacing-md;
  font-weight: 500;
  border-left: 3px solid $primary-color;
  padding-left: $spacing-sm;
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.summary-item {
  text-align: center;
  padding: $spacing-sm;
  background-color: rgba(22, 120, 255, 0.03);
  border-radius: $border-radius-sm;
}

.summary-item .label {
  color: $text-color-secondary;
  font-size: $font-size-sm;
  margin-bottom: $spacing-xs;
}

.summary-item .value {
  font-size: $font-size-lg;
  font-weight: 500;
  color: $text-color;

  &.primary {
    color: $primary-color;
    font-size: 20px;
  }

  &.warning {
    color: $error-color;
  }
}

.ratio-section {
  padding: $spacing-sm 0;
}

.ratio-bar {
  display: flex;
  height: 32px;
  border-radius: $border-radius-sm;
  overflow: hidden;
  margin-bottom: $spacing-md;
}

.ratio-principal {
  background-color: $primary-color;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
  font-weight: 500;
  transition: width 0.3s ease;
  min-width: 0;
}

.ratio-interest {
  background-color: $error-color;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
  font-weight: 500;
  transition: width 0.3s ease;
  min-width: 0;
}

.ratio-details {
  display: flex;
  justify-content: center;
  gap: $spacing-lg;
}

.ratio-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: $text-color-secondary;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.principal {
    background-color: $primary-color;
  }

  &.interest {
    background-color: $error-color;
  }
}

.chart-container {
  width: 100%;
  margin-top: $spacing-sm;
}

.chart {
  width: 100%;
  height: 300px;
}

.table-container {
  overflow-x: auto;
  margin-top: $spacing-sm;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: $font-size-sm;

  th,
  td {
    padding: $spacing-sm;
    text-align: center;
    border: 1px solid $border-color;
    white-space: nowrap;
  }

  th {
    background-color: rgba(22, 120, 255, 0.05);
    color: $text-color;
    font-weight: 500;
  }

  tbody tr:hover {
    background-color: rgba(22, 120, 255, 0.02);
  }
}

.comparison-card {
  background: linear-gradient(135deg, rgba(22, 120, 255, 0.05) 0%, rgba(255, 107, 107, 0.05) 100%);
}

.compare-result {
  text-align: center;
}

.compare-item {
  margin-bottom: $spacing-md;
  font-size: $font-size-base;
}

.highlight {
  color: $primary-color;
  font-weight: 600;
  display: block;
  margin-top: $spacing-xs;
}

.compare-tip {
  font-size: $font-size-sm;
  color: $text-color-secondary;
  padding: $spacing-sm;
  background-color: rgba(22, 120, 255, 0.05);
  border-radius: $border-radius-sm;
}

.expand-btn {
  width: 100%;
  margin-top: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background-color: $primary-color;
  color: #fff;
  border: none;
  border-radius: $border-radius-sm;
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background-color: darken($primary-color, 10%);
  }
}

.empty {
  text-align: center;
  padding: $spacing-xl;
  color: $text-color-secondary;
}

.btn {
  margin-top: $spacing-lg;
  padding: $spacing-sm $spacing-xl;
  border: none;
  border-radius: $border-radius-md;
  font-size: $font-size-base;
  cursor: pointer;

  &.btn-primary {
    background-color: $primary-color;
    color: #fff;
  }
}

.rate-info-section {
  margin-top: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1px dashed $border-color;
}

.rate-info-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-sm;
  font-size: $font-size-sm;
  color: $text-color-secondary;

  &:last-child {
    margin-bottom: 0;
  }

  .rate-label {
    color: $text-color-secondary;
  }

  .rate-value {
    color: $primary-color;
    font-weight: 600;
  }

  .rate-time {
    color: $text-color-light;
    font-size: $font-size-sm;
  }
}

@media (max-width: 768px) {
  .result-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-table {
    font-size: 12px;
  }

  .detail-table th,
  .detail-table td {
    padding: 6px 4px;
  }
}
</style>
