# CI/CD Pipeline Kılavuzu

## 🎯 Neden CI/CD Pipeline?

### Sorunlar (Önceki Durum)

- ❌ Kod kalitesi kontrolü manuel
- ❌ Test'ler commit sonrası çalıştırılıyordu
- ❌ Build hataları geç fark ediliyordu
- ❌ Release süreci manuel ve hatalı olabiliyordu

### Çözüm (CI/CD Pipeline)

- ✅ Her commit'te otomatik test, lint, type-check
- ✅ PR'da kod kalitesi kontrolü
- ✅ Otomatik build ve deployment
- ✅ Otomatik release oluşturma

## 📋 GitHub Actions Workflow'ları

### 1. CI Pipeline (`ci.yml`)

**Ne zaman çalışır?**

- Her push (main, develop branch'lerine)
- Her Pull Request

**Ne yapar?**

1. **Lint & Format Check**
   - ESLint kontrolü
   - Prettier format kontrolü

2. **TypeScript Type Check**
   - TypeScript type kontrolü
   - Type hatalarını yakalar

3. **Test**
   - Jest testleri çalıştırır
   - Coverage raporu oluşturur
   - Codecov'a yükler (opsiyonel)

4. **Build Check**
   - Expo configuration kontrolü
   - Build hazırlığı kontrolü

**Sonuç:**

- ✅ Tüm kontroller geçerse: PR merge edilebilir
- ❌ Herhangi bir kontrol başarısız olursa: PR merge edilemez

### 2. Build Pipeline (`build.yml`)

**Ne zaman çalışır?**

- Main branch'e push
- Version tag oluşturulduğunda (v\*)

**Ne yapar?**

1. **Android Build**
   - EAS Build ile Android APK/AAB oluşturur
   - Production tag'lerde production profile
   - Normal push'larda preview profile

2. **iOS Build** (opsiyonel)
   - Sadece version tag'lerde çalışır
   - EAS Build ile iOS build oluşturur

**Sonuç:**

- Build artifact'ları EAS'da saklanır
- Build link'leri GitHub Actions'da görüntülenir

### 3. Release Pipeline (`release.yml`)

**Ne zaman çalışır?**

- Version tag oluşturulduğunda (v*.*.\*)

**Ne yapar?**

1. **Version Extraction**
   - Tag'den version numarasını çıkarır

2. **Changelog Generation**
   - Git commit'lerinden changelog oluşturur
   - Conventional commits kullanır

3. **GitHub Release**
   - GitHub Release oluşturur
   - Changelog'u release notes'a ekler

**Sonuç:**

- GitHub'da otomatik release oluşturulur
- Changelog otomatik eklenir

### 4. PR Checks (`pr-checks.yml`)

**Ne zaman çalışır?**

- Pull Request açıldığında
- PR'a yeni commit push edildiğinde

**Ne yapar?**

1. **Quality Checks**
   - Lint, format, type-check, test çalıştırır

2. **PR Comment**
   - PR'a sonuçları comment olarak ekler
   - ✅/❌ durumları gösterir

**Sonuç:**

- PR'da kod kalitesi durumu görünür
- Review'lar için kolaylık sağlar

## 🔧 Kurulum

### 1. GitHub Secrets Ayarlama

GitHub repository settings'den şu secret'ları ekleyin:

#### Gerekli Secrets

- `EXPO_TOKEN`: Expo access token
  - [Expo Dashboard](https://expo.dev/accounts/[your-account]/settings/access-tokens)'dan oluşturun
  - EAS Build için gerekli

#### Opsiyonel Secrets

- `CODECOV_TOKEN`: Codecov token (coverage için)
- `GITHUB_TOKEN`: Otomatik oluşturulur (release için)

### 2. EAS Build Yapılandırması

`eas.json` dosyası oluşturun (henüz yoksa):

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 3. Workflow Dosyalarını Commit Etme

```bash
git add .github/workflows/
git commit -m "ci: add GitHub Actions workflows"
git push
```

## 🚀 Kullanım

### Normal Development Flow

1. **Feature Branch Oluştur**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Değişiklikleri Yap ve Commit Et**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push ve PR Oluştur**

   ```bash
   git push origin feature/new-feature
   ```

   - GitHub'da PR oluştur
   - CI pipeline otomatik çalışır
   - PR checks sonuçları PR'da görünür

4. **PR Merge Edildiğinde**
   - CI pipeline tekrar çalışır
   - Main branch'e merge edilir
   - Build pipeline çalışır (opsiyonel)

### Release Flow

1. **Version Tag Oluştur**

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Otomatik İşlemler**
   - Release pipeline çalışır
   - GitHub Release oluşturulur
   - Build pipeline çalışır (production build)

3. **Release Notları**
   - Changelog otomatik oluşturulur
   - GitHub Release'de görüntülenir

## 📊 Workflow Durumları

### GitHub Actions Tab

GitHub repository'de **Actions** tab'ından:

- Tüm workflow çalışmalarını görebilirsiniz
- Her workflow'un detaylarını inceleyebilirsiniz
- Log'ları görüntüleyebilirsiniz

### PR Checks

PR'larda:

- ✅ Yeşil check: Tüm kontroller geçti
- ❌ Kırmızı X: Bazı kontroller başarısız
- 🟡 Sarı nokta: Workflow çalışıyor

## 🔍 Troubleshooting

### Problem: Workflow çalışmıyor

**Çözüm:**

- `.github/workflows/` klasörünün doğru yerde olduğundan emin olun
- YAML syntax hatalarını kontrol edin
- GitHub Actions'ın aktif olduğundan emin olun

### Problem: EAS Build başarısız

**Çözüm:**

- `EXPO_TOKEN` secret'ının doğru olduğundan emin olun
- `eas.json` dosyasının doğru yapılandırıldığından emin olun
- EAS Build quota'nızın yeterli olduğundan emin olun

### Problem: Test coverage yüklenmiyor

**Çözüm:**

- `CODECOV_TOKEN` secret'ını ekleyin (opsiyonel)
- Codecov entegrasyonu olmadan da çalışır, sadece coverage yüklenmez

## 📝 Best Practices

1. **Küçük PR'lar**
   - Her PR tek bir özellik/fix içermeli
   - Daha hızlı review ve merge

2. **Anlamlı Commit Mesajları**
   - Conventional commits kullanın
   - Changelog otomatik oluşturulur

3. **Test Coverage**
   - Yeni kod için test yazın
   - Coverage threshold'ları koruyun

4. **Build Kontrolü**
   - PR merge etmeden önce build'in başarılı olduğundan emin olun
   - Production build'ler sadece tag'lerde çalışır

## 🎯 Faydalar

1. **Otomatik Kontrol**
   - Her commit'te kod kalitesi kontrol edilir
   - Hatalı kod main branch'e merge edilemez

2. **Hızlı Feedback**
   - PR'larda anında sonuçlar görünür
   - Hatalar erken yakalanır

3. **Otomatik Release**
   - Version tag ile otomatik release
   - Changelog otomatik oluşturulur

4. **Ekip Standardı**
   - Tüm ekip üyeleri aynı standartları kullanır
   - Kod kalitesi garanti edilir

---

**Not:** CI/CD pipeline commit sürecini biraz yavaşlatabilir ama kod kalitesini ve güvenilirliği önemli ölçüde artırır.
