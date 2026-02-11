# AWS Deployment Guide for Damrideal API

This guide provides step-by-step instructions to deploy the Damrideal Backend API (Node.js/Express) to an AWS EC2 instance.

## 1. Prerequisites

- An **AWS Account**.
- A **MongoDB Atlas** cluster (recommended for production) or a self-hosted MongoDB.
- An **S3 Bucket** (for file uploads).
- **Domain Name** (optional, for SSL/HTTPS).

---

## 2. Prepare the EC2 Instance

1.  **Launch Instance**:
    *   Log in to the AWS Console -> EC2 -> Launch Instance.
    *   Choose **Ubuntu 22.04 LTS** (Free Tier eligible).
    *   Instance Type: **t2.micro** (Free Tier eligible).
    *   Key Pair: Select or create a new .pem key pair.
2.  **Find Public IP**:
    *   Go to **EC2 Dashboard** -> **Instances**.
    *   Select your instance. 
    *   The **Public IPv4 address** is listed in the "Details" tab at the bottom.
3.  **Network Settings (Security Groups)**:
    *   Allow **SSH** (Port 22).
    *   Allow **HTTP** (Port 80).
    *   Allow **HTTPS** (Port 443).

---

## 3. Server Setup

Connect to your instance. 

> **⚠️ SECURITY NOTE**: NEVER share your `.pem` file or upload it to GitHub. It is a private key that stays only on your local machine.

```bash
ssh -i "path/to/your-key.pem" ubuntu@your-ec2-public-ip
```

### Install Node.js & NPM
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install Git & Clone Repository
```bash
sudo apt-get install git -y
git clone https://github.com/UtkarshDevv/damrideal-api
cd damrideal-api
```

### Install Dependencies
```bash
npm install
```

---

## 4. Environment Configuration

Create a `.env` file in the root directory:
```bash
nano .env
```

Add your production environment variables:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/damrideal?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=damrideal-uploads
```

---

## 5. Process Management (PM2)

Use PM2 to keep the server running in the background and restart on crash.

```bash
sudo npm install pm2 -g
pm2 start server.js --name damrideal-api
pm2 save
pm2 startup
```

---

## 6. Reverse Proxy (Nginx)

Nginx will redirect Port 80 traffic to your Node.js app on Port 5000.

1. **Install Nginx**:
   ```bash
   sudo apt install nginx -y
   ```
2. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/damrideal-api
   ```
   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your-public-ip-here; # <--- Replace with your EC2 Public IP

       location / {
           proxy_pass http://localhost:5000; # <--- Keep as localhost
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable Configuration**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/damrideal-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 7. SSL (HTTPS) with Certbot (Optional)

If you have a domain, use Let's Encrypt for free SSL.

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d yourdomain.com
```

---

## 8. Troubleshooting

- **Check Logs**: `pm2 logs damrideal-api`
- **Restart App**: `pm2 restart damrideal-api`
- **Check MongoDB Connection**: Ensure the EC2 instance IP is whitelisted in MongoDB Atlas Network Access.

---

## 9. Security Best Practices

1. **Firewall**: Ensure only Ports 22, 80, and 443 are open to the public.
2. **IAM**: Use an IAM Role for the EC2 instance instead of hardcoding AWS keys in `.env` (recommended).
3. **CI/CD**: Use Github Actions to automate deployments when you push code.
