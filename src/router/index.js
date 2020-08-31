import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import '../assets/css/global.css'
import Home from '../components/home.vue'


Vue.use(VueRouter)


const router = new VueRouter({
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: Login },
        { path: '/home', component: Home }
    ]
})
router.beforeEach((to, from, next) => {
    //to 将要访问的路径
    //from 代表从哪里路径跳转过来
    //next 是一个函数  表示放行
    //next（） 放行 next（'/login'） 强制跳转
    if (to.path === '/login') return next();
    //获取token 
    const tokenStr = window.sessionStorage.getItem('token');
    if (!tokenStr) return next('/login');
    next();
})
export default router