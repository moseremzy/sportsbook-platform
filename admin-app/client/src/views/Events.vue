<template>
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY/>
    <SUCCESSALERTBOX>{{ interactive_store.backend_message }}</SUCCESSALERTBOX>
    <ERRORALERTBOX>{{ interactive_store.backend_message }}</ERRORALERTBOX>
    <SIDEBAR />

    <div class="sub_container" :style="interactive_store.sub_container_css">

      <HEADER page_name="events" searchbox_placeholder="Search by team or league" />

      <div class="page-title-row">
        <h1>Events</h1>
        <router-link class="add-btn" to="/account/add-event">+ Create Event</router-link>
      </div>

      <div class="customer-table-container">
        <div class="table-wrapper">
          <b style="word-wrap: break-word; display: block; margin-bottom: 10px;" v-if="interactive_store.query">
            Result for - #{{ interactive_store.query }}
          </b>

          <table class="customer-table" v-if="paginatedItems.length > 0">
            <thead>
              <tr>
                <th>Sport</th>
                <th>League</th>
                <th>Home Team</th>
                <th>Away Team</th>
                <th>Status</th>
                <th>Start Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in paginatedItems" :key="event.id">
                <td>{{ event.sport_name }}</td>
                <td>{{ event.league_name }}</td>
                <td>{{ event.home_team }}</td>
                <td>{{ event.away_team }}</td>
                <td>
                  <span :class="['status-badge', event.status]">{{ event.status }}</span>
                </td>
                <td>{{ formatDate(event.start_time) }}</td>
                <td>
                  <router-link :to="`/account/event-detail/${event.id}`" class="action-btn manage">
                    Manage
                  </router-link>
                  <button
                    class="action-btn delete"
                    @click="deleteEvent(event)"
                    :disabled="deletingId === event.id"
                  >
                    {{ deletingId === event.id ? 'Deleting...' : 'Delete' }}
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
import { useRouter } from 'vue-router'
import API from '@/api/index'

const interactive_store = useInteractiveStore()
const admin_store       = useAdminStore()
const router            = useRouter()

const events      = ref([])
const currentPage = ref(1)
const itemsPerPage = 20
const deletingId  = ref(null)

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

// ── Filter ───────────────────────────────────
const filteredItems = computed(() => {
  const q = interactive_store.query?.toLowerCase().trim()
  if (!q) return events.value
  return events.value.filter(e =>
    e.home_team?.toLowerCase().includes(q)   ||
    e.away_team?.toLowerCase().includes(q)   ||
    e.league_name?.toLowerCase().includes(q) ||
    e.sport_name?.toLowerCase().includes(q)
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

// ── Fetch Events ─────────────────────────────
async function fetchEvents() {
  try {
    const res = await API.get_manual_events()
    events.value = res.events
  } catch (err) {
    interactive_store.backend_message = err.message
    interactive_store.display_error_alert_box()
  }
}

// ── Delete Event ─────────────────────────────
async function deleteEvent(event) {

  if (!confirm(`Delete "${event.home_team} vs ${event.away_team}"? This will remove all markets, selections and period scores.`)) return

  deletingId.value = event.id

  try {

    const res = await API.delete_event({ data: { id: event.id }})

    events.value = events.value.filter(e => e.id !== event.id)

    interactive_store.backend_message = res.message
    interactive_store.display_success_alert_box()
  } catch (err) {
    console.log(err)
  } finally {
    deletingId.value = null
  }
}

// ── Format date ──────────────────────────────
function formatDate(dt) {
  return new Date(dt).toLocaleString()
}

onMounted(() => {
  interactive_store.clearQuery()
  fetchEvents()
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

.add-btn {
  background-color: #0E2E45;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.add-btn:hover { background-color: #1a4a6e; }

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
.status-badge.pending   { background: #fff3cd; color: #856404; }
.status-badge.live      { background: #d4edda; color: #155724; }
.status-badge.finished  { background: #d6d8d9; color: #383d41; }
.status-badge.cancelled { background: #f8d7da; color: #721c24; }
.status-badge.expired   { background: #e2e3e5; color: #6c757d; }

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

.action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.action-btn.manage {
  background-color: #fff8e1;
  color: #b8860b;
  border: 1px solid #f0d080;
  margin-right: 6px;
}
.action-btn.manage:hover { background-color: #fdeea3; }

.action-btn.delete {
  background-color: #fdecea;
  color: #c0392b;
  border: 1px solid #f5c6c2;
}
.action-btn.delete:hover:not(:disabled) { background-color: #fad4d0; }

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