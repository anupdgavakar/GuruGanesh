# GuruGanesh Graphics

Online printing shop: product catalogue, price requests, orders, blog and an admin panel.

| Folder | What it is | Tech |
| --- | --- | --- |
| `api/` | Backend and database API | Laravel 12, Sanctum, SQLite (MySQL works too) |
| `web/` | Public storefront (customers) | Next.js 16, React 19, Tailwind 4 |
| `admin/` | Admin panel (shop staff) | Next.js 16, React 19, Tailwind 4 |
| `deploy/` | Example production settings | text files |

## Run on your computer

Open three terminals.

```powershell
# 1. API  (http://localhost:8000)
cd api
copy .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve

# 2. Storefront  (http://localhost:3000)
cd web
copy .env.example .env.local
npm install
npm run dev

# 3. Admin  (http://localhost:3001)
cd admin
copy .env.example .env.local
npm install
npm run dev -- -p 3001
```

## Put it on a server

See [DEPLOYMENT.md](DEPLOYMENT.md).

## Never commit

`.env` files, the database file (`api/guruganesh`), uploaded pictures (`api/storage/app/public`) and customer design files. They are already listed in `.gitignore`.
