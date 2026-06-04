import { School, Student, Payment, SchoolOption, SchoolClassLevel, Bulletin, LessonPreparation, ClassJournalEntry } from './types';

export const SCHOOL_OPTIONS: { value: SchoolOption; label: string; description: string }[] = [
  { value: 'Pédagogie', label: 'Option Pédagogie Générale', description: 'Formation des futurs enseignants et éducateurs de l’éducatif de base.' },
  { value: 'Latin-Philo', label: 'Option Littéraire (Latin-Philosophie)', description: 'Matières centrées sur les langues classiques, la philosophie et la rhétorique.' },
  { value: 'Biochimie', label: 'Option Biochimie-Génie Biologique', description: 'Études avancées en chimie, biologie, structures organiques et vivantes.' },
  { value: 'Sociale', label: 'Option Sociale et Humaine', description: 'Gestion des relations socio-éducatives et administration humaine.' },
  { value: 'Math-Physique', label: 'Option Scientifique (Mathématique-Physique)', description: 'Matières axées sur les sciences pures, calcul vectoriel, dynamique, mécanique.' },
  { value: 'Commerciale', label: 'Option Commerciale et Gestion', description: 'Comptabilité générale, notions d’économie, fiscalité et secrétariat moderne.' },
  { value: 'Nutrition', label: 'Option Nutrition et Alimentation', description: 'Diététique scolaire, structures culinaires et technologie alimentaire.' },
  { value: 'Pêche et Navigation', label: 'Option Pêche maritime et Navigation', description: 'Techniques halieutiques, repérage et sécurité sur le fleuve Congo.' },
  { value: 'Électricité', label: 'Option Industrielle (Électricité)', description: 'Électrotechnique, bobinage, automatisation et réseaux d’alimentation.' },
  { value: 'Menuiserie', label: 'Option Menuiserie et Ébénisterie', description: 'Travail du bois, conception de meubles, construction et coffrage.' },
  { value: 'Coupe-Couture', label: 'Option Coupe et Couture', description: 'Stylisme, couture industrielle, traçage de patrons et confection.' },
  { value: 'Architecture', label: 'Option Architecture et Construction', description: 'Bâtiment et travaux publics, dessin technique et génie civil.' }
];

export const CLASS_LEVELS: SchoolClassLevel[] = [
  '7ème EB',
  '8ème EB',
  '1ère Des humanités',
  '2ème Des humanités',
  '3ème Des humanités',
  '4ème Des humanités'
];

export const PROVINCES_26 = [
  'Kinshasa',
  'Kongo-Central',
  'Kwango',
  'Kwilu',
  'Mai-Ndombe',
  'Équateur',
  'Mongala',
  'Nord-Ubangi',
  'Sud-Ubangi',
  'Tshuapa',
  'Bas-Uélé',
  'Haut-Uélé',
  'Ituri',
  'Tshopo',
  'Nord-Kivu',
  'Sud-Kivu',
  'Maniema',
  'Haut-Katanga',
  'Haut-Lomami',
  'Lualaba',
  'Tanganyika',
  'Lomami',
  'Sankuru',
  'Kasaï',
  'Kasaï-Central',
  'Kasaï-Oriental'
];

export const MONTHS = [
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin'
];

// Official school courses assigned dynamic by option
export const COURSES_BY_OPTION: Record<SchoolOption, { name: string; maxPoints: number }[]> = {
  'Pédagogie': [
    { name: 'Psychologie Pédagogique', maxPoints: 40 },
    { name: 'Didactique Générale', maxPoints: 40 },
    { name: 'Histoire de la Pédagogie', maxPoints: 20 },
    { name: 'Français (Linguistique & Littérature)', maxPoints: 40 },
    { name: 'Mathématiques de Base', maxPoints: 40 },
    { name: 'Histoire & Géographie rdc', maxPoints: 20 },
    { name: 'Civisme & Éthique', maxPoints: 20 }
  ],
  'Latin-Philo': [
    { name: 'Philosophie Générale', maxPoints: 40 },
    { name: 'Langue & Littérature Latine', maxPoints: 40 },
    { name: 'Français (Stylistique & Rhétorique)', maxPoints: 40 },
    { name: 'Histoire Universelle & RDC', maxPoints: 20 },
    { name: 'Géographie Physique', maxPoints: 20 },
    { name: 'Anglais Littéraire', maxPoints: 20 },
    { name: 'Logique Formelle', maxPoints: 20 }
  ],
  'Biochimie': [
    { name: 'Biologie Animale & Végétale', maxPoints: 40 },
    { name: 'Chimie Organique', maxPoints: 40 },
    { name: 'Chimie Inorganique', maxPoints: 20 },
    { name: 'Physique Moléculaire', maxPoints: 40 },
    { name: 'Mathématiques Appliquées', maxPoints: 20 },
    { name: 'Français', maxPoints: 20 },
    { name: 'Anglais Scientifique', maxPoints: 20 }
  ],
  'Sociale': [
    { name: 'Sociologie Générale', maxPoints: 40 },
    { name: 'Sciences Civiques & Morales', maxPoints: 40 },
    { name: 'Notions de Droit Congolais', maxPoints: 20 },
    { name: 'Économie Familiale', maxPoints: 40 },
    { name: 'Français Moderne', maxPoints: 20 },
    { name: 'Histoire & Culture Africaine', maxPoints: 20 },
    { name: 'Anglais de Communication', maxPoints: 20 }
  ],
  'Math-Physique': [
    { name: 'Algèbre & Analyse Mathématique', maxPoints: 40 },
    { name: 'Géométrie Vectorielle & Trigonométrie', maxPoints: 40 },
    { name: 'Physique Optique & Mécanique', maxPoints: 40 },
    { name: 'Chimie Minérale', maxPoints: 20 },
    { name: 'Informatique & Programmation', maxPoints: 20 },
    { name: 'Français Technique', maxPoints: 20 },
    { name: 'Dessin Industriel', maxPoints: 20 }
  ],
  'Commerciale': [
    { name: 'Comptabilité Générale', maxPoints: 40 },
    { name: 'Commerce & Législation commerciale', maxPoints: 40 },
    { name: 'Économie Politique', maxPoints: 20 },
    { name: 'Mathématiques Financières', maxPoints: 40 },
    { name: 'Fiscalité Congolaise', maxPoints: 20 },
    { name: 'Français Commercial', maxPoints: 20 },
    { name: 'Dactylographie & Secrétariat', maxPoints: 20 }
  ],
  'Nutrition': [
    { name: 'Diététique & Hygiène Alimentaire', maxPoints: 40 },
    { name: 'Technique Culinaire', maxPoints: 40 },
    { name: 'Microbiologie Alimentaire', maxPoints: 20 },
    { name: 'Chimie des Aliments', maxPoints: 20 },
    { name: 'Français', maxPoints: 20 },
    { name: 'Administration d’un Restaurant', maxPoints: 20 }
  ],
  'Pêche et Navigation': [
    { name: 'Techniques des Pêches', maxPoints: 40 },
    { name: 'Navigation Fluviale & Lacustre', maxPoints: 40 },
    { name: 'Cartographie & Radio-Goniométrie', maxPoints: 20 },
    { name: 'Biologie Marine/Ichtyologie', maxPoints: 20 },
    { name: 'Français', maxPoints: 20 },
    { name: 'Mécanique Navale Élémentaire', maxPoints: 20 }
  ],
  'Électricité': [
    { name: 'Électrotechnique & Analyse Électrique', maxPoints: 40 },
    { name: 'Installation & Schémas Électriques', maxPoints: 40 },
    { name: 'Machines Électriques & Transformateurs', maxPoints: 20 },
    { name: 'Mesures Électriques', maxPoints: 20 },
    { name: 'Mathématiques Appliquées', maxPoints: 20 },
    { name: 'Automatique & Bobinage', maxPoints: 20 }
  ],
  'Menuiserie': [
    { name: 'Technologie du Bois', maxPoints: 40 },
    { name: 'Dessin Technique & Projection de Meubles', maxPoints: 40 },
    { name: 'Atelier de Menuiserie d’Art', maxPoints: 20 },
    { name: 'Charpente & Maçonnerie de Bois', maxPoints: 20 },
    { name: 'Mathématiques d’Atelier', maxPoints: 20 },
    { name: 'Français', maxPoints: 20 }
  ],
  'Coupe-Couture': [
    { name: 'Patronnage & Gradation', maxPoints: 40 },
    { name: 'Coupe & Couture Industrielle', maxPoints: 40 },
    { name: 'Technologie des Textiles', maxPoints: 20 },
    { name: 'Histoire du Costume & Mode', maxPoints: 20 },
    { name: 'Dessin Artistique de Mode', maxPoints: 20 },
    { name: 'Français', maxPoints: 20 }
  ],
  'Architecture': [
    { name: 'Dessin d’Architecture & CAO', maxPoints: 40 },
    { name: 'Matériaux de Construction & Bâtiment', maxPoints: 40 },
    { name: 'Résistance des Matériaux (RDM)', maxPoints: 20 },
    { name: 'Topographie & Métré', maxPoints: 20 },
    { name: 'Urbanisme & Législation immobilière', maxPoints: 20 },
    { name: 'Français Professionnel', maxPoints: 20 }
  ]
};

// Realistic school fees per trimester in DRC
export const FEE_PER_MONTH_USD = 15; // standard Minerval/Frais de fonctionnement

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'sc-1',
    name: 'Collège Boboto',
    province: 'Kinshasa',
    city: 'Kinshasa',
    commune: 'Gombe',
    nationalCode: '10103409',
    rectorName: 'Révérend Père Préfet Jean-Michel',
    isApproved: true,
    rectorEmail: 'jean.michel@boboto.cd',
    rectorPhone: '+243 815 112 233'
  },
  {
    id: 'sc-2',
    name: 'Lycée Kabambare',
    province: 'Kinshasa',
    city: 'Kinshasa',
    commune: 'Kinshasa',
    nationalCode: '10104822',
    rectorName: 'Sœur Préfète Aimée Mbuyi',
    isApproved: true,
    rectorEmail: 'aimee.mbuyi@kabambare.com',
    rectorPhone: '+243 994 482 110'
  },
  {
    id: 'sc-3',
    name: 'Institut de Goma',
    province: 'Nord-Kivu',
    city: 'Goma',
    commune: 'Karisimbi',
    nationalCode: '20205118',
    rectorName: 'Monsieur le Préfet Pascal Mupende',
    isApproved: true,
    rectorEmail: 'pascal.mupende@instgoma.net',
    rectorPhone: '+243 853 445 566'
  },
  {
    id: 'sc-4',
    name: 'Collège Imara',
    province: 'Haut-Katanga',
    city: 'Lubumbashi',
    commune: 'Lubumbashi',
    nationalCode: '30302194',
    rectorName: 'Monseigneur l’Abbé Sylvain Nkulu',
    isApproved: true,
    rectorEmail: 'sylvain.nkulu@imara.cd',
    rectorPhone: '+243 892 783 911'
  },
  {
    id: 'sc-5',
    name: 'Collège Alfajiri',
    province: 'Sud-Kivu',
    city: 'Bukavu',
    commune: 'Ibanda',
    nationalCode: '40401827',
    rectorName: 'Père Préfet Jean-Claude Baguma',
    isApproved: true,
    rectorEmail: 'jc.baguma@alfajiri.org',
    rectorPhone: '+243 812 554 990'
  },
  {
    id: 'sc-6',
    name: 'Institut Maele',
    province: 'Tshopo',
    city: 'Kisangani',
    commune: 'Makiso',
    nationalCode: '50503112',
    rectorName: 'Préfet Thaddée Lihamba',
    isApproved: false,
    rectorEmail: 'thaddee.lihamba@maele.org',
    rectorPhone: '+243 991 223 344'
  },
  {
    id: 'sc-7',
    name: 'Lycée Bosangani',
    province: 'Kinshasa',
    city: 'Kinshasa',
    commune: 'Gombe',
    nationalCode: '10108849',
    rectorName: 'Mère Supérieure Hélène Ngalula',
    isApproved: true,
    rectorEmail: 'helene.ngalula@bosangani.cd',
    rectorPhone: '+243 855 667 788'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'EP-2026-0001',
    fullName: 'Placide Mwamba Kabongo',
    gender: 'M',
    birthDate: '2010-04-12',
    address: 'Av. de l’Avenue 45, Q. Jolie Site',
    classLevel: '4ème Des humanités',
    option: 'Latin-Philo',
    schoolId: 'sc-1',
    guardianName: 'Augustin Mwamba',
    enrollmentDate: '2021-09-05'
  },
  {
    id: 'EP-2026-0002',
    fullName: 'Grâce Kabange Ilunga',
    gender: 'F',
    birthDate: '2009-11-23',
    address: 'Chambres 8, Cité de l’Étoile',
    classLevel: '4ème Des humanités',
    option: 'Biochimie',
    schoolId: 'sc-2',
    guardianName: 'Hélène Ilunga',
    enrollmentDate: '2021-09-05'
  },
  {
    id: 'EP-2026-0003',
    fullName: 'Amani Mulumba Nzaji',
    gender: 'M',
    birthDate: '2011-01-30',
    address: 'Rond-Point Signers 14b',
    classLevel: '3ème Des humanités',
    option: 'Math-Physique',
    schoolId: 'sc-3',
    guardianName: 'Jérôme Mulumba',
    enrollmentDate: '2022-09-02'
  },
  {
    id: 'EP-2026-0004',
    fullName: 'Sarah Mpiana Kasanda',
    gender: 'F',
    birthDate: '2010-08-15',
    address: 'Rue Kapenda 124, Bel-Air',
    classLevel: '4ème Des humanités',
    option: 'Commerciale',
    schoolId: 'sc-4',
    guardianName: 'Dieudonné Kasanda',
    enrollmentDate: '2021-09-04'
  },
  {
    id: 'EP-2026-0005',
    fullName: 'Exaucé Kabasele Tshilumba',
    gender: 'M',
    birthDate: '2011-02-18',
    address: 'Av. Kabinda 33, Q. Lingwala',
    classLevel: '2ème Des humanités',
    option: 'Pédagogie',
    schoolId: 'sc-1',
    guardianName: 'Thomas Tshilumba',
    enrollmentDate: '2023-09-06'
  },
  {
    id: 'EP-2026-0006',
    fullName: 'Divine Mwabilu Mwanza',
    gender: 'F',
    birthDate: '2012-07-07',
    address: 'Av. de la Démocratie 120, Kasa-Vubu',
    classLevel: '1ère Des humanités',
    option: 'Pédagogie',
    schoolId: 'sc-2',
    guardianName: 'Anaclet Mwabilu',
    enrollmentDate: '2024-09-05'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'REC-2026-10041',
    studentId: 'EP-2026-0001',
    studentName: 'Placide Mwamba Kabongo',
    classLevel: '4ème Des humanités',
    option: 'Latin-Philo',
    schoolId: 'sc-1',
    amount: 45,
    currency: 'USD',
    month: 'Septembre',
    semester: '1er Semestre',
    date: '2025-09-10',
    referenceNumber: 'REF-BOBO-98231'
  },
  {
    id: 'REC-2026-10042',
    studentId: 'EP-2026-0002',
    studentName: 'Grâce Kabange Ilunga',
    classLevel: '4ème Des humanités',
    option: 'Biochimie',
    schoolId: 'sc-2',
    amount: 45,
    currency: 'USD',
    month: 'Septembre',
    semester: '1er Semestre',
    date: '2025-09-12',
    referenceNumber: 'REF-LYC-18492'
  },
  {
    id: 'REC-2026-10043',
    studentId: 'EP-2026-0003',
    studentName: 'Amani Mulumba Nzaji',
    classLevel: '3ème Des humanités',
    option: 'Math-Physique',
    schoolId: 'sc-3',
    amount: 120000,
    currency: 'CDF',
    month: 'Octobre',
    semester: '1er Semestre',
    date: '2025-10-05',
    referenceNumber: 'REF-GOMA-02948'
  }
];

export const INITIAL_BULLETINS: Bulletin[] = [
  {
    id: 'bul-001',
    studentId: 'EP-2026-0001',
    classLevel: '4ème Des humanités',
    option: 'Latin-Philo',
    schoolId: 'sc-1',
    academicYear: '2025-2026',
    conduct: 'Excellente',
    daysAbsent: 2,
    grades: [
      { courseName: 'Philosophie Générale', maxPoints: 40, obtainedFirstPeriod: 32, obtainedSecondPeriod: 34, obtainedExamFirstSemester: 31, obtainedThirdPeriod: 36, obtainedFourthPeriod: 35, obtainedExamSecondSemester: 38 },
      { courseName: 'Langue & Littérature Latine', maxPoints: 40, obtainedFirstPeriod: 28, obtainedSecondPeriod: 30, obtainedExamFirstSemester: 32, obtainedThirdPeriod: 31, obtainedFourthPeriod: 33, obtainedExamSecondSemester: 34 },
      { courseName: 'Français (Stylistique & Rhétorique)', maxPoints: 40, obtainedFirstPeriod: 35, obtainedSecondPeriod: 31, obtainedExamFirstSemester: 36, obtainedThirdPeriod: 34, obtainedFourthPeriod: 37, obtainedExamSecondSemester: 35 },
      { courseName: 'Histoire Universelle & RDC', maxPoints: 20, obtainedFirstPeriod: 15, obtainedSecondPeriod: 16, obtainedExamFirstSemester: 14, obtainedThirdPeriod: 18, obtainedFourthPeriod: 17, obtainedExamSecondSemester: 18 },
      { courseName: 'Géographie Physique', maxPoints: 20, obtainedFirstPeriod: 14, obtainedSecondPeriod: 12, obtainedExamFirstSemester: 15, obtainedThirdPeriod: 16, obtainedFourthPeriod: 15, obtainedExamSecondSemester: 17 },
      { courseName: 'Anglais Littéraire', maxPoints: 20, obtainedFirstPeriod: 18, obtainedSecondPeriod: 17, obtainedExamFirstSemester: 18, obtainedThirdPeriod: 17, obtainedFourthPeriod: 19, obtainedExamSecondSemester: 18 },
      { courseName: 'Logique Formelle', maxPoints: 20, obtainedFirstPeriod: 16, obtainedSecondPeriod: 15, obtainedExamFirstSemester: 16, obtainedThirdPeriod: 15, obtainedFourthPeriod: 16, obtainedExamSecondSemester: 18 }
    ]
  },
  {
    id: 'bul-002',
    studentId: 'EP-2026-0002',
    classLevel: '4ème Des humanités',
    option: 'Biochimie',
    schoolId: 'sc-2',
    academicYear: '2025-2026',
    conduct: 'Très Bonne',
    daysAbsent: 0,
    grades: [
      { courseName: 'Biologie Animale & Végétale', maxPoints: 40, obtainedFirstPeriod: 36, obtainedSecondPeriod: 34, obtainedExamFirstSemester: 35, obtainedThirdPeriod: 37, obtainedFourthPeriod: 38, obtainedExamSecondSemester: 39 },
      { courseName: 'Chimie Organique', maxPoints: 40, obtainedFirstPeriod: 32, obtainedSecondPeriod: 35, obtainedExamFirstSemester: 33, obtainedThirdPeriod: 36, obtainedFourthPeriod: 35, obtainedExamSecondSemester: 38 },
      { courseName: 'Chimie Inorganique', maxPoints: 20, obtainedFirstPeriod: 16, obtainedSecondPeriod: 17, obtainedExamFirstSemester: 15, obtainedThirdPeriod: 18, obtainedFourthPeriod: 18, obtainedExamSecondSemester: 19 },
      { courseName: 'Physique Moléculaire', maxPoints: 40, obtainedFirstPeriod: 28, obtainedSecondPeriod: 31, obtainedExamFirstSemester: 30, obtainedThirdPeriod: 32, obtainedFourthPeriod: 34, obtainedExamSecondSemester: 33 },
      { courseName: 'Mathématiques Appliquées', maxPoints: 20, obtainedFirstPeriod: 14, obtainedSecondPeriod: 15, obtainedExamFirstSemester: 16, obtainedThirdPeriod: 15, obtainedFourthPeriod: 17, obtainedExamSecondSemester: 16 },
      { courseName: 'Français', maxPoints: 20, obtainedFirstPeriod: 15, obtainedSecondPeriod: 16, obtainedExamFirstSemester: 15, obtainedThirdPeriod: 16, obtainedFourthPeriod: 14, obtainedExamSecondSemester: 17 },
      { courseName: 'Anglais Scientifique', maxPoints: 20, obtainedFirstPeriod: 17, obtainedSecondPeriod: 18, obtainedExamFirstSemester: 17, obtainedThirdPeriod: 18, obtainedFourthPeriod: 19, obtainedExamSecondSemester: 18 }
    ]
  }
];

export const INITIAL_LESSONS: LessonPreparation[] = [
  {
    id: 'les-001',
    teacherName: 'Prof. Dieudonné Kande',
    schoolId: 'sc-1',
    courseName: 'Philosophie Générale',
    classLevel: '4ème Des humanités',
    option: 'Latin-Philo',
    date: '2026-05-28',
    subjectTitle: 'L’existentialisme de Jean-Paul Sartre',
    educationalObjective: 'À la fin de la séance, l’élève sera capable de définir l’existence précédant l’essence et d’exposer la notion d’angoisse existentielle selon Sartre.',
    reviewOfPreviousLesson: 'Rappel de la phénoménologie de Husserl et de la conscience intentionnelle.',
    lessonOutline: '1. Introduction : Contexte de l’après-guerre et crise de la rationalité. 2. L’existence précède l’essence : distinction homme vs objet. 3. La liberté absolue et la mauvaise foi. 4. L’angoisse et la responsabilité.',
    exercisesOrEvaluation: 'Questions orales : Quelle différence Sartre fait-il entre l’en-soi et le pour-soi ? Rédiger un paragraphe de 10 lignes sur la responsabilité morale.'
  }
];

export const INITIAL_JOURNAL: ClassJournalEntry[] = [
  {
    id: 'jou-001',
    date: '2026-05-27',
    schoolId: 'sc-1',
    classLevel: '4ème Des humanités',
    option: 'Latin-Philo',
    hourFrom: '08:00',
    hourTo: '09:50',
    subject: 'Philosophie Générale',
    taughtTopic: 'L’existentialisme sartrien - Introduction historique',
    absentStudentCount: 2,
    observedIncident: 'Séance calme, forte participation des élèves lors du débat sur la liberté.'
  }
];
