 <template>
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY/>
    <SUCCESSALERTBOX>{{ interactive_store.backend_message }}</SUCCESSALERTBOX>
    <ERRORALERTBOX>{{ interactive_store.backend_message }}</ERRORALERTBOX>
    <SIDEBAR/>

    <div class="sub_container" :style="interactive_store.sub_container_css">

      <HEADER page_name="add-event" searchbox_placeholder="Search events" />

      <div class="page-title-row">
        <h1>Create Event</h1>

        <button class="back-btn" @click="router.push('/events')">
          ← Back to Events
        </button>
      </div>

      <div class="add-item-form-container">
        <form class="add-item-form grid-form">

          <!-- Sport -->
          <div class="form-group">
            <label class="form-label">Sport</label>
            <select v-model="event_info.sport_id" class="form-input">
              <option value="" disabled>Select sport</option>
              <option v-for="sport in sports_store.sports" :key="sport.id" :value="sport.id">
                {{ sport.name }}
              </option>
            </select>
            <p class="err">{{ errors.sport_err }}</p>
          </div>

          <!-- League -->
          <div class="form-group">
            <label class="form-label">League</label>
            <select v-model="event_info.league_id" class="form-input">
              <option value="" disabled>Select league</option>
              <option v-for="league in leagues_store.leagues" :key="league.id" :value="league.id">
                {{ league.name }}
              </option>
            </select>
            <p class="err">{{ errors.league_err }}</p>
          </div>

          <!-- Home Team -->
          <div class="form-group">
            <label class="form-label">Home Team</label>
            <input
              type="text"
              v-model="event_info.home_team"
              class="form-input"
              placeholder="e.g. Arsenal"
            />
            <p class="err">{{ errors.home_team_err }}</p>
          </div>

          <!-- Away Team -->
          <div class="form-group">
            <label class="form-label">Away Team</label>
            <input
              type="text"
              v-model="event_info.away_team"
              class="form-input"
              placeholder="e.g. Chelsea"
            />
            <p class="err">{{ errors.away_team_err }}</p>
          </div>

          <!-- Start Time -->
          <div class="form-group grid-full">
            <label class="form-label">Start Time</label>
            <input
              type="datetime-local"
              v-model="event_info.start_time"
              class="form-input"
            />
            <p class="err">{{ errors.start_time_err }}</p>
          </div>

          <!-- External ID (optional for Odds API sync) -->
          <!-- <div class="form-group grid-full">
            <label class="form-label">External ID <span class="hint">(optional)</span></label>
            <input
              type="text"
              v-model="event_info.external_id"
              class="form-input"
              placeholder="Odds API event id"
            />
          </div> -->

          <!-- Submit -->
          <div class="form-group grid-full">
            <button type="submit" @click.prevent="submitEvent" class="submit-button">
              Create Event
            </button>
          </div>

        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue"
import { useRouter } from "vue-router"

import { useInteractiveStore } from "@/stores/interactive"
import { useAdminStore } from "@/stores/admin"
import { useSportsStore } from "@/stores/sports"
import { useLeaguesStore } from "@/stores/leagues"

import HEADER from "../components/Header.vue"
import OVERLAY from "../components/modals/loading_overlay.vue"
import SIDEBAR from "../components/SideBar.vue"
import API from "../api/index"

const interactive_store = useInteractiveStore()
const admin_store = useAdminStore()
const sports_store = useSportsStore()
const leagues_store = useLeaguesStore()
const router = useRouter()

// ── Form State ───────────────────────────────
const event_info = reactive({
  sport_id: "",
  league_id: "",
  home_team: "",
  away_team: "",
  start_time: "",
  external_id: ""
})

// ── Errors ───────────────────────────────────
const errors = reactive({
  sport_err: "",
  league_err: "",
  home_team_err: "",
  away_team_err: "",
  start_time_err: ""
})

// ── Auth Guard ───────────────────────────────
watch(() => admin_store.isAuthenticated, (val) => {
  if (!val) {
    interactive_store.backend_message = "Session expired"
    interactive_store.display_error_alert_box(true)
    setTimeout(() => router.push("/login"), 1000)
  }
})

// ── Validation ───────────────────────────────
function validate() {
  let valid = true

  if (!event_info.sport_id) {
    errors.sport_err = "Select a sport"
    valid = false
  } else errors.sport_err = ""

  if (!event_info.league_id) {
    errors.league_err = "Select a league"
    valid = false
  } else errors.league_err = ""

  if (!event_info.home_team.trim()) {
    errors.home_team_err = "Enter home team"
    valid = false
  } else errors.home_team_err = ""

  if (!event_info.away_team.trim()) {
    errors.away_team_err = "Enter away team"
    valid = false
  } else errors.away_team_err = ""

  if (!event_info.start_time) {
    errors.start_time_err = "Select start time"
    valid = false
  } else errors.start_time_err = ""

  if (event_info.home_team.trim() === event_info.away_team.trim()) {
    errors.away_team_err = "Teams cannot be the same"
    valid = false
  }

  return valid
}

// ── Submit Event ─────────────────────────────
async function submitEvent() {

  if (!validate()) return

  interactive_store.toggle_loading_overlay(true)

  try {

    const res = await API.create_event({
      sport_id: event_info.sport_id,
      league_id: event_info.league_id,
      home_team: event_info.home_team,
      away_team: event_info.away_team,
      start_time: event_info.start_time,
      external_id: event_info.external_id || null
    })

    interactive_store.backend_message = res.message
    
    interactive_store.display_success_alert_box()

    resetForm()

    // ── Redirect to event detail page ────────────
    setTimeout(() => router.push(`/account/event-detail/${res.event_id}`), 1200)

  } catch (err) {

    console.log(err.message)

  } finally {
    
    interactive_store.toggle_loading_overlay(false)
  
  }

}
// ── Reset ────────────────────────────────────
function resetForm() {
  event_info.sport_id = ""
  event_info.league_id = ""
  event_info.home_team = ""
  event_info.away_team = ""
  event_info.start_time = ""
  event_info.external_id = ""
}
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

.back-btn {
  background-color: #0E2E45;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.back-btn:hover { background-color: #1a4a6e; }

/* ── Form ── */
.add-item-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(145, 138, 138, 0.1);
}

.add-item-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.grid-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.grid-full { grid-column: span 2; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 16px;
  font-weight: bold;
  color: #555;
}

.hint {
  font-size: 12px;
  font-weight: 400;
  color: #aaa;
}

.form-input {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
}
.form-input:focus {
  border-color: #007bff;
  outline: none;
}

.flag-preview {
  width: 80px;
  height: 54px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.submit-button {
  padding: 12px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.submit-button:hover { background-color: #0056b3; }

p.err {
  color: red;
  font-size: 14px;
  margin: 0;
}

@media (max-width: 768px) {
  .grid-form { grid-template-columns: 1fr; }
  .grid-full { grid-column: span 1; }
  .page-title-row { flex-direction: column; align-items: flex-start; gap: 10px; }
}
</style>