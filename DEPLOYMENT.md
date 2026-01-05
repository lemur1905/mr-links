# Deployment Guide: Railway

This guide walks you through deploying your Marginal Revolution Links app to Railway.

## Prerequisites

1. GitHub account
2. Railway account (sign up at railway.app)
3. Code pushed to GitHub

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin epic-maxwell
```

### 2. Set Up Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Railway will detect it's a monorepo

### 3. Deploy Backend

1. Click "Add a Service" → "New Service"
2. Choose your GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: (auto-detected)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. Add PostgreSQL database:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway auto-provides `DATABASE_URL` env variable

5. Set environment variables:
   - Click on backend service → "Variables" tab
   - Add:
     ```
     ENABLE_RSS_SCHEDULER=true
     RSS_UPDATE_INTERVAL_HOURS=1
     FRONTEND_URL=  (will fill in after frontend deploys)
     ```

6. Deploy! Railway will automatically build and deploy

### 4. Deploy Frontend

1. Click "Add a Service" → "New Service"
2. Choose same GitHub repo
3. Configure:
   - **Root Directory**: `.` (or leave blank)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l $PORT`

4. Set environment variables:
   - Click on frontend service → "Variables" tab
   - Add:
     ```
     REACT_APP_API_URL=<your-backend-url>
     ```
   - Get backend URL from: Backend service → "Settings" → "Domains"

5. Deploy!

### 5. Update CORS

1. Copy your frontend URL from Railway
2. Go back to backend service → "Variables"
3. Update `FRONTEND_URL` with your frontend URL
4. Backend will auto-redeploy

### 6. Generate Public URLs

Railway auto-generates URLs like:
- Backend: `https://backend-production-xxxx.up.railway.app`
- Frontend: `https://frontend-production-xxxx.up.railway.app`

You can customize these in Settings → Domains

## Custom Domain (Optional)

### Option 1: Buy domain through Namecheap/GoDaddy

1. Buy domain (e.g., `mrlinks.com`) for ~$12/year
2. In Railway:
   - Frontend service → Settings → Domains
   - Click "Add custom domain"
   - Enter your domain (e.g., `mrlinks.com`)
3. In your domain registrar (Namecheap/GoDaddy):
   - Add CNAME record: `www` → Railway's provided URL
   - Add A record: `@` → Railway's provided IP (or use CNAME flattening)
4. Wait 5-60 minutes for DNS propagation

### Option 2: Use Railway's subdomain

Railway gives you free subdomains:
- Frontend: `your-app.up.railway.app`
- Backend: `your-api.up.railway.app`

## Post-Deployment

### Initial Data Load

Your database will be empty. To populate it:

1. Call the scrape endpoint manually:
   ```bash
   curl -X POST https://your-backend.up.railway.app/api/links/scrape?pages=50
   ```

2. Or enable the scheduler (already set in env vars) - it will run hourly

### Monitor Your App

- Railway Dashboard → Your service → "Observability"
- Check logs for errors
- Monitor resource usage

## Costs

**Estimated Monthly Cost**: $5-10

- Railway: $5 base + usage
- PostgreSQL: Included in Railway
- Domain (optional): ~$1/month ($12/year)

**Free Trial**: Railway gives you $5 credit/month for hobby projects

## Troubleshooting

### Backend not connecting to frontend
- Check CORS settings in backend
- Verify `FRONTEND_URL` env variable is set correctly
- Check browser console for CORS errors

### Database connection errors
- Verify PostgreSQL service is running
- Check `DATABASE_URL` is auto-populated
- Look at backend logs in Railway dashboard

### Build failures
- Check `requirements.txt` for Python deps
- Verify `package.json` for Node deps
- Review build logs in Railway

### Frontend can't reach backend
- Verify `REACT_APP_API_URL` points to correct backend URL
- Check backend health: visit `https://your-backend.up.railway.app/health`
- Must rebuild frontend after changing env vars

## Need Help?

- Railway docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
