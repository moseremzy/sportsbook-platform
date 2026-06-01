<template>
  
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY/>

    <SUCCESSALERTBOX>{{interactive_store.backend_message}}</SUCCESSALERTBOX>

    <ERRORALERTBOX>{{interactive_store.backend_message}}</ERRORALERTBOX>
    
    <SIDEBAR /> <!-- Sidebar -->

    <div class="sub_container" :style="interactive_store.sub_container_css">

      <HEADER page_name = "staff-management" searchbox_placeholder = "Enter Staff's Email To Search" /> <!-- Header -->
      
      <h1>Staffs</h1>

       <!-- Filters Section -->
      <div class="filters-container">
        <!-- Status Filter -->
        <div class="status-filter-container">
          <label for="status-filter" class="status-filter-label">Filter by Acct Status</label>
          <select id="status-filter" v-model="selectedAccountStatus"  class="status-filter-select">
            <option value="">All</option>
            <option value="Unverified">Unverified</option>
            <option value="Verified">Verified</option>
          </select>

          <label for="status-filter" class="status-filter-label">Filter by Adm Status</label>
          <select id="status-filter" v-model="selectedAdminStatus"  class="status-filter-select">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
          </select>
        </div>

          

        <!-- Date Range Filter -->
        <div class="date-range-filter-container">
          <label for="start-date-filter" class="date-filter-label">From</label>
          <input type="date" id="start-date-filter" v-model="startDate"  class="date-filter-input" />

          <label for="end-date-filter" class="date-filter-label">To</label>
          <input type="date" id="end-date-filter" v-model="endDate"  class="date-filter-input" />
        </div>
      </div>

      <div class="staff-table-container">
        <!-- staff Table Wrapper for Mobile Scrolling -->
        <div class="table-wrapper">
          <b style = "word-wrap: break-word; display: block; margin-bottom: 10px;" v-if = "interactive_store.query">Result for - #{{interactive_store.query}}</b>
          <table class="staff-table" v-if = "paginatedStaffs.length > 0">
            <thead>
              <tr>
                <th>Admin ID</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Account Status</th>
                <th>Admin Status</th>
                <th>Date of Account Creation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="staff in paginatedStaffs" :key="staff.admin_id">
                <td>#{{ staff.admin_id }}</td>
                <td>{{ staff.email }}</td>
                <td>{{ staff.phone }}</td>
                <td>
                  <span :class="getAccountStatusClass(staff.account_status)">
                    {{ staff.account_status }}
                  </span>
                </td>
                <td>
                  <span :class="getAdminStatusClass(staff.admin_status)">
                    {{ staff.admin_status }}
                  </span>
                </td>
                <td>{{MIDDLEWARES.formatted_date(staff.created_at)}}</td> 
                <!-- Pending account -->
                <td>
                <div class="actions-container">

                    <button v-if="staff.admin_status === 'pending'"
                        class="action-btn approve-btn"
                        @click="approve_staff(staff.admin_id)"
                    >
                        Approve
                    </button>

                    <button
                        class="action-btn delete-btn"
                        @click="delete_staff(staff.admin_id)"
                    >
                        Delete
                    </button>

                </div>
                </td>
              </tr>
            </tbody>
          </table>
        <RECORDNOTFOUND v-else>Record Not Found</RECORDNOTFOUND>
        </div>
        <p style = "margin-top: 10px; font-size: 15px;">Showing {{ paginatedStaffs.length }} of {{ filteredStaffs.length }}</p>
        <PAGINATION 
          :currentPage="currentPage" 
          :totalPages="totalPages" 
          @update:currentPage="currentPage = $event" 
          v-if = "paginatedStaffs.length > 0"
        />
      </div>
    </div> <!-- sub_container -->
  </div> <!-- container -->
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import HEADER from '../components/Header.vue';
import OVERLAY from '../components/modals/loading_overlay.vue'
import RECORDNOTFOUND from '../components/ItemsNotFound.vue'
import SIDEBAR from '../components/SideBar.vue';
import API from '../api/index'
import PAGINATION from '../components/Pagination.vue';
import { useInteractiveStore } from '@/stores/interactive';
import { useAdminStore } from '@/stores/admin'
import MIDDLEWARES from '../middlewares/middlewares';
import { useRoute, useRouter } from 'vue-router'

const interactive_store = useInteractiveStore();
const admin_store = useAdminStore()

const route = useRoute()
const router = useRouter()

// Filters
const selectedAccountStatus = ref('');
const selectedAdminStatus = ref('');
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


const staffs = computed(() => {

 return staffs_store.staffs

})


watch( // Reset pagination
  [() => interactive_store.query, () => selectedAccountStatus.value, () => selectedAdminStatus.value, () => startDate.value, () => endDate.value],
  () => {
    currentPage.value = 1; 
  }
);


// Filtered staffs
const filteredStaffs = computed(() => {
  return staffs.value.filter(staff => {
    const staffDate = new Date(staff.created_at)

    const start = startDate.value
      ? new Date(`${startDate.value}T00:00:00`)
      : null

    const end = endDate.value
      ? new Date(`${endDate.value}T23:59:59`)
      : null

    const matchesAccountStatus = !selectedAccountStatus.value || staff.account_status === selectedAccountStatus.value;

    const matchesAdminStatus = !selectedAdminStatus.value || staff.admin_status === selectedAdminStatus.value;
    
    const matchesStartDate =
      !start || staffDate >= start

    const matchesEndDate =
      !end || staffDate <= end
    
    const matchesEmail = staff.email.toLowerCase().includes(interactive_store.query.toLowerCase());

    return (matchesAccountStatus && matchesAdminStatus && 
    matchesStartDate && 
    matchesEndDate && 
    matchesEmail
    )
  });
});



// Paginated staffs
const paginatedStaffs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredStaffs.value.slice(start, end);
});



// Total Pages
const totalPages = computed(() => Math.ceil(filteredStaffs.value.length / itemsPerPage));

 
const getAccountStatusClass = (status) => { //color status
  return status === 'Verified' ? 'status-active' : 
         status === 'Unverified' ? 'status-inactive' : '';
};


const getAdminStatusClass = (status) => { //color status
  return status === 'active' ? 'status-active' : 
         status === 'pending' ? 'status-inactive' : '';
};


async function approve_staff(admin_id) {

  try {

    if (!confirm("Approve this staff account?")) return

    interactive_store.toggle_loading_overlay(true) //show overlay

    const response = await API.approve_staff({admin_id: admin_id, status: 'active'})

    await staffs_store.fetch_staffs() //reload data

    interactive_store.backend_message = response.data.message
    
    interactive_store.display_success_alert_box()
      
  } catch (error) {
      
    console.log(error)

  }

   interactive_store.toggle_loading_overlay(false) //remove overlay

}


async function delete_staff(admin_id) {

  try {

    if (!confirm("Delete this staff account?")) return

    interactive_store.toggle_loading_overlay(true) //show overlay

    const response = await API.delete_staff({
        data: {
            admin_id: admin_id
        }
    })

    await staffs_store.fetch_staffs() //reload data

    interactive_store.backend_message = response.data.message
    
    interactive_store.display_success_alert_box()
      
  } catch (error) {
      
    console.log(error)

  }

   interactive_store.toggle_loading_overlay(false) //remove overlay

}


onMounted(() => { // Clear Query on Mount

   interactive_store.clearQuery();

});

</script>

<style scoped>

/* Actions column container */
.actions-container {
  display: flex;
  gap: 8px;
  align-items: center;
}


/* Base button style */
.action-btn {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-weight: 500;
}


/* Approve button */
.approve-btn {
  background-color: #28a745;
  color: white;
}

.approve-btn:hover {
  background-color: #218838;
  transform: translateY(-1px);
}


/* Delete button */
.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}


/* Role selector dropdown */
.role-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border 0.2s ease;
}

.role-select:hover {
  border: 1px solid #007bff;
}

.role-select:focus {
  outline: none;
  border: 1px solid #007bff;
}

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

/* staff Table Styling */
.staff-table-container {
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

.staff-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.staff-table th, .staff-table td {
  padding: 12px;
  text-align: left;
  text-transform: capitalize;
  border-bottom: 1px solid #ddd;
}

.staff-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.staff-table tr:hover {
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

.staff-table {
  min-width: 800px; /* Ensure the table has a min-width on mobile for horizontal scrolling */
}

/* Ensure horizontal scroll on mobile */
@media (max-width: 768px) {
  .staff-table-container {
    padding: 15px 0;
  }

  .table-wrapper {
    overflow-x: auto;
  }
}
</style>
