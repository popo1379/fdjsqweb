<template>
  <div id="app">
    <div class="app-container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
.app-container {
  width: 100%;
  min-height: 100vh;
  max-width: 768px;
  margin: 0 auto;
  background-color: $bg-color;
}

@media (min-width: 769px) {
  .app-container {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  }
}
</style>
