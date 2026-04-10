# Table UI 基础组件速查

本文档用于快速了解 `vite/packages/table/ui/libs` 中的常用组件。

## 注册方式

项目在 `vite/packages/table/ui/index.ts` 中通过 `registerXTUI(app)` 全局注册组件。

```vue
<XtButton type="theme">确定</XtButton>
```

需要按需引入时，可直接引用组件文件：

```ts
import XtButton from '@table/ui/libs/Button/index.vue'
```

## 输入与操作类

| 组件 | 作用 | 常用绑定 |
|------|------|----------|
| `XtButton` | 按钮 | `type`、`loading`、`copy` |
| `XtInput` | 单行输入框 | `v-model` |
| `XtTextarea` | 多行输入框 | `v-model:data` |
| `XtSelect` | 下拉选择 | `v-model`、`list` |
| `XtRadio` | 单选组 | `v-model:data`、`list` |
| `XtTab` | 标签或分段切换 | `v-model`、`list` |

## 布局与反馈类

| 组件 | 作用 | 说明 |
|------|------|------|
| `XtTitle` | 标题栏 | 支持左右插槽 |
| `XtState` | 空态/错误态 | 常用于无数据、失败、引导页 |
| `XtMessage` | 简易确认弹层 | 需父组件控制显隐 |
| `XtMask` | 全屏遮罩 | 点击遮罩不会自动关闭 |
| `XtPopover` | 悬浮提示 | 基于 `a-popover` |
| `XtDrawer` | 抽屉 | 基于 `a-drawer` |
| `XtDivider` | 分隔线 | 无复杂配置 |
| `XtCollapse` | 折叠面板 | 适合简单收起/展开 |

## 图标与样式类

| 组件 | 作用 | 说明 |
|------|------|------|
| `XtNewIcon` | Iconify 图标按钮 | 基于 `@iconify/vue` |
| `XtIcon` | 项目 SVG 图标按钮 | 支持复制文本 |
| `XtBaseIcon` | 底层 SVG `use` 封装 | 依赖 `#icons-{name}` |
| `XtColor` | 颜色选择 | 包含预设色与恢复按钮 |
| `XtBaseColor` | 底层取色器 | 使用 `v-model:data` |
| `XtImg` | 文件选择占位组件 | 当前能力较弱，需二次封装 |

## 使用注意

- 实际注册入口以 `vite/packages/table/ui/index.ts` 为准，不以 `ui/libs/index.js` 为准。
- `XtMessage`、`XtMask` 关闭行为需要在父组件中处理。
- `XtImg` 目前更像一个文件输入占位实现，不适合作为完整上传组件直接使用。
- `XtRadio`、`XtBaseColor` 存在少量历史遗留属性问题，使用前建议先看组件源码。
