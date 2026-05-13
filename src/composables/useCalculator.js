import { ref, computed } from 'vue'
import { calculate } from '@/utils/calculator'
import { useMortgageStore } from '@/stores/mortgage'

export function useCalculator() {
  const mortgageStore = useMortgageStore()

  // 计算实际贷款金额
  const getLoanAmount = () => {
    const { loanIndex, activeIndex, commercialTotal, houseArea, persqmPrice, gjjTotal, percentIndex, percentArr } = mortgageStore
    const percent = percentArr[percentIndex] / 10

    if (activeIndex === 2) {
      // 组合贷款
      let commercial, gjj
      if (loanIndex === 2) {
        const totalHousePrice = houseArea * persqmPrice * 0.0001
        commercial = totalHousePrice * percent
        gjj = totalHousePrice * percent
      } else {
        commercial = loanIndex === 1 ? commercialTotal : commercialTotal * percent
        gjj = loanIndex === 1 ? gjjTotal : gjjTotal * percent
      }
      return { commercial, gjj }
    } else if (activeIndex === 0) {
      // 商业贷款
      let amount
      if (loanIndex === 2) {
        const totalHousePrice = houseArea * persqmPrice * 0.0001
        amount = totalHousePrice * percent
      } else {
        amount = loanIndex === 1 ? commercialTotal : commercialTotal * percent
      }
      return { commercial: amount, gjj: 0 }
    } else {
      // 公积金贷款
      let amount
      if (loanIndex === 2) {
        const totalHousePrice = houseArea * persqmPrice * 0.0001
        amount = totalHousePrice * percent
      } else {
        amount = loanIndex === 1 ? gjjTotal : gjjTotal * percent
      }
      return { commercial: 0, gjj: amount }
    }
  }

  // 计算结果
  const calculateResult = () => {
    const { activeIndex, rates, fundrates, years } = mortgageStore
    const { commercial, gjj } = getLoanAmount()
    const totalMonths = years * 12

    let commercialResult = null
    let gjjResult = null

    if (commercial > 0) {
      commercialResult = calculate(commercial * 10000, (rates * 0.01) / 12, totalMonths)
    }

    if (gjj > 0) {
      gjjResult = calculate(gjj * 10000, (fundrates * 0.01) / 12, totalMonths)
    }

    return {
      commercialResult,
      gjjResult,
      activeIndex,
      years,
      rates,
      fundrates,
      downPay: calculateDownPayment()
    }
  }

  // 计算首付
  const calculateDownPayment = () => {
    const { loanIndex, activeIndex, commercialTotal, houseArea, persqmPrice, gjjTotal, percentIndex, percentArr } = mortgageStore
    const percent = percentArr[percentIndex] / 10
    const downPercent = 1 - percent

    if (activeIndex === 0) {
      if (loanIndex === 2) {
        const totalHousePrice = houseArea * persqmPrice * 0.0001
        return (totalHousePrice * downPercent).toFixed(2)
      }
      return (commercialTotal * downPercent).toFixed(2)
    } else if (activeIndex === 1) {
      if (loanIndex === 2) {
        const totalHousePrice = houseArea * persqmPrice * 0.0001
        return (totalHousePrice * downPercent).toFixed(2)
      }
      return (gjjTotal * downPercent).toFixed(2)
    }
    return null
  }

  return {
    getLoanAmount,
    calculateResult,
    calculateDownPayment
  }
}
