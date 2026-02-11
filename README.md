# Damrideal API

Backend API for the Damrideal Real Estate and Services Application.

## Technology Stack

- **Node.js** & **Express**
- **MongoDB** (Mongoose ODM)
- **AWS S3** (Image and Document Storage)
- **Nodemailer** (Email Services)
- **JWT** (Authentication)

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Postman (for API testing)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd damrideal-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (refer to `.env.example` or ask the admin for details).
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

For detailed instructions on how to deploy this API to **AWS EC2**, please refer to the [AWS Deployment Guide](./AWS_DEPLOYMENT.md).

## API Endpoints

- `/api/auth` - Authentication & User Profile
- `/api/projects` - Property Listings & Projects
- `/api/requirements` - User Requirements
- `/api/upload` - Media Uploads (S3)
- `/api/settings` - Global App Settings
- `/api/admin` - Admin Authentication & Dashboard