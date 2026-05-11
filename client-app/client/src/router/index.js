import { createRouter, createWebHistory } from "vue-router";
import BaseLayout from '../layouts/Baselayout.vue'
import PageNotFound from '../views/Page-Not-Found.vue'
import Home from '../views/Home.vue'
import Events from '../views/Events.vue'
import { useUserStore } from '@/stores/user'
import { useInteractiveStore } from '@/stores/interactive'

const router = createRouter({

history: createWebHistory(process.env.BASE_URL),

routes: [

  {
    path: '/',
    component: BaseLayout,
    children: [

    {
      path: '',
      name: 'home',
      component: Home,
      meta: {
        title: 'Home - Tech By Cas'
      }
    },

    {
      path: '/events',
      name: 'events',
      component: Events,
      meta: {
        title: 'Events - Tech By Cas'
      }
    },

    {     // 404 PAGE
      path: ':catchAll(.*)',
      name: 'PageNotFound',
      component: PageNotFound,
      meta: {
        title: 'Page Not Found'
      }
    }
  ]}
],

scrollBehavior(to, from, savedPosition) {
   
  return { top: 0 }; // Scroll to the top
  
}

})


router.beforeEach(async (to, from, next) => {
  
  const user_store = useUserStore();

  const interactive_store = useInteractiveStore();

  interactive_store.toggle_loading_overlay(true)

  document.title = to.meta.title || 'Tech By Cas | You Order, We Deliver.';

  // Wait for fetch if not done
  if (!user_store.isFetched) {
    await user_store.fetch_user().catch(() => {}); // ignore errors
  }

  // Redirect unauthenticated users from protected pages
  if (to.meta.requiresAuth && !user_store.isAuthenticated) {
    interactive_store.set_page_to_go(to.name);
    return next({ name: "sign-in" });
  }

  // Redirect authenticated users away from guest-only pages (like sign-in)
  if (user_store.isAuthenticated && to.name === 'sign-in') {
    return next({ name: 'home' }); // change 'home' to your home route name
  }

  next();

});


router.afterEach(() => {

  const interactive_store = useInteractiveStore()

  setTimeout(() => {

    interactive_store.toggle_loading_overlay(false)
  
  }, 400)

})



export default router;
