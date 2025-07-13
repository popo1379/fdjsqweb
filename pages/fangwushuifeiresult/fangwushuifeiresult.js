// pages/result/result.js
Page({
  data: {
    type: '', // 'used' 二手房 | 'new' 新房
    houseData: {}, // 房屋数据
    taxResult: {}  // 税费计算结果
  },

  onLoad(options) {
    const type = options.type;
    const houseData = JSON.parse(decodeURIComponent(options.data));
    
    this.setData({
      type,
      houseData
    });
    
    // 根据类型计算税费
    if (type === 'used') {
      this.calculateUsedHouseTax(houseData);
    } else {
      this.calculateNewHouseTax(houseData);
    }
  },
  // 广告
  adLoad() {
    console.log('原生模板广告加载成功')
  },
  adError(err) {
    console.error('原生模板广告加载失败', err)
  },
  adClose() {
    console.log('原生模板广告关闭')
  },
  // 计算二手房税费（2023最新政策）
  calculateUsedHouseTax(data) {
    const houseArea = parseFloat(data.houseArea);
    const totalPrice = parseFloat(data.totalPrice) * 10000; // 转为元
    const originalPrice = parseFloat(data.originalPrice) * 10000; // 转为元
    
    // 1. 增值税及附加
    let vat = 0; // 增值税
    let vatAdd = 0; // 增值税附加
    
    if (data.yearsOption === '不足2年') {
      vat = totalPrice * 0.05;
      vatAdd = vat * 0.12; // 城建税7% + 教育费附加3% + 地方教育附加2%
    }
    
    // 2. 个人所得税
    let incomeTax = 0;
    if (data.yearsOption === '满5年' && data.sellerSituation === '家庭唯一') {
      incomeTax = 0; // 满5唯一免征
    } else if (data.houseType === '普通住宅') {
      incomeTax = totalPrice * 0.01; // 核定征收
    } else {
      incomeTax = totalPrice * 0.015; // 非普通住宅
    }
    
    // 3. 契税
    let deedTax = 0;
    if (data.isFirstBuy === '首套') {
      deedTax = houseArea <= 90 ? totalPrice * 0.01 : totalPrice * 0.015;
    } else {
      deedTax = houseArea <= 90 ? totalPrice * 0.01 : totalPrice * 0.02;
    }
    
    // 4. 印花税：免征
    const stampDuty = 0;
    
    // 5. 登记费
    const registrationFee = data.houseType === '普通住宅' ? 80 : 550;
    
    // 总税费
    const totalTax = vat + vatAdd + incomeTax + deedTax + stampDuty + registrationFee;
    
    // 设置计算结果
    this.setData({
      taxResult: {
        vat: this._formatCurrency(vat),
        vatAdd: this._formatCurrency(vatAdd),
        incomeTax: this._formatCurrency(incomeTax),
        deedTax: this._formatCurrency(deedTax),
        stampDuty: this._formatCurrency(stampDuty),
        registrationFee: this._formatCurrency(registrationFee),
        totalTax: this._formatCurrency(totalTax),
        
        // 税费说明
        vatExplanation: vat > 0 ? '不足2年需缴纳5%增值税' : '满2年免征增值税',
        vatAddExplanation: vat > 0 ? '增值税的12%（城建税7%+教育附加3%+地方附加2%）' : '免征',
        incomeTaxExplanation: data.yearsOption === '满5年' && data.sellerSituation === '家庭唯一' ? 
          '满5年唯一住房免征' : 
          `${data.houseType === '普通住宅' ? '1%核定征收' : '1.5%核定征收'}`,
        deedTaxExplanation: this._getUsedDeedTaxExplanation(data, houseArea, deedTax, totalPrice),
        stampDutyExplanation: '个人住房交易免征'
      }
    });
  },

  // 计算新房税费（2023最新政策）
  calculateNewHouseTax(data) {
    const houseArea = parseFloat(data.houseArea);
    const totalPrice = parseFloat(data.totalPrice) * 10000; // 转为元
    
    // 1. 契税
    let deedTax = 0;
    let deedRate = 0;
    switch (data.buyerSituation) {
      case '首套':
        deedRate = houseArea <= 90 ? 0.01 : 0.015;
        break;
      case '二套':
        deedRate = houseArea <= 90 ? 0.01 : 0.02;
        break;
      case '三套及以上':
        deedRate = 0.03;
        break;
    }
    deedTax = totalPrice * deedRate;
    
    // 2. 维修基金
    const maintenanceFundRate = data.houseType === '普通住宅' ? 100 : 150;
    const maintenanceFund = houseArea * maintenanceFundRate;
    
    // 3. 产权登记费
    const propertyRegistrationFee = 80;
    
    // 4. 交易手续费
    const transactionFee = houseArea * 3; // 3元/㎡
    
    // 5. 配图费
    const mappingFee = 20;
    
    // 6. 印花税：免征
    const stampDuty = 0;
    
    // 总费用
    const totalCost = deedTax + maintenanceFund + propertyRegistrationFee + 
                     transactionFee + mappingFee + stampDuty;
    
    // 设置计算结果
    this.setData({
      taxResult: {
        deedTax: this._formatCurrency(deedTax),
        maintenanceFund: this._formatCurrency(maintenanceFund),
        propertyRegistrationFee: this._formatCurrency(propertyRegistrationFee),
        transactionFee: this._formatCurrency(transactionFee),
        mappingFee: this._formatCurrency(mappingFee),
        stampDuty: this._formatCurrency(stampDuty),
        totalCost: this._formatCurrency(totalCost),
        
        // 费用说明
        deedTaxExplanation: `${(deedRate * 100).toFixed(1)}%税率`,
        maintenanceFundExplanation: `${maintenanceFundRate}元/㎡`,
        transactionFeeExplanation: '3元/㎡',
        stampDutyExplanation: '<text class="exempted">个人购买住房免征</text>'
      }
    });
  },

  // 获取二手房契税说明
  _getUsedDeedTaxExplanation(data, houseArea, deedTax, totalPrice) {
    let rate = deedTax / totalPrice;
    let situation = data.isFirstBuy === '首套' ? '首套房' : '非首套房';
    let areaDesc = houseArea <= 90 ? '≤90㎡' : '>90㎡';
    return `${situation} ${areaDesc} ${(rate * 100).toFixed(1)}%`;
  },

  // 格式化金额显示
  _formatCurrency(value) {
    if (isNaN(value)) value = 0;
    if (value === 0) return '0';
    
    // 大于1万的显示万元单位
    if (value >= 10000) {
      const result = value / 10000;
      return `${result.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}万`;
    }
    
    // 显示千位分隔符
    return value.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  // 返回修改
  goBack() {
    wx.navigateBack();
  }
});