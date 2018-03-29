;(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? (module.exports = factory()) : typeof define === 'function' && define.amd ? define(factory) : (global.vueRouterWrapper = factory())
})(this, function() {
  const TO_KEYS_TO_DELEGATE = ['path', 'query', 'params', 'meta', 'name', 'hash', 'matched']

  const context = {}

  TO_KEYS_TO_DELEGATE.forEach(function(k) {
    Object.defineProperty(context, k, {
      get() {
        return this['to'][k]
      },
      set(val) {
        return (this[`_${k}`] = val)
      },
      enumerable: false
    })
  })

  // inspired by koa-compose
  function compose(middlewares) {
    if (!Array.isArray(middlewares)) throw new TypeError('Middleware stack must be an array!')
    for (const fn of middlewares) {
      if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
    }

    return function(ctx, next) {
      let index = -1
      return dispatch(0)
      function dispatch(i) {
        let fn = middlewares[i]
        if (i <= index) return Promise.reject(new Error('next() called multiple times'))
        if (i === middlewares.length) fn = next
        if (!fn) return Promise.resolve()
        try {
          return Promise.resolve(
            fn(ctx, function next() {
              return dispatch(i + 1)
            })
          )
        } catch (e) {
          return Promise.reject(e)
        }
      }
    }
  }

  // inspired by koa
  function use(middlewares) {
    return function(fn) {
      if (typeof fn !== 'function') throw new Error('middleware must be a function')
      middlewares.push(fn)
      if (this._debug) debug(`use ${fn.name || '-'}`)
      return this
    }
  }

  function createContext(to, from) {
    const ctx = Object.create(context)
    ctx.to = Object.create(to)
    ctx.from = Object.create(from)
    return ctx
  }

  function debug(content) {
    console.log(`%cvue-route-middleware: %c${content}`, 'color: blue', 'color: #333')
  }

  const wrapper = function(routerInstance, initConfig) {
    initConfig = initConfig || {}
    const middlewares = []

    function beforeMids(to, from, next) {
      const mids = compose(middlewares)
      const ctx = createContext(to, from)

      return mids(ctx)
        .then(function() {
          delete ctx.to
          delete ctx.from
          to.meta._ctx = ctx
          next(ctx._path !== to.path ? ctx._path : undefined)
        })
        .catch(next)
    }

    routerInstance.beforeEach(beforeMids)

    Object.defineProperties(routerInstance, {
      use: {
        enumerable: false,
        configurable: false,
        get() {
          return use(middlewares)
        }
      },
      _debug: {
        enumerable: false,
        configurable: false,
        get() {
          return initConfig.debug
        }
      }
    })

    return routerInstance
  }

  return wrapper
})
