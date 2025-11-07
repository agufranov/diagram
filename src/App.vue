<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import Diagram from './Diagram.vue'

const name = ref()
watchEffect(() => console.log('name updated', name.value))
</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
  <Diagram v-model:name="name" />
</template>

<style scoped></style>
