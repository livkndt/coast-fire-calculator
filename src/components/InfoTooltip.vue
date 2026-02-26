<template>
  <span class="tip">
    <button
      type="button"
      class="tip__trigger"
      :aria-describedby="id"
      aria-label="More information"
    >
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <circle cx="7" cy="7" r="6.5" stroke="currentColor" stroke-width="1" fill="none"/>
        <text x="7" y="11" text-anchor="middle" font-size="9" font-weight="bold" font-family="sans-serif">i</text>
      </svg>
    </button>
    <span :id="id" role="tooltip" class="tip__bubble">{{ text }}</span>
  </span>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'

defineProps<{ text: string }>()

// Stable, unique id per component instance — no random, safe for tests
const uid = getCurrentInstance()?.uid ?? 0
const id = `tip-${uid}`
</script>

<style scoped>
.tip {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  vertical-align: middle;
}

.tip__trigger {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #d1d5db;
  line-height: 1;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.tip__trigger:hover,
.tip:focus-within .tip__trigger {
  color: #4f46e5;
}

.tip__bubble {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a2e;
  color: #f9fafb;
  font-size: 0.78rem;
  line-height: 1.5;
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  width: 240px;
  text-align: left;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 200;
  font-weight: 400;
  /* Arrow */
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.tip__bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1a1a2e;
}

.tip:hover .tip__bubble,
.tip:focus-within .tip__bubble {
  opacity: 1;
}
</style>
