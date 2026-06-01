
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { useUserStore } from './stores/user';
import { useSettingsStore } from './stores/settings';
import { useCountriesStore } from './stores/countries';
import { usesportsStore } from './stores/sports';
import { useLeaguesStore } from './stores/leagues';
import { useInteractiveStore } from './stores/interactive';

import './assets/css/global.css'

import { createPinia } from 'pinia'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faNavicon, faSpinner, faHome, faCartShopping, faSearch, faUtensils, faHotel, faBurger, faPeopleRoof, faGraduationCap, faShop, faHouse, faUser, faTrash, faExclamation, faArrowRightLong, faXmark, faArrowLeftLong, faCircleCheck, faChevronLeft, faChevronRight, faBoxOpen, faCube, faEnvelope, faSignOut, faPhone, faLocation, faLock, faClock, faCheckCircle} from '@fortawesome/free-solid-svg-icons'

import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'; 

/* add icons to the library */
library.add( faNavicon, faSpinner, faHome, faCartShopping, faSearch, faUtensils, faHotel, faBurger, faPeopleRoof, faGraduationCap, faShop, faHouse, faUser, faTrash, faExclamation, faArrowRightLong, faXmark, faArrowLeftLong, faCircleCheck, faChevronLeft, faChevronRight, faBoxOpen, faCube, faEnvelope, faSignOut, faWhatsapp, faPhone, faLocation, faLock, faClock, faCheckCircle)

// Import the component
import SUCCESSALERTBOX from './components/alert_box/success.vue';
import ERRORALERTBOX from './components/alert_box/error.vue';

const app = createApp(App)

const pinia = createPinia()

app.component('font-awesome-icon', FontAwesomeIcon)

// Register the component globally
app.component('SUCCESSALERTBOX', SUCCESSALERTBOX);
app.component('ERRORALERTBOX', ERRORALERTBOX);

app.use(pinia);   // 1️⃣ Load stores first
app.use(router); // 2️⃣ Then load router (guards can now read store)

// Fetch data before mounting the app
const initializeApp = async () => {
  const userStore = useUserStore();
  const settings_store = useSettingsStore();
  const countriesStore = useCountriesStore()
  const sportsStore = usesportsStore();
  const leaguesStore = useLeaguesStore();

  try {
    
    await userStore.fetch_user().catch(err => { // Try to fetch user but DON'T block the app if it fails

      console.log("User fetch failed (not logged in).", err); 
    
    });
  
    await Promise.all([ // fetch public data

      countriesStore.fetch_countries(),

      sportsStore.fetch_sports(),

      leaguesStore.fetch_leagues(),

      settings_store.fetch_settings()

    ])

    
    // if (userStore.user) { // Fetch orders only if logged in
      
    //   await ordersStore.fetch_orders();
    
    // }

  } catch (error) {
  
    console.error("Initialization error:", error);
  
  }

  app.mount('#app');

};

initializeApp()