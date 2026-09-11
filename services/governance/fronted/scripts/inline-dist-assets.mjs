import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(rootDir, 'dist')
const indexPath = resolve(distDir, 'index.html')

if (!existsSync(indexPath)) {
  throw new Error('dist/index.html does not exist. Run vite build first.')
}

let html = readFileSync(indexPath, 'utf8')

html = html.replace(
  /<link rel="stylesheet" crossorigin href="\.\/([^"]+\.css)">/g,
  (_, href) => {
    const cssPath = resolve(distDir, href)
    const css = readFileSync(cssPath, 'utf8')
    return `<style>\n${css}\n</style>`
  }
)

html = html.replace(
  /<script type="module" crossorigin src="\.\/([^"]+\.js)"><\/script>/g,
  (_, src) => {
    const jsPath = resolve(distDir, src)
    const js = readFileSync(jsPath, 'utf8')
    return `<script type="module">\n${js}\n</script>`
  }
)

writeFileSync(indexPath, html)

const assetsDir = resolve(distDir, 'assets')
if (existsSync(assetsDir)) {
  rmSync(assetsDir, { recursive: true, force: true })
}
