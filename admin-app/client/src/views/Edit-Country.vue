<template>
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY/>
    <SUCCESSALERTBOX>{{interactive_store.backend_message}}</SUCCESSALERTBOX>
    <ERRORALERTBOX>{{interactive_store.backend_message}}</ERRORALERTBOX>
    <SIDEBAR/>

    <div class="sub_container" :style="interactive_store.sub_container_css">

      <HEADER page_name="edit-country" searchbox_placeholder="Search countries" />

      <div class="page-title-row">
        <h1>Edit Country</h1>
        <button class="back-btn" @click="router.push('/countries')">
          ← Back to Countries
        </button>
      </div>

      <div class="add-item-form-container">
        <form class="add-item-form grid-form">

          <!-- Country Name -->
          <div class="form-group">
            <label class="form-label">Country Name</label>
            <input type="text" v-model="country_info.name" class="form-input" placeholder="e.g. Nigeria" />
            <p class="err">{{ country_info_error.name_err }}</p>
          </div>

          <!-- Country Code -->
          <div class="form-group">
            <label class="form-label">Country Code</label>
            <input type="text" v-model="country_info.code" class="form-input" placeholder="e.g. NG" maxlength="10" />
            <p class="err">{{ country_info_error.code_err }}</p>
          </div>

          <!-- Slug -->
          <div class="form-group grid-full">
            <label class="form-label">Slug <span class="hint">(auto-generated, editable)</span></label>
            <input type="text" v-model="country_info.slug" class="form-input" placeholder="e.g. nigeria" />
            <p class="err">{{ country_info_error.slug_err }}</p>
          </div>

          <!-- Current Flag -->
          <div class="form-group grid-full" v-if="country_info.flag">
            <label class="form-label">Current Flag</label>
            <img :src="`http://localhost:7000${country_info.flag}`" alt="Current flag" class="flag-preview" />
          </div>

          <!-- New Flag Upload -->
          <div class="form-group grid-full">
            <label class="form-label">Change Flag <span class="hint">(leave empty to keep current)</span></label>
            <input type="file" ref="flagImage" accept="image/*" class="form-input" />
            <p class="err">{{ country_info_error.flag_err }}</p>
          </div>

          <!-- New Flag Preview -->
          <div class="form-group grid-full" v-if="flagPreview">
            <label class="form-label">New Flag Preview</label>
            <img :src="flagPreview" alt="Flag preview" class="flag-preview" />
          </div>

          <!-- Submit -->
          <div class="form-group grid-full">
            <button type="submit" @click.prevent="submitEdit" class="submit-button">
              Save Changes
            </button>
          </div>

        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInteractiveStore } from '@/stores/interactive'
import { useAdminStore } from '@/stores/admin'
import { useCountriesStore } from '@/stores/countries'
import HEADER from '../components/Header.vue'
import OVERLAY from '../components/modals/loading_overlay.vue'
import SIDEBAR from '../components/SideBar.vue'
import API from '../api/index'

const interactive_store = useInteractiveStore()
const admin_store       = useAdminStore()
const countries_store   = useCountriesStore()
const router            = useRouter()
const route             = useRoute()

const country_id  = route.params.id
const flagImage   = ref(null)
const flagPreview = ref(null)

const country_info = reactive({
  name: '',
  code: '',
  slug: '',
  flag: '',
})

const country_info_error = reactive({
  name_err: '',
  code_err: '',
  slug_err: '',
  flag_err: '',
})

// ── Load existing country data ────────────────────────
const existing = countries_store.countries.find(c => c.id == country_id)
if (!existing) {
  router.push('/countries')
} else {
  country_info.name = existing.name
  country_info.code = existing.code
  country_info.slug = existing.slug
  country_info.flag = existing.flag
}

// ── Auto-generate slug from name ─────────────────────
watch(() => country_info.name, (val) => {
  country_info.slug = val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  country_info.code = val.slice(0, 2).toUpperCase()
})

// ── New flag preview ──────────────────────────────────
watch(flagImage, () => {
  const file = flagImage.value?.files?.[0]
  if (file) flagPreview.value = URL.createObjectURL(file)
  else flagPreview.value = null
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

  if (!country_info.name.trim()) {
    country_info_error.name_err = 'Country name is required'
    valid = false
  } else { country_info_error.name_err = '' }

  if (!country_info.code.trim()) {
    country_info_error.code_err = 'Country code is required'
    valid = false
  } else { country_info_error.code_err = '' }

  if (!country_info.slug.trim()) {
    country_info_error.slug_err = 'Slug is required'
    valid = false
  } else { country_info_error.slug_err = '' }

  const file = flagImage.value?.files?.[0]
  if (file) {
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      country_info_error.flag_err = 'Invalid image file'
      valid = false
    } else if (file.size > 2 * 1024 * 1024) {
      country_info_error.flag_err = 'Image too large (max 2MB)'
      valid = false
    } else { country_info_error.flag_err = '' }
  } else {
    country_info_error.flag_err = ''
  }

  return valid
}

// ── Submit ───────────────────────────────────────────
async function submitEdit() {

  if (!validate()) return

  const formData = new FormData()
  formData.append('id', country_id)
  formData.append('name', country_info.name)
  formData.append('code', country_info.code.toUpperCase())
  formData.append('slug', country_info.slug)
  formData.append('current_flag', country_info.flag) // e.g. /resources/countries/country_image_123.png

  const file = flagImage.value?.files?.[0]

  if (file) formData.append('country_image', file, file.name)

  interactive_store.toggle_loading_overlay(true)

  try {

    const res = await API.update_country(formData)

    await countries_store.fetch_countries()

    interactive_store.backend_message = res.message
    
    interactive_store.display_success_alert_box()

    setTimeout(() => router.push('/countries'), 1200)

  } catch (err) {
    
    interactive_store.backend_message = err.message
    
    interactive_store.display_error_alert_box()
  
  } finally {
    
    interactive_store.toggle_loading_overlay(false)
  
  }

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
}
.back-btn:hover { background-color: #1a4a6e; }

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