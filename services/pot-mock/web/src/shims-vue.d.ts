/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.css' {
  const content: any
  export default content
}

declare module 'ant-design-vue' {
  import type { App } from 'vue'
  const Antd: {
    install: (app: App) => void
  }
  export const message: {
    success: (content: string) => void
    error: (content: string) => void
    warning: (content: string) => void
  }
  export default Antd
}
