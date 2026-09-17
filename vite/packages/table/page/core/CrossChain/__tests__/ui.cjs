#!/usr/bin/env node
/**
 * 跨链模块 UI 探针（CDP）
 *
 * 用法：
 *   node packages/table/page/core/CrossChain/__tests__/ui.cjs <route|表达式> [--port 9555] [--reload]
 *
 * 例：
 *   node .../ui.cjs dashboard                      # 跳到工作台并打印页面快照
 *   node .../ui.cjs "document.querySelector('.header-wallet-area').innerText"
 *
 * 说明：仓库内 ws 版本与 Electron 26 的 CDP 握手不兼容（Unexpected server response: 101），
 * 因此这里用 net + 手写 WebSocket 帧。
 */
const net = require('net')
const crypto = require('crypto')

const ROUTES = {
  dashboard: '#/core/crosschain/dashboard',
  create: '#/core/crosschain/create',
  tasks: '#/core/crosschain/tasks',
  network: '#/core/crosschain/network',
  relay: '#/core/crosschain/relay',
  manage: '#/core/crosschain/manage',
  legacyMulti: '#/multi',
  legacyTasks: '#/tasks',
}

const argv = process.argv.slice(2)
const args = {}
const positional = []
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--port') args.port = Number(argv[++i])
  else if (argv[i] === '--reload') args.reload = true
  else if (argv[i] === '--boot-errors') args.bootErrors = true
  else positional.push(argv[i])
}
const PORT = args.port || Number(process.env.CDP_PORT || 9222)
const TARGET = positional[0] || 'dashboard'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function wsConnect(port, path) {
  return new Promise((resolve, reject) => {
    const key = crypto.randomBytes(16).toString('base64')
    const socket = net.connect(port, '127.0.0.1')
    let buffer = Buffer.alloc(0)
    let upgraded = false
    const handlers = { message: [] }

    socket.on('error', reject)
    socket.on('connect', () => {
      socket.write(
        `GET ${path} HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n` +
          `Sec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`,
      )
    })

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk])
      if (!upgraded) {
        const idx = buffer.indexOf('\r\n\r\n')
        if (idx < 0) return
        const head = buffer.slice(0, idx).toString()
        if (!/^HTTP\/1\.1 101/.test(head)) return reject(new Error('WS 握手失败: ' + head.split('\r\n')[0]))
        buffer = buffer.slice(idx + 4)
        upgraded = true
        resolve(api)
        parse()
        return
      }
      parse()
    })

    function parse() {
      for (;;) {
        if (buffer.length < 2) return
        const fin = (buffer[0] & 0x80) !== 0
        const opcode = buffer[0] & 0x0f
        const masked = (buffer[1] & 0x80) !== 0
        let len = buffer[1] & 0x7f
        let off = 2
        if (len === 126) {
          if (buffer.length < off + 2) return
          len = buffer.readUInt16BE(off)
          off += 2
        } else if (len === 127) {
          if (buffer.length < off + 8) return
          len = Number(buffer.readBigUInt64BE(off))
          off += 8
        }
        let mask = null
        if (masked) {
          if (buffer.length < off + 4) return
          mask = buffer.slice(off, off + 4)
          off += 4
        }
        if (buffer.length < off + len) return
        let payload = buffer.slice(off, off + len)
        buffer = buffer.slice(off + len)
        if (mask) {
          payload = Buffer.from(payload)
          for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4]
        }
        if (opcode === 0x8) return
        if (opcode === 0x1 || opcode === 0x0) {
          if (fin) handlers.message.forEach((f) => f(payload.toString('utf8')))
          else {
            api._pending = (api._pending || '') + payload.toString('utf8')
            if (!fin) continue
            handlers.message.forEach((f) => f(api._pending))
            api._pending = ''
          }
        }
      }
    }

    const api = {
      _pending: '',
      onMessage(fn) {
        handlers.message.push(fn)
      },
      sendText(text) {
        const payload = Buffer.from(text, 'utf8')
        const mask = crypto.randomBytes(4)
        let header
        if (payload.length < 126) header = Buffer.from([0x81, 0x80 | payload.length])
        else if (payload.length < 65536) {
          header = Buffer.alloc(4)
          header[0] = 0x81
          header[1] = 0x80 | 126
          header.writeUInt16BE(payload.length, 2)
        } else {
          header = Buffer.alloc(10)
          header[0] = 0x81
          header[1] = 0x80 | 127
          header.writeBigUInt64BE(BigInt(payload.length), 2)
        }
        const out = Buffer.from(payload)
        for (let i = 0; i < out.length; i++) out[i] ^= mask[i % 4]
        socket.write(Buffer.concat([header, mask, out]))
      },
      close: () => socket.destroy(),
    }
  })
}

async function connect(wsUrl) {
  const m = /ws:\/\/([^:]+):(\d+)(\/.*)$/.exec(wsUrl)
  const ws = await wsConnect(Number(m[2]), m[3])
  const pending = new Map()
  const logs = []
  let id = 0
  ws.onMessage((raw) => {
    let msg
    try {
      msg = JSON.parse(raw)
    } catch {
      return
    }
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result)
      return
    }
    if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
      logs.push(`[${msg.params.type}] ` + msg.params.args.map((a) => a.value ?? a.description ?? a.type).join(' ').slice(0, 240))
    }
    if (msg.method === 'Runtime.exceptionThrown') logs.push('[exception] ' + String(msg.params.exceptionDetails?.exception?.description || '').slice(0, 240))
  })
  return {
    logs,
    send: (method, params = {}) =>
      new Promise((res, rej) => {
        const msgId = ++id
        pending.set(msgId, { res, rej })
        ws.sendText(JSON.stringify({ id: msgId, method, params }))
        setTimeout(() => {
          if (pending.has(msgId)) {
            pending.delete(msgId)
            rej(new Error('CDP 超时: ' + method))
          }
        }, 60000)
      }),
    close: () => ws.close(),
  }
}

async function main() {
  const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
  const page = list.find((t) => t.type === 'page' && /table\.html/.test(t.url || ''))
  if (!page) throw new Error(`未找到 table 渲染进程（调试端口 ${PORT}）`)
  const cdp = await connect(page.webSocketDebuggerUrl)
  await cdp.send('Runtime.enable')

  const evaluate = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, userGesture: true })
    if (r.exceptionDetails) return { __error: r.exceptionDetails.exception?.description || r.exceptionDetails.text }
    return r.result?.value
  }

  if (args.reload) {
    await evaluate('location.reload()')
    for (let i = 0; i < 90; i++) {
      await sleep(1000)
      const len = await evaluate('document.body.innerText.length').catch(() => 0)
      if (len > 300) break
    }
    await sleep(3000)
  }

  // 启动期异常捕获：在页面脚本之前注入钩子，再刷新，可拿到首屏渲染异常
  if (args.bootErrors) {
    await cdp.send('Page.enable')
    const hook = `window.__bootErrs=[];(function(){
      var push=function(s){try{window.__bootErrs.push(String(s).slice(0,300))}catch(e){}};
      window.addEventListener('error',function(e){push('error: '+(e.message||e.error))});
      window.addEventListener('unhandledrejection',function(e){push('rejection: '+e.reason)});
      var ce=console.error;console.error=function(){push('console.error: '+Array.prototype.map.call(arguments,String).join(' '));return ce.apply(console,arguments)};
      var cw=console.warn;console.warn=function(){var s=Array.prototype.map.call(arguments,String).join(' ');if(/Vue warn|error/i.test(s))push('console.warn: '+s);return cw.apply(console,arguments)};
    })();`
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: hook })
    await cdp.send('Page.reload')
    await sleep(40000)
    const result = await evaluate(
      `JSON.stringify({ errs: (window.__bootErrs||[]).slice(0,15), bodyLen: document.body.innerText.length, containerLen: (document.querySelector('.a-container')||{}).innerHTML ? document.querySelector('.a-container').innerHTML.length : 0 })`,
    )
    console.log(result)
    cdp.close()
    return
  }

  // 表达式模式：直接求值
  if (!ROUTES[TARGET] && TARGET !== 'snapshot') {
    const value = await evaluate(TARGET)
    console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 2))
    cdp.close()
    return
  }

  const route = ROUTES[TARGET]
  if (route) {
    await evaluate(`location.hash = ${JSON.stringify(route)}`)
    await sleep(1500)
    for (let i = 0; i < 60; i++) {
      if (await evaluate(`!!document.querySelector('.crosschain-module')`)) break
      await sleep(500)
    }
    await sleep(4000)
  }

  const snap = await evaluate(`(() => {
    const t = (el) => el ? el.textContent.trim().replace(/\\s+/g, ' ') : null
    const header = document.querySelector('.header-wallet-area')
    const balanceEl = document.querySelector('.wallet-balance')
    const browserSummary = document.querySelector('.browser-wallet-summary')
    return {
      hash: location.hash,
      title: t(document.querySelector('.cc-page-title')),
      aside: [...document.querySelectorAll('.cc-aside-item')].map(t),
      activeAside: t(document.querySelector('.cc-aside-item.is-active')),
      stats: [...document.querySelectorAll('.cc-stat')].map(el => t(el.querySelector('.cc-stat-label')) + '=' + t(el.querySelector('.cc-stat-value'))),
      chips: [...document.querySelectorAll('.cc-chip')].map(t).slice(0, 12),
      rows: document.querySelectorAll('.ant-table-tbody tr').length,
      empties: [...document.querySelectorAll('.cc-empty')].map(t),
      errors: [...document.querySelectorAll('.cc-error')].map(t),
      headerExists: !!header,
      headerText: t(header),
      balanceExists: !!balanceEl,
      balanceText: t(balanceEl),
      balanceDisplay: balanceEl ? getComputedStyle(balanceEl).display : null,
      balanceVisible: balanceEl ? balanceEl.getBoundingClientRect().width > 0 : null,
      browserSummaryText: t(browserSummary),
    }
  })()`)

  console.log(JSON.stringify(snap, null, 2))
  if (cdp.logs.length) console.log('\n控制台:\n' + cdp.logs.slice(0, 8).join('\n'))
  cdp.close()
}

main().catch((e) => {
  console.log('探针失败: ' + (e?.message || e))
  process.exit(1)
})
