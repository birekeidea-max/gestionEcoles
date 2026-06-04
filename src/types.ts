/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'Enseignant'
  | 'Directeur'
  | 'Inspecteur'
  | 'Coordinateur'
  | 'Préfet des études'
  | 'Comptable'
  | 'Administrateur';

export interface User {
  fullName: string;
  phone: string;
  role: UserRole;
  schoolId: string;
  email?: string;
  timestamp?: string;
  matricule?: string;
  isOnline?: boolean;
  axe?: string;
}

export type SchoolOption =
  | 'Pédagogie'
  | 'Latin-Philo'
  | 'Biochimie'
  | 'Sociale'
  | 'Math-Physique'
  | 'Commerciale'
  | 'Nutrition'
  | 'Pêche et Navigation'
  | 'Électricité'
  | 'Menuiserie'
  | 'Coupe-Couture'
  | 'Architecture';

export type SchoolClassLevel = '7ème EB' | '8ème EB' | '1ère Des humanités' | '2ème Des humanités' | '3ème Des humanités' | '4ème Des humanités';

export interface School {
  id: string;
  name: string;
  province: string;
  city: string;
  commune: string;
  nationalCode: string; // Official RDC educational establishment code (e.g. "01014292")
  rectorName: string; // Préfet des études
  isApproved?: boolean; // Ministerial approval status
  rectorPhone?: string; // Contact phone of the registering Préfet
  rectorEmail?: string; // Contact email
  rectorPassword?: string; // Account password
  optionsOrganized?: SchoolOption[]; // Sections or pedagogical options organized by the school
}

export interface Student {
  id: string; // ID Élève (e.g., EP-2026-XXXX)
  fullName: string;
  gender: 'M' | 'F';
  birthDate: string;
  address: string;
  classLevel: SchoolClassLevel;
  option: SchoolOption;
  schoolId: string;
  photoUrl?: string; // If custom base64 or placeholder
  guardianName: string;
  enrollmentDate: string;
}

export interface Payment {
  id: string; // ID Reçu
  studentId: string;
  studentName: string;
  classLevel: SchoolClassLevel;
  option: SchoolOption;
  schoolId: string;
  amount: number; // in USD or CDF
  currency: 'USD' | 'CDF';
  month: string; // Janvier, Février, etc.
  semester: '1er Semestre' | '2ème Semestre';
  date: string;
  referenceNumber: string; // Unique token for QR verification
}

export interface CourseGrade {
  courseName: string;
  maxPoints: number; // Maximum score possible (e.g., 20 or 40)
  obtainedFirstPeriod: number; // 1ère période (Trimestre 1, A)
  obtainedSecondPeriod: number; // 2ème période (Trimestre 1, B)
  obtainedExamFirstSemester: number; // Examen du 1er Semestre
  obtainedThirdPeriod: number; // 3ème période (Trimestre 2, A)
  obtainedFourthPeriod: number; // 4ème période (Trimestre 2, B)
  obtainedExamSecondSemester: number; // Examen du 2ème Semestre
}

export interface Bulletin {
  id: string; // unique
  studentId: string;
  classLevel: SchoolClassLevel;
  option: SchoolOption;
  schoolId: string;
  academicYear: string; // e.g. "2025-2026"
  grades: CourseGrade[];
  conduct: 'Excellente' | 'Très Bonne' | 'Bonne' | 'Assez Bonne' | 'Médiocre';
  daysAbsent: number;
}

export interface CotationSheet {
  id: string;
  teacherName: string;
  courseName: string;
  classLevel: SchoolClassLevel;
  option: SchoolOption;
  schoolId: string;
  academicYear: string;
  grades: {
    studentId: string;
    studentName: string;
    interrogation1: number; // /10
    interrogation2: number; // /10
    devoir: number; // /10
    examen: number; // /25 ou /40 etc.
  }[];
}

export interface LessonPreparation {
  id: string;
  teacherName: string;
  schoolId: string;
  courseName: string;
  classLevel: SchoolClassLevel;
  option: SchoolOption;
  date: string;
  subjectTitle: string;
  educationalObjective: string;
  reviewOfPreviousLesson: string; // Répétition
  lessonOutline: string; // Matière à enseigner
  exercisesOrEvaluation: string; // Heuristique/Application
}

export interface ClassJournalEntry {
  id: string;
  date: string;
  schoolId: string;
  classLevel: SchoolClassLevel;
  option: SchoolOption;
  hourFrom: string; // e.g. "08:00"
  hourTo: string; // e.g. "09:50"
  subject: string;
  taughtTopic: string;
  absentStudentCount: number;
  observedIncident?: string;
}

export interface ArchivedFile {
  id: string;
  schoolId: string;
  fileName: string;
  fileType: 'image/png';
  savedDate: string;
  studentName: string;
  studentId: string;
  classLevel: SchoolClassLevel;
  option: SchoolOption;
  imageData: string; // base64 representation of the frozen bulletin image
}

export interface UserActivity {
  id: string;
  userName: string;
  userRole: UserRole;
  schoolName: string;
  action: string;
  timestamp: string;
  category: 'PEDAGOGICAL' | 'FINANCIAL' | 'SECURITY' | 'ADMINISTRATIVE';
  quality: 'Excellent' | 'Régulier' | 'Avertissement' | 'Critique';
  details?: string;
}


