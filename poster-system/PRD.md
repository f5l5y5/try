# 海报管理系统 产品需求文档 (PRD)

## 一、项目概述

### 1.1 项目背景
目前公司小程序和H5端海报生成逻辑分散，各自独立实现，导致：
- 代码重复，维护成本高
- 海报样式不统一，品牌形象不一致
- 修改海报需要同时修改多处代码
- 缺乏统一的海报管理平台

### 1.2 项目目标
建设**JSON配置驱动**的海报管理系统，实现：
- **B端**: 可视化编辑器生成JSON模板配置
- **C端**: 获取JSON配置，直接用Leafer.js前端渲染
- 统一的海报模板管理
- 多端复用同一套JSON配置
- 降低开发和维护成本

### 1.3 核心架构思想

```
┌─────────────┐      JSON配置       ┌─────────────┐
│   B端编辑器  │ ───────────────────>│  模板存储DB  │
│  (可视化)   │                      │             │
└─────────────┘                      └─────────────┘
                                           │
                                           │ 获取JSON
                                           ▼
┌─────────────┐      JSON配置       ┌─────────────┐
│  小程序C端   │ <───────────────────│  Leafer.js  │
│             │      直接渲染        │   渲染引擎   │
└─────────────┘                      └─────────────┘
                                           │
                                           │ 直接渲染
                                           ▼
┌─────────────┐      JSON配置       ┌─────────────┐
│   H5 C端    │ <───────────────────│  海报图片    │
│             │      直接渲染        │             │
└─────────────┘                      └─────────────┘
```

**关键点**：
- B端只负责生成JSON配置，不生成图片
- C端获取JSON配置后，在前端直接用Leafer.js渲染
- 数据变量由C端传入，与JSON配置合并后渲染

### 1.4 技术选型
- **渲染引擎**: Leafer.js (支持小程序和H5)
- **后端**: Node.js + Express / Nest.js
- **数据库**: MySQL + Redis
- **B端前端**: Vue 3 / React
- **文件存储**: 阿里云OSS / 腾讯云COS

---

## 二、用户角色定义

| 角色 | 说明 | 主要职责 |
|------|------|----------|
| 超级管理员 | 系统最高权限 | 用户管理、权限配置、系统配置 |
| 运营人员 | B端使用者 | 创建海报模板、管理素材、查看数据 |
| 开发人员 | 技术支持 | 接口对接、模板配置、技术支持 |
| C端用户 | 终端用户 | 浏览海报、分享海报 |

---

## 三、功能需求

### 3.1 B端管理后台

#### 3.1.1 海报模板管理

**功能点1：模板列表**
- 支持分页查询海报模板
- 支持按分类、状态、创建时间筛选
- 支持模板预览（缩略图）
- 支持模板复制、删除、启用/禁用

**功能点2：模板创建/编辑**
- 可视化编辑器
  - 画布设置：尺寸、背景色/背景图
  - 组件添加：图片、文字、形状、二维码、装饰元素
  - 组件属性编辑：位置、大小、颜色、字体、透明度、旋转
  - 图层管理：上移、下移、置顶、置底、删除
  - 对齐辅助：吸附、标尺、参考线
- 动态变量配置
  - 支持变量占位符：${userName}、${avatar}、${qrCode}等
  - 变量默认值设置
- 模板基本信息
  - 模板名称、分类
  - 适用场景（小程序/H5/通用）
  - 模板描述

**功能点3：模板预览与测试**
- 实时预览编辑效果
- 支持测试数据填充预览
- 支持生成测试海报图片

#### 3.1.2 素材管理

**功能点1：素材库**
- 图片上传：支持批量上传
- 图片分类管理
- 图片预览、删除
- 图片搜索

**功能点2：字体管理**
- 系统预设字体
- 自定义字体上传
- 字体预览

#### 3.1.3 分类管理

- 海报分类的增删改查
- 分类排序
- 分类状态管理

#### 3.1.4 数据统计

- 海报生成次数统计
- 海报分享次数统计
- 模板使用排行
- 按日期范围查询统计数据

#### 3.1.5 系统管理

**用户管理**
- 用户列表
- 用户新增、编辑、删除
- 角色分配

**角色权限**
- 角色列表
- 权限配置
- 角色分配

### 3.2 C端展示端（JSON配置驱动）

#### 3.2.1 获取模板配置

- 根据模板ID获取JSON配置
- 支持批量获取模板配置
- 配置缓存（减少请求）

#### 3.2.2 海报渲染（核心）

```javascript
// C端使用示例
import { Leafer, Rect, Text, Image } from 'leafer-ui'

// 1. 获取模板JSON配置
const templateConfig = await getTemplateConfig(templateId)

// 2. 准备动态数据
const data = {
  userName: '张三',
  avatar: 'https://xxx.com/avatar.png',
  qrCode: 'https://xxx.com/share?uid=123',
  // ... 其他动态数据
}

// 3. 使用Leafer.js直接渲染
const leafer = new Leafer({
  width: templateConfig.canvas.width,
  height: templateConfig.canvas.height
})

// 4. 遍历JSON配置创建元素
templateConfig.elements.forEach(el => {
  const node = createElementByConfig(el, data)
  leafer.add(node)
})

// 5. 导出到图片
leafer.export('png').then(url => {
  // 保存或分享
})
```

#### 3.2.3 海报预览

- 实时Canvas预览
- 支持缩放查看
- 支持长按保存

#### 3.2.4 海报分享

- 支持分享到微信好友/朋友圈
- 支持分享到其他平台
- 分享回调统计

#### 3.2.5 离线支持

- 支持模板配置本地缓存
- 支持离线渲染海报

---

## 四、接口设计

### 4.1 模板管理接口（B端）

```javascript
// 创建模板
POST /api/poster/template
Body: {
  name: string,
  categoryId: number,
  scene: 1 | 2 | 3,  // 1-小程序 2-H5 3-通用
  config: TemplateConfig,  // JSON配置
  status: 1 | 2
}

// 获取模板列表
GET /api/poster/template/list?categoryId=&status=&page=&size=
Response: {
  total: number,
  list: [{
    id: number,
    name: string,
    categoryId: number,
    scene: number,
    previewUrl: string,
    status: number,
    createdAt: string
  }]
}

// 获取模板配置（C端核心接口）
GET /api/poster/template/:id/config
Response: {
  id: number,
  name: string,
  config: TemplateConfig  // JSON配置
}

// 更新模板
PUT /api/poster/template/:id
Body: {
  name: string,
  categoryId: number,
  scene: number,
  config: TemplateConfig,
  status: number
}

// 删除模板
DELETE /api/poster/template/:id

// 复制模板
POST /api/poster/template/:id/copy
```

### 4.2 素材管理接口

```javascript
// 上传素材
POST /api/poster/material/upload
Content-Type: multipart/form-data
Body: { file: File, categoryId: number }
Response: { url: string, id: number }

// 获取素材列表
GET /api/poster/material/list?categoryId=&type=&page=&size=

// 删除素材
DELETE /api/poster/material/:id
```

### 4.3 统计接口

```javascript
// 记录海报加载（C端调用）
POST /api/poster/stats/track
Body: {
  templateId: number,
  scene: 1 | 2,  // 1-小程序 2-H5
  userId?: string
}

// 获取统计数据
GET /api/poster/stats/template?startDate=&endDate=
```

### 4.4 TemplateConfig JSON结构定义

```typescript
// 模板配置结构（完整JSON Schema）
interface TemplateConfig {
  // 画布配置
  canvas: {
    width: number;      // 画布宽度
    height: number;     // 画布高度
    background: string; // 背景色或背景图URL
  };

  // 元素数组
  elements: Array<{
    // 基础属性
    id: string;         // 元素唯一ID
    type: 'image' | 'text' | 'rect' | 'circle' | 'qrcode' | 'ellipse';
    x: number;          // X坐标
    y: number;          // Y坐标
    width?: number;     // 宽度
    height?: number;    // 高度
    rotation?: number;  // 旋转角度
    opacity?: number;   // 透明度 0-1
    zIndex?: number;    // 层级

    // 类型特定配置
    config: {
      // 图片类型
      url?: string;              // 图片URL或变量占位符
      mode?: 'cover' | 'contain' | 'fill';

      // 文字类型
      text?: string;             // 文字内容或变量占位符
      fontSize?: number;
      fontFamily?: string;
      fontWeight?: 'normal' | 'bold';
      color?: string;
      align?: 'left' | 'center' | 'right';
      lineHeight?: number;
      maxWidth?: number;

      // 矩形/圆形
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      cornerRadius?: number;

      // 二维码
      content?: string;          // 二维码内容或变量占位符
      size?: number;
      foreground?: string;
      background?: string;
    };

    // 数据绑定
    dataKey?: string;    // 绑定的数据字段名
    defaultValue?: any;  // 默认值
  }>;

  // 变量定义（用于编辑器展示）
  variables?: Array<{
    key: string;         // 变量名
    name: string;        // 显示名称
    type: 'text' | 'image' | 'qrcode';
    defaultValue?: any;
    required: boolean;
  }>;
}
```

---

## 五、数据模型设计

### 5.1 海报模板表 (poster_template)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键ID |
| name | VARCHAR(100) | 模板名称 |
| category_id | BIGINT | 分类ID |
| scene | TINYINT | 适用场景 1-小程序 2-H5 3-通用 |
| config | JSON | 完整JSON配置（TemplateConfig） |
| preview_url | VARCHAR(500) | 预览图URL |
| version | INT | 版本号 |
| status | TINYINT | 状态 1-启用 2-禁用 |
| sort | INT | 排序值 |
| created_by | BIGINT | 创建人ID |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

**config字段示例**：
```json
{
  "canvas": {
    "width": 750,
    "height": 1334,
    "background": "#FFFFFF"
  },
  "elements": [
    {
      "id": "bg_001",
      "type": "image",
      "x": 0,
      "y": 0,
      "width": 750,
      "height": 1334,
      "config": {
        "url": "https://cdn.xxx.com/poster/bg.png"
      }
    },
    {
      "id": "avatar_001",
      "type": "image",
      "x": 275,
      "y": 100,
      "width": 200,
      "height": 200,
      "config": {
        "url": "${avatar}",
        "mode": "cover"
      },
      "dataKey": "avatar",
      "defaultValue": "https://cdn.xxx.com/default-avatar.png"
    },
    {
      "id": "name_001",
      "type": "text",
      "x": 375,
      "y": 350,
      "config": {
        "text": "${userName}",
        "fontSize": 32,
        "fontFamily": "PingFang SC",
        "color": "#333333",
        "align": "center",
        "maxWidth": 500
      },
      "dataKey": "userName",
      "defaultValue": "用户名称"
    },
    {
      "id": "qrcode_001",
      "type": "qrcode",
      "x": 275,
      "y": 800,
      "width": 200,
      "height": 200,
      "config": {
        "content": "${qrCode}",
        "size": 200,
        "foreground": "#000000",
        "background": "#FFFFFF"
      },
      "dataKey": "qrCode"
    }
  ],
  "variables": [
    {
      "key": "avatar",
      "name": "用户头像",
      "type": "image",
      "defaultValue": "https://cdn.xxx.com/default-avatar.png",
      "required": true
    },
    {
      "key": "userName",
      "name": "用户名称",
      "type": "text",
      "defaultValue": "用户名称",
      "required": true
    },
    {
      "key": "qrCode",
      "name": "分享二维码",
      "type": "qrcode",
      "defaultValue": "",
      "required": true
    }
  ]
}
```

### 5.2 素材表 (poster_material)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键ID |
| name | VARCHAR(100) | 素材名称 |
| type | TINYINT | 类型 1-图片 2-字体 |
| category_id | BIGINT | 分类ID |
| url | VARCHAR(500) | 文件URL |
| file_size | INT | 文件大小(字节) |
| width | INT | 图片宽度(图片类型) |
| height | INT | 图片高度(图片类型) |
| created_by | BIGINT | 上传人ID |
| created_at | DATETIME | 创建时间 |

### 5.3 海报加载记录表 (poster_track)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键ID |
| template_id | BIGINT | 模板ID |
| scene | TINYINT | 来源场景 1-小程序 2-H5 |
| user_id | BIGINT | 用户ID（可选） |
| client_ip | VARCHAR(50) | 客户端IP |
| created_at | DATETIME | 创建时间 |

### 5.4 分类表 (poster_category)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键ID |
| name | VARCHAR(50) | 分类名称 |
| sort | INT | 排序值 |
| status | TINYINT | 状态 1-启用 2-禁用 |
| created_at | DATETIME | 创建时间 |

---

## 六、Leafer.js 技术实现方案

### 6.1 核心渲染流程

```
┌─────────────────────────────────────────────────────────────┐
│  1. C端获取模板JSON配置                                        │
│     GET /api/poster/template/:id/config                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. 准备动态数据                                               │
│     const data = { userName, avatar, qrCode, ... }          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. 创建Leafer画布                                            │
│     const leafer = new Leafer({ width, height })            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 遍历JSON配置创建元素                                       │
│     templateConfig.elements.forEach(el => {                 │
│       const node = createElementByConfig(el, data)          │
│       leafer.add(node)                                      │
│     })                                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. 导出到图片                                                │
│     leafer.export('png')                                    │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 C端SDK封装

#### 6.2.1 核心渲染器类

```javascript
// poster-renderer.js
import { Leafer, Rect, Text, Image, Ellipse } from 'leafer-ui'
import QRCode from 'qrcode'

/**
 * 海报渲染器
 * @example
 * const renderer = new PosterRenderer()
 * const posterUrl = await renderer.render(templateConfig, data)
 */
export class PosterRenderer {
  constructor(options = {}) {
    this.options = {
      debug: false,
      ...options
    }
  }

  /**
   * 渲染海报
   * @param {Object} templateConfig - 模板JSON配置
   * @param {Object} data - 动态数据
   * @returns {Promise<string>} 图片URL
   */
  async render(templateConfig, data = {}) {
    const { canvas, elements } = templateConfig

    // 1. 创建画布
    const leafer = new Leafer({
      width: canvas.width,
      height: canvas.height,
      type: 'design' // 开发模式，方便调试
    })

    // 2. 添加背景
    if (canvas.background) {
      const bg = this._createBackground(canvas, data)
      leafer.add(bg)
    }

    // 3. 按zIndex排序后创建元素
    const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

    for (const el of sortedElements) {
      try {
        const node = await this._createElement(el, data)
        if (node) {
          leafer.add(node)
        }
      } catch (error) {
        console.error(`创建元素失败 [${el.id}]:`, error)
        if (this.options.debug) throw error
      }
    }

    // 4. 导出到图片
    return await this._export(leafer)
  }

  /**
   * 创建背景
   */
  _createBackground(canvas, data) {
    const bg = canvas.background || '#FFFFFF'
    const isImage = bg.startsWith('http') || bg.startsWith('//')

    if (isImage) {
      return new Image({
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
        url: this._replaceVariables(bg, data)
      })
    }

    return new Rect({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      fill: bg
    })
  }

  /**
   * 创建元素
   */
  async _createElement(el, data) {
    const { type } = el

    switch (type) {
      case 'image':
        return this._createImage(el, data)
      case 'text':
        return this._createText(el, data)
      case 'rect':
        return this._createRect(el, data)
      case 'circle':
        return this._createCircle(el, data)
      case 'ellipse':
        return this._createEllipse(el, data)
      case 'qrcode':
        return await this._createQRCode(el, data)
      default:
        console.warn(`未知元素类型: ${type}`)
        return null
    }
  }

  /**
   * 创建图片元素
   */
  _createImage(el, data) {
    const { x, y, width, height, rotation, opacity, zIndex, config } = el
    const url = this._replaceVariables(config.url || '', data)
    const mode = config.mode || 'cover'

    // 使用默认值
    const finalUrl = url || el.defaultValue || ''

    return new Image({
      x, y, width, height,
      url: finalUrl,
      rotation,
      opacity: opacity ?? 1,
      zIndex
    })
  }

  /**
   * 创建文字元素
   */
  _createText(el, data) {
    const { x, y, rotation, opacity, zIndex, config } = el
    const text = this._replaceVariables(config.text || '', data)

    return new Text({
      x,
      y,
      text: text || el.defaultValue || '',
      fontSize: config.fontSize || 16,
      fontFamily: config.fontFamily || 'Arial',
      fontWeight: config.fontWeight || 'normal',
      fill: config.color || '#000000',
      textAlign: config.align || 'left',
      lineHeight: config.lineHeight || 1.2,
      maxWidth: config.maxWidth,
      rotation,
      opacity: opacity ?? 1,
      zIndex
    })
  }

  /**
   * 创建矩形元素
   */
  _createRect(el, data) {
    const { x, y, width, height, rotation, opacity, zIndex, config } = el

    return new Rect({
      x, y, width, height,
      fill: config.fill || 'transparent',
      stroke: config.stroke,
      strokeWidth: config.strokeWidth || 0,
      cornerRadius: config.cornerRadius || 0,
      rotation,
      opacity: opacity ?? 1,
      zIndex
    })
  }

  /**
   * 创建圆形元素
   */
  _createCircle(el, data) {
    const { x, y, width, height, rotation, opacity, zIndex, config } = el

    return new Ellipse({
      x, y, width, height,
      fill: config.fill || 'transparent',
      stroke: config.stroke,
      strokeWidth: config.strokeWidth || 0,
      rotation,
      opacity: opacity ?? 1,
      zIndex
    })
  }

  /**
   * 创建椭圆元素
   */
  _createEllipse(el, data) {
    return this._createCircle(el, data)
  }

  /**
   * 创建二维码元素
   */
  async _createQRCode(el, data) {
    const { x, y, width, height, rotation, opacity, zIndex, config } = el
    const content = this._replaceVariables(config.content || '', data)

    // 使用默认值
    const finalContent = content || el.defaultValue || ''

    // 生成二维码DataURL
    const dataUrl = await QRCode.toDataURL(finalContent, {
      width: config.size || Math.min(width, height),
      margin: 0,
      color: {
        dark: config.foreground || '#000000',
        light: config.background || '#ffffff'
      }
    })

    return new Image({
      x, y, width, height,
      url: dataUrl,
      rotation,
      opacity: opacity ?? 1,
      zIndex
    })
  }

  /**
   * 替换变量占位符
   * @param {string} str - 包含占位符的字符串
   * @param {Object} data - 数据对象
   * @returns {string}
   */
  _replaceVariables(str, data) {
    if (!str || typeof str !== 'string') return str
    return str.replace(/\$\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match
    })
  }

  /**
   * 导出图片
   */
  async _export(leafer) {
    return new Promise((resolve, reject) => {
      leafer.export('png', (result) => {
        if (result.error) {
          reject(result.error)
        } else {
          resolve(result.url)
        }
      })
    })
  }
}

// 导出单例
export const posterRenderer = new PosterRenderer()
```

#### 6.2.2 C端使用示例

```javascript
// 使用示例1：基础用法
import { posterRenderer } from './poster-renderer'

async function generatePoster() {
  // 1. 获取模板配置
  const response = await fetch('/api/poster/template/123/config')
  const { config } = await response.json()

  // 2. 准备数据
  const data = {
    userName: '张三',
    avatar: 'https://cdn.xxx.com/avatar/123.png',
    qrCode: 'https://example.com/share?uid=123'
  }

  // 3. 渲染海报
  const posterUrl = await posterRenderer.render(config, data)

  // 4. 显示或保存
  document.getElementById('poster').src = posterUrl
}

// 使用示例2：小程序中使用
Page({
  data: {
    posterUrl: ''
  },

  async onLoad() {
    const config = await this.getTemplateConfig()
    const data = {
      userName: '张三',
      avatar: 'https://cdn.xxx.com/avatar/123.png',
      qrCode: 'https://example.com/share?uid=123'
    }

    const posterUrl = await posterRenderer.render(config, data)
    this.setData({ posterUrl })
  },

  // 保存到相册
  savePoster() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterUrl,
      success: () => {
        wx.showToast({ title: '保存成功' })
      }
    })
  }
})

// 使用示例3：React组件中使用
import React, { useState, useEffect } from 'react'
import { posterRenderer } from './poster-renderer'

function Poster({ templateId, userData }) {
  const [posterUrl, setPosterUrl] = useState('')

  useEffect(() => {
    async function loadPoster() {
      const response = await fetch(`/api/poster/template/${templateId}/config`)
      const { config } = await response.json()

      const url = await posterRenderer.render(config, userData)
      setPosterUrl(url)
    }

    loadPoster()
  }, [templateId, userData])

  return (
    <div className="poster-container">
      <img src={posterUrl} alt="海报" />
      <button onClick={() => {/* 下载逻辑 */}}>保存海报</button>
    </div>
  )
}
```

### 6.3 小程序适配方案

```javascript
// 小程序环境检测
const isMiniProgram = () => {
  return typeof wx !== 'undefined' && wx.canvasToTempFilePath
}

// 小程序导出适配
class MiniProgramPosterRenderer extends PosterRenderer {
  async _export(leafer) {
    if (isMiniProgram()) {
      // 小程序环境导出
      const canvas = leafer.canvas

      return new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          canvas,
          success: (res) => resolve(res.tempFilePath),
          fail: reject
        })
      })
    }

    // H5环境使用父类方法
    return await super._export(leafer)
  }
}

export const miniProgramRenderer = new MiniProgramPosterRenderer()
```

---

## 七、非功能需求

### 7.1 性能要求

| 指标 | 要求 |
|------|------|
| 海报生成响应时间 | 简单海报 < 2s，复杂海报 < 5s |
| 并发处理能力 | 支持 100 QPS |
| 模板编辑器响应 | 操作延迟 < 100ms |
| 海报图片大小 | 单张 < 500KB |

### 7.2 兼容性要求

**H5端**
- iOS Safari 12+
- Android Chrome 70+
- 微信内置浏览器
- 支付宝内置浏览器

**小程序端**
- 微信小程序基础库 2.10.0+
- 支付宝小程序

### 7.3 安全要求

- 接口鉴权（JWT）
- 图片文件格式校验
- 文件大小限制
- XSS防护
- 请求频率限制

### 7.4 可用性要求

- 系统可用性 > 99.5%
- 数据备份：每日备份
- 日志记录：操作日志、错误日志

---

## 八、项目规划

### 8.1 开发阶段

| 阶段 | 内容 |
|------|------|
| 第一阶段 | 基础框架搭建、数据库设计、Leafer.js渲染引擎封装 |
| 第二阶段 | B端模板编辑器开发、素材管理 |
| 第三阶段 | C端海报生成接口、小程序/H5 SDK |
| 第四阶段 | 数据统计、系统管理、测试优化 |

### 8.2 技术风险

| 风险 | 应对方案 |
|------|----------|
| Leafer.js小程序兼容性 | 提前进行技术验证，准备降级方案 |
| 复杂海报生成性能 | 异步生成 + 进度回调 |
| 大量图片存储成本 | CDN加速 + 定期清理临时文件 |

---

## 九、附录

### 9.1 参考资料
- Leafer.js 官方文档: https://www.leaferjs.com/
- 小程序 canvas 文档: https://developers.weixin.qq.com/miniprogram/dev/api/canvas/

### 9.2 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2024-12-29 | 初始版本 |
