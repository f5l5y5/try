import { Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { createVNode } from 'vue'

class Monitor {
  private oldScript: string[] = []

  private newScript: string[] = []

  private oldEtag: string | null = null

  private newEtag: string | null = null

  dispatch: Record<string, (() => void)[]> = {}

  private stop = false

  constructor() {
    this.init()
  }

  async init() {
    console.log('初始化')
    const html: string = await this.getHtml()
    this.oldScript = this.parserScript(html)
    this.oldEtag = await this.getEtag()
  }

  async getHtml() {
    const html = await fetch('/').then((res) => res.text())
    return html
  }

  async getEtag() {
    const res = await fetch('/')
    return res.headers.get('etag')
  }

  parserScript(html: string) {
    const reg = /<script(?:\s+[^>]*)?>(.*?)<\/script\s*>/gi
    return html.match(reg) as string[]
  }

  on(key: 'update', fn: () => void) {
    ;(this.dispatch[key] || (this.dispatch[key] = [])).push(fn)
    return this
  }

  pause() {
    this.stop = !this.stop
  }

  get value() {
    return {
      oldEtag: this.oldEtag,
      newEtag: this.newEtag,
      oldScript: this.oldScript,
      newScript: this.newScript,
    }
  }

  compare() {
    if (this.stop) return
    const oldLen = this.oldScript.length
    const newLen = Array.from(
      new Set(this.oldScript.concat(this.newScript))
    ).length

    if (this.oldEtag !== this.newEtag || newLen !== oldLen) {
      this.dispatch.update.forEach((fn) => {
        fn()
      })
    }
  }

  async check() {
    const newHtml = await this.getHtml()
    this.newScript = this.parserScript(newHtml)
    this.newEtag = await this.getEtag()
    this.compare()
  }
}
export const monitor = new Monitor()
monitor.on('update', () => {
  console.log('更新数据', monitor.value)
  Modal.confirm({
    title: '更新提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '版本有更新，是否刷新页面！',
    okText: '刷新',
    cancelText: '不刷新',
    onOk() {
      location.replace('/')
      location.reload()
    },
    onCancel() {
      monitor.pause()
    },
  })
})
// 问题会刷新两次  构建完文件的内容etag会变，返回后html的hash也会变