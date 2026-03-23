<script setup lang="ts">
import { ref } from 'vue'
import { SPENDING_PRESETS, type SpendingPreset } from '@/core/spendingPresets'

const props = defineProps<{ modelValue: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

function matchPreset(value: number): SpendingPreset {
  const match = SPENDING_PRESETS.find((p) => p.value === value)
  return match ? match.key : 'custom'
}

const selectedPreset = ref<SpendingPreset>(matchPreset(props.modelValue))

function onPresetChange(key: SpendingPreset) {
  selectedPreset.value = key
  const preset = SPENDING_PRESETS.find((p) => p.key === key)
  if (preset && preset.value !== null) {
    emit('update:modelValue', preset.value)
  }
}

function onInputChange(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  selectedPreset.value = 'custom'
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="spending-preset">
    <select
      :value="selectedPreset"
      class="form-input spending-preset__select"
      aria-label="Spending level preset"
      @change="onPresetChange(($event.target as HTMLSelectElement).value as SpendingPreset)"
    >
      <option
        v-for="preset in SPENDING_PRESETS"
        :key="preset.key"
        :value="preset.key"
      >
        {{ preset.label }}
      </option>
    </select>
    <div class="form-input-prefix">
      <span class="form-input-prefix__symbol">£</span>
      <input
        id="expenses"
        :value="modelValue"
        type="number"
        min="0"
        step="1000"
        class="form-input"
        @change="onInputChange"
      >
    </div>
  </div>
</template>

<style scoped>
.spending-preset {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.form-input {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.95rem;
  color: #1a1a2e;
  background: #fafafa;
  transition: border-color 0.15s;
  width: 140px;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  background: #fff;
}

.spending-preset__select {
  width: 190px;
}

.form-input-prefix {
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-input-prefix__symbol {
  font-size: 0.9rem;
  color: #9ca3af;
  user-select: none;
}
</style>
