# Copy your local database (and “images”) to the VPS

In this app, **product and project images are not files on disk** — each `Media` row stores a **public URL** (Unsplash, Supabase Storage, Cloudinary, etc.). Copying the **PostgreSQL database** to production copies those links and all catalog/admin content.

**After restore**, any URL that still points to **`localhost`** or **`127.0.0.1`** will not load on the server. Re-upload those assets in Admin or replace URLs in the DB.

---

## Push local categories, products, and everything you filled in Admin

**Yes.** Anything you created locally — **categories**, **products**, **variants**, **shipping**, **content**, **projects**, **media URLs**, **orders**, **users** — is stored in **Postgres**. The app does **not** have a separate “export categories” button.

- **To copy all of that to the VPS:** use a full database dump from your PC → restore on the server (**next section** and **`pg_dump` → `pg_restore`** below). That overwrites the **`backstage`** database contents (after you back up production if needed).
- **`npm run db:seed` on the VPS** only installs the **fixed demo data** from `prisma/seed.ts`. It does **not** read what you typed on your laptop.

---

## Before you start

1. **Back up production** (on the VPS) if it already has data you care about:

   ```bash
   pg_dump "$DATABASE_URL" -Fc -f ~/backstage-prod-backup-$(date +%F).dump
   ```

2. Install PostgreSQL client tools where needed:
   - **Windows:** [PostgreSQL installer](https://www.postgresql.org/download/windows/) adds `pg_dump` to PATH, or use the same tools as your local DB.
   - **VPS:** `sudo apt install -y postgresql-client`

---

## Create or reset an admin user (VPS)

After `git pull`, use production `.env` (`DATABASE_URL` must point at the live database):

```bash
cd /var/www/backstage
export ADMIN_EMAIL="you@yourdomain.com"
export ADMIN_PASSWORD='your-strong-password'
export ADMIN_NAME="Admin"   # optional; defaults to Admin
npm run db:create-admin
pm2 restart backstage
```

If that email already exists, the row is **updated**: role becomes **ADMIN** and the password is replaced. Set env vars only in the SSH session; do not put `ADMIN_PASSWORD` in `.env` or commit it.

---

## One-time full copy: `pg_dump` → `pg_restore`

### A. On your PC (export local DB)

From the project folder, use the same database as `.env` (`DATABASE_URL`).

**If `pg_dump` accepts a URI** (PostgreSQL 11+):

```powershell
# PowerShell — set to your real local URL from .env
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/backstage?schema=public"
pg_dump $env:DATABASE_URL -Fc -f backstage-local.dump
```

**Or classic flags:**

```powershell
$env:PGPASSWORD = "postgres"
pg_dump -h localhost -p 5432 -U postgres -d backstage -Fc -f backstage-local.dump
```

You should get a file `backstage-local.dump` (binary format **`-Fc`**).

### B. Copy the file to the VPS

```powershell
scp backstage-local.dump root@72.61.192.84:/tmp/
```

### C. On the VPS (import into production DB)

Use the **production** URL (`backstage_app` / your `.env` in `/var/www/backstage`).

```bash
# Optional: stop app during restore (reduces connection errors)
pm2 stop backstage

export DATABASE_URL="postgresql://backstage_app:YOUR_PASSWORD@localhost:5432/backstage?schema=public"

pg_restore --clean --if-exists --no-acl --no-owner -d "$DATABASE_URL" /tmp/backstage-local.dump
```

- **`--clean --if-exists`** drops existing objects before recreate (destructive on this database).
- **`--no-owner --no-acl`** avoids errors when local user names differ from `backstage_app`.

If `pg_restore` prints **warnings** but ends with exit code 0, check the app. If it **fails** on permissions, run restore as superuser then re-grant:

```bash
sudo -u postgres pg_restore --clean --if-exists --no-owner -d backstage /tmp/backstage-local.dump
sudo -u postgres psql -d backstage -c "GRANT ALL ON SCHEMA public TO backstage_app;"
```

### D. Restart the app

```bash
pm2 start backstage
cd /var/www/backstage && pm2 restart backstage
rm /tmp/backstage-local.dump
```

Open the site and spot-check **shop**, **admin**, **images**.

---

## Lighter option: only seed demo data (no local changes)

If production only needs the **same demo catalog as `prisma/seed.ts`**, do **not** use `pg_dump`. On the VPS:

```bash
cd /var/www/backstage
npm run db:seed
pm2 restart backstage
```

_seed is idempotent for most seed IDs; it will not delete rows you added elsewhere without manual cleanup._

---

## Images checklist

| URL type | After DB copy |
|----------|----------------|
| `https://images.unsplash.com/...` | Works |
| `https://*.supabase.co/storage/...` | Works if bucket is public |
| Cloudinary URLs | Works |
| `http://localhost:...` | **Broken** — re-upload or edit URL |

---

## Optional: dump without schema-only migrations noise

If you use `pg_dump` **plain SQL** for inspection:

```bash
pg_dump "$DATABASE_URL" -f backstage.sql
```

Restore with `psql` is possible but `pg_restore -Fc` is usually simpler for full DB copies.

---

## Security

- Do **not** commit `.dump` files to git.
- Delete dumps from the VPS after a successful restore.
- Production `.env` must stay server-only; dumps contain **all** data including password hashes.
