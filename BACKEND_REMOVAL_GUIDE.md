# Backend API 移除指南

本文档说明了如何将 Workflow Editor 从依赖后端 API 改造为独立的前端编辑器。

## 📋 变更概览

### 已完成的更改

1. **创建 Mock 服务层** (`service/mock-workflow.ts`)
   - 所有 workflow 数据现在存储在内存中
   - 提供与后端 API 相同的接口
   - 数据在浏览器刷新后会丢失（符合需求）

2. **更新 Workflow 服务** (`service/workflow.ts`)
   - 所有 API 调用替换为 Mock 服务调用
   - 节点执行功能已禁用
   - 运行历史功能已禁用

3. **更新 React Query Hooks** (`service/use-workflow.ts`)
   - 所有 hooks 使用本地 Mock 服务
   - 版本历史功能保留（本地存储）
   - 变量检查器功能保留（本地存储）
   - 节点执行相关的 hooks 已禁用

4. **修复路由和初始化**
   - Mock `getSystemFeatures` API (`service/common.ts`)
   - 更新主页重定向到独立编辑器 (`app/page.tsx`)
   - 创建独立 workflow 编辑器页面 (`app/workflow-editor/page.tsx`)

---

## 🔧 架构变更

### 之前的架构

```
用户界面
  ↓
React Query / SWR
  ↓
service/workflow.ts (API calls)
  ↓
后端 API (5001/console/api)
  ↓
数据库
```

### 现在的架构

```
用户界面
  ↓
React Query / SWR
  ↓
service/workflow.ts (Mock wrapper)
  ↓
service/mock-workflow.ts (内存存储)
  ↓
浏览器内存 (刷新后丢失)
```

---

## 📦 保留的功能

### ✅ Workflow 编辑功能（完整保留）

- ✅ 拖拽添加节点
- ✅ 连接节点
- ✅ 配置节点参数
- ✅ 删除/复制节点
- ✅ 画布缩放、平移
- ✅ 撤销/重做 (Undo/Redo)
- ✅ 导入/导出 Workflow JSON
- ✅ 节点数据流分析
- ✅ 变量引用检查

### ✅ 保留的面板功能

1. **Variable Inspector（变量检查器）**
   - 查看所有变量
   - 编辑变量值
   - 删除变量
   - 重置变量

2. **Version History（版本历史）**
   - 发布新版本
   - 查看历史版本
   - 恢复到历史版本
   - 为版本添加标记和备注

3. **Environment Variables（环境变量）**
   - 添加/编辑环境变量
   - 在节点中引用环境变量

---

## 🚫 已移除的功能

### ❌ 节点执行功能

- ❌ 单节点测试运行
- ❌ Workflow 完整执行
- ❌ 流式输出显示
- ❌ 节点执行结果查看
- ❌ 执行历史记录

### ❌ 后端依赖功能

- ❌ 用户登录/认证
- ❌ 工作空间管理
- ❌ 应用管理 (App CRUD)
- ❌ 数据集集成
- ❌ 工具 Provider 管理
- ❌ 插件系统
- ❌ 公开分享/发布

---

## 📝 API 对应关系

### Workflow 核心 API

| 原始 API | Mock 实现 | 状态 |
|---------|----------|------|
| `GET /apps/{id}/workflows/draft` | `MockService.fetchWorkflowDraft()` | ✅ 已替换 |
| `POST /apps/{id}/workflows/draft` | `MockService.syncWorkflowDraft()` | ✅ 已替换 |
| `GET /apps/{id}/workflows/publish` | `MockService.fetchPublishedWorkflow()` | ✅ 已替换 |
| `POST /apps/{id}/workflows/publish` | `MockService.publishWorkflow()` | ✅ 已替换 |
| `GET /apps/{id}/workflows/versions` | `MockService.fetchWorkflowVersionHistory()` | ✅ 已替换 |
| `PATCH /workflows/versions/{id}` | `MockService.updateWorkflowVersion()` | ✅ 已替换 |
| `DELETE /workflows/versions/{id}` | `MockService.deleteWorkflowVersion()` | ✅ 已替换 |

### 节点配置 API

| 原始 API | Mock 实现 | 状态 |
|---------|----------|------|
| `GET /workflows/default-workflow-block-configs/{type}` | `MockService.fetchNodesDefaultConfigs()` | ✅ 已替换 |

### 变量管理 API

| 原始 API | Mock 实现 | 状态 |
|---------|----------|------|
| `GET /workflows/draft/variables` | `MockService.fetchAllInspectVars()` | ✅ 已替换 |
| `GET /workflows/draft/nodes/{id}/variables` | `MockService.fetchNodeInspectVars()` | ✅ 已替换 |
| `GET /workflows/draft/conversation-variables` | `MockService.fetchConversationVarValues()` | ✅ 已替换 |
| `GET /workflows/draft/system-variables` | `MockService.fetchSysVarValues()` | ✅ 已替换 |
| `PATCH /workflows/draft/variables/{id}` | `MockService.editInspectorVar()` | ✅ 已替换 |
| `DELETE /workflows/draft/variables/{id}` | `MockService.deleteInspectorVar()` | ✅ 已替换 |
| `DELETE /workflows/draft/variables` | `MockService.deleteAllInspectorVars()` | ✅ 已替换 |
| `DELETE /workflows/draft/nodes/{id}/variables` | `MockService.deleteNodeInspectorVars()` | ✅ 已替换 |
| `PUT /workflows/draft/variables/{id}/reset` | `MockService.resetConversationVar()` | ✅ 已替换 |

### 执行相关 API（已禁用）

| 原始 API | 当前行为 | 状态 |
|---------|---------|------|
| `POST /workflows/draft/nodes/{id}/run` | 返回错误 | ❌ 已禁用 |
| `POST /workflows/run` | 返回错误 | ❌ 已禁用 |
| `POST /workflows/tasks/{id}/stop` | 静默忽略 | ❌ 已禁用 |
| `GET /workflows/draft/nodes/{id}/last-run` | 返回空 | ❌ 已禁用 |

---

## 🎯 使用指南

### 初始化 Workflow

当应用启动时，会自动创建一个空的 Workflow：

```typescript
import { initializeWorkflow } from '@/service/mock-workflow'

// 在应用启动时调用
const workflow = initializeWorkflow()
```

### 导入 Workflow

可以从 JSON 导入 workflow：

```typescript
import { loadWorkflowFromJSON } from '@/service/mock-workflow'

const jsonString = '{"graph": {...}, "features": {...}}'
const workflow = await loadWorkflowFromJSON(jsonString)
```

### 导出 Workflow

可以导出 workflow 为 JSON：

```typescript
import { exportWorkflowToJSON } from '@/service/mock-workflow'

const jsonString = exportWorkflowToJSON()
// 可以保存到文件或复制到剪贴板
```

### 重置所有数据

用于清空所有 workflow 数据：

```typescript
import { resetAllData } from '@/service/mock-workflow'

resetAllData() // 清空所有内存数据
```

---

## 🔍 数据存储机制

### 当前实现：内存存储

- **位置**: `service/mock-workflow.ts` 中的模块级变量
- **生命周期**: 页面刷新后丢失
- **容量**: 受浏览器内存限制
- **性能**: 最快，无序列化开销

### 数据结构

```typescript
// 当前 workflow 草稿
let workflowDraft: FetchWorkflowDraftResponse | null = null

// 版本历史
let workflowVersions: Array<FetchWorkflowDraftResponse & {
  id: string
  created_at: number
  marked_name?: string
  marked_comment?: string
}> = []

// 变量存储
let conversationVars: VarInInspect[] = []
let systemVars: VarInInspect[] = []
let allVars: VarInInspect[] = []
```

---

## 🚀 扩展建议

如果未来需要数据持久化，可以考虑以下方案：

### 方案 1: LocalStorage

```typescript
// 保存
localStorage.setItem('workflow-draft', JSON.stringify(workflowDraft))

// 加载
const saved = localStorage.getItem('workflow-draft')
if (saved) workflowDraft = JSON.parse(saved)
```

**优点**: 简单，自动持久化
**缺点**: 5-10MB 容量限制，同步 API

### 方案 2: IndexedDB

```typescript
// 使用 Dexie.js 或类似库
const db = new Dexie('WorkflowDB')
db.version(1).stores({
  workflows: 'id, created_at, updated_at',
  versions: 'id, workflow_id, created_at'
})

// 保存
await db.workflows.put(workflowDraft)

// 查询
const workflow = await db.workflows.get(id)
```

**优点**: 大容量，复杂查询，异步 API
**缺点**: 实现复杂度较高

### 方案 3: 文件系统 API

```typescript
// 使用 File System Access API
const handle = await window.showSaveFilePicker()
const writable = await handle.createWritable()
await writable.write(JSON.stringify(workflowDraft))
await writable.close()
```

**优点**: 无容量限制，用户可见文件
**缺点**: 需要用户授权，浏览器兼容性

---

## 📊 迁移检查清单

- [x] 创建 `service/mock-workflow.ts` Mock 服务层
- [x] 更新 `service/workflow.ts` 使用 Mock 服务
- [x] 更新 `service/use-workflow.ts` React Query hooks
- [x] 更新 `service/common.ts` Mock systemFeatures API
- [x] 创建 `app/workflow-editor/page.tsx` 独立编辑器页面
- [x] 更新 `app/page.tsx` 主页重定向
- [x] 禁用节点执行功能
- [x] 禁用运行历史功能
- [x] 保留 Variable Inspector 面板
- [x] 保留 Version History 面板
- [x] 保留 Environment Variables 面板
- [ ] 测试所有 workflow 编辑功能
- [ ] 测试变量管理功能
- [ ] 测试版本历史功能
- [ ] 测试导入/导出功能

---

## 🚀 快速开始

### 启动应用

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

然后访问 http://localhost:3000，会自动重定向到 `/workflow-editor`

### 无需后端

现在应用不再需要后端服务，所有功能都在浏览器本地运行。

---

## 🔧 文件修改详情

### 新增文件

| 文件路径 | 说明 |
|---------|------|
| `service/mock-workflow.ts` | Mock 服务层，提供所有 workflow API 的本地实现 |
| `app/workflow-editor/page.tsx` | 独立的 workflow 编辑器页面 |
| `BACKEND_REMOVAL_GUIDE.md` | 本文档 |

### 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `service/workflow.ts` | 所有 API 调用替换为 Mock 服务，禁用执行相关功能 |
| `service/use-workflow.ts` | React Query hooks 改用 Mock 服务 |
| `service/common.ts` | Mock `getSystemFeatures` 返回默认配置 |
| `app/page.tsx` | 主页改为重定向到 `/workflow-editor` |

---

## 🐛 已知限制

1. **数据持久化**: 页面刷新后所有数据丢失
2. **节点执行**: 无法测试节点运行结果
3. **实时协作**: 无多人协作功能
4. **外部集成**: 无法与数据集、工具等外部服务集成
5. **身份验证**: 无用户系统

---

## 📞 技术支持

### 修改的文件位置

**新增文件:**
- Mock 服务实现: `service/mock-workflow.ts`
- 独立编辑器页面: `app/workflow-editor/page.tsx`
- 文档: `BACKEND_REMOVAL_GUIDE.md`

**修改文件:**
- Workflow API 封装: `service/workflow.ts`
- React Query Hooks: `service/use-workflow.ts`
- 系统功能API: `service/common.ts`
- 主页路由: `app/page.tsx`

**未修改但重要的文件:**
- Workflow 组件: `app/components/workflow/`
- Workflow Store: `app/components/workflow/store/`

### 常见问题

#### Q1: 为什么打开主页还是跳转到apps或install？

**A**: 这通常是因为以下原因之一：
1. `GlobalPublicStoreProvider` 在尝试调用 `getSystemFeatures` API
   - 已修复：`service/common.ts` 中 Mock 了该 API
2. 主页默认链接到 `/apps`
   - 已修复：`app/page.tsx` 现在重定向到 `/workflow-editor`
3. 浏览器缓存了旧的路由
   - 解决方案：清除浏览器缓存或强制刷新 (Ctrl+Shift+R / Cmd+Shift+R)

#### Q2: 为什么还有 fetch 错误？

**A**: 如果看到 fetch 错误，可能是：
1. 某些组件仍在调用未 Mock 的 API
   - 检查控制台错误信息中的 URL
   - 在相应的 service 文件中添加 Mock 实现
2. 初始化逻辑中的 API 调用
   - 检查 `context/global-public-context.tsx`
   - 检查 `app/components/browser-initializer.tsx`

#### Q3: 如何添加更多 Mock API？

**A**: 在 `service/mock-workflow.ts` 中添加新函数，然后在对应的 service 文件中调用。

示例：
```typescript
// 在 service/mock-workflow.ts 中
export const mockNewFeature = async (): Promise<SomeType> => {
  await new Promise(resolve => setTimeout(resolve, 50))
  return { data: 'mock value' }
}

// 在 service/workflow.ts 中
export const fetchNewFeature = () => {
  return MockService.mockNewFeature()
}
```

### 调试建议

1. **查看 Mock 数据**:
   ```javascript
   // 在浏览器控制台
   import * as MockService from '@/service/mock-workflow'
   console.log(MockService.exportWorkflowToJSON())
   ```

2. **重置数据**:
   ```javascript
   import { resetAllData } from '@/service/mock-workflow'
   resetAllData()
   ```

3. **检查警告**:
   所有被禁用的功能会在控制台输出警告信息：
   ```
   [Mock] Workflow run history is disabled
   [Mock] Single node run is disabled
   ```

---

## 🎉 总结

项目已成功从依赖后端 API 改造为纯前端 Workflow 编辑器：

- ✅ **保留**: 完整的 Workflow 编辑功能
- ✅ **保留**: Variable Inspector、Version History、Environment Variables 面板
- ✅ **移除**: 节点执行、运行历史、后端依赖
- ✅ **简化**: 数据存储在内存中，无需后端服务

现在你可以：
1. 创建和编辑 Workflow
2. 管理节点和连接
3. 配置环境变量
4. 查看和编辑变量
5. 发布和管理版本
6. 导入/导出 Workflow JSON

所有功能都在浏览器本地运行，无需任何后端服务！🚀
