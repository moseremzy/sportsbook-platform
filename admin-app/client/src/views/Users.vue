<template>
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY/>
    <SUCCESSALERTBOX>{{interactive_store.backend_message}}</SUCCESSALERTBOX>
    <ERRORALERTBOX>{{interactive_store.backend_message}}</ERRORALERTBOX>
    <SIDEBAR />

    <div class="sub_container" :style="interactive_store.sub_container_css">

      <HEADER page_name="users" searchbox_placeholder="Search by name or email" />

      <div class="page-title-row">
        <h1>Users</h1>
      </div>

      <div class="customer-table-container">
        <div class="table-wrapper">
          <b style="word-wrap: break-word; display: block; margin-bottom: 10px;" v-if="interactive_store.query">
            Result for - #{{ interactive_store.query }}
          </b>

          <table class="customer-table" v-if="paginatedItems.length > 0">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Balance</th>
                <th>Currency</th>
                <th>Country</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedItems" :key="user.id">
                <td>{{ user.fullname }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone }}</td>
                <td>{{ user.balance }}</td>
                <td>{{ user.currency }}</td>
                <td>{{ user.account_country }}</td>
                <td class="actions">

                  <router-link :to="`/account/transactions?user_id=${user.id}`" class="action-btn transactions" @click="router.push(`/account/transactions?user_id=${user.id}&name=${user.fullname}`)">
                    Transactions
                  </router-link>

                  <router-link :to="`/account/bets?user_id=${user.id}&name=${user.fullname}`" class="action-btn bets" @click="router.push(`/account/bets?user_id=${user.id}&name=${user.fullname}`)">
                    Bets
                  </router-link>

                  <button class="action-btn delete" @click="confirmDelete(user)" :disabled="deletingId === user.id">
                    {{ deletingId === user.id ? '...' : 'Delete' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <RECORDNOTFOUND v-else>Record Not Found</RECORDNOTFOUND>
        </div>

        <p style="margin-top: 10px; font-size: 15px;">
          Showing {{ paginatedItems.length }} of {{ filteredItems.length }}
        </p>

        <PAGINATION
          :currentPage="currentPage"
          :totalPages="totalPages"
          @update:currentPage="currentPage = $event"
          v-if="paginatedItems.length > 0"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import HEADER from '../components/Header.vue'
import RECORDNOTFOUND from '../components/ItemsNotFound.vue'
import SIDEBAR from '../components/SideBar.vue'
import PAGINATION from '../components/Pagination.vue'
import OVERLAY from '../components/modals/loading_overlay.vue'
import { useInteractiveStore } from '@/stores/interactive'
import { useAdminStore } from '@/stores/admin'
import { useUsersStore } from '@/stores/users'
import { useRouter } from 'vue-router'
import API from '@/api/index'

const interactive_store = useInteractiveStore()
const admin_store       = useAdminStore()
const users_store       = useUsersStore()
const router            = useRouter()

const currentPage  = ref(1)
const itemsPerPage = 20
const loadingId    = ref(null)
const deletingId   = ref(null)

// ── Auth guard ───────────────────────────────────────
watch(() => admin_store.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    interactive_store.backend_message = 'Session expired'
    interactive_store.display_success_alert_box(true)
    setTimeout(() => router.push({ path: '/login' }), 1000)
  }
})

const users = computed(() => users_store.users)

watch(() => interactive_store.query, () => {
  currentPage.value = 1
})

// ── Filtered ────────────────────────────────────────
const filteredItems = computed(() => {
  const q = interactive_store.query?.toLowerCase().trim()
  if (!q) return users.value
  return users.value.filter(u =>
    u.fullname?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q)
  )
})

// ── Paginated ───────────────────────────────────────
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() =>
  Math.ceil(filteredItems.value.length / itemsPerPage)
)

// ── Toggle status ────────────────────────────────────
async function toggleStatus(user, status) {
  loadingId.value = user.id
  try {
    const res = await API.toggle_user_status({ id: user.id, status })
    if (res.success) {
      user.status = status
      interactive_store.backend_message = res.message
      interactive_store.display_success_alert_box()
    } else {
      interactive_store.backend_message = res.message || 'Something went wrong'
      interactive_store.display_error_alert_box()
    }
  } catch (err) {
    interactive_store.backend_message = 'Request failed. Try again.'
    interactive_store.display_error_alert_box()
  } finally {
    loadingId.value = null
  }
}

// ── Delete ───────────────────────────────────────────
async function confirmDelete(user) {

  if (!confirm(`Are you sure you want to delete ${user.fullname}?`)) return

  deletingId.value = user.id

  interactive_store.toggle_loading_overlay(true)
  
  try {

    const res = await API.delete_user({ 
      data: { id: user.id }
    })
  
    await users_store.fetch_users()
    
    interactive_store.backend_message = res.message
    
    interactive_store.display_success_alert_box()
      
  } catch (err) {
    
    interactive_store.backend_message = 'Request failed. Try again.'
    
    interactive_store.display_error_alert_box()
  
  } finally {
    
    deletingId.value = null

    interactive_store.toggle_loading_overlay(false)
  
  }

}

onMounted(() => {
  interactive_store.clearQuery()
})
</script>

<style scoped>
@media only screen and (min-width: 992px) {
  div.container { display: flex; height: 100vh; width: 100%; margin: 0; padding: 0; }
  div.sub_container { display: block; margin: 0 0 0 250px; height: 100vh; padding: 0 15px 50px 15px; width: calc(100% - 250px); overflow-y: auto; }
  div.sub_container h1 { margin: 0px auto 5px auto; color: #0E2E45; font-size: 35px; font-weight: 300; }
}

@media only screen and (max-width: 992px) {
  div.container { display: flex; height: auto; width: 100%; margin: 0; padding: 0; }
  div.sub_container { display: block; margin: 0; padding: 0 15px 50px 15px; width: 100%; }
  div.sub_container h1 { margin: 0px auto 5px auto; color: #0E2E45; font-size: 3rem; font-weight: 300; }
}

.page-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }

.customer-table-container { width: 100%; margin: 0 auto; padding: 30px 0; }
.customer-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; min-width: 900px; }
.customer-table th, .customer-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
.customer-table th { background-color: #f4f4f4; font-weight: bold; }
.customer-table tr:hover { background-color: #f9f9f9; }

.status-active  { color: green; font-weight: bold; }
.status-inactive { color: red; font-weight: bold; }

.actions { display: flex; gap: 6px; flex-wrap: wrap; }

.action-btn { text-decoration: none; padding: 6px 12px; font-size: 12px; font-weight: 600; border: none; border-radius: 5px; cursor: pointer; transition: opacity 0.2s; white-space: nowrap; }
.action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.action-btn.enable { background-color: #e6f9ec; color: #1a7a3c; border: 1px solid #b2dfca; }
.action-btn.enable:hover:not(:disabled) { background-color: #c8f0d8; }

.action-btn.disable { background-color: #fdecea; color: #c0392b; border: 1px solid #f5c6c2; }
.action-btn.disable:hover:not(:disabled) { background-color: #fad4d0; }

.action-btn.transactions { background-color: #e8f0fe; color: #1a56db; border: 1px solid #b4c6f7; }
.action-btn.transactions:hover { background-color: #cddafb; }

.action-btn.bets { background-color: #fff8e1; color: #b8860b; border: 1px solid #f0d080; }
.action-btn.bets:hover { background-color: #fdeea3; }

.action-btn.delete { background-color: #fdecea; color: #c0392b; border: 1px solid #f5c6c2; }
.action-btn.delete:hover:not(:disabled) { background-color: #fad4d0; }

.table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }

@media (max-width: 768px) {
  .customer-table-container { padding: 15px 0; }
  .actions { flex-direction: column; }
}
</style>