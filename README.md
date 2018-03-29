# Vue-Route-Middleware

A simple koa-like middleware wrapper for vue-router

## Caution

This module is still being developed and no guaruntee on production enviorment

## Features

* Koa-like api
* Support either async or sync middleware
* A context object to store data through the whole routing lifecycle

## Install

By script tag

```html
<script src="cdn/vue.js"></script>  
<script src="cdn/vue-router.js"></script>  
<script src="node_modules/vue-router-middleware/lib/index.js"></script>  
```

By commonjs

```bash
npm install vue-router-middlewares -S
```

```js
import vueRouterWrapper from 'vue-router-middlewares'
// or
const vueRouterWrapper = require('vue-router-middlewares')
```

## How to use

Here is a simple snippet to show the use case

```js
// create a vue-router instance
const originRouter = new VueRouter({
  ...// here your routes config
})

// wrapped it with vue-route-middleware
const router = vueRouterWrapper(originRouter, { debug: true })

// support chainning
router
  // async middleware
  .use(async(ctx,next) => {
    const res = await fetch('/path/to/api')
    await next()

    // logic if passed later middleware
    remoteLog()
  })

  // sync middleware
  .use((ctx,next) => {
    next()
  })

  .use((ctx,next) => {
    // ignore the later middlewares
    if(!ctx.auth) return
    next()
  })

  // stop routing if getting errors
  .use(ctx,next) => {
    throw new Error('oops')
  })

new Vue({
  router
}).$mount('#app')
```

the complete example could be found in the repo.

## Context

I've delegate some params from origin vue-router instance to the ctx object passed to the middleware.

'path', 'query', 'params', 'meta', 'name', 'hash', 'matched' from to-router-instance are mapped to ctx[key]

remember they are just writeable params, if you try to set value on them, it will generate or overwrite ctx[_key]

and if you rewrite ctx.path, if the middlewares all passed, the router will change its destination like a redirecting.
