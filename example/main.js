const links = [
  {
    name: 'home',
    url: '/home',
    id: 'home'
  },
  {
    name: 'about',
    url: '/about',
    id: 'about'
  }
]

const Home = Vue.extend({
  template: `<div>HOME</div>`
})

const About = Vue.extend({
  template: `<div>ABOUT</div>`
})

const NotFound = Vue.extend({
  template: `<div>404</div>`
})

const App = Vue.extend({
  data() {
    return {
      links
    }
  },
  template: `
    <div>
      <div>
        <ul v-for="link in links">
          <li :key="link.id">
            <router-link :to="link.url">{{link.name}}</router-link>
          </li>
        </ul>
      </div>
      <router-view></router-view>
    </div>
  `
})

const orgRouter = new VueRouter({
  routes: [
    {
      path: '/home',
      component: Home,
      beforeEnter: (to, from, next) => {
        console.log(to.meta)
        next()
      }
    },
    {
      path: '/about',
      component: About
    },
    {
      path: '*',
      component: NotFound
    }
  ]
})

const router = vueRouterWrapper(orgRouter, {
  debug: true
})

const defer = time =>
  new Promise((res, rej) => {
    setTimeout(res, time)
  })

router
  .use(async function checkAuthMid(ctx, next) {
    console.log(`sync passed`)
    ctx.auth = false
    await next()
  })
  .use(async (ctx, next) => {
    // ignore the later middlewares
    if (!ctx.auth) return
    await next()
  })
  .use(async function deferMid(ctx, next) {
    await defer(200)
    console.log(`async passed`)
    await next()
  })

setTimeout(() => {
  router.use(async function dynamicMid(ctx, next) {
    console.log('dynamic added middleware')
    await next()
  })
}, 5000)

new Vue({
  el: '#app',
  components: { App },
  router,
  template: `<App />`
})
