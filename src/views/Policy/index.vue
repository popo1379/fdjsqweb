<template>
  <div class="page">
    <div class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <span class="title">政策资讯</span>
    </div>
    <div class="content">
      <div class="card">
        <div class="card-title">功能开发中...</div>
        <div class="placeholder">敬请期待</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: $bg-color;
}

.header {
  background: linear-gradient(135deg, $primary-color 0%, #4096ff 100%);
  padding: $spacing-md;
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.back-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: $font-size-lg;
  cursor: pointer;
}

.title {
  color: #fff;
  font-size: $font-size-lg;
  font-weight: 500;
}

.content {
  padding: $spacing-md;
}

.card {
  background-color: $bg-color-white;
  border-radius: $border-radius-md;
  padding: $spacing-md;
  text-align: center;
  box-shadow: $box-shadow;
}

.card-title {
  font-size: $font-size-lg;
  color: $text-color;
  margin-bottom: $spacing-md;
  font-weight: 500;
}

.placeholder {
  color: $text-color-secondary;
  padding: $spacing-xl;
}
</style>
