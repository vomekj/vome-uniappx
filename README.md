# Vome UniApp X（蒸汽模式）

基于 **uni-app x 蒸汽模式** 的多端 C 端模版（Android / iOS / 鸿蒙 / Web / 微信小程序）。  
与经典 [vome-uniapp](https://gitee.com/vomekj/vome-uniapp)（Vite CLI + tt-shaduni）**并存**，工程结构按官方 HBuilder 扁平布局。

> 官方文档：https://doc.dcloud.net.cn/uni-app-x/  
> 开源仓：[Gitee](https://gitee.com/vomekj/vome-uniappx) · [GitHub](https://github.com/vomekj/vome-uniappx)

```bash
git clone https://gitee.com/vomekj/vome-uniappx.git
cd vome-uniappx && bun install
```

## Cursor 里能不能像 `uniapp` 一样启动？

**能启动，但前置不同：**

| | 经典 `uniapp/` | 本目录 `uniappx/` |
|--|----------------|-------------------|
| Cursor 命令 | `bun run dev:h5` | `bun run dev` |
| 实际引擎 | npm 包 `@dcloudio/vite-plugin-uni` | **本机 HBuilderX cli** → `launch web`（底层仍是 Vite） |
| 只要 bun？ | 是 | **否**，须已安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html) / HBuilderV |
| App 蒸汽 | 无 | 真机仍走 HX 基座 |

官方 **没有** 给 uni-app x 提供与经典模版等价的独立 npm Vite 脚手架；Web 的 Vite 编译器在 HX 里。  
Cursor 终端通过 cli 调 HX，体验上接近「一条命令启动」。

## 快速开始（Cursor）

```bash
cd uniappx
bun install
# 首次：指定本机 HX（macOS 示例）
export HBUILDERX_PATH="/Applications/HBuilderX.app"
# 可选：HX_BROWSER=Chrome|Safari|Edge|Built
bun run dev                 # 运行 Web
# bun run build             # 发行 H5 → unpackage/
# bun run build:mp-weixin
# bun run build:app-android
# bun run build:app-ios
```

未装 HX 时脚本会打印说明。发行走 HX `cli publish`，不是经典 `uni build`。

### 也可用 IDE

1. HBuilder / HBuilderV 打开本目录  
2. 确认圆形 U + `manifest` 蒸汽  
3. 运行 → 浏览器 / 微信开发者工具 / 真机基座  

## Service 联调

编辑 `config/dev.ts` / `prod.ts`：

- `host` / `baseUrl` 指向可访问的 Vome Service
- **真机 / 小程序不要用 `127.0.0.1`**（改为局域网 IP 或域名）
- 小程序需配置合法 request 域名

EPS：`api/client.ts` → `createEps({ side: 'app' })`，语种 `scopeKey: 'uniappx'`。

## 目录要点

```
uniappx/
  manifest.json     # uni-app-x + vapor
  pages.json
  main.ts / App.vue
  pages/**/*.vue
  components/vm-*.vue
  stores/ api/ config/ locales/
  scripts/hx-run.ts # 可选 HX cli
```

## 与经典 uniapp 差异（摘要）

- 页面 `.vue`（组合式）；蒸汽只写 setup，不用选项式
- App CSS 为 ucss 子集：flex 默认竖向、文字必须在 `<text>`、页面滚动用 `scroll-view`
- 无 tt-shaduni / nativeplugins；扩展用 `uni_modules` / uts
- 壳组件：`vm-header` / `vm-tabbar` / `vm-aside` / …；`vm-ri-icon` 用 Remix 本地 ttf（`bun run gen:icons`）
- 详见 skill 与 `docs/vomekj/uniappx/`
