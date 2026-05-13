import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMortgageStore = defineStore('mortgage', () => {
  // 贷款类型：0-商业贷款，1-公积金贷款，2-组合贷款
  const activeIndex = ref(0)
  // 计算方式：0-按房价总额，1-按贷款总额，2-按房屋面积单价
  const loanIndex = ref(0)
  // 商业贷款相关
  const commercialTotal = ref(100)
  const houseArea = ref(100)
  const persqmPrice = ref(10000)
  const percentIndex = ref(2) // 成数索引，对应 8/7.5/7/6.5/6/5.5/5/4.5/4/3.5/3/2.5/2
  const percentArr = [8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2]
  const percentArrName = ['8成', '7.5成', '7成', '6.5成', '6成', '5.5成', '5成', '4.5成', '4成', '3.5成', '3成', '2.5成', '2成']
  // 公积金贷款
  const gjjTotal = ref(100)
  // 利率
  const rates = ref(3.85) // 商业利率
  const fundrates = ref(3.1) // 公积金利率
  // 贷款年限
  const years = ref(30)
  // 利率弹窗
  const showRateModal = ref(false)
  const showFundRateModal = ref(false)

  const setActiveIndex = (index) => {
    activeIndex.value = index
  }

  const setLoanIndex = (index) => {
    loanIndex.value = index
  }

  const setCommercialTotal = (val) => {
    commercialTotal.value = val
  }

  const setHouseArea = (val) => {
    houseArea.value = val
  }

  const setPersqmPrice = (val) => {
    persqmPrice.value = val
  }

  const setGjjTotal = (val) => {
    gjjTotal.value = val
  }

  const setPercentIndex = (index) => {
    percentIndex.value = index
  }

  const setRates = (val) => {
    rates.value = val
  }

  const setFundrates = (val) => {
    fundrates.value = val
  }

  const setYears = (val) => {
    years.value = val
  }

  const toggleRateModal = (show) => {
    showRateModal.value = show
  }

  const toggleFundRateModal = (show) => {
    showFundRateModal.value = show
  }

  const reset = () => {
    activeIndex.value = 0
    loanIndex.value = 0
    commercialTotal.value = 100
    houseArea.value = 100
    persqmPrice.value = 10000
    gjjTotal.value = 100
    percentIndex.value = 2
    rates.value = 3.85
    fundrates.value = 3.1
    years.value = 30
  }

  return {
    activeIndex,
    loanIndex,
    commercialTotal,
    houseArea,
    persqmPrice,
    gjjTotal,
    percentIndex,
    percentArr,
    percentArrName,
    rates,
    fundrates,
    years,
    showRateModal,
    showFundRateModal,
    setActiveIndex,
    setLoanIndex,
    setCommercialTotal,
    setHouseArea,
    setPersqmPrice,
    setGjjTotal,
    setPercentIndex,
    setRates,
    setFundrates,
    setYears,
    toggleRateModal,
    toggleFundRateModal,
    reset
  }
})
