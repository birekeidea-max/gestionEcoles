import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { downloadElementAsPDF, downloadImageAsPDF } from '../utils/pdfGenerator';
import { Bulletin, Student, School, CourseGrade, SchoolOption, SchoolClassLevel, ArchivedFile } from '../types';
import { COURSES_BY_OPTION, SCHOOL_OPTIONS, CLASS_LEVELS } from '../constants';
import { CongoFlagIcon, CongoCoatOfArms } from './CongoTheme';
import { 
  Award, 
  FileText, 
  CheckCircle, 
  Search, 
  Edit2, 
  Printer, 
  Plus, 
  X, 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  Save, 
  FileDown, 
  FileUp, 
  Trash2, 
  Building2, 
  HelpCircle,
  Clock,
  Check,
  Share2,
  Folder,
  Lock,
  Eye
} from 'lucide-react';

interface BulletinsPanelProps {
  bulletins: Bulletin[];
  students: Student[];
  currentSchool: School;
  schools?: School[];
  archivedFiles: ArchivedFile[];
  onAddBulletin: (bulletin: Bulletin) => void;
  onUpdateBulletin: (bulletin: Bulletin) => void;
  onSaveArchivedFile: (file: ArchivedFile) => void;
  onDeleteArchivedFile: (id: string) => void;
  onOpenQRScanner: (code: string) => void;
  onImportBulletins?: (importedList: Bulletin[]) => void;
}


// Helper functions to convert modern CSS color functions (like oklch or oklab) to RGB/RGBA.
// This is critical because html2canvas fails to parse them, throwing "unsupported color function oklab"
function convertOklabCoordsToRgba(L: number, a: number, b: number, alpha: number): string {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = Math.pow(Math.max(0, l_), 3);
  const m = Math.pow(Math.max(0, m_), 3);
  const s = Math.pow(Math.max(0, s_), 3);

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bVal = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const gamma = (x: number) => {
    return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  };

  const R = Math.round(Math.max(0, Math.min(1, gamma(r))) * 255);
  const G = Math.round(Math.max(0, Math.min(1, gamma(g))) * 255);
  const B = Math.round(Math.max(0, Math.min(1, gamma(bVal))) * 255);

  if (alpha === 1) {
    return `rgb(${R}, ${G}, ${B})`;
  } else {
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
  }
}

function convertModernColorsToRgb(str: string): string {
  if (!str || typeof str !== 'string') return str;
  
  let result = str;
  
  // Replace OKLCH
  result = result.replace(/oklch\s*\([^)]+\)/gi, (match) => {
    try {
      const matchInner = match.match(/oklch\s*\(([^)]+)\)/i);
      if (!matchInner) return match;
      
      const partsStr = matchInner[1].trim();
      const parts = partsStr.split(/[\s,+/]+/);
      if (parts.length < 3) return match;

      const parseVal = (p: string, max = 1) => {
        if (p.endsWith('%')) {
          return (parseFloat(p) / 100) * max;
        }
        return parseFloat(p);
      };

      const L = parseVal(parts[0]);
      const C = parseVal(parts[1]);
      
      let H_str = parts[2];
      let H = parseFloat(H_str);
      if (H_str.endsWith('deg')) {
        H = parseFloat(H_str);
      } else if (H_str.endsWith('rad')) {
        H = parseFloat(H_str) * (180 / Math.PI);
      } else if (H_str.endsWith('turn')) {
        H = parseFloat(H_str) * 360;
      } else if (H_str.endsWith('grad')) {
        H = parseFloat(H_str) * 0.9;
      }

      let alpha = 1;
      if (parts[3] !== undefined) {
        alpha = parseVal(parts[3]);
      }

      const hRad = (H * Math.PI) / 180;
      const a = C * Math.cos(hRad);
      const b = C * Math.sin(hRad);

      return convertOklabCoordsToRgba(L, a, b, alpha);
    } catch (e) {
      console.error("Error converting OKLCH color:", e);
      return match;
    }
  });

  // Replace OKLAB
  result = result.replace(/oklab\s*\([^)]+\)/gi, (match) => {
    try {
      const matchInner = match.match(/oklab\s*\(([^)]+)\)/i);
      if (!matchInner) return match;

      const partsStr = matchInner[1].trim();
      const parts = partsStr.split(/[\s,+/]+/);
      if (parts.length < 3) return match;

      const parseVal = (p: string, max = 1) => {
        if (p.endsWith('%')) {
          return (parseFloat(p) / 100) * max;
        }
        return parseFloat(p);
      };

      const L = parseVal(parts[0]);
      const a = parseVal(parts[1]);
      const b = parseVal(parts[2]);

      let alpha = 1;
      if (parts[3] !== undefined) {
        alpha = parseVal(parts[3]);
      }

      return convertOklabCoordsToRgba(L, a, b, alpha);
    } catch (e) {
      console.error("Error converting OKLAB color:", e);
      return match;
    }
  });

  return result;
}

const getBulletinTheme = (classLevel: string, option: string) => {
  let primaryText = 'text-blue-800';
  let bannerBg = 'from-blue-700 to-indigo-900 border-blue-500';
  let badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
  let headingFont = 'font-sans font-black';
  let tableHeaderBg = 'bg-blue-50/70 border-blue-400';
  let tableHeaderTextColor = 'text-blue-900';
  let tableAccentBorder = 'border-slate-300';
  let resultHighlight = 'text-emerald-850 bg-emerald-50/30';
  let sectionIconBg = 'bg-blue-50 text-blue-700';

  if (option === 'Pédagogie') {
    primaryText = 'text-emerald-800 font-serif';
    bannerBg = 'from-emerald-800 to-emerald-950 border-emerald-600';
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-250';
    headingFont = 'font-serif font-black';
    tableHeaderBg = 'bg-emerald-50 border-emerald-500';
    tableHeaderTextColor = 'text-emerald-900';
    tableAccentBorder = 'border-emerald-300';
    resultHighlight = 'text-emerald-900 bg-emerald-100/40';
    sectionIconBg = 'bg-emerald-50 text-emerald-700';
  } else if (option === 'Latin-Philo' || option === 'Littéraire') {
    primaryText = 'text-rose-900 font-serif font-medium';
    bannerBg = 'from-rose-900 to-amber-950 border-rose-600';
    badgeColor = 'bg-rose-50 text-rose-850 border-rose-250';
    headingFont = 'font-serif font-black italic';
    tableHeaderBg = 'bg-rose-100 border-rose-400';
    tableHeaderTextColor = 'text-rose-900';
    tableAccentBorder = 'border-rose-300';
    resultHighlight = 'text-rose-950 bg-rose-50/50';
    sectionIconBg = 'bg-rose-50 text-rose-800';
  } else if (option === 'Biochimie' || option === 'Nutrition' || option === 'Sociale') {
    primaryText = 'text-teal-800 font-sans';
    bannerBg = 'from-teal-700 to-cyan-950 border-teal-500';
    badgeColor = 'bg-teal-50 text-teal-850 border-teal-200';
    headingFont = 'font-sans font-extrabold tracking-wide';
    tableHeaderBg = 'bg-teal-50/60 border-teal-400';
    tableHeaderTextColor = 'text-teal-900';
    tableAccentBorder = 'border-teal-300';
    resultHighlight = 'text-teal-900 bg-teal-50/40';
    sectionIconBg = 'bg-teal-50 text-teal-700';
  } else if (option === 'Math-Physique' || option === 'Électricité' || option === 'Electronique') {
    primaryText = 'text-orange-900 font-mono';
    bannerBg = 'from-orange-700 to-slate-900 border-orange-500';
    badgeColor = 'bg-orange-50 text-orange-850 border-orange-200';
    headingFont = 'font-mono font-bold tracking-tight';
    tableHeaderBg = 'bg-orange-50 border-orange-400';
    tableHeaderTextColor = 'text-orange-900';
    tableAccentBorder = 'border-orange-300';
    resultHighlight = 'text-orange-950 bg-orange-50/20';
    sectionIconBg = 'bg-orange-50 text-orange-700';
  } else if (option === 'Commerciale' || option === 'Commerciale et Administrative') {
    primaryText = 'text-violet-800 font-sans';
    bannerBg = 'from-violet-750 to-indigo-950 border-violet-500';
    badgeColor = 'bg-violet-50 text-violet-850 border-violet-200';
    headingFont = 'font-sans font-bold uppercase tracking-wider';
    tableHeaderBg = 'bg-violet-50 border-violet-400';
    tableHeaderTextColor = 'text-violet-900';
    tableAccentBorder = 'border-violet-300';
    resultHighlight = 'text-violet-950 bg-violet-50/20';
    sectionIconBg = 'bg-violet-50 text-violet-700';
  }

  let containerBg = 'bg-amber-50/5';
  let outerBorder = 'border border-slate-200 rounded-xl';
  let titleBadgeStyle = 'px-3 py-1 font-mono tracking-widest text-[10px] uppercase font-black bg-slate-100 border text-slate-700 rounded-lg';
  let layoutAddon = '';

  if (classLevel && (classLevel.startsWith('1') || classLevel.startsWith('2'))) {
    containerBg = 'bg-sky-50/10';
    outerBorder = 'border-2 border-dashed border-sky-300 rounded-3xl';
    titleBadgeStyle = 'px-3 py-1 bg-sky-100 text-sky-850 border border-sky-200 text-[9.5px] uppercase font-bold rounded-full';
    layoutAddon = 'relative before:absolute before:inset-y-0 before:left-0 before:w-1 text-slate-800';
  } else if (classLevel && (classLevel.startsWith('3') || classLevel.startsWith('4'))) {
    containerBg = 'bg-white';
    outerBorder = 'border-4 border-double border-slate-700/80 rounded-none';
    titleBadgeStyle = 'px-3 py-1.5 bg-slate-900 text-white font-mono uppercase tracking-widest text-[9px] font-bold rounded-none';
    layoutAddon = 'shadow-xs ring-4 ring-slate-100';
  } else if (classLevel && (classLevel.startsWith('5') || classLevel.startsWith('6'))) {
    containerBg = 'bg-gradient-to-br from-yellow-50/5 via-white to-amber-50/10';
    outerBorder = 'border-[5px] border-double border-yellow-500/70 rounded-2xl';
    titleBadgeStyle = 'px-4 py-1.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 border border-yellow-600 text-[10px] font-black tracking-widest uppercase rounded-xl shadow-xs';
    layoutAddon = 'p-4 md:p-8';
  }

  return {
    primaryText,
    bannerBg,
    badgeColor,
    headingFont,
    tableHeaderBg,
    tableHeaderTextColor,
    tableAccentBorder,
    resultHighlight,
    sectionIconBg,
    containerBg,
    outerBorder,
    titleBadgeStyle,
    layoutAddon
  };
};

export const BulletinsPanel: React.FC<BulletinsPanelProps> = ({
  bulletins,
  students,
  currentSchool,
  schools = [currentSchool],
  archivedFiles = [],
  onAddBulletin,
  onUpdateBulletin,
  onSaveArchivedFile,
  onDeleteArchivedFile,
  onOpenQRScanner,
  onImportBulletins
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'LIST' | 'ARCHIVES'>('LIST');
  const [selectedArchiveView, setSelectedArchiveView] = useState<ArchivedFile | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeBulletin, setActiveBulletin] = useState<Bulletin | null>(null);
  const [sharingImage, setSharingImage] = useState<{ url: string; filename: string; studentName: string; bulletinId: string } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Real-time Autosave feedback indicator
  const [autoSavedFlash, setAutoSavedFlash] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // MULTI-STEP CREATOR CONFIG
  const [formSchoolId, setFormSchoolId] = useState(currentSchool.id);
  const [formOption, setFormOption] = useState<SchoolOption>('Pédagogie');
  const [formClass, setFormClass] = useState<SchoolClassLevel>('4ème Des humanités');

  // Student manual input settings
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualStudentGender, setManualStudentGender] = useState<'M' | 'F'>('M');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Course configuration states
  const [grades, setGrades] = useState<CourseGrade[]>([]);
  const [conduct, setConduct] = useState<Bulletin['conduct']>('Très Bonne');
  const [daysAbsent, setDaysAbsent] = useState<number>(0);

  // Manual course insertion controls
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseMaxPoints, setNewCourseMaxPoints] = useState<number>(20);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const matchedSchool = schools.find(s => s.id === formSchoolId) || currentSchool;

  // Filter lists based on selected school context
  const schoolStudents = students.filter(s => s.schoolId === currentSchool.id);
  const schoolBulletins = bulletins.filter(b => b.schoolId === currentSchool.id);
  const schoolArchivedFiles = (archivedFiles || []).filter(f => f.schoolId === currentSchool.id);

  const filteredBulletins = schoolBulletins.filter(b => {
    const student = students.find(s => s.id === b.studentId);
    const manualName = !student && b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return (student && student.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      manualName ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.option.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.classLevel.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate bullet parameters
  const getBulletinMetrics = (b: Bulletin) => {
    let currentTotalObtained = 0;
    let maxTotalAvailable = 0;

    b.grades.forEach(g => {
      currentTotalObtained += 
        g.obtainedFirstPeriod + 
        g.obtainedSecondPeriod + 
        g.obtainedExamFirstSemester + 
        g.obtainedThirdPeriod + 
        g.obtainedFourthPeriod + 
        g.obtainedExamSecondSemester;
      maxTotalAvailable += g.maxPoints * 6;
    });

    const percentage = maxTotalAvailable > 0 ? (currentTotalObtained / maxTotalAvailable) * 100 : 0;
    
    // Auto ranking calculated across matching class & option bulletins
    const peerBulletins = bulletins.filter(bullet => bullet.schoolId === b.schoolId && bullet.classLevel === b.classLevel && bullet.option === b.option);
    
    const parsedPeers = peerBulletins.map(pb => {
      let obtained = 0;
      let maxTotal = 0;
      pb.grades.forEach(g => {
        obtained += g.obtainedFirstPeriod + g.obtainedSecondPeriod + g.obtainedExamFirstSemester + g.obtainedThirdPeriod + g.obtainedFourthPeriod + g.obtainedExamSecondSemester;
        maxTotal += g.maxPoints * 6;
      });
      return { studentId: pb.studentId, ratio: maxTotal > 0 ? obtained / maxTotal : 0 };
    });

    parsedPeers.sort((a, b) => b.ratio - a.ratio);
    const rankIndex = parsedPeers.findIndex(entry => entry.studentId === b.studentId);
    const resolvedRank = rankIndex !== -1 ? rankIndex + 1 : 1;
    const rankSuffix = resolvedRank === 1 ? '1er(e)' : `${resolvedRank}ème`;

    return {
      obtained: currentTotalObtained,
      available: maxTotalAvailable,
      percentage: Number(percentage.toFixed(1)),
      rank: resolvedRank,
      rankText: `${rankSuffix} sur ${parsedPeers.length || 1}`
    };
  };

  const handleOpenCreateForm = () => {
    setFormSchoolId(currentSchool.id);
    setFormOption('Pédagogie');
    setFormClass('6ème Année');
    setSelectedStudentId('');
    setIsManualInput(false);
    setManualStudentName('');
    setManualStudentGender('M');
    setGrades([]);
    setConduct('Très Bonne');
    setDaysAbsent(0);
    setFormError('');
    setIsFormOpen(true);
    
    // Default load corresponding to 'Pédagogie' option
    loadGradesTemplate('Pédagogie');
  };

  const loadGradesTemplate = (opt: SchoolOption) => {
    const rawTemplate = COURSES_BY_OPTION[opt] || [];
    const seedGrades: CourseGrade[] = rawTemplate.map(c => ({
      courseName: c.name,
      maxPoints: c.maxPoints,
      obtainedFirstPeriod: Math.round(c.maxPoints * 0.7),
      obtainedSecondPeriod: Math.round(c.maxPoints * 0.75),
      obtainedExamFirstSemester: Math.round(c.maxPoints * 0.7),
      obtainedThirdPeriod: Math.round(c.maxPoints * 0.78),
      obtainedFourthPeriod: Math.round(c.maxPoints * 0.8),
      obtainedExamSecondSemester: Math.round(c.maxPoints * 0.75)
    }));
    setGrades(seedGrades);
  };

  const handleSchoolOptionClassChange = (selectedSch: string, selectedOpt: SchoolOption, selectedCl: SchoolClassLevel) => {
    setFormSchoolId(selectedSch);
    setFormOption(selectedOpt);
    setFormClass(selectedCl);
    setSelectedStudentId('');
    
    // Auto load base courses matching option
    loadGradesTemplate(selectedOpt);
  };

  const handleEnrolledStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    if (!id) return;

    const studentObj = students.find(s => s.id === id);
    if (!studentObj) return;

    // Check if bulletin already exist
    const matchedBul = bulletins.find(b => b.studentId === id);
    if (matchedBul) {
      setConduct(matchedBul.conduct);
      setDaysAbsent(matchedBul.daysAbsent);
      setGrades(matchedBul.grades);
      setFormError('Un bulletin existe déjà pour cet élève. Le modifier écrasera les modifications.');
    } else {
      setFormError('');
      loadGradesTemplate(studentObj.option);
    }
  };

  const handleGradeChange = (
    index: number,
    field: keyof Omit<CourseGrade, 'courseName' | 'maxPoints'>,
    value: string
  ) => {
    let valToStore: string | number = '';
    
    if (value !== '') {
      const parsed = Number(value);
      if (!isNaN(parsed)) {
        // Clamp between 0 and the max points for this subject
        valToStore = Math.min(
          grades[index].maxPoints,
          Math.max(0, parsed)
        );
      }
    }

    const cp = [...grades];
    cp[index] = {
      ...cp[index],
      [field]: valToStore as any
    };
    setGrades(cp);

    // Flash auto-save status
    triggerAutosaveNotifier();
  };

  const addCustomGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    // Check duplicate
    if (grades.some(g => g.courseName.toLowerCase() === newCourseName.trim().toLowerCase())) {
      alert('Cette matière existe déjà dans le bulletin.');
      return;
    }

    const newGrade: CourseGrade = {
      courseName: newCourseName.trim(),
      maxPoints: newCourseMaxPoints,
      obtainedFirstPeriod: 0,
      obtainedSecondPeriod: 0,
      obtainedExamFirstSemester: 0,
      obtainedThirdPeriod: 0,
      obtainedFourthPeriod: 0,
      obtainedExamSecondSemester: 0
    };

    setGrades(prev => [...prev, newGrade]);
    setNewCourseName('');
    triggerAutosaveNotifier();
  };

  const removeGrade = (indexToRemove: number) => {
    setGrades(prev => prev.filter((_, idx) => idx !== indexToRemove));
    triggerAutosaveNotifier();
  };

  const triggerAutosaveNotifier = () => {
    setAutoSavedFlash(true);
    setTimeout(() => {
      setAutoSavedFlash(false);
    }, 1200);
  };

  const handleSaveBulletinForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    let studentId = '';
    let finalClass = formClass;
    let finalOption = formOption;

    if (isManualInput) {
      if (!manualStudentName.trim()) {
        setFormError('Veuillez saisir le nom complet de l’élève.');
        return;
      }
      // Generate secure unique ID for manual enrol
      studentId = `EP-MAN-${formOption.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    } else {
      if (!selectedStudentId) {
        setFormError('Sélectionnez d’abord un élève ou saisissez son nom manuellement.');
        return;
      }
      studentId = selectedStudentId;
      const enrolledObj = students.find(s => s.id === selectedStudentId);
      if (enrolledObj) {
        finalClass = enrolledObj.classLevel;
        finalOption = enrolledObj.option;
      }
    }

    const bulletinId = `bul-${studentId}-${Date.now().toString().slice(-4)}`;
    
    // Check if duplicate bulletin id
    const existing = bulletins.find(b => b.studentId === studentId);
    
    const cleanedGrades: CourseGrade[] = grades.map(g => ({
      courseName: g.courseName,
      maxPoints: g.maxPoints,
      obtainedFirstPeriod: Number(g.obtainedFirstPeriod) || 0,
      obtainedSecondPeriod: Number(g.obtainedSecondPeriod) || 0,
      obtainedExamFirstSemester: Number(g.obtainedExamFirstSemester) || 0,
      obtainedThirdPeriod: Number(g.obtainedThirdPeriod) || 0,
      obtainedFourthPeriod: Number(g.obtainedFourthPeriod) || 0,
      obtainedExamSecondSemester: Number(g.obtainedExamSecondSemester) || 0,
    }));

    const preparedBulletin: Bulletin = {
      id: existing?.id || bulletinId,
      studentId,
      classLevel: finalClass,
      option: finalOption,
      schoolId: formSchoolId,
      academicYear: '2025-2026',
      grades: cleanedGrades,
      conduct,
      daysAbsent
    };

    // Append to virtual students database if manually typed to prevent lookup crash
    if (isManualInput) {
      const isRegistered = students.some(s => s.fullName === manualStudentName.trim() && s.schoolId === formSchoolId);
      if (!isRegistered) {
        const dummyStudent: Student = {
          id: studentId,
          fullName: manualStudentName.trim(),
          gender: manualStudentGender,
          birthDate: '2010-01-01',
          address: 'Adresse non fournie',
          classLevel: finalClass,
          option: finalOption,
          schoolId: formSchoolId,
          guardianName: 'Parent non fourni',
          enrollmentDate: new Date().toISOString().split('T')[0]
        };
        students.push(dummyStudent); // Push directly into persistent memory array
      }
    }

    if (existing) {
      onUpdateBulletin(preparedBulletin);
      showInstantAlert('Bulletin mis à jour et sauvegardé !');
    } else {
      onAddBulletin(preparedBulletin);
      showInstantAlert('Nouveau bulletin enregistré avec succès !');
    }

    // Auto-archive compiled image or SVG vector snapshot for Ministry inspections
    try {
      const studName = isManualInput 
        ? manualStudentName.trim() 
        : (students.find(s => s.id === studentId)?.fullName || "Élève Inconnu");

      const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#ffffff;font-family:system-ui,sans-serif;">
        <rect width="100%" height="100%" fill="#ffffff" stroke="#007FFF" stroke-width="12"/>
        <rect x="20" y="20" width="560" height="760" fill="none" stroke="#F4D03F" stroke-width="4"/>
        <text x="300" y="80" font-size="20" font-weight="900" fill="#007FFF" text-anchor="middle">REPUBLIQUE DEMOCRATIQUE DU CONGO</text>
        <text x="300" y="105" font-size="13" font-weight="700" fill="#D32F2F" text-anchor="middle">MINISTERE DE L'EPST</text>
        <text x="300" y="128" font-size="10" font-weight="bold" fill="#718096" text-anchor="middle">ARCHIVE OFFICIELLE NUMERISEE AUTOMATIQUEMENT</text>
        
        <line x1="80" y1="155" x2="520" y2="155" stroke="#E2E8F0" stroke-width="2"/>
        
        <text x="80" y="210" font-size="14" font-weight="bold" fill="#1A202C">Élève :</text>
        <text x="180" y="210" font-size="15" font-weight="900" fill="#007FFF">${studName}</text>
        
        <text x="80" y="245" font-size="14" font-weight="bold" fill="#1A202C">Classe / Option :</text>
        <text x="180" y="245" font-size="14" font-weight="bold" fill="#2D3748">${preparedBulletin.classLevel} - ${preparedBulletin.option}</text>
        
        <text x="300" y="325" font-size="18" font-weight="900" fill="#1A202C" text-anchor="middle">BULLETIN DE NOTES SCELLÉ</text>
        <text x="300" y="350" font-size="12" font-weight="bold" fill="#4A5568" text-anchor="middle">Année Scolaire: ${preparedBulletin.academicYear}</text>
        
        <rect x="80" y="390" width="440" height="230" fill="#F8FAFC" stroke="#E2E8F0" rx="8"/>
        
        <text x="110" y="430" font-size="12" font-weight="bold" fill="#718096">Identifiant Sceau :</text>
        <text x="270" y="430" font-size="12" font-weight="bold" font-family="monospace" fill="#1A202C">${preparedBulletin.id}</text>
        
        <text x="110" y="470" font-size="12" font-weight="bold" fill="#718096">Conduite de l'Éleve :</text>
        <text x="270" y="470" font-size="12" font-weight="bold" fill="#1A202C">${preparedBulletin.conduct}</text>
        
        <text x="110" y="510" font-size="12" font-weight="bold" fill="#718096">Absences Signalées :</text>
        <text x="270" y="510" font-size="12" font-weight="bold" fill="#1A202C">${preparedBulletin.daysAbsent} Jours</text>

        <text x="110" y="550" font-size="12" font-weight="bold" fill="#718096">Statut de l'Archive :</text>
        <text x="270" y="550" font-size="12" font-weight="900" fill="#10B981">ARCHIVÉ AUTOMATIQUEMENT</text>
        
        <text x="300" y="690" font-size="11" font-weight="bold" fill="#94A3B8" text-anchor="middle">Portail SGESC RDC - Ministère de l'EPST</text>
        <text x="300" y="710" font-size="9" fill="#94A3B8" text-anchor="middle">Empreinte de validation : ${preparedBulletin.id.slice(-8).toUpperCase()}</text>
      </svg>`;

      const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgCode)));

      const autoFile: ArchivedFile = {
        id: `FILE-ARCHIVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        schoolId: formSchoolId,
        fileName: `bulletin_${studName.replace(/\s+/g, '_').toLowerCase()}_${preparedBulletin.id.slice(-4)}.png`,
        fileType: 'image/png',
        savedDate: new Date().toLocaleString('fr-CD'),
        studentName: studName,
        studentId: preparedBulletin.studentId,
        classLevel: preparedBulletin.classLevel,
        option: preparedBulletin.option,
        imageData: dataUrl
      };

      if (onSaveArchivedFile) {
        onSaveArchivedFile(autoFile);
      }

      // DIRECT HARDWARE STORAGE DOWNLOAD
      // Trigger automatic file download to device's Local File Manager (Downloads)
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `SGESC_BULLETIN_${studName.toUpperCase().replace(/\s+/g, '_')}_${preparedBulletin.id.slice(-4)}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      showInstantAlert(`Sceau d'Archivage Généré ! Le bulletin de ${studName} a été automatiquement enregistré dans l'application et téléchargé en format image haute résolution dans le gestionnaire de fichiers de votre appareil.`);
    } catch (e) {
      console.error("Auto Archive failed", e);
    }

    setIsFormOpen(false);
    setActiveBulletin(preparedBulletin);
  };

  const showInstantAlert = (text: string) => {
    setSuccessMsg(text);
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareBulletinAsImage = async (b: Bulletin, studentName: string) => {
    const el = document.getElementById('school-bulletin-printable');
    if (!el) {
      showInstantAlert("Erreur: Impossible de trouver l'élément visuel du bulletin.");
      return;
    }

    showInstantAlert("Génération de l'image haute définition en cours... Veuillez patienter.");

    try {
      const originalOverflow = el.style.overflow;
      const originalMaxHeight = el.style.maxHeight;
      const originalHeight = el.style.height;
      el.style.overflow = 'visible';
      el.style.maxHeight = 'none';
      el.style.height = 'auto';

      // Temporarily override window.getComputedStyle to translate modern oklch/oklab colors to rgb/rgba
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function (elt, pseudoElt) {
        const style = originalGetComputedStyle.call(window, elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'getPropertyValue') {
              return function(propName: string) {
                const val = target.getPropertyValue(propName);
                return convertModernColorsToRgb(val);
              };
            }
            const val = target[prop as any];
            if (typeof val === 'function') {
              return (val as any).bind(target);
            }
            if (typeof val === 'string') {
              return convertModernColorsToRgb(val);
            }
            return val;
          }
        });
      };

      let canvas;
      try {
        canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
        });
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
      }

      el.style.overflow = originalOverflow;
      el.style.maxHeight = originalMaxHeight;
      el.style.height = originalHeight;

      const dataUrl = canvas.toDataURL('image/png');
      const filename = `bulletin_${studentName.replace(/\s+/g, '_')}_${b.id.slice(-4)}.png`;

      // Active visual full document sharing modal
      setSharingImage({
        url: dataUrl,
        filename,
        studentName,
        bulletinId: b.id
      });

      showInstantAlert("✨ Bulletin converti avec succès ! Vous pouvez maintenant voir tout le document et le partager ci-dessous.");
    } catch (err: any) {
      console.error(err);
      showInstantAlert(`Erreur de génération d'image : ${err.message}`);
    }
  };

  const handleArchiveBulletin = async (b: Bulletin, studentName: string) => {
    const el = document.getElementById('school-bulletin-printable');
    if (!el) {
      showInstantAlert("Erreur: Ouvrez le bulletin pour pouvoir enregistrer sur le gestionnaire.");
      return;
    }

    showInstantAlert("Enregistrement de l'image immuable dans le gestionnaire des fichiers...");

    try {
      const originalOverflow = el.style.overflow;
      const originalMaxHeight = el.style.maxHeight;
      const originalHeight = el.style.height;
      el.style.overflow = 'visible';
      el.style.maxHeight = 'none';
      el.style.height = 'auto';

      // Temporarily override window.getComputedStyle to translate modern oklch/oklab colors to rgb/rgba
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function (elt, pseudoElt) {
        const style = originalGetComputedStyle.call(window, elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'getPropertyValue') {
              return function(propName: string) {
                const val = target.getPropertyValue(propName);
                return convertModernColorsToRgb(val);
              };
            }
            const val = target[prop as any];
            if (typeof val === 'function') {
              return (val as any).bind(target);
            }
            if (typeof val === 'string') {
              return convertModernColorsToRgb(val);
            }
            return val;
          }
        });
      };

      let canvas;
      try {
        canvas = await html2canvas(el, {
          scale: 1.5,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
        });
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
      }

      el.style.overflow = originalOverflow;
      el.style.maxHeight = originalMaxHeight;
      el.style.height = originalHeight;

      const dataUrl = canvas.toDataURL('image/png');

      const fileObj: ArchivedFile = {
        id: `FILE-ARCHIVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        schoolId: b.schoolId,
        fileName: `bulletin_${studentName.replace(/\s+/g, '_').toLowerCase()}_${b.id.slice(-4)}.png`,
        fileType: 'image/png',
        savedDate: new Date().toLocaleString('fr-CD'),
        studentName: studentName,
        studentId: b.studentId,
        classLevel: b.classLevel,
        option: b.option,
        imageData: dataUrl
      };

      if (onSaveArchivedFile) {
        onSaveArchivedFile(fileObj);
        showInstantAlert("🔒 Enregistré avec succès ! Le bulletin scellé sous format image est dans le gestionnaire.");
      } else {
        showInstantAlert("Erreur: Service d'archivage non initialisé.");
      }
    } catch (err: any) {
      console.error(err);
      showInstantAlert(`Erreur lors de l'archivage: ${err.message}`);
    }
  };

  // --- COMPREHENSIVE OFFLINE JSON IMPORT & EXPORTS ---
  const handleExportJSON = (b: Bulletin) => {
    const studentObj = students.find(s => s.id === b.studentId);
    const displayName = studentObj ? studentObj.fullName : 'Bulletin-Manuel';
    const filename = `RDC_BULLETIN_${displayName.toUpperCase().replace(/\s+/g, '_')}_${b.id}.json`;
    
    const filePayload = JSON.stringify(b, null, 2);
    downloadFile(filePayload, filename, 'application/json');
  };

  const handleExportBlankTemplate = () => {
    // Generate empty bulletin with courses preset for the matching options
    const rawTemplate = COURSES_BY_OPTION[formOption] || [];
    const blankGrades: CourseGrade[] = rawTemplate.map(c => ({
      courseName: c.name,
      maxPoints: c.maxPoints,
      obtainedFirstPeriod: 0,
      obtainedSecondPeriod: 0,
      obtainedExamFirstSemester: 0,
      obtainedThirdPeriod: 0,
      obtainedFourthPeriod: 0,
      obtainedExamSecondSemester: 0
    }));

    const mockBulletinTemplate = {
      info: "Canevas vierge de bulletin scolaire RDC. Remplir les notes de 0 au maximum requis et réimporter.",
      id: `bul-CANVAS-${Date.now().toString().slice(-4)}`,
      studentId: "SAISIR_MATRICULE_OU_MANUEL_ICI",
      studentNameManual: "NOM_COMPLET_DE_L_ELEVE_ICI",
      classLevel: formClass,
      option: formOption,
      schoolId: formSchoolId,
      academicYear: '2025-2026',
      conduct: "Très Bonne",
      daysAbsent: 0,
      grades: blankGrades
    };

    const filename = `CANVAS_BULLETIN_VIDE_${formOption.toUpperCase()}_${formClass.replace(/\s+/g, '')}.json`;
    downloadFile(JSON.stringify(mockBulletinTemplate, null, 2), filename, 'application/json');
    showInstantAlert('Canevas de bulletin vide téléchargé avec succès !');
  };

  const handleImportJSONTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileChangeImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload = JSON.parse(event.target?.result as string);
        
        // Single list or multiple object check
        const arrayPayload: any[] = Array.isArray(payload) ? payload : [payload];
        const verifiedBulletins: Bulletin[] = [];

        arrayPayload.forEach((item, index) => {
          // Check for core properties
          if (!item.grades || !item.schoolId || !item.option || !item.classLevel) {
            throw new Error(`Le fichier ne contient pas les attributs d'un bulletin valide à l'indice ${index}.`);
          }

          // Generate or lookup student properties
          let resolvedStudentId = item.studentId || `EP-IMP-${Date.now().toString().slice(-4)}`;
          if (resolvedStudentId === "SAISIR_MATRICULE_OU_MANUEL_ICI") {
            resolvedStudentId = `EP-IMP-MAN-${Date.now().toString().slice(-4)}`;
          }

          const studentName = item.studentNameManual || item.fullName || `Élève Importé ${resolvedStudentId.slice(-4)}`;
          
          // Inject missing student ref
          const existsSt = students.some(s => s.id === resolvedStudentId);
          if (!existsSt) {
            students.push({
              id: resolvedStudentId,
              fullName: studentName,
              gender: 'M',
              birthDate: '2010-01-01',
              address: 'Adresse de secours importée',
              classLevel: item.classLevel,
              option: item.option,
              schoolId: item.schoolId,
              guardianName: 'Parent importé',
              enrollmentDate: new Date().toISOString().split('T')[0]
            });
          }

          // Build final bulletin
          const validatedBul: Bulletin = {
            id: item.id && !item.id.includes("CANVAS") ? item.id : `bul-${resolvedStudentId}-${Date.now().toString().slice(-4)}`,
            studentId: resolvedStudentId,
            classLevel: item.classLevel,
            option: item.option,
            schoolId: item.schoolId,
            academicYear: item.academicYear || '2025-2026',
            conduct: item.conduct || 'Très Bonne',
            daysAbsent: item.daysAbsent || 0,
            grades: item.grades
          };

          verifiedBulletins.push(validatedBul);
        });

        if (verifiedBulletins.length > 0) {
          if (onImportBulletins) {
            onImportBulletins(verifiedBulletins);
          } else {
            // Emulate adding them manually one by one
            verifiedBulletins.forEach(vb => onAddBulletin(vb));
          }
          showInstantAlert(`Importation réussie : ${verifiedBulletins.length} bulletin(s) synchronisé(s) !`);
        }
      } catch (err: any) {
        alert(`Erreur lors de la lecture du fichier JSON : ${err.message}`);
      }
    };
    reader.readAsText(file);
    
    // reset input
    if (e.target) e.target.value = '';
  };

  const downloadFile = (data: string, filename: string, type: string) => {
    const file = new Blob([data], { type: type });
    const a = document.createElement('a');
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChangeImport}
        accept=".json"
        className="hidden"
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-1.5 leading-none">
            📋 Secrétariat Général &bull; Bulletins Scolaires Officiels
          </h2>
          <p className="text-xs text-slate-500 mt-1 pb-1">
            Gérez les notes trimestrielles, calculez automatiquement les rangs et pourcentages. Exportez et importez en JSON pour saisie hors-ligne.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={handleImportJSONTrigger}
            className="border border-slate-300 hover:bg-slate-105 bg-white text-slate-700 px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileUp className="w-4 h-4 text-slate-500" />
            Importer JSON
          </button>
          
          <button
            onClick={handleOpenCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Encoder un Bulletin
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-extrabold border border-emerald-250 animate-fade-in flex items-center gap-2">
          <Check className="w-4 h-4 stroke-[3]" />
          {successMsg}
        </div>
      )}

      {/* SUB-TAB NAV SELECTOR */}
      <div className="flex border-b border-slate-200 mt-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('LIST')}
          className={`py-2.5 px-4 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'LIST'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Bulletins Actifs (Base de données)</span>
        </button>
        
        <button
          type="button"
          onClick={() => setActiveSubTab('ARCHIVES')}
          className={`py-2.5 px-4 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer relative ${
            activeSubTab === 'ARCHIVES'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Folder className="w-3.5 h-3.5 text-amber-500" />
          <span>Gestionnaire des Fichiers (Images)</span>
          {schoolArchivedFiles.length > 0 && (
            <span className="ml-1.5 bg-amber-100 text-amber-800 text-[9px] font-mono px-1.5 py-0.5 rounded-full font-extrabold border border-amber-200">
              {schoolArchivedFiles.length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'LIST' ? (
        <>
          {/* Overview stats panel */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-fade-in">
            <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 flex items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher bulletin par élève, ID, option d'étude, ou classe ségolène..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 font-medium animate-fade-in"
                />
              </div>
            </div>

            <div className="bg-slate-850 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">Encodages RDC</span>
                <span className="text-xl font-black font-mono block leading-none">{schoolBulletins.length} / {schoolStudents.length || schoolBulletins.length}</span>
                <span className="text-[9px] text-blue-300 block font-semibold leading-none mt-1">Élèves enregistrés</span>
              </div>
              <BarChart3 className="w-5 h-5 text-blue-400 shrink-0" />
            </div>
          </div>

          {/* Grid of registered Bulletins ready to print */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBulletins.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-700 text-sm">Aucun bulletin disponible</h4>
                <p className="text-xs text-slate-400 mt-1">Appuyez sur le bouton "Encoder un Bulletin" ci-dessus pour insérer des points.</p>
              </div>
            ) : (
              filteredBulletins.map((b) => {
                const studentObj = students.find(s => s.id === b.studentId);
                const metrics = getBulletinMetrics(b);
                const studentName = studentObj ? studentObj.fullName : 'Élève Externe / Manuel';

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between animate-fade-in"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-sm">
                          Moyenne: {metrics.percentage}%
                        </span>
                        <h4 className="text-sm font-black text-slate-800 mt-1.5 leading-tight">{studentName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {b.studentId} &bull; {b.classLevel}</p>
                      </div>
                      <TrendingUp className={`w-5 h-5 ${metrics.percentage >= 50 ? 'text-emerald-500' : 'text-rose-500'}`} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase leading-none font-mono">Option</span>
                        <span className="font-semibold text-slate-700 block truncate max-w-full" title={b.option}>{b.option}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase leading-none font-mono">Classement</span>
                        <span className="font-black text-emerald-800 block leading-tight">{metrics.rankText}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100 flex-wrap">
                      <button
                        onClick={() => {
                          setFormSchoolId(b.schoolId);
                          setFormOption(b.option);
                          setFormClass(b.classLevel);
                          
                          const sits = students.find(s => s.id === b.studentId);
                          if (sits) {
                            setSelectedStudentId(b.studentId);
                            setIsManualInput(false);
                          } else {
                            setIsManualInput(true);
                            setManualStudentName(studentName);
                          }

                          setConduct(b.conduct);
                          setDaysAbsent(b.daysAbsent);
                          setGrades(b.grades);
                          setIsFormOpen(true);
                          setFormError('');
                        }}
                        className="flex-1 min-w-[65px] py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        Modifier
                      </button>

                      <button
                        onClick={() => handleExportJSON(b)}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                        title="Exporter les données de ce bulletin au format JSON"
                      >
                        <FileDown className="w-3 h-3" />
                        JSON
                      </button>

                      <button
                        onClick={() => setActiveBulletin(b)}
                        className="flex-1 min-w-[75px] py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        Ouvrir
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* GESTIONNAIRE DE FICHIERS DIRECT */
        <div className="space-y-4 animate-fade-in text-xs text-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 leading-none">
                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                Dumping des Documents Officiels de l'Établissement
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Fichiers d'images immuables et scellés. Conforme à l'architecture de transit sans modification possible hors de la base de données.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schoolArchivedFiles, null, 2));
                  const dlAnchorElem = document.createElement('a');
                  dlAnchorElem.setAttribute("href",     dataStr);
                  dlAnchorElem.setAttribute("download", `BACKUP_GESTIONNAIRE_${currentSchool.name.replace(/\s+/g, '_')}_${Date.now()}.json`);
                  dlAnchorElem.click();
                  showInstantAlert("Exportation de votre gestionnaire réussie !");
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-350 flex items-center gap-1.5 cursor-pointer text-[11px]"
                disabled={schoolArchivedFiles.length === 0}
              >
                <FileDown className="w-3.5 h-3.5" />
                Exporter le Dossier
              </button>

              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = (e: any) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (evt: any) => {
                      try {
                        const parsed = JSON.parse(evt.target.result);
                        const list = Array.isArray(parsed) ? parsed : [parsed];
                        let count = 0;
                        list.forEach(item => {
                          if (item.imageData && item.schoolId) {
                            onSaveArchivedFile(item);
                            count++;
                          }
                        });
                        showInstantAlert(`Intégration réussie de ${count} document(s) archivé(s) dans le dossier scolaire !`);
                      } catch (err) {
                        alert("Format de fichier d'archive scolaire non valide.");
                      }
                    };
                    reader.readAsText(file);
                  };
                  input.click();
                }}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold rounded-xl border border-indigo-250 flex items-center gap-1.5 cursor-pointer text-[11px]"
              >
                <FileUp className="w-3.5 h-3.5" />
                Importer dans le Dossier
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schoolArchivedFiles.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200">
                <Folder className="w-12 h-12 text-slate-350 mx-auto mb-2.5 animate-pulse" />
                <h4 className="font-extrabold text-slate-700 text-sm">Dossier de fichiers vide</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Aucun bulletin immuable n'est sauvegardé ou scellé.<br />
                  <b>Pour sceller un document :</b> ouvrez un bulletin dans l'onglet principal, puis cliquez sur <b>💾 Archiver au Gestionnaire</b>.
                </p>
              </div>
            ) : (
              schoolArchivedFiles.map((file) => (
                <div key={file.id} className="bg-white rounded-2xl border border-slate-200 p-4 shrink-0 flex flex-col justify-between shadow-xs hover:border-slate-300 hover:shadow-xs transition-all animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-sm">
                      🔒 IMAGE SCELLÉE (IMMUID)
                    </span>
                    <h4 className="text-sm font-black text-rose-950 block pt-1">{file.studentName}</h4>
                    <p className="text-[10.5px] text-slate-500 font-bold block leading-none">{file.classLevel} &bull; {file.option}</p>
                    <p className="text-[9px] text-slate-400 font-mono pt-1">Généré le : {file.savedDate}</p>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-32 flex items-center justify-center p-2 relative group mt-3">
                    <img src={file.imageData} alt={file.fileName} className="object-contain h-full max-w-full" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 duration-200">
                      <button
                        onClick={() => setSelectedArchiveView(file)}
                        className="py-1 px-3 bg-white text-slate-800 text-[10.5px] font-bold rounded-lg hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        Ouvrir l'Aperçu
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-1.5 pt-3 border-t border-slate-100 mt-3 flex-wrap">
                    <button
                      onClick={() => setSelectedArchiveView(file)}
                      className="flex-1 min-w-[70px] py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Visualiser
                    </button>

                    <button
                      onClick={async () => {
                        const pdfName = `SGESC_ARCHIVE_${file.studentName.toUpperCase().replace(/\s+/g, '_')}_${file.id}.pdf`;
                        await downloadImageAsPDF(file.imageData, pdfName);
                        showInstantAlert("Téléchargement du document PDF réussi !");
                      }}
                      className="flex-1 min-w-[100px] py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-xs border border-rose-500"
                      title="Télécharger cette image d'archive sous format PDF officiel"
                    >
                      <span>📥</span> Télécharger PDF (Image)
                    </button>

                    <button
                      onClick={async () => {
                        const link = document.createElement('a');
                        link.download = file.fileName;
                        link.href = file.imageData;
                        link.click();
                        showInstantAlert("Fichier Image PNG enregistré !");
                      }}
                      className="py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-850 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 cursor-pointer border border-slate-300"
                      title="Télécharger directement l'image brute au format PNG"
                    >
                      📂 Image PNG
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Alerte de sécurité : Êtes-vous absolument sûr de vouloir détruire définitivement l'archive image scellée de "${file.studentName}" ?`)) {
                          onDeleteArchivedFile(file.id);
                          showInstantAlert("Fichier détruit du gestionnaire avec succès !");
                        }
                      }}
                      className="p-1 px-1.5 hover:bg-rose-50 text-rose-600 rounded-lg border border-transparent hover:border-rose-200 cursor-pointer"
                      title="Détruire des fichiers"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: Encode Bulletin grades */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-250 flex flex-col h-[90vh]">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
              <span className="font-bold text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                📝 Saisie de Points &amp; Bulletin RDC
                {autoSavedFlash && (
                  <span className="bg-emerald-55 text-emerald-900 border border-emerald-400 text-[8px] px-2 py-0.5 rounded font-bold animate-pulse">
                     ✓ ENREGISTREMENT DIRECT
                  </span>
                )}
              </span>
              <button onClick={() => setIsFormOpen(false)} className="text-white hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
              {formError && (
                <p className="p-3 bg-amber-50 text-amber-850 rounded-lg border border-amber-200 font-bold">
                  ⚠️ {formError}
                </p>
              )}

              {/* STEP 1: ASSIGNATION SCHOOL / OPTION / CLASS */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[10px] text-blue-800 uppercase block font-mono">
                  1. Établissement &amp; Orientation Scolaire
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">École</label>
                    <select
                      value={formSchoolId}
                      onChange={(e) => handleSchoolOptionClassChange(e.target.value, formOption, formClass)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold bg-white"
                    >
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.province})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Option / Section</label>
                    <select
                      value={formOption}
                      onChange={(e) => handleSchoolOptionClassChange(formSchoolId, e.target.value as SchoolOption, formClass)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold bg-white animate-fade-in"
                    >
                      {SCHOOL_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Classe level</label>
                    <select
                      value={formClass}
                      onChange={(e) => handleSchoolOptionClassChange(formSchoolId, formOption, e.target.value as SchoolClassLevel)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold bg-white"
                    >
                      {CLASS_LEVELS.map(cl => (
                        <option key={cl} value={cl}>{cl}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-[10.5px]">
                  <span className="font-bold text-slate-500 italic block">Code RDC Établissement : {matchedSchool.nationalCode}</span>
                  <button
                    type="button"
                    onClick={handleExportBlankTemplate}
                    className="bg-slate-200 hover:bg-slate-250 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wide cursor-pointer flex items-center gap-1"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Télécharger Canevas JSON vide
                  </button>
                </div>
              </div>

              {/* STEP 2: CHOOSE EXISTING STUDENT OR COMPLETE MANUAL INLET */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[10px] text-blue-800 uppercase block font-mono">
                    2. Informations de l'élève
                  </span>

                  <div className="flex rounded-lg overflow-hidden border border-slate-350 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsManualInput(false)}
                      className={`px-2.5 py-1 text-[9.5px] font-bold ${!isManualInput ? 'bg-blue-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                    >
                      Base Élèves
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManualInput(true)}
                      className={`px-2.5 py-1 text-[9.5px] font-bold ${isManualInput ? 'bg-blue-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                    >
                      Saisie Manuelle (Libre)
                    </button>
                  </div>
                </div>

                {isManualInput ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nom Complet de l'élève *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Joseph Kasa-Vubu Lumumba"
                        value={manualStudentName}
                        onChange={(e) => setManualStudentName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sexe</label>
                      <select
                        value={manualStudentGender}
                        onChange={(e) => setManualStudentGender(e.target.value as 'M' | 'F')}
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold bg-white"
                      >
                        <option value="M">Masculin (M)</option>
                        <option value="F">Féminin (F)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Élèves inscrits (Filtre dynamique école/classe/option)</label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => handleEnrolledStudentSelect(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold bg-white"
                    >
                      <option value="">-- Choisissez l'élève --</option>
                      {students
                        .filter(s => s.schoolId === formSchoolId && s.classLevel === formClass && s.option === formOption)
                        .map(s => (
                          <option key={s.id} value={s.id}>{s.fullName} ({s.id})</option>
                        ))
                      }
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Appréciation de Conduite *</label>
                    <select
                      value={conduct}
                      onChange={(e) => setConduct(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-300 p-1 bg-white font-semibold text-[11px]"
                    >
                      <option value="Excellente">Excellente</option>
                      <option value="Très Bonne">Très Bonne</option>
                      <option value="Bonne">Bonne</option>
                      <option value="Assez Bonne">Assez Bonne</option>
                      <option value="Médiocre">Médiocre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Absence Injustifiée (jours) *</label>
                    <input
                      type="number"
                      min={0}
                      value={daysAbsent}
                      onChange={(e) => setDaysAbsent(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 p-1 font-mono font-bold text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: HIGH INTEGRITY CUSTOMISABLE COURSES LIST */}
              <div className="space-y-3.5 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[10px] text-blue-800 uppercase block font-mono">
                    3. Grille des notes &amp; Barèmes de branches
                  </span>
                  
                  <span className="text-[10px] text-slate-400 font-bold">
                    Total Branches : {grades.length}
                  </span>
                </div>

                {/* Sub-Form: Add custom branch manually */}
                <form onSubmit={addCustomGrade} className="bg-amber-50/20 p-3 rounded-xl border border-amber-200/50 flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Ajouter une matière manuelle (ex: Anglais Technique, etc.)"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white font-semibold text-[11.5px]"
                    />
                  </div>
                  <div className="w-full sm:w-28 shrink-0 flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">Barème :</span>
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={newCourseMaxPoints}
                      onChange={(e) => setNewCourseMaxPoints(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded text-center font-mono font-bold bg-white text-[11.5px]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-750 text-white font-bold p-2 px-3 rounded text-[11.5px] cursor-pointer flex items-center justify-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </form>

                {grades.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl bg-slate-50">
                    <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    <p className="font-semibold text-xs text-slate-500">Aucun cours défini dans ce bulletin.</p>
                    <p className="text-[10px]">Utilisez le widget d'ajout ci-dessus ou changez d'option d'étude.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto p-1.5 bg-slate-50/50 rounded-xl border border-slate-200">
                    {grades.map((g, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-250 shadow-xs space-y-2 relative">
                        <div className="flex justify-between items-center bg-slate-50 p-1 px-2 rounded">
                          <span className="font-extrabold text-slate-800 text-xs truncate max-w-[280px]" title={g.courseName}>
                            {g.courseName}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[9.5px] font-mono text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-extrabold">
                              Max : / {g.maxPoints} pts
                            </span>
                            <button
                              type="button"
                              onClick={() => removeGrade(idx)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded bg-slate-100/50 hover:bg-red-50 cursor-pointer"
                              title="Retirer ce cours de ce bulletin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {/* Semester 1 Periodic Marks */}
                          <div>
                            <span className="text-[9px] text-slate-400 block mb-0.5 uppercase font-mono">Pér. 1 (/ {g.maxPoints})</span>
                            <input
                              type="number"
                              min={0}
                              max={g.maxPoints}
                              value={g.obtainedFirstPeriod}
                              onChange={(e) => handleGradeChange(idx, 'obtainedFirstPeriod', e.target.value)}
                              className="w-full text-center border rounded p-1 font-mono font-bold text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block mb-0.5 uppercase font-mono">Pér. 2 (/ {g.maxPoints})</span>
                            <input
                              type="number"
                              min={0}
                              max={g.maxPoints}
                              value={g.obtainedSecondPeriod}
                              onChange={(e) => handleGradeChange(idx, 'obtainedSecondPeriod', e.target.value)}
                              className="w-full text-center border rounded p-1 font-mono font-bold text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-indigo-500 block mb-0.5 uppercase font-mono">Exam 1 (/ {g.maxPoints})</span>
                            <input
                              type="number"
                              min={0}
                              max={g.maxPoints}
                              value={g.obtainedExamFirstSemester}
                              onChange={(e) => handleGradeChange(idx, 'obtainedExamFirstSemester', e.target.value)}
                              className="w-full text-center border border-indigo-200 bg-indigo-100/10 rounded p-1 font-mono font-bold text-xs"
                            />
                          </div>

                          {/* Semester 2 Periodic Marks */}
                          <div>
                            <span className="text-[9px] text-slate-400 block mb-0.5 uppercase font-mono">Pér. 3 (/ {g.maxPoints})</span>
                            <input
                              type="number"
                              min={0}
                              max={g.maxPoints}
                              value={g.obtainedThirdPeriod}
                              onChange={(e) => handleGradeChange(idx, 'obtainedThirdPeriod', e.target.value)}
                              className="w-full text-center border rounded p-1 font-mono font-bold text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block mb-0.5 uppercase font-mono">Pér. 4 (/ {g.maxPoints})</span>
                            <input
                              type="number"
                              min={0}
                              max={g.maxPoints}
                              value={g.obtainedFourthPeriod}
                              onChange={(e) => handleGradeChange(idx, 'obtainedFourthPeriod', e.target.value)}
                              className="w-full text-center border rounded p-1 font-mono font-bold text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-indigo-500 block mb-0.5 uppercase font-mono">Exam 2 (/ {g.maxPoints})</span>
                            <input
                              type="number"
                              min={0}
                              max={g.maxPoints}
                              value={g.obtainedExamSecondSemester}
                              onChange={(e) => handleGradeChange(idx, 'obtainedExamSecondSemester', e.target.value)}
                              className="w-full text-center border border-indigo-200 bg-indigo-100/10 rounded p-1 font-mono font-bold text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-slate-100 shrink-0 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-250 rounded-xl text-xs font-bold text-slate-600 cursor-pointer text-center select-none"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveBulletinForm}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer text-center select-none flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Sauvegarder le Bulletin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Full Official RDC Bulletin layout */}
      {activeBulletin && (() => {
        const student = students.find(s => s.id === activeBulletin.studentId);
        const displayName = student ? student.fullName : 'Élève Externe / Manuel';
        const genderText = student ? (student.gender === 'M' ? 'Masculin' : 'Féminin') : 'M';
        
        const theme = getBulletinTheme(activeBulletin.classLevel, activeBulletin.option);
        const metrics = getBulletinMetrics(activeBulletin);
        const schoolObj = schools.find(s => s.id === activeBulletin.schoolId) || currentSchool;

        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl border border-slate-300 text-slate-800 flex flex-col h-[90vh]">
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 shrink-0">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-blue-700 flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded">
                  <Award className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                  COMPATIBILITÉ RDC EPST - PERSO: {displayName.toUpperCase()}
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportJSON(activeBulletin)}
                    className="border border-slate-350 hover:bg-slate-50 text-slate-700 font-mono text-[10.5px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                    title="Sauvegarder les cotes de ce bulletin sous format JSON"
                  >
                    <FileDown className="w-3.5 h-3.5 text-blue-600" />
                    Exporter JSON
                  </button>
                  <button onClick={() => setActiveBulletin(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Print Area core scroll */}
              <div 
                id="school-bulletin-printable" 
                className={`flex-1 overflow-y-auto p-4 md:p-8 space-y-6 transition-all relative ${theme.containerBg} ${theme.outerBorder} ${theme.layoutAddon}`}
              >
                
                {/* Armoiries et Drapeau en fond filigrane - HAUTEMENT VISIBLE */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <CongoCoatOfArms className="w-[450px] h-[450px]" opacityClassName="opacity-[0.62]" />
                </div>

                {/* RDC State Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left border-b-2 border-slate-800 pb-4 gap-4 relative z-10">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <CongoCoatOfArms className="w-16 h-16 shrink-0" opacityClassName="opacity-100" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5">
                        <CongoFlagIcon className="w-8 h-5 rounded-xs shrink-0" />
                        <span className="text-[10px] font-black tracking-wide text-slate-800 font-sans">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 font-sans">MINISTÈRE DE L’ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET TECHNIQUE</h4>
                      <p className={`text-[15px] font-extrabold tracking-tight ${theme.primaryText}`}>{schoolObj.name}</p>
                      <p className="text-[9px] text-slate-550 font-mono">
                        PROVINCE: <span className="font-extrabold text-slate-850">{schoolObj.province}</span> &bull; CODE ÉTABLISSEMENT RDC: <span className="font-mono text-slate-800 font-bold">{schoolObj.nationalCode}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#D32F2F] font-black block">BULLETIN DE NOTES DE L'ÉLÈVE</span>
                    <span className="text-[9px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mt-1 inline-block">Ref RDC: {activeBulletin.id}</span>
                    <p className="text-[9px] text-slate-550 mt-1 font-mono">Année Scolaire: {activeBulletin.academicYear}</p>
                  </div>
                </div>

                {/* Matricule information of pupils */}
                <div className="space-y-4 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-white/95 backdrop-blur-2xs p-3.5 rounded-xl border border-slate-200 shadow-3xs">
                    <div>
                      <span className="text-[8.5px] uppercase font-mono text-slate-400 block font-bold">Identité de l'apprenant</span>
                      <span className="font-black text-slate-900 block text-sm">{displayName}</span>
                      <span className="text-[9px] text-slate-550 font-mono">Sexe: {genderText} &bull; Matricule: {activeBulletin.studentId}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] uppercase font-mono text-slate-400 block font-bold">Niveau &bull; Section d'études</span>
                      <span className={`text-xs block ${theme.headingFont}`}>{activeBulletin.classLevel}</span>
                      <span className={`text-[9.5px] font-mono px-2 py-0.5 mt-0.5 inline-block rounded-md border font-semibold ${theme.badgeColor}`}>
                        Option: {activeBulletin.option}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8.5px] uppercase font-mono text-slate-400 block font-bold">Évaluation de conduite</span>
                      <span className="text-slate-800 font-extrabold block">Conduite: {activeBulletin.conduct}</span>
                      <span className="text-[10px] text-slate-500 font-semibold font-mono">Absence enregistrée: {activeBulletin.daysAbsent} jours</span>
                    </div>
                  </div>

                  {/* Official RDC Grades Table matrix */}
                  <div className="overflow-x-auto bg-white/95 backdrop-blur-2xs rounded-xl border border-slate-350 p-1">
                    <table className="w-full text-[10px] text-left border-collapse border border-slate-300">
                      <thead>
                        <tr className={`border border-slate-400 divide-x divide-slate-300 font-black text-center ${theme.tableHeaderBg} ${theme.tableHeaderTextColor}`}>
                          <th rowSpan={2} className="py-2.5 px-3 text-left w-64 border border-slate-300 uppercase tracking-wider font-bold">MATIÈRES ENSEIGNÉES EN SECONDAIRE</th>
                          <th rowSpan={2} className="py-2.5 px-1 bg-slate-100/60 border border-slate-300">MAX Période</th>
                          <th colSpan={3} className="py-1 border border-slate-300 uppercase tracking-widest text-[#007FFF] text-[8.5px]">1er SEMESTRE (Points Obtenus)</th>
                          <th colSpan={3} className="py-1 border border-slate-300 uppercase tracking-widest text-[#D32F2F] text-[8.5px]">2ème SEMESTRE (Points Obtenus)</th>
                          <th rowSpan={2} className="py-2.5 px-1 bg-yellow-100 text-slate-950 font-black border border-slate-350 text-[10.5px]">TOTAL GÉNÉRAL</th>
                        </tr>
                        <tr className="border border-slate-300 divide-x divide-slate-200 text-[8.5px] font-mono bg-slate-50/80">
                          <th className="py-1 border border-slate-300">1ère P.</th>
                          <th className="py-1 border border-slate-300">2ème P.</th>
                          <th className="py-1 bg-blue-50/50 border border-slate-300 text-blue-900 font-bold">Examen 1</th>
                          <th className="py-1 border border-slate-300">3ème P.</th>
                          <th className="py-1 border border-slate-300">4ème P.</th>
                          <th className="py-1 bg-rose-50/50 border border-slate-300 text-rose-900 font-bold">Examen 2</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-250 border border-slate-300 text-[10px]">
                        {activeBulletin.grades.map((g, idx) => {
                          const subtotal = 
                            g.obtainedFirstPeriod + 
                            g.obtainedSecondPeriod + 
                            g.obtainedExamFirstSemester + 
                            g.obtainedThirdPeriod + 
                            g.obtainedFourthPeriod + 
                            g.obtainedExamSecondSemester;
                          
                          const maxAll = g.maxPoints * 6;
                          const isPassing = subtotal >= maxAll * 0.5;

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 font-medium divide-x divide-slate-200 text-center text-[11px]">
                              <td className="py-2 px-3 text-left font-sans font-extrabold text-slate-850 border-r border-slate-300">{g.courseName}</td>
                              <td className="py-2 px-1 font-mono font-bold text-slate-500 border-r border-slate-300 bg-slate-50/30">{g.maxPoints}</td>
                              <td className="py-2 px-1 font-mono">{g.obtainedFirstPeriod}</td>
                              <td className="py-2 px-1 font-mono">{g.obtainedSecondPeriod}</td>
                              <td className="py-2 px-1 font-mono bg-blue-50/20 text-blue-900 font-bold">{g.obtainedExamFirstSemester}</td>
                              <td className="py-2 px-1 font-mono">{g.obtainedThirdPeriod}</td>
                              <td className="py-2 px-1 font-mono">{g.obtainedFourthPeriod}</td>
                              <td className="py-2 px-1 font-mono bg-rose-50/20 text-rose-900 font-bold">{g.obtainedExamSecondSemester}</td>
                              <td className={`py-2 px-1 font-mono font-black border-l border-slate-300 ${isPassing ? 'text-emerald-850 bg-emerald-50/25' : 'text-red-750 bg-red-50/25'}`}>
                                {subtotal} / {maxAll}
                              </td>
                            </tr>
                          );
                        })}

                        {/* Computed Metrics Block */}
                        <tr className="bg-slate-100 font-black text-[11px] divide-x divide-slate-300 text-center border-t border-slate-300">
                          <td className="py-3 px-3 text-left uppercase font-black">TOTAL GÉNÉRAL DE LA CLASSE</td>
                          <td className="py-3 px-1 font-mono text-slate-650 bg-slate-50">
                            {activeBulletin.grades.reduce((sum, g) => sum + g.maxPoints, 0)}
                          </td>
                          <td className="py-3 px-1 font-mono">{activeBulletin.grades.reduce((sum, g) => sum + g.obtainedFirstPeriod, 0)}</td>
                          <td className="py-3 px-1 font-mono">{activeBulletin.grades.reduce((sum, g) => sum + g.obtainedSecondPeriod, 0)}</td>
                          <td className="py-3 px-1 bg-blue-50/40 font-mono text-blue-900">{activeBulletin.grades.reduce((sum, g) => sum + g.obtainedExamFirstSemester, 0)}</td>
                          <td className="py-3 px-1 font-mono">{activeBulletin.grades.reduce((sum, g) => sum + g.obtainedThirdPeriod, 0)}</td>
                          <td className="py-3 px-1 font-mono">{activeBulletin.grades.reduce((sum, g) => sum + g.obtainedFourthPeriod, 0)}</td>
                          <td className="py-3 px-1 bg-rose-50/40 font-mono text-rose-900">{activeBulletin.grades.reduce((sum, g) => sum + g.obtainedExamSecondSemester, 0)}</td>
                          <td className="py-3 px-1 font-mono text-slate-900 bg-yellow-100 flex items-center justify-center font-black text-[12px]">
                            {metrics.obtained} / {metrics.available}
                          </td>
                        </tr>

                        {/* Percentages and Rankings row */}
                        <tr className="bg-slate-800 text-white font-black text-center text-xs divide-x divide-slate-600">
                          <td className="py-3.5 px-3 text-left uppercase">POURCENTAGE &amp; CLASSEMENT SCOLAIRE RDC</td>
                          <td colSpan={2} className="py-3.5 px-1 font-mono tracking-wide text-yellow-300 text-sm">
                            {metrics.percentage}%
                          </td>
                          <td colSpan={3} className="py-3.5 px-1 font-sans text-[11px] font-bold">
                            🏆 CLASSEMENT: {metrics.rankText}
                          </td>
                          <td colSpan={3} className="py-3.5 px-1 font-mono uppercase text-yellow-400 font-extrabold text-[10.5px]">
                            {metrics.percentage >= 50.0 ? '✅ ADMISSIBLE: PASSGE EN CLASSE SUPÉRIEURE' : '❌ REFUSÉ: DOUBLE DE CLASSE'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatures block */}
                <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-[10px] border-t-2 border-slate-800 align-top leading-normal relative z-10 bg-white/50 p-3 rounded-xl mt-4">
                  <div className="flex gap-2.5 items-start">
                    <div
                      onClick={() => onOpenQRScanner(activeBulletin.id)}
                      className="p-1 px-1.5 bg-white border border-slate-350 rounded shadow-2xs cursor-pointer hover:bg-slate-50 shrink-0 text-center"
                      title="Cliquer pour vérifier ce QR Code"
                    >
                      <svg viewBox="0 0 100 100" className="w-12 h-12 text-slate-900" fill="currentColor">
                        <rect x="0" y="0" width="30" height="30" />
                        <rect x="6" y="6" width="18" height="18" fill="white" />
                        <rect x="10" y="10" width="10" height="10" />

                        <rect x="70" y="0" width="30" height="30" />
                        <rect x="76" y="6" width="18" height="18" fill="white" />
                        <rect x="80" y="10" width="10" height="10" />

                        <rect x="0" y="70" width="30" height="30" />
                        <rect x="6" y="76" width="18" height="18" fill="white" />
                        <rect x="10" y="80" width="10" height="10" />

                        <rect x="40" y="15" width="15" height="15" />
                        <rect x="15" y="40" width="10" height="15" />
                        <rect x="70" y="40" width="15" height="10" />
                        <rect x="40" y="70" width="20" height="15" />
                      </svg>
                      <span className="text-[5px] font-bold text-slate-500 font-mono tracking-widest block mt-0.5">VÉRIFIER QR CONFORME</span>
                    </div>
                    <div>
                      <span className="font-bold block uppercase text-slate-550 text-[8px] font-mono mb-0.5">SÉCURITÉ ET ASSURANCES</span>
                      <p className="text-slate-550 text-[9px] leading-relaxed">Conformément aux protocoles nationaux RDC, l'identification du bulletin par signature en QR assure la sécurité infalsifiable.</p>
                      <span className="text-emerald-700 font-bold block font-mono text-[9px] mt-1">ID-EMBLÈME: SGESC-{activeBulletin.studentId}</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-[8px] uppercase tracking-wide text-slate-500 font-mono block font-bold mb-1">Signatures des Tuteurs / Parents</span>
                    <div className="h-10 border border-slate-205 border-dashed rounded bg-slate-50/20" />
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] uppercase tracking-wide text-slate-500 font-mono block font-bold mb-1">Sceau de l’Inspecteur / Préfet</span>
                    <p className="text-[9.5px] italic text-slate-600 font-serif leading-none mt-2">Visé : Préfet {schoolObj.rectorName.replace('Monsieur le Préfet ', '')}</p>
                    <div className="h-6 flex items-center justify-end font-semibold text-[11px] tracking-tight text-blue-800 italic pr-2 mt-2">
                       Agréé EPST
                    </div>
                  </div>
                </div>
              </div>

              {/* Sharing & Control Toolbar */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between p-4 border-t bg-slate-50 gap-4 shrink-0 rounded-b-2xl">
                {/* Left side: Sharing Buttons and Utilities */}
                <div className="flex flex-wrap items-center gap-2">

                  {/* Partager le fichier (Image format) */}
                  <button
                    type="button"
                    onClick={() => handleShareBulletinAsImage(activeBulletin, displayName)}
                    className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Capturer et partager le document complet sous format Image PNG de bonne forme"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Partager le Fichier (Image)</span>
                  </button>

                  {/* Enregistrer / Archiver dans le gestionnaire des fichiers */}
                  <button
                    type="button"
                    onClick={() => handleArchiveBulletin(activeBulletin, displayName)}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-yellow-400 border border-slate-700 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Congeler l'image de ce bulletin de façon définitive pour l'enregistrer dans votre Gestionnaire"
                  >
                    <Lock className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <span>💾 Archiver au Gestionnaire</span>
                  </button>
                </div>

                {/* Right side: Actions (Print & Edit) */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Edit inside Details view */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormSchoolId(activeBulletin.schoolId);
                      setFormOption(activeBulletin.option);
                      setFormClass(activeBulletin.classLevel);
                      
                      const sits = students.find(s => s.id === activeBulletin.studentId);
                      if (sits) {
                        setSelectedStudentId(activeBulletin.studentId);
                        setIsManualInput(false);
                      } else {
                        setIsManualInput(true);
                        setManualStudentName(displayName);
                      }

                      setConduct(activeBulletin.conduct);
                      setDaysAbsent(activeBulletin.daysAbsent);
                      setGrades(activeBulletin.grades);
                      setIsFormOpen(true);
                      setFormError('');
                      setActiveBulletin(null); // Close the preview to show the editor
                    }}
                    className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                    Modifier les Notes
                  </button>

                  {/* Print */}
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="py-2.5 px-4 bg-slate-250 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold border border-slate-350 shadow flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    Imprimer
                  </button>

                  {/* Download PDF */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!activeBulletin) return;
                      setIsDownloadingPdf(true);
                      try {
                        const filename = `SGESC_BULLETIN_${displayName.toUpperCase().replace(/\s+/g, '_')}_${activeBulletin.id.slice(-4)}.pdf`;
                        await downloadElementAsPDF('school-bulletin-printable', filename);
                      } catch (err) {
                        console.error("PDF download failed:", err);
                      } finally {
                        setIsDownloadingPdf(false);
                      }
                    }}
                    disabled={isDownloadingPdf}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="text-sm">💾</span>
                    {isDownloadingPdf ? "Génération PDF..." : "Télécharger PDF"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedArchiveView && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-slate-750">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-855 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm text-yellow-400 font-mono tracking-wide leading-none">
                     🔒 VISUALISEUR D'ARCHIVES SCOLAIRES RDC
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Image scellée de bulletin - Document de bonne forme définitif
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedArchiveView(null)} 
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Image rendering view */}
            <div className="p-6 bg-slate-950 flex-1 overflow-y-auto flex items-center justify-center min-h-[350px]">
              <div className="max-w-full max-h-[60vh] bg-white p-4 rounded-xl shadow-inner border border-slate-850">
                <img 
                  referrerPolicy="no-referrer"
                  src={selectedArchiveView.imageData} 
                  alt={selectedArchiveView.fileName} 
                  className="max-w-full max-h-[55vh] object-contain mx-auto" 
                />
              </div>
            </div>

            {/* Controls bottom bar */}
            <div className="border-t border-slate-200 bg-slate-50 p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left space-y-0.5">
                <h5 className="font-black text-rose-950 text-xs">{selectedArchiveView.studentName}</h5>
                <p className="text-[10.5px] font-bold text-slate-500">{selectedArchiveView.classLevel} &bull; {selectedArchiveView.option}</p>
                <p className="text-[9px] text-slate-400 font-mono">ID Archive : {selectedArchiveView.id} &bull; Enregistré le : {selectedArchiveView.savedDate}</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = selectedArchiveView.fileName;
                    link.href = selectedArchiveView.imageData;
                    link.click();
                    showInstantAlert("Fichier Image PNG enregistré !");
                  }}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 shadow-md cursor-pointer"
                >
                  Télécharger PNG
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const pdfName = `SGESC_ARCHIVE_${selectedArchiveView.studentName.toUpperCase().replace(/\s+/g, '_')}_${selectedArchiveView.id}.pdf`;
                    await downloadImageAsPDF(selectedArchiveView.imageData, pdfName);
                  }}
                  className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 shadow-md cursor-pointer"
                >
                  Télécharger PDF (Image)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedArchiveView(null)}
                  className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-750 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sharingImage && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-fade-in" id="share-image-modal">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border-4 border-blue-600">
            {/* Header */}
            <div className="bg-blue-750 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-yellow-400 shrink-0 animate-bounce" />
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider font-sans leading-none">
                     Partager le Bulletin (Image)
                  </h4>
                  <p className="text-[10px] text-blue-100 font-mono mt-0.5">
                    Réf Bulletin RDC : {sharingImage.bulletinId}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSharingImage(null)} 
                className="text-white hover:text-red-200 bg-blue-800 hover:bg-blue-900 px-3 py-1.5 rounded-xl cursor-pointer font-bold text-xs transition-colors"
              >
                Fermer &bull; X
              </button>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-800">
              
              {/* Image visual wrapper - SEE ENTIRE DOCUMENT */}
              <div className="border-4 border-dashed border-slate-300 rounded-2xl p-2 bg-slate-100 flex flex-col items-center">
                <span className="text-[10px] text-slate-600 font-black mb-1.5 tracking-wide uppercase block text-center">
                  👁️ Aperçu du Document Complet (Faites défiler vers le bas si nécessaire) :
                </span>
                <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-inner max-h-[350px] w-full overflow-y-auto">
                  <img 
                    src={sharingImage.url} 
                    alt={`Bulletin Image - ${sharingImage.studentName}`}
                    className="w-full h-auto object-contain select-all"
                    id="fullscreen-bulletin-sharing-image"
                  />
                </div>
                <span className="text-[9.5px] text-slate-500 mt-1.5 font-bold block text-center italic">
                  💡 Sur smartphone: Restez appuyé longuement sur l'image ci-dessus pour la sauvegarder ou l'envoyer !
                </span>
              </div>

              {/* Instructions Box */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
                <p className="font-extrabold text-blue-900 flex items-center gap-1 uppercase">
                  📢 Options de Sauvegarde Conforme de l'Image
                </p>
                <div className="space-y-1.5 text-slate-700 text-[11px] leading-relaxed font-sans font-semibold">
                  <p>
                    <span className="text-blue-700 font-bold">👉 Option 1 : Télécharger l'image brute (PNG)</span> <br />
                    Conserve l'image haute définition stricte de l'intégralité du document dans la galerie de votre appareil.
                  </p>
                  <p>
                    <span className="text-rose-700 font-bold">👉 Option 2 : Exporter sous format PDF (Fidèle Image)</span> <br />
                    Encapsule visuellement l'image complète du bulletin officiel au sein d'une seule page PDF conforme.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = sharingImage.filename;
                    link.href = sharingImage.url;
                    link.click();
                    showInstantAlert("Fichier Image PNG enregistré avec succès dans votre dossier Téléchargements !");
                  }}
                  className="py-3 px-4 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-sm">📸</span>
                  Télécharger PNG
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const pdfName = sharingImage.filename.replace(/\.png$/i, '.pdf');
                    await downloadImageAsPDF(sharingImage.url, pdfName);
                    showInstantAlert("Fichier PDF (Image Fidèle) généré et téléchargé avec succès !");
                  }}
                  className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-sm">📥</span>
                  Télécharger PDF (Image)
                </button>
              </div>

            </div>
            
            {/* Footer informational */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500 font-mono tracking-wider font-bold shrink-0">
               Secrétariat Général EPST RDC &bull; MINISTÈRE DE L'ÉDUCATION NATIONALE
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
