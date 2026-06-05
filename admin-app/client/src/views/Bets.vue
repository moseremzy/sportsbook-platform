<template>
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY/>
    <SUCCESSALERTBOX>{{ interactive_store.backend_message }}</SUCCESSALERTBOX>
    <ERRORALERTBOX>{{ interactive_store.backend_message }}</ERRORALERTBOX>
    <SIDEBAR />

    <div class="sub_container" :style="interactive_store.sub_container_css">

      <HEADER page_name="bet-slips" searchbox_placeholder="Search by name or status" />

      <div class="page-title-row">
        <h1 v-if="route.query.name">{{ route.query.name }}'s Bet Slips</h1>
        <h1 v-else>Bet Slips</h1>
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
                <th>Total Odds</th>
                <th>Stake</th>
                <th>Possible Win</th>
                <th>Status</th>
                <th>Placed At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slip in paginatedItems" :key="slip.id">
                <td>{{ slip.fullname }}</td>
                <td>{{ slip.total_odd }}</td>
                <td>{{ formatAmount(slip.stake) }}</td>
                <td>{{ formatAmount(slip.possible_win) }}</td>
                <td>
                  <span :class="['status-badge', slip.status]">{{ slip.status }}</span>
                </td>
                <td>{{ formatDate(slip.created_at) }}</td>
                <td>
                  <router-link :to="`/account/bet-detail/${slip.id}`" class="action-btn manage">
                    Manage
                  </router-link>
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
import { useRouter, useRoute } from 'vue-router'
import API from '@/api/index'

const interactive_store = useInteractiveStore()
const admin_store       = useAdminStore()
const router            = useRouter()
const route         = useRoute()


const bet_slips    = ref([])
const currentPage  = ref(1)
const itemsPerPage = 20

// ── Auth Guard ───────────────────────────────
watch(() => admin_store.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    interactive_store.backend_message = 'Session expired'
    interactive_store.display_error_alert_box(true)
    setTimeout(() => router.push({ path: '/login' }), 1000)
  }
})

// ── Reset page on search ─────────────────────
watch(() => interactive_store.query, () => {
  currentPage.value = 1
})

// ── Filter by user_id if present in query ────
const slips = computed(() => {
  const all = bet_slips.value
  return route.query.user_id
    ? all.filter(s => s.user_id == route.query.user_id)
    : all
})

// ── Filter by search query ───────────────────
const filteredItems = computed(() => {
  const q = interactive_store.query?.toLowerCase().trim()
  if (!q) return slips.value
  return slips.value.filter(s =>
    s.fullname?.toLowerCase().includes(q) ||
    s.status?.toLowerCase().includes(q)
  )
})

// ── Paginate ─────────────────────────────────
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() =>
  Math.ceil(filteredItems.value.length / itemsPerPage)
)

// ── Fetch Bet Slips ──────────────────────────
async function fetchBetSlips() {
  
  try {

    const res = await API.get_bet_slips()
    
    bet_slips.value = res.bet_slips
  
  } catch (err) {
    
    interactive_store.backend_message = err.message
    
    interactive_store.display_error_alert_box()
  
  }

}

// ── Format helpers ───────────────────────────
function formatDate(dt) {
  return new Date(dt).toLocaleString()
}

function formatAmount(amount) {
  return Number(amount).toLocaleString()
}

onMounted(() => {
  interactive_store.clearQuery()
  fetchBetSlips()
})
</script>

<style scoped>
/* DESKTOP VIEW */
@media only screen and (min-width: 992px) {
  div.container {
    display: flex;
    height: 100vh;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  div.sub_container {
    display: block;
    margin: 0 0 0 250px;
    height: 100vh;
    padding: 0 15px 50px 15px;
    width: calc(100% - 250px);
    overflow-y: auto;
  }
  div.sub_container h1 {
    margin: 0px auto 5px auto;
    color: #0E2E45;
    font-size: 35px;
    font-weight: 300;
  }
}

/* MOBILE VIEW */
@media only screen and (max-width: 992px) {
  div.container {
    display: flex;
    height: auto;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  div.sub_container {
    display: block;
    margin: 0;
    padding: 0 15px 50px 15px;
    width: 100%;
  }
  div.sub_container h1 {
    margin: 0px auto 5px auto;
    color: #0E2E45;
    font-size: 3rem;
    font-weight: 300;
  }
}

/* ── Page title row ── */
.page-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

/* ── Table ── */
.customer-table-container {
  width: 100%;
  margin: 0 auto;
  padding: 30px 0;
}

.customer-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  min-width: 700px;
}

.customer-table th,
.customer-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.customer-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.customer-table tr:hover { background-color: #f9f9f9; }

/* ── Status Badge ── */
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}
.status-badge.pending  { background: #fff3cd; color: #856404; }
.status-badge.won      { background: #d4edda; color: #155724; }
.status-badge.lost     { background: #f8d7da; color: #721c24; }
.status-badge.partial  { background: #cce5ff; color: #004085; }
.status-badge.void     { background: #e2e3e5; color: #6c757d; }

/* ── Action buttons ── */
.action-btn {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: opacity 0.2s;
  text-decoration: none;
  display: inline-block;
}

.action-btn.manage {
  background-color: #fff8e1;
  color: #b8860b;
  border: 1px solid #f0d080;
}
.action-btn.manage:hover { background-color: #fdeea3; }

/* ── Table wrapper ── */
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .customer-table-container { padding: 15px 0; }
  .page-title-row { flex-direction: column; align-items: flex-start; gap: 10px; }
}
</style>