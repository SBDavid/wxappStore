const wxappStore = {
  createPage: function (option, store) {

    let setData;
    const onLoad = option.onLoad || function () { };

    store = store || {};
    store.mutations = store.mutations || {};
    store.actions = store.actions || {};
    store.setDataCallbacks = {};

    store.commit = function ({ name, payload }) {
      var mutation = store.mutations[name].bind(this);
      mutation({
        setData,
        payload,
        data: option.data
      })
    }

    store.dispatch = function ({ name, payload }) {
      var action = store.actions[name].bind(this);
      action({
        commit: this.commit,
        payload,
        data: option.data
      })
    }

    store.addSetDataCallback = function ({ name, callback }) {
      const Callbacks = store.setDataCallbacks[name] || (store.setDataCallbacks[name] = []);
      Callbacks.push(callback);
    }

    option.onLoad = function () {
      // 得到Page对象中的setData方法
      setData = function (payload) {

        this.setData(payload);

        for (var name in store.setDataCallbacks) {
          if (payload[name]) {
            store.setDataCallbacks[name].forEach(function (callback) {
              callback(payload[name]);
            });
          }
        }
      }.bind(this);

      // 注入store
      this.store = store;
      onLoad.call(this);
    }

    return option;
  },
  createComp: function(option) {
    // 保存初始的ready回调方法
    const ready = option.ready || function () { };

    // 拦截ready方法
    option.ready = function() {
      const setData = this.setData.bind(this);
      // 保存当前page对象
      this.page = getCurrentPages()[getCurrentPages().length - 1];
      this.store = this.page.store;

      this.getGlobalData = ({globalDataKey, localDataKey}) => {
        this.store.addSetDataCallback({
          name: globalDataKey,
          callback: (payload) => {
            setData({
              [localDataKey]: payload
            })
          }
        });
        
        setData({
          [localDataKey]: this.page.data[globalDataKey]
        })
      }

      ready.call(this);
    }

    return option;
  }
};

export default wxappStore;