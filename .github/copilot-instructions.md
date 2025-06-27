# Healthcare Management Platform - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a comprehensive Healthcare Management Platform built with Next.js, TypeScript, and modern web technologies. The platform includes patient portals, doctor dashboards, telemedicine capabilities, appointment booking, and medical records management.

## Key Technologies
- **Frontend**: Next.js 14+, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Real-time**: Socket.io for video calls and chat
- **Authentication**: JWT with secure session management
- **File Storage**: AWS S3 or local storage
- **Video Calls**: WebRTC for telemedicine
- **Notifications**: Twilio (SMS) and SendGrid (Email)

## Code Standards
- Use TypeScript for all components and API routes
- Follow React functional components with hooks pattern
- Implement proper error handling and validation with Zod
- Use Tailwind CSS for styling with custom design system
- Maintain HIPAA compliance standards for all medical data
- Implement proper authentication and authorization
- Use React Query (TanStack Query) for data fetching
- Follow secure coding practices for healthcare data

## Architecture Patterns
- Component-based architecture with reusable UI components
- Custom hooks for business logic
- Zustand for client-side state management
- API route handlers with proper middleware
- Database schema with proper relationships and constraints
- Real-time communication with Socket.io

## Security Considerations
- Always validate input data with Zod schemas
- Implement proper RBAC (Role-Based Access Control)
- Use HTTPS for all communications
- Encrypt sensitive medical data
- Implement audit logging for medical record access
- Follow HIPAA compliance guidelines

## File Structure Guidelines
- `/src/components/` - Reusable UI components
- `/src/app/` - Next.js app router pages and layouts
- `/src/lib/` - Utility functions and configurations
- `/src/hooks/` - Custom React hooks
- `/src/types/` - TypeScript type definitions
- `/src/stores/` - Zustand stores
- `/prisma/` - Database schema and migrations
