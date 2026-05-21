<template>
  <div class="plan-edit-page">
    <div v-if="pageLoading" class="loading-wrap">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else>
      <!-- 返回 -->
      <div class="detail-toolbar">
        <el-button :icon="ArrowLeft" @click="router.back()">返回</el-button>
        <div class="toolbar-title">
          编辑套餐：
          <el-tag :type="PlanTypeMap[form.plan_type as PlanType]?.type">
            {{ PlanTypeMap[form.plan_type as PlanType]?.label || form.plan_type }}
          </el-tag>
        </div>
      </div>

      <!-- 表单 -->
      <div class="admin-card">
        <el-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-width="120px"
          style="max-width: 700px"
        >
          <el-form-item label="套餐名称" prop="name">
            <el-input v-model="form.name" placeholder="如：月卡会员" />
          </el-form-item>

          <el-form-item label="价格（元）" prop="price">
            <el-input-number
              v-model="form.price"
              :min="0"
              :precision="2"
              :disabled="form.plan_type === PlanType.FREE"
              style="width: 200px"
            />
            <span v-if="form.plan_type === PlanType.FREE" class="field-hint">
              免费套餐价格固定为 ¥0.00
            </span>
          </el-form-item>

          <el-form-item label="每日拨打上限" prop="daily_dial_limit">
            <el-input-number v-model="form.daily_dial_limit" :min="-1" style="width: 200px" />
            <span class="field-hint">-1 表示无限制</span>
          </el-form-item>

          <el-form-item label="客户数上限" prop="customer_limit">
            <el-input-number v-model="form.customer_limit" :min="-1" style="width: 200px" />
            <span class="field-hint">-1 表示无限制</span>
          </el-form-item>

          <el-form-item label="同步模式" prop="sync_mode">
            <el-select
              v-model="form.sync_mode"
              style="width: 220px"
              :disabled="form.plan_type === PlanType.FREE"
              @change="handleSyncModeChange"
            >
              <el-option
                v-for="(v, k) in SyncModeMap"
                :key="k"
                :label="v.label"
                :value="k"
              />
            </el-select>
            <el-tooltip
              effect="dark"
              placement="right"
              style="margin-left: 8px"
            >
              <template #content>
                <div style="max-width: 280px; line-height: 1.6">
                  <div v-for="(v, k) in SyncModeMap" :key="k" style="margin-bottom: 6px">
                    <strong>{{ v.label }}：</strong>{{ v.desc }}
                  </div>
                </div>
              </template>
              <el-icon class="tooltip-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </el-form-item>

          <el-form-item label="数据导出">
            <el-switch
              v-model="form.data_export"
              :disabled="form.sync_mode === SyncMode.NONE"
            />
            <span v-if="form.sync_mode === SyncMode.NONE" class="field-hint">
              同步模式为"不支持同步"时不可开启
            </span>
          </el-form-item>

          <el-form-item label="体验天数" prop="trial_days">
            <el-input-number
              v-model="form.trial_days"
              :min="0"
              :max="365"
              style="width: 200px"
              :disabled="form.plan_type !== PlanType.FREE"
            />
            <span v-if="form.plan_type !== PlanType.FREE" class="field-hint">
              体验天数仅免费套餐可配置
            </span>
          </el-form-item>

          <el-form-item label="上架状态">
            <el-switch v-model="form.enabled" active-text="已上架" inactive-text="已下架" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">保存修改</el-button>
            <el-button @click="router.back()">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft, QuestionFilled } from '@element-plus/icons-vue'
import { planApi } from '@/api/plan'
import type { PlanItem } from '@/api/plan'
import { PlanType, PlanTypeMap, SyncMode, SyncModeMap } from '@/constants/enums'

const route = useRoute()
const router = useRouter()

const planId = Number(route.params.id)
const pageLoading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  plan_type: '',
  name: '',
  price: 0,
  daily_dial_limit: -1,
  customer_limit: -1,
  sync_mode: SyncMode.NONE,
  data_export: false,
  trial_days: 0,
  enabled: true,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  sync_mode: [{ required: true, message: '请选择同步模式', trigger: 'change' }],
}

// 字段联动：plan_type = FREE
watch(() => form.plan_type, (type) => {
  if (type === PlanType.FREE) {
    form.price = 0
    form.sync_mode = SyncMode.NONE
    form.data_export = false
  }
})

// 字段联动：sync_mode = NONE
function handleSyncModeChange(mode: string) {
  if (mode === SyncMode.NONE) {
    form.data_export = false
  }
}

async function loadDetail() {
  pageLoading.value = true
  try {
    const detail: PlanItem = await planApi.getDetail(planId)
    Object.assign(form, detail)
  } finally {
    pageLoading.value = false
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  // 保存前预览确认
  try {
    await ElMessageBox.confirm(
      `<div>
        <p>即将修改套餐 <strong>${form.name}</strong>：</p>
        <ul style="margin: 8px 0; padding-left: 20px; line-height: 2">
          <li>价格：¥${form.price.toFixed(2)}</li>
          <li>每日拨打上限：${form.daily_dial_limit === -1 ? '无限制' : form.daily_dial_limit}</li>
          <li>客户数上限：${form.customer_limit === -1 ? '无限制' : form.customer_limit}</li>
        </ul>
        <p style="color: #fa8c16; font-weight: 600">⚠️ 此修改将立即影响新购买用户权益</p>
      </div>`,
      '保存确认',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确认保存',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    return
  }

  submitting.value = true
  try {
    await planApi.update(planId, {
      name: form.name,
      price: form.price,
      daily_dial_limit: form.daily_dial_limit,
      customer_limit: form.customer_limit,
      sync_mode: form.sync_mode,
      data_export: form.data_export,
      trial_days: form.trial_days,
      enabled: form.enabled,
    })
    ElMessage.success('套餐保存成功')
    router.back()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style lang="scss" scoped>
.plan-edit-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-wrap {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.detail-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .toolbar-title {
    font-size: 15px;
    font-weight: 600;
    color: #262626;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.field-hint {
  margin-left: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.tooltip-icon {
  font-size: 16px;
  color: #8c8c8c;
  cursor: help;
  vertical-align: middle;

  &:hover {
    color: #1890ff;
  }
}
</style>
