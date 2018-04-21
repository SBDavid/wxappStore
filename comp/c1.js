// comp/c1.js

import wxappStore from "../lib/Store.js";

Component(wxappStore.createComp({
  properties: {
    localtimeProps: {
      type: String
    }
  },
  data: {
    localtimeData: ''
  },
  ready: function () {

    this.getGlobalData({ globalDataKey: 'localtime', localDataKey: 'localtimeData' });

    setInterval(() => {
      this.store.commit({
        name: 'testMutation',
        payload: (new Date()).toLocaleTimeString()
      })
    }, 1000)
  }
}))
