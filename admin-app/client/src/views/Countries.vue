<template>
  
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY/>

    <SUCCESSALERTBOX>{{interactive_store.backend_message}}</SUCCESSALERTBOX>

    <ERRORALERTBOX>{{interactive_store.backend_message}}</ERRORALERTBOX>
    
    <SIDEBAR />

    <div class="sub_container" :style="interactive_store.sub_container_css">

      <HEADER page_name="countries" searchbox_placeholder="Search by name or code" />
      
      <div class="page-title-row">
        <h1>Countries</h1>
        <router-link class="add-btn" to ="/account/add-country">
          + Add Country
        </router-link>
      </div>

      <div class="customer-table-container">
        <div class="table-wrapper">
          <b style="word-wrap: break-word; display: block; margin-bottom: 10px;" v-if="interactive_store.query">
            Result for - #{{ interactive_store.query }}
          </b>

          <table class="customer-table" v-if="paginatedItems.length > 0">
            <thead>
              <tr>
                <th>Flag</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="country in paginatedItems" :key="country.id">
                <td>
                  <img
                    v-if="country.flag"
                    :src="`http://localhost:7000${country.flag}`"
                    :alt="country.name"
                    class="flag-img"
                  />
                  <span v-else class="no-flag">—</span>
                </td>
                <td>{{ country.name }}</td>
                <td>{{ country.slug }}</td>
                <td>{{ country.code }}</td>
                <td>
                  <span :class="country.status == 'enabled' ? 'status-active' : 'status-inactive'">
                    {{ country.status == 'enabled' ? 'Enabled' : 'Disabled' }}
                  </span>
                </td>
                <td>
                  <button
                    class="action-btn enable"
                    v-if="country.status != 'enabled'"
                    @click="toggleStatus(country, 'enabled')"
                    :disabled="loadingId === country.id"
                  >
                    {{ loadingId === country.id ? 'Updating...' : 'Enable' }}
                  </button>
                  <button
                    class="action-btn disable"
                    v-else
                    @click="toggleStatus(country, 'disabled')"
                    :disabled="loadingId === country.id"
                  >
                    {{ loadingId === country.id ? 'Updating...' : 'Disable' }}
                  </button>
                  <router-link :to ="`/account/edit-country/${country.id}`" class="action-btn edit" @click="router.push(`/account/edit-country/${country.id}`)">
                    Edit
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
import { useInteractiveStore } from '@/stores/interactive'
import { useAdminStore } from '@/stores/admin'
import { useCountriesStore } from '@/stores/countries'
import { useRouter } from 'vue-router'
import API from '@/api/index'

const interactive_store = useInteractiveStore()
const admin_store       = useAdminStore()
const countries_store   = useCountriesStore()

const router = useRouter()

const currentPage  = ref(1)
const itemsPerPage = 20
const loadingId    = ref(null)

// ── Auth guard ──────────────────────────────────────
watch(() => admin_store.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    interactive_store.backend_message = 'Session expired'
    interactive_store.display_success_alert_box(true)
    setTimeout(() => router.push({ path: '/login' }), 1000)
  }
})

// ── Data ────────────────────────────────────────────
const countries = computed(() => countries_store.countries)

// ── Reset pagination on search change ───────────────
watch(() => interactive_store.query, () => {
  currentPage.value = 1
})

// ── Filtered ────────────────────────────────────────
const filteredItems = computed(() => {
  const q = interactive_store.query?.toLowerCase().trim()
  if (!q) return countries.value
  return countries.value.filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.code?.toLowerCase().includes(q) ||
    c.slug?.toLowerCase().includes(q)
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

// ── Toggle enable / disable ──────────────────────────
async function toggleStatus(country, status) {
  loadingId.value = country.id
  try {
    const res = await API.toggle_country_status({ id: country.id, status })
    if (res.success) {
      // Update local store directly so UI reflects instantly
      country.status = status
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

// ── Mount ───────────────────────────────────────────
onMounted(() => {
  interactive_store.clearQuery()
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
  min-width: 600px;
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

/* ── Flag ── */
.flag-img {
  width: 36px;
  height: 24px;
  object-fit: cover;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.no-flag { color: #aaa; font-size: 13px; }

/* ── Status ── */
.status-active  { color: green; font-weight: bold; }
.status-inactive { color: red; font-weight: bold; }

/* ── Action buttons ── */
.action-btn {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.action-btn.enable {
  background-color: #e6f9ec;
  color: #1a7a3c;
  border: 1px solid #b2dfca;
}

.action-btn.enable:hover:not(:disabled) { background-color: #c8f0d8; }

.action-btn.disable {
  background-color: #fdecea;
  color: #c0392b;
  border: 1px solid #f5c6c2;
}

.action-btn.disable:hover:not(:disabled) { background-color: #fad4d0; }

.action-btn.edit {
  text-decoration: none;
  background-color: #fff8e1;
  color: #b8860b;
  border: 1px solid #f0d080;
  margin-left: 6px;
}

.action-btn.edit:hover { background-color: #fdeea3; }

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