# XWallet 打包部署指南

## 📦 打包完成

### Web 版本打包成功 ✅

**打包时间**: 2024-01-15  
**构建工具**: Vite 5.4.21  
**构建时间**: 21.43s  

---

## 📊 打包文件统计

### 输出目录
```
dist/
├── index.html              7.57 kB  (gzip: 2.85 kB)
├── vite.svg
├── buffer-browser.js
├── buffer.min.js
└── assets/
    ├── index-CcC5bRP5.js      4,910.62 kB  (gzip: 979.39 kB)
    └── index-DsnhA8U-.css        35.44 kB  (gzip: 7.27 kB)
```

### 文件大小
- **总大小**: ~4.95 MB
- **压缩后**: ~980 KB
- **HTML**: 7.57 KB
- **CSS**: 35.44 KB
- **JavaScript**: 4,910.62 KB

### 优化建议
⚠️ JavaScript 文件较大 (4.9MB)，主要原因：
- 加密库 (bitcoinjs-lib, ethers.js)
- 二维码库 (qrcode, jsqr)
- React 框架

建议优化：
- [ ] 代码分割 (Code Splitting)
- [ ] 按需加载 (Lazy Loading)
- [ ] Tree Shaking
- [ ] 压缩优化

---

## 🚀 部署方式

### 1. 本地预览

```bash
# 启动预览服务器
npm run preview

# 默认访问地址
http://localhost:4173
```

### 2. 静态网站托管

#### Vercel 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

#### Netlify 部署
```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 部署
netlify deploy --prod --dir=dist
```

#### GitHub Pages 部署
```bash
# 1. 创建 gh-pages 分支
git checkout -b gh-pages

# 2. 复制 dist 内容到根目录
cp -r dist/* .

# 3. 提交并推送
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# 4. 在 GitHub 仓库设置中启用 Pages
# Settings → Pages → Source: gh-pages branch
```

### 3. 自托管服务器

#### Nginx 配置
```nginx
server {
    listen 80;
    server_name xwallet.yourdomain.com;
    
    root /var/www/xwallet/dist;
    index index.html;
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Apache 配置
```apache
<VirtualHost *:80>
    ServerName xwallet.yourdomain.com
    DocumentRoot /var/www/xwallet/dist
    
    <Directory /var/www/xwallet/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA 路由
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### 4. Docker 部署

创建 `Dockerfile`:
```dockerfile
FROM nginx:alpine

# 复制构建文件
COPY dist/ /usr/share/nginx/html/

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

创建 `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

构建和运行：
```bash
# 构建镜像
docker build -t xwallet:latest .

# 运行容器
docker run -d -p 80:80 xwallet:latest
```

---

## 📱 移动应用打包

### iOS 打包

#### 前置要求
- macOS 系统
- Xcode 14+
- Apple Developer 账号
- CocoaPods

#### 打包步骤
```bash
# 1. 构建 Web 资源
npm run build

# 2. 同步到 iOS
npm run ios:sync

# 3. 打开 Xcode
npm run ios:open

# 4. 在 Xcode 中:
# - 选择开发团队
# - 配置签名证书
# - 选择目标设备
# - Product → Archive
# - Distribute App
```

#### EAS Build (推荐)
```bash
# 使用 Expo Application Services
npm run eas:build:preview    # 预览版本
npm run eas:build:production # 生产版本
```

### Android 打包

#### 前置要求
- Android Studio
- JDK 11+
- Android SDK

#### 打包步骤
```bash
# 1. 构建 Web 资源
npm run build

# 2. 同步到 Android
npm run android:sync

# 3. 打开 Android Studio
npm run android:open

# 4. 在 Android Studio 中:
# - Build → Generate Signed Bundle / APK
# - 选择 APK 或 AAB
# - 配置签名密钥
# - 选择 release 构建类型
# - Finish
```

#### 命令行打包
```bash
# 进入 Android 目录
cd android

# 生成 release APK
./gradlew assembleRelease

# 输出位置
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔧 环境变量配置

### 生产环境变量

创建 `.env.production`:
```env
# API 配置
VITE_API_BASE_URL=https://api.xwallet.com
VITE_NETWORK=mainnet

# 区块链节点
VITE_BTC_NODE_URL=https://btc-mainnet.xwallet.com
VITE_ETH_NODE_URL=https://eth-mainnet.xwallet.com

# 功能开关
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false

# 版本信息
VITE_APP_VERSION=1.0.0
VITE_BUILD_DATE=2024-01-15
```

### 测试环境变量

创建 `.env.staging`:
```env
VITE_API_BASE_URL=https://api-staging.xwallet.com
VITE_NETWORK=testnet
VITE_BTC_NODE_URL=https://btc-testnet.xwallet.com
VITE_ETH_NODE_URL=https://eth-testnet.xwallet.com
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

---

## ✅ 部署检查清单

### 部署前
- [ ] 运行所有测试
- [ ] 检查编译错误
- [ ] 更新版本号
- [ ] 更新 CHANGELOG
- [ ] 代码审查通过
- [ ] 安全扫描通过

### 部署时
- [ ] 备份旧版本
- [ ] 构建生产版本
- [ ] 验证构建产物
- [ ] 上传到服务器
- [ ] 配置服务器
- [ ] 测试部署

### 部署后
- [ ] 验证首页加载
- [ ] 验证核心功能
- [ ] 检查控制台错误
- [ ] 监控性能指标
- [ ] 收集用户反馈
- [ ] 准备回滚方案

---

## 🔒 安全建议

### HTTPS 配置
```bash
# 使用 Let's Encrypt 获取免费证书
sudo certbot --nginx -d xwallet.yourdomain.com
```

### 安全头配置
```nginx
# Nginx 安全头
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.xwallet.com;" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 敏感信息处理
- ✅ 不在客户端存储未加密的私钥
- ✅ 使用 HTTPS 传输数据
- ✅ 定期更新依赖包
- ✅ 启用 CSP (Content Security Policy)
- ✅ 使用 Subresource Integrity

---

## 📈 性能优化

### CDN 配置
```html
<!-- 使用 CDN 加速静态资源 -->
<link rel="stylesheet" href="https://cdn.xwallet.com/assets/index.css">
<script src="https://cdn.xwallet.com/assets/index.js"></script>
```

### 缓存策略
```nginx
# HTML - 不缓存
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
}

# JS/CSS - 长期缓存
location ~* \.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 图片 - 中期缓存
location ~* \.(png|jpg|jpeg|gif|svg|ico)$ {
    expires 30d;
    add_header Cache-Control "public";
}
```

### Gzip 压缩
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
```

---

## 🐛 故障排查

### 常见问题

#### 1. 白屏问题
**原因**: 路径配置错误
**解决**:
```javascript
// vite.config.ts
export default defineConfig({
  base: '/', // 根路径部署
  // 或
  base: '/xwallet/', // 子路径部署
})
```

#### 2. 路由 404
**原因**: SPA 路由未配置
**解决**: 配置服务器重定向到 index.html

#### 3. CORS 错误
**原因**: API 跨域配置
**解决**:
```nginx
add_header Access-Control-Allow-Origin "*";
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
add_header Access-Control-Allow-Headers "Content-Type";
```

#### 4. 加载缓慢
**原因**: 文件过大
**解决**:
- 启用 Gzip 压缩
- 使用 CDN
- 代码分割
- 懒加载

---

## 📊 监控和分析

### Google Analytics
```html
<!-- 添加到 index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry 错误监控
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  release: "xwallet@1.0.0",
});
```

### 性能监控
```typescript
// 首屏加载时间
window.addEventListener('load', () => {
  const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
  console.log(`Page load time: ${loadTime}ms`);
});
```

---

## 🔄 更新和回滚

### 更新流程
```bash
# 1. 备份当前版本
cp -r dist dist.backup.$(date +%Y%m%d-%H%M%S)

# 2. 构建新版本
npm run build

# 3. 部署新版本
rsync -avz dist/ user@server:/var/www/xwallet/

# 4. 验证新版本
curl https://xwallet.yourdomain.com

# 5. 清理旧备份（保留最近3个）
ls -t dist.backup.* | tail -n +4 | xargs rm -rf
```

### 回滚流程
```bash
# 1. 找到备份版本
ls -t dist.backup.*

# 2. 回滚到指定版本
cp -r dist.backup.20240115-140000 dist

# 3. 重新部署
rsync -avz dist/ user@server:/var/www/xwallet/

# 4. 验证回滚
curl https://xwallet.yourdomain.com
```

---

## 📞 技术支持

### 文档
- 用户手册: `docs/PASSWORD_FEATURE.md`
- 开发文档: `docs/FEATURE_SUMMARY.md`
- API 文档: `docs/API.md`

### 联系方式
- GitHub Issues: https://github.com/i5am/xwallet/issues
- Email: support@xwallet.com
- Discord: https://discord.gg/xwallet

---

## 📝 版本历史

### v1.0.0 (2024-01-15)
- ✅ 初始版本发布
- ✅ 支持 BTC/ETH 钱包
- ✅ 密码保护功能
- ✅ 本地存储
- ✅ 二维码扫描输入

---

**XWallet v1.0.0**  
*构建时间: 2024-01-15*  
*构建耗时: 21.43s*  
*输出大小: 4.95 MB (压缩后: 980 KB)*

© 2024 XWallet Team. All rights reserved.
