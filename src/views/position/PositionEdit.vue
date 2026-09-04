<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePositionStore } from '@/stores/data'
import { useMessage } from 'naive-ui'

const router = useRouter()
const route = useRoute()
const positionStore = usePositionStore()
const message = useMessage()

const isEdit = computed(() => !!route.params.id)
const editing = computed(() => isEdit.value ? positionStore.getById(route.params.id) : null)

const form = reactive({
  title: editing.value?.title || '',
  department: editing.value?.department || '',
  jdText: editing.value?.jdText || '',
  skillTags: editing.value?.skillTags || [],
  difficulty: editing.value?.difficulty || '中级',
  headcount: editing.value?.headcount || 1,
  status: 'open'
})

const tagInput = ref('')
const skillInput = ref('')
const parsing = ref(false)

function addTag() {
  if (skillInput.value && !form.skillTags.includes(skillInput.value)) {
    form.skillTags.push(skillInput.value)
    skillInput.value = ''
  }
}

function aiParse() {
  if (!form.jdText.trim()) {
    message.warning('请先填写 JD 原文')
    return
  }
  parsing.value = true
  setTimeout(() => {
    // 模拟 AI 抽取技能点
    const extracted = ['Vue3', 'TypeScript', 'Vite', 'Pinia', '性能优化', '工程化']
    extracted.forEach(s => { if (!form.skillTags.includes(s)) form.skillTags.push(s) })
    parsing.value = false
    message.success('AI 已抽取 6 个技能点')
  }, 1200)
}

function submit() {
  if (!form.title || !form.jdText) {
    message.warning('请填写岗位名称与 JD 原文')
    return
  }
  if (isEdit.value) {
    positionStore.update(route.params.id, form)
    message.success('岗位已更新')
  } else {
    positionStore.create(form)
    message.success('岗位已创建')
  }
  router.push('/position')
}
</script>

<template>
  <div class="page-container">
    <div class="flex-between mb-16">
      <div>
        <h2 class="page-title">{{ isEdit ? '编辑岗位' : '创建岗位' }}</h2>
        <p class="page-desc">填写岗位 JD，AI 自动结构化抽取技能点作为出题依据</p>
      </div>
      <n-button @click="router.back()">返回</n-button>
    </div>

    <n-card :bordered="false" style="max-width: 860px">
      <n-form label-placement="top" :show-require-mark="true">
        <n-grid :cols="2" :x-gap="20">
          <n-form-item-grid-item label="岗位名称" required>
            <n-input v-model:value="form.title" placeholder="如：高级前端工程师" />
          </n-form-item-grid-item>
          <n-form-item-grid-item label="所属部门">
            <n-input v-model:value="form.department" placeholder="如：技术部 / 前端组" />
          </n-form-item-grid-item>
          <n-form-item-grid-item label="难度等级">
            <n-select v-model:value="form.difficulty" :options="[
              { label: '初级', value: '初级' },
              { label: '中级', value: '中级' },
              { label: '高级', value: '高级' },
              { label: '专家', value: '专家' }
            ]" />
          </n-form-item-grid-item>
          <n-form-item-grid-item label="招聘人数">
            <n-input-number v-model:value="form.headcount" :min="1" :max="50" style="width: 100%" />
          </n-form-item-grid-item>
        </n-grid>

        <n-form-item label="JD 原文" required>
          <n-input v-model:value="form.jdText" type="textarea" :autosize="{ minRows: 5, maxRows: 12 }" placeholder="粘贴岗位 JD 原文，AI 将自动抽取关键技能点..." />
        </n-form-item>

        <n-form-item label="技能标签">
          <div style="width: 100%">
            <n-space :size="8" wrap style="margin-bottom: 8px">
              <n-tag v-for="tag in form.skillTags" :key="tag" closable type="info" :bordered="false" @close="form.skillTags = form.skillTags.filter(t => t !== tag)">
                {{ tag }}
              </n-tag>
            </n-space>
            <n-input v-model:value="skillInput" placeholder="输入技能回车添加，或点击右侧 AI 解析" @keyup.enter="addTag">
              <template #suffix>
                <n-button text type="primary" :loading="parsing" @click="aiParse">⚡ AI 解析技能</n-button>
              </template>
            </n-input>
          </div>
        </n-form-item>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px">
          <n-button @click="router.back()">取消</n-button>
          <n-button type="primary" @click="submit">{{ isEdit ? '保存修改' : '创建岗位' }}</n-button>
        </div>
      </n-form>
    </n-card>
  </div>
</template>
