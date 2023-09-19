var app = getApp();
var ip = app.globalData.ip
Page({
  data: {
    userInfo: '',
    userId:'',
    openid:'',
    name:'',
    showModal: false,
    showfeedback: false,
    textV:'',
    textF:'',
    nickname:''
  },
  onShow(){
      if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
      var that = this
    }
  },
  onLoad() {
    // console.log(ip)
    let user = wx.getStorageSync('user')
    let userId = wx.getStorageSync('userId')
    let that = this

    wx.setStorageSync('openid',app.globalData.openid )
    that.setData({
      openid:app.globalData.openid
    })

    console.log(user)
    // console.log(phone.length)
    console.log('进入小程序的index页面获取缓存', user)
    this.setData({
      userInfo: user,
      userId: userId,
    })

  },
  getinfo()
  {
    console.log("getinfo")
    let that = this
    wx.getUserProfile({
      desc: '必须授权才可以继续使用',
      success: res => {
        let user = res.userInfo
        // 把用户信息缓存到本地
        wx.setStorageSync('user', user)
        console.log("用户信息", user)
        that.setData({
          userInfo: user,
          nickname: user.nickName
        })
        that.refresh()
      },
      fail: res => {
        console.log('授权失败', res)
      }
    })
  },

  // 退出登录
  loginOut() {
    this.setData({
      userInfo: '',
    })
    wx.setStorageSync('user', null)
    this.refresh()
  },
  //AddressBook
  toAddressBook(){
    wx.navigateTo({
      url: '/pages/AddressBook/AddressBook',
    })
  },
  refresh()
  {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  ceshi()
  {
    wx.navigateTo({
      url: '/pages/ceshi/ceshi',
    })
  },

/**
   * 控制显示
   */
  eject:function(){
    this.setData({
      showModal:true
    })
  },

  /**
   * 点击返回按钮隐藏
   */
  back:function(){
    this.setData({
      showModal:false,
      showfeedback:false
    })
  },


  /**
   * 获取input输入值
   */
  wish_put:function(e){
    this.setData({
      textV:e.detail.value
    })
  },
  feed_put:function(e){
    this.setData({
      textF:e.detail.value
    })
  },
  login() {
    let that = this
    console.log(that)
    console.log(this.data.openid)
    wx.login({
      success(res){
        console.log(res)
        if(res.code != null){
          wx.request({
            method:"POST",
            url: ip+'/user/wxLogin',
            data:{
              code:res.code
            },
            success(res){
              console.log(res)
              if (res.statusCode != 200 ) return
              if(res.data.code == 1){
                //存入用户id
                that.setData({
                  userId:res.data.data.id
                })
                wx.setStorageSync('userId', res.data.data.id)
                that.getinfo()
              }
            }
          })
        }
      },
      fail(res){
        console.log(res)
      }
    })
    // wx.request({
    //   url: ip+'/app/user/login', //接口
    //   header: { 
    //     'content-type': "application/json"
    //    }, 
    //   method: "POST", 
    //   data: {
    //     wx_id:that.data.openid,
    //     // wx_id:"wxtest"
    //   },
    //   success (res) {
    //     console.log(res.data)
    //     if(res.data.status_code==1)
    //     {
    //       console.log("成功登录")
    //       console.log(res.data.data)
    //       that.setData({
    //         phonenumber:res.data.data.user_phone
    //       })
    //       wx.setStorageSync('phonenumber', res.data.data.user_phone)
    //       wx.setStorageSync('token', res.data.data.token)
    //       that.getinfo()
    //     }
    //     else if(res.data.status_code==0)
    //     {
    //       console.log("跳转到注册界面")
    //       that.eject()
    //     }
    //   },
    //   fail(err)
    //   {
    //     console.log("失败")
    //   }
    // })
  },
  signup() {
    let that = this;
    wx.getUserProfile({
      desc: '必须授权才可以继续使用',
      success: res => {
        let user = res.userInfo
        // 把用户信息缓存到本地


        wx.request({
          url: ip+'/app/user/signUp', //接口
          header: {
            'content-type': "application/json"
          },
          method: "POST",
          data: {
            user_phone: that.data.userId,
            user_nickname: user.nickName,
            wx_id: that.data.openid,
            password: 'robot',
          },
          success(res) {
            console.log("原有数据",that.data)
            console.log("注册中",res.data)
            if (res.data.status_code == 1) {
              wx.showToast({
                title: '注册成功',
              })
              wx.setStorageSync('user', user)
              console.log("用户信息", user)
              that.setData({
                userInfo: user,
                nickname: user.nickName
              })
              that.login()
            }
            else{
              wx.showToast({
                icon : 'error',
                title: '注册失败',
              })
            }
          },
          fail(err) {
            console.log("失败")
          }
        })


      },
      fail: res => {
        console.log('授权失败', res)
      }
    })

  },
  feedback()
  {
    // console.log("yes")
    this.setData({
      showfeedback:true
    })
    // console.log(this.data.showfeedback)
  },
  /**
   * 点击确定按钮获取input值并且关闭弹窗
   */
  ok:function(){
    let that = this;
    console.log("输入内容",that.data.textV)
    that.setData({
      showModal:false,
      userId:that.data.textV
    })
    // wx.setStorageSync('phonenumber', that.data.textV)
    that.signup()
  },
  okback()
  {
    let that = this.data.textF
    console.log("输入内容",this.data.textF)
    this.setData({
      showfeedback:false
    })

    wx.request({
      url: ip+'/app/user/addFeedBack', //接口
      header: {
        'content-type': "application/json",
        'token':wx.getStorageSync('token')
      },
      method: "POST",
      data: {
        feedback_info: that
      },
      success(res) {
        if (res.data.status_code == 1) {
          wx.showToast({
            title: '发送成功',
          })
        }
        else{
          wx.showToast({
            title: '超过日反馈次数',
            icon: 'error',
          })
        }
      },
      fail(err) {
        
        console.log("反馈失败")
      }
    })
  }
})
