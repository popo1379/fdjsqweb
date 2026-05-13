<template>
  <div class="mortgage-page">
    <!-- 顶部导航/标签 -->
    <div class="header">
      <div class="tabs">
        <div
          v-for="(tab, index) in tabs"
          :key="index"
          class="tab-item"
          :class="{ active: activeIndex === index }"
          @click="handleTabClick(index)"
        >
          {{ tab }}
        </div>
      </div>
    </div>

    <div class="content">
      <!-- 贷款计算方式 -->
      <div class="card">
        <div class="card-title">贷款方式</div>
        <div class="radio-group">
          <div
            v-for="(item, index) in loansType"
            :key="index"
            class="radio-item"
            :class="{ active: loanIndex === index }"
            @click="handleLoanTypeChange(index)"
          >
            <span class="radio-dot"></span>
            <span>{{ item }}</span>
          </div>
        </div>
      </div>

      <!-- 金额输入 -->
      <div class="card">
        <div class="card-title">
          {{ activeIndex === 0 ? totalTitle : activeIndex === 1 ? gjjTotalTitle : '商业贷款金额' }}
        </div>
        <!-- 按房屋面积单价计算时：直接显示面积和单价 -->
        <div v-if="loanIndex === 2" class="input-row">
          <div class="input-group half">
            <input
              type="number"
              :value="houseArea"
              @input="handleHouseAreaChange($event.target.value)"
              placeholder="面积"
            />
            <span class="unit">㎡</span>
          </div>
          <div class="input-group half">
            <input
              type="number"
              :value="persqmPrice"
              @input="handlePersqmPriceChange($event.target.value)"
              placeholder="单价"
            />
            <span class="unit">元/㎡</span>
          </div>
        </div>
        <!-- 按房价总额或贷款总额计算时 -->
        <div v-else class="input-group">
          <input
            type="number"
            :value="commercialTotal"
            @input="handleCommercialTotalChange($event.target.value)"
            placeholder="请输入金额"
          />
          <span class="unit">万</span>
        </div>
        <!-- 按面积计算时显示总价预览 -->
        <div v-if="loanIndex === 2" class="house-price-preview">
          房价总额：{{ formatMoney(calculateHousePrice) }} 元
        </div>
      </div>

      <!-- 公积金贷款（组合贷时显示） -->
      <div v-if="activeIndex === 2" class="card">
        <div class="card-title">公积金贷款金额</div>
        <div class="input-group">
          <input
            type="number"
            :value="gjjTotal"
            @input="handleGjjTotalChange($event.target.value)"
            placeholder="请输入金额"
          />
          <span class="unit">万</span>
        </div>
      </div>

      <!-- 贷款成数（按房价计算时显示） -->
      <div v-if="loanIndex !== 1" class="card">
        <div class="card-title">贷款成数</div>
        <select :value="percentIndex" @change="handlePercentChange($event.target.value)">
          <option v-for="(item, index) in percentArrName" :key="index" :value="index">
            {{ item }}
          </option>
        </select>
      </div>

      <!-- 利率设置 -->
      <div class="card">
        <!-- 商业贷款利率（商业贷和组合贷时显示） -->
        <div v-if="activeIndex !== 1" class="rate-section">
          <div class="card-title">
            商业贷款利率
            <span class="rate-time" v-if="rateStore.lprList.lprTimeStr">{{ rateStore.lprList.lprTimeStr }}</span>
          </div>
          <div class="input-group">
            <input
              type="number"
              step="0.01"
              :value="rates"
              @input="handleRatesChange($event.target.value)"
              placeholder="请输入利率"
            />
            <span class="unit">%</span>
          </div>
          <div class="rate-quick-select">
            <div
              v-for="item in presetCommercialRates"
              :key="item.rate"
              class="rate-btn"
              :class="{ active: rates === item.rate }"
              @click="selectRate(item.rate)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>

        <!-- 公积金贷款利率（公积金贷和组合贷时显示） -->
        <div v-if="activeIndex !== 0" class="rate-section">
          <div class="card-title">
            公积金贷款利率
            <span class="rate-time" v-if="rateStore.lprList.gjjTimeStr">{{ rateStore.lprList.gjjTimeStr }}</span>
          </div>
          <div class="input-group">
            <input
              type="number"
              step="0.01"
              :value="fundrates"
              @input="handleFundratesChange($event.target.value)"
              placeholder="请输入利率"
            />
            <span class="unit">%</span>
          </div>
          <div class="rate-quick-select">
            <div
              v-for="item in presetFundRates"
              :key="item.rate"
              class="rate-btn"
              :class="{ active: fundrates === item.rate }"
              @click="selectFundRate(item.rate)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 贷款年限 -->
      <div class="card">
        <div class="card-title">贷款年限</div>
        <div class="year-quick">
          <div
            v-for="y in [10, 20, 30]"
            :key="y"
            class="year-btn"
            :class="{ active: years === y }"
            @click="setYears(y)"
          >
            {{ y }}年
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="30"
          :value="years"
          @input="handleYearChange($event.target.value)"
          class="year-slider"
        />
        <div class="year-display">{{ years }}年 ({{ years * 12 }}期)</div>
      </div>

      <!-- 操作按钮 -->
      <div class="btn-group">
        <button class="btn btn-secondary" @click="handleReset">清空</button>
        <button class="btn btn-primary" @click="handleCalculate">开始计算</button>
      </div>

      <!-- 快捷功能 -->
      <div class="quick-links">
        <div class="link-item" @click="goToEarlyRepayment">
          <span class="icon">🏦</span>
          <span>提前还款计算</span>
        </div>
        <div class="link-item" @click="goToHouseTax">
          <span class="icon">📊</span>
          <span>房屋税费计算</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMortgageStore } from '@/stores/mortgage'
import { useRateStore } from '@/stores/rate'
import { useCalculator } from '@/composables/useCalculator'
import { useRateData } from '@/composables/useRateData'
import { formatMoney } from '@/utils/format'

const router = useRouter()
const mortgageStore = useMortgageStore()
const rateStore = useRateStore()
const { calculateResult } = useCalculator()
useRateData()

// 当前时间信息
const currentTime = ref('')
const currentDate = ref('')

const updateTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
  
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[now.getDay()]
  currentDate.value = `${year}-${month}-${day} ${weekDay}`
}

let timeInterval = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

const tabs = ['商业贷款', '公积金贷款', '组合贷款']
const loansType = ['按房价总额', '按贷款总额', '按房屋面积单价']

// 计算房屋总价（按面积计算时）
const calculateHousePrice = computed(() => {
  const area = parseFloat(mortgageStore.houseArea) || 0
  const price = parseFloat(mortgageStore.persqmPrice) || 0
  return area * price
})

// Store 的状态和方法
const activeIndex = computed(() => mortgageStore.activeIndex)
const loanIndex = computed(() => mortgageStore.loanIndex)
const commercialTotal = computed(() => mortgageStore.commercialTotal)
const houseArea = computed(() => mortgageStore.houseArea)
const persqmPrice = computed(() => mortgageStore.persqmPrice)
const gjjTotal = computed(() => mortgageStore.gjjTotal)
const percentIndex = computed(() => mortgageStore.percentIndex)
const percentArrName = computed(() => mortgageStore.percentArrName)
const rates = computed(() => mortgageStore.rates)
const fundrates = computed(() => mortgageStore.fundrates)
const years = computed(() => mortgageStore.years)

const totalTitle = computed(() => {
  return activeIndex.value === 0 && loanIndex.value === 0 ? '房价总额' : '贷款总额'
})

const gjjTotalTitle = computed(() => {
  return activeIndex.value === 1 && loanIndex.value === 0 ? '房价总额' : '公积金总额'
})

// 商业贷款利率快捷选项（带标签）
const presetCommercialRates = computed(() => {
  const base = rateStore.lprList.standardrate
  return [
    { label: `LPR-${40}基点`, rate: parseFloat((base - 0.4).toFixed(2)) },
    { label: `LPR-${30}基点`, rate: parseFloat((base - 0.3).toFixed(2)) },
    { label: `LPR-${5}基点`, rate: parseFloat((base - 0.05).toFixed(2)) },
    { label: `LPR基准`, rate: base }
  ]
})

// 公积金贷款利率快捷选项
const presetFundRates = computed(() => {
  return [
    { label: '公积金基准', rate: rateStore.lprList.gjjrate },
    { label: '公积金二套', rate: rateStore.lprList.gjj_2_rate }
  ]
})

// 事件处理
const handleTabClick = (index) => {
  mortgageStore.setActiveIndex(index)
  if (index === 2) {
    mortgageStore.setLoanIndex(0)
  }
}

const handleLoanTypeChange = (index) => {
  mortgageStore.setLoanIndex(index)
}

const handleCommercialTotalChange = (val) => {
  mortgageStore.setCommercialTotal(val)
}

const handleHouseAreaChange = (val) => {
  mortgageStore.setHouseArea(val)
}

const handlePersqmPriceChange = (val) => {
  mortgageStore.setPersqmPrice(val)
}

const handleGjjTotalChange = (val) => {
  mortgageStore.setGjjTotal(val)
}

const handlePercentChange = (val) => {
  mortgageStore.setPercentIndex(parseInt(val))
}

const handleRatesChange = (val) => {
  mortgageStore.setRates(parseFloat(val))
}

const handleFundratesChange = (val) => {
  mortgageStore.setFundrates(parseFloat(val))
}

const handleYearChange = (val) => {
  mortgageStore.setYears(parseInt(val))
}

const setYears = (val) => {
  mortgageStore.setYears(val)
}

const selectRate = (rate) => {
  mortgageStore.setRates(rate)
}

const selectFundRate = (rate) => {
  mortgageStore.setFundrates(rate)
}

const handleReset = () => {
  mortgageStore.reset()
}

const handleCalculate = () => {
  const result = calculateResult()
  router.push({
    path: '/mortgage/detail',
    query: {
      data: btoa(encodeURIComponent(JSON.stringify(result)))
    }
  })
}

const goToEarlyRepayment = () => {
  router.push('/early-repayment')
}

const goToHouseTax = () => {
  router.push('/house-tax')
}
</script>

<style scoped lang="scss">
.mortgage-page {
  min-height: 100vh;
  background-color: $bg-color;
}

.header {
  background: linear-gradient(135deg, $primary-color 0%, #4096ff 100%);
  padding: $spacing-md;
}

.tabs {
  display: flex;
  gap: $spacing-sm;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: $spacing-sm;
  color: rgba(255, 255, 255, 0.7);
  font-size: $font-size-base;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.3s;

  &.active {
    background-color: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-weight: 500;
  }
}

.content {
  padding: $spacing-md;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rate-value {
  color: $primary-color;
  font-weight: bold;
  cursor: pointer;
}

.input-group {
  display: flex;
  align-items: center;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  padding: $spacing-sm $spacing-md;

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: $font-size-lg;
  }

  .unit {
    color: $text-color-secondary;
  }

  &.half {
    flex: 1;
  }
}

.input-row {
  display: flex;
  gap: $spacing-md;
}

.radio-group {
  display: flex;
  gap: $spacing-md;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  cursor: pointer;
  color: $text-color-secondary;

  .radio-dot {
    width: 16px;
    height: 16px;
    border: 2px solid $border-color;
    border-radius: 50%;
  }

  &.active {
    color: $primary-color;

    .radio-dot {
      border-color: $primary-color;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: $primary-color;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}

select {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  font-size: $font-size-base;
  background-color: #fff;
}

.year-quick {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.year-btn {
  flex: 1;
  padding: $spacing-sm;
  text-align: center;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  cursor: pointer;
  color: $text-color-secondary;

  &.active {
    border-color: $primary-color;
    color: $primary-color;
    background-color: rgba(22, 120, 255, 0.05);
  }
}

.year-slider {
  width: 100%;
  margin-bottom: $spacing-sm;
}

.year-display {
  text-align: center;
  color: $text-color-secondary;
  font-size: $font-size-sm;
}

.rate-section {
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}

.rate-quick-select {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
  margin-top: $spacing-md;
}

.rate-btn {
  padding: $spacing-sm;
  text-align: center;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  cursor: pointer;
  color: $text-color-secondary;
  font-size: $font-size-sm;
  transition: all 0.3s;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
  }

  &.active {
    border-color: $primary-color;
    color: $primary-color;
    background-color: rgba(22, 120, 255, 0.05);
  }
}

.rate-time {
  font-size: $font-size-sm;
  color: $text-color-light;
  font-weight: normal;
  margin-left: $spacing-sm;
}

.house-price-preview {
  margin-top: $spacing-md;
  padding: $spacing-sm;
  background-color: rgba(22, 120, 255, 0.05);
  border-radius: $border-radius-sm;
  text-align: center;
  color: $primary-color;
  font-weight: 500;
}

.btn-group {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-lg;
}

.btn {
  flex: 1;
  padding: $spacing-md;
  border: none;
  border-radius: $border-radius-md;
  font-size: $font-size-lg;
  cursor: pointer;
  transition: all 0.3s;

  &.btn-primary {
    background-color: $primary-color;
    color: #fff;

    &:active {
      opacity: 0.9;
    }
  }

  &.btn-secondary {
    background-color: #fff;
    color: $text-color;
    border: 1px solid $border-color;
  }
}

.quick-links {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-xl;
}

.link-item {
  flex: 1;
  background-color: #fff;
  border-radius: $border-radius-md;
  padding: $spacing-lg;
  text-align: center;
  cursor: pointer;
  box-shadow: $box-shadow;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  .icon {
    font-size: 24px;
  }

  span:last-child {
    font-size: $font-size-sm;
    color: $text-color-secondary;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;

  @media (min-width: 769px) {
    align-items: center;
  }
}

.modal {
  width: 100%;
  max-width: 768px;
  background-color: #fff;
  border-radius: $border-radius-lg $border-radius-lg 0 0;
  overflow: hidden;

  @media (min-width: 769px) {
    border-radius: $border-radius-lg;
  }
}

.modal-header {
  padding: $spacing-md;
  border-bottom: 1px solid $border-color;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.close-btn {
  font-size: 24px;
  cursor: pointer;
  color: $text-color-light;
}

.modal-body {
  padding: $spacing-lg;
}

.preset-rates {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.rate-option {
  padding: $spacing-md;
  text-align: center;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
  }
}

.custom-rate {
  display: flex;
  align-items: center;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  padding: $spacing-sm $spacing-md;

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: $font-size-base;
  }
}

.modal-footer {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md;
  border-top: 1px solid $border-color;
}
</style>
