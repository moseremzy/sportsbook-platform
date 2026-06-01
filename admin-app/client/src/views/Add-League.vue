<template>
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY/>
    <SUCCESSALERTBOX>{{interactive_store.backend_message}}</SUCCESSALERTBOX>
    <ERRORALERTBOX>{{interactive_store.backend_message}}</ERRORALERTBOX>
    <SIDEBAR/>

    <div class="sub_container" :style="interactive_store.sub_container_css">

      <HEADER page_name="add-league" searchbox_placeholder="Search leagues" />

      <div class="page-title-row">
        <h1>Add League</h1>
        <button class="back-btn" @click="router.push('/leagues')">
          ← Back to Leagues
        </button>
      </div>

      <div class="add-item-form-container">
        <form class="add-item-form grid-form">

          <!-- League Name -->
          <div class="form-group">
            <label class="form-label">League Name</label>
            <input type="text" v-model="league_info.name" class="form-input" placeholder="e.g. Premier League" />
            <p class="err">{{ league_info_error.name_err }}</p>
          </div>

          <!-- Slug -->
          <div class="form-group">
            <label class="form-label">Slug <span class="hint">(auto-generated, editable)</span></label>
            <input type="text" v-model="league_info.slug" class="form-input" placeholder="e.g. premier-league" />
            <p class="err">{{ league_info_error.slug_err }}</p>
          </div>

          <!-- Sport -->
          <div class="form-group">
            <label class="form-label">Sport</label>
            <select v-model="league_info.sport_id" class="form-input">
              <option value="" disabled>Select sport</option>
              <option v-for="sport in sports_store.sports" :key="sport.id" :value="sport.id">
                {{ sport.name }}
              </option>
            </select>
            <p class="err">{{ league_info_error.sport_err }}</p>
          </div>

          <!-- Country -->
          <div class="form-group">
            <label class="form-label">Country</label>
            <select v-model="league_info.country_id" class="form-input">
              <option value="" disabled>Select country</option>
              <option v-for="country in countries_store.countries" :key="country.id" :value="country.id">
                {{ country.name }}
              </option>
            </select>
            <p class="err">{{ league_info_error.country_err }}</p>
          </div>

          <!-- Logo Upload -->
          <div class="form-group grid-full">
            <label class="form-label">Logo</label>
            <input type="file" ref="logoImage" accept="image/*" class="form-input" />
            <p class="err">{{ league_info_error.logo_err }}</p>
          </div>

          <!-- Preview -->
          <div class="form-group grid-full" v-if="logoPreview">
            <label class="form-label">Preview</label>
            <img :src="logoPreview" alt="Logo preview" class="flag-preview" />
          </div>

          <!-- Submit -->
          <div class="form-group grid-full">
            <button type="submit" @click.prevent="submitLeague" class="submit-button">
              Add League
            </button>
          </div>

        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useInteractiveStore } from '@/stores/interactive'
import { useAdminStore } from '@/stores/admin'
import { useLeaguesStore } from '@/stores/leagues'
import { useCountriesStore } from '@/stores/countries'
import { useSportsStore } from '@/stores/sports'
import HEADER from '../components/Header.vue'
import OVERLAY from '../components/modals/loading_overlay.vue'
import SIDEBAR from '../components/SideBar.vue'
import API from '../api/index'

const interactive_store = useInteractiveStore()
const admin_store       = useAdminStore()
const leagues_store     = useLeaguesStore()
const countries_store   = useCountriesStore()
const sports_store      = useSportsStore()
const router            = useRouter()

const logoImage  = ref(null)
const logoPreview = ref(null)

const league_info = reactive({
  name: '',
  slug: '',
  sport_id: '',
  country_id: '',
})

const league_info_error = reactive({
  name_err: '',
  slug_err: '',
  sport_err: '',
  country_err: '',
  logo_err: '',
})

// ── Auto-generate slug from name ─────────────────────
watch(() => league_info.name, (val) => {
  league_info.slug = val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
})

// ── Logo preview ─────────────────────────────────────
watch(logoImage, () => {
  const file = logoImage.value?.files?.[0]
  if (file) logoPreview.value = URL.createObjectURL(file)
  else logoPreview.value = null
})

// ── Auth guard ───────────────────────────────────────
watch(() => admin_store.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    interactive_store.backend_message = 'Session expired'
    interactive_store.display_success_alert_box(true)
    setTimeout(() => router.push({ path: '/login' }), 1000)
  }
})

// ── Validation ───────────────────────────────────────
function validate() {
  let valid = true

  if (!league_info.name.trim()) {
    league_info_error.name_err = 'League name is required'
    valid = false
  } else { league_info_error.name_err = '' }

  if (!league_info.slug.trim()) {
    league_info_error.slug_err = 'Slug is required'
    valid = false
  } else { league_info_error.slug_err = '' }

  if (!league_info.sport_id) {
    league_info_error.sport_err = 'Please select a sport'
    valid = false
  } else { league_info_error.sport_err = '' }

  if (!league_info.country_id) {
    league_info_error.country_err = 'Please select a country'
    valid = false
  } else { league_info_error.country_err = '' }

  const file = logoImage.value?.files?.[0]
  if (!file) {
    league_info_error.logo_err = 'Please upload a logo'
    valid = false
  } else if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
    league_info_error.logo_err = 'Invalid image file'
    valid = false
  } else if (file.size > 2 * 1024 * 1024) {
    league_info_error.logo_err = 'Image too large (max 2MB)'
    valid = false
  } else { league_info_error.logo_err = '' }

  return valid
}

// ── Submit ───────────────────────────────────────────
async function submitLeague() {
  if (!validate()) return

  const file = logoImage.value.files[0]

  const formData = new FormData()
  formData.append('name', league_info.name)
  formData.append('slug', league_info.slug)
  formData.append('sport_id', league_info.sport_id)
  formData.append('country_id', league_info.country_id)
  formData.append('league_image', file, file.name)

  interactive_store.toggle_loading_overlay(true)

  try {

    const res = await API.add_league(formData)

    await leagues_store.fetch_leagues()

    interactive_store.backend_message = res.message
    
    interactive_store.display_success_alert_box()

    resetForm()

    setTimeout(() => router.push('/account/leagues'), 1200)

  } catch (err) {

    interactive_store.backend_message = err.message
    
    interactive_store.display_error_alert_box()
  
  } finally {
    
    interactive_store.toggle_loading_overlay(false)
  
  }

}

// ── Reset ────────────────────────────────────────────
function resetForm() {
  league_info.name = ''
  league_info.slug = ''
  league_info.sport_id = ''
  league_info.country_id = ''
  logoPreview.value = null
  if (logoImage.value) logoImage.value.value = ''
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