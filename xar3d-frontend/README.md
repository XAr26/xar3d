# Xar3D - Platform Jual Beli Aset 3D Premium

Xar3D adalah sebuah platform marketplace 3D yang menghubungkan kreator aset 3D profesional dengan pembeli. Platform ini dibangun dengan arsitektur **Monorepo (Terpisah)** yang terdiri dari Frontend berbasis Next.js dan Backend berbasis Laravel.

## 🏗️ Struktur Arsitektur & Tech Stack

Platform ini dipisahkan menjadi dua layanan utama untuk memberikan skalabilitas dan keamanan yang lebih baik:

### 1. Frontend (Next.js 16.2.10 - Turbopack)
- **Bahasa**: TypeScript, HTML, CSS (Tailwind CSS v4)
- **Framework Utama**: Next.js (App Router)
- **Library Tambahan**: 
  - `framer-motion` (Animasi halus)
  - `lucide-react` (Ikon SVG)
  - `axios` (Klien HTTP)
  - `zustand` (Manajemen State)
  - `three` & `@react-three/fiber` (Render model 3D)
- **Lokasi**: `/home/xar-26/projek/xar3d/xar3d-frontend`
- **Port Default**: `http://localhost:3000`

### 2. Backend (Laravel 11/12)
- **Bahasa**: PHP 8.3
- **Framework Utama**: Laravel (REST API)
- **Database**: MySQL / MariaDB (Dikelola dengan Eloquent ORM)
- **Otentikasi**: Laravel Sanctum (Token-based API auth)
- **Fitur Spesial**: Storage lokal untuk aset dan thumbnail, sistem UUID untuk keamanan ID, sistem Role (Admin, Creator, User).
- **Lokasi**: `/home/xar-26/projek/xar3d/xar3d-backend`
- **Port Default**: `http://127.0.0.1:8000`

---

## 🛤️ Alur Kerja Sistem (Code Paths)

Bagaimana aplikasi ini beroperasi dari ujung ke ujung:

1. **Otentikasi & Sesi**:
   - Pengguna (User/Creator) login melalui form di Frontend (halaman `/login`).
   - Frontend memanggil Endpoint Backend `POST /api/v1/auth/login`.
   - Backend memverifikasi *hash* password dan mengembalikan *Personal Access Token* (Sanctum).
   - Frontend menyimpan token ini di `localStorage` (sebagai `auth_token`) dan menyertakannya di setiap *header* `Authorization: Bearer <token>` untuk permintaan API selanjutnya (diatur di `lib/axios.ts`).

2. **Pembelian & Manajemen Aset**:
   - Creator mengunggah aset melalui `/upload` di Frontend. File (Zip/Blend & Thumbnail) dikirim secara *multipart/form-data* ke `POST /api/v1/assets`.
   - Backend memvalidasi tipe file (`mimes:zip,blend,jpeg,png`) dan menyimpannya secara aman di direktori *storage/app/assets* (Bukan folder *public*, sehingga tidak bisa diunduh langsung tanpa otorisasi).
   - Saat pembeli membeli aset, saldo dikurangi (`UserController`), dan rekam jejak ditaruh di tabel `downloads`.
   - Pembeli dapat mengunduh aset asli karena rute `GET /api/v1/assets/{id}/download` akan memverifikasi tabel `downloads` sebelum mengirim (*stream*) file asli kepada pembeli.

3. **Sistem Pengikut (Social & Trust)**:
   - Pembeli dapat mengikuti (*follow*) kreator dengan menekan tombol.
   - Frontend memanggil `POST /api/v1/creators/{creatorId}/follow` yang akan memodifikasi tabel pivot `creator_followers`.
   - Saat kreator mengunggah aset baru, seluruh pengikutnya mendapatkan Notifikasi internal di dasbor mereka (`NotificationBell.tsx`).

---

## 🚀 Cara Menjalankan Project

Ikuti langkah-langkah ini untuk menjalankan lingkungan *development* dari awal sampai akhir:

### 1. Menjalankan Backend (Laravel)
Buka terminal dan arahkan ke folder backend:
```bash
cd /home/xar-26/projek/xar3d/xar3d-backend
```
Pastikan `composer` sudah terinstal, lalu jalankan:
```bash
composer install
php artisan migrate       # Membuat struktur tabel database
php artisan storage:link  # Menautkan folder penyimpanan publik
php artisan serve         # Menjalankan server di port 8000
```
*(Catatan: Biarkan terminal ini tetap menyala)*

### 2. Menjalankan Frontend (Next.js)
Buka tab terminal baru dan arahkan ke folder frontend:
```bash
cd /home/xar-26/projek/xar3d/xar3d-frontend
```
Jalankan perintah ini:
```bash
npm install
npm run dev
```
Buka browser Anda di **http://localhost:3000**. Aplikasi Xar3D sudah siap digunakan!

---

## 🛡️ Analisis Keamanan & Perbaikan (Senior Dev Review)

Sebagai developer senior, saya telah melakukan audit keamanan pada kode proyek ini. Berikut laporannya:

### Kondisi Saat Ini (Pro)
✅ **Otentikasi Berbasis Token**: Sangat baik. Sistem menggunakan Sanctum yang memproteksi setiap *endpoint* API.
✅ **Storage Terpisah**: File aset 3D (ZIp/Blend) disimpan di *storage/local*, BUKAN *public*. Artinya, hacker tidak dapat asal menebak URL aset untuk membajaknya secara gratis.
✅ **Validasi Tipe Input**: Controller sudah memeriksa UUID dan validasi tipe file, mengurangi risiko eksekusi file berbahaya (seperti PHP/Shell).
✅ **UUID System**: Penggunaan UUID menyulitkan teknik peretasan *Enumeration* (IDOR) dibandingkan ID *Auto Increment* biasa.

### Celah & Area Perbaikan Keamanan (Cons)
⚠️ **Mass Assignment Vulnerability**:
   - **Analisis**: Di `app/Models/User.php`, parameter sensitif seperti `role`, `balance`, `is_verified`, dan `is_banned` dimasukkan ke dalam properti `$fillable`. Ini berarti fungsi seperti `$user->update($request->all())` berpotensi secara tidak sengaja mengizinkan *user* nakal mengangkat dirinya menjadi admin atau merubah saldo mereka sendiri.
   - **Perbaikan**: Saat ini hal ini belum membahayakan secara nyata karena kontroler (contoh: `AuthController` dan `ProfileController`) secara eksplisit menuliskan *array keys* saat melakukan manipulasi database (tidak ada yang memanggil `$request->all()`). Tetap disarankan di masa mendatang untuk memisahkan pengubahan `role` dan `balance` menggunakan *assignment* langsung (`$user->balance = $newBalance; $user->save();`) daripada fungsi mass-update.
⚠️ **Penyimpanan Token Client-side**:
   - **Analisis**: Frontend menyimpan token Sanctum di `localStorage`. Ini rentan terhadap serangan XSS (Cross-Site Scripting) jika ada skrip nakal yang berhasil disuntikkan ke tampilan (contoh: dari *input* komentar atau deskripsi).
   - **Perbaikan**: Ganti otentikasi menjadi metode **HttpOnly Cookies**. Laravel Sanctum sudah mendukung mekanisme *First-party SPA Authentication* berbasis *Cookie* yang mana token tidak bisa diakses oleh JavaScript di browser.

---

## 💡 Ide Pengembangan & Fitur Lanjutan

Untuk membawa proyek ini ke tingkat "Platform Internasional", pertimbangkan ide pengembangan berikut:

1. **3D Web Viewer (Eksplorasi di Browser)**
   - Mengintegrasikan file `*.glb` / `*.gltf` bersamaan dengan foto *thumbnail*.
   - Manfaatkan modul `@react-three/fiber` (yang sudah terinstal di *package.json*!) agar calon pembeli bisa merotasi, memperbesar, dan melihat aset 3D secara *real-time* di browser sebelum mereka membeli.

2. **WebSockets untuk Notifikasi Real-time**
   - Saat ini notifikasi kemungkinan ditarik secara periodik (Long Polling) atau di-*refresh* manual.
   - **Ide**: Gunakan **Laravel Reverb** atau Pusher untuk menyiarkan notifikasi secara *live* saat aset dibeli atau kreator memposting aset baru tanpa perlu *refresh*.

3. **Analytics Kreator (Data Keuangan)**
   - Tambahkan grafik pendapatan (*Chart.js* atau *Recharts*) di Dasbor Kreator.
   - Tampilkan tren pembelian dalam periode waktu (Harian, Bulanan) untuk membantu kreator memprediksi apa yang sedang laku.

4. **Sistem Ulasan Lanjutan dengan Moderasi**
   - Tambahkan kemampuan bagi kreator untuk *membalas* ulasan pengguna.
   - Tambahkan algoritma "Ulasan Terbantu" / "Verified Purchase" (saat ini mungkin sudah, tapi bisa dipercantik UI-nya) untuk menangkal spam atau *review bombing*.

## 🌍 Panduan Deployment (Hosting ke VPS)

Karena arsitektur ini adalah **Decoupled (Terpisah)**, cara terbaik untuk meng-hosting proyek ini adalah menggunakan **VPS (Virtual Private Server)** seperti DigitalOcean, Linode, AWS, atau Hostinger VPS dengan sistem operasi **Ubuntu 22.04 / 24.04**.

Berikut adalah garis besar arsitektur server untuk *production*:
- **Domain Utama**: `xar3d.com` -> Diarahkan ke Frontend (Next.js)
- **Subdomain API**: `api.xar3d.com` -> Diarahkan ke Backend (Laravel)

### 1. Persiapan VPS (Instalasi Software)
Di VPS Anda, instal perangkat lunak yang dibutuhkan:
```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Instal Nginx & MySQL
sudo apt install nginx mysql-server -y

# Instal PHP 8.3 & Ekstensi (Disesuaikan dengan versi repo PPA Ondrej)
sudo apt install php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml php8.3-bcmath php8.3-curl -y

# Instal Node.js (v20) & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 2. Deployment Backend (Laravel)
1. Unggah / Clone folder `xar3d-backend` ke `/var/www/xar3d-backend`.
2. Salin `.env.example` ke `.env` dan atur koneksi Database (DB_USERNAME, DB_PASSWORD) dan atur `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://api.xar3d.com`.
3. Jalankan perintah produksi Laravel:
```bash
cd /var/www/xar3d-backend
composer install --optimize-autoloader --no-dev
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
4. Atur kepemilikan folder agar bisa diakses Nginx:
```bash
sudo chown -R www-data:www-data /var/www/xar3d-backend/storage /var/www/xar3d-backend/bootstrap/cache
```

### 3. Deployment Frontend (Next.js)
1. Unggah / Clone folder `xar3d-frontend` ke `/var/www/xar3d-frontend`.
2. Buat file `.env.production` dan atur variabel API agar mengarah ke Subdomain backend Anda:
```env
NEXT_PUBLIC_API_URL=https://api.xar3d.com/api/v1
NEXT_PUBLIC_BASE_URL=https://api.xar3d.com
```
3. Lakukan proses *Build* dan jalankan dengan PM2:
```bash
cd /var/www/xar3d-frontend
npm install
npm run build
pm2 start npm --name "xar3d-frontend" -- start
pm2 save
pm2 startup
```

### 4. Konfigurasi Nginx & SSL (Certbot)
Buat 2 file konfigurasi Nginx (`/etc/nginx/sites-available/`).

**Blok Server Backend (api.xar3d.com):**
Arahkan `root` ke `/var/www/xar3d-backend/public` dan gunakan konfigurasi standar PHP-FPM Laravel.

**Blok Server Frontend (xar3d.com):**
Gunakan Nginx sebagai *Reverse Proxy* untuk meneruskan trafik ke PM2 (port 3000).
```nginx
server {
    server_name xar3d.com www.xar3d.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Terakhir, amankan keduanya dengan SSL gratis dari Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d xar3d.com -d www.xar3d.com -d api.xar3d.com
```
