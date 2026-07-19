# StadiumSense AI — Production Deployment Guide

This guide provides detailed instructions on how to package and deploy StadiumSense AI to a production hosting environment.

---

## 1. Unified Architecture Overview

StadiumSense AI utilizes **npm workspaces** to group the frontend and backend applications into a single, cohesive repository. In production mode (`NODE_ENV=production`), the backend Express server is configured to:
1. Detect the static build directory of the React frontend (`frontend/dist`).
2. Serve all static assets (JS, CSS, icons, images) directly using Express.
3. Fall back any client-side SPA routing paths (like `/concierge`, `/ops`, `/sustainability`) to `index.html`.

This means **you do not need separate deployments** for frontend and backend. The entire application runs on a single host and port, resolving cross-origin resource sharing (CORS) complexities.

---

## 2. Environment Variables

Before starting your deployment, set up the following environment variables in your hosting provider's configuration panel:

| Variable Name | Type | Recommended Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | `production` | Enables optimized express hosting, logs masking, and static asset mapping. |
| `PORT` | Integer | `5000` (or dynamic) | The port where the backend Node.js web server will listen for requests. |
| `GROQ_API_KEY` | String | *your_groq_api_key* | Official API Key to access Groq LLM completions. If left blank, the app degrades gracefully to mock data. |

---

## 3. Deployment Steps by Platform

### Option A: Render (Web Service)

Render is a modern cloud hosting platform suitable for hosting Node.js web applications.

1. **Create Web Service**:
   - Log into [Render](https://render.com/).
   - Click **New +** and select **Web Service**.
   - Connect your GitHub or GitLab repository containing the StadiumSense AI code.

2. **Configure Settings**:
   - **Name**: `stadium-sense-ai` (or any custom name)
   - **Environment**: `Node`
   - **Region**: Select a region close to your target users.
   - **Branch**: `main` (or your active release branch)
   - **Root Directory**: Leave blank (`.`) to use the workspace root.
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

3. **Set Environment Variables**:
   - Click the **Environment** tab.
   - Add `NODE_ENV` = `production`
   - Add `GROQ_API_KEY` = `your_actual_groq_api_key`
   - Render handles the `PORT` variable automatically.

4. **Deploy**:
   - Click **Create Web Service**. Render will pull your repository, install dependencies, run the workspace production builds, and start the unified server.

---

### Option B: Railway

Railway offers a fast, zero-config deployment process.

1. **Deploy Repository**:
   - Go to [Railway](https://railway.app/).
   - Click **New Project** -> **Deploy from GitHub repo**.
   - Choose your repository.

2. **Set Variables**:
   - Once the deployment card is created, navigate to **Variables**.
   - Click **New Variable** and add:
     - `NODE_ENV` = `production`
     - `GROQ_API_KEY` = `your_actual_groq_api_key`
     - `PORT` = `5000` (Railway will route incoming traffic to this port)

3. **Build & Launch**:
   - Railway will automatically detect the root workspace, trigger `npm install`, compile the assets, and map the server port.
   - To make the app public, click the **Settings** tab on your Railway service card, scroll to the **Domains** section, and click **Generate Domain**.

---

### Option C: Manual VPS / Dedicated Server (Ubuntu / Debian)

If you are hosting the application on a Virtual Private Server (such as AWS EC2, DigitalOcean Droplet, Linode, or Google Compute Engine):

#### Prerequisites
Ensure the VPS has **Node.js (v20+)** and **npm** installed:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step-by-Step CLI Execution
1. **Clone the Repository**:
   ```bash
   git clone <your_repository_url> && cd <repository_folder>
   ```

2. **Install Workspace Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up the Production Configuration**:
   Create a local production `.env` inside the backend directory:
   ```bash
   cat <<EOF > backend/.env
   PORT=5000
   NODE_ENV=production
   GROQ_API_KEY=your_groq_api_key_here
   EOF
   ```

4. **Compile Frontend & Backend**:
   ```bash
   npm run build
   ```

5. **Start & Manage the Process (using PM2)**:
   It is recommended to use PM2 to manage the Node server process, restart it on crashes, and keep it running in the background.
   ```bash
   # Install PM2 globally
   sudo npm install -g pm2
   
   # Start the compiled backend server
   pm2 start backend/dist/index.js --name "stadiumsense-production"
   
   # Set up PM2 to launch on system bootup
   pm2 startup
   pm2 save
   ```

6. **Reverse Proxy Configuration (Nginx)**:
   It is highly recommended to front the Node process with Nginx to serve HTTPS requests:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
   
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 4. Verification Check

To confirm that the production deployment was configured correctly, look at the logs in your hosting provider's dashboard:
1. You should see:
   `[StadiumSense Backend] Serving static frontend files from: /path/to/frontend/dist`
2. You should see:
   `[StadiumSense Backend] Server is running on port 5000 in production mode.`
3. Visit the domain, click through different navigation tabs, and submit a query. If the page loads successfully and processes chat inputs, your deployment is active and fully functional!
