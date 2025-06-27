# 🔐 Admin Access Guide

## How to Access the Admin Panel

### Method 1: Create Admin User via Script (Recommended)

1. **Run the admin creation script:**
   ```bash
   node create-admin-user.js
   ```

2. **Default admin credentials will be created:**
   - **Email:** `admin@healthcare.com`
   - **Password:** `admin123456`

3. **Access the admin panel:**
   - Go to: http://localhost:3001/login
   - Log in with the admin credentials
   - You'll be redirected to: http://localhost:3001/admin/dashboard

### Method 2: Manual Database Admin Creation

If you prefer to create an admin user manually:

1. **Open Prisma Studio:**
   ```bash
   npx prisma studio
   ```

2. **Create a new User record:**
   - **email:** `admin@healthcare.com`
   - **password:** Use a bcrypt hash (you can generate one online)
   - **firstName:** `Admin`
   - **lastName:** `User`
   - **role:** `ADMIN`
   - **isVerified:** `true`
   - **isActive:** `true`

3. **Access the admin panel** using the credentials you set.

### Method 3: Update Existing User to Admin

1. **Find an existing user** in Prisma Studio or database
2. **Update their role** from `PATIENT` or `DOCTOR` to `ADMIN`
3. **Log in** with that user's credentials
4. **Access admin panel** at http://localhost:3001/admin/dashboard

## 🎛️ Admin Panel Features

Once logged in as an admin, you'll have access to:

### Main Admin Dashboard (`/admin/dashboard`)
- System overview and statistics
- Recent user registrations
- Platform health metrics
- Quick actions panel

### User Management (`/admin/users`)
- View all users (patients, doctors, admins)
- Edit user information
- Activate/deactivate accounts
- Reset user passwords
- User analytics and reporting

### Doctor Management (`/admin/doctors`)
- View all registered doctors
- Approve/reject doctor applications
- Manage doctor specializations
- View doctor performance metrics
- Assign doctor schedules

### Analytics Dashboard (`/admin/analytics`)
- Platform usage statistics
- User engagement metrics
- Revenue and billing analytics
- Appointment statistics
- Growth trends and reports

### System Settings (`/admin/settings`)
- Platform configuration
- Security settings
- Email and notification settings
- API configuration
- Database maintenance tools

## 🔒 Security Considerations

### Important Security Steps:

1. **Change Default Password:**
   - Log in to admin panel
   - Go to Profile or Settings
   - Change the default password immediately

2. **Secure Admin Credentials:**
   - Use a strong, unique password
   - Consider enabling 2FA if implemented
   - Don't share admin credentials

3. **Regular Admin Access Review:**
   - Regularly review who has admin access
   - Remove admin access for users who no longer need it
   - Monitor admin activity logs

## 🚨 Troubleshooting Admin Access

### Can't Access Admin Panel?

1. **Check user role:**
   ```bash
   # Open Prisma Studio and verify user role is "ADMIN"
   npx prisma studio
   ```

2. **Clear browser cache and cookies**

3. **Check server logs** for authentication errors

4. **Verify the admin pages exist:**
   - /admin/dashboard
   - /admin/users  
   - /admin/doctors
   - /admin/analytics
   - /admin/settings

### Admin Features Not Working?

1. **Check API routes:**
   - Verify `/api/admin/*` routes exist
   - Check server logs for errors

2. **Database connection:**
   - Ensure database is running
   - Check Prisma connection

3. **Authentication:**
   - Verify JWT tokens are working
   - Check auth middleware

## 📍 Admin Panel URLs

Once logged in as admin, you can access:

- **Main Dashboard:** http://localhost:3001/admin/dashboard
- **User Management:** http://localhost:3001/admin/users
- **Doctor Management:** http://localhost:3001/admin/doctors  
- **Analytics:** http://localhost:3001/admin/analytics
- **Settings:** http://localhost:3001/admin/settings

## 🛠️ Development Notes

### Navigation Updates
The navigation bar automatically shows admin-specific menu items when logged in as an admin user. The navigation includes:

- Dashboard
- Users
- Doctors
- Analytics  
- Settings

### Role-Based Access
The system uses role-based access control (RBAC):
- **PATIENT** - Patient portal access
- **DOCTOR** - Doctor dashboard and tools
- **ADMIN** - Full administrative access

### Admin API Endpoints
Available admin API routes:
- `GET/POST /api/admin/dashboard` - Dashboard data
- `GET/POST /api/admin/users` - User management
- `GET/POST /api/admin/doctors` - Doctor management
- `GET /api/admin/analytics` - Analytics data
- `GET/POST /api/admin/settings` - System settings

---

**Happy Administering! 🎉**

For technical support or questions about admin features, check the server logs or contact the development team.
