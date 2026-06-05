
import { createRouter, createWebHistory } from "vue-router";

import { useInteractiveStore } from '@/stores/interactive'
import { useSettingStore } from '@/stores/settings'
import { useAdminStore } from "@/stores/admin";

const router = createRouter({

history: createWebHistory(process.env.BASE_URL),

routes: [
  {
    path: "/",
    redirect: '/account/dashboard',
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/Register.vue"),
    meta: {
      title: "Create an Account"
    }
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"),
    meta: {
      title: "Login"
    }
  },

  //DASHBOARD PAGES
  {
    path: '/account/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/add-country',
    name: 'Add-Country',
    component: () => import('../views/Add-Country.vue'),
    meta: {
      title: 'Add Country',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/countries',
    name: 'countries',
    component: () => import('../views/Countries.vue'),
    meta: {
      title: 'Countries',
      requiresAuth: true,
      authorize_roles: ['super_admin']
    }
  },
  {
    path: '/account/edit-country/:id',
    name: 'editcountry',
    component: () => import('../views/Edit-Country.vue'),
    meta: {
      title: 'Edit Country',
      requiresAuth: true,
      authorize_roles: ['super_admin']
    }
  },
  {
    path: '/account/add-league',
    name: 'Add-League',
    component: () => import('../views/Add-League.vue'),
    meta: {
      title: 'Add League',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/leagues',
    name: 'leagues',
    component: () => import('../views/Leagues.vue'),
    meta: {
      title: 'Leagues',
      requiresAuth: true,
      authorize_roles: ['super_admin']
    }
  },
  {
    path: '/account/edit-league/:id',
    name: 'editleague',
    component: () => import('../views/Edit-League.vue'),
    meta: {
      title: 'Edit League',
      requiresAuth: true,
      authorize_roles: ['super_admin']
    }
  },
  {
    path: '/account/add-event',
    name: 'Add-Event',
    component: () => import('../views/Add-Event.vue'),
    meta: {
      title: 'Add Event',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/event-detail/:id',
    name: '',
    component: () => import('../views/Event-Detail.vue'),
    meta: {
      title: 'Event Detail',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/events',
    name: '',
    component: () => import('../views/Events.vue'),
    meta: {
      title: 'Events',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/bets',
    name: '',
    component: () => import('../views/Bets.vue'),
    meta: {
      title: 'Bets',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/bet-detail/:id',
    name: '',
    component: () => import('../views/Bet-Detail.vue'),
    meta: {
      title: 'Bet Detail',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/users',
    name: 'users',
    component: () => import('../views/Users.vue'),
    meta: {
      title: 'Users',
      requiresAuth: true,
      authorize_roles: ['super_admin']
    }
  },
  {
    path: '/account/transactions',
    name: 'transactions',
    component: () => import('../views/Transactions.vue'),
    meta: {
      title: 'Transactions',
      requiresAuth: true,
      authorize_roles: ['super_admin']
    }
  },
  {
    path: '/account/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: {
      title: 'Settings',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  }
],

scrollBehavior(to, from, savedPosition) {
  
  if (to.name === 'dashboard') {
   
    return savedPosition || {};

  }

  return { top: 0 }; // Scroll to the top
  
}

})

router.beforeEach(async (to, from, next) => {

  const admin_store = useAdminStore();
  const settings_store    = useSettingStore()

  // Ensure admin data loaded
   // ── Wait for both user and settings if not fetched yet ──
   if (!admin_store.isFetched) {
    await Promise.all([
      admin_store.fetch_admin().catch(() => {}),
      settings_store.fetch_settings().catch(() => {})
    ])
  }

  const site = settings_store.settings?.website || ''

  document.title = to.meta.title
    ? `${to.meta.title} - ${site}`
    : `${site} | Betting Company.`

  // Route requires login but user not logged in
  if (to.meta.requiresAuth && !admin_store.isAuthenticated) {
    return next({ name: "login" });
  }

  // Route requires roles → check role permission
  if (to.meta.authorize_roles) {

    const allowedRoles = to.meta.authorize_roles;

    const admin_role = admin_store.admin?.role;

    if (!allowedRoles.includes(admin_role)) {
      return next({ name: "dashboard" });
    }

  }

  // Logged in users shouldn't access login/register pages
  if (!to.meta.requiresAuth && admin_store.isAuthenticated) {
    return next({ name: "dashboard" });
  }

  next();

});



router.afterEach((to, from, next) => { // use am close sidebar after each page navigation on mobile sha
  
  const interactive_store = useInteractiveStore()

  if (window.innerWidth < 992) {

  interactive_store.Close_Sidebar()

  }

})


 
export default router;
