let interstitialAd = null
Page({
  data: {
    currentTab: 0, // 0:二手房, 1:新房
    
    // 二手房数据
    usedHouse: {
      houseArea: '',          // 房屋面积
      yearsOption: '满5年',    // 购置年限
      totalPrice: '',         // 房屋总价
      originalPrice: '',      // 原登记价
      houseType: '普通住宅',   // 房产类型
      sellerSituation: '家庭唯一', // 卖家持有情况
      isFirstBuy: '首套'      // 买家是否首套
    },
    
    // 新房数据
    newHouse: {
      houseArea: '',          // 房屋面积
      totalPrice: '',         // 房屋总价
      houseType: '普通住宅',   // 房产类型
      buyerSituation: '首套'  // 买家购房情况
    }
  },

  async onLoad() {
    // 在页面onLoad回调事件中创建插屏广告实例
if (wx.createInterstitialAd) {
  interstitialAd = wx.createInterstitialAd({
    adUnitId: 'adunit-bf9cc3488c9453a0'
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
  // 切换Tab页
  switchTab(e) {
    this.setData({
      currentTab: Number(e.currentTarget.dataset.index)
    });
  },

  // 输入框绑定
  bindInput(e) {
    const { type, field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    if (type === 'used') {
      this.setData({
        [`usedHouse.${field}`]: value
      });
    } else {
      this.setData({
        [`newHouse.${field}`]: value
      });
    }
  },

  // 设置选择器值
  setSelector(e) {
    const { type, field, value } = e.currentTarget.dataset;
    
    if (type === 'used') {
      this.setData({
        [`usedHouse.${field}`]: value
      });
    } else {
      this.setData({
        [`newHouse.${field}`]: value
      });
    }
  },

  // 计算税费并跳转到结果页
  calculateTax() {
    if (this.data.currentTab === 0) {
      if (!this._validateUsedHouse()) return;
    } else {
      if (!this._validateNewHouse()) return;
    }
    
    // 跳转到结果页面
    wx.navigateTo({
      url: '../fangwushuifeiresult/fangwushuifeiresult?' + 
        `type=${this.data.currentTab === 0 ? 'used' : 'new'}` +
        `&data=${encodeURIComponent(JSON.stringify(
          this.data.currentTab === 0 ? this.data.usedHouse : this.data.newHouse
        ))}`
    });
  },
  
  // 验证二手房输入
  _validateUsedHouse() {
    const data = this.data.usedHouse;
    
    if (!data.houseArea || isNaN(parseFloat(data.houseArea))) {
      wx.showToast({ title: '请输入有效的房屋面积', icon: 'none' });
      return false;
    }
    
    if (!data.totalPrice || isNaN(parseFloat(data.totalPrice))) {
      wx.showToast({ title: '请输入有效的房屋总价', icon: 'none' });
      return false;
    }
    
    if (!data.originalPrice || isNaN(parseFloat(data.originalPrice))) {
      wx.showToast({ title: '请输入有效的原登记价', icon: 'none' });
      return false;
    }
    
    return true;
  },
  
  // 验证新房输入
  _validateNewHouse() {
    const data = this.data.newHouse;
    
    if (!data.houseArea || isNaN(parseFloat(data.houseArea))) {
      wx.showToast({ title: '请输入有效的房屋面积', icon: 'none' });
      return false;
    }
    
    if (!data.totalPrice || isNaN(parseFloat(data.totalPrice))) {
      wx.showToast({ title: '请输入有效的房屋总价', icon: 'none' });
      return false;
    }
    
    return true;
  }
});