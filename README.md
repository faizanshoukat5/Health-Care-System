# Healthcare Management Platform

A comprehensive healthcare management system built with Next.js, TypeScript, and modern web technologies. The platform includes patient portals, doctor dashboards, telemedicine capabilities, appointment booking, and medical records management.

## 🚀 Features

### For Patients
- **Patient Portal**: Access medical records, test results, and health information
- **Appointment Booking**: Schedule appointments with healthcare providers
- **Telemedicine**: Video consultations with doctors
- **Health Monitoring**: Track vital signs and health metrics
- **Prescription Management**: View active prescriptions and medication reminders

### For Healthcare Providers
- **Doctor Dashboard**: Manage patient appointments and medical records
- **Electronic Health Records (EHR)**: Comprehensive patient record management
- **Video Consultations**: Secure telemedicine platform with WebRTC
- **Practice Management**: Availability scheduling and patient communication
- **Prescription Writing**: Digital prescription management

### Security & Compliance
- **HIPAA Compliant**: Enterprise-grade security for healthcare data
- **End-to-End Encryption**: Secure data transmission and storage
- **Role-Based Access Control**: Proper authentication and authorization
- **Audit Logging**: Complete audit trail for medical record access

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form** with Zod validation
- **TanStack Query** for data fetching
- **Zustand** for state management
- **Framer Motion** for animations

### Backend
- **Next.js API Routes**
- **Prisma ORM** with PostgreSQL
- **JWT Authentication** with bcrypt
- **Socket.io** for real-time communication
- **WebRTC** for video calling

### Additional Services
- **Twilio** for SMS notifications
- **SendGrid** for email notifications
- **AWS S3** for file storage (optional)
- **Stripe** for payments (optional)

## 📋 Prerequisites

Before setting up the project, make sure you have the following installed:

1. **Node.js** (v18 or later) - Download from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL** - Download from [postgresql.org](https://www.postgresql.org/download/)
3. **Git** - Download from [git-scm.com](https://git-scm.com/)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment variables file and update with your credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your actual values:

```env
# Database (Required)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/healthcare_db"

# Authentication (Required)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
NEXTAUTH_SECRET="your-nextauth-secret-key-also-32-characters-minimum"
NEXTAUTH_URL="http://localhost:3000"

# Email (Optional - for notifications)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourhealthcare.com"

# SMS (Optional - for notifications)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"
```

### 3. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE healthcare_db;
```

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Open Prisma Studio to view your database
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── appointments/  # Appointment management
│   │   ├── patients/      # Patient data endpoints
│   │   └── doctors/       # Doctor data endpoints
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # App providers
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── features/         # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # General utilities
├── stores/               # Zustand stores
├── types/                # TypeScript type definitions
└── styles/               # Additional styles
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database with sample data
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with secure HTTP-only cookies
- Role-based access control (Patient, Doctor, Admin)
- Password hashing with bcrypt
- Session management with automatic token refresh

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention with Prisma ORM
- XSS protection with Content Security Policy
- CSRF protection with SameSite cookies

### HIPAA Compliance
- Encrypted data transmission (HTTPS required in production)
- Audit logging for all medical record access
- User consent management
- Data minimization and retention policies

## 🎥 Telemedicine Features

### Video Calling
- WebRTC peer-to-peer connections
- Screen sharing capabilities
- Real-time chat during calls
- Call recording (with consent)
- High-quality audio/video transmission

### Meeting Management
- Automated meeting link generation
- Calendar integration
- Pre-call lobby/waiting room
- Call quality monitoring
- Automatic reconnection handling

## 📱 Responsive Design

The platform is fully responsive and works seamlessly across:
- **Desktop**: Full-featured dashboard experience
- **Tablet**: Optimized touch interface
- **Mobile**: Essential features with mobile-first design

## 🔧 Configuration

### Database Configuration
The application uses Prisma ORM with PostgreSQL. Update your database connection in `.env.local`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Email Configuration (SendGrid)
For email notifications, configure SendGrid:

```env
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"
```

### SMS Configuration (Twilio)
For SMS notifications, configure Twilio:

```env
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-number"
```

## 🚀 Deployment

### Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set up production database**:
   - Create a production PostgreSQL database
   - Update `DATABASE_URL` in production environment

3. **Deploy to your platform** (Vercel, Netlify, Railway, etc.):
   - Vercel: `npx vercel`
   - Railway: `railway deploy`
   - Docker: Use the included Dockerfile

### Environment Variables for Production
Make sure to set all required environment variables in your production environment:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 Documentation

### API Documentation
API endpoints are documented using OpenAPI/Swagger. Access the documentation at:
```
http://localhost:3000/api/docs
```

### Database Schema
View the complete database schema in `prisma/schema.prisma` or use Prisma Studio:
```bash
npm run db:studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write tests for new features
- Follow HIPAA compliance guidelines
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- Check the [Issues](https://github.com/yourusername/healthcare-platform/issues) page
- Review the [Documentation](https://docs.yourhealthcareplatform.com)
- Contact support: support@yourhealthcareplatform.com

### Common Issues

#### Database Connection Issues
```bash
# Reset database
npm run db:reset

# Check connection
npm run db:studio
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Mobile app (React Native)
- [ ] AI-powered health insights
- [ ] Integration with wearable devices
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Telehealth marketplace

### Version 1.1 (In Progress)
- [ ] Payment processing with Stripe
- [ ] Insurance verification
- [ ] Lab results integration
- [ ] Prescription e-prescribing
- [ ] Advanced reporting

---

**Built with ❤️ for better healthcare experiences**
