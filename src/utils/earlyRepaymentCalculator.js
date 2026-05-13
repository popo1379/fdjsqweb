export const calculateEarlyRepayment = (formData) => {
  const {
    loanAmount,
    loanYears,
    loanRate,
    repaymentType,
    prepaymentType,
    prepaymentAmount,
    firstRepaymentDate,
    prepaymentDate
  } = formData

  const loanPrincipal = parseFloat(loanAmount) * 10000
  const loanMonths = parseInt(loanYears) * 12
  const annualRate = parseFloat(loanRate) / 100
  const monthlyRate = annualRate / 12

  const startDate = new Date(firstRepaymentDate)
  const prepayDate = new Date(prepaymentDate)
  const paidMonths = (prepayDate.getFullYear() - startDate.getFullYear()) * 12 +
                     (prepayDate.getMonth() - startDate.getMonth())

  if (paidMonths >= loanMonths || paidMonths <= 0) {
    return {
      success: false,
      error: '还款时间无效，请重新选择'
    }
  }

  const remainingMonths = loanMonths - paidMonths

  let paidPrincipal = 0
  let paidInterest = 0
  let remainingPrincipal = 0
  let currentMonthInterest = 0
  let currentMonthPayment = 0

  if (repaymentType === 'equal') {
    const monthlyPayment = loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, loanMonths) /
                          (Math.pow(1 + monthlyRate, loanMonths) - 1)

    let balance = loanPrincipal
    for (let i = 0; i < paidMonths; i++) {
      const interest = balance * monthlyRate
      const principal = monthlyPayment - interest
      paidInterest += interest
      paidPrincipal += principal
      balance -= principal
    }
    remainingPrincipal = loanPrincipal - paidPrincipal
    currentMonthPayment = monthlyPayment
  } else {
    const monthlyPrincipal = loanPrincipal / loanMonths
    paidPrincipal = monthlyPrincipal * paidMonths

    let balance = loanPrincipal
    for (let i = 0; i < paidMonths; i++) {
      const monthlyInterest = balance * monthlyRate
      paidInterest += monthlyInterest
      balance -= monthlyPrincipal
    }
    remainingPrincipal = loanPrincipal - paidPrincipal
    currentMonthPayment = monthlyPrincipal + (remainingPrincipal * monthlyRate)
  }

  let prepayment = 0
  if (prepaymentType === 'full') {
    prepayment = remainingPrincipal
  } else {
    const inputAmount = parseFloat(prepaymentAmount)
    prepayment = Math.min(inputAmount, remainingPrincipal)
  }

  const currentMonthTotal = (prepayment > 0 ? currentMonthPayment : 0) + prepayment
  const afterPrepayPrincipal = remainingPrincipal - prepayment

  const calcFinalRepaymentDate = (additionalMonths) => {
    const finalDate = new Date(prepayDate)
    finalDate.setMonth(finalDate.getMonth() + additionalMonths)
    return `${finalDate.getFullYear()}年${finalDate.getMonth() + 1}月`
  }

  const results = {
    remainingPrincipal: remainingPrincipal.toFixed(2),
    paidTotal: (paidPrincipal + paidInterest).toFixed(2),
    paidPrincipal: paidPrincipal.toFixed(2),
    paidInterest: paidInterest.toFixed(2),
    currentMonthPayment: currentMonthTotal.toFixed(2)
  }

  let method1Term = 0
  let method1Savings = 0
  let method1MonthlyPayment = 0

  if (repaymentType === 'equal' && afterPrepayPrincipal > 0) {
    method1MonthlyPayment = currentMonthPayment

    const P = afterPrepayPrincipal
    const r = monthlyRate
    const A = currentMonthPayment

    if (P * r < A) {
      const n = -Math.log(1 - (P * r) / A) / Math.log(1 + r)
      method1Term = Math.ceil(n)

      let newBalance = P
      let newInterest = 0
      for (let i = 0; i < method1Term; i++) {
        const interest = newBalance * r
        newInterest += interest
        newBalance -= (A - interest)
      }

      let origInterest = 0
      let origBalance = remainingPrincipal
      for (let i = 0; i < remainingMonths; i++) {
        const interest = origBalance * r
        origInterest += interest
        origBalance -= (currentMonthPayment - interest)
      }

      method1Savings = Math.max(origInterest - newInterest, 0)
    }
  }

  let method2MonthlyPayment = 0
  let method2Savings = 0
  let method2Reduction = 0

  if (afterPrepayPrincipal > 0) {
    if (repaymentType === 'equal') {
      method2MonthlyPayment = afterPrepayPrincipal * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths) /
                             (Math.pow(1 + monthlyRate, remainingMonths) - 1)

      let newInterest = 0
      let newBalance = afterPrepayPrincipal
      for (let i = 0; i < remainingMonths; i++) {
        const interest = newBalance * monthlyRate
        newInterest += interest
        newBalance -= (method2MonthlyPayment - interest)
      }

      let origInterest = 0
      let origBalance = remainingPrincipal
      for (let i = 0; i < remainingMonths; i++) {
        const interest = origBalance * monthlyRate
        origInterest += interest
        origBalance -= (currentMonthPayment - interest)
      }

      method2Savings = Math.max(origInterest - newInterest, 0)
    } else {
      const newMonthlyPrincipal = afterPrepayPrincipal / remainingMonths
      method2MonthlyPayment = newMonthlyPrincipal + (afterPrepayPrincipal * monthlyRate)

      let newInterest = 0
      let newBalance = afterPrepayPrincipal
      for (let i = 0; i < remainingMonths; i++) {
        const interest = newBalance * monthlyRate
        newInterest += interest
        newBalance -= newMonthlyPrincipal
      }

      let origInterest = 0
      let origBalance = remainingPrincipal
      const origMonthlyPrincipal = remainingPrincipal / remainingMonths
      for (let i = 0; i < remainingMonths; i++) {
        origInterest += origBalance * monthlyRate
        origBalance -= origMonthlyPrincipal
      }

      method2Savings = Math.max(origInterest - newInterest, 0)
    }

    method2Reduction = currentMonthPayment - method2MonthlyPayment
  }

  if (prepaymentType === 'full') {
    let remainingInterest = 0
    if (repaymentType === 'equal') {
      for (let i = 0; i < remainingMonths; i++) {
        const monthlyInterest = remainingPrincipal * monthlyRate
        remainingInterest += monthlyInterest
        remainingPrincipal -= (currentMonthPayment - monthlyInterest)
      }
    } else {
      const monthlyPrincipal = remainingPrincipal / remainingMonths
      for (let i = 0; i < remainingMonths; i++) {
        remainingInterest += remainingPrincipal * monthlyRate
        remainingPrincipal -= monthlyPrincipal
      }
    }
    method1Savings = remainingInterest
    method2Savings = remainingInterest
  }

  results.method1 = {
    name: '月供不变，期限缩短',
    newMonthlyPayment: method1MonthlyPayment.toFixed(2),
    savings: method1Savings.toFixed(2),
    newTerm: method1Term,
    finalRepaymentDate: method1Term > 0 ? calcFinalRepaymentDate(method1Term) : '已结清'
  }

  results.method2 = {
    name: '期限不变，月供减少',
    newMonthlyPayment: method2MonthlyPayment.toFixed(2),
    savings: method2Savings.toFixed(2),
    monthlyReduction: method2Reduction.toFixed(2),
    finalRepaymentDate: remainingMonths > 0 ? calcFinalRepaymentDate(remainingMonths) : '已结清'
  }

  return {
    success: true,
    data: results
  }
}
