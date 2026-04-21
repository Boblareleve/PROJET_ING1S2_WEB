<template>
  <button @click="handleRun('report')">Afficher rapport</button>
</template>

<script setup>
const emit = defineEmits(['showPage'])

function handleRun(pageName) {
  emit('showPage', pageName)
}
</script>