# 🌐 Deployment Guide - Athena Library Management System

This guide explains how to share and deploy your application online for the **InspireLeap** submission (`hr@inspireleap.in`).

---

## 1. ⚡ Instant Live Public Link (Active Right Now)

Your local full-stack server is currently tunneled securely via Cloudflare.

- **Live URL**: **`https://gaps-diploma-barrier-samples.trycloudflare.com`**
- **Status**: Live, HTTPS secured, and accessible globally from any phone, laptop, or browser.
- **How it works**: Cloudflare forwards requests directly to your unified Express server on port `5000` (which serves both the React UI and the REST API).

> **To restart the tunnel anytime in the future:**
> ```powershell
> # Start the server first
> npm run server
> 
> # In a second terminal, start the tunnel
> npm run tunnel
> ```

---

## 2. 🚀 Permanent 24/7 Cloud Deployment (Stays online even when laptop is turned off)

For submitting your project to **InspireLeap**, deploying to a free cloud hosting provider ensures the reviewers can test your app at any time of day or night.

### Free Option A: Deploy on Render.com (Recommended - 5 Minutes)

1. Push your project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Athena Library Management System - MERN Stack"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. Go to **[Render.com](https://render.com/)** and sign in with GitHub.

3. Click **New +** -> **Web Service**.

4. Select your GitHub repository.

5. Fill in the settings:
   - **Name**: `athena-library-system`
   - **Environment**: `Node`
   - **Region**: Closest to you (e.g., Singapore / Frankfurt)
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     npm run install:all && npm --prefix client run build
     ```
   - **Start Command**:
     ```bash
     npm --prefix server start
     ```
   - **Plan**: `Free`

6. Click **Deploy Web Service**!
   Render will build the app and give you a permanent URL like:
   `https://athena-library-system.onrender.com`

---

## 3. 📧 Email Submission Template for InspireLeap

You can use this email draft when submitting before **5th November**:

```text
To: hr@inspireleap.in
Subject: Project Submission: Library Management System (MERN Stack) - [Your Name]

Dear InspireLeap Evaluation Team,

I am pleased to submit my completed mandatory project for the Library Management System developed using the MERN stack (MongoDB, Express.js, React.js, Node.js).

Key Highlights of the Implementation:
- Central Dashboard with real-time statistics (total books, members, issued, and returned books)
- Full CRUD Book Catalog management with inventory and stock tracking
- Member management directory
- Real-time Book Issuance system with stock validation (preventing out-of-stock loans)
- Transaction circulation records with one-click book returns
- Responsive glassmorphic UI with modern typography and toast feedback

Project Links:
- Live Demo URL: [Insert your Render or live public URL here]
- GitHub Repository: [Insert your GitHub URL here]

Thank you for the opportunity.

Sincerely,
[Your Name]
[Your Contact Information]
```
