Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [    {
      "pagePath": "/pages/send/send",
      "iconPath": "/img/send.png",
      "selectedIconPath": "/img/send-select.png",
      "text": "我要打车"
    },

    {
      "pagePath": "/pages/order/order",
      "text": "我的订单",
      "iconPath": "/img/order.png",
      "selectedIconPath": "/img/order-select.png",
    },   
     {
      "pagePath": "/pages/index/index",
      "text": "个人中心",
      "iconPath": "/img/mine.png",
      "selectedIconPath": "/img/mine-select.png",
    },
]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      let phone = wx.getStorageSync('phonenumber')
      // this.setData({
      //   selected: data.index
      // })
    }
  }
})