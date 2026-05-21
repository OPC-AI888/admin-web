<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">403</div>
      <div class="error-title">无权访问</div>
      <div class="error-desc">抱歉，您没有权限访问该页面</div>
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
  color: #1890ff;
  line-height: 1;
  margin-bottom: 16px;
  opacity: 0.3;
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
