import { defineStore } from "pinia";

import HELPERS from '../middlewares/middlewares'

import { useInteractiveStore } from './interactive'; // Import the cart store

import { useUserStore } from "./user";

export const useEventsStore = defineStore("events", {

    state: () => ({
      events: [],
      bet_slip: (() => {
        try {
          return JSON.parse(localStorage.getItem('bet_slip_events')) || []
        } catch {
          return []
        }
      })()
    }),

    getters: {

        isBetSelected: (state) => {
            return (selId) => state.bet_slip.some(b => b.selectionId === selId)
        },

        total_bet_slip_events: (state) => state.bet_slip.length,

        total_odds: (state) => {

          return state.bet_slip.reduce((acc, b) => acc * b.odd, 1);
        
        },

        possible_profit: (state) => {
          const user_store = useUserStore()
            return (stake) => {
              return user_store.formattedPrice(stake * state.total_odds)
            }
          }
        
     },
    
    actions: {

    toggleBet(event, sel, group) {

        console.log(event.id)

        const interactive_store = useInteractiveStore(); // Access the interactive store

        try {

        const idx = this.bet_slip.findIndex(b => b.selectionId === sel.id)
        
        if (idx !== -1) {

          this.bet_slip.splice(idx, 1)
         
          return
        
        }
        
        // replace existing selection from same event
        const existingIdx = this.bet_slip.findIndex(b => b.eventId === event.id)
        
        if (existingIdx !== -1) this.bet_slip.splice(existingIdx, 1)
      
        this.bet_slip.push({
          selectionId: sel.id,
          eventId:     event.id,
          home:        event.home,
          away:        event.away,
          league:      group.leagueName,
          market:      event.market ?? 'ML',
          selection:   sel.name,
          line_value:  sel.line_value ?? null,                         // ← add this
          label:       group.market_slug + ' ' + HELPERS.formatSelectionName(sel.name, group.sportSlug)
                       + (sel.line_value != null ? ` ${sel.line_value}` : ''),  // ← append it
          odd:         sel.odd,
        })

        this.save_bet_slip_to_Lstorage() //store cart events for localstorage 

      } catch(err) { //if there is an error

        interactive_store.backend_message = 'error adding item to cart. try again'
        
        interactive_store.display_error_alert_box()

    }

  },  


  remove_bet(selId) { //delete product from cart

    this.bet_slip = this.bet_slip.filter(b => b.selectionId !== selId)
    
    this.save_bet_slip_to_Lstorage();
  
  },
  

  save_bet_slip_to_Lstorage () { //store cart events for localstorage

    localStorage.setItem('bet_slip_events', JSON.stringify(this.bet_slip)); 

  }

 }
})