# GitHub / Google AI Studio 导入说明

这是已合并修复的完整项目，不需要手工替换单个文件。

## 已处理
- Portfolio Hero 使用本地 `/public/videos/portfolio-hero.mp4` 动态背景。
- Hero 视频失败时使用 `/public/showreel/hero-fallback.webp`，避免纯黑。
- 代表作品改为静态三列 Grid，桌面内容宽度约 1120px，封面统一 4:3。
- 代表作品不再使用整屏自动横向 Marquee，不再使用外部 GIF。
- 保留 Codex 业务版的服务方案、选型指南、制作团队、运营评价等后续模块。
- 保留现有创建视频需求、我的视频订单、视频人员待办、视频负责人待办/总览逻辑。

## 上传 GitHub
GitHub 网页不会自动解压 ZIP。请先解压本 ZIP，然后将解压后的所有文件/文件夹上传到仓库根目录。

仓库根目录应直接看到：
- `package.json`
- `src/`
- `public/`
- `vite.config.ts`
- `index.html`

不要把整个项目再套一层文件夹后上传。

## Google AI Studio
在 Build 中选择 Import from GitHub，选择该仓库即可。
