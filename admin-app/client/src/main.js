
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { useAdminStore } from './stores/admin';
import { useSportsStore } from './stores/sports';
import { useCountriesStore } from './stores/countries';
import { useUsersStore } from '@/stores/users';
import { useLeaguesStore } from '@/stores/leagues';
import { useEventsStore } from '@/stores/events';
import { useSettingStore } from './stores/settings';

import './assets/css/global.css'

import { createPinia } from 'pinia'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faNavicon, faSpinner, faHome, faCartShopping, faSearch, faUtensils, faHotel, faBurger, faPeopleRoof, faGraduationCap, faShop, faHouse, faUser, faTrash, faExclamation, faArrowRightLong, faXmark, faArrowLeftLong, faCircleCheck, faChevronLeft, faChevronRight, faBoxOpen, faUserTie, faEnvelope, faSignOut, faGauge, faUsers, faCalculator, faSort, faPhone, faLocation, faCamera, faMessage, faChartLine, faUserCog, faMobilePhone, faPlus, faMobileScreenButton} from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add( faNavicon, faSpinner, faHome, faCartShopping, faSearch, faUtensils, faHotel, faBurger, faPeopleRoof, faGraduationCap, faShop, faHouse, faUser, faTrash, faExclamation, faArrowRightLong, faXmark, faArrowLeftLong, faCircleCheck, faChevronLeft, faChevronRight, faBoxOpen, faUserTie, faEnvelope, faSignOut, faGauge, faUsers, faCalculator, faSort, faPhone, faLocation, faCamera, faMessage, faChartLine, faUserCog, faMobilePhone, faPlus, faMobileScreenButton)


// Import the component
import SUCCESSALERTBOX from './components/alert_box/success.vue';
import ERRORALERTBOX from './components/alert_box/error.vue';

const app = createApp(App)

const pinia = createPinia()

app.component('font-awesome-icon', FontAwesomeIcon)


// Register the component globally
app.component('SUCCESSALERTBOX', SUCCESSALERTBOX);
app.component('ERRORALERTBOX', ERRORALERTBOX);

app.use(router)
app.use(pinia)

// Fetch data before mounting the app
const initializeApp = async () => {
    
    const admin_store = useAdminStore(); // Access the admin

    const sports_store = useSportsStore(); //Access the orders store

    const countries_store = useCountriesStore();  

    const users_store = useUsersStore()

    const leagues_store = useLeaguesStore()

    const events_store = useEventsStore()

    const settings_store = useSettingStore();
    
    try {

        await admin_store.fetch_admin().catch(err => { // Try to fetch user but DON'T block the app if it fails

            console.log("Admin fetch failed (not logged in).", err); 
          
        });

        if (admin_store.isAuthenticated) {

            await Promise.all([

            sports_store.fetch_sports(),
    
            countries_store.fetch_countries(),

            leagues_store.fetch_leagues(),

            events_store.fetch_events(),

            users_store.fetch_users(),

            settings_store.fetch_settings()
    
            ]);
        }       
    
    } catch (error) {
    
        console.log("Error during initialization:", error);

    }
  
    app.mount('#app'); // Mount the app only after data is fetched
  
};
  
initializeApp();
