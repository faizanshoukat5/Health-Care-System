// Healthcare data models for Firebase Firestore
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: Address;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Patient extends User {
  role: 'patient';
  medicalRecordNumber: string;
  emergencyContact: EmergencyContact;
  insuranceInfo?: InsuranceInfo;
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string[];
}

export interface Doctor extends User {
  role: 'doctor';
  licenseNumber: string;
  specialization: string[];
  department: string;
  education: Education[];
  experience: number;
  consultationFee: number;
  availability: Availability[];
  rating?: number;
  totalPatients?: number;
  languages?: string[];
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
  department: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: Date;
  duration: number; // in minutes
  type: 'in-person' | 'video-call' | 'phone-call';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  prescription?: Prescription[];
  followUpRequired?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  type: 'consultation' | 'test-result' | 'prescription' | 'procedure' | 'vaccination';
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  attachments?: FileAttachment[];
  vitals?: VitalSigns;
  createdAt: Date;
  isConfidential: boolean;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medications: Medication[];
  instructions: string;
  issuedDate: Date;
  validUntil: Date;
  status: 'active' | 'completed' | 'cancelled';
  refillsRemaining: number;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
}

export interface VitalSigns {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  recordedAt: Date;
  recordedBy: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
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
  expiryDate: Date;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
  specialization?: string;
}

export interface Availability {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'prescription' | 'test-result' | 'payment' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface Payment {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'insurance' | 'cash' | 'bank-transfer';
  transactionId?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  date: Date;
  timeSlots: TimeSlot[];
  isAvailable: boolean;
  notes?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  appointmentId?: string;
}
