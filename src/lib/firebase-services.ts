// Firebase service functions for Healthcare Management Platform
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentReference,
  QuerySnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  User, 
  Patient, 
  Doctor, 
  Appointment, 
  MedicalRecord, 
  Prescription,
  VitalSigns,
  Notification,
  Payment
} from '../types/firebase-models';

// Collections
const COLLECTIONS = {
  USERS: 'users',
  PATIENTS: 'patients',
  DOCTORS: 'doctors',
  APPOINTMENTS: 'appointments',
  MEDICAL_RECORDS: 'medical_records',
  PRESCRIPTIONS: 'prescriptions',
  VITAL_SIGNS: 'vital_signs',
  NOTIFICATIONS: 'notifications',
  PAYMENTS: 'payments',
  DOCTOR_SCHEDULES: 'doctor_schedules'
};

// User Management
class UserService {
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return userRef.id;
  }

  static async getUserById(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
  }

  static async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      ...userData,
      updatedAt: Timestamp.now()
    });
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as User;
  }
}

// Doctor Management
class DoctorService {
  static async createDoctor(doctorData: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const doctorRef = await addDoc(collection(db, COLLECTIONS.DOCTORS), {
      ...doctorData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return doctorRef.id;
  }

  static async getAllDoctors(): Promise<Doctor[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.DOCTORS));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
  }

  static async getDoctorById(doctorId: string): Promise<Doctor | null> {
    const doctorDoc = await getDoc(doc(db, COLLECTIONS.DOCTORS, doctorId));
    return doctorDoc.exists() ? { id: doctorDoc.id, ...doctorDoc.data() } as Doctor : null;
  }

  static async getDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
    const q = query(
      collection(db, COLLECTIONS.DOCTORS), 
      where('specialization', 'array-contains', specialization)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
  }

  static async updateDoctor(doctorId: string, doctorData: Partial<Doctor>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.DOCTORS, doctorId), {
      ...doctorData,
      updatedAt: Timestamp.now()
    });
  }
}

// Patient Management
class PatientService {
  static async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const patientRef = await addDoc(collection(db, COLLECTIONS.PATIENTS), {
      ...patientData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return patientRef.id;
  }

  static async getPatientById(patientId: string): Promise<Patient | null> {
    const patientDoc = await getDoc(doc(db, COLLECTIONS.PATIENTS, patientId));
    return patientDoc.exists() ? { id: patientDoc.id, ...patientDoc.data() } as Patient : null;
  }

  static async updatePatient(patientId: string, patientData: Partial<Patient>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.PATIENTS, patientId), {
      ...patientData,
      updatedAt: Timestamp.now()
    });
  }

  static async getPatientsByDoctor(doctorId: string): Promise<Patient[]> {
    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where('doctorId', '==', doctorId)
    );
    const appointmentSnapshot = await getDocs(q);
    const patientIds = Array.from(new Set(appointmentSnapshot.docs.map(doc => doc.data().patientId)));
    
    const patients: Patient[] = [];
    for (const patientId of patientIds) {
      const patient = await this.getPatientById(patientId);
      if (patient) patients.push(patient);
    }
    return patients;
  }
}

// Appointment Management
class AppointmentService {
  static async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const appointmentRef = await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), {
      ...appointmentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return appointmentRef.id;
  }

  static async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    const appointmentDoc = await getDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId));
    return appointmentDoc.exists() ? { id: appointmentDoc.id, ...appointmentDoc.data() } as Appointment : null;
  }

  static async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where('patientId', '==', patientId),
      orderBy('dateTime', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  }

  static async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where('doctorId', '==', doctorId),
      orderBy('dateTime', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  }

  static async updateAppointment(appointmentId: string, appointmentData: Partial<Appointment>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId), {
      ...appointmentData,
      updatedAt: Timestamp.now()
    });
  }

  static async cancelAppointment(appointmentId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId), {
      status: 'cancelled',
      updatedAt: Timestamp.now()
    });
  }
}

// Medical Records Management
class MedicalRecordService {
  static async createMedicalRecord(recordData: Omit<MedicalRecord, 'id'>): Promise<string> {
    const recordRef = await addDoc(collection(db, COLLECTIONS.MEDICAL_RECORDS), recordData);
    return recordRef.id;
  }

  static async getMedicalRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    const q = query(
      collection(db, COLLECTIONS.MEDICAL_RECORDS),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalRecord));
  }

  static async updateMedicalRecord(recordId: string, recordData: Partial<MedicalRecord>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.MEDICAL_RECORDS, recordId), recordData);
  }
}

// Prescription Management
class PrescriptionService {
  static async createPrescription(prescriptionData: Omit<Prescription, 'id'>): Promise<string> {
    const prescriptionRef = await addDoc(collection(db, COLLECTIONS.PRESCRIPTIONS), prescriptionData);
    return prescriptionRef.id;
  }

  static async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    const q = query(
      collection(db, COLLECTIONS.PRESCRIPTIONS),
      where('patientId', '==', patientId),
      orderBy('issuedDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
  }

  static async updatePrescription(prescriptionId: string, prescriptionData: Partial<Prescription>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.PRESCRIPTIONS, prescriptionId), prescriptionData);
  }
}

// Notification Management
class NotificationService {
  static async createNotification(notificationData: Omit<Notification, 'id'>): Promise<string> {
    const notificationRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notificationData);
    return notificationRef.id;
  }

  static async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
      isRead: true
    });
  }
}

export {
  COLLECTIONS,
  UserService,
  DoctorService,
  PatientService,
  AppointmentService,
  MedicalRecordService,
  PrescriptionService,
  NotificationService
};
