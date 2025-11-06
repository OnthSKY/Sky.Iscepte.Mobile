# Certificate Hash Nasıl Alınır?

API domain'iniz için SHA-256 public key hash'ini almak için birkaç yöntem var.

## 🚀 Hızlı Başlangıç

### Yöntem 1: OpenSSL (Linux/macOS - En Kolay)

```bash
# Domain'inizi değiştirin
DOMAIN="api.example.com"

# SHA-256 hash al
echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64
```

**Örnek Çıktı:**

```
jQJTbIhqgrFv6/UVPN2XKcLuX3vNSFg6l4n8zN2+5XY=
```

### Yöntem 2: OpenSSL (Adım Adım)

Eğer tek komut çalışmazsa, adım adım:

```bash
# 1. Certificate'i al
openssl s_client -servername api.example.com -connect api.example.com:443 < /dev/null > cert.pem

# 2. Public key'i çıkar
openssl x509 -in cert.pem -pubkey -noout > pubkey.pem

# 3. SHA-256 hash'i al
openssl pkey -pubin -in pubkey.pem -outform der | openssl dgst -sha256 -binary | base64
```

### Yöntem 3: Windows PowerShell

Windows'ta OpenSSL kurulu değilse, PowerShell ile:

```powershell
# PowerShell'de çalıştırın
$domain = "api.example.com"
$tcpClient = New-Object System.Net.Sockets.TcpClient($domain, 443)
$sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream(), $false, {$true})
$sslStream.AuthenticateAsClient($domain)
$cert = $sslStream.RemoteCertificate
$certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
$certObject = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certBytes)
$publicKey = $certObject.PublicKey.Key.Export([System.Security.Cryptography.CngKeyBlobFormat]::GenericPublicBlob)
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hash = $sha256.ComputeHash($publicKey)
$base64 = [Convert]::ToBase64String($hash)
Write-Host $base64
```

**Daha Basit PowerShell (OpenSSL kuruluysa):**

```powershell
# OpenSSL kurulu olmalı
$domain = "api.example.com"
echo "" | openssl s_client -servername $domain -connect "$domain`:443" 2>$null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
```

### Yöntem 4: Online Araçlar (En Kolay - Tarayıcıdan)

#### SSL Labs SSL Test

1. [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/) sayfasına gidin
2. Domain'inizi girin (örn: `api.example.com`)
3. "Submit" butonuna tıklayın
4. Test tamamlandığında, **"Certificate"** sekmesine gidin
5. **"Public Key"** bölümünden SHA-256 hash'ini alın

#### Certificate Transparency Logs

1. [crt.sh](https://crt.sh/) sayfasına gidin
2. Domain'inizi arayın
3. Certificate detaylarından hash'i alın

#### DigiCert Certificate Inspector

1. [DigiCert Certificate Inspector](https://www.digicert.com/help/) sayfasına gidin
2. Domain'inizi girin
3. Certificate detaylarından hash'i alın

## 📋 Adım Adım: OpenSSL ile (Detaylı)

### Linux/macOS

```bash
# 1. Domain'inizi belirleyin
DOMAIN="api.example.com"

# 2. Certificate'i alın ve hash'i hesaplayın
echo | openssl s_client \
  -servername $DOMAIN \
  -connect $DOMAIN:443 \
  2>/dev/null | \
openssl x509 -pubkey -noout | \
openssl pkey -pubin -outform der | \
openssl dgst -sha256 -binary | \
base64
```

### Windows (Git Bash veya WSL)

Windows'ta Git Bash veya WSL kullanıyorsanız, Linux komutları çalışır:

```bash
# Git Bash'te
DOMAIN="api.example.com"
echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64
```

### Windows (OpenSSL Kurulumu)

OpenSSL kurulu değilse:

1. **OpenSSL İndir:**
   - [Win32/Win64 OpenSSL](https://slproweb.com/products/Win32OpenSSL.html)
   - Veya Chocolatey ile: `choco install openssl`

2. **Kurulum sonrası:**
   ```cmd
   # CMD veya PowerShell
   openssl s_client -servername api.example.com -connect api.example.com:443 < nul | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
   ```

## 🔍 Hash Doğrulama

Aldığınız hash'in doğru olduğundan emin olmak için:

### 1. Hash Format Kontrolü

- ✅ Base64 encoded olmalı
- ✅ Genellikle 44 karakter (32 byte = 256 bit)
- ✅ Örnek: `jQJTbIhqgrFv6/UVPN2XKcLuX3vNSFg6l4n8zN2+5XY=`

### 2. Birden Fazla Hash Alın

Certificate rotation için en az 2 hash alın:

- Mevcut certificate hash'i
- Backup/gelecek certificate hash'i

### 3. Test Edin

Hash'i config'e ekledikten sonra:

```bash
# Development build ile test
APP_MODE=api npm start

# Native build ile test
npx expo run:android
```

## 📝 Config'e Ekleme

Hash'i aldıktan sonra:

### 1. `certificatePinningConfig.ts` Güncelle

```typescript
export function getPinnedCertificates(): PinnedCertificate[] {
  const apiUrl = new URL(appConfig.apiBaseUrl);
  const apiDomain = apiUrl.hostname;

  return [
    {
      domain: apiDomain, // Örn: 'api.example.com'
      publicKeyHashes: [
        'jQJTbIhqgrFv6/UVPN2XKcLuX3vNSFg6l4n8zN2+5XY=', // Gerçek hash'iniz
        'BACKUP_HASH_HERE', // Backup hash (certificate rotation için)
      ],
      includeSubdomains: false,
    },
  ];
}
```

### 2. `app.config.js` Güncelle

```javascript
plugins: [
  [
    './plugins/withCertificatePinning.js',
    {
      android: {
        domains: ['api.example.com'],
        publicKeyHashes: [
          'jQJTbIhqgrFv6/UVPN2XKcLuX3vNSFg6l4n8zN2+5XY=', // Gerçek hash
          'BACKUP_HASH_HERE', // Backup hash
        ],
      },
      ios: {
        domains: ['api.example.com'],
        allowArbitraryLoads: false,
      },
    },
  ],
],
```

## ⚠️ Önemli Notlar

### Certificate Rotation

1. **Backup hash ekleyin**: Certificate değiştiğinde uygulama çalışmaya devam etsin
2. **Expiration date**: Android'de `pin-set expiration` ayarlayın
3. **Monitoring**: Certificate değişikliklerini izleyin

### Production vs Development

- **Development**: Certificate pinning devre dışı (mock mode)
- **Production**: Certificate pinning aktif (api mode)

### Hata Durumları

Eğer hash yanlışsa:

- Uygulama API'ye bağlanamaz
- "Certificate validation failed" hatası alırsınız
- Hash'i tekrar kontrol edin

## 🛠️ Troubleshooting

### Problem: OpenSSL komutu çalışmıyor

**Çözüm:**

- OpenSSL'in kurulu olduğundan emin olun: `openssl version`
- Online araç kullanın (SSL Labs)

### Problem: Hash çok uzun/kısa

**Çözüm:**

- Base64 encoded SHA-256 hash 44 karakter olmalı
- Farklı bir yöntem deneyin

### Problem: Birden fazla certificate var

**Çözüm:**

- Tüm certificate chain'ini kontrol edin
- Her certificate için hash alın
- En az 2 hash ekleyin (mevcut + backup)

## 📚 Kaynaklar

- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/)
- [OWASP Certificate Pinning](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning)

---

**İpucu:** En kolay yöntem SSL Labs kullanmak. Tarayıcıdan domain'inizi test edin ve hash'i alın!
