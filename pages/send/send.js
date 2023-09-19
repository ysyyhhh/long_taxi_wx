// pages/send/send.js
var utils = require('../../utils/util.js')
var tmp1 = '';
var tmp2 = '';
var app = getApp();
var ip = app.globalData.ip
var commonKey = app.globalData.commonKey
var token = wx.getStorageSync('token')
// 13261599399
Page({
  properties: {
    text: {
      type: String,
      value: ''
    }

  },
  /**
   * 页面的初始数据
   */
  data: {
    latitude: 39.9908542380864,
    longitude: 116.42740312316894,
    centerImgPath:"../../img/marker.png",
    selectMarker:{//默认要是终点
      id: 2,
      width: 45,
      height: 45,
      latitude: 39.9908542380864,
      longitude: 116.42740312316894,
      name: '终点',
      iconPath: '/img/endMarker.png',
    },
    markers: [{
      id: 0,
      width: 45,
      height: 45,
      latitude: 39.9908542380864,
      longitude: 116.42740312316894,
      name: '起点',
      iconPath: '/img/startMarker.png',
    }, {
      id: 1,
      width: 45,
      height: 45,
      latitude: 39.9908542380864,
      longitude: 116.42740312316894,
      name: '终点',
      iconPath: '/img/endMarker.png',
    }],
    changeIndex:1,//默认终点marker会被改变,0是起点,1是终点,2是完成
    isSave:false,//用来判断是否保存
    polylines: [],
    inputTxt: 'testInput',
    candidateList: [],
    is_focus: false,
    userId: '',
    index: 0,
    index1: 0,
    showModal: false,
    showobjectback: false,
  },
  commit(){
    let that = this
    let startMarker = this.data.markers[0]
    let endMarker = this.data.markers[1]

    wx.showModal({
      title: '确认信息',
      content: '你确定要提交发件信息吗',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          //在此与反馈接口连接
          wx.request({
            url: ip + '/order/new', //接口
            method: "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
            data: {
              userId:that.data.userId,
              startLon:startMarker.longitude,
              startLat:startMarker.latitude,
              endLon:endMarker.longitude,
              endLat:endMarker.latitude
            },
            success(res) {
              console.log(res)
              console.log(res.data.data)
              if (res.data.status_code == 1) {
                wx.showToast({
                  title: '提交成功',
                  icon: 'success',
                  duration: 2000
                })

              } else {
                wx.showToast({
                  title: res.data.data,
                  icon: 'error',
                  duration: 2000
                })
              }
              wx.switchTab({
                url: '../receive/receive',
              })
            },
            fail(err) {
              console.log("fail")
              console.log(err)
              wx.showToast({
                title: '提交信息有误',
                icon: 'warn',
                duration: 2000
              })
              console.log("失败")
            }
          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  
  saveMarker(){
    if(this.data.isSave){
      return
    }
    console.log("before save")
    console.log(this.data.markers)
    const i = this.data.changeIndex
    let selectMarker = this.data.selectMarker
    
    const preMarkers = this.data.markers
    let markers = []
    if(i == 0){
      //改变的是起点
      markers = [selectMarker,preMarkers[0]]
    }else if(i==1){
      //改变的是终点
      markers = [preMarkers[0],selectMarker]
    }

    //保存之后markers一定有两个
    this.setData({
      selectMarker:{},
      markers:markers,
      changeIndex:2,
      isSave:true,
    })
  },
  resetSelectMarkerPos(lon,lat){
    let selectMarker = this.data.selectMarker
    selectMarker.longitude = lon
    selectMarker.latitude = lat
    this.setData({
      selectMarker:selectMarker
    })
  },
  regionChange(e) {
    if (this.data.isSave) return
    console.log(e)
    if(e.detail.type == "begin"){
      return
    }
    //改变位置
    this.resetSelectMarkerPos(e.detail.centerLocation.longitude,e.detail.centerLocation.latitude)
  },
  tapChangeMarker(e){
    // this.setData({
    //   isSave:false
    // })
    let value = e.currentTarget.dataset
    this.changeChoiceMarker(value.id)
  },
  changeChoiceMarker(i){
    //一定要先保存再改变,这样才能通过下标来取marker
    this.saveMarker()
    console.log("after save")
    console.log(this.data.markers)
    //此时markers一定有两个
    let centerPath = "../../img/endMarker.png"
    if(i == 0){
      //改变起点
      centerPath = "../../img/startMarker.png"
    }
    const preMarkers = this.data.markers

    const selectMarker = preMarkers[i]
    console.log(preMarkers)
    let markers = [preMarkers[1]]
    if(i == 1){
      markers[0] = preMarkers[0]
    }
    console.log(selectMarker)
    console.log(markers)
    this.setData({
      changeIndex:i, 
      isSave:false,
      centerImgPath:centerPath,
      selectMarker:selectMarker,
      markers:markers,
      longitude:selectMarker.longitude,
      latitude:selectMarker.latitude
    })
  },
  touchMap(e) {
    if (this.data.isSave){
      //已保存了就不能修改
      return 
    }
    console.log(e)
    //改变当前中心点，并reset
    this.setData({
      longitude: e.detail.longitude,
      latitude: e.detail.latitude
    })
    this.resetSelectMarkerPos(e.detail.longitude,e.detail.latitude)
  },
  confirmPos(e) {
    console.log(this.data)
    console.log(this.mapCtx)
    this.mapCtx.getCenterLocation({
      success: function (res) {
        console.log(res.longitude)
        console.log(res.latitude)
      }
    })
  },
  update() {
    let phone = wx.getStorageSync('phonenumber')
    let openid = wx.getStorageSync('openid')
    // this.initCommon()
    this.setData({
      openid: openid,
    })
  },
  changeMarker(index,lon,lat){
    let markers = this.data.markers
    markers[index].lon = lon
    markers[index].lat = lat
    console.log(index,markers)
    // console.log(markers)
    this.setData({
      markers:markers
    })
    console.log(this.data.markers)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userId = wx.getStorageSync('userId')
    let openid = wx.getStorageSync('openid')
    this.setData({
      openid: openid,
      userId:userId
    })

    let that = this
    wx.getLocation({
      type: 'gcj02',
      success (res) {
        console.log("初始化起点终点为当前位置")
        console.log(res.longitude,res.latitude)
        that.changeMarker(0,res.longitude,res.latitude)
        that.changeMarker(1,res.longitude,res.latitude)

        console.log("after change")
        console.log(that.data.markers)
        that.changeChoiceMarker(that.data.changeIndex)
      }
     })
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.onReady()
    console.log("ready")
    //创建 map 上下文 MapContext 对象。
    this.mapCtx = wx.createMapContext('myMap')
    console.log("ready")
    console.log(this.mapCtx)
  },
  // 点击空白的地方（点击地图时触发，2.9.0起返回经纬度信息）

  getCenterLocation: function () {
    this.mapCtx.getCenterLocation({
      success: function (res) {
        console.log(res)
        console.log(res.longitude)
        console.log(res.latitude)
      }
    })
  },
  touchEnd: function () {
    this.getCenterLocation()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    token = wx.getStorageSync('token')
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
      var that = this
    }
    this.update()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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


  back: function () {
    this.setData({
      showModal: false,
      showobjectback: false
    })
  },
 
  objectback() {
    // console.log("yes")
    this.setData({
      showobjectback: true
    })
  },


})