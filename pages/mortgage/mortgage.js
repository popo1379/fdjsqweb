var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    commercialTotal: 1000000,
    gjjTotal: 500000,

    tabs: ["商业贷款", "公积金贷款", "组合贷款"],
    activeIndex: 0,
    loansType: ['按房价总额', '按贷款总额'],
    loanIndex: 0,

    rates: 4.60,
    fundrates:3.25,
    rateIndex0: 0,
    rateIndex1: 0,
    percentArrName: ["8成","7.5成","7成","6.5成","6成","5.5成","5成","4.5成","4成","3.5成","3成","2.5成","2成"],
    percentArr: [8,7.5,7,6.5, 6,5.5, 5,4.5, 4, 3.5,3,2.5,2],
    percentIndex:2,
    years:20,
    yearIndex: 0,

    sliderOffset: 0,
    sliderLeft: 0,

    baselpr:[
      { key: 0, name: "一年期利率",content: "3.70%"},
      { key: 1, name: "五年期利率",content: "4.60%"},
      { key: 2, name: "公积金利率",content: "3.25%"}
    ],
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    console.log(parseInt(this.data.sliderLeft));
    console.log(parseInt(this.data.sliderOffset));
  
  },
  loanChange(e) {
    this.setData({
      loanIndex: e.detail.value
    });
  },
  ratesChange(e) {
    this.setData({
      rates: e.detail.value
    });
  },
  fundratesChange(e) {
    this.setData({
      fundrates: e.detail.value
    });
  },
  rateChange0(e) {
    this.setData({
      rateIndex0: e.detail.value
    });
  },
  rateChange1(e) {
    this.setData({
      rateIndex1: e.detail.value
    });
  },
  percentChange(e) {
    this.setData({
      percentIndex: e.detail.value
    });
  },
  yearChange(e) {
    this.setData({
      yearIndex: e.detail.value
    });
  },
  commercialTotalChange(e) {
    this.setData({
      commercialTotal: e.detail.value
    });
  },
  gjjTotalChange(e) {
    this.setData({
      gjjTotal: e.detail.value
    });
  },
  // 监听贷款期限滑块
  bind_term(e){
    this.setData({
      years:e.detail.value
    }
    )
  },
  bind_policy(e){
    wx.navigateTo({
      url: '/pages/policy/policy'
    })
  },
  bind_Empty(e){
    this.setData({
      rates:null,
      years:1,
      commercialTotal: null,
      gjjTotal: null,
      fundrates:null,
    })
  },

  showDetail() {
    var commercialTotal;
    var gjjTotal;
    var interestRatePerMou0;
    var interestRatePerMou1;
    var totalMouths;
    commercialTotal = this.data.loanIndex == 1 || this.data.activeIndex == 2 ? this.data.commercialTotal : this.data.commercialTotal * this.data.percentArr[this.data.percentIndex] / 10;
    gjjTotal = this.data.loanIndex == 1 || this.data.activeIndex == 2 ? this.data.gjjTotal : this.data.gjjTotal * this.data.percentArr[this.data.percentIndex] / 10;
    interestRatePerMou0 = this.data.rates*0.01;
    interestRatePerMou1 = this.data.fundrates*0.01;
    console.log(interestRatePerMou0);
    console.log(interestRatePerMou1);
    totalMouths = this.data.years * 12;
    wx.navigateTo({
      url: '/pages/detail/detail?parentActiveIndex=' + this.data.activeIndex + '&commercialTotal=' + commercialTotal + '&gjjTotal=' + gjjTotal + '&interestRatePerMou0=' + interestRatePerMou0 + '&interestRatePerMou1=' + interestRatePerMou1 + '&totalMouths=' + totalMouths
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    console.log("activeIndex: "+parseInt(this.data.activeIndex));
  },
//   bind_share(e){
//     return { 
//       title: '房贷计算器2022版',//分享内容(为空则为当前页面文本)
//       path:"pages/mortgage/mortgage",//分享地址 路径，传递参数到指定页面。(为空则为当前页面路径)
//       // imageUrl: '../../imgs/xx.png',//分享的封面图(为空则为当前页面)
// 　　　　success: function (res) {
// 　　　　　　console.log("转发成功:" + JSON.stringify(res));
// 　　　　},
// 　　　　fail: function (res) {
// 　　　　　　console.log("转发失败:" + JSON.stringify(res));
// 　　　　}
//   } 
//   },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '房贷计算器2022版',
      path: '/pages/mortgage/mortgage',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
});