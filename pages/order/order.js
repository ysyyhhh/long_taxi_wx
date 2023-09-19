var app = getApp()
var ip = app.globalData.ip
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderTypes:['进行中','已完成'],
    selectType:'进行中',
    userId:null,
    completedList:[],
    runingList:[],
    showList:[],

    orderList:[],
    acceptlist:[],
    sendlist:[],
    waitPayList:[],
    tempOrder:{
      accept_address: "实验楼",
      note: null,
      order_create_time: "2021-11-05 20:23:36",
      order_id: "O-000010",
      order_status: "待收件",
      send_address: "教学楼"
    }
  },
  switchStatus(e){
    return util.switchStatus(e)
  },
  tapSelectType(e) {
    console.log(e)
    this.setData({
      selectType: e.currentTarget.id
    })
    this.updateShow()
  },
  onShow(){
    if (typeof this.getTabBar === 'function' &&
    this.getTabBar()) {
    this.getTabBar().setData({
      selected: 1
    })
    var that = this
    this.updateData()
  }
  },
  updateShow(){
    let showList = this.data.runingList
    if(this.data.selectType == "已完成"){
      showList = this.data.completedList
    }
    this.setData({
      showList:showList
    })
  },
  updateData(){
    this.setData({
      waitPayList:[],
      userId:wx.getStorageSync('userId')
    })
    // this.data.userId=wx.getStorageSync('userId')
    console.log(this.data)
    let that = this
    wx.request({
      method:"GET",
      url: ip+'/order/getList/'+that.data.userId,
      success(res){
        console.log(res)
        if(res.data.code == 1){
          let orderList = res.data.data
          let completedList = []
          let runingList = []
          for(let i = 0;i < orderList.length;i++){
            if(orderList[i].status < 5){
              orderList[i].status = that.switchStatus( orderList[i].status )
              runingList.push(orderList[i])
            }else{
              orderList[i].status = that.switchStatus( orderList[i].status )
              completedList.push(orderList[i])
            }
          }
          that.setData({
            completedList:completedList,
            runingList:runingList
          })
          that.updateShow()
        }
      },
      fail(res){
        console.log(res)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.updateData()
    // console.log(this.data.acceptlist)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.updateData()
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // this.updateData()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // this.updateData()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    setTimeout(function()
    {
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
    },1000);
    this.updateData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  godetail(e)
  {
    console.log(e.currentTarget.dataset.id)
    console.log(e.currentTarget.dataset.order)
    let orderData = e.currentTarget.dataset.order

    let str = JSON.stringify(orderData)
    // console.log(e)
    // wx.navigateTo({
    //   url: '/pages/receive_detail/receive_detail?id=' + e.currentTarget.dataset.id,
    // })
    // wx.navigateTo({
    //   url: '/pages/getpos/getpos?id=' + orderData.order_id + '&phone=' + this.data.phonenumber + '&accept_address='+orderData.accept_address + '&send_address='+orderData.send_address+'&order='+str
    // })
    wx.navigateTo({
      url: '/pages/getpos/getpos?order='+str
    })
  },
})



