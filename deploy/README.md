# Deploy Backstage on Ubuntu (Nginx + PM2 + Postgres)

Target: single VPS, access by **IP** (no domain yet), [GitHub repo](https://github.com/davidZakaria/backstage.git), PostgreSQL on the same machine.

## Sharing the VPS with another app (do not disrupt it)

Use **separate resources** so nothing conflicts:

| Piece | Backstage (this guide) | Your existing app |
|--------|-------------------------|-------------------|
| **HTTP** | Prefer **`http://IP:8080/`** (dedicated Nginx `server`) | Keeps **port 80** (and 443 if used) |
| **Node** | **`PORT=3001`** via PM2 process name **`backstage`** | Whatever it already uses (often **3000**) |
| **DB** | New database **`backstage`** + user **`backstage_app`** | Unchanged |
| **Code** | Directory **`/var/www/backstage`** | Leave its path alone |

**Do not** run `sudo rm /etc/nginx/sites-enabled/default` if that would remove the other site’s config.

**Do not** stop, delete, or overwrite the other app’s PM2 processes. After `pm2 start deploy/ecosystem.config.cjs`, run `pm2 list` — you should see **both** apps. Only ever `pm2 restart backstage` for this project.

**Before you pick ports**, check what is already listening (adjust if there is a clash):

```bash
sudo ss -tlnp | grep -E ':(80|443|3000|3001|8080)\b'
ls -la /etc/nginx/sites-enabled/
pm2 list 2>/dev/null || true
```

If **3001** is already taken, pick a free port (e.g. **3002**): edit **`deploy/ecosystem.config.cjs`** (`PORT`) and the **`upstream`** `server` line in **`deploy/nginx-ip-alt-port.conf`**, then reload Nginx.

**Recommended when another app is on port 80:** use **only** the [§7 “Alternate (8080)”](#7-nginx-browser--app) block — not the “default_server on 80” config.

---

## 0. Push this project to GitHub (if the repo is empty)

On your laptop (in the project folder):

```bash
git init
git remote add origin https://github.com/davidZakaria/backstage.git
git branch -M main
git add .
git commit -m "Initial import"
git push -u origin main
```

## 1. Ubuntu packages

SSH into the VPS as root or a sudo user:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx postgresql postgresql-contrib ufw
```

## 2. Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should be v20.x
sudo npm install -g pm2
```

## 3. PostgreSQL database

```bash
sudo -u postgres psql <<'SQL'
CREATE DATABASE backstage;
CREATE USER backstage_app WITH ENCRYPTED PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE backstage TO backstage_app;
ALTER DATABASE backstage OWNER TO backstage_app;
SQL
```

For Prisma with extensions you may need:

```bash
sudo -u postgres psql -d backstage -c "GRANT ALL ON SCHEMA public TO backstage_app;"
```

Replace `CHANGE_ME_STRONG_PASSWORD` and use the same values in `.env`.

## 4. Clone from GitHub and create `.env`

```bash
sudo mkdir -p /var/www/backstage
sudo chown -R "$USER:$USER" /var/www/backstage
cd /var/www/backstage
git clone https://github.com/davidZakaria/backstage.git .
cp .env.example .env
nano .env
```

**Minimum production `.env`:**

- `DATABASE_URL` / `DIRECT_URL` — PostgreSQL URL for the `backstage` database (same connection string twice is fine without a pooler). Example:  
  `postgresql://backstage_app:YOUR_PASSWORD@localhost:5432/backstage?schema=public`
- `AUTH_SECRET` — at least 32 random characters: `openssl rand -base64 32`

Add **optional** lines from `.env.example`: Supabase and/or Cloudinary if you use file uploads.

You can set **`PORT=3001`** in `.env` for clarity; PM2 also sets `PORT=3001` in `deploy/ecosystem.config.cjs` (they should match).

## 5. Build and database schema

```bash
cd /var/www/backstage
npm ci
npx prisma generate
npx prisma db push
npm run build
```

(Optional seed: `npm run db:seed` — only if you want demo data.)

## 6. PM2

```bash
cd /var/www/backstage
pm2 start deploy/ecosystem.config.cjs
pm2 save
sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$(eval echo ~"$USER")"
```

Follow the command `pm2 startup` prints if needed. If you change the app port, edit **`deploy/ecosystem.config.cjs`** and **`deploy/nginx-*.conf`** to the same value.

## 7. Nginx (browser → app)

Safer choice on a server that **already serves another site on port 80**: add Backstage on **8080** only — use **“Alternate (8080)”** below and **skip** Option A entirely.

### Option A — Port 80 only for Backstage (displaces `default`)

Use **only** if nothing important is listening on port 80, or you intend this app to be the main site:

```bash
sudo cp /var/www/backstage/deploy/nginx-ip-default.conf /etc/nginx/sites-available/backstage
sudo ln -sf /etc/nginx/sites-available/backstage /etc/nginx/sites-enabled/backstage
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Then open `http://YOUR_VPS_IP/`.

### Alternate (8080) — **recommended with another app on port 80**

Adds a **second** `server` block; your existing **:80** site stays as-is:

```bash
sudo cp /var/www/backstage/deploy/nginx-ip-alt-port.conf /etc/nginx/sites-available/backstage
sudo ln -sf /etc/nginx/sites-available/backstage /etc/nginx/sites-enabled/backstage
sudo nginx -t && sudo systemctl reload nginx
sudo ufw allow 8080/tcp
```

Visit **`http://YOUR_VPS_IP:8080/`** for Backstage only.

Edit the **`upstream`** port in that file (and **`deploy/ecosystem.config.cjs`**) if your Node port is not **3001**.

## 8. Firewall

Do **not** reset rules blindly if the server is already in production.

```bash
sudo ufw status
```

If UFW is inactive and you turn it on, ensure **SSH** stays allowed:

```bash
sudo ufw allow OpenSSH
```

Allow what you actually expose:

- Other app: usually **`Nginx Full`** or **`80,443/tcp`** (may already be there).
- Backstage on **8080**: `sudo ufw allow 8080/tcp`

Then `sudo ufw enable` only if you are sure you will not lock yourself out.

## Updates (GitHub pull)

```bash
cd /var/www/backstage
git pull
npm ci
npx prisma generate
npx prisma db push
npm run build
pm2 restart backstage
```

## TLS later

Let’s Encrypt needs a **domain**. When you have one, point DNS to the VPS and use Certbot (`certbot --nginx`); until then, HTTP on IP is normal.
