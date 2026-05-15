<template>
  <button class="odd-btn" v-for="o in outcomes">
    <span class="odd-label" v-if = 'o.label'>{{ o.label }}</span>
    <span class="odd-value">{{ o.odds }}</span>
  </button>
</template>

<script setup>
 const props = defineProps({
  outcomes: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.odd-btn {
  border: none;
  outline: none;
  background: #d4d9dd;
  border-radius: 12px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: row; /* changed */
  align-items: center;
  justify-content: space-between; /* key change */
  min-height: 52px;
  width: 100%;
}

.odd-btn:hover {
  background: rgb(168, 168, 40);
  transform: translateY(-2px);
}

.odd-btn:hover .odd-label,
.odd-btn:hover .odd-value {
  color: white;
}

.odd-label {
  font-size: 13px;
  font-weight: 600;
  color: rgb(80, 77, 77);
  margin-bottom: 0; /* remove vertical spacing */
}

.odd-value {
  font-size: 14px;
  font-weight: 800;
  color: #111;
}

@media (max-width: 480px) {
  .odd-btn {
    padding: 4px 8px;
    min-height: 40px;
    border-radius: 8px;
  }

  .odd-label {
    font-size: 11px;
  }

  .odd-value {
    font-size: 12px;
  }
}
</style>