export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  phoneNumber: string;
  address: Address;
  emergencyContact: EmergencyContact;
  insuranceInfo?: InsuranceInfo;
  medicalHistory?: any;
  allergies: string[];
  medications: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  phoneNumber: string;
  qualifications: any;
  experience: number;
  consultationFee: number;
  availability: WeeklySchedule;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: Date;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  meetingLink?: string;
  patient?: Patient;
  doctor?: Doctor;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  vitals: VitalSigns;
  labResults?: LabResult[];
  attachments: string[];
  notes?: string;
  patient?: Patient;
  doctor?: Doctor;
  createdAt: Date;
  updatedAt: Date;
}

export interface VitalSigns {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
  bloodSugar?: number;
}

export interface LabResult {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medications: Medication[];
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: PrescriptionStatus;
  patient?: Patient;
  doctor?: Doctor;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  expirationDate?: Date;
}

export interface WeeklySchedule {
  [key: string]: DaySchedule[];
}

export interface DaySchedule {
  start: string;
  end: string;
  slots: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type AppointmentType = 'IN_PERSON' | 'TELEMEDICINE' | 'FOLLOW_UP' | 'EMERGENCY';

export type AppointmentStatus = 
  | 'SCHEDULED' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export type PrescriptionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type NotificationType = 
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'PRESCRIPTION_READY'
  | 'LAB_RESULTS_AVAILABLE'
  | 'SYSTEM_ALERT';

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'NURSE';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
