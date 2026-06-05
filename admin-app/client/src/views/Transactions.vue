<template>
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY/>
    <SUCCESSALERTBOX>{{interactive_store.backend_message}}</SUCCESSALERTBOX>
    <ERRORALERTBOX>{{interactive_store.backend_message}}</ERRORALERTBOX>
    <SIDEBAR />

    <div class="sub_container" :style="interactive_store.sub_container_css">

      <HEADER page_name="transactions" searchbox_placeholder="Search by name or type" />

      <h1 v-if="route.query.name">{{ route.query.name }}'s Transactions</h1>
      <h1 v-else>Transactions</h1>

      <div class="customer-table-container">
        <div class="table-wrapper">
          <b style="word-wrap: break-word; display: block; margin-bottom: 10px;" v-if="interactive_store.query">
            Result for - #{{ interactive_store.query }}
          </b>

          <table class="customer-table" v-if="paginatedItems.length > 0">
            <thead>
              <tr>
                <th>Proof</th>
                <th>Full Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Wallet</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in paginatedItems" :key="transaction.id">
                <td>
                  <img
                    v-if="transaction.proof_url"
                    :src="`http://localhost:7000${transaction.proof_url}`"
                    class="proof-image"
                    @click="openLightbox(`http://localhost:7000${transaction.proof_url}`)"
                  />

                  <span v-else>No Proof</span>
                </td>
                <td>{{ transaction.fullname }}</td>
                <td>{{ transaction.type }}</td>
                <td>{{ transaction.amount }}</td>
                <td>{{ transaction.currency }}</td>
                <td>
                  <span :class="getStatusClass(transaction.status)">
                    {{ transaction.status }}
                  </span>
                </td>
                <td>{{ transaction.payment_method }}</td>
                <td>{{ transaction.wallet }}</td>
                <td>{{ MIDDLEWARES.formatted_date(transaction.created_at) }}</td>
                <td class="actions">
                <button
                  v-if="transaction.status === 'processing'"
                  class="action-btn approve"
                  @click="approve_reject_transaction(transaction, 'completed')"
                  :disabled="loadingId === transaction.id"
                >
                  {{ loadingId === transaction.id ? '...' : 'Approve' }}
                </button>

                <button
                  v-if="transaction.status === 'processing'"
                  class="action-btn reject"
                  @click="approve_reject_transaction(transaction, 'rejected')"
                  :disabled="loadingId === transaction.id"
                >
                  {{ loadingId === transaction.id ? '...' : 'Reject' }}
                </button>

                <button
                  class="action-btn delete"
                  @click="confirmDelete(transaction)"
                  :disabled="deletingId === transaction.id"
                >
                  {{ deletingId === transaction.id ? '...' : 'Delete' }}
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
    <VueEasyLightbox
      :visible="lightboxVisible"
      :imgs="lightboxImages"
      :index="0"
      @hide="lightboxVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import HEADER from '../components/Header.vue'
import VueEasyLightbox from 'vue-easy-lightbox'
import RECORDNOTFOUND from '../components/ItemsNotFound.vue'
import SIDEBAR from '../components/SideBar.vue'
import PAGINATION from '../components/Pagination.vue'
import OVERLAY from '../components/modals/loading_overlay.vue'
import { useInteractiveStore } from '@/stores/interactive'
import { useAdminStore } from '@/stores/admin'
import { useTransactionsStore } from '@/stores/transactions'
import { useRoute, useRouter } from 'vue-router'
import MIDDLEWARES from '../middlewares/middlewares'
import API from '@/api/index'

const interactive_store    = useInteractiveStore()
const admin_store          = useAdminStore()
const transactions_store   = useTransactionsStore()
const route                = useRoute()
const router               = useRouter()

const currentPage  = ref(1)
const itemsPerPage = 20
const loadingId    = ref(null)
const deletingId   = ref(null)

const lightboxVisible = ref(false)
const lightboxImages = ref([])

// ── Auth guard ───────────────────────────────────────
watch(() => admin_store.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    interactive_store.backend_message = 'Session expired'
    interactive_store.display_success_alert_box(true)
    setTimeout(() => router.push({ path: '/login' }), 1000)
  }
})

// ── Data — filter by user_id if present in query ─────
const transactions = computed(() => {
  const all = transactions_store.transactions
  return route.query.user_id
    ? all.filter(t => t.user_id == route.query.user_id)
    : all
})

watch(() => interactive_store.query, () => {
  currentPage.value = 1
})

// ── Filtered ────────────────────────────────────────
const filteredItems = computed(() => {
  const q = interactive_store.query?.toLowerCase().trim()
  if (!q) return transactions.value
  return transactions.value.filter(t =>
    t.fullname?.toLowerCase().includes(q) ||
    t.type?.toLowerCase().includes(q)
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

// ── Status class ─────────────────────────────────────
function getStatusClass(status) {
  return status === 'approved'   ? 'status-approved'   :
         status === 'processing' ? 'status-processing' :
         status === 'failed'     ? 'status-failed'     :
         status === 'cancelled'  ? 'status-cancelled'  : ''
}

function openLightbox(image) {
  lightboxImages.value = [image]
  lightboxVisible.value = true
}

async function approve_reject_transaction(transaction, action) {

  const actionText = action === "completed" ? "approve" : "reject";

  const confirmed = confirm(
    `Are you sure you want to ${actionText} this transaction?`
  );

  if (!confirmed) return;

  loadingId.value = transaction.id;

  interactive_store.toggle_loading_overlay(true);

  try {

    const res = await API.approve_reject_transaction({
      id: transaction.id,
      action
    });

    await transactions_store.fetch_transactions();

    interactive_store.backend_message = res.message;

    interactive_store.display_success_alert_box();

  } catch (err) {

    console.log(err);

  } finally {

    loadingId.value = null;

    interactive_store.toggle_loading_overlay(false);

  }

}
// ── Delete ───────────────────────────────────────────
async function confirmDelete(transaction) {

  if (!confirm('Are you sure you want to delete this transaction?')) return

  deletingId.value = transaction.id

  interactive_store.toggle_loading_overlay(true)

  try {

    const res = await API.delete_transaction({ 
         data: { id: transaction.id }
    })
    
    await transactions_store.fetch_transactions()

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

.customer-table-container { width: 100%; margin: 0 auto; padding: 30px 0; }
.customer-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; min-width: 900px; }
.customer-table th, .customer-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
.customer-table th { background-color: #f4f4f4; font-weight: bold; }
.customer-table tr:hover { background-color: #f9f9f9; }

.proof-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #ddd;
}

.status-approved   { color: green; font-weight: bold; }
.status-processing { color: #b8860b; font-weight: bold; }
.status-failed     { color: red; font-weight: bold; }
.status-cancelled  { color: gray; font-weight: bold; }

.actions { display: flex; gap: 6px; flex-wrap: wrap; }

.action-btn { padding: 6px 12px; font-size: 12px; font-weight: 600; border: none; border-radius: 5px; cursor: pointer; transition: opacity 0.2s; white-space: nowrap; }
.action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.action-btn.approve { background-color: #e6f9ec; color: #1a7a3c; border: 1px solid #b2dfca; }
.action-btn.approve:hover:not(:disabled) { background-color: #c8f0d8; }

.action-btn.reject {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.action-btn.reject:hover:not(:disabled) {
  background-color: #ffe8a1;
}

.action-btn.delete { background-color: #fdecea; color: #c0392b; border: 1px solid #f5c6c2; }
.action-btn.delete:hover:not(:disabled) { background-color: #fad4d0; }



.table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }

@media (max-width: 768px) {
  .customer-table-container { padding: 15px 0; }
  .actions { flex-direction: column; }
}
</style>