# 修复 BTCAdapter 使用 @bitcoinerlab/secp256k1
$file = "src\services\blockchain\BTCAdapter-harmonyos.ts"
$content = Get-Content $file -Raw

# 1. 替换导入
$content = $content -replace "import \* as secp from '@noble/secp256k1';[^}]+import \{ hmac \} from '@noble/hashes/hmac.js';", "import * as ecc from '@bitcoinerlab/secp256k1';"

# 2. 删除 secp 设置和 ecc 对象定义 (从 "// 设置" 到第一个 "export class" 之前)
$content = $content -replace "(?s)// 设置 @noble.*?(?=// 创建 BIP32 工厂)", ""

# 3. 删除测试函数
$content = $content -replace "(?s)// 测试 ECC 方法.*?testEccMethods\(\);[^\n]*\n\n", ""

# 4. 修改初始化
$content = $content -replace "bitcoin\.initEccLib\(ecc as any\)", "bitcoin.initEccLib(ecc)"
$content = $content -replace "BIP32Factory\(ecc as any\)", "BIP32Factory(ecc)"
$content = $content -replace "@noble/secp256k1", "@bitcoinerlab/secp256k1"

# 保存
$content | Set-Content $file -NoNewline

Write-Host "✅ 修复完成！" -ForegroundColor Green
