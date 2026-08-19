# HOOYA 视频任务管理 V1 原型

公司内部 ERP 风格的视频服务作品集与下单流程原型。包含运营下单与终审、视频人员接单制作、视频主管加急审核与成片初审。

当前使用本地模拟商品、订单、人员与作品数据；刷新页面会重置，不包含量子系统接口。

## Google AI Studio

仓库根目录已经是可直接运行的 Vite 项目。导入 GitHub 项目后使用默认 Node 环境即可：

```bash
npm install
npm run dev
```

无需配置环境变量。作品视频使用外部演示链接，正式素材后续可在 `src/data/portfolioData.ts` 替换。

## 本地运行

需要 Node.js 22 或更高版本。

```bash
npm install
npm run dev
```

然后在当前电脑打开：<http://127.0.0.1:3000/>

该地址是本地开发预览，不是已部署的公网链接。关闭开发服务后，链接将无法访问。

## 验证

```bash
npm test
npm run lint
npm run build
```
