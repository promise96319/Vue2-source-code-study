let _Vue

const install = (Vue) => {
  _Vue = Vue
  Vue.mixin({
    beforeCreate () {
      const options = this.$options
      if (options.router) {
        this.$router = options.router
      } else {
        this.$router = this.$parent.$router
      }
      this.$router.init(this)
      Vue.util.defineReactive(this, '_route', this.$router.currentRoute)
    }
  })
}

class Route {
  constructor ({ name, path, component }) {
    this.name = name
    this.path = path
    this.component = component
  }
}

class History {
  constructor(router) {
    this.router = router
  }

  // path
  push(location, cb) {
    const route = this.router.match(location)
    console.log('history ==> ', history);
    history.pushState({ time: Date.now() }, null, route.path)
    cb && cb(route)
  }
}

class VueRouter {
  constructor (options) {
    this.routes = options.routes
    this.app = null
    this.apps = []
    this.history = new History(this)
  }

  match(location) {
    const matched =  this.routes.find((route) => {
      return route.path === location || route.name === location.name
    }) || { path: '/' }
    return new Route(matched) 
  }

  init(app) {
    this.app = app
    this.apps.push(app)
  }

  push(location) {
    this.history.push(location, (route) => {
      // 当前route
      this.currentRoute = route
      // 更新实例route
      this.apps.forEach(app => {
        app._route = route
      })
    })
  }
}



// export default {
//   VueRouter,
//   install
// }

window.VueRouter = VueRouter

if (window.Vue) {
  install(window.Vue)
}