# Table 包 UI 基础组件（`ui/libs`）使用说明

本文档描述 `@vite/packages/table/ui/libs` 目录下二次封装的基础组件的用途、属性与事件。这些组件在应用启动时由 `registerXTUI`（`vite/packages/table/ui/index.ts`）全局注册，标签名采用 **PascalCase**（如 `XtButton`），在模板中也可使用 **kebab-case**（如 `xt-button`）。

## 引入方式

### 全局组件（推荐）

在 `main.ts` 中已执行 `registerXTUI(app)`，任意 SFC 中可直接写：

```vue
<XtButton type="theme" @click="onClick">确定</XtButton>
```

### 按需局部引入

```ts
import XtButton from '@table/ui/libs/Button/index.vue';
```

路径别名以项目 `vite` / `tsconfig` 中 `@table` 的实际配置为准。

---

## 组件一览

| 组件名 | 说明 |
|--------|------|
| `XtButton` | 按钮，支持类型、图标、节流、复制文案 |
| `XtInput` | 基于 Ant Design Vue `a-input` 的输入框 |
| `XtTextarea` | 多行文本，双向绑定 `data` |
| `XtSelect` | 基于 `a-select` 的下拉选择 |
| `XtTab` | 分段/标签切换，支持横向/纵向与 tooltip |
| `XtRadio` | 基于 `a-radio-group` 的单选组 |
| `XtTitle` | 标题栏布局（居中标题 + 左右插槽） |
| `XtState` | 空态/错误态等占位展示 |
| `XtNewIcon` | Iconify 图标方块按钮样式 |
| `XtIcon` | 项目内 SVG 精灵图标 + 可选复制 |
| `XtBaseIcon` | 底层 SVG `use`，需存在 `#icons-{name}` |
| `XtMessage` | 简易确认弹层（遮罩 + 确定/取消） |
| `XtMask` | 全屏遮罩 |
| `XtPopover` | 基于 `a-popover` 的悬浮内容 |
| `XtDrawer` | 基于 `a-drawer` 的抽屉 |
| `XtDivider` | 横线分隔 |
| `XtCollapse` | 基于 `a-collapse` 的单面板折叠 |
| `XtColor` | 颜色选择（含预设色与 `XtBaseColor`） |
| `XtBaseColor` | `colorpicker-v3` 颜色选择器封装 |
| `XtImg` | 文件选择 input（占位实现） |

---

## XtButton

**路径：** `ui/libs/Button/index.vue`

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `string` | `'default'` | 样式：`default` / `theme` / `error` / `warn` / `link` / `success` |
| `plain` | `boolean` | `false` | 是否使用 `-plain` 变体 |
| `w` | `number \| string` | `120` | 宽度（px，数字时自动加单位） |
| `h` | `number \| string` | `48` | 高度 |
| `radius` | `number \| string` | `12` | 圆角 |
| `block` | `boolean` | `false` | 宽度 100% |
| `disabled` | `boolean` | `false` | 禁用 |
| `loading` | `boolean` | `false` | 加载中（禁用点击） |
| `icon` | `any` | — | 传给内部 `xt-new-icon` 的图标 |
| `iconPosition` | `string` | `'prefix'` | `prefix` / `postfix` |
| `iconSize` | `number \| string` | `24` | 图标尺寸 |
| `throttleTime` | `number` | `500` | 点击节流（毫秒） |
| `copy` | `string` | `''` | 非空时点击会复制该字符串并提示 |

**事件：** `click`

**插槽：** 默认文本；`prefix` / `postfix` 可覆盖图标区域。

**示例：**

```vue
<XtButton type="theme" :h="36" :w="72" :radius="8" :loading="busy" @click="submit">
  发送
</XtButton>
<XtButton type="link" :plain="true" :h="28" :w="56" :radius="6">清空</XtButton>
```

---

## XtInput

**路径：** `ui/libs/Input/index.vue`

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `any` | — | `v-model` |
| `placeholder` | `string` | `''` | 占位符 |
| `type` | `string` | `'default'` | 非空时增加 `xt-bg-2 rounded-xl` 等样式类 |
| `focus` | `boolean` | `false` | 挂载后自动聚焦 |
| `text` | `boolean` | `false` | 预留调试/状态位 |
| `limit` | `object` | `{ space: false, number: false }` | `space: true` 去空格；`number: true` 仅数字 |

**事件：** `update:modelValue`、`input`、`enter`、`focus`、`blur`、`change`、`keyup`

**插槽：** `addonBefore`、`addonAfter`、`prefix`、`suffix`（对应 `a-input` 同名插槽）

**示例：**

```vue
<XtInput v-model="keyword" placeholder="搜索" :limit="{ number: false, space: true }" @enter="onSearch" />
```

---

## XtTextarea

**路径：** `ui/libs/Textarea/index.vue`

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `any` | — | 使用 `v-model:data` 双向绑定 |
| `placeholder` | `string` | `''` | |
| `rows` | `number` | `1` | 行数 |
| `disabled` | `boolean` | `false` | |
| `border` | `string` | `'xt-border'` | 附加 class |

**事件：** `update:data`、`enter`、`change`、`focus`、`blur`

**示例：**

```vue
<XtTextarea v-model:data="content" :rows="4" placeholder="请输入" />
```

---

## XtSelect

**路径：** `ui/libs/Select/index.vue`

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `any` | `undefined` | `v-model` |
| `list` | `Array` | 内置排序项示例 | 每项需含 `value`、`name`（与 `a-select-option` 对应） |
| `size` | `string` | `'middle'` | Ant Select 尺寸 |

**事件：** `update:modelValue`

**示例：**

```vue
<XtSelect v-model="sort" :list="[{ value: 'a', name: '选项 A' }]" />
```

---

## XtTab

**路径：** `ui/libs/Tab/index.vue`

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `'card small'` | `v-model`，当前选中项的值字段 |
| `list` | `Array<object>` | 内置卡片布局示例 | 每项对象字段名可通过下面 props 映射 |
| `name` / `value` / `icon` / `tip` | `string` | `'name'` / `'value'` / `'icon'` / `'tip'` | 列表项中展示文案、值、图标、tooltip 的字段名 |
| `mode` | `'row' \| 'col'` | `'row'` | 排列方向 |
| `active` | `string` | `'xt-active-btn'` | 选中项 class |
| `placement` | `string` | `'top'` | `a-tooltip` 位置 |
| `boxClass` / `boxStyle` | — | — | 外层容器 |
| `itemClass` / `itemStyle` | — | — | 每一项 |

**事件：** `update:modelValue`

**说明：** 每项可含 `icon`，内部使用 `XtBaseIcon`。

---

## XtRadio

**路径：** `ui/libs/Radio/index.vue`

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `string` | `'card small'` | `v-model:data` |
| `list` | `Array` | 与 XtTab 类似默认 | 每项 `name` / `value` 字段可配置 |
| `name` / `value` | `string` | `'name'` / `'value'` | 字段映射 |
| `text` | `string` | `''` | 非空时在上方显示 `XtTitle` |
| `size` | `string` | `'large'` | `large` / `default` / `small` |
| `space` | `number` | `0` | `a-space` 间距 |

**事件：** `update:data`、`onChange`（值为当前选中项的 `value`）

**说明：** 内部 `fontSizeStyle` 引用了 `fontSize`，当前文件未声明该 prop，实际字号可能为 `undefinedpx`；若需固定字号建议在业务层包一层样式或补齐 prop。

---

## XtTitle

**路径：** `ui/libs/Title/index.vue`

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `any` | — | 居中标题文案 |
| `type` | `string` | `'default'` | `default` / `header` / `text` 控制字号与颜色类 |
| `m` | `string` | `'my'` | 与 `spacing` 组成 Tailwind 间距类，如 `my-3` |
| `spacing` | `string` | `'3'` | |
| `titleClass` | `string` | `''` | 附加根节点 class |

**插槽：** 默认（左侧区域）、`right`（右侧）

---

## XtState

**路径：** `ui/libs/State/index.vue`

用于展示引导下载、加载失败、空数据等状态图与文案。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `state` | `string` | `'init'` | 对应 `public/img/state/{state}.png` |
| `window` | `object` | `{ w: '100%', h: '100%' }` | 容器宽高 |
| `zoom` | `number` | `40` | 图片 `zoom` 百分比 |
| `text` | `object` | `init` / `null` / `false` 等键到文案 | 按 `state` 取文案 |
| `btn` | `object` | 各状态按钮文案 | `state` 为 `null` 时不显示按钮区 |
| `bg` | `string` | `''` | 根节点附加 class |
| `web` | `boolean` | `false` | 为 `true` 时改为「前往工具台」+ 下载按钮 |

**事件：** `onClick`（点击默认按钮区域）

**插槽：** 默认插槽可替换按钮区域（作用域参数当前为 `{ row: {} }`）。

---

## XtNewIcon

**路径：** `ui/libs/NewIcon/index.vue`

基于 `@iconify/vue` 的图标，外层带圆角方块样式。

**Props：** `icon`（默认 `majesticons:monitor-line`）、`w`、`size`、`radius`、`bgClass`、`bgStyle`、`color`

**说明：** 当设置了 `bgStyle` 或 `bgClass` 时，容器为 `w×w` 的圆角块；否则仅按图标 `size` 布局。

---

## XtIcon

**路径：** `ui/libs/Icon/index.vue`

使用 `XtBaseIcon` + 项目 SVG 精灵，带按钮外观；混入 `copyMixins`，可点击复制。

**Props：** `type`（`default` / `theme`）、`icon`、`size`、`w`、`radius`、`h`（保留）、**`copy`**（非空则点击复制）

---

## XtBaseIcon

**路径：** `ui/libs/BaseIcon/index.vue`

**Props：** `icon`（字符串，对应 sprite 中 `icons-{icon}`）、`style`

需在页面中已注入对应 SVG symbol（`#icons-xxx`）。

---

## XtMessage

**路径：** `ui/libs/Message/index.vue`

`modelValue` 为 `true` 时显示遮罩 + 居中对话框（标题「提示」+ 文本 + 取消/确定）。

**Props：** `modelValue`、`text`

**事件：** `ok`、`no`（注意：关闭显示需父组件将 `modelValue` 设为 `false`，本组件未在按钮上自动 `update:modelValue`）

---

## XtMask

**路径：** `ui/libs/Mask/index.vue`

**Props：** `modelValue`（是否显示遮罩）、`to`（`'body'` 时用 `Teleport` 挂到 body）

**插槽：** 默认内容渲染在遮罩之上的容器内（用于叠层内容）。`close()` 当前为空实现，点击遮罩不会自动关。

---

## XtPopover

**路径：** `ui/libs/Popover/index.vue`

**行为：** `trigger="hover"`，`placement="right"`，右侧偏移样式在全局 class `bgg` 中定义。

**插槽：** 默认（触发元素）、`content`（气泡内容）

---

## XtDrawer

**路径：** `ui/libs/Drawer/index.vue`

**Props：** `modelValue`（是否打开）、`placement`（默认 `'bottom'`）

**事件：** `update:modelValue`（关闭时为 `false`）

**插槽：** `title`、默认（主体）

**说明：** 宽度等部分写死为 `500` / `height 200`，与 Ant Design Vue Drawer 行为一致。

---

## XtDivider

**路径：** `ui/libs/Divider/index.vue`

单行横线，class `xt-bb`，无 props。

---

## XtCollapse

**路径：** `ui/libs/Collapse/index.vue`

单个 `a-collapse-panel`。

**Props：** `title`、`content`（无插槽时的默认正文）

**插槽：** `title`（覆盖标题）、默认（面板内容）

---

## XtColor

**路径：** `ui/libs/Color/index.vue`

组合「自定义取色（`XtBaseColor`）」与「`color.ts` 预设色块」，可选恢复默认按钮。

**Props：** `color`（初始颜色，`'none'` 会清空）、`title`（显示为「{title}颜色」）、`btnText`（非空则显示恢复按钮）

**事件：** `update:color`（当前选中色值）、`onBtnClick`（点击恢复按钮，参数为传入的 `color`）

---

## XtBaseColor

**路径：** `ui/libs/BaseColor/index.vue`

封装 `colorpicker-v3`；模板中可在上方显示 `XtTitle`，但当前 script 里 **未声明 `text` prop**（且 `data` 在 `props` 中重复声明了一次），使用前建议在业务侧直接包一层标题，或后续在组件内补全 props。

**Props：** `data`（`string`，默认 `''`）— 使用 `v-model:data`

**事件：** `update:data`、`click`

**示例：**

```vue
<XtBaseColor v-model:data="hexColor" />
```

---

## XtImg

**路径：** `ui/libs/Img/index.vue`

当前实现为隐藏的 `<input type="file">`，无对外 props/事件，如需上传需自行 ref 拓展。

---

## 依赖与样式

- 多数组件依赖 **Ant Design Vue**（`a-input`、`a-select`、`a-drawer` 等）。
- `XtButton` / `XtIcon` 复制成功提示使用 **ant-design-vue** 的 `message`。
- `XtBaseColor` / `XtColor` 依赖 **colorpicker-v3** 及项目内 CSS 变量（如 `--primary-text`、`--secondary-bg`）。
- `XtNewIcon` 依赖 **@iconify/vue**。

样式类名如 `xt-text`、`xt-bg-2`、`xt-active-btn` 等来自项目全局 SCSS，需保证 table 包入口样式已加载。

---

## 与 `ui/libs/index.js` 的关系

`ui/libs/index.js` 当前内容指向其他 glob 路径，**并非**本仓库实际注册入口。以 **`vite/packages/table/ui/index.ts` 中的 `registerXTUI`** 为准。
