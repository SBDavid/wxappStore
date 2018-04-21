//index.js
//获取应用实例
const app = getApp()

import wxappStore from "../../lib/Store.js";

Page(wxappStore.createPage({
  data: {
    localtime: ''
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    this.store.dispatch({ 
      name: 'testAction',
      payload: '开始显示当前日期（首页）'
    });
  }
}, {
  mutations: {
    testMutation: function({ setData, payload, data }) {
      setData({
        localtime: payload
      });
    }
  },
  actions: {
    testAction: function ({ commit, payload, data }) {
      commit({
        name: 'testMutation',
        payload: payload
      });
    }
  }
}))