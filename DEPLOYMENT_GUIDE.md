# DodoHabit Web Deployment Guide

Since your project is a **Vite React Application (Single Page App)**, it is best hosted on a **static hosting service**. This is faster, more secure, and completely **FREE**.

I recommend **Vercel** or **Netlify** as the best free options. Since you also have a **Hostinger VPS with CyberPanel**, I have included instructions for that as well.

---

## 🚀 Option 1: Vercel (Recommended - Free & Easiest)
Vercel is the creators of Next.js and provides the best infrastructure for React apps.

### Step 1: Deploy code to GitHub
1. Create a repository on GitHub (e.g., `dodohabit-web`).
2. Push your code to this repository.

### Step 2: Connect Vercel to GitHub
1. Go to [vercel.com](https://vercel.com) and sign up/login.
2. Click **"Add New..."** > **"Project"**.
3. Select your `dodohabit-web` repository and click **Import**.
4. **Build Settings**: Vercel usually detects these automatically for Vite:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

### Step 3: Connect Porkbun Domain
1. Once deployed, go to your Project Dashboard on Vercel.
2. Go to **Settings** > **Domains**.
3. Enter your domain (e.g., `dodohabit.com`) and click **Add**.
4. Vercel will give you a **CNAME** or **A Record** to add to Porkbun.
   - **Type**: `A`
   - **Name**: `@` (root)
   - **Value**: `76.76.21.21` (Vercel's IP)
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Value**: `cname.vercel-dns.com`

### Step 4: Configure Porkbun DNS
1. Log in to **Porkbun**.
2. Go to **Domain Management** and click **DNS** (or "Edit" under DNS) for your domain.
3. Delete any existing "Parking" or default IP records.
4. Add the records provided by Vercel (from Step 3 above).
   - *Note: DNS propagation can take 1-24 hours, but usually happens in minutes.*

---

## 💻 Option 2: Hostinger VPS using CyberPanel (Advanced)
Since you already pay for this, you can use it, but it requires manual setup.

### Step 1: Build the Project Locally
Run this command in your terminal VS Code:
```powershell
npm run build
```
This will create a `dist` folder in your project directory containing the final HTML/CSS/JS files.

### Step 2: Create Website in CyberPanel
1. Log in to your **CyberPanel Dashboard** (usually `https://<your-vps-ip>:8090`).
2. Go to **Websites** > **Create Website**.
3. Fill in details:
   - **Package**: Default
   - **Owner**: admin
   - **Domain Name**: `dodohabit.com`
   - **Email**: `supportdodohabit@gmail.com`
   - **PHP**: Not needed strictly, but choose version 8.0+
   - **SSL**: Check "SSL" to get free HTTPS (Let's Encrypt).
4. Click **Create Website**.

### Step 3: Upload Files
1. Go to **Websites** > **List Websites** > `dodohabit.com` > **File Manager**.
2. Navigate to `public_html`.
3. Delete the default `index.html`.
4. Upload all the **files and folders inside your local `dist` folder** (from Step 1) to `public_html`.
   - *Tip: Zip the contents of `dist`, upload the zip, and extract it in File Manager for speed.*

### Step 4: Configure Rewrite Rules (Important for React Router)
Since this is a Single Page App, refreshing a page like `/privacy` will cause a 404 error unless you configure the server to redirect everything to `index.html`.

1. In CyberPanel, go to **Websites** > **List Websites** > `dodohabit.com`.
2. Find **Rewrite Rules** or **Configurations** (for OpenLiteSpeed).
3. Add this rule:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```
4. **Save** and restart OpenLiteSpeed service if prompted (or strictly restart OpenLiteSpeed from "Server Status" > "LiteSpeed Status").

### Step 5: Configure Porkbun DNS
1. Log in to **Porkbun**.
2. Go to **DNS** settings for your domain.
3. Add an **A Record**:
   - **Type**: `A`
   - **Name**: `@`
   - **Value**: `<YOUR_VPS_IP_ADDRESS>`
4. Add a **CNAME Record**:
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Value**: `dodohabit.com`

---

## 🏆 Summary Recommendation
- **Use Vercel (Option 1)** for zero-maintenance, global CDN speed, and auto-deployments when you push to GitHub. It's built for apps exactly like yours.
- **Use VPS (Option 2)** only if you want 100% control or need to host a custom backend alongside it later.
