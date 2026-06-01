import { createRouter, createWebHistory } from "vue-router";
import BaseLayout from '../layouts/Baselayout.vue'
import PageNotFound from '../views/Page-Not-Found.vue'
import Home from '../views/Home.vue'
import Events from '../views/Events.vue'
import ViewEvent from '../views/View-Event.vue'
import BetHistory from '../views/Bet-History.vue'
import TermsCondition from '../views/Terms-And-Condition.vue'
import License from '../views/License.vue'
import AffliateProgram from '../views/Affliate-Program.vue'
import Deposits from '../views/Deposits.vue'
import Withdrawals from '../views/Withdrawals.vue'
import Transactions from '../views/Transactions.vue'
import Settings from '../views/Settings.vue'
import ComingSoon from '../views/Coming-Soon.vue'
import Support from '../views/Support.vue'
import ForgotPassword from '../views/Forgot-Password.vue'
import NewPassword from '../views/New-Password.vue'
import SignIn from '../views/Sign-in.vue'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { useInteractiveStore } from '@/stores/interactive'


const router = createRouter({

  history: createWebHistory(process.env.BASE_URL),

  routes: [
    {
      path: `/`,
      component: BaseLayout,
      children: [

        {
          path: ``,
          name: `home`,
          component: Home,
          meta: { title: `Home` }
        },

        {
          path: `/sign-in`,
          name: `sign-in`,
          component: SignIn,
          meta: { title: `Sign in or Sign up` }
        },

        {
          path: `/events`,
          name: `events`,
          component: Events,
          meta: { title: `Events` }
        },

        {
          path: `/view-event/:id`,
          name: `View-Event`,
          component: ViewEvent,
          meta: { title: `View Event` }
        },

        {
          path: `/terms-and-condition`,
          name: `Terms-And-Condition`,
          component: TermsCondition,
          meta: { title: `Terms and Condition` }
        },

        {
          path: `/license`,
          name: `License`,
          component: License,
          meta: { title: `License` }
        },

        {
          path: `/affliate-program`,
          name: `Affliate-Program`,
          component: AffliateProgram,
          meta: { title: `Affliate Program` }
        },

        {
          path: `/coming-soon`,
          name: `Coming-Soon`,
          component: ComingSoon,
          meta: { title: `Coming Soon` }
        },

        {
          path: `/forgot-password`,
          name: `Forgot-Password`,
          component: ForgotPassword,
          meta: { title: `Forgot Password` }
        },

        {
          path: `/new-password/:id`,
          name: `new-password`,
          component: () => import(`../views/New-Password.vue`),
          meta: { title: `Create New Password` }
        },

        {
          path: `/support`,
          name: `Support`,
          component: Support,
          meta: { title: `Customer Support` }
        },

        {
          path: `:catchAll(.*)`,
          name: `PageNotFound`,
          component: PageNotFound,
          meta: { title: `Page Not Found` }
        },

        // ── DASHBOARD PAGES ──

        {
          path: `/account/deposits`,
          name: `deposits`,
          component: Deposits,
          meta: { title: `Deposits`, requiresAuth: true }
        },

        {
          path: `/account/withdrawals`,
          name: `withdrawals`,
          component: Withdrawals,
          meta: { title: `Withdrawals`, requiresAuth: true }
        },

        {
          path: `/account/transactions`,
          name: `transactions`,
          component: Transactions,
          meta: { title: `Transactions`, requiresAuth: true }
        },

        {
          path: `/account/settings`,
          name: `settings`,
          component: Settings,
          meta: { title: `Settings`, requiresAuth: true }
        },

        {
          path: `/account/bet-history`,
          name: `Bet-History`,
          component: BetHistory,
          meta: { title: `Bet History`, requiresAuth: true }
        },

      ]
    }
  ],

  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }

})


router.beforeEach(async (to, from, next) => {

  // ✅ All store calls inside the guard — Pinia is ready here
  const user_store        = useUserStore()
  const interactive_store = useInteractiveStore()
  const settings_store    = useSettingsStore()

  const site = settings_store.settings?.website || ''

  interactive_store.toggle_loading_overlay(true)

  // Dynamically append site name to every page title
  document.title = to.meta.title
    ? `${to.meta.title} - ${site}`
    : `${site} | You Order, We Deliver.`

  // Wait for user fetch if not done yet
  if (!user_store.isFetched) {
    await user_store.fetch_user().catch(() => {})
  }

  // Redirect unauthenticated users from protected pages
  if (to.meta.requiresAuth && !user_store.isAuthenticated) {
    interactive_store.set_page_to_go(to.name)
    return next({ name: `sign-in` })
  }

  // Redirect authenticated users away from sign-in
  if (user_store.isAuthenticated && to.name === `sign-in`) {
    return next({ name: `home` })
  }

  next()

})


router.afterEach(() => {

  const interactive_store = useInteractiveStore()

  setTimeout(() => {
    interactive_store.toggle_loading_overlay(false)
  }, 400)

})


export default router;