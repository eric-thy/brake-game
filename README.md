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

> 本站的 Pages 已经通过 API 开好了，以后改内容只需重新 push，GitHub 会自动重建。

## 以后怎么更新

这台机器直连 `github.com:443` 被阻断（DNS 解析到的节点不通），但部分 GitHub 边缘 IP 是通的，
所以推送时挂一个本地代理即可：

```powershell
# 1. 在 D:\Project\brake-offline 下启动代理（只监听 127.0.0.1，可加 --resolve 的等价逻辑见脚本注释）
node _tools\git-proxy.js 7899 _test\proxy.log

# 2. 另开一个窗口推送
cd gh-pages
.\deploy.ps1 -User wdnmd6969 -Repo brake-game -Proxy http://127.0.0.1:7899
```

如果你自己启动了代理软件（系统代理设置里写的是 `127.0.0.1:7890`），
把 `-Proxy` 换成你自己的地址就行，不必用上面的脚本。

## 版权

游戏程序、3D 模型与文案版权属于原站作者，本仓库仅作个人离线游玩的备份。
