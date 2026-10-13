# Putting GuruGanesh Graphics on the internet

This guide is for **cPanel shared hosting** with a domain you already own. Replace `yourdomain.com` and `CPANELUSER` with your real domain and cPanel username.

The shop is three separate apps, so you need three web addresses:

| Address | App | Runs on |
| --- | --- | --- |
| `https://yourdomain.com` | Storefront (`web/`) | Node.js |
| `https://admin.yourdomain.com` | Admin panel (`admin/`) | Node.js |
| `https://api.yourdomain.com` | API and database (`api/`) | PHP |

## Step 0. Check what your hosting offers

Log in to cPanel and look for these. This decides everything.

1. **Setup Node.js App** (in the Software section). The storefront and admin are Next.js apps and need it. If it is missing, ask the host to enable Node.js 20 or 22 on your plan. Without it, they cannot run on that hosting (see "If there is no Node.js" at the bottom).
2. **MultiPHP Manager**: set the API's domain to **PHP 8.2 or newer** (8.3 is fine).
3. **Terminal** or SSH access. Makes everything much easier. If you do not have it, ask the host to turn it on.
4. **Git Version Control**. Nice to have, not required.

Also ask the host how much memory a build process may use. Building Next.js can need 1 GB or more. Step 4 explains how to build on your own PC if the server is too small.

## Step 1. Put the code on GitHub

Your repository is `https://github.com/anupdgavakar/guruganeshgraphics.git`. Open PowerShell in `F:\GuruGanesh` and point the folder at it (once):

```powershell
git remote set-url origin https://github.com/anupdgavakar/guruganeshgraphics.git
git remote -v
```

Then check what will be uploaded:

```powershell
git status
```

You should see the three app folders and a few new files (`README.md`, `DEPLOYMENT.md`, `deploy/`). You should **not** see `Products`, `New`, `.env`, photos, `.docx` or `guruganesh` (the database). If you do, stop and tell me.

```powershell
git add -A
git commit -m "Blog editor, image compression, store updates and deployment files"
git push origin main
```

The first push asks you to sign in to GitHub in a browser window. If GitHub says the push was rejected, do not force it; send me the message.

Make the GitHub repository **Private** (GitHub, then Settings, then Danger Zone, then Change visibility).

## Step 2. Get the code onto the server

Pick one:

**A. cPanel "Git Version Control"** (easiest). Click Create, tick "Clone a Repository", paste `https://github.com/anupdgavakar/guruganeshgraphics.git`, and set the path to `/home/CPANELUSER/guruganesh`. For a private repository, cPanel shows a public key to add to GitHub (repository Settings, then Deploy keys), and you then use the `git@github.com:anupdgavakar/guruganeshgraphics.git` address.

**B. Terminal / SSH**: `cd ~ && git clone https://github.com/anupdgavakar/guruganeshgraphics.git guruganesh` (a private repository asks for a GitHub personal access token as the password).

**C. Upload a zip** from your PC (without `node_modules`, `vendor`, `.next`) with cPanel File Manager and extract it to `/home/CPANELUSER/guruganesh`.

Keep it in `/home/CPANELUSER/guruganesh`, **outside** `public_html`. Only specific folders get exposed through the subdomains below.

## Step 3. The API (Laravel)

### 3a. Subdomain
cPanel, Domains (or Subdomains), Create `api.yourdomain.com` with **Document Root** `/home/CPANELUSER/guruganesh/api/public`. Then in cPanel **SSL/TLS Status**, run **AutoSSL** so it gets `https`.

### 3b. Upload what git does not carry
Git deliberately leaves out the database and the pictures.

- **Database**: upload `F:\GuruGanesh\api\guruganesh` to `/home/CPANELUSER/guruganesh/api/guruganesh`. It holds customers, orders and admin logins, so only upload it over cPanel File Manager or SFTP (never email it). If your `.env` names a different file in `DB_DATABASE`, use that file.
- **Pictures**: zip the contents of `F:\GuruGanesh\api\storage\app\public` (the folders such as `products`, `categories`, `blogs`) and extract them into `/home/CPANELUSER/guruganesh/api/storage/app/public`. If one zip is too big for File Manager, make several zips, one per folder, or use FileZilla (SFTP).

### 3c. Settings file
Create `/home/CPANELUSER/guruganesh/api/.env` from `deploy/api.env.production.example`. Fill in your domain and the `DB_DATABASE` path. Keep `APP_DEBUG=false`.

### 3d. Install and start (Terminal)
```bash
cd ~/guruganesh/api
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan optimize
```

No Composer on the server? Run `composer install --no-dev --optimize-autoloader` on your PC, zip the `vendor` folder, and upload it to `/home/CPANELUSER/guruganesh/api/vendor`.

If `storage:link` says symlinks are not allowed, ask the host to enable them or create the link for you (`public/storage` pointing to `storage/app/public`). Without it, no picture will load.

### 3e. Test
Open `https://api.yourdomain.com/api/products`. You should see products as text (JSON). A picture address such as `https://api.yourdomain.com/storage/categories/xxxx.jpg` should show a picture.

## Step 4. Storefront and admin (Next.js)

Do these once for `web` and once for `admin`.

### 4a. Settings
The address of the API is baked into the storefront when it is built, so set it **before** building.

- `web/.env.production.local`
  ```
  NEXT_PUBLIC_API_URL=https://api.yourdomain.com
  NEXT_PUBLIC_SITE_URL=https://yourdomain.com
  ```
- `admin/.env.production.local`
  ```
  API_URL=https://api.yourdomain.com
  SESSION_COOKIE_NAME=gg_admin_token
  ```
These files are ignored by git on purpose; create them wherever you run the build.

### 4b. Build
**If your server is big enough** (cPanel Terminal, inside the Node app's virtual environment, which the Node.js App page shows as a command to copy):
```bash
cd ~/guruganesh/web      # then repeat in ~/guruganesh/admin
npm ci
npm run build
```
**If the build is killed or runs out of memory**, build on your PC instead:
```powershell
cd F:\GuruGanesh\web
npm run build
```
Then upload these to the server folder: `.next` (the whole folder), `public`, `package.json`, `package-lock.json`, `next.config.ts`, `server.js`, and run **Run NPM Install** on the Node.js App page (it installs only what is needed to run). Do the same for `admin`. Use the same Node major version on your PC and on the server (check with `node -v`).

### 4c. Create the Node apps
cPanel, **Setup Node.js App**, Create Application:

| Field | Storefront | Admin |
| --- | --- | --- |
| Node.js version | 20 or 22 | 20 or 22 |
| Application mode | Production | Production |
| Application root | `guruganesh/web` | `guruganesh/admin` |
| Application URL | `yourdomain.com` | `admin.yourdomain.com` |
| Startup file | `server.js` | `server.js` |

For admin, also add the environment variables `API_URL` and `SESSION_COOKIE_NAME` from 4a in that page. Press **Restart** after each change, and run AutoSSL for the admin subdomain.

### 4d. Test
Open `https://yourdomain.com` (home page, products, a blog post) and `https://admin.yourdomain.com` (log in, open Blog posts). Pictures must load on both.

## Customer login (OTP) needs a decision

Customers log in with their phone number and a code. You have no SMS service yet, so the API runs in **test mode** (`OTP_TEST_MODE=true`). In test mode:

- the code is returned on screen instead of being sent by SMS, and
- anyone can create an account for any phone number **without any code**.

That is fine on your laptop, but it is not safe on the open internet: someone could sign up as another person's number and see their orders.

Your options before launching:

1. **Connect an SMS provider first** (for example MSG91, Twilio or your host's SMS service) and set `OTP_TEST_MODE=false`. Ask me and I will build it into `App\Services\SmsService`.
2. **Launch with `OTP_TEST_MODE=false` and no SMS yet.** Customer sign-up and login will not work (nothing can send a code). Browsing, price requests and the contact form can still work.

Do not launch with `OTP_TEST_MODE=true`.

## Before you tell customers

- [ ] `APP_DEBUG=false` and `APP_ENV=production` in `api/.env`
- [ ] `OTP_TEST_MODE=false` (see above)
- [ ] `CORS_ALLOWED_ORIGINS` lists exactly your storefront and admin addresses
- [ ] All three addresses open with the padlock (https)
- [ ] You changed the admin password to a long, new one
- [ ] Policy pages (shipping, returns, privacy, terms) read the way you want
- [ ] Photos added for the products that still have none
- [ ] A backup of `api/guruganesh` and `api/storage/app/public` is saved somewhere other than the server

## Updating the site later

1. On your PC: `git add -A`, `git commit -m "what changed"`, `git push origin main`.
2. On the server: `cd ~/guruganesh && git pull`.
3. API changed: `cd api && composer install --no-dev --optimize-autoloader && php artisan migrate --force && php artisan optimize`.
4. Storefront or admin changed: build again (Step 4b) and press **Restart** on its Node.js App page.

Never overwrite the server's `.env`, `api/guruganesh` or `api/storage/app/public` when updating: `git pull` leaves them alone.

## If there is no Node.js on your hosting

Then only the API can live on cPanel. The storefront and admin need a place that runs Node.js. Options: a small VPS (about the same price as shared hosting, and I can write the exact commands for it), or a Node-friendly host. Tell me which you prefer and I will rewrite this guide for it.

## Back up regularly

Copy `api/guruganesh` and `api/storage/app/public` to your PC (or another cloud drive) every week. Git does not hold them, so without a backup a server problem could lose orders and pictures.
