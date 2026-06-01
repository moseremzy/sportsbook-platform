<template>
  
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY/>

    <SUCCESSALERTBOX>{{interactive_store.backend_message}}</SUCCESSALERTBOX>

    <ERRORALERTBOX>{{interactive_store.backend_message}}</ERRORALERTBOX>
    
    <SIDEBAR /> <!-- Sidebar -->

    <div class="sub_container" :style="interactive_store.sub_container_css">

      <HEADER page_name = "customers" searchbox_placeholder = "Enter User's Email To Search" /> <!-- Header -->
      
      <h1>Customers</h1>

       <!-- Filters Section -->
      <div class="filters-container">
        <!-- Status Filter -->
        <div class="status-filter-container">
          <label for="status-filter" class="status-filter-label">Filter by Status</label>
          <select id="status-filter" v-model="selectedStatus" @change="filterCustomers" class="status-filter-select">
            <option value="">All</option>
            <option value="Unverified">Unverified</option>
            <option value="Verified">Verified</option>
          </select>
        </div>

        <!-- Date Range Filter -->
        <div class="date-range-filter-container">
          <label for="start-date-filter" class="date-filter-label">From</label>
          <input type="date" id="start-date-filter" v-model="startDate" @change="filterCustomers" class="date-filter-input" />

          <label for="end-date-filter" class="date-filter-label">To</label>
          <input type="date" id="end-date-filter" v-model="endDate" @change="filterCustomers" class="date-filter-input" />
        </div>
      </div>

      <div class="customer-table-container">
        <!-- Customer Table Wrapper for Mobile Scrolling -->
        <div class="table-wrapper">
          <b style = "word-wrap: break-word; display: block; margin-bottom: 10px;" v-if = "interactive_store.query">Result for - #{{interactive_store.query}}</b>
          <table class="customer-table" v-if = "paginatedCustomers.length > 0">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th>State</th>
                <th>City</th>
                <th>Account Status</th>
                <th>Date of Account Creation</th>
                <th>Order History</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="customer in paginatedCustomers" :key="customer.user_id">
                <td>#{{ customer.user_id }}</td>
                <td>{{ customer.fullname }}</td>
                <td>{{ customer.email }}</td>
                <td>{{ customer.phone }}</td>
                <td>{{ customer.address }}</td>
                <td>{{ customer.state }}</td>
                <td>{{ customer.city }}</td>
                <td>
                  <span :class="getStatusClass(customer.account_status)">
                    {{ customer.account_status }}
                  </span>
                </td>
                <td>{{MIDDLEWARES.formatted_date(customer.created_at)}}</td>
                <td v-if = "customer.account_status == 'Verified'">
                  <router-link :to="`/account/orders?user_id=${customer.user_id}&customer_name=${customer.fullname}`" class="order-link">View Order History</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        <RECORDNOTFOUND v-else>Record Not Found</RECORDNOTFOUND>
        </div>
        <p style = "margin-top: 10px; font-size: 15px;">Showing {{ paginatedCustomers.length }} of {{ filteredCustomers.length }}</p>
        <PAGINATION 
          :currentPage="currentPage" 
          :totalPages="totalPages" 
          @update:currentPage="currentPage = $event" 
          v-if = "paginatedCustomers.length > 0"
        />
      </div>
    </div> <!-- sub_container -->
  </div> <!-- container -->
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import HEADER from '../components/Header.vue';
import RECORDNOTFOUND from '../components/ItemsNotFound.vue'
import SIDEBAR from '../components/SideBar.vue';
import PAGINATION from '../components/Pagination.vue';
import { useInteractiveStore } from '@/stores/interactive';
import { useUsersStore } from '@/stores/users';
import { useAdminStore } from '@/stores/admin'
import MIDDLEWARES from '../middlewares/middlewares';
import { useRoute, useRouter } from 'vue-router'

const interactive_store = useInteractiveStore();
const users_store = useUsersStore();
const admin_store = useAdminStore()

const route = useRoute()
const router = useRouter()

// Filters
const selectedStatus = ref('');
const startDate = ref('');
const endDate = ref('');

// Pagination State
const currentPage = ref(1);
const itemsPerPage = 20;


watch( () => admin_store.isAuthenticated,

  (isAuthenticated) => { //i dey confirm if admin still dey authenticated

    if (!isAuthenticated) {

        interactive_store.backend_message = "session expired"

        interactive_store.display_success_alert_box(true)

        setTimeout(() => {

           router.push({ path: "/login" })
            
        }, 1000);

    }
  }, 
);


const customers = computed(() => {

 return customers_store.customers

})


watch( // Reset pagination
  [() => interactive_store.query, () => selectedStatus.value, () => startDate.value, () => endDate.value],
  () => {
    currentPage.value = 1; 
  }
);


// Filtered Customers
const filteredCustomers = computed(() => {
  return customers.value.filter(customer => {
    const customerDate = new Date(customer.created_at)

    const start = startDate.value
      ? new Date(`${startDate.value}T00:00:00`)
      : null

    const end = endDate.value
      ? new Date(`${endDate.value}T23:59:59`)
      : null

    const matchesStatus = !selectedStatus.value || customer.account_status === selectedStatus.value;
    
    const matchesStartDate =
      !start || customerDate >= start

    const matchesEndDate =
      !end || customerDate <= end
    
    const matchesEmail = customer.email.toLowerCase().includes(interactive_store.query.toLowerCase());

    return (matchesStatus && 
    matchesStartDate && 
    matchesEndDate && 
    matchesEmail
    )
  });
});



// Paginated Customers
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredCustomers.value.slice(start, end);
});



// Total Pages
const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / itemsPerPage));

 
const getStatusClass = (status) => { //color status
  return status === 'Verified' ? 'status-active' : 
         status === 'Unverified' ? 'status-inactive' : '';
};


onMounted(() => { // Clear Query on Mount

   interactive_store.clearQuery();

});

</script>

<style scoped>
/* DESKTOP VIEW */
@media only screen and (min-width: 992px) {
  body {
    margin: 0;
    padding: 0;
    font-family: "Roboto", "Helvetica Neue", "Helvetica", Arial, sans-serif;
    background-color: rgb(225, 230, 231);
  }

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
    width: 100%;
    overflow-y: auto;
    width: calc(100% - 250px);
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
  body {
    margin: 0;
    padding: 0;
    font-family: "Roboto", "Helvetica Neue", "Helvetica", Arial, sans-serif;
    background-color: rgb(225, 230, 231);
  }

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

/* Customer Table Styling */
.customer-table-container {
  width: 100%;
  margin: 0 auto;
  padding: 30px 0;
}

.table-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.customer-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.customer-table th, .customer-table td {
  padding: 12px;
  text-align: left;
  text-transform: capitalize;
  border-bottom: 1px solid #ddd;
}

.customer-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.customer-table tr:hover {
  background-color: #f9f9f9;
}

.status-active {
  color: green;
  font-weight: bold;
}

.status-inactive {
  color: red;
  font-weight: bold;
}

.order-link {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
}

.order-link:hover {
  text-decoration: underline;
}

/* Filters Styles */
.filters-container {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.status-filter-container,
.date-range-filter-container {
  display: flex;
  flex-direction: column; /* Stack elements vertically */
  align-items: flex-start; /* Align to the left */
}

.status-filter-label,
.date-filter-label {
  font-size: 16px;
  margin-bottom: 5px; /* Add space below labels */
  color: #333;
}

.status-filter-select,
.date-filter-input {
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px; /* Add space below inputs */
}

.status-filter-select:hover,
.date-filter-input:hover {
  border: 1px solid rgb(0, 102, 255);
  border-radius: 4px;
}

.status-filter-select:focus,
.date-filter-input:focus {
  outline: 0;
  border: 1px solid rgb(0, 102, 255);
  border-radius: 4px;
}

/* Mobile Table Overflow */
.table-wrapper {
   overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* For smooth scrolling on mobile */
}

.customer-table {
  min-width: 800px; /* Ensure the table has a min-width on mobile for horizontal scrolling */
}

/* Ensure horizontal scroll on mobile */
@media (max-width: 768px) {
  .customer-table-container {
    padding: 15px 0;
  }

  .table-wrapper {
    overflow-x: auto;
  }
}
</style>
