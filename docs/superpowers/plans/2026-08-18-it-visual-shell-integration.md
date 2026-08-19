# 业务组原始视觉融合 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将业务组 IT 交付页的完整视觉外壳移植到量子系统 Demo，并保持已经实现的作品集和四阶段下单业务逻辑。

**Architecture:** 保留现有 Vite/React 单页应用和应用状态，只重建 `PortfolioView` 的展示结构并统一 `OrderCreateView` 的视觉。作品、服务、价格、制作人和预选类型继续从现有数据模块读取；原 IT 包的本地静态资源复制到当前项目 `public/portfolio`，不依赖解压目录。

**Tech Stack:** React 19、TypeScript、Vite 6、Motion、原生 CSS、Node test runner、React DOM server rendering

**Spec:** `docs/superpowers/specs/2026-08-18-it-visual-shell-integration.md`

## Global Constraints

- 服务顺序固定为产品 AI 展示视频、产品实拍展示视频、社媒 UGC 广告、产品 AI 精品广告、产品安装视频、纯剪辑任务、定制 / 专项需求。
- AI 档位固定为标准版、创意版、定制版。
- 不恢复“参考此作品下单”“由 TA 制作”等已废弃入口。
- 制作人区域只展示状态和代表作品；真正选择制作人仍在下单页。
- 不改价格计算、加急规则、服务专属字段、制作人联动和订单状态逻辑。
- 量子系统 Header 保留，作品集内部使用业务组视觉导航。
- 缺少正式 GIF/视频素材时继续使用静态图片；Hero 视频失败时必须有本地静态封面。
- 不增加新的前端依赖。

---

### Task 1: Hero 与作品集视觉外壳

**Files:**
- Create: `public/portfolio/showreel/still-01.webp` 至 `still-21.webp`
- Create: `tests/portfolioView.test.tsx`
- Modify: `src/components/PortfolioView.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `popularWorks`, `portfolioSections`, `findPortfolioWork`, `onNavigateToOrderCreate(serviceId)`
- Produces: 带本地静态降级图的全屏媒体 Hero、近期热门区、三轨作品流、按最终顺序展示的作品分类

- [ ] **Step 1: 写失败的真实渲染测试**

```tsx
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PortfolioView } from '../src/components/PortfolioView';

test('portfolio renders the IT media hero and approved entry points', () => {
  const html = renderToStaticMarkup(<PortfolioView onNavigateToOrderCreate={() => undefined} />);
  assert.match(html, /<video/);
  assert.match(html, /\/portfolio\/showreel\/still-01.webp/);
  assert.match(html, /HOOYA 视频制作服务页/);
  assert.match(html, /进入下单系统/);
});
```

- [ ] **Step 2: 运行测试并确认因为当前 Hero 没有视频而失败**

Run: `npm test -- tests/portfolioView.test.tsx`
Expected: FAIL，缺少 `<video>` 或本地 `still-01.webp`。

- [ ] **Step 3: 复制 IT 包本地作品帧**

从 `../video-portfolio-it-reference-clean/public/showreel` 复制 21 个 WebP 到 `public/portfolio/showreel`，保持文件内容与名称不变。

- [ ] **Step 4: 用原 IT 构图重建 Hero 和作品展示结构**

```tsx
<section className="hero" id="top" aria-labelledby="portfolio-hero-title">
  <div className="hero-media" aria-hidden="true">
    <img className="hero-fallback" src="/portfolio/showreel/still-01.webp" alt="" />
    <video ref={heroVideoRef} className="hero-video" autoPlay muted loop playsInline poster="/portfolio/showreel/still-01.webp">
      <source src={HERO_VIDEO_URL} type="video/mp4" />
    </video>
    <div className="hero-media-tint" />
  </div>
  <header className="portfolio-topbar">...</header>
  <div className="hero-copy">
    <h1 id="portfolio-hero-title">HOOYA<br /><em>视频制作服务页</em></h1>
  </div>
</section>
```

使用 `portfolioSections` 生成分类；产品 AI 展示视频继续根据 `activeAiTier` 切换作品，UGC 卡片保留 9:16。作品卡片只调用 `setActiveWork`，分类按钮调用 `onNavigateToOrderCreate(section.serviceId)`。

- [ ] **Step 5: 将原 IT 页面 Hero、marquee、category 样式限定到 `.portfolio-root`**

复用当前 `src/index.css` 中已经存在的 `.portfolio-root` 视觉规则，移除/停用 `.pv2-hero-orbit` 构图，补齐视频、三轨作品流、热门指标和移动端规则。循环动效在 `prefers-reduced-motion` 下关闭。

- [ ] **Step 6: 运行测试确保通过**

Run: `npm test -- tests/portfolioView.test.tsx`
Expected: PASS。

- [ ] **Step 7: 提交 Task 1**

```bash
git add public/portfolio/showreel tests/portfolioView.test.tsx src/components/PortfolioView.tsx src/index.css
git commit -m "feat: restore IT portfolio hero and work layout"
```

### Task 2: 服务价格、制作人轨道与弹窗

**Files:**
- Modify: `tests/portfolioView.test.tsx`
- Modify: `src/components/PortfolioView.tsx`
- Modify: `src/data/portfolioData.ts`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `SERVICE_CATALOG`, `AI_SHOWCASE_TIERS`, `portfolioMembers`, `findPortfolioWork`, `getPersonnelLoad`
- Produces: 浅色服务价格区、AI 三档重点卡、五张标准服务卡、定制横向卡、插画制作人横向轨道、现有作品弹窗

- [ ] **Step 1: 扩展失败的渲染测试**

```tsx
test('portfolio renders the approved pricing and presentation-only team', () => {
  const html = renderToStaticMarkup(<PortfolioView onNavigateToOrderCreate={() => undefined} />);
  assert.ok(html.indexOf('产品 AI 展示视频') < html.indexOf('产品实拍展示视频'));
  assert.match(html, /标准版/);
  assert.match(html, /创意版/);
  assert.match(html, /定制版/);
  assert.match(html, /制作团队与排队状态/);
  assert.doesNotMatch(html, /由TA制作|参考此作品下单/);
});
```

- [ ] **Step 2: 运行测试并确认新团队标题/结构尚未满足**

Run: `npm test -- tests/portfolioView.test.tsx`
Expected: FAIL，缺少新的原视觉服务和团队结构标记。

- [ ] **Step 3: 实现服务价格布局**

第一个服务使用 `AI_SHOWCASE_TIERS` 渲染三个价格档；`SERVICE_CATALOG.slice(1, 6)` 渲染紧凑卡；`custom` 渲染底部横向卡。所有按钮调用对应 `ServiceId`，不写旧 `legacyId`。

- [ ] **Step 4: 实现插画制作人横向轨道**

成员插画使用稳定的 DiceBear notionists URL，并保持真实姓名、能力、任务数和代表作品映射。左右按钮对 `memberRailRef.current.scrollBy({ left: ±360, behavior: 'smooth' })`；代表作品按钮只调用 `openMemberWork`。

- [ ] **Step 5: 保持现有弹窗行为**

继续使用 `WorkModal`，保留 Esc、遮罩、关闭按钮、关闭后暂停和重置视频、作品名称/类型/档位/制作人/时长；弹窗中不增加下单按钮。

- [ ] **Step 6: 运行作品集与业务规则测试**

Run: `npm test`
Expected: 现有 19 项和新增渲染测试全部 PASS。

- [ ] **Step 7: 提交 Task 2**

```bash
git add tests/portfolioView.test.tsx src/components/PortfolioView.tsx src/data/portfolioData.ts src/index.css
git commit -m "feat: restore IT pricing and creator presentation"
```

### Task 3: 下单页面视觉统一与端到端验收

**Files:**
- Modify: `src/index.css`
- Modify: `src/views/OrderCreateView.tsx`（仅在需要增加语义容器类名时）
- Modify: `README.md`

**Interfaces:**
- Consumes: 现有 `OrderCreateView` 状态、价格和提交逻辑
- Produces: 与业务组作品集一致的纸张浅色、黑色摘要、荧光绿操作和编辑式标题视觉；可访问的本地预览说明

- [ ] **Step 1: 运行完整基线测试**

Run: `npm test`
Expected: 全部 PASS；如失败则停止，不把视觉修改与业务回归混合处理。

- [ ] **Step 2: 统一下单页面设计令牌和结构层级**

保持现有 JSX 行为，仅调整 `.order2-*`：更大的标题、原 IT 纸张背景、22px 服务卡圆角、荧光绿选中态、黑色费用摘要、与作品集一致的按钮反馈。移动端在 700px 下单列显示，sticky 摘要改为普通流布局。

- [ ] **Step 3: 更新本地运行说明**

README 明确 `npm install`、`npm run dev`、`http://127.0.0.1:3000/`，并说明本地地址不是部署链接。

- [ ] **Step 4: 运行自动验证**

Run: `npm test && npm run lint && npm run build`
Expected: 测试 0 fail、TypeScript 0 error、Vite build exit 0。

- [ ] **Step 5: 运行桌面与移动视觉验收**

启动本地服务器，分别在 1440×900 和 390×844 截图。确认：全屏媒体 Hero、无同心圆、深色作品区、浅色服务区、插画成员横轨、四阶段下单页、移动端无阻塞性横向溢出。

- [ ] **Step 6: 检查差异和提交**

Run: `git diff --check && git status --short`
Expected: 无空白错误；只包含计划内文件和已复制资产。

```bash
git add src/index.css src/views/OrderCreateView.tsx README.md
git commit -m "feat: align order page with IT visual language"
```
