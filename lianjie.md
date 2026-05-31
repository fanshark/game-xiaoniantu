# 🎮 小黏土走走走 - 分享链接

## 📂 分享方式

### 方式1：直接分享文件（最简单）
把这个文件发给朋友，朋友双击就能玩：
```
game-xiaoniantu-share.html
```
这是一个完整的单文件版本，包含所有代码和样式，无需服务器。

### 方式2：本地启动服务器
在项目目录运行以下命令，然后把链接分享到局域网内的朋友：
```bash
cd /Users/max.zhang7/Desktop/AI编程/game-xiaoniantu
npx serve .
```
默认地址：`http://localhost:3000`

### 方式3：上传到免费网站托管（推荐，任何人可访问）

#### A. GitHub Pages（推荐）
1. 先登录 GitHub：`gh auth login`
2. 创建仓库并推送：
```bash
cd /Users/max.zhang7/Desktop/AI编程/game-xiaoniantu
git init
git add .
git commit -m "小黏土走走走 RPG游戏"
gh repo create game-xiaoniantu --public --push --source=.
```
3. 开启 Pages：
```bash
gh api repos/{owner}/game-xiaoniantu/pages -X POST -f source.branch=main -f source.path=/
```
4. 链接格式：`https://{你的用户名}.github.io/game-xiaoniantu/`

#### B. Netlify Drop（最快，无需注册）
1. 打开 https://app.netlify.com/drop
2. 把整个 `game-xiaoniantu` 文件夹拖进去
3. 自动生成分享链接！

#### C. itch.io（游戏平台）
1. 注册 https://itch.io
2. 创建新项目 → 上传 `game-xiaoniantu-share.html`
3. 设置为 HTML5 游戏
4. 获得专属游戏页面链接

---

## 🔗 在线游戏链接

### ✅ GitHub Pages（已部署）
**https://fanshark.github.io/game-xiaoniantu/**

> 把这个链接发给朋友，朋友打开就能直接玩！
> （首次部署可能需要1-2分钟生效）

### 📦 GitHub 仓库
https://github.com/fanshark/game-xiaoniantu

---

## 📝 更新日志
- 游戏区域放大1.5倍
- 新增建筑：温暖小屋、粘土博物馆、知识图书馆
- 存档系统（10个存档位）
- 攻击光波效果
- 敌人战斗力等级系统
- 儿童模式（悬停朗读）
