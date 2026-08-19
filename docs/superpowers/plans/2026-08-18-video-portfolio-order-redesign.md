# Video Portfolio and Order Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the IT portfolio visual direction into the complete video workflow demo while implementing the approved service catalog, conditional order form, pricing summary, and creator availability rules.

**Architecture:** Keep the existing React/Vite single application and role navigation. Introduce one service catalog plus pure rule helpers as the source of truth, then make the portfolio and order form consume those rules. Preserve existing task workflow pages with compatibility fields instead of rebuilding unrelated screens.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, Motion, Lucide React, Node test runner through `tsx`.

**Spec:** `docs/superpowers/specs/2026-08-18-video-portfolio-order-redesign.md`

## Global Constraints

- Work only inside `videomaking-demo`; never edit the original ZIP files.
- Keep the existing operator, video creator, and manager navigation and task flow.
- Use the approved service order and official names from the spec.
- Use static images and mark invented performance figures as demo data for the latest 30 days.
- Do not deploy or add real backend integrations.
- Do not add a direct order action inside work preview modals or creator cards.
- Keep the portfolio dark with one lime accent; keep workflow forms light and high contrast.

---

### Task 1: Test Harness and Service Rule Contract

**Files:**
- Modify: `package.json`
- Create: `tests/serviceRules.test.ts`
- Create: `src/data/serviceCatalog.ts`
- Create: `src/utils/serviceRules.ts`

**Interfaces:**
- Produces: `SERVICE_CATALOG`, `getServiceById`, `calculateBasePrice`, `calculateUrgentPrice`, `getPersonnelLoad`, and `supportsService`.
- Consumes: no earlier task interfaces.

- [ ] **Step 1: Add the test command and write failing rule tests**

Add `"test": "tsx --test tests/**/*.test.ts"` to `package.json`. Create tests that import the planned rule helpers and assert:

```ts
assert.deepEqual(SERVICE_CATALOG.map((item) => item.name), [
  '产品 AI 展示视频',
  '产品实拍展示视频',
  '社媒 UGC 广告',
  '产品 AI 精品广告',
  '产品安装视频',
  '纯剪辑任务',
  '定制 / 专项需求',
]);
assert.equal(calculateBasePrice({ serviceId: 'ai_showcase', tierId: 'standard', formatId: 'dual', quantity: 1 }), 120);
assert.equal(calculateBasePrice({ serviceId: 'ugc', packageId: 'triple', addLandscape: true, quantity: 1 }), 180);
assert.equal(calculateBasePrice({ serviceId: 'editing', editingMode: 'basic', outputVersionCount: 3 }), 15);
assert.equal(calculateUrgentPrice(120), 144);
assert.equal(getPersonnelLoad(20).label, '爆满');
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test`

Expected: FAIL because `serviceCatalog.ts` and `serviceRules.ts` do not exist.

- [ ] **Step 3: Implement the catalog and minimal pure rules**

Define exact service IDs, official names, order, tiers, format constraints, duration labels, prices, and conditional field groups. Implement formula branches only for approved cases and return `null` for custom quotes.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test`

Expected: all service rule tests pass with zero failures.

- [ ] **Step 5: Commit the rule layer**

```bash
git add videomaking-demo/package.json videomaking-demo/tests videomaking-demo/src/data/serviceCatalog.ts videomaking-demo/src/utils/serviceRules.ts
git commit -m "feat: add video service and pricing rules"
```

---

### Task 2: Personnel and Task Type Compatibility

**Files:**
- Modify: `src/types.ts`
- Modify: `src/data/mockData.ts`
- Modify: `src/App.tsx`
- Modify: `tests/serviceRules.test.ts`

**Interfaces:**
- Consumes: `getPersonnelLoad` and official service IDs from Task 1.
- Produces: personnel records with a capacity of 20, varied current counts, and supported service IDs; task records that can store service option and price summary fields.

- [ ] **Step 1: Add failing personnel coverage**

Add assertions for counts 0, 5, 6, 10, 11, 19, and 20. Add a supported-type assertion showing that a creator assigned to AI and UGC is rejected for installation work.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- --test-name-pattern="personnel"`

Expected: FAIL until all four load states and support checks are implemented.

- [ ] **Step 3: Extend types and normalize mock personnel**

Replace old `idle | busy | full` display assumptions with computed load state. Keep `currentTasks` internal, set `maxTasks` to 20, distribute demo counts across 3, 8, 14, 18, and 20, and assign every standard service to at least two available creators.

- [ ] **Step 4: Add backward-compatible task fields**

Add optional task properties for intended uses, service tier, output format, quantity, base price, urgent approved price, and service-specific details. Keep the existing status and node properties unchanged.

- [ ] **Step 5: Verify tests and TypeScript**

Run: `npm test`

Run: `npm run lint`

Expected: both commands exit 0.

- [ ] **Step 6: Commit compatibility changes**

```bash
git add videomaking-demo/src/types.ts videomaking-demo/src/data/mockData.ts videomaking-demo/src/App.tsx videomaking-demo/tests/serviceRules.test.ts
git commit -m "feat: align creator capacity and task metadata"
```

---

### Task 3: Portfolio Data and Visual Merge

**Files:**
- Modify: `src/data/portfolioData.ts`
- Rewrite: `src/components/PortfolioView.tsx`
- Modify: `src/index.css`
- Create: `tests/portfolioData.test.ts`

**Interfaces:**
- Consumes: official service IDs and names from Task 1 plus personnel data from Task 2.
- Produces: three popular works, nine AI tier works, UGC placeholders, ordered portfolio sections, work-to-creator links, and an accessible media modal.

- [ ] **Step 1: Write failing portfolio data tests**

Assert exactly three popular works, three AI tiers with three works each, correct category order, 9:16 UGC metadata, and one representative work ID for every displayed creator.

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- --test-name-pattern="portfolio"`

Expected: FAIL because the old dataset has no UGC category, no popular metrics, and no AI tier split.

- [ ] **Step 3: Replace the portfolio dataset**

Reuse current static image URLs, add organic demo values such as `128.6 万` plays and `18.4%` attributed sales growth, and label each metric `最近 30 天 / 演示数据`.

- [ ] **Step 4: Rewrite the portfolio view**

Implement the approved hero copy and two CTAs, an asymmetric popular-work layout, ordered work sections, AI tier tabs, vertical UGC cards, service-price section, creator work links, and bottom custom entry. Remove work-level order actions and creator order buttons.

- [ ] **Step 5: Implement modal behavior**

Use a dialog with an overlay click handler, close button, document-level Escape handler with cleanup, and media reset on close. Render the static cover with a pending-video state when `videoUrl` is absent.

- [ ] **Step 6: Apply portfolio-only visual tokens**

Use a charcoal theme, lime accent, 14-16px card radii, explicit mobile single-column fallbacks, and reduced-motion CSS. Keep global dashboard styles intact.

- [ ] **Step 7: Verify data tests, TypeScript, and build**

Run: `npm test`

Run: `npm run lint`

Run: `npm run build`

Expected: all commands exit 0.

- [ ] **Step 8: Commit the portfolio merge**

```bash
git add videomaking-demo/src/data/portfolioData.ts videomaking-demo/src/components/PortfolioView.tsx videomaking-demo/src/index.css videomaking-demo/tests/portfolioData.test.ts
git commit -m "feat: merge portfolio visual experience"
```

---

### Task 4: Four-Stage Conditional Order Form

**Files:**
- Rewrite: `src/views/OrderCreateView.tsx`
- Modify: `src/types.ts`
- Modify: `src/App.tsx`
- Create: `tests/orderFormRules.test.ts`

**Interfaces:**
- Consumes: `SERVICE_CATALOG`, pricing helpers, personnel load helpers, and supported-service rules.
- Produces: a four-stage same-page form and a task submission payload containing the selected service configuration and price summary.

- [ ] **Step 1: Write failing form-rule tests**

Assert the sample states are exactly `待寄送`, `寄送中`, and `已到样`; installation has fixed `16:9` and workflow-based duration; UGC defaults to `9:16` and 15-30 seconds; switching from multi-SKU to a single-SKU type retains only the first SKU; and custom work returns no numeric quote.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- --test-name-pattern="order form"`

Expected: FAIL because conditional form rules and type-switch normalization are not implemented.

- [ ] **Step 3: Implement four visible stages**

Build compact numbered navigation using the stage names themselves: 选择视频类型, 填写产品和素材, 选择专属规格, 选择制作人并确认价格. Keep all stages on one page and scroll the selected stage into view without route changes.

- [ ] **Step 4: Implement service-specific fields**

Render only fields defined by the selected service. Separate editing output version count from completed video quantity. Allow multiple SKU rows only for AI premium ads. Require an expected completion date only when urgent is enabled.

- [ ] **Step 5: Implement type-switch confirmation**

When service-specific content exists, show a confirmation dialog listing the values that will reset. Preserve intended uses and compatible product information, clear the creator, tier, quantity, service-specific details, and quote state.

- [ ] **Step 6: Implement creator filtering and portfolio links**

Filter by `supportedTypeIds`, compute status from current count, disable creators at 20, and link each creator to the corresponding work in the portfolio.

- [ ] **Step 7: Implement the fee summary and submit validation**

Show type, tier, output format, package or quantity, creator, queue status, base price, and approved urgent price. Display the no-payment disclaimer. Use inline validation and submit the extended task payload through the existing `onSubmitTask` callback.

- [ ] **Step 8: Verify tests, TypeScript, and build**

Run: `npm test`

Run: `npm run lint`

Run: `npm run build`

Expected: all commands exit 0.

- [ ] **Step 9: Commit the order form**

```bash
git add videomaking-demo/src/views/OrderCreateView.tsx videomaking-demo/src/types.ts videomaking-demo/src/App.tsx videomaking-demo/tests/orderFormRules.test.ts
git commit -m "feat: rebuild conditional video order form"
```

---

### Task 5: Workflow Regression and Copy Audit

**Files:**
- Modify when required by type compatibility: `src/components/TaskDetailDrawer.tsx`
- Modify when required by type compatibility: `src/views/OperatorOrdersView.tsx`
- Modify when required by type compatibility: `src/views/VideoTasksView.tsx`
- Modify when required by type compatibility: `src/views/ManagerApprovalView.tsx`

**Interfaces:**
- Consumes: extended task fields from Task 4.
- Produces: unchanged workflow behavior with readable new-service metadata.

- [ ] **Step 1: Run all automated checks**

Run: `npm test`

Run: `npm run lint`

Run: `npm run build`

Expected: all commands exit 0.

- [ ] **Step 2: Fix only compatibility regressions**

Update old labels or optional-field rendering only where a compiler error or observed workflow regression requires it. Do not redesign manager or task table pages.

- [ ] **Step 3: Audit visible copy**

Search for retired names and old logic:

```bash
rg -n "社媒UGC视频|复杂产品版|定制创意版|制作风格定位|简单视频风格|精细化设计|AI设计|满载|直接提交视频需求" src
```

Expected: no retired visible copy remains in the updated portfolio and order surfaces.

- [ ] **Step 4: Commit compatibility fixes**

```bash
git add videomaking-demo/src
git commit -m "fix: keep workflow screens compatible with service redesign"
```

---

### Task 6: Browser and Final Verification

**Files:**
- Modify only if verification reveals defects: files changed in Tasks 1-5.

**Interfaces:**
- Consumes: complete application.
- Produces: verified local Demo without deployment.

- [ ] **Step 1: Start the local server**

Run: `npm run dev`

Expected: Vite reports a local URL and remains running.

- [ ] **Step 2: Inspect desktop paths**

Verify portfolio hero, popular works, AI tier tabs, UGC ratio, modal close paths, creator work links, all seven service choices, type-switch warning, creator filtering, price summary, urgent pricing, successful normal submission, and successful urgent submission.

- [ ] **Step 3: Inspect mobile layouts**

Verify the portfolio collapses to one column, buttons stay on one line where practical, UGC cards remain vertical, form fields do not overflow, dialogs fit the viewport, and navigation remains usable.

- [ ] **Step 4: Run the frontend pre-flight audit**

Confirm single accent color, consistent radii, CTA contrast, form contrast, reduced motion support, no broken images, no work-modal order button, no creator order button, no visible em dash, and no uncontrolled scroll animation listener.

- [ ] **Step 5: Run fresh final commands**

Run: `npm test`

Run: `npm run lint`

Run: `npm run build`

Run: `git status --short`

Expected: tests have zero failures, TypeScript exits 0, build exits 0, and only intentional changes are present.

- [ ] **Step 6: Commit final verification fixes if any**

```bash
git add videomaking-demo
git commit -m "fix: polish video portfolio and order demo"
```
