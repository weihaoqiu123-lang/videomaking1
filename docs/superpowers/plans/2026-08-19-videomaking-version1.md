# 视频制作服务第一版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付可导入 Google AI Studio 的 ERP 风格视频制作服务第一版，并完成运营、视频人员和视频负责人的完整任务闭环。

**Architecture:** 继续使用 React、TypeScript、Vite 和本地模拟数据。服务、产品和作品数据保持为集中配置；纯业务状态转换放入可测试的工具函数；三个角色页面只调用这些规则并展示相应动作。

**Tech Stack:** React 19、TypeScript 5.8、Vite 6、Tailwind CSS 4、Node test runner。

**Spec:** `docs/superpowers/specs/2026-08-19-videomaking-version1-design.md`

## Global Constraints

- 服务名称以规格文件为唯一口径。
- 仓库根目录必须可以直接执行 `npm install && npm run build`。
- 不新增后端、数据库、路由库或状态管理依赖。
- 所有订单先排队，纯剪辑由视频人员确认后直接进入剪辑。
- 取消采用软取消并保留日志。
- 作品集只使用 ERP 风格链接页面。
- 视频任务总览与监控入口从第一版移除。

---

### Task 1: 服务目录、比例和商品搜索

**Files:**
- Create: `src/data/productCatalog.ts`
- Modify: `src/data/serviceCatalog.ts`
- Modify: `src/data/orderFormConfig.ts`
- Modify: `src/utils/serviceRules.ts`
- Test: `tests/serviceRules.test.ts`
- Test: `tests/orderFormRules.test.ts`

**Interfaces:**
- Produces: `searchProducts(query: string): ProductRecord[]`
- Produces: `getProductBySku(sku: string): ProductRecord | undefined`
- Produces: five standard `ServiceDefinition` records plus `custom`
- Produces: AI and UGC dual-format multiplier of 1.5

- [ ] **Step 1: Write failing catalog tests**

Add literal assertions that the service order is AI、实拍、UGC、安装、纯剪辑、定制，that `ai_premium` is absent, installation only has landscape, editing only has landscape/portrait/dual, and custom has landscape/portrait/dual.

- [ ] **Step 2: Run catalog tests and verify RED**

Run: `npm test -- tests/serviceRules.test.ts tests/orderFormRules.test.ts`

Expected: failures caused by the premium service and old format arrays.

- [ ] **Step 3: Implement catalog and product search**

Create a typed local product catalog containing the existing six realistic SKU records. Make search case-insensitive across SKU and product name. Update AI material title to `商品与摄影资料`, rename the optional URL field copy to `摄影原图地址`, and change custom/AI duration options to the approved choices.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- tests/serviceRules.test.ts tests/orderFormRules.test.ts`

Expected: all focused tests pass.

### Task 2: Task state machine

**Files:**
- Modify: `src/types.ts`
- Modify: `src/utils/taskUtils.ts`
- Test: `tests/taskWorkflow.test.ts`

**Interfaces:**
- Produces: `canOperatorCancel(task: Pick<TaskItem, 'currentNode'>): boolean`
- Produces: `getProductionStartNode(serviceId: ServiceId): NodeStage`
- Produces: `getEffectiveTaskAmount(task: Pick<TaskItem, 'basePrice' | 'urgentApprovedPrice' | 'urgencyStatus'>): number | null`
- Produces nodes: `queued`, `manager_review`, `ready_for_operator_review`, `operator_review`, `returned`, `revision`, `finished`, `cancelled`

- [ ] **Step 1: Write failing workflow tests**

Cover: every non-urgent order starts queued; urgent starts pending urgency and then queued; editing starts editing only after acceptance; cancellation is allowed only in pending urgency/queued; manager approval leads to ready-for-operator; operator rejection leads to returned; revision resubmits to manager review; operator approval finishes; amount uses urgent price only after urgency approval.

- [ ] **Step 2: Run workflow tests and verify RED**

Run: `npm test -- tests/taskWorkflow.test.ts`

Expected: failures for missing states and transition helpers.

- [ ] **Step 3: Implement the minimal state model**

Extend `MainStatus`, `NodeStage`, `NodeData`, and task helpers. Keep task ordering independent from workflow state. Return user-facing Chinese labels from the existing badge helpers.

- [ ] **Step 4: Run workflow tests and verify GREEN**

Run: `npm test -- tests/taskWorkflow.test.ts`

Expected: all workflow tests pass.

### Task 3: Latest order form behavior

**Files:**
- Modify: `src/views/OrderCreateView.tsx`
- Modify: `src/data/mockData.ts`
- Test: `tests/orderEntry.test.tsx`
- Test: `tests/orderFormRules.test.ts`

**Interfaces:**
- Consumes: `searchProducts`, service format config, `getInitialNodeForService`
- Produces: empty order form with local SKU results and approved task payload

- [ ] **Step 1: Write failing order form tests**

Assert: premium is absent; AI shows required product link and SKU search; selecting a product result supplies name/category/image/link; photography-original URL is optional; non-urgent custom has no date; urgent shows date and optional explanation; AI custom duration offers 30/60; output format follows approved rules.

- [ ] **Step 2: Run order tests and verify RED**

Run: `npm test -- tests/orderEntry.test.tsx tests/orderFormRules.test.ts`

Expected: failures for old fields, old date visibility and missing search behavior.

- [ ] **Step 3: Implement the order changes**

Preserve the four-section UI. Add SKU suggestions under the SKU input, auto-fill product data, validate required AI fields, store `urgencyReason`, submit every order into the queue model, and keep base/urgent prices in the summary.

- [ ] **Step 4: Run order tests and verify GREEN**

Run: `npm test -- tests/orderEntry.test.tsx tests/orderFormRules.test.ts`

Expected: focused tests pass.

### Task 4: Three-role workflow screens

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/views/OperatorOrdersView.tsx`
- Modify: `src/views/VideoTasksView.tsx`
- Modify: `src/views/ManagerApprovalView.tsx`
- Modify: `src/components/StatusBadge.tsx`
- Modify: `src/components/TaskDetailDrawer.tsx`
- Test: `tests/taskWorkflow.test.ts`

**Interfaces:**
- Produces callbacks: cancel task, accept queued task, manager initial review, creator push to operator, operator final review, start revision, resubmit revision

- [ ] **Step 1: Add failing integration-level workflow assertions**

Add reducer/helper tests for the exact state/log changes of every action, including required operator rejection reason and approved urgency display.

- [ ] **Step 2: Run workflow tests and verify RED**

Run: `npm test -- tests/taskWorkflow.test.ts`

Expected: failures for missing action handlers.

- [ ] **Step 3: Implement role actions**

Update App handlers as the single owner of task mutations. Operator page gets cancel and final-review actions. Video page gets accept, submit initial review, push to operator, start revision and resubmit. Manager page is renamed to initial review, adds task amount, and shows date before urgency reason.

- [ ] **Step 4: Run workflow tests and verify GREEN**

Run: `npm test -- tests/taskWorkflow.test.ts`

Expected: workflow tests pass.

### Task 5: ERP portfolio links and navigation scope

**Files:**
- Modify: `src/data/portfolioData.ts`
- Replace: `src/components/PortfolioView.tsx`
- Modify: `src/components/Navigation.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Test: `tests/portfolioData.test.ts`
- Test: `tests/portfolioView.test.tsx`

**Interfaces:**
- Produces: three `PortfolioGroup` records
- Produces: external video links for works and representative member links
- Removes: navigable `manager_overview` route from first-version UI

- [ ] **Step 1: Write failing portfolio tests**

Assert three group names and exact child types, external links on every available work/member/representative work, absence of marketing hero text and modal controls, presence of ERP title and create-demand buttons, and absence of the manager overview navigation label.

- [ ] **Step 2: Run portfolio tests and verify RED**

Run: `npm test -- tests/portfolioData.test.ts tests/portfolioView.test.tsx`

Expected: failures because the current page is a marketing portfolio.

- [ ] **Step 3: Implement the ERP portfolio**

Use the existing enterprise header colors, max-width container, white surfaces, restrained blue accent, consistent 12px radius and static hover/focus feedback. Do not add animation or another component library. Keep responsive single-column behavior under 768px.

- [ ] **Step 4: Run portfolio tests and verify GREEN**

Run: `npm test -- tests/portfolioData.test.ts tests/portfolioView.test.tsx`

Expected: portfolio tests pass.

### Task 6: Mock data migration and full regression

**Files:**
- Modify: `src/data/mockData.ts`
- Modify: `README.md`
- Modify: `GITHUB_IMPORT.md`
- Test: all files in `tests/`

**Interfaces:**
- Produces: mock tasks covering queued, manager review, operator review, returned and finished states without premium service references

- [ ] **Step 1: Add failing mock consistency assertions**

Verify every mock service ID exists, every personnel supported type exists, every task node has a known label, every portfolio link is non-empty or explicitly marked pending, and no premium string remains in user-facing data.

- [ ] **Step 2: Run full tests and verify RED**

Run: `npm test`

Expected: failures identify remaining stale mock records or copy.

- [ ] **Step 3: Migrate mock data and documentation**

Replace the premium mock task with an operator-review example, remove premium personnel specialties, document local-data reset behavior, and add Google AI Studio import/run instructions.

- [ ] **Step 4: Run complete verification**

Run: `npm test`

Run: `npm run lint`

Run: `npm run build`

Expected: all commands exit 0 with no test failures or TypeScript errors.

### Task 7: Publish independent GitHub project

**Files:**
- Verify: repository root and `.gitignore`

**Interfaces:**
- Produces: public or private GitHub repository `weihaoqiu123-lang/videomakingversion1`
- Produces: default branch `main`

- [ ] **Step 1: Inspect final scope**

Run: `git status -sb`

Run: `git diff --stat`

Confirm only first-version project files are present and no generated `dist` or `node_modules` directories are tracked.

- [ ] **Step 2: Commit intentionally**

Stage the complete new repository and commit with message `feat: deliver videomaking version 1`.

- [ ] **Step 3: Create the GitHub repository**

Use authenticated GitHub tooling to create `videomakingversion1` under `weihaoqiu123-lang`, set the new remote, rename the local branch to `main`, and push with upstream tracking.

- [ ] **Step 4: Verify the remote state**

Run: `git status -sb`

Run: `git ls-remote --heads origin main`

Confirm local HEAD matches the remote main commit and report the repository URL.
