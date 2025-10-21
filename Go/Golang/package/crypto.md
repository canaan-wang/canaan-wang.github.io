# crypto

## 概览
- 密码学标准库家族：哈希（`sha256`/`sha512`/`blake2`）、消息认证（HMAC）、对称（AES）、非对称（RSA/ECDSA/ED25519）、TLS 等。

## 常用用法
```go
sum := sha256.Sum256(data)
mac := hmac.New(sha256.New, key)
block, _ := aes.NewCipher(key)
```
- 随机数：`crypto/rand`（安全随机）。
- TLS：`crypto/tls` 配置证书与安全参数。

## 技术原理
- 统一接口与实现，尽可能使用硬件加速与安全默认值。
- 椭圆曲线与 Ed25519 提供高性能与安全性。

## 最佳实践
- 避免自己发明加密方案；使用标准算法与安全模式。
- 使用 `crypto/rand` 生成密钥与随机数；谨慎处理 IV/nonce。