const switchStatus = function (e){
  if (e == 0){
    return "待分配车辆"
  }else if (e==1){
    return "待到达起点"
  }else if (e==2){
    return "等待乘客上车"
  }else if (e==3){
    return "待到达终点"
  }else if (e==4){
    return "等待乘客下车"
  }else if (e == 5){
    return "已完成"
  }else if(e==6){
    return "已取消"
  }else{
    return "异常状态"
  }
}
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

var solveyear = function (s) {
  // console.log(s[0]+s[1]+s[2]+s[3])
  return (s[0]+s[1]+s[2]+s[3]);
}
var solvemouth = function (s) {
  return (s[5]+s[6]);
}
var solveday = function (s) {
  return (s[8]+s[9]);
}
var solvehour = function (s) {
  return (s[11]+s[12]);
}
var solveminute = function (s) {
  return (s[14]+s[15]);
}
var chuli = function (s) {
  if(s.length==1)
  {
    return "0"+s;
  }
  else
  return s;
}

module.exports = {
  solveyear: solveyear,
  solvemouth: solvemouth,
  solveday: solveday,
  solvehour: solvehour,
  solveminute: solveminute,
  switchStatus:switchStatus,
}