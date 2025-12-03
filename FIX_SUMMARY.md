# 后端API移除 - 修复记录

## 🔧 问题诊断

### 原始问题
打开主页会重定向到apps然后到install界面，并出现fetch错误：
```
TypeError: Failed to fetch
service/fetch.ts (202:25) @ Object.fetch
```

### 根本原因
应用在初始化时调用了多个后端API：
1. `getSystemFeatures` - 系统特性配置
2. `fetchUserProfile` - 用户信息
3. `fetchCurrentWorkspace` - 当前工作空间
4. `fetchLangGeniusVersion` - 版本信息
5. `fetchWorkflowDraft` - Workflow草稿
6. `useWorkflowConfig` - Workflow配置（文件上传等）
7. `useAppTriggers` - 应用触发器
8. `useAllToolProviders` - 工具提供商
9. 等等...

---

## ✅ 修复方案

### 1. 修复初始化API调用

#### `service/common.ts`

**getSystemFeatures (已修复)**
```typescript
export const getSystemFeatures = () => {
  // Mock implementation - return default features without backend call
  const { defaultSystemFeatures } = require('@/types/feature')
  return Promise.resolve(defaultSystemFeatures)
}
```

**fetchUserProfile (已修复)**
```typescript
export const fetchUserProfile = ({ url, params }) => {
  console.warn('[Mock] User profile disabled in standalone mode')
  return Promise.resolve(new Response(JSON.stringify({
    id: 'standalone-user',
    name: 'Standalone User',
    email: 'user@localhost',
    avatar: '',
    avatar_url: '',
    is_password_set: false,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'x-version': '1.0.0',
      'x-env': 'STANDALONE',
    },
  })) as any
}
```

**fetchCurrentWorkspace (已修复)**
```typescript
export const fetchCurrentWorkspace = ({ url, params }) => {
  console.warn('[Mock] Current workspace disabled in standalone mode')
  return Promise.resolve({
    id: 'standalone-workspace',
    name: 'Local Workspace',
    plan: 'standalone',
    status: 'normal',
    created_at: Date.now(),
    role: 'owner',
    providers: [],
  })
}
```

**fetchLangGeniusVersion (已修复)**
```typescript
export const fetchLangGeniusVersion = ({ url, params }) => {
  console.warn('[Mock] LangGenius version disabled in standalone mode')
  return Promise.resolve({
    current_env: 'STANDALONE',
    current_version: '1.0.0-standalone',
    latest_version: '1.0.0-standalone',
    release_date: new Date().toISOString(),
    release_notes: 'Standalone workflow editor',
    version: '1.0.0',
    can_auto_update: false,
  })
}
```

### 2. 修复Workflow相关API

#### `service/use-workflow.ts`

**useWorkflowConfig (已修复)**
```typescript
export const useWorkflowConfig = (url, onSuccess) => {
  return useQuery({
    enabled: false, // Disabled - no backend API calls in standalone mode
    queryKey: [NAME_SPACE, 'config', url],
    staleTime: 0,
    queryFn: async () => {
      console.warn('[Mock] Workflow config query is disabled in standalone mode')
      // Return mock file upload config for '/files/upload'
      if (url === '/files/upload') {
        const mockConfig = {
          file_size_limit: 15,
          batch_count_limit: 5,
          image_file_size_limit: 10,
          video_file_size_limit: 100,
          audio_file_size_limit: 50,
        }
        onSuccess(mockConfig)
        return mockConfig
      }
      const data = await MockService.fetchWorkflowDraft()
      onSuccess(data)
      return data
    },
  })
}
```

### 3. 修复工具相关API

#### `service/use-tools.ts`

**useAllToolProviders (已修复)**
```typescript
export const useAllToolProviders = (enabled = true) => {
  return useQuery<Collection[]>({
    queryKey: useAllToolProvidersKey,
    queryFn: () => {
      console.warn('[Mock] Tool providers disabled in standalone mode')
      return Promise.resolve([])
    },
    enabled: false, // Disabled in standalone mode
  })
}
```

**useAllBuiltInTools (已修复)**
```typescript
export const useAllBuiltInTools = () => {
  return useQuery<ToolWithProvider[]>({
    queryKey: useAllBuiltInToolsKey,
    queryFn: () => {
      console.warn('[Mock] Built-in tools disabled in standalone mode')
      return Promise.resolve([])
    },
    enabled: false, // Disabled in standalone mode
  })
}
```

**useAllCustomTools (已修复)**
```typescript
export const useAllCustomTools = () => {
  return useQuery<ToolWithProvider[]>({
    queryKey: useAllCustomToolsKey,
    queryFn: () => {
      console.warn('[Mock] Custom tools disabled in standalone mode')
      return Promise.resolve([])
    },
    enabled: false, // Disabled in standalone mode
  })
}
```

**useAppTriggers (已修复)**
```typescript
export const useAppTriggers = (appId, options?) => {
  return useQuery<{ data: AppTrigger[] }>({
    queryKey: [NAME_SPACE, 'app-triggers', appId],
    queryFn: () => {
      console.warn('[Mock] App triggers disabled in standalone mode')
      return Promise.resolve({ data: [] })
    },
    enabled: false, // Disabled in standalone mode
    ...options,
  })
}
```

### 4. 修复路由

#### `app/page.tsx`
```typescript
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '@/app/components/base/loading'

const Home = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to standalone workflow editor
    router.replace('/workflow-editor')
  }, [router])

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Loading type='area' />
        <div className="mt-4 text-center text-text-secondary">
          Loading Workflow Editor...
        </div>
      </div>
    </div>
  )
}

export default Home
```

#### `app/workflow-editor/page.tsx` (新建)
```typescript
'use client'
import { useEffect } from 'react'
import { useStore as useAppStore } from '@/app/components/app/store'
import WorkflowApp from '@/app/components/workflow-app'
import Loading from '@/app/components/base/loading'
import { AppModeEnum } from '@/types/app'

const WorkflowEditorPage = () => {
  const setAppDetail = useAppStore(s => s.setAppDetail)
  const appDetail = useAppStore(s => s.appDetail)

  useEffect(() => {
    // Initialize a standalone app detail for standalone workflow editor
    setAppDetail({
      id: 'standalone-workflow',
      name: 'Standalone Workflow Editor',
      description: 'A standalone workflow editor without backend',
      mode: AppModeEnum.WORKFLOW,
      // ... other required fields with default values
    })
  }, [setAppDetail])

  if (!appDetail) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className='h-screen w-screen overflow-hidden'>
      <WorkflowApp />
    </div>
  )
}

export default WorkflowEditorPage
```

---

## 📋 修改文件列表

| 文件 | 修改内容 |
|------|---------|
| `service/common.ts` | Mock 5个API: getSystemFeatures, fetchUserProfile, fetchCurrentWorkspace, fetchLangGeniusVersion |
| `service/use-workflow.ts` | 禁用 useWorkflowConfig 并返回mock数据 |
| `service/use-tools.ts` | 禁用 4个工具相关hooks: useAllToolProviders, useAllBuiltInTools, useAllCustomTools, useAppTriggers |
| `app/page.tsx` | 改为重定向到 /workflow-editor |
| `app/workflow-editor/page.tsx` | 新建独立编辑器页面 |

---

## 🚀 测试步骤

1. **清除浏览器缓存**
   - Chrome: Ctrl+Shift+Delete / Cmd+Shift+Delete
   - 或者使用无痕模式

2. **启动应用**
   ```bash
   pnpm dev
   ```

3. **访问主页**
   - 打开 http://localhost:3000
   - 应该自动重定向到 /workflow-editor
   - 不应该有任何fetch错误

4. **检查控制台**
   - 应该看到一些 `[Mock]` 警告信息（这是正常的）
   - 不应该有红色的错误

5. **测试功能**
   - 能否看到空白的workflow画布
   - 能否从左侧添加节点
   - 能否连接节点
   - 能否保存（虽然只保存在内存中）

---

## ⚠️ 如果还有问题

### 检查步骤

1. **查看Network标签**
   - 打开浏览器开发者工具
   - 切换到Network标签
   - 刷新页面
   - 找到失败的请求（红色）
   - 复制URL

2. **查看Console标签**
   - 查找错误信息
   - 记录错误堆栈

3. **告诉我**
   - 失败的API URL
   - 完整的错误信息
   - 错误发生的时机（页面加载？点击按钮？）

### 可能需要的额外修复

如果还有其他API调用，按照以下模式修复：

```typescript
// 在对应的service文件中
export const someApiFunction = (params) => {
  console.warn('[Mock] Some API disabled in standalone mode')
  return Promise.resolve({
    // mock data structure
  })
}

// 或者对于React Query hooks
export const useSomeQuery = () => {
  return useQuery({
    enabled: false, // 禁用查询
    queryFn: () => {
      console.warn('[Mock] Query disabled')
      return Promise.resolve([]) // 返回空数据
    },
  })
}
```

---

## 🎉 预期结果

修复后应该能够：
- ✅ 访问 http://localhost:3000 自动跳转到 /workflow-editor
- ✅ 看到workflow编辑器界面
- ✅ 没有fetch错误
- ✅ 可以添加和编辑节点
- ✅ 所有功能在浏览器本地运行

**注意**: 控制台会显示 `[Mock]` 警告，这是正常的，表示API调用被mock了。
