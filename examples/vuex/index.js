let _Vue

class Store {

  constructor(options = {}) {
    const { state, mutations, actions, getters } = options
    this.mutations = mutations
    this.actions = actions
    this.getters = getters
    let computed = {}
    const self = this
    Object.entries(getters).map(([getterName, getter]) => {
      computed[getterName] = () => {
        return getter(this.state)
      }
      Object.defineProperty(this.getters, getterName, {
        get() {
          return self._vm[getterName]
        }
      })
    })

    this._vm = new _Vue({
      data: {
        $$state: state
      },
      computed: {
        ...computed
      }
    })
    // console.log('this._vm._data.$$state ==> ', this._vm._data.$$state);
    // this.state = state

    // this.state = _Vue.observable(state)
  }

  get state () {
    return this._vm._data.$$state
  }

  // set state (err) {
  //   console.log('err ==> ', err);
  // }

  commit(type, payload) {
    const handler = this.mutations[type]
    console.log('this.state ==> ', this.state);
    handler(this.state, payload)
  }

  dispatch(type, payload) {
    const handler = this.actions[type]
    
    handler(this.state, payload)
  }
}

function install(Vue) {
    _Vue = Vue
    Vue.mixin({
      beforeCreate () {
        const options = this.$options
        if (options.store) {
          this.$store = options.store
        } else if (options.parent && options.parent.$store) {
          this.$store = options.parent.$store
        }
      }
    })
  }

window.Vuex = {
  Store,
  install
}

