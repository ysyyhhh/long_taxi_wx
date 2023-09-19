// pages/getpos/getpos.js
const initTop = 575
const fullTop = 300
const gpsutil = require('GPS.js')
var app = getApp();
var ip = app.globalData.ip
var token = wx.getStorageSync('token')
const util = require('../../utils/util')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderData: '',
    latitude: 39.9908542380864,
    longitude: 116.42740312316894,
    markers: [{
      id: 2,
      width: 45,
      height: 45,
      latitude: 39.9908542380864,
      longitude: 116.42740312316894,
      name: '车',
      iconPath: '/img/car.png',
    },{
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
    polylines: [{
      points:[],
      // points: [{
      //   latitude: "39.9908542380864",
      //   longitude: "116.427403123168942"
      // },
      // {
      //   latitude: "31.792017041269684",
      //   longitude: "120.02106965196045"
      // },
      // {
      //   latitude: "31.804600509310646",
      //   longitude: "120.0229725240544"
      // }
    // ],
      color: "#FF9900",
      width: 4,
      borderWidth: 1 //线的边框宽度，还有很多参数，请看文档 
    }],
    car:null,
    updateTime: '',
    car_type: '京龙启行1号',
    arrival_time: '9-10 12:11',
    margintop: initTop,
    isFullShow: false,
    starty: 0, //开始的位置x
    endy: 0, //结束的位置y
    critical: 100, //触发翻页的临界值
    GPSInterval: '',
    controlGetGPS:true,
  },



  async getGPS() {
    console.log('获取gps')
    var that = this
    let token = wx.getStorageSync('token')

    await wx.request({
      url: ip + '/carApi/getGPS',
      method: "POST",
      data: {
        "car_id": that.data.car_id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        'token': wx.getStorageSync('token')
      },
      success(res) {
        var marker = that.data.markers
        console.log(res.data)
        // console.log(nowDate)
        // let nowDate = new Date()
        // console.log(nowDate - that.data.updateTime)
        if (res.data.status_code == 1) {
          var gcj = gpsutil.gcj_encrypt(res.data.data.latitude, res.data.data.longitude)
          console.log(gcj)
          marker[0].latitude = gcj.lat
          marker[0].longitude = gcj.lon
          // marker[0].latitude = res.data.data.latitude
          // marker[0].longitude = res.data.data.longitude
          that.setData({
            markers: marker,
            // updateTime:nowDate
          })
        }
      }
    })
  },

  async updateOrderData(){
    let that = this
    wx.request({
      url: ip+'/order/getOrder/'+that.data.orderData.id,
      method:"GET",
      success(res){
        if (res.data.code == 1){
          let orderData = res.data.data
          if(orderData == null) return
          if (orderData.status >= 5){
            clearInterval(that.data.GPSInterval)
          }
          orderData.status = util.switchStatus(orderData.status)
          that.setData({
            orderData:res.data.data
          })
        }
      }
    })
  },
  async updateCarData() {
    let that = this
    let orderId = that.data.orderData.id
    wx.request({
      url: ip + '/car/getCarByOrderId/'+orderId, //接口
      method: "GET",
      success(res) {
        console.log(res.data)
        if (res.data.code == 1 && res.data.data != null) {
          console.log(res.data.data)
          that.setData({
            car:res.data.data,
            "markers[0].latitude": res.data.data.latitude,
            "markers[0].longitude": res.data.data.longitude,
          })
          that.getRoute()
        }else{
          that.setData({
            car:null
          })
        }
      },
      fail(err) {
        console.log("请求位置错误")
      }
    })
  },
  getRoute(){
    if (this.data.car == null || this.data.car == {}) return
    let that = this;
    console.log(that.data.car)
    wx.request({
      url: ip + '/api/car/getRoute/' + that.data.car.id, //接口
      method: "GET",
      success(res) {
        console.log("获取路径")
        console.log(res)
        if(res.data.code==1)
        {
          let tmp = res.data.data;
          let points = []
          for(let i = 0;i< tmp.length;i++){
            let point = 
              {
                latitude: tmp[i].lat,
                longitude: tmp[i].lon,
              }
            points.push(point)
          }
          let p = that.data.polylines
          p[0].points = points
          that.setData({
            polylines:p
          })
          console.log(that.data.polylines)

        }
      },
      fail(err) {
        console.log("请求绘图路线错误")
      }
    })
  },
  godetail(e) {
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/receive_detail/receive_detail?id=' + e.currentTarget.dataset.id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let order = JSON.parse(options.order)
    console.log(order)
    this.setData({
      orderData: order,
      latitude:order.startLat,
      longitude:order.startLon
    })
    var marker = this.data.markers
    marker[2].latitude = order.endLat
    marker[2].longitude = order.endLon
    marker[1].latitude = order.startLat
    marker[1].longitude = order.startLon

    this.setData({
      markers: marker,
      updateTime: new Date()
    })
    let that = this
    if (that.data.orderData.status != "已完成" && that.data.orderData.status != '已取消' && that.data.controlGetGPS == true) {
      console.log("开始获取gps")
      // var begin_time=new Date();
      var GPSInterval = setInterval(() => {
        // console.log("获取一道轨迹"); //这里写逻辑代码
        that.updateCarData()
        that.updateOrderData()
      }, 1500);
      that.setData({
        GPSInterval: GPSInterval
      })
    }
    // this.updateCarData()
  },
  upOrDown() {
    let that = this
    let suffix = '/confirmDown'
    if(this.data.orderData.status == '等待乘客上车'){
      suffix = '/confirmUp'
    }
    console.log('上车或下车')

    wx.request({
      url: ip + '/order'+suffix, //接口
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      method: "POST",
      data: {
        orderId: that.data.orderData.id
      },
      success(res) {
        console.log(res.data)
        if (res.data.code == 1) {
          wx.showToast({
            title: '确认成功',
            icon: 'none',
            duration: 2000
          })
        } else {
          // console.log()
          wx.showToast({
            title: '状态异常',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail(err) {
        console.log("失败")
      }
    })
  },
  cancel(){
    let orderId = this.data.orderData.id
    wx.request({
      url: ip+'/order/cancel',
      method:"POST",
      data:{
        orderId:orderId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      success(res){
        console.log(res)
        if(res.data.code == 1){
          wx.showToast({
            title: '取消成功',
            icon: 'none',
            duration: 2000
          })
          wx.switchTab({
            url: '../receive/receive',
          })
        }else{
          wx.showToast({
            title: '无法取消',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  touchMap() {
    if (this.data.isFullShow != false) {
      this.setData({
        isFullShow: false,
        margintop: initTop,
      })
    }
  },
  scrollTouchstart: function (e) {
    console.log('scrollTouchstart ')
    console.log(e)
    let py = e.touches[0].pageY;
    this.setData({
      starty: py
    })
  },
  scrollTouchmove: function (e) {
    // console.log('scrollTouchmove ')
    // console.log(e)
    let py = e.touches[0].pageY;
    let d = this.data;
    this.setData({
      endy: py,
    })
    if (d.margintop <= initTop && d.margintop >= fullTop) {
      // console.log(py - d.starty)
      let iTop = 100
      if (d.isFullShow == true) {
        iTop = fullTop
      } else {
        iTop = initTop
      }
      this.setData({
        margintop: iTop + py - d.starty
      })
    }

  },
  scrollTouchend: function (e) {
    console.log("scrollTouchend")
    console.log(e)
    let d = this.data;
    let cha = d.endy - d.starty
    console.log('相差 ' + cha)
    if (d.endy - d.starty < -100 && d.isFullShow == false) {
      this.setData({
        isFullShow: true
      })
    } else if (d.endy - d.starty > 100 && d.isFullShow == true) {
      this.setData({
        isFullShow: false
      })
    }
    console.log("isFullShow " + d.isFullShow)
    let nowMargintop = 0
    if (d.isFullShow == false) {
      nowMargintop = initTop
    } else {
      nowMargintop = fullTop
    }
    this.setData({
      starty: 0,
      endy: 0,
      margintop: nowMargintop
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('myMap')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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
    // var interval = this.data.GPSInterval;
    clearInterval(this.data.GPSInterval)
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

  }
})