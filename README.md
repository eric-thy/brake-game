# 极限刹车挑战 · 离线网页版

原站 <https://brake.tp0k.us/> 的离线副本，纯静态文件，直接托管在 GitHub Pages 上。

- 3D 场景、车辆物理、音效、玩法逻辑均来自原站，未作修改
- 排行榜改为浏览器本地存储（`localStorage`），每个人的榜单只在自己的浏览器里，互不相通
- 计分公式沿用原版：`得分 = round(初速度² ÷ 刹停用时)`

## 文件

| 文件 | 说明 |
| --- | --- |
| `index.html` | 页面入口 |
| `assets/index-BMfj2Faj.js` | 主程序（three.js r186 + 游戏逻辑） |
| `assets/index-D0EtOSyi.css` | 样式表 |
| `offline-api.js` | 排行榜离线替身，拦截 `/api/leaderboard` 与 `/api/score` |
| `deploy.ps1` | 把这个目录推到 GitHub 并提示如何开启 Pages |

## 本地预览

```powershell
python -m http.server 8000
# 打开 http://127.0.0.1:8000/
```

## 部署

```powershell
.\deploy.ps1 -User wdnmd6969 -Repo brake-game
```

然后在仓库的 Settings → Pages 里把 Source 设为 `Deploy from a branch`，
分支选 `main`、目录选 `/ (root)`，保存后等一两分钟即可访问
<https://wdnmd6969.github.io/brake-game/>。

## 版权

游戏程序、3D 模型与文案版权属于原站作者，本仓库仅作个人离线游玩的备份。
