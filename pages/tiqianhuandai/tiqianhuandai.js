let interstitialAd = null
Page({
  data: {

    // 贷款选项
    loanTypes: [
      { name: '商业贷款', value: 'commercial' },
      { name: '公积金贷款', value: 'fund' }
    ],
    repaymentTypes: [
      { name: '等额本息', value: 'equal' },
      { name: '等额本金', value: 'principal' }
    ],
    prepaymentTypes: [
      { name: '部分还款', value: 'partial' },
      { name: '全额还款', value: 'full' }
    ],
    
    // 表单数据
    loanType: 'commercial',      // 贷款类型
    repaymentType: 'equal',      // 还款方式
    prepaymentType: 'partial',   // 提前还款方式
    loanAmount: '',               // 贷款金额(万元)
    loanYears: '30',              // 贷款年限
    loanRate: '0',              // 贷款利率(%)
    firstRepaymentDate: '',       // 首期还款时间
    prepaymentDate: '',           // 提前还款时间
    prepaymentAmount: '',         // 提前结清金额(元)
    
    // 计算结果
    results: {
      remainingPrincipal: '0',    // 剩余本金
      paidTotal: '0',             // 已还款总额
      paidPrincipal: '0',         // 已还款本金
      paidInterest: '0',          // 已还款利息
      currentMonthPayment: '0',    // 当月需还
      method1: {
        name: "月供不变，期限缩短",
        newMonthlyPayment: "0",    // 新每月还款额
        savings: "0",              // 可节省利息
        newTerm: "0",              // 新还款期限(月)
        finalRepaymentDate: ""      // 最后还款日期
      },
      method2: {
        name: "期限不变，月供减少",
        newMonthlyPayment: "0",    // 新每月还款额
        savings: "0",              // 可节省利息
        monthlyReduction: "0",     // 月供减少额
        finalRepaymentDate: ""      // 最后还款日期
      },
      chartData: [
        {name: '已付利息', value: 0, percent: 50},
        {name: '剩余利息', value: 0, percent: 50}
      ]
    },
    
    showResult: false,             // 是否显示结果
    isFormValid: false             // 表单是否有效
  },
  async onLoad() {
    var that = this;
  // 小程序云数据库逻辑
  var c1 = new wx.cloud.Cloud({
    // 资源方 小程序A的 AppID
    resourceAppid: 'wx02933187189c34ad',
    // 资源方 小程序A的 的云开发环境ID
    resourceEnv: 'mortgagecalculator-9d0fqf0fbb151',
    })
    await c1.init()
    c1.database().collection('LPRlist').doc('bb4c2515625b74f6003334886f68a4fe').get(
    {
      success: function(res) {
        // res.data 包含该记录的数据
        console.log(res.data);
        that.setData({
          lprList:res.data
        })
        that.setData({
          loanRate:that.data.lprList.standardrate,
          fundrates:that.data.lprList.gjjrate
        })
        wx.hideLoading()
        console.log(that.data.lprList);
        console.log(that.data.lprList.year);
      }
      
    })
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-f97bf96c44524886'
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {
        console.error('插屏广告加载失败', err)
      })
      interstitialAd.onClose(() => {})
    }
    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error('插屏广告显示失败', err)
      })
    }
  },
  
  // 监听表单变化 - 更新表单有效性
  checkFormValidity: function() {
    // 基本表单验证
    const basicValid = !!(this.data.loanAmount && 
                         this.data.loanYears && 
                         this.data.loanRate && 
                         this.data.firstRepaymentDate && 
                         this.data.prepaymentDate);
    
    // 还款金额验证：如果是部分还款则需要输入金额
    let amountValid = true;
    if (this.data.prepaymentType === 'partial') {
      amountValid = !isNaN(parseFloat(this.data.prepaymentAmount)) && parseFloat(this.data.prepaymentAmount) > 0;
    }
    
    this.setData({ 
      isFormValid: basicValid && amountValid
    });
  },

  // 贷款类型变化
  onLoanTypeChange: function(e) {
    this.setData({ 
      loanType: e.detail.value,
      showResult: false 
    }, this.checkFormValidity);
  },

  // 还款方式变化
  onRepaymentChange: function(e) {
    this.setData({ 
      repaymentType: e.detail.value,
      showResult: false 
    }, this.checkFormValidity);
  },

  // 还款方式变化
  onPrepaymentTypeChange: function(e) {
    this.setData({ 
      prepaymentType: e.detail.value,
      showResult: false 
    }, this.checkFormValidity);
  },

  // 贷款金额变化
  onLoanAmountChange: function(e) {
    this.setData({ 
      loanAmount: e.detail.value,
      showResult: false 
    }, this.checkFormValidity);
  },

  // 贷款年限变化
  onLoanYearsChange: function(e) {
    this.setData({ 
      loanYears: e.detail.value,
      showResult: false 
    }, this.checkFormValidity);
  },

  // 贷款利率变化
  onLoanRateChange: function(e) {
    this.setData({ 
      loanRate: e.detail.value,
      showResult: false 
    }, this.checkFormValidity);
  },

  // 首期还款时间变化
  onFirstRepaymentChange: function(e) {
    this.setData({ 
      firstRepaymentDate: e.detail.value,
      showResult: false 
    }, this.checkFormValidity);
  },

  // 提前还款时间变化
  onPrepaymentChange: function(e) {
    this.setData({ 
      prepaymentDate: e.detail.value,
      showResult: false 
    }, this.checkFormValidity);
  },

  // 提前还款金额变化
  onPrepaymentAmountChange: function(e) {
    this.setData({ 
      prepaymentAmount: e.detail.value,
      showResult: false 
    }, this.checkFormValidity);
  },

  // 计算按钮点击
  onCalculate: function() {
    if (!this.data.isFormValid) {
      wx.showToast({ title: '请完善表单信息', icon: 'none' });
      return;
    }
    
    // 计算逻辑
    this.calculateRepayment();
  },

  // 计算还款详情
  calculateRepayment: function() {
    // 解析表单数据
    const loanPrincipal = parseFloat(this.data.loanAmount) * 10000; // 万元转元
    const loanMonths = parseInt(this.data.loanYears) * 12;
    const annualRate = parseFloat(this.data.loanRate) / 100; // 百分比转为小数
    const monthlyRate = annualRate / 12;
    // const prepaymentAmountpal = parseFloat(this.data.prepaymentAmount) * 10000; // 万元转元
 
    // 计算已还月数
    const startDate = new Date(this.data.firstRepaymentDate);
    const prepayDate = new Date(this.data.prepaymentDate);
    const paidMonths = (prepayDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (prepayDate.getMonth() - startDate.getMonth());
    
    if (paidMonths >= loanMonths || paidMonths <= 0) {
      wx.showToast({ title: '还款时间无效，请重新选择', icon: 'none' });
      return;
    }
    
    const remainingMonths = loanMonths - paidMonths;
    
    // 计算结果变量
    let paidPrincipal = 0;
    let paidInterest = 0;
    let remainingPrincipal = 0;
    let currentMonthInterest = 0;
    let currentMonthPayment = 0;
    
    // 等额本息还款计算
    if (this.data.repaymentType === 'equal') {
      // 月供计算公式 [P×r×(1+r)^n]/[(1+r)^n-1]
      const monthlyPayment = loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, loanMonths) / 
                            (Math.pow(1 + monthlyRate, loanMonths) - 1);
      
      // 计算已还款的本金和利息
      let balance = loanPrincipal;
      for (let i = 0; i < paidMonths; i++) {
        const interest = balance * monthlyRate;
        const principal = monthlyPayment - interest;
        paidInterest += interest;
        paidPrincipal += principal;
        balance -= principal;
      }
      remainingPrincipal = loanPrincipal - paidPrincipal;
      currentMonthPayment = monthlyPayment; // 当月月供金额
    } 
    // 等额本金还款计算
    else {
      // 每月应还本金
      const monthlyPrincipal = loanPrincipal / loanMonths;
      paidPrincipal = monthlyPrincipal * paidMonths;
      
      // 计算已付利息
      let balance = loanPrincipal;
      for (let i = 0; i < paidMonths; i++) {
        const monthlyInterest = balance * monthlyRate;
        paidInterest += monthlyInterest;
        balance -= monthlyPrincipal;
      }
      remainingPrincipal = loanPrincipal - paidPrincipal;
      currentMonthPayment = monthlyPrincipal + (remainingPrincipal * monthlyRate); // 当月月供金额
    }
    
    // 确定提前还款金额
  
    let prepaymentAmount = 0;
    if (this.data.prepaymentType === 'full') {
      prepaymentAmount = remainingPrincipal;
    } else {
      const inputAmount = parseFloat(this.data.prepaymentAmount);
      prepaymentAmount = Math.min(inputAmount, remainingPrincipal);
    }
    
    // 当月需还 = 当月月供 + 提前结清金额
    const currentMonthTotal = (prepaymentAmount > 0 ? currentMonthPayment : 0) + prepaymentAmount;
    
    // 提前还款后的本金
    const afterPrepayPrincipal = remainingPrincipal - prepaymentAmount;
    
    // 计算最后还款日期函数
    const calcFinalRepaymentDate = (additionalMonths) => {
      const finalDate = new Date(prepayDate);
      finalDate.setMonth(finalDate.getMonth() + additionalMonths);
      return `${finalDate.getFullYear()}年${finalDate.getMonth() + 1}月`;
    };
    
    // 初始化结果对象
    const results = {
      remainingPrincipal: remainingPrincipal.toFixed(2),
      paidTotal: (paidPrincipal + paidInterest).toFixed(2),
      paidPrincipal: paidPrincipal.toFixed(2),
      paidInterest: paidInterest.toFixed(2),
      currentMonthPayment: currentMonthTotal.toFixed(2),
      method1: {
        name: "月供不变，期限缩短",
        newMonthlyPayment: "0",
        savings: "0",
        newTerm: "0",
        finalRepaymentDate: ""
      },
      method2: {
        name: "期限不变，月供减少",
        newMonthlyPayment: "0",
        savings: "0",
        monthlyReduction: "0",
        finalRepaymentDate: ""
      }
    };
    
    // 方式1: 月供不变，期限缩短（完全重写逻辑）
    let method1Term = 0;
    let method1Savings = 0;
    let method1MonthlyPayment = 0;
    
    if (this.data.repaymentType === 'equal' && afterPrepayPrincipal > 0) {
      // 保持月供不变
      method1MonthlyPayment = currentMonthPayment;
      
      // 计算公式：n = -log(1 - P*r/A) / log(1+r)
      // 其中 P=剩余本金，r=月利率，A=月供
      const P = afterPrepayPrincipal;
      const r = monthlyRate;
      const A = currentMonthPayment;
      
      // 防止NaN
      if (P * r < A) {
        const n = -Math.log(1 - (P * r) / A) / Math.log(1 + r);
        method1Term = Math.ceil(n);
        
        // 计算新计划的利息
        let newBalance = P;
        let newInterest = 0;
        for (let i = 0; i < method1Term; i++) {
          const interest = newBalance * r;
          newInterest += interest;
          newBalance -= (A - interest);
        }
        
        // 计算原计划下的利息
        let origInterest = 0;
        let origBalance = remainingPrincipal;
        for (let i = 0; i < remainingMonths; i++) {
          const interest = origBalance * r;
          origInterest += interest;
          origBalance -= (currentMonthPayment - interest);
        }
        
        method1Savings = Math.max(origInterest - newInterest, 0);
      }
    }
    
    // 方式2: 期限不变，月供减少
    let method2MonthlyPayment = 0;
    let method2Savings = 0;
    let method2Reduction = 0;
    
    if (afterPrepayPrincipal > 0) {
      if (this.data.repaymentType === 'equal') {
        // 等额本息：重新计算月供
        method2MonthlyPayment = afterPrepayPrincipal * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths) / 
                               (Math.pow(1 + monthlyRate, remainingMonths) - 1);
        
        // 计算新计划利息
        let newInterest = 0;
        let newBalance = afterPrepayPrincipal;
        for (let i = 0; i < remainingMonths; i++) {
          const interest = newBalance * monthlyRate;
          newInterest += interest;
          newBalance -= (method2MonthlyPayment - interest);
        }
        
        // 计算原计划利息
        let origInterest = 0;
        let origBalance = remainingPrincipal;
        for (let i = 0; i < remainingMonths; i++) {
          const interest = origBalance * monthlyRate;
          origInterest += interest;
          origBalance -= (currentMonthPayment - interest);
        }
        
        method2Savings = Math.max(origInterest - newInterest, 0);
      } else {
        // 等额本金：重新计算月供
        const newMonthlyPrincipal = afterPrepayPrincipal / remainingMonths;
        method2MonthlyPayment = newMonthlyPrincipal + (afterPrepayPrincipal * monthlyRate);
        
        // 计算新计划利息
        let newInterest = 0;
        let newBalance = afterPrepayPrincipal;
        for (let i = 0; i < remainingMonths; i++) {
          const interest = newBalance * monthlyRate;
          newInterest += interest;
          newBalance -= newMonthlyPrincipal;
        }
        
        // 计算原计划利息
        let origInterest = 0;
        let origBalance = remainingPrincipal;
        const origMonthlyPrincipal = remainingPrincipal / remainingMonths;
        for (let i = 0; i < remainingMonths; i++) {
          origInterest += origBalance * monthlyRate;
          origBalance -= origMonthlyPrincipal;
        }
        
        method2Savings = Math.max(origInterest - newInterest, 0);
      }
      
      method2Reduction = currentMonthPayment - method2MonthlyPayment;
    }
    
    // 设置结果
    results.method1 = {
      name: "月供不变，期限缩短",
      newMonthlyPayment: method1MonthlyPayment.toFixed(2),
      savings: method1Savings.toFixed(2),
      newTerm: method1Term,
      finalRepaymentDate: method1Term > 0 ? calcFinalRepaymentDate(method1Term) : "已结清"
    };
    
    results.method2 = {
      name: "期限不变，月供减少",
      newMonthlyPayment: method2MonthlyPayment.toFixed(2),
      savings: method2Savings.toFixed(2),
      monthlyReduction: method2Reduction.toFixed(2),
      finalRepaymentDate: remainingMonths > 0 ? calcFinalRepaymentDate(remainingMonths) : "已结清"
    };
    
    // 如果选择的是全额还款
    if (this.data.prepaymentType === 'full') {
      // 计算剩余利息
      let remainingInterest = 0;
      if (this.data.repaymentType === 'equal') {
        for (let i = 0; i < remainingMonths; i++) {
          const monthlyInterest = remainingPrincipal * monthlyRate;
          remainingInterest += monthlyInterest;
          remainingPrincipal -= (currentMonthPayment - monthlyInterest);
        }
      } else {
        const monthlyPrincipal = remainingPrincipal / remainingMonths;
        for (let i = 0; i < remainingMonths; i++) {
          remainingInterest += remainingPrincipal * monthlyRate;
          remainingPrincipal -= monthlyPrincipal;
        }
      }
      
      results.method1.savings = remainingInterest.toFixed(2);
      results.method2.savings = remainingInterest.toFixed(2);
    }
    
    // 图表数据
    const paidInterestValue = parseFloat(paidInterest);
    const savingValue1 = parseFloat(results.method1.savings);
    const savingValue2 = parseFloat(results.method2.savings);
    const savingValue = Math.max(savingValue1, savingValue2);
    const totalInterest = paidInterestValue + savingValue;
    const paidPercent = totalInterest > 0 ? Math.round((paidInterestValue / totalInterest) * 100) : 50;
    const savingPercent = 100 - paidPercent;
    
    results.chartData = [
      {name: '已付利息', value: paidInterestValue, percent: paidPercent},
      {name: '剩余利息', value: savingValue, percent: savingPercent}
    ];
    
    // 设置结果
    this.setData({
      showResult: true,
      results: results
    });
    
    // 滚动到结果
    wx.pageScrollTo({ duration: 300, scrollTop: 1000 });
  }
});