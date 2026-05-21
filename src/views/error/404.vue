<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-title">页面不存在</div>
      <div class="error-desc">您访问的页面不存在，请确认地址是否正确</div>
      <div class="error-actions">
        <el-button type="primary" @click="router.push('/dashboard')">返回首页</el-button>
        <el-button @click="router.back()">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  background: #f5f6fa;
}
.error-content {
  text-align: center;
  padding: 40px;
}
.error-code {
  font-size: 100px;
  font-weight: 800;
  color: #faad14;
  line-height: 1;
  margin-bottom: 16px;
  opacity: 0.4;
}
.error-title {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 8px;
}
.error-desc {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 32px;
}
.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
