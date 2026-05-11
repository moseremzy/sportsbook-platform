<template>
  <div class="events-page">

    <!-- ═══════════════════════════════════════════
         SPORTS TAB BAR (both desktop + mobile)
    ════════════════════════════════════════════ -->
    <div class="sports-tabbar">
    <button class="tab-arrow" @click="scrollLeft">
      <font-awesome-icon class="fa-solid fa-chevron-left" icon="fa-solid fa-chevron-left"/> 
    </button>
      <div class="sports-tabs-inner" ref="sportsScroll">
        <button
          v-for="sport in sports"
          :key="sport.id"
          class="sport-item"
          :class="{ active: activeSport === sport.id }"
          @click="selectSport(sport.id)"
        >
          <span class="sport-item-icon" v-html="sport.icon"></span>
          <span class="sport-item-name">{{ sport.name }}</span>
        </button>
      </div>
      <button class="tab-arrow" @click="scrollRight"> 
        <font-awesome-icon class="fa-solid fa-chevron-right" icon="fa-solid fa-chevron-right"/> 
      </button>
    </div>

    <!-- ═══════════════════════════════════════════
         MOBILE: Top bar (All Sports + Open Live + Search)
    ════════════════════════════════════════════ -->
    <div class="mobile-topbar mobile-only">
      <button class="mob-all-sports-btn" @click="mobileSidebarOpen = true">
        <span class="hamburger-icon">&#9776;</span> All Sports
      </button>
      <button class="mob-open-live-btn">Open Live</button>
      <button class="mob-search-btn" @click="mobileSearchOpen = !mobileSearchOpen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      </button>
    </div>

    <!-- Mobile Search Bar -->
    <div class="mobile-search-bar mobile-only" v-if="mobileSearchOpen">
      <input v-model="searchQuery" placeholder="Search events..." class="mob-search-input" />
    </div>

    <!-- Mobile time slider -->
    <div class="mobile-slider-row mobile-only">
      <span class="slider-label">{{ sliderDays }} days<br><small>Events</small></span>
      <input type="range" min="1" max="7" v-model="sliderDays" class="time-slider" />
    </div>


    <!-- ═══════════════════════════════════════════
         MAIN LAYOUT
    ════════════════════════════════════════════ -->
    <div class="main-layout">

      <!-- ── LEFT SIDEBAR (desktop always, mobile as overlay) ── -->
      <aside class="left-sidebar" :class="{ 'mob-open': mobileSidebarOpen }">
        <!-- Mobile close overlay -->
        <div class="mob-overlay" @click="mobileSidebarOpen = false" v-if="mobileSidebarOpen"/>
        <div class="sidebar-panel">
          <!-- Desktop: Prematch / Live tabs -->
          <div class="sidebar-top desktop-only">
            <button class="prematch-btn" :class="{ active: matchMode === 'prematch' }" @click="matchMode = 'prematch'">Prematch</button>
            <button class="prematch-btn" :class="{ active: matchMode === 'live' }" @click="matchMode = 'live'">Live</button>
            <button class="collapse-btn">&#171;</button>
          </div>

          <!-- Desktop: time slider -->
          <div class="sidebar-slider desktop-only">
            <span class="slider-label">3 hours<br><small>Events</small></span>
            <input type="range" min="1" max="12" v-model="sliderHours" class="time-slider" />
            <button class="settings-btn">⚙</button>
          </div>

          <!-- Search -->
          <div class="sidebar-search desktop-only">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input v-model="searchQuery" placeholder="Search" />
          </div>

          <!-- Favorites -->
          <div class="sidebar-item favorites-item">
            <span class="sidebar-item-icon">👍</span>
            <span>Favorites</span>
          </div>

          <!-- Sports section -->
          <div class="sidebar-section-label">Sports</div>

          <!-- Sport trees -->
          <div v-for="sport in sports" :key="sport.id" class="sport-tree">
            <div
              class="sport-tree-header"
              :class="{ active: activeSport === sport.id }"
              @click="selectSport(sport.id)"
            >
              <span class="sport-tree-icon" v-html="sport.icon"></span>
              <span class="sport-tree-name">{{ sport.name }} {{ sport.count }}</span>
              <svg class="chevron" :class="{ open: activeSport === sport.id }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>

            <!-- Countries under sport -->
            <div v-if="activeSport === sport.id" class="country-list">
              <div
                v-for="country in sport.countries"
                :key="country.id"
                class="country-item"
              >
                <div
                  class="country-header"
                  @click="toggleCountry(country.id)"
                  :class="{ active: activeCountry === country.id }"
                >
                  <span class="country-flag">{{ country.flag }}</span>
                  <span class="country-name">{{ country.name }}</span>
                  <svg class="chevron" :class="{ open: activeCountry === country.id }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>

                <!-- Leagues under country -->
                <div v-if="activeCountry === country.id" class="league-list">
                  <div
                    v-for="league in country.leagues"
                    :key="league.id"
                    class="league-item"
                    :class="{ active: activeLeague === league.id }"
                    @click="selectLeague(league.id); mobileSidebarOpen = false"
                  >
                    {{ league.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ── CENTER: EVENTS ── -->
      <div class="events-panel">
        <!-- Popular Events (mobile only) -->
        <div class="popular-events" v-if="popularEvent">
          <div class="popular-header">
            <span class="popular-title">Popular Events</span>
          </div>
          
          <div class = "event-tabbar">
          <button class="tab-arrow" @click="scrollLeft">
            <font-awesome-icon class="fa-solid fa-chevron-left" icon="fa-solid fa-chevron-left"/> 
          </button>
          <div class = "event-scroll" ref="eventsScroll">
          <div class="popular-card">
            <div class="popular-card-top">
              <span class="live-badge">Live</span>
              <span class="popular-league">{{ popularEvent.league }}</span>
              <svg class="star-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div class="popular-teams">
              <div class="popular-team">
                <div class="team-logo-circle">{{ popularEvent.home[0] }}</div>
                <span>{{ popularEvent.home }}</span>
              </div>
              <div class="popular-score">{{ popularEvent.score }}</div>
              <div class="popular-team">
                <div class="team-logo-circle">{{ popularEvent.away[0] }}</div>
                <span>{{ popularEvent.away }}</span>
              </div>
            </div>
            <div class="popular-odds">
              <button class="odd-btn odd-btn--1"><span class="odd-label">1</span><span class="odd-val">{{ popularEvent.odds[0] }}</span></button>
              <button class="odd-btn odd-btn--x"><span class="odd-label">X</span><span class="odd-val">{{ popularEvent.odds[1] }}</span></button>
              <button class="odd-btn odd-btn--2"><span class="odd-label">2</span><span class="odd-val">{{ popularEvent.odds[2] }}</span></button>
            </div>
            <div class="popular-more">+{{ popularEvent.more }}</div>
          </div>
          <div class="popular-card">
            <div class="popular-card-top">
              <span class="live-badge">Live</span>
              <span class="popular-league">{{ popularEvent.league }}</span>
              <svg class="star-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div class="popular-teams">
              <div class="popular-team">
                <div class="team-logo-circle">{{ popularEvent.home[0] }}</div>
                <span>{{ popularEvent.home }}</span>
              </div>
              <div class="popular-score">{{ popularEvent.score }}</div>
              <div class="popular-team">
                <div class="team-logo-circle">{{ popularEvent.away[0] }}</div>
                <span>{{ popularEvent.away }}</span>
              </div>
            </div>
            <div class="popular-odds">
              <button class="odd-btn odd-btn--1"><span class="odd-label">1</span><span class="odd-val">{{ popularEvent.odds[0] }}</span></button>
              <button class="odd-btn odd-btn--x"><span class="odd-label">X</span><span class="odd-val">{{ popularEvent.odds[1] }}</span></button>
              <button class="odd-btn odd-btn--2"><span class="odd-label">2</span><span class="odd-val">{{ popularEvent.odds[2] }}</span></button>
            </div>
            <div class="popular-more">+{{ popularEvent.more }}</div>
          </div>
        </div>
        <button class="tab-arrow" @click="scrollRight"> 
           <font-awesome-icon class="fa-solid fa-chevron-right" icon="fa-solid fa-chevron-right"/> 
          </button>
        </div>
        </div>


        <!-- League groups -->
        <div v-for="group in filteredEvents" :key="group.leagueId" class="league-group">
          <div class="league-group-header" @click="toggleGroup(group.leagueId)">
            <svg class="chevron-sm" :class="{ open: !collapsedGroups.includes(group.leagueId) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            <span class="league-group-flag">{{ group.flag }}</span>
            <span class="league-group-name">{{ group.leagueName }}</span>
            <svg class="group-arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>
          </div>

          <div v-if="!collapsedGroups.includes(group.leagueId)">
            <!-- Column headers -->
            <div class="odds-header desktop-only">
              <span></span><span>1</span><span>X</span><span>2</span>
            </div>

            <!-- Events -->
            <div v-for="event in group.events" :key="event.id" class="event-row">
              <div class="event-meta">
                <span class="event-time">{{ event.time }} {{ event.date }}</span>
                <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <div class="event-teams-odds">
                <div class="event-teams">
                  <div class="team-row">
                    <span class="team-logo-sm">{{ event.home[0] }}</span>
                    <span class="team-name">{{ event.home }}</span>
                  </div>
                  <div class="team-row">
                    <span class="team-logo-sm">{{ event.away[0] }}</span>
                    <span class="team-name">{{ event.away }}</span>
                  </div>
                </div>
                <span class="event-more">+{{ event.more }}</span>
                <div class="event-odds">
                  <button
                    v-for="(odd, oi) in event.odds"
                    :key="oi"
                    class="odd-pill"
                    :class="{ selected: isOddSelected(event.id, oi) }"
                    @click="toggleOdd(event, oi, group)"
                  >{{ odd }}</button>
                </div>
                <button class="star-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredEvents.length === 0" class="no-events">
          No events found for the selected filter.
        </div>
      </div>

      <!-- ── RIGHT: BETSLIP (desktop) ── -->
      <aside class="betslip-panel desktop-only">
        <div class="betslip-header">
          <span>Betslip ({{ betslip.length }})</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>
        </div>
        <div class="betslip-tabs">
          <button class="bs-tab" :class="{ active: betMode === 'ordinary' }" @click="betMode = 'ordinary'">Ordinary</button>
          <button class="bs-tab bs-tab--express" :class="{ active: betMode === 'express' }" @click="betMode = 'express'">Express</button>
        </div>

        <div class="betslip-items">
          <div v-if="betslip.length === 0" class="betslip-empty">Add selections to your betslip</div>
          <div v-for="(bet, i) in betslip" :key="i" class="betslip-item">
            <div class="bet-item-top">
              <span class="bet-league">{{ bet.league }}</span>
              <button class="bet-remove" @click="removeBet(i)">✕</button>
            </div>
            <div class="bet-teams">{{ bet.home }}<br/>{{ bet.away }}</div>
            <div class="bet-outcome-row">
              <span class="bet-outcome">{{ bet.outcomeLabel }}</span>
              <span class="bet-odd-val">{{ bet.odd }}</span>
            </div>
            <div class="bet-winner-label">Winner: {{ bet.winner }}</div>
          </div>
        </div>

        <div class="betslip-footer" v-if="betslip.length > 0">
          <div class="total-coeff">
            <span>Total Coefficient:</span>
            <span class="coeff-val">{{ totalCoeff }}</span>
          </div>
          <div class="bet-amount-row">
            <input type="number" v-model="betAmount" class="bet-amount-input" placeholder="Bet amount" />
          </div>
          <button class="place-bet-btn">Place Bet</button>
        </div>
      </aside>
    </div>

    <!-- ═══════════════════════════════════════════
         MOBILE: Betslip FAB + panel
    ════════════════════════════════════════════ -->
    <button class="mob-betslip-fab mobile-only" @click="mobileBetslipOpen = !mobileBetslipOpen">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 7h8M8 11h8M8 15h4"/></svg>
      <span v-if="betslip.length > 0" class="fab-badge">{{ betslip.length }}</span>
    </button>

    <!-- Mobile betslip drawer -->
    <Transition name="slide-up">
      <div class="mob-betslip-drawer mobile-only" v-if="mobileBetslipOpen">
        <div class="mob-betslip-header">
          <span>Betslip ({{ betslip.length }})</span>
          <button @click="mobileBetslipOpen = false">✕</button>
        </div>
        <div class="betslip-tabs">
          <button class="bs-tab" :class="{ active: betMode === 'ordinary' }" @click="betMode = 'ordinary'">Ordinary</button>
          <button class="bs-tab bs-tab--express" :class="{ active: betMode === 'express' }" @click="betMode = 'express'">Express</button>
        </div>
        <div class="betslip-items">
          <div v-if="betslip.length === 0" class="betslip-empty">Add selections to your betslip</div>
          <div v-for="(bet, i) in betslip" :key="i" class="betslip-item">
            <div class="bet-item-top">
              <span class="bet-league">{{ bet.league }}</span>
              <button class="bet-remove" @click="removeBet(i)">✕</button>
            </div>
            <div class="bet-teams">{{ bet.home }} vs {{ bet.away }}</div>
            <div class="bet-outcome-row">
              <span class="bet-outcome">{{ bet.outcomeLabel }}</span>
              <span class="bet-odd-val">{{ bet.odd }}</span>
            </div>
          </div>
        </div>
        <div class="betslip-footer" v-if="betslip.length > 0">
          <div class="total-coeff">
            <span>Total Coefficient:</span>
            <span class="coeff-val">{{ totalCoeff }}</span>
          </div>
          <button class="place-bet-btn">Place Bet</button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>

import { ref, computed } from 'vue'

const sportsScroll = ref(null)
const eventsScroll = ref(null)

// ── Sports data ───────────────────────────────────────
const sports = [
  {
    id: 'football', name: 'Football', count: 36,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 6.32 2.26M12 2a10 10 0 0 0-6.32 2.26M2.26 8.68A10 10 0 0 1 12 2M21.74 8.68A10 10 0 0 0 12 2M12 22a10 10 0 0 1-9.74-13.32M12 22a10 10 0 0 0 9.74-13.32M8 12l2 5 4-2 2-5-4-2z"/></svg>`,
    countries: [
      { id: 'england', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', leagues: [{ id: 'epl', name: 'Premier League' }] },
      { id: 'spain',   name: 'Spain',   flag: '🇪🇸', leagues: [{ id: 'laliga', name: 'La Liga' }] },
      { id: 'germany', name: 'Germany', flag: '🇩🇪', leagues: [{ id: 'bundesliga', name: 'Bundesliga' }] },
    ]
  },
  {
    id: 'basketball', name: 'Basketball', count: 14,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20M4.93 4.93a10 10 0 0 1 14.14 0M4.93 19.07a10 10 0 0 0 14.14 0"/></svg>`,
    countries: [
      { id: 'usa-bball', name: 'USA', flag: '🇺🇸', leagues: [{ id: 'nba', name: 'NBA' }, { id: 'ncaa', name: 'NCAA' }] },
    ]
  },
  {
    id: 'baseball', name: 'Baseball', count: 9,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M5 5c2 2 2 10 0 14M19 5c-2 2-2 10 0 14M12 2c1 3 1 14 0 20"/></svg>`,
    countries: [
      { id: 'usa-base', name: 'USA', flag: '🇺🇸', leagues: [{ id: 'mlb', name: 'MLB' }, { id: 'milb', name: 'Minor League' }] },
    ]
  },
  {
    id: 'baseball', name: 'Baseball', count: 9,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M5 5c2 2 2 10 0 14M19 5c-2 2-2 10 0 14M12 2c1 3 1 14 0 20"/></svg>`,
    countries: [
      { id: 'usa-base', name: 'USA', flag: '🇺🇸', leagues: [{ id: 'mlb', name: 'MLB' }, { id: 'milb', name: 'Minor League' }] },
    ]
  },
  {
    id: 'baseball', name: 'Baseball', count: 9,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M5 5c2 2 2 10 0 14M19 5c-2 2-2 10 0 14M12 2c1 3 1 14 0 20"/></svg>`,
    countries: [
      { id: 'usa-base', name: 'USA', flag: '🇺🇸', leagues: [{ id: 'mlb', name: 'MLB' }, { id: 'milb', name: 'Minor League' }] },
    ]
  },
  {
    id: 'baseball', name: 'Baseball', count: 9,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M5 5c2 2 2 10 0 14M19 5c-2 2-2 10 0 14M12 2c1 3 1 14 0 20"/></svg>`,
    countries: [
      { id: 'usa-base', name: 'USA', flag: '🇺🇸', leagues: [{ id: 'mlb', name: 'MLB' }, { id: 'milb', name: 'Minor League' }] },
    ]
  },
  {
    id: 'baseball', name: 'Baseball', count: 9,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M5 5c2 2 2 10 0 14M19 5c-2 2-2 10 0 14M12 2c1 3 1 14 0 20"/></svg>`,
    countries: [
      { id: 'usa-base', name: 'USA', flag: '🇺🇸', leagues: [{ id: 'mlb', name: 'MLB' }, { id: 'milb', name: 'Minor League' }] },
    ]
  },
]



// ── Events data ───────────────────────────────────────
const allEvents = [
  // Football - EPL
  {
    leagueId: 'epl', leagueName: 'England. Premier League', sportId: 'football', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    events: [
      { id: 'e1', time: '15:00', date: '11.05', home: 'Manchester City', away: 'Arsenal',          odds: [2.10, 3.40, 3.20], more: 210 },
      { id: 'e2', time: '17:30', date: '11.05', home: 'Chelsea',         away: 'Liverpool',         odds: [2.85, 3.20, 2.55], more: 198 },
      { id: 'e3', time: '20:00', date: '11.05', home: 'Tottenham',       away: 'Manchester Utd',    odds: [2.40, 3.10, 2.90], more: 175 },
    ]
  },
  // Football - La Liga
  {
    leagueId: 'laliga', leagueName: 'Spain. La Liga', sportId: 'football', flag: '🇪🇸',
    events: [
      { id: 'e4', time: '19:00', date: '11.05', home: 'Real Madrid',  away: 'Barcelona',   odds: [2.20, 3.50, 3.10], more: 320 },
      { id: 'e5', time: '21:30', date: '11.05', home: 'Atletico',     away: 'Sevilla',     odds: [1.95, 3.40, 3.80], more: 145 },
    ]
  },
  // Football - Bundesliga
  {
    leagueId: 'bundesliga', leagueName: 'Germany. Bundesliga', sportId: 'football', flag: '🇩🇪',
    events: [
      { id: 'e6', time: '18:30', date: '11.05', home: 'Bayern Munich', away: 'Dortmund',  odds: [1.75, 3.80, 4.50], more: 280 },
      { id: 'e7', time: '20:30', date: '11.05', home: 'Leipzig',       away: 'Leverkusen',odds: [2.60, 3.20, 2.70], more: 130 },
    ]
  },
  // Basketball - NBA
  {
    leagueId: 'nba', leagueName: 'USA. NBA', sportId: 'basketball', flag: '🇺🇸',
    events: [
      { id: 'e8',  time: '01:00', date: '12.05', home: 'LA Lakers',  away: 'Golden State', odds: [1.90, null, 1.95], more: 88 },
      { id: 'e9',  time: '03:30', date: '12.05', home: 'Boston',     away: 'Miami Heat',   odds: [1.65, null, 2.25], more: 76 },
    ]
  },
  // Basketball - NCAA
  {
    leagueId: 'ncaa', leagueName: 'USA. NCAA', sportId: 'basketball', flag: '🇺🇸',
    events: [
      { id: 'e10', time: '23:00', date: '11.05', home: 'Duke',        away: 'Kentucky',    odds: [1.80, null, 2.05], more: 42 },
    ]
  },
  // Baseball - MLB
  {
    leagueId: 'mlb', leagueName: 'USA. MLB', sportId: 'baseball', flag: '🇺🇸',
    events: [
      { id: 'e11', time: '22:10', date: '11.05', home: 'NY Yankees',  away: 'Boston Red Sox', odds: [1.85, null, 1.98], more: 65 },
      { id: 'e12', time: '00:40', date: '12.05', home: 'LA Dodgers',  away: 'SF Giants',      odds: [1.70, null, 2.15], more: 58 },
    ]
  },
  // Baseball - Minor League
  {
    leagueId: 'milb', leagueName: 'USA. Minor League', sportId: 'baseball', flag: '🇺🇸',
    events: [
      { id: 'e13', time: '20:05', date: '11.05', home: 'Durham Bulls', away: 'Norfolk Tides',  odds: [1.95, null, 1.88], more: 22 },
    ]
  },
]

const popularEvent = {
  league: 'Football. Brazil. Campeonato Brasileiro ...',
  home: 'Clube do Remo', away: 'Sociedade Esportiva Palmeiras',
  score: '1 : 1', odds: [18, 1.66, 2.46], more: 194,
}


/* SPORTS TAB BAR SCROLL HANDLER */

const smoothScroll = (el, distance) => {
  const start = el.scrollLeft
  const target = start + distance
  const duration = 1300  // was 350 — longer = smoother feel
  const startTime = performance.now()

  const step = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    // ease in-out quint — slower start and end than cubic
    const ease = progress < 0.5
      ? 16 * progress * progress * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 5) / 2

    el.scrollLeft = start + (target - start) * ease

    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

const scrollLeft = () => {
  if (sportsScroll.value) smoothScroll(sportsScroll.value, -200)
  if (eventsScroll.value) smoothScroll(eventsScroll.value, -200)
}

const scrollRight = () => {
  if (sportsScroll.value) smoothScroll(sportsScroll.value, 200)
  if (eventsScroll.value) smoothScroll(eventsScroll.value, 200)
}


// ── State ─────────────────────────────────────────────
const activeSport    = ref('football')
const activeCountry  = ref(null)
const activeLeague   = ref(null)
const matchMode      = ref('prematch')
const betMode        = ref('ordinary')
const searchQuery    = ref('')
const sliderHours    = ref(3)
const sliderDays     = ref(7)
const collapsedGroups     = ref([])
const mobileSidebarOpen   = ref(false)
const mobileBetslipOpen   = ref(false)
const mobileSearchOpen    = ref(false)
const betslip        = ref([])
const betAmount      = ref('')
const selectedOdds   = ref({})  // { eventId_outcomeIndex: true }

function selectSport(id) {
  activeSport.value  = id
  activeCountry.value = null
  activeLeague.value  = null
}

function toggleCountry(id) {
  activeCountry.value = activeCountry.value === id ? null : id
  activeLeague.value  = null
}

function selectLeague(id) {
  activeLeague.value = activeLeague.value === id ? null : id
}

function toggleGroup(id) {
  const idx = collapsedGroups.value.indexOf(id)
  if (idx === -1) collapsedGroups.value.push(id)
  else collapsedGroups.value.splice(idx, 1)
}

// ── Filtering ─────────────────────────────────────────
const filteredEvents = computed(() => {
  let groups = allEvents.filter(g => g.sportId === activeSport.value)

  if (activeLeague.value) {
    groups = groups.filter(g => g.leagueId === activeLeague.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    groups = groups.map(g => ({
      ...g,
      events: g.events.filter(e =>
        e.home.toLowerCase().includes(q) || e.away.toLowerCase().includes(q)
      )
    })).filter(g => g.events.length > 0)
  }

  return groups
})

// ── Betslip logic ─────────────────────────────────────
const outcomeLabels = ['1', 'X', '2']
const winnerLabels  = (event, oi) => {
  if (oi === 0) return event.home
  if (oi === 2) return event.away
  return 'Draw'
}

function isOddSelected(eventId, oi) {
  return !!selectedOdds.value[`${eventId}_${oi}`]
}

function toggleOdd(event, oi, group) {
  const key = `${event.id}_${oi}`
  if (selectedOdds.value[key]) {
    delete selectedOdds.value[key]
    const idx = betslip.value.findIndex(b => b.key === key)
    if (idx !== -1) betslip.value.splice(idx, 1)
  } else {
    // Remove other outcomes for same event
    outcomeLabels.forEach((_, i) => {
      const k = `${event.id}_${i}`
      if (selectedOdds.value[k]) {
        delete selectedOdds.value[k]
        const idx = betslip.value.findIndex(b => b.key === k)
        if (idx !== -1) betslip.value.splice(idx, 1)
      }
    })
    selectedOdds.value[key] = true
    betslip.value.push({
      key,
      league:       group.leagueName,
      home:         event.home,
      away:         event.away,
      outcomeLabel: outcomeLabels[oi],
      odd:          event.odds[oi],
      winner:       winnerLabels(event, oi),
    })
  }
  // Trigger reactivity
  selectedOdds.value = { ...selectedOdds.value }
}

function removeBet(i) {
  const bet = betslip.value[i]
  delete selectedOdds.value[bet.key]
  selectedOdds.value = { ...selectedOdds.value }
  betslip.value.splice(i, 1)
}

const totalCoeff = computed(() =>
  betslip.value.reduce((acc, b) => +(acc * b.odd).toFixed(2), 1)
)
</script>

<style scoped>
/* ── Variables ─────────────────────────────────────── */
:root {
  --bg:        #0a1f10;
  --bg2:       #0d2416;
  --panel:     #112a18;
  --card:      #163320;
  --border:    rgba(255,255,255,0.07);
  --text:      #ffffff;
  --text-dim:  rgba(255,255,255,0.55);
  --green:     #3dc45a;
  --green-d:   #2aa646;
  --odd-bg:    rgba(255,255,255,0.08);
  --odd-sel:   #3dc45a;
  --gold:      #c9a227;
}


.events-page {
  background: #0a1f10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #fff;
}

/* ── Visibility helpers ────────────────────────────── */
.desktop-only { display: none !important; }
.mobile-only  { display: none !important; }

@media (min-width: 1025px) { .desktop-only { display: flex !important; } }
@media (max-width: 1024px) { .mobile-only  { display: flex !important; } }

/* ── Mobile top bar ────────────────────────────────── */
.mobile-topbar {
  background: #0d2416;
  padding: 10px 12px;
  gap: 8px;
  align-items: center;
}

.mob-all-sports-btn {
  flex: 1;
  background: var(--color2);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
}

.mob-open-live-btn {
  flex: 1;
  background: var(--color2);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.mob-search-btn {
  width: 42px; height: 42px;
  background: var(--color2);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mob-search-btn svg { width: 18px; height: 18px; }

.mobile-search-bar {
  padding: 8px 12px;
  background: #0d2416;
}

.mob-search-input {
  width: 100%;
  background: #163320;
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 9px 14px;
  border-radius: 8px;
  font-size: 14px;
}

.mobile-slider-row {
  padding: 10px 16px;
  background: #0d2416;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

/* ── Sports tab bar ────────────────────────────────── */
.sports-tabbar {
  background: #0d2416;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  padding: 20px 8px 10px 8px;
}

.sports-tabs-inner {
  display: flex;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}

.sports-tabs-inner::-webkit-scrollbar { display: none; }

.sport-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: 0;
  margin: 0 5px;
  border-radius: 10px;
  padding: 12px 24px;
  background: rgba(102, 109, 102, 0.116);
  color: white;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: max-content;
}

.sport-item:hover { color: #fff; }

.sport-item.active {
  color: #fff;
  border-bottom-color: #3dc45a;
}

.sport-item-icon { width: 28px; height: 28px; }
.sport-item-icon svg { width: 100%; height: 100%; }
.sport-item-name { font-size: 13px; font-weight: 600; }

.tab-arrow {
  padding: 5px 10px;
  background: rgba(255,255,255,0.06);
  border: none;
  color: rgba(255,255,255,0.6);
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  /* display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; */
}

/* ── Main layout ───────────────────────────────────── */
.main-layout {
  display: flex;
  flex: 1;
  gap: 0;
  min-height: 0;
}

/* ── Left sidebar ──────────────────────────────────── */
.left-sidebar {
  width: 270px;
  flex-shrink: 0;
  background: #0d2416;
  border-right: 1px solid rgba(255,255,255,0.07);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

@media (max-width: 1024px) {
  .left-sidebar {
    position: fixed;
    inset: 0;
    z-index: 200;
    width: 100%;
    background: transparent;
    pointer-events: none;
    display: block !important;
  }

  .left-sidebar.mob-open { pointer-events: all; }

  .mob-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(2px);
  }

  .sidebar-panel {
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 280px;
    background: #0d2416;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    pointer-events: all;
  }

  .left-sidebar.mob-open .sidebar-panel {
    transform: translateX(0);
  }
}

@media (min-width: 1025px) {
  .sidebar-panel { height: 100%; }
  .mob-overlay   { display: none !important; }
}

.sidebar-top {
  padding: 12px;
  gap: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.prematch-btn {
  flex: 1;
  padding: 7px 0;
  background: rgba(255,255,255,0.06);
  border: none;
  color: rgba(255,255,255,0.6);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.prematch-btn.active {
  background: #3dc45a;
  color: #fff;
}

.collapse-btn {
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.06);
  border: none;
  color: rgba(255,255,255,0.6);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.sidebar-slider {
  padding: 10px 14px;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.settings-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  font-size: 16px;
}

.slider-label {
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  white-space: nowrap;
  line-height: 1.3;
}

.slider-label small { font-size: 10px; }

.time-slider {
  flex: 1;
  accent-color: #3dc45a;
  cursor: pointer;
}

.sidebar-search {
  padding: 10px 14px;
  gap: 8px;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.sidebar-search svg { width: 16px; height: 16px; color: rgba(255,255,255,0.4); flex-shrink: 0; }

.sidebar-search input {
  background: none;
  border: none;
  color: #fff;
  font-size: 13px;
  width: 100%;
  outline: none;
}

.sidebar-search input::placeholder { color: rgba(255,255,255,0.35); }

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  color: rgba(255,255,255,0.7);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.sidebar-item:hover { background: rgba(255,255,255,0.05); }
.sidebar-item-icon { font-size: 16px; }

.sidebar-section-label {
  padding: 8px 16px 4px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sport-tree-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.sport-tree-header:hover,
.sport-tree-header.active { background: rgba(61,196,90,0.1); }

.sport-tree-icon { width: 20px; height: 20px; flex-shrink: 0; }
.sport-tree-icon svg { width: 100%; height: 100%; }

.sport-tree-name {
  flex: 1;
  font-size: 13.5px;
  font-weight: 600;
  color: #fff;
}

.chevron {
  width: 16px; height: 16px;
  color: rgba(255,255,255,0.4);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.chevron.open { transform: rotate(180deg); }

.country-list { background: rgba(0,0,0,0.15); }

.country-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px 9px 26px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.country-header:hover,
.country-header.active { background: rgba(255,255,255,0.05); }

.country-flag { font-size: 16px; }
.country-name { flex: 1; font-size: 13px; color: rgba(255,255,255,0.8); }

.league-list { background: rgba(0,0,0,0.1); }

.league-item {
  padding: 8px 16px 8px 44px;
  font-size: 12.5px;
  color: rgba(255,255,255,0.65);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.league-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
.league-item.active { color: #3dc45a; background: rgba(61,196,90,0.08); }

/* ── Events panel ──────────────────────────────────── */
.events-panel {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

/* ── Popular events (mobile) ───────────────────────── */
.popular-events {
  flex-direction: column;
  background: #1a3622;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.07);
}

.popular-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}

.popular-title { font-size: 15px; font-weight: 700; }

.event-tabbar {
  display: flex;
  align-items: center;
  width: 100%;
}

.event-scroll {
  display: flex;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}

.event-scroll::-webkit-scrollbar { display: none; }


.popular-card {
  background: var(--color2);
  margin: 0 10px 10px;
  border-radius: 10px;
  padding: 14px;
  white-space: nowrap;
  min-width: 280px;
  flex-shrink: 0;
}

.popular-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.live-badge {
  background: #e03030;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.popular-league {
  flex: 1;
  font-size: 12px;
  color: rgba(255,255,255,0.65);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.star-icon { width: 18px; height: 18px; color: rgba(255,255,255,0.4); flex-shrink: 0; }

.popular-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 8px;
}

.popular-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
}

.team-logo-circle {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 900;
}


.popular-score {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #fff;
}

.popular-odds {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.odd-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s;
}

.odd-btn--1 { background: var(--color1); color: #fff; }
.odd-btn--x { background: var(--color1); color: #fff; }
.odd-btn--2 { background: var(--color1); color: #fff; }

.odd-label { font-size: 11px; opacity: 0.7; }
.odd-val   { font-size: 16px; }

.popular-more {
  text-align: center;
  font-size: 13px;
  color: rgba(255,255,255,0.5);
}

/* ── League group ──────────────────────────────────── */
.league-group {
  background: #112a18;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.07);
}

.league-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #163320;
  cursor: pointer;
  user-select: none;
}

.chevron-sm {
  width: 16px; height: 16px;
  color: rgba(255,255,255,0.5);
  transition: transform 0.2s;
  flex-shrink: 0;
}
.chevron-sm.open { transform: rotate(0deg); }
.chevron-sm:not(.open) { transform: rotate(-90deg); }

.league-group-flag { font-size: 16px; }
.league-group-name { flex: 1; font-size: 13.5px; font-weight: 700; }
.group-arrow-up { width: 16px; height: 16px; color: rgba(255,255,255,0.4); }

.odds-header {
  padding: 6px 16px 4px;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  gap: 0;
  justify-content: flex-end;
  gap: 8px;
}

.odds-header span:first-child { flex: 1; }
.odds-header span { min-width: 52px; text-align: center; }

/* ── Event row ─────────────────────────────────────── */
.event-row {
  padding: 10px 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.event-time {
  font-size: 11.5px;
  color: rgba(255,255,255,0.5);
}

.calendar-icon {
  width: 14px; height: 14px;
  color: rgba(255,255,255,0.35);
}

.event-teams-odds {
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-teams {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.team-logo-sm {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.team-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.9);
}

.event-more {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  white-space: nowrap;
  min-width: 38px;
  text-align: center;
}

.event-odds {
  display: flex;
  gap: 5px;
}

.odd-pill {
  min-width: 52px;
  padding: 8px 6px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  text-align: center;
}

.odd-pill:hover { background: rgba(61,196,90,0.2); border-color: rgba(61,196,90,0.4); }
.odd-pill.selected {
  background: #3dc45a;
  border-color: #3dc45a;
  color: #fff;
}

.star-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.star-btn:hover { color: #c9a227; }
.star-btn svg { width: 16px; height: 16px; }

.no-events {
  text-align: center;
  padding: 48px 16px;
  color: rgba(255,255,255,0.35);
  font-size: 14px;
}

/* ── Betslip (desktop) ─────────────────────────────── */
.betslip-panel {
  width: 280px;
  flex-shrink: 0;
  background: #0d2416;
  border-left: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.betslip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  font-size: 15px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.betslip-header svg { width: 18px; height: 18px; color: rgba(255,255,255,0.5); }

.betslip-tabs {
  display: flex;
  padding: 10px 12px;
  gap: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.bs-tab {
  flex: 1;
  padding: 7px 0;
  background: rgba(255,255,255,0.06);
  border: none;
  color: rgba(255,255,255,0.6);
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.bs-tab.active { background: rgba(255,255,255,0.12); color: #fff; }
.bs-tab--express.active { background: #3dc45a; color: #fff; }

.betslip-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.betslip-empty {
  text-align: center;
  padding: 32px 16px;
  color: rgba(255,255,255,0.3);
  font-size: 13px;
}

.betslip-item {
  background: #163320;
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.bet-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bet-league { font-size: 11px; color: rgba(255,255,255,0.5); }

.bet-remove {
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  font-size: 13px;
  padding: 2px 4px;
  transition: color 0.2s;
}

.bet-remove:hover { color: #ff5555; }

.bet-teams {
  font-size: 12.5px;
  color: rgba(255,255,255,0.85);
  line-height: 1.5;
}

.bet-outcome-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bet-outcome { font-size: 12px; color: rgba(255,255,255,0.55); }

.bet-odd-val {
  background: rgba(255,255,255,0.1);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.bet-winner-label {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}

.betslip-footer {
  padding: 14px 12px;
  border-top: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.total-coeff {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
}

.coeff-val {
  font-size: 16px;
  font-weight: 800;
  color: #3dc45a;
}

.bet-amount-row { display: flex; }

.bet-amount-input {
  width: 100%;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 14px;
}

.place-bet-btn {
  width: 100%;
  background: linear-gradient(135deg, #3dc45a, #2aa646);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  padding: 11px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.place-bet-btn:hover { opacity: 0.9; }

/* ── Mobile betslip FAB ────────────────────────────── */
.mob-betslip-fab {
  position: fixed;
  bottom: 80px;
  right: 16px;
  z-index: 300;
  width: 52px; height: 52px;
  border-radius: 50%;
  background: #3dc45a;
  border: none;
  color: #fff;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 18px rgba(61,196,90,0.4);
}

@media (max-width: 1024px) {
  .mob-betslip-fab { display: flex; }
}

.mob-betslip-fab svg { width: 24px; height: 24px; }

.fab-badge {
  position: absolute;
  top: -4px; right: -4px;
  background: #e03030;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  width: 18px; height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Mobile betslip drawer ─────────────────────────── */
.mob-betslip-drawer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 400;
  background: #0d2416;
  border-radius: 20px 20px 0 0;
  border-top: 1px solid rgba(255,255,255,0.1);
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
}

.mob-betslip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 10px;
  font-size: 15px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}

.mob-betslip-header button {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 18px;
  cursor: pointer;
}

/* Slide-up transition */
.slide-up-enter-active,
.slide-up-leave-active { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
.slide-up-enter-from,
.slide-up-leave-to    { transform: translateY(100%); }
</style>