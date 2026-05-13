var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({
  data: {
    mapheight:0,
    commercialTotal: 1000000,
    houseArea:100,
    persqmPrice:10000,
    gjjTotal: 500000,
    tabs: ["商业贷款", "公积金贷款", "组合贷款"],
    activeIndex: 0,
    loansType: ['按房价总额', '按贷款总额',"按房屋面积单价"],
    loanIndex: 0,
    rates:0,
    fundrates:0,
    rateIndex0: 0,
    rateIndex1: 0,
    percentArrName: ["8成","7.5成","7成","6.5成","6成","5.5成","5成","4.5成","4成","3.5成","3成","2.5成","2成"],
    percentArr: [8,7.5,7,6.5, 6,5.5, 5,4.5, 4, 3.5,3,2.5,2],
    percentIndex:2,
    years:20,
    yearIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    lprList:"",
    ratesfocus:0,
    fundratesfocus:0,
    commercialTotalfocus:0,
    gjjTotalfocus:0,
    totalTitle:"房价总额",
    gjjtotalTitle:"房价总额",
    downPay:0,//20230325新增首付字段
    baselpr:[
      { key: 0, name: "一年期利率",content: "3.70%"},
      { key: 1, name: "五年期利率",content: "4.60%"},
      { key: 2, name: "公积金利率",content: "3.25%"}
    ],
    newlist:"",
    condition:false,
    picurl:"cloud://mortgagecalculator-9d0fqf0fbb151.6d6f-mortgagecalculator-9d0fqf0fbb151-1311269700/",
    // 商业贷款半遮罩弹窗变量
    showModal: false,        // 商业利率弹窗显示控制
    showfundModal:false,// 公积金利率弹窗弹窗显示控制
    interestRate:0,    // 当前选择的商业利率值
    interestfundRate:0, // 当前选择的公积金利率值
    tempRate:0,       // 临时存储的商业利率值
    tempfundRate:0,// 临时存储的公积金利率值
    inputFocus: false,        // 商业利率输入框聚焦状态
    inputfundFocus: false,        // 公积金利率输入框聚焦状态
    rate_45basic:0,
    rate_30basic:0,
    rate_5basic:0,
    rate_0basic:0,
    gjj_basic:0,
    gjj_2_basic:0,//第二套公积金利率弹窗
    // 公积金贷款半遮罩弹窗变量
    interestgjjRate:0,    // 当前选择的利率值
    tempgjjRate:0,       // 临时存储的利率值
    
    //新增云存储利率变量
    cloud_syrates:0,
    cloud_fundrates:0,
    cloud_2_fundrates:0,
    // 总额角标样式逻辑
    inputValue: '',
    currentUnit: '',
    unitList: ['', '万', '十万', '百万', '千万', '亿'],
    unitValues: [1, 10000, 100000, 1000000, 10000000, 100000000]
  },
  // 广告加载模块
  adLoad() {
    console.log('原生模板广告加载成功')
  },
  adError(err) {
    console.error('原生模板广告加载失败', err)
  },
  adClose() {
    console.log('原生模板广告关闭')
  },
  async onLoad() {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
          mapheight:wx.getSystemInfoSync().windowHeight
        });
      }
    });
    console.log(parseInt(this.data.sliderOffset));
    console.log(parseInt(this.data.mapheight));

    wx.showLoading({
      title: "数据加载中...",
      mask: true
    })
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
          cloud_syrates:that.data.lprList.standardrate,
          cloud_fundrates:that.data.lprList.gjjrate,
          cloud_2_fundrates:that.data.lprList.gjj_2_rate,
        })
        wx.hideLoading()
        console.log(that.data.lprList);
        console.log(that.data.lprList.year);
      //初设设置基点扣除利率
      that.data.rate_45basic=that.data.cloud_syrates - 0.45
      that.data.rate_30basic=that.data.cloud_syrates - 0.30
      that.data.rate_5basic=that.data.cloud_syrates - 0.05
      that.data.rate_0basic = that.data.cloud_syrates
      that.setData({
        rates:that.data.rate_45basic,//默认利率为-45基点利率
        rate_45basic:that.data.rate_45basic,
        rate_30basic:that.data.rate_30basic,
        rate_5basic:that.data.rate_5basic,
        rate_0basic:that.data.rate_0basic,
        fundrates:that.data.cloud_fundrates,
        gjj_basic:that.data.cloud_fundrates,
        gjj_2_basic:that.data.cloud_2_fundrates,
      })  
      }
    })
    function sortBy (field) {
      //根据传过来的字段进行排序
      return (x, y) => {
        return x[field] - y[field]
      }
    }
    c1.database().collection('Newlist').where({
      _openid: 'new_data'
    }).get({
      success: function(res){
        res.data.sort(sortBy("sort"))
        // res.data 包含该记录的数据
        console.log(res.data);
        that.setData({
          newlist:res.data,
          condition:true
        })
      }
    });

  },
  loanChange(e) {
    this.setData({
      loanIndex: e.detail.value,
    });
    this.data.totalTitle=this.data.activeIndex==0&&this.data.loanIndex==0? "房价总额":"贷款总额"
    this.data.gjjtotalTitle=this.data.activeIndex==1&&this.data.loanIndex==0?"房价总额":"公积金总额"
    this.setData({
      totalTitle:this.data.totalTitle,
      gjjtotalTitle:this.data.gjjtotalTitle
    })
    console.log(this.data.loanIndex);
  },
  //打开商业选择利率弹窗
  ratesChange(e) {
    this.setData({
      showModal: true,
      tempRate: this.data.rates,
      inputFocus: false,
    });
    console.log(this.data.showModal);
  },
  //打开公积金选择利率弹窗
  fundratesChange(e) {
    this.setData({
      showfundModal: true,
      tempfundRate: this.data.fundrates,
      inputfundFocus: false,
      // fundrates: e.detail.value
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
    //20250717新增角标处理判断逻辑
    let value = e.detail.value;
    
    // 处理输入格式，只保留数字和小数点
    value = value.replace(/[^\d.]/g, '');
    
    // 确保只有一个小数点
    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1) {
      const beforeDecimal = value.substring(0, decimalIndex);
      const afterDecimal = value.substring(decimalIndex);
      value = beforeDecimal.replace(/[^\d]/g, '') + afterDecimal;
      // 防止多个小数点
      if (beforeDecimal.replace(/[^\d]/g, '').length > 1) {
        value = value.charAt(0) + '.' + value.substring(2);
      }
    } else {
      value = value.replace(/[^\d]/g, '');
    }

    // 计算当前单位
    let unit = '';
    if (value) {
      const numValue = parseFloat(value);
      for (let i = this.data.unitList.length - 1; i >= 0; i--) {
        if (i === 0) {
          unit = '';
          break;
        }
        if (numValue >= this.data.unitValues[i]) {
          unit = this.data.unitList[i];
          break;
        }
      }
    }
    this.setData({
      commercialTotal: e.detail.value,
      currentUnit: unit
    });
  },
  houseAreaChange(e) {
    this.setData({
      houseArea: e.detail.value
    });
  },
  persqmPriceChange(e) {
    this.setData({
      persqmPrice: e.detail.value
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
      houseArea:null,
      persqmPrice:null,
    })
    wx.showToast({
      title: '内容已清空',
      icon: 'none',
      duration: 1500
    })
  },
  bind_newitem(e){
    var idx = e.currentTarget.id;
    console.log(this.data.newlist[idx].url);
    wx.navigateTo({
      url: '/pages/policy/policy'+"?wxurl="+encodeURIComponent(this.data.newlist[idx].url)
    })
  },
  bind_ratesnullbtn(e){
    this.setData({
      rates:null,
    })
  },
  bind_gjjratesnullbtn(e){
    this.setData({
      fundrates:null,
    })
  },
  bind_commercialTotalbtn(e){
    this.setData({
      commercialTotal:null,
    })
  },
  bind_gjjTotalbtn(e){
    this.setData({
      gjjTotal:null,
    })
  },
  bind_houseAreabtn(e){
    this.setData({
      houseArea:null,
    })
  },
  blur_houseAreanullbut(e){
    this.setData({
      houseAreafocus:0
    })
  },
  focus_houseAreanullbut(e){
    this.setData({
      houseAreafocus:1
    })
  },
  bind_persqmPricebtn(e){
    this.setData({
      persqmPrice:null,
    })
  },
  blur_persqmPricenullbut(e){
    this.setData({
      persqmPricefocus:0
    })
  },
  focus_persqmPricenullbut(e){
    this.setData({
      persqmPricefocus:1
    })
  },
  focus_ratesnullbut(e){
    this.setData({
      ratesfocus:1
    })
  },
  blur_ratesnullbut(e){
    this.setData({
      ratesfocus:0
    })
  },
  focus_fundratesnullbut(e){
    this.setData({
      fundratesfocus:1
    })
  },
  blur_fundratesnullbut(e){
    this.setData({
      fundratesfocus:0
    })
  },
  focus_commercialTotalnullbut(e){
    this.setData({
      commercialTotalfocus:1
    })
  },
  blur_commercialTotalnullbut(e){
    this.setData({
      commercialTotalfocus:0
    })
  },
  focus_gjjTotalnullbut(e){
    this.setData({
      gjjTotalfocus:1
    })
  },
  blur_gjjTotalnullbut(e){
    this.setData({
      gjjTotalfocus:0
    })
  },
  bind_wxyjbanner(e){
    wx.navigateToMiniProgram({
      appId: 'wx0f0148b20ef66721',
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    })
},
//20230219新增贷款年限快速选择按钮
  bind_10years(e){
    this.setData({
      years:10
    })
  },
  bind_20years(e){
    this.setData({
      years:20
    })
  },
  bind_30years(e){
    this.setData({
      years:30
    })
  },
  showDetail() {
    var commercialTotal;
    var gjjTotal;
    var interestRatePerMou0;
    var interestRatePerMou1;
    var totalMouths;
    var downPay;

    // commercialTotal = this.data.loanIndex == 1 || this.data.activeIndex == 2 ? this.data.commercialTotal : this.data.commercialTotal * this.data.percentArr[this.data.percentIndex] / 10;
    // gjjTotal = this.data.loanIndex == 1 || this.data.activeIndex == 2 ? this.data.gjjTotal : this.data.gjjTotal * this.data.percentArr[this.data.percentIndex] / 10;
    if(this.data.loanIndex == 2){
      commercialTotal = this.data.houseArea * this.data.persqmPrice* this.data.percentArr[this.data.percentIndex] / 10;
      gjjTotal = this.data.houseArea * this.data.persqmPrice* this.data.percentArr[this.data.percentIndex] / 10;
    }
    else{
      commercialTotal = this.data.loanIndex == 1 || this.data.activeIndex == 2 ? this.data.commercialTotal : this.data.commercialTotal * this.data.percentArr[this.data.percentIndex] / 10;
      gjjTotal = this.data.loanIndex == 1 || this.data.activeIndex == 2 ? this.data.gjjTotal : this.data.gjjTotal * this.data.percentArr[this.data.percentIndex] / 10;
    }
    interestRatePerMou0 = this.data.rates*0.01;
    interestRatePerMou1 = this.data.fundrates*0.01;
    console.log(interestRatePerMou0);
    console.log(interestRatePerMou1);
    totalMouths = this.data.years * 12;
    //20230325新增首付计算逻辑
    if(this.data.activeIndex == 0){
      if(this.data.loanIndex==0 || 2){
        downPay = (this.data.loanIndex == 0 || this.data.activeIndex == 2 ? this.data.commercialTotal * (1 - this.data.percentArr[this.data.percentIndex] / 10):this.data.houseArea * this.data.persqmPrice * (1 - this.data.percentArr[this.data.percentIndex] / 10)).toFixed(2);
    }
    else{
      downPay = 0;
    }}
    else if(this.data.activeIndex == 1){
      if(this.data.loanIndex==0 || 2){
        downPay = (this.data.loanIndex == 0 || this.data.activeIndex == 2 ? this.data.gjjTotal * (1 - this.data.percentArr[this.data.percentIndex] / 10):this.data.houseArea * this.data.persqmPrice * (1 - this.data.percentArr[this.data.percentIndex] / 10)).toFixed(2);
    }
    else{
      downPay = null;
    }}

    wx.navigateTo({
      url: '/pages/detail/detail?parentActiveIndex=' + this.data.activeIndex + '&commercialTotal=' + commercialTotal + '&gjjTotal=' + gjjTotal + '&interestRatePerMou0=' + interestRatePerMou0 + '&interestRatePerMou1=' + interestRatePerMou1 + '&totalMouths=' + totalMouths + "&downPay=" + downPay
    +"&loanIndex="+ this.data.loanIndex})
    console.log("downPay: "+parseInt(downPay))
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    if(this.data.activeIndex==2){
      this.data.totalTitle = "商业贷总额"
      this.data.gjjtotalTitle = "公积金总额"
      //屎山逻辑：解决新增房屋单价计算模式后loanIndex导致无法显示贷款金额栏的问题
      this.setData({
        loanIndex:0
      })
      console.log("loanIndex: "+parseInt(this.data.loanIndex));
    }
    else{
      this.data.totalTitle=this.data.activeIndex==0&&this.data.loanIndex==0? "房价总额":"贷款总额"
      this.data.gjjtotalTitle=this.data.activeIndex==1&&this.data.loanIndex==0?"房价总额":"公积金总额"
    };
    this.setData({
      totalTitle:this.data.totalTitle,
      gjjtotalTitle:this.data.gjjtotalTitle
    });
    console.log("activeIndex: "+parseInt(this.data.activeIndex));
  },
  get_dblpr(){
    let that = this;
    c1.collection('LPRlist').doc('bb4c2515625b74f6003334886f68a4fe').get({
      success: function(res) {
        // res.data 包含该记录的数据
        console.log(res.data);
        that.setData({
          lprList:res.data
        })
        that.setData({
          rates:that.data.lprList.standardrate,
          fundrates:that.data.lprList.gjjrate
        })
        wx.hideLoading()
        console.log(that.data.lprList);
        console.log(that.data.lprList.year);
      }
    });
  },
  get_dbnew(){
    let that = this;
    function sortBy (field) {
      //根据传过来的字段进行排序
      return (x, y) => {
        return x[field] - y[field]
      }
    }
    c1.collection('Newlist').where({
      _openid: 'new_data'
    }).get({
      success: function(res){
        res.data.sort(sortBy("sort"))
        // res.data 包含该记录的数据
        console.log(res.data);
        that.setData({
          newlist:res.data,
          condition:true
        })
        console.log(that.data.newlist);
      }
    });
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
      title: '房贷计算器2025',
      path: '/pages/mortgage/mortgage',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  // 导航到提前还贷计算器
  navigateToLoanCalculator: function() {
    wx.navigateTo({
      url: '/pages/tiqianhuandai/tiqianhuandai'
    })
  },
  // 导航到房屋税费计算器
  navigateToTaxCalculator: function() {
    wx.navigateTo({
      url: '/pages/fangwushuifeiindex/fangwushuifeiindex'
    })
  },

    // 关闭商业利率弹窗
    closeModal() {
      this.setData({ 
        showModal: false,
        inputFocus: false 
      });
    },
      // 关闭商业利率弹窗
      closefundModal() {
        this.setData({ 
          showfundModal: false,
          inputfundFocus: false 
        });
      },

    // 阻止触摸事件冒泡
    preventTouch() {
      return;
    },
  
    // 选择商业贷款预设利率
    selectPresetRate(e) {
      const rate = e.currentTarget.dataset.rate;
      this.setData({ 
        tempRate: rate,
        inputFocus: false,
      });
      console.log("临时存储利率tempRate："+this.data.tempRate)
    },
        // 选择公积金贷款预设利率
        selectPresetfundRate(e) {
          const rate = e.currentTarget.dataset.fundrate;
          this.setData({ 
            tempfundRate: rate,
            inputFocus: false,
          });
          console.log("临时存储公积金利率tempfundRate："+this.data.tempfundRate)
        },
    // 输入自定义商业利率
    onCustomInput(e) {
      let value = e.detail.value;
      
      // 验证输入是否为有效数字且在0-100范围内
      if (value && !isNaN(value) && value >= 0 && value <= 100) {
        this.setData({ 
          tempRate: value,
          inputFocus: true
        });
      } else if (value === "") {
        this.setData({ 
          tempRate: "",
          inputFocus: true
        });
      }
    },
       // 输入自定义公积金利率
       onFundInput(e) {
        let value = e.detail.value;
        // 验证输入是否为有效数字且在0-100范围内
        if (value && !isNaN(value) && value >= 0 && value <= 100) {
          this.setData({ 
            tempfundRate: value,
            inputfundFocus: true
          });
        } else if (value === "") {
          this.setData({ 
            tempfundRate: "",
            inputfundFocus: true
          });
        }
      },

    // 确认选择的商业利率
    confirmRate() {
      if (!this.data.tempRate) {
        wx.showToast({
          title: '请输入有效利率值',
          icon: 'none'
        });
        return;
      }
      // 确保不超过三位小数
      const rate = parseFloat(this.data.tempRate).toFixed(3);
      
      this.setData({
        rates: rate,
        showModal: false,
        inputFocus: false
      });
      console.log("回显利率rates："+this.data.rates)

      // 显示成功提示
      wx.showToast({
        title: '利率设置成功',
        icon: 'success'
      });
    },
    // 确认选择的公积金利率
    confirmfundRate() {
      if (!this.data.tempfundRate) {
        wx.showToast({
          title: '请输入有效利率值',
          icon: 'none'
        });
        return;
      }
      // 确保不超过三位小数
      const rate = parseFloat(this.data.tempfundRate).toFixed(3);
      
      this.setData({
        fundrates: rate,
        showfundModal: false,
        inputfundFocus: false
      });
      console.log("回显利率fundrates："+this.data.fundrates)

      // 显示成功提示
      wx.showToast({
        title: '利率设置成功',
        icon: 'success'
      });
    },
    // 角标样式逻辑 20250717新增
     // 格式化金额显示
  getFormattedAmount() {
    const { inputValue, currentUnit, unitList, unitValues } = this.data;
    if (!inputValue) return '0元';
    
    const numValue = parseFloat(inputValue);
    
    // 如果没有单位或者是元，直接返回
    if (!currentUnit || currentUnit === '元') {
      return `${numValue.toFixed(2)}元`;
    }
    
    // 找到当前单位的索引
    const unitIndex = unitList.indexOf(currentUnit);
    const unitValue = unitValues[unitIndex];
    
    // 除以单位值得到以该单位为基准的数值
    const formattedValue = numValue / unitValue;
    
    return `${formattedValue.toFixed(4)}${currentUnit}`;
  },
  
  onFocus(e) {
    // 输入框获得焦点时保持单位显示
  },

  onBlur() {
    // 失去焦点时保持单位显示（可选）
  }
});
