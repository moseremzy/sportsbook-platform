
import { createRouter, createWebHistory } from "vue-router";

import { useInteractiveStore } from '@/stores/interactive'
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
      title: "Create an Account - Tech By Cas Admin"
    }
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"),
    meta: {
      title: "Login - Tech By Cas Admin"
    }
  },

  //DASHBOARD PAGES
  {
    path: '/account/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      title: 'Dashboard - Tech By Cas Admin',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/items',
    name: 'items',
    component: () => import('../views/Items.vue'),
    meta: {
      title: 'Menus - Tech By Cas Admin',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/add-country',
    name: 'Add-Country',
    component: () => import('../views/Add-Country.vue'),
    meta: {
      title: 'Add Country - Tech By Cas Admin',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/countries',
    name: 'countries',
    component: () => import('../views/Countries.vue'),
    meta: {
      title: 'Countries - Tech By Cas Admin',
      requiresAuth: true,
      authorize_roles: ['super_admin']
    }
  },
  {
    path: '/account/edit-country/:id',
    name: 'editcountry',
    component: () => import('../views/Edit-Country.vue'),
    meta: {
      title: 'Edit Country - Tech By Cas Admin',
      requiresAuth: true,
      authorize_roles: ['super_admin']
    }
  },
  {
    path: '/account/add-league',
    name: 'Add-League',
    component: () => import('../views/Add-League.vue'),
    meta: {
      title: 'Add League - Tech By Cas Admin',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/leagues',
    name: 'leagues',
    component: () => import('../views/Leagues.vue'),
    meta: {
      title: 'Leagues - Tech By Cas Admin',
      requiresAuth: true,
      authorize_roles: ['super_admin']
    }
  },
  {
    path: '/account/device-records',
    name: 'deviceRecords',
    component: () => import('../views/Device-Records.vue'),
    meta: {
      title: 'Device-Records - Tech By Cas Admin',
      requiresAuth: true,
      authorize_roles: ['super_admin']
    }
  },
  {
    path: '/account/staff-management',
    name: 'Staff-Management',
    component: () => import('../views/Staff-Management.vue'),
    meta: {
      title: 'Staff-Management - Tech By Cas Admin',
      requiresAuth: true,
      authorize_roles: ['super_admin']
    }
  },
  {
    path: '/account/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: {
      title: 'Settings - Tech By Cas Admin',
      requiresAuth: true,
      authorize_roles: ['super_admin', 'editor']
    }
  },
  {
    path: '/account/view-order/:order_id',
    name: 'viewOrder',
    component: () => import('../views/View-Order.vue'),
    meta: {
      title: 'View Order - Tech By Cas Admin',
      requiresAuth: true,
      authorize_roles: ['super_admin']
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

  document.title = to.meta.title || 'Tech By Cas Admin | Admin Panel.';

  // Ensure admin data loaded
  if (!admin_store.isFetched) {
    await admin_store.fetch_admin().catch(() => {});
  }

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
