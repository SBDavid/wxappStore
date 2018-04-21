//logs.js
const util = require('../../utils/util.js');
import wxappStore from "../../lib/Store.js";

Page(wxappStore.createPage({
  data: {
    localtime: ''
  },
  onLoad: function () {
    this.store.commit({
      name: 'testMutation',
      payload: '开始显示当前日期（内页）'
    });
  }
},
{
  mutations: {
    testMutation: function ({ setData, payload, data }) {
      setData({
        localtime: payload
      });
    }
  }
}));
