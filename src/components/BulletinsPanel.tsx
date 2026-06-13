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

  let containerBg = 'bg-[#fffbeb]'; // Solid amber-50
  let outerBorder = 'border border-slate-200 rounded-xl';
  let titleBadgeStyle = 'px-3 py-1 font-mono tracking-widest text-[10px] uppercase font-black bg-slate-100 border text-slate-700 rounded-lg';
  let layoutAddon = '';

  if (classLevel && (classLevel.startsWith('1') || classLevel.startsWith('2'))) {
    containerBg = 'bg-[#f0f9ff]'; // Solid sky-50
    outerBorder = 'border-2 border-dashed border-sky-300 rounded-3xl';
    titleBadgeStyle = 'px-3 py-1 bg-sky-100 text-sky-850 border border-sky-200 text-[9.5px] uppercase font-bold rounded-full';
    layoutAddon = 'relative before:absolute before:inset-y-0 before:left-0 before:w-1 text-slate-800';
  } else if (classLevel && (classLevel.startsWith('3') || classLevel.startsWith('4'))) {
    containerBg = 'bg-white';
    outerBorder = 'border-4 border-double border-slate-705/80 rounded-none';
    titleBadgeStyle = 'px-3 py-1.5 bg-slate-900 text-white font-mono uppercase tracking-widest text-[9px] font-bold rounded-none';
    layoutAddon = 'shadow-xs ring-4 ring-slate-100';
  } else if (classLevel && (classLevel.startsWith('5') || classLevel.startsWith('6'))) {
    containerBg = 'bg-gradient-to-br from-[#fefbeb] via-white to-[#fff7ed]'; // Solid gradient
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
  const [bulletinStatus, setBulletinStatus] = useState<'Brouillon' | 'Finalisé'>('Brouillon');
  const [finalizeDialogFor, setFinalizeDialogFor] = useState<Bulletin | null>(null);

  // Course configuration states
  const [grades, setGrades] = useState<CourseGrade[]>([]);
  const [conduct, setConduct] = useState<Bulletin['conduct']>('Très Bonne');
  const [daysAbsent, setDaysAbsent] = useState<number>(0);

  // Manual course insertion controls
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseMaxPoints, setNewCourseMaxPoints] = useState<number>(20);

  // Extended customize fields for Bulletin matching official EPST style
  const [customStudentName, setCustomStudentName] = useState('');
  const [customStudentGender, setCustomStudentGender] = useState<'M' | 'F'>('M');
  const [customBirthDate, setCustomBirthDate] = useState('04/10/2005');
  const [customBirthPlace, setCustomBirthPlace] = useState('BUKAVU');
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [customSchoolCity, setCustomSchoolCity] = useState('BUKAVU');
  const [customSchoolCommune, setCustomSchoolCommune] = useState('IBANDA');
  const [customSchoolNationalCode, setCustomSchoolNationalCode] = useState('');
  const [customPermNumber, setCustomPermNumber] = useState('PERM 002');
  const [customTitulaireName, setCustomTitulaireName] = useState('TITULAIRE DE CLASSE / DG DESIGNÉ');
  const [customTitulaireId, setCustomTitulaireId] = useState('');
  const [customAcademicYear, setCustomAcademicYear] = useState('2025-2026');
  const [customId, setCustomId] = useState(''); // Custom Bulletin ID or N° ID ÉLÈVE

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
      
      const isPrat = g.courseName.toUpperCase().includes('PRAT. PROFESSIONNEL') || g.courseName.toUpperCase().includes('PRATIQUE');
      const courseSem1Max = isPrat ? g.maxPoints * 2 : g.maxPoints * 4;
      const courseSem2Max = isPrat ? g.maxPoints * 2 : g.maxPoints * 4;
      maxTotalAvailable += (courseSem1Max + courseSem2Max);
    });

    const percentage = maxTotalAvailable > 0 ? (currentTotalObtained / maxTotalAvailable) * 100 : 0;
    
    // Auto ranking calculated across matching class & option bulletins
    const peerBulletins = bulletins.filter(bullet => bullet.schoolId === b.schoolId && bullet.classLevel === b.classLevel && bullet.option === b.option);
    
    const parsedPeers = peerBulletins.map(pb => {
      let obtained = 0;
      let maxTotal = 0;
      pb.grades.forEach(g => {
        obtained += g.obtainedFirstPeriod + g.obtainedSecondPeriod + g.obtainedExamFirstSemester + g.obtainedThirdPeriod + g.obtainedFourthPeriod + g.obtainedExamSecondSemester;
        
        const isPrat = g.courseName.toUpperCase().includes('PRAT. PROFESSIONNEL') || g.courseName.toUpperCase().includes('PRATIQUE');
        const courseSem1Max = isPrat ? g.maxPoints * 2 : g.maxPoints * 4;
        const courseSem2Max = isPrat ? g.maxPoints * 2 : g.maxPoints * 4;
        maxTotal += (courseSem1Max + courseSem2Max);
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
    setFormClass('6ème Année' as any);
    setSelectedStudentId('');
    setIsManualInput(false);
    setManualStudentName('');
    setManualStudentGender('M');
    setGrades([]);
    setConduct('Très Bonne');
    setDaysAbsent(0);
    setBulletinStatus('Brouillon');
    setFormError('');

    // Sensible defaults for customization
    setCustomStudentName('');
    setCustomStudentGender('M');
    setCustomBirthDate('04/10/2005');
    setCustomBirthPlace('BUKAVU');
    setCustomSchoolName(currentSchool.name);
    setCustomSchoolCity(currentSchool.city || 'BUKAVU');
    setCustomSchoolCommune(currentSchool.commune || 'IBANDA');
    setCustomSchoolNationalCode(currentSchool.nationalCode || '20252000');
    setCustomPermNumber('PERM 002');
    setCustomId(`CD-${Date.now().toString().slice(-6)}`);
    setCustomTitulaireName('TITULAIRE DE CLASSE / DG DESIGNÉ');
    setCustomTitulaireId(`T-SYGEC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    setCustomAcademicYear('2025-2026');

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

    // Load custom details automatically from enrolled student record
    setCustomStudentName(studentObj.fullName);
    setCustomStudentGender(studentObj.gender);
    setCustomBirthDate(studentObj.birthDate || '04/10/2005');
    setCustomBirthPlace(studentObj.address || 'BUKAVU');
    setCustomId(studentObj.id);

    const matchSchool = schools.find(s => s.id === studentObj.schoolId) || currentSchool;
    setCustomSchoolName(matchSchool.name);
    setCustomSchoolCity(matchSchool.city || 'BUKAVU');
    setCustomSchoolCommune(matchSchool.commune || 'IBANDA');
    setCustomSchoolNationalCode(matchSchool.nationalCode || '20252000');

    // Check if bulletin already exist
    const matchedBul = bulletins.find(b => b.studentId === id);
    if (matchedBul) {
      setConduct(matchedBul.conduct);
      setDaysAbsent(matchedBul.daysAbsent);
      setGrades(matchedBul.grades);
      setBulletinStatus(matchedBul.status || 'Brouillon');
      if (matchedBul.academicYear) setCustomAcademicYear(matchedBul.academicYear);
      if (matchedBul.permNumber) setCustomPermNumber(matchedBul.permNumber);
      if (matchedBul.titulaireName) setCustomTitulaireName(matchedBul.titulaireName);
      if (matchedBul.titulaireId) setCustomTitulaireId(matchedBul.titulaireId);
      setFormError('Un bulletin existe déjà pour cet élève. Vous pouvez modifier ses détails.');
    } else {
      setFormError('');
      setBulletinStatus('Brouillon');
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

  const handleSaveBulletinForm = async (e: React.FormEvent) => {
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
      obtainedFirstPeriod: Math.min(g.maxPoints, Math.max(0, Number(g.obtainedFirstPeriod) || 0)),
      obtainedSecondPeriod: Math.min(g.maxPoints, Math.max(0, Number(g.obtainedSecondPeriod) || 0)),
      obtainedExamFirstSemester: Math.min(g.maxPoints, Math.max(0, Number(g.obtainedExamFirstSemester) || 0)),
      obtainedThirdPeriod: Math.min(g.maxPoints, Math.max(0, Number(g.obtainedThirdPeriod) || 0)),
      obtainedFourthPeriod: Math.min(g.maxPoints, Math.max(0, Number(g.obtainedFourthPeriod) || 0)),
      obtainedExamSecondSemester: Math.min(g.maxPoints, Math.max(0, Number(g.obtainedExamSecondSemester) || 0)),
    }));

    const resolvedStudentId = isManualInput ? (customId.trim() || studentId) : studentId;

    const preparedBulletin: Bulletin = {
      id: existing?.id || bulletinId,
      studentId: resolvedStudentId,
      classLevel: finalClass,
      option: finalOption,
      schoolId: formSchoolId,
      academicYear: customAcademicYear.trim() || '2025-2026',
      grades: cleanedGrades,
      conduct,
      daysAbsent,
      status: bulletinStatus,
      studentName: customStudentName.trim() || (isManualInput ? manualStudentName : undefined),
      studentGender: customStudentGender,
      studentBirthDate: customBirthDate.trim(),
      studentBirthPlace: customBirthPlace.trim(),
      schoolName: customSchoolName.trim(),
      schoolCity: customSchoolCity.trim(),
      schoolCommune: customSchoolCommune.trim(),
      schoolNationalCode: customSchoolNationalCode.trim(),
      permNumber: customPermNumber.trim(),
      titulaireName: customTitulaireName.trim(),
      titulaireId: customTitulaireId.trim(),
    };

    // Append to virtual students database if manually typed to prevent lookup crash
    if (isManualInput) {
      const isRegistered = students.some(s => s.id === resolvedStudentId);
      if (!isRegistered) {
        const dummyStudent: Student = {
          id: resolvedStudentId,
          fullName: (customStudentName || manualStudentName).trim(),
          gender: customStudentGender,
          birthDate: customBirthDate,
          address: customBirthPlace,
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
        
        <text x="300" y="690" font-size="11" font-weight="bold" fill="#94A3B8" text-anchor="middle">Portail SyGEC RDC - Ministère de l'EPST</text>
        <text x="300" y="710" font-size="9" fill="#94A3B8" text-anchor="middle">Empreinte de validation : ${preparedBulletin.id.slice(-8).toUpperCase()}</text>
      </svg>`;

      const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgCode)));

      const autoFile: ArchivedFile = {
        id: `FILE-ARCHIVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        schoolId: formSchoolId,
        fileName: `bulletin_${studName.replace(/\s+/g, '_').toLowerCase()}_${preparedBulletin.id.slice(-4)}.pdf`,
        fileType: 'application/pdf',
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

      // DIRECT HARDWARE STORAGE DOWNLOAD AS PDF (PDF ONLY POLICY)
      const pdfName = `SyGEC_BULLETIN_${studName.toUpperCase().replace(/\s+/g, '_')}_${preparedBulletin.id.slice(-4)}.pdf`;
      await downloadImageAsPDF(dataUrl, pdfName);
      
      showInstantAlert(`Sceau d'Archivage Généré ! Le bulletin de ${studName} a été automatiquement enregistré dans l'application et téléchargé au format PDF sécurisé dans le gestionnaire de fichiers de votre appareil.`);
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
          scale: 3, // Ultra high resolution image quality
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0,
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
          scale: 2.5, // Crisp high precision scaling for archival records
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0,
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

                          // Set customizable EPST national fields on edit
                          setCustomStudentName(b.studentName || studentName);
                          setCustomStudentGender(b.studentGender || (sits ? sits.gender : 'M'));
                          setCustomBirthDate(b.studentBirthDate || (sits ? sits.birthDate : '04/10/2005'));
                          setCustomBirthPlace(b.studentBirthPlace || (sits ? sits.address : 'BUKAVU'));
                          setCustomSchoolName(b.schoolName || currentSchool.name);
                          setCustomSchoolCity(b.schoolCity || currentSchool.city || 'BUKAVU');
                          setCustomSchoolCommune(b.schoolCommune || currentSchool.commune || 'IBANDA');
                          setCustomSchoolNationalCode(b.schoolNationalCode || currentSchool.nationalCode || '20252000');
                          setCustomPermNumber(b.permNumber || `PERM-0${b.id.slice(-4).toUpperCase()}`);
                          setCustomId(b.studentId || b.id || '');
                          setCustomTitulaireName(b.titulaireName || 'TITULAIRE DE CLASSE / DG DESIGNÉ');
                          setCustomTitulaireId(b.titulaireId || `T-SYGEC-${b.id.slice(0, 5).toUpperCase()}`);
                          setCustomAcademicYear(b.academicYear || '2025-2026');

                          setConduct(b.conduct);
                          setDaysAbsent(b.daysAbsent);
                          setGrades(b.grades);
                          setBulletinStatus(b.status || 'Brouillon');
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
                        const pdfName = `SyGEC_ARCHIVE_${file.studentName.toUpperCase().replace(/\s+/g, '_')}_${file.id}.pdf`;
                        await downloadImageAsPDF(file.imageData, pdfName);
                        showInstantAlert("Téléchargement du document PDF réussi !");
                      }}
                      className="flex-1 min-w-[100px] py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-xs border border-rose-500 font-sans"
                      title="Télécharger cette image d'archive sous format PDF officiel"
                    >
                      <span>📥</span> Télécharger Bulletin PDF
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

                {/* ADVANCED EPST METADATA ENCODER FIELDS */}
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                  <span className="font-extrabold text-[10px] text-blue-900 uppercase block font-mono">
                    🏛️ Encodage des Données du Programme National (Agréé EPST)
                  </span>
                  <p className="text-[9px] text-slate-500 leading-tight">
                    Modifiez manuellement tous les détails d'identification de l'élève, de l'école et du titulaire pour correspondre exactement à votre canevas physique.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">N° ID ÉLÈVE (Visible en haut)</label>
                      <input
                        type="text"
                        value={customId}
                        onChange={(e) => setCustomId(e.target.value)}
                        placeholder="Ex: EP-824-0019"
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold uppercase font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Nom complet officiel</label>
                      <input
                        type="text"
                        value={customStudentName}
                        onChange={(e) => setCustomStudentName(e.target.value)}
                        placeholder="Ex: AKONKWA BENEDICT Sharon"
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Sexe de l'élève</label>
                      <select
                        value={customStudentGender}
                        onChange={(e) => setCustomStudentGender(e.target.value as 'M' | 'F')}
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold bg-white"
                      >
                        <option value="M">Masculin (M)</option>
                        <option value="F">Féminin (F)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Né(e) Le (Date Naissance)</label>
                      <input
                        type="text"
                        value={customBirthDate}
                        onChange={(e) => setCustomBirthDate(e.target.value)}
                        placeholder="Ex: 04/10/2005"
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Né(e) À (Lieu Naissance)</label>
                      <input
                        type="text"
                        value={customBirthPlace}
                        onChange={(e) => setCustomBirthPlace(e.target.value)}
                        placeholder="Ex: BUKAVU"
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Année Scolaire</label>
                      <input
                        type="text"
                        value={customAcademicYear}
                        onChange={(e) => setCustomAcademicYear(e.target.value)}
                        placeholder="Ex: 2025-2026"
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Nom de l'Établissement</label>
                      <input
                        type="text"
                        value={customSchoolName}
                        onChange={(e) => setCustomSchoolName(e.target.value)}
                        placeholder="Ex: CS SAINT MICHEL"
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Code National École</label>
                      <input
                        type="text"
                        value={customSchoolNationalCode}
                        onChange={(e) => setCustomSchoolNationalCode(e.target.value)}
                        placeholder="Ex: 20252000"
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Ville d'implantation</label>
                      <input
                        type="text"
                        value={customSchoolCity}
                        onChange={(e) => setCustomSchoolCity(e.target.value)}
                        placeholder="Ex: BUKAVU"
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Commune d'implantation</label>
                      <input
                        type="text"
                        value={customSchoolCommune}
                        onChange={(e) => setCustomSchoolCommune(e.target.value)}
                        placeholder="Ex: IBANDA"
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">N° Permanent (N° PERM)</label>
                      <input
                        type="text"
                        value={customPermNumber}
                        onChange={(e) => setCustomPermNumber(e.target.value)}
                        placeholder="Ex: PERM 002"
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold uppercase font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Nom du Titulaire</label>
                      <input
                        type="text"
                        value={customTitulaireName}
                        onChange={(e) => setCustomTitulaireName(e.target.value)}
                        placeholder="Ex: Jean-Bosco Kabeya"
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">ID Titulaire (ID TIT)</label>
                      <input
                        type="text"
                        value={customTitulaireId}
                        onChange={(e) => setCustomTitulaireId(e.target.value)}
                        placeholder="Ex: T-SYGEC-F820"
                        className="w-full rounded-md border border-slate-300 p-1.5 text-xs font-semibold uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Selection: Brouillon de Travail vs Finalisé d'office */}
                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/50 space-y-2 mt-2">
                  <span className="block text-[10.5px] font-black text-amber-900 uppercase tracking-wider font-mono">
                    📌 État d'avancement du Bulletin
                  </span>
                  <p className="text-[9px] text-slate-500 leading-tight">
                    Marquez ce bulletin en tant que <b>Brouillon</b> si l'encodage est partiel ou incomplet, ou <b>Finalisé</b> s'il est prêt pour le scellement et le téléchargement des parents.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setBulletinStatus('Brouillon')}
                      className={`py-2 px-3 rounded-lg border font-extrabold flex items-center justify-center gap-1.5 transition-all text-[11px] ${
                        bulletinStatus === 'Brouillon'
                          ? 'bg-amber-600 border-amber-700 text-white shadow-xs'
                          : 'bg-white border-slate-250 text-slate-705 hover:bg-slate-50'
                      }`}
                    >
                      <span>📝</span>
                      <span>Brouillon (En cours)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulletinStatus('Finalisé')}
                      className={`py-2 px-3 rounded-lg border font-extrabold flex items-center justify-center gap-1.5 transition-all text-[11px] ${
                        bulletinStatus === 'Finalisé'
                          ? 'bg-[#155724] border-[#0c3c17] text-white shadow-xs'
                          : 'bg-white border-slate-255 text-slate-705 hover:bg-slate-50'
                      }`}
                    >
                      <span>🔒</span>
                      <span>Finalisé (Verrouillé)</span>
                    </button>
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

        const peerBulletins = bulletins.filter(bullet => bullet.schoolId === activeBulletin.schoolId && bullet.classLevel === activeBulletin.classLevel && bullet.option === activeBulletin.option);

        // Grouping helper
        const gradesGroupedByMax = activeBulletin.grades.reduce<Record<number, CourseGrade[]>>((acc, curr) => {
          const m = curr.maxPoints;
          if (!acc[m]) acc[m] = [];
          acc[m].push(curr);
          return acc;
        }, {});

        const sortedMaxGroups = Object.keys(gradesGroupedByMax)
          .map(Number)
          .sort((a, b) => a - b);

        const getCourseSem1Max = (courseName: string, maxPoints: number) => {
          const isPrat = courseName.toUpperCase().includes('PRAT. PROFESSIONNEL') || courseName.toUpperCase().includes('PRATIQUE');
          return isPrat ? maxPoints * 2 : maxPoints * 4;
        };
        const getCourseSem2Max = (courseName: string, maxPoints: number) => {
          const isPrat = courseName.toUpperCase().includes('PRAT. PROFESSIONNEL') || courseName.toUpperCase().includes('PRATIQUE');
          return isPrat ? maxPoints * 2 : maxPoints * 4;
        };
        const getCourseExamMax = (courseName: string, maxPoints: number) => {
          const isPrat = courseName.toUpperCase().includes('PRAT. PROFESSIONNEL') || courseName.toUpperCase().includes('PRATIQUE');
          return isPrat ? 0 : maxPoints * 2;
        };

        const totMaxP1 = activeBulletin.grades.reduce((sum, g) => sum + g.maxPoints, 0);
        const totMaxP2 = totMaxP1;
        const totMaxEx1 = activeBulletin.grades.reduce((sum, g) => sum + getCourseExamMax(g.courseName, g.maxPoints), 0);
        const totMaxSem1 = activeBulletin.grades.reduce((sum, g) => sum + getCourseSem1Max(g.courseName, g.maxPoints), 0);

        const totMaxP3 = totMaxP1;
        const totMaxP4 = totMaxP1;
        const totMaxEx2 = totMaxEx1;
        const totMaxSem2 = totMaxSem1;
        const totMaxGeneral = totMaxSem1 + totMaxSem2;

        const totObtP1 = activeBulletin.grades.reduce((sum, g) => sum + g.obtainedFirstPeriod, 0);
        const totObtP2 = activeBulletin.grades.reduce((sum, g) => sum + g.obtainedSecondPeriod, 0);
        const totObtEx1 = activeBulletin.grades.reduce((sum, g) => sum + g.obtainedExamFirstSemester, 0);
        const totObtSem1 = activeBulletin.grades.reduce((sum, g) => sum + g.obtainedFirstPeriod + g.obtainedSecondPeriod + g.obtainedExamFirstSemester, 0);

        const totObtP3 = activeBulletin.grades.reduce((sum, g) => sum + g.obtainedThirdPeriod, 0);
        const totObtP4 = activeBulletin.grades.reduce((sum, g) => sum + g.obtainedFourthPeriod, 0);
        const totObtEx2 = activeBulletin.grades.reduce((sum, g) => sum + g.obtainedExamSecondSemester, 0);
        const totObtSem2 = activeBulletin.grades.reduce((sum, g) => sum + g.obtainedThirdPeriod + g.obtainedFourthPeriod + g.obtainedExamSecondSemester, 0);
        const totObtGeneral = totObtSem1 + totObtSem2;

        const percentP1 = totMaxP1 > 0 ? Number(((totObtP1 / totMaxP1) * 100).toFixed(1)) : 0;
        const percentP2 = totMaxP2 > 0 ? Number(((totObtP2 / totMaxP2) * 100).toFixed(1)) : 0;
        const percentEx1 = totMaxEx1 > 0 ? Number(((totObtEx1 / totMaxEx1) * 100).toFixed(1)) : 0;
        const percentSem1 = totMaxSem1 > 0 ? Number(((totObtSem1 / totMaxSem1) * 100).toFixed(1)) : 0;

        const percentP3 = totMaxP3 > 0 ? Number(((totObtP3 / totMaxP3) * 100).toFixed(1)) : 0;
        const percentP4 = totMaxP4 > 0 ? Number(((totObtP4 / totMaxP4) * 100).toFixed(1)) : 0;
        const percentEx2 = totMaxEx2 > 0 ? Number(((totObtEx2 / totMaxEx2) * 100).toFixed(1)) : 0;
        const percentSem2 = totMaxSem2 > 0 ? Number(((totObtSem2 / totMaxSem2) * 100).toFixed(1)) : 0;
        const percentGeneral = totMaxGeneral > 0 ? Number(((totObtGeneral / totMaxGeneral) * 100).toFixed(1)) : 0;

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

              {/* Dynamic draft mode reminder banner */}
              {(!activeBulletin.status || activeBulletin.status === 'Brouillon') && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <div>
                      <p className="font-extrabold font-mono text-[11px] text-amber-805 uppercase">Mode Brouillon de Travail</p>
                      <p className="text-[10px] text-amber-700 leading-tight">
                        Ce bulletin n'a pas encore été finalisé d'office. Il contient un filigrane de sécurité "BROUILLON".
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const u = { ...activeBulletin, status: 'Finalisé' as const };
                      onUpdateBulletin(u);
                      setActiveBulletin(u);
                      showInstantAlert("Félicitations! Le bulletin est maintenant Finalisé d'office et scellé.");
                    }}
                    className="bg-amber-600 hover:bg-amber-750 text-white font-black px-3.5 py-1.5 rounded-lg shadow-sm transition-all text-[11px] cursor-pointer"
                  >
                    🔒 Finaliser Maintenant
                  </button>
                </div>
              )}

              {/* Print Area core scroll */}
              <div 
                id="school-bulletin-printable" 
                className="flex-1 overflow-y-auto bg-white text-black border border-slate-400 font-sans relative shadow-inner p-1"
              >
                <div className="relative w-full min-h-full p-4 md:p-6 space-y-4 flex flex-col justify-start bg-white border border-black">
                  
                  {/* Official RDC Tricolor Banner Line */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400 via-yellow-400 to-red-500 z-20" />

                  {/* Armoiries et Drapeau en fond filigrane - HAUTEMENT VISIBLE ET PROPRE */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none">
                    <CongoCoatOfArms className="w-[450px] h-[450px]" opacityClassName="opacity-[0.55]" />
                  </div>

                  {/* Robust security diagonal watermark for draft bulletins */}
                  {(!activeBulletin.status || activeBulletin.status === 'Brouillon') && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 select-none overflow-hidden origin-center rotate-[-30deg]">
                      <span className="text-[50px] md:text-[68px] font-black tracking-widest text-[#D32F2F] opacity-[0.09] uppercase font-mono border-8 border-[#D32F2F] px-6 py-2 rounded-2xl whitespace-nowrap">
                        BROUILLON DE TRAVAIL
                      </span>
                    </div>
                  )}

                  {/* RDC State Header */}
                  <div className="border border-black p-2 bg-white relative z-10 space-y-2">
                    <div className="flex justify-between items-center border-b border-black pb-2">
                      {/* Left Side Flag */}
                      <div className="w-16 h-10 border border-black flex items-center justify-center bg-sky-100 p-0.5 overflow-hidden shadow-xs">
                        <CongoFlagIcon className="w-full h-full object-cover scale-105" />
                      </div>

                      {/* Center branding */}
                      <div className="text-center px-4 space-y-0.5 flex-1">
                        <h1 className="text-[11px] font-black tracking-widest font-sans">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</h1>
                        <h2 className="text-[9px] font-extrabold font-sans text-slate-800 leading-tight uppercase font-black">MINISTÈRE DE L’ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET TECHNIQUE</h2>
                        <p className="text-[8px] font-bold text-slate-650 tracking-wider">SECRETARIAT GENERAL &bull; INSPECTION GENERALE DE L'EPST</p>
                      </div>

                      {/* Right Coat of Arms */}
                      <div className="w-14 h-10 flex items-center justify-center">
                        <CongoCoatOfArms className="w-10 h-10" opacityClassName="opacity-100" />
                      </div>
                    </div>

                    {/* Meta information of pupil - Grey Grid layout conforming to original photo watermarks */}
                    <div className="grid grid-cols-12 border-t border-b border-black text-[9px] font-mono leading-relaxed divide-y divide-black bg-slate-50/70">
                      {/* Row 1: ID */}
                      <div className="col-span-12 p-1.5 flex items-center gap-2">
                        <span className="font-bold uppercase tracking-wider text-slate-705">N° ID ÉLÈVE :</span>
                        <span className="font-black text-[10px] tracking-widest text-[#D32F2F] bg-white px-2 py-0.5 border border-slate-300 font-mono">
                          {(activeBulletin.studentId || '').toUpperCase()}
                        </span>
                      </div>

                      {/* Row 2: VILLE / ELEVE / SEXE */}
                      <div className="col-span-12 grid grid-cols-12 divide-x divide-black">
                        <div className="col-span-4 p-1.5 flex items-center gap-1">
                          <span className="font-bold uppercase text-slate-755">VILLE :</span>
                          <span className="font-extrabold text-black uppercase">{activeBulletin.schoolCity || schoolObj.city || 'BUKAVU'}</span>
                        </div>
                        <div className="col-span-6 p-1.5 flex items-center gap-1">
                          <span className="font-bold uppercase text-slate-755">ÉLÈVE :</span>
                          <span className="font-black text-black uppercase text-[10px]">{activeBulletin.studentName || displayName.toUpperCase()}</span>
                        </div>
                        <div className="col-span-2 p-1.5 flex items-center justify-between">
                          <span className="font-bold uppercase text-slate-755">SEXE :</span>
                          <span className="font-black text-black">{(activeBulletin.studentGender || genderText).charAt(0).toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Row 3: COMMUNE / NE(E) A / LE */}
                      <div className="col-span-12 grid grid-cols-12 divide-x divide-black">
                        <div className="col-span-4 p-1.5 flex items-center gap-1">
                          <span className="font-bold uppercase text-slate-755">COMMUNE :</span>
                          <span className="font-extrabold text-black uppercase">{activeBulletin.schoolCommune || schoolObj.commune || 'IBANDA'}</span>
                        </div>
                        <div className="col-span-4 p-1.5 flex items-center gap-1">
                          <span className="font-bold uppercase text-slate-755">NE(E) A :</span>
                          <span className="font-extrabold text-black uppercase">{activeBulletin.studentBirthPlace || schoolObj.city || 'BUKAVU'}</span>
                        </div>
                        <div className="col-span-4 p-1.5 flex items-center gap-1">
                          <span className="font-bold uppercase text-slate-755">LE :</span>
                          <span className="font-extrabold text-black">{activeBulletin.studentBirthDate || (student ? student.birthDate : '04/10/2005')}</span>
                        </div>
                      </div>

                      {/* Row 4: ECOLE / CLASSE */}
                      <div className="col-span-12 grid grid-cols-12 divide-x divide-black">
                        <div className="col-span-6 p-1.5 flex items-center gap-1">
                          <span className="font-bold uppercase text-slate-755">ÉCOLE :</span>
                          <span className="font-black text-black uppercase">{activeBulletin.schoolName || schoolObj.name.toUpperCase()}</span>
                        </div>
                        <div className="col-span-6 p-1.5 flex items-center gap-1">
                          <span className="font-bold uppercase text-slate-755">CLASSE-OPTION :</span>
                          <span className="font-black text-black uppercase">{activeBulletin.classLevel.toUpperCase()} {activeBulletin.option.toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Row 5: CODE / N° PERM */}
                      <div className="col-span-12 grid grid-cols-12 divide-x divide-black">
                        <div className="col-span-6 p-1.5 flex items-center gap-1">
                          <span className="font-bold uppercase text-slate-755">CODE NATIONAL :</span>
                          <span className="font-black text-black font-mono">{activeBulletin.schoolNationalCode || schoolObj.nationalCode}</span>
                        </div>
                        <div className="col-span-6 p-1.5 flex items-center gap-1">
                          <span className="font-bold uppercase text-slate-755">N° PERM :</span>
                          <span className="font-black text-black text-[8.5px]">{activeBulletin.permNumber || `PERM-0${activeBulletin.id.slice(-4).toUpperCase()}`}</span>
                        </div>
                      </div>

                      {/* Row 6: TITULAIRE / ID */}
                      <div className="col-span-12 grid grid-cols-12 divide-x divide-black">
                        <div className="col-span-8 p-1.5 flex items-center gap-1">
                          <span className="font-bold uppercase text-slate-755">TITULAIRE :</span>
                          <span className="font-extrabold text-black uppercase">{activeBulletin.titulaireName || 'TITULAIRE DE CLASSE / DG DESIGNÉ'}</span>
                        </div>
                        <div className="col-span-4 p-1.5 flex items-center gap-1">
                          <span className="font-bold uppercase text-slate-755">ID TIT :</span>
                          <span className="font-black text-slate-800 font-mono">{activeBulletin.titulaireId || `T-SYGEC-${activeBulletin.id.slice(0, 5).toUpperCase()}`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Center Bulletin Title band */}
                    <div className="py-2 text-center bg-slate-900 text-white rounded-md mt-1">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-yellow-300">
                        BULLETIN DE NOTES OFFICIEL &bull; ANNEE SCOLAIRE {activeBulletin.academicYear}
                      </h3>
                    </div>
                  </div>

                  {/* Official RDC Grades Table matrix conforming to original photo grouping */}
                  <div className="overflow-x-auto border border-black relative z-10 bg-white/70">
                    <table className="w-full text-[9px] text-left border-collapse border border-black">
                      <thead>
                        <tr className="border-b border-black divide-x divide-black font-black text-center bg-slate-100 text-black">
                          <th rowSpan={2} className="py-2 px-2 text-left w-52 border-r border-black uppercase font-black text-blue-950">
                            MATIÈRES ENSEIGNÉES
                          </th>
                          <th rowSpan={2} className="py-2 px-0.5 bg-slate-50 border-r border-black text-[8px] uppercase font-black text-slate-700 text-center">
                            MAX PÉRIODE
                          </th>
                          <th colSpan={3} className="py-1 border-r border-black bg-sky-50 text-sky-950 uppercase tracking-wider text-[8px] font-black">
                            1er SEMESTRE (Points Obtenus)
                          </th>
                          <th colSpan={3} className="py-1 border-r border-black bg-red-50 text-red-950 uppercase tracking-wider text-[8px] font-black">
                            2ème SEMESTRE (Points Obtenus)
                          </th>
                          <th rowSpan={2} className="py-2 px-0.5 bg-amber-200 text-slate-950 font-black border-r border-black text-[9px] w-14">
                            T.G.
                          </th>
                          <th colSpan={2} className="py-1 bg-slate-150 text-slate-805 uppercase tracking-tight text-[7.5px] font-bold">
                            EXAM RÉPÊCHAGE
                          </th>
                        </tr>
                        <tr className="border-b border-black divide-x divide-black text-[8px] font-mono bg-slate-105 text-center">
                          <th className="py-1 bg-sky-50/40">1ère P.</th>
                          <th className="py-1 bg-sky-50/40">2ème P.</th>
                          <th className="py-1 bg-sky-100/60 font-black text-sky-900 border-r border-black">EXAM 1</th>
                          <th className="py-1 bg-red-50/40">3ème P.</th>
                          <th className="py-1 bg-red-50/40">4ème P.</th>
                          <th className="py-1 bg-red-100/60 font-black text-rose-900 border-r border-black">EXAM 2</th>
                          <th className="py-1 bg-slate-100 text-[7px] font-serif font-semibold">%</th>
                          <th className="py-1 bg-slate-100 text-[6.5px] font-serif font-semibold">SIGN.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black">
                        {sortedMaxGroups.map((maxVal) => {
                          const courseList = gradesGroupedByMax[maxVal] || [];
                          
                          return (
                            <React.Fragment key={maxVal}>
                              {/* Group divider showing MAXIMA row */}
                              <tr className="bg-slate-205 font-black text-black divide-x divide-black text-center text-[8.5px] border-t-2 border-b-2 border-black">
                                <td className="py-1 px-2 text-left uppercase tracking-widest font-black text-slate-800">
                                  MAXIMA
                                </td>
                                <td className="py-1 font-mono font-bold">{maxVal}</td>
                                <td className="py-1 font-mono font-bold">{maxVal}</td>
                                <td className="py-1 font-mono bg-sky-100/50 text-sky-950">{getCourseExamMax('', maxVal) || ''}</td>
                                <td className="py-1 font-mono bg-sky-200 text-sky-950 font-black">{getCourseSem1Max('', maxVal)}</td>
                                <td className="py-1 font-mono font-bold">{maxVal}</td>
                                <td className="py-1 font-mono font-bold">{maxVal}</td>
                                <td className="py-1 font-mono bg-rose-100/50 text-rose-950">{getCourseExamMax('', maxVal) || ''}</td>
                                <td className="py-1 font-mono bg-red-200 text-rose-950 font-black">{getCourseSem2Max('', maxVal)}</td>
                                <td className="py-1 font-mono bg-yellow-200 text-slate-950 font-black">
                                  {getCourseSem1Max('', maxVal) + getCourseSem2Max('', maxVal)}
                                </td>
                                <td colSpan={2} className="bg-slate-150"></td>
                              </tr>

                              {/* Courses belonging to this group */}
                              {courseList.map((g, cIdx) => {
                                const isPrat = g.courseName.toUpperCase().includes('PRAT. PROFESSIONNEL') || g.courseName.toUpperCase().includes('PRATIQUE');
                                const sem1Total = g.obtainedFirstPeriod + g.obtainedSecondPeriod + g.obtainedExamFirstSemester;
                                const sem1Max = isPrat ? g.maxPoints * 2 : g.maxPoints * 4;
                                
                                const sem2Total = g.obtainedThirdPeriod + g.obtainedFourthPeriod + g.obtainedExamSecondSemester;
                                const sem2Max = isPrat ? g.maxPoints * 2 : g.maxPoints * 4;

                                const tgTotal = sem1Total + sem2Total;
                                const tgMax = sem1Max + sem2Max;
                                const isPassing = tgTotal >= tgMax * 0.5;

                                return (
                                  <tr key={cIdx} className="hover:bg-slate-50 divide-x divide-black text-center text-[9px] text-slate-800">
                                    <td className="py-1.5 px-2 text-left font-sans font-extrabold border-r border-black uppercase text-slate-950">
                                      {g.courseName}
                                    </td>
                                    <td className="py-1.5 font-mono font-medium">{g.obtainedFirstPeriod}</td>
                                    <td className="py-1.5 font-mono font-medium">{g.obtainedSecondPeriod}</td>
                                    <td className={`py-1.5 font-mono font-bold ${isPrat ? 'bg-slate-200/50 text-slate-450' : 'bg-slate-50'}`}>
                                      {isPrat ? '' : g.obtainedExamFirstSemester}
                                    </td>
                                    <td className="py-1.5 font-mono font-black bg-sky-50 text-sky-900">{sem1Total}</td>
                                    <td className="py-1.5 font-mono font-medium">{g.obtainedThirdPeriod}</td>
                                    <td className="py-1.5 font-mono font-medium">{g.obtainedFourthPeriod}</td>
                                    <td className={`py-1.5 font-mono font-bold ${isPrat ? 'bg-slate-200/50 text-slate-450' : 'bg-slate-50'}`}>
                                      {isPrat ? '' : g.obtainedExamSecondSemester}
                                    </td>
                                    <td className="py-1.5 font-mono font-black bg-rose-50/50 text-rose-900">{sem2Total}</td>
                                    <td className={`py-1.5 font-mono font-black border-r border-black text-[9.5px] ${isPassing ? 'bg-emerald-50 text-emerald-950 font-bold' : 'bg-red-50 text-red-950 font-bold'}`}>
                                      {tgTotal}
                                    </td>
                                    {/* Exam repechage blank placeholders */}
                                    <td className="py-1.5 bg-slate-50"></td>
                                    <td className="py-1.5 bg-slate-50"></td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}

                        {/* Overall MAXIMA GENERAUX row */}
                        <tr className="bg-slate-300 text-black font-black text-center text-[9.5px] border-t-2 border-b border-black divide-x divide-black">
                          <td className="py-1.5 px-2 text-left uppercase font-black">MAXIMA GENERAUX</td>
                          <td className="py-1.5 font-mono">{totMaxP1}</td>
                          <td className="py-1.5 font-mono">{totMaxP2}</td>
                          <td className="py-1.5 font-mono bg-sky-50">{totMaxEx1}</td>
                          <td className="py-1.5 font-mono bg-sky-100 font-black">{totMaxSem1}</td>
                          <td className="py-1.5 font-mono">{totMaxP3}</td>
                          <td className="py-1.5 font-mono">{totMaxP4}</td>
                          <td className="py-1.5 font-mono bg-red-50">{totMaxEx2}</td>
                          <td className="py-1.5 font-mono bg-red-100 font-black">{totMaxSem2}</td>
                          <td className="py-1.5 font-mono bg-yellow-300 text-slate-900 font-black text-[10px]">
                            {totMaxGeneral}
                          </td>
                          <td colSpan={2} className="bg-slate-150"></td>
                        </tr>

                        {/* Overall TOTAUX OBTENUS row */}
                        <tr className="bg-slate-205 text-black font-black text-center text-[10px] border-b border-black divide-x divide-black">
                          <td className="py-1.5 px-2 text-left uppercase font-extrabold text-slate-800">TOTAUX OBTENUS</td>
                          <td className="py-1.5 font-mono">{totObtP1}</td>
                          <td className="py-1.5 font-mono">{totObtP2}</td>
                          <td className="py-1.5 font-mono bg-slate-50">{totObtEx1}</td>
                          <td className="py-1.5 font-mono bg-sky-50/80 font-black text-sky-950">{totObtSem1}</td>
                          <td className="py-1.5 font-mono">{totObtP3}</td>
                          <td className="py-1.5 font-mono">{totObtP4}</td>
                          <td className="py-1.5 font-mono bg-slate-50">{totObtEx2}</td>
                          <td className="py-1.5 font-mono bg-red-50/80 font-black text-red-950">{totObtSem2}</td>
                          <td className="py-1.5 font-mono bg-amber-100 text-black font-black text-[11px] border-l border-black">
                            {totObtGeneral}
                          </td>
                          <td colSpan={2} className="bg-slate-250"></td>
                        </tr>

                        {/* COLUMN PERCENTAGES row */}
                        <tr className="bg-blue-900 text-white font-black text-center text-[8.5px] border-b border-black divide-x divide-blue-800">
                          <td className="py-1.5 px-2 text-left uppercase font-black text-yellow-300">POURCENTAGE SCOLAIRE</td>
                          <td className="py-1.5 font-mono">{percentP1}%</td>
                          <td className="py-1.5 font-mono">{percentP2}%</td>
                          <td className="py-1.5 font-mono">{percentEx1}%</td>
                          <td className="py-1.5 font-mono bg-blue-950 font-extrabold text-yellow-300 text-[10px]">{percentSem1}%</td>
                          <td className="py-1.5 font-mono">{percentP3}%</td>
                          <td className="py-1.5 font-mono">{percentP4}%</td>
                          <td className="py-1.5 font-mono">{percentEx2}%</td>
                          <td className="py-1.5 font-mono bg-rose-950 font-extrabold text-yellow-300 text-[10px]">{percentSem2}%</td>
                          <td className="py-1.5 font-mono bg-yellow-405 text-blue-950 font-black text-[10px]">
                            {percentGeneral}%
                          </td>
                          <td colSpan={2} className="bg-blue-950 text-yellow-250 font-bold uppercase text-[7px] text-center">Rattrapage</td>
                        </tr>

                        {/* PLACE/NBRE ELEV row */}
                        <tr className="bg-slate-50 text-black font-semibold text-center text-[9px] border-b border-black divide-x divide-black">
                          <td className="py-1 px-2 text-left uppercase font-bold text-slate-700">PLACE/NBRE ELEV</td>
                          <td colSpan={4} className="py-1 text-black font-bold text-left pl-2">PLACE: {metrics.rankText}</td>
                          <td colSpan={4} className="py-1 text-black font-mono text-left pl-2">INSCRITS: {peerBulletins.length} élève(s)</td>
                          <td className="py-1 bg-yellow-100 font-black text-[10px]">{metrics.rank}</td>
                          <td colSpan={2} className="bg-slate-200"></td>
                        </tr>

                        {/* APPLICATION row */}
                        <tr className="bg-white text-black font-semibold text-center text-[9px] border-b border-black divide-x divide-black">
                          <td className="py-1 px-2 text-left uppercase font-bold text-slate-700">APPLICATION</td>
                          <td colSpan={4} className="py-1 text-left pl-2 font-mono">ASSIDU AUTOMATIQUE</td>
                          <td colSpan={4} className="py-1 text-left pl-2 font-mono">EXCELLENTE PERFORMANCE</td>
                          <td className="py-1 font-bold">E</td>
                          <td colSpan={2} className="bg-slate-200"></td>
                        </tr>

                        {/* CONDUITE row */}
                        <tr className="bg-slate-50 text-black font-semibold text-center text-[9px] border-b border-black divide-x divide-black">
                          <td className="py-1 px-2 text-left uppercase font-bold text-slate-700">CONDUITE</td>
                          <td colSpan={4} className="py-1 text-left pl-2 font-bold text-emerald-800">{activeBulletin.conduct.toUpperCase()}</td>
                          <td colSpan={4} className="py-1 text-left pl-2 text-red-700 font-mono">Absence Injustifiée: {activeBulletin.daysAbsent} jours</td>
                          <td className="py-1 font-mono font-bold text-emerald-800">{activeBulletin.conduct === 'Très Bonne' ? 'TB' : 'B'}</td>
                          <td colSpan={2} className="bg-slate-200"></td>
                        </tr>

                        {/* SIGNATURES RESPONSABLES row */}
                        <tr className="bg-white text-black font-semibold text-center text-[9px] divide-x divide-black">
                          <td className="py-1 px-2 text-left uppercase font-bold text-slate-700">SIGN. RESPONSABLE</td>
                          <td colSpan={4} className="py-1 text-slate-400 italic">Signature oblig.</td>
                          <td colSpan={4} className="py-1 text-slate-400 italic">Visé Nationalement</td>
                          <td className="py-1"></td>
                          <td colSpan={2} className="bg-slate-200"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Footnotes and Signatures matching the original photo */}
                  <div className="pt-3 grid grid-cols-12 gap-3 text-[8.5px] border-t border-black leading-relaxed mt-1 relative z-15">
                    {/* Left footnotes */}
                    <div className="col-span-6 space-y-1 text-left">
                      <p className="font-semibold text-slate-800">
                        - L'élève ne pourra passer dans la classe supérieure s'il ne subit avec succès un examen de repêchage en :
                      </p>
                      <p className="border-b border-black border-dotted h-3.5 w-full"></p>
                      <p className="font-semibold text-slate-800">
                        - L’élève {percentGeneral >= 50.0 ? <strong>passe dans la classe supérieure</strong> : <span className="line-through text-slate-400">passe dans la classe supérieure</span>} (1)
                      </p>
                      <p className="font-semibold text-slate-800">
                        - L’élève {percentGeneral < 50.0 ? <strong>double sa classe</strong> : <span className="line-through text-slate-400">double sa classe</span>} (1)
                      </p>
                      <p className="font-semibold text-slate-800">
                        - L’élève a échoué et est orienté vers : .............................................. (1)
                      </p>
                      
                      <div className="pt-2 grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-bold uppercase tracking-wider text-slate-500 block text-[7px]">Signature de l'élève</span>
                          <div className="h-7 border border-dashed border-slate-350 w-24 rounded bg-slate-50/10" />
                        </div>
                        <div className="flex flex-col justify-end text-left">
                          <span className="text-[7px] italic text-slate-500 block leading-tight">
                            (1) Biffer la mention inutile.
                          </span>
                          <span className="text-[7px] font-bold text-red-650 block leading-tight">
                            Note importante : Le bulletin est sans valeur s'il est raturé ou surchargé.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Sceau */}
                    <div className="col-span-3 text-center flex flex-col justify-between py-1">
                      <div>
                        <span className="font-bold uppercase text-slate-500 text-[7px] block tracking-wider">SCEAU DE L’ÉCOLE</span>
                        <div className="w-16 h-16 border border-slate-300 border-dashed rounded-full mx-auto my-1 flex items-center justify-center text-[6px] text-slate-400 uppercase select-none italic font-mono p-1 text-center leading-tight">
                          CS SyGEC EPST
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="inline-block p-1 bg-white border border-slate-200 rounded self-center shadow-3xs cursor-pointer hover:bg-slate-50" onClick={() => onOpenQRScanner(activeBulletin.id)}>
                          <svg viewBox="0 0 100 100" className="w-8 h-8 text-slate-900 mx-auto" fill="currentColor">
                            <rect x="0" y="0" width="30" height="30" />
                            <rect x="6" y="6" width="18" height="18" fill="white" />
                            <rect x="10" y="10" width="10" height="10" />
                            <rect x="70" y="0" width="30" height="30" />
                            <rect x="76" y="6" width="18" height="18" fill="white" />
                            <rect x="80" y="10" width="10" height="10" />
                            <rect x="0" y="70" width="30" height="30" />
                            <rect x="6" y="76" width="18" height="18" fill="white" />
                            <rect x="10" y="80" width="10" height="10" />
                            <rect x="40" y="40" width="20" height="20" />
                          </svg>
                          <span className="text-[4px] block uppercase tracking-widest text-slate-400 font-mono mt-0.5 font-bold">VÉRIF CONFORME</span>
                        </div>
                      </div>
                    </div>

                    {/* Right signature */}
                    <div className="col-span-3 text-right flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">
                          Fait à {schoolObj.city || 'Bukavu'}, le {new Date().toLocaleDateString('fr-FR')}
                        </p>
                        <p className="font-extrabold uppercase text-slate-900 mt-1 block text-[8px]">
                          Le Chef d'Établissement,
                        </p>
                        <p className="text-[7.5px] italic text-slate-500 block leading-none">
                          Nom et signature
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <p className="font-black text-blue-900 uppercase tracking-tight text-[8.5px] leading-tight font-serif italic text-right">
                          Préfet {schoolObj.rectorName ? schoolObj.rectorName.replace('Monsieur le Préfet ', '') : 'Directeur des Études'}
                        </p>
                        <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-1 leading-none">
                          IGE/P.S/094
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Control Toolbar */}
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

                      // Populate custom EPST states on edit inside Details view
                      setCustomStudentName(activeBulletin.studentName || displayName);
                      setCustomStudentGender(activeBulletin.studentGender || (sits ? sits.gender : 'M'));
                      setCustomBirthDate(activeBulletin.studentBirthDate || (sits ? sits.birthDate : '04/10/2005'));
                      setCustomBirthPlace(activeBulletin.studentBirthPlace || (sits ? sits.address : 'BUKAVU'));
                      setCustomSchoolName(activeBulletin.schoolName || schoolObj.name || currentSchool.name);
                      setCustomSchoolCity(activeBulletin.schoolCity || schoolObj.city || currentSchool.city || 'BUKAVU');
                      setCustomSchoolCommune(activeBulletin.schoolCommune || schoolObj.commune || currentSchool.commune || 'IBANDA');
                      setCustomSchoolNationalCode(activeBulletin.schoolNationalCode || schoolObj.nationalCode || currentSchool.nationalCode || '20252000');
                      setCustomPermNumber(activeBulletin.permNumber || `PERM-0${activeBulletin.id.slice(-4).toUpperCase()}`);
                      setCustomId(activeBulletin.studentId || activeBulletin.id || '');
                      setCustomTitulaireName(activeBulletin.titulaireName || 'TITULAIRE DE CLASSE / DG DESIGNÉ');
                      setCustomTitulaireId(activeBulletin.titulaireId || `T-SYGEC-${activeBulletin.id.slice(0, 5).toUpperCase()}`);
                      setCustomAcademicYear(activeBulletin.academicYear || '2025-2026');

                      setConduct(activeBulletin.conduct);
                      setDaysAbsent(activeBulletin.daysAbsent);
                      setGrades(activeBulletin.grades);
                      setBulletinStatus(activeBulletin.status || 'Brouillon');
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
                      if (!activeBulletin.status || activeBulletin.status === 'Brouillon') {
                        setFinalizeDialogFor(activeBulletin);
                      } else {
                        setIsDownloadingPdf(true);
                        try {
                          const filename = `SyGEC_BULLETIN_${displayName.toUpperCase().replace(/\s+/g, '_')}_${activeBulletin.id.slice(-4)}.pdf`;
                          await downloadElementAsPDF('school-bulletin-printable', filename);
                        } catch (err) {
                          console.error("PDF download failed:", err);
                        } finally {
                          setIsDownloadingPdf(false);
                        }
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
                  onClick={async () => {
                    const pdfName = `SyGEC_ARCHIVE_${selectedArchiveView.studentName.toUpperCase().replace(/\s+/g, '_')}_${selectedArchiveView.id}.pdf`;
                    await downloadImageAsPDF(selectedArchiveView.imageData, pdfName);
                    showInstantAlert("Téléchargement du document PDF réussi !");
                  }}
                  className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 shadow-md cursor-pointer font-sans"
                >
                  Télécharger Bulletin PDF
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
              <div className="pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    const pdfName = sharingImage.filename.replace(/\.(png|jpg|jpeg)$/i, '') + '.pdf';
                    await downloadImageAsPDF(sharingImage.url, pdfName);
                    showInstantAlert("Fichier PDF généré et téléchargé avec succès !");
                  }}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer font-sans"
                >
                  <span className="text-sm">📥</span>
                  Télécharger au format PDF
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

      {/* MODAL PROMPT: Ask user to finalize or download as draft */}
      {finalizeDialogFor && (() => {
        const student = students.find(s => s.id === finalizeDialogFor.studentId);
        const name = student ? student.fullName : 'Élève';
        
        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[120] p-4 animate-fade-in" id="finalize-confirm-modal">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-4 border-amber-500">
              {/* Header */}
              <div className="bg-amber-500 text-white p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤔</span>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider font-sans leading-none">
                    Validation du Bulletin
                  </h4>
                </div>
                <button 
                  onClick={() => setFinalizeDialogFor(null)} 
                  className="text-white hover:text-amber-100 bg-amber-600 hover:bg-amber-700 px-2.5 py-1 rounded-lg cursor-pointer font-bold text-xs"
                >
                  Fermer
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-4 text-slate-800 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto border-2 border-amber-300">
                  <span className="text-3xl">📝</span>
                </div>
                <div className="space-y-1">
                  <h5 className="font-extrabold text-slate-900 text-md uppercase">Avez-vous déjà fini ?</h5>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Vous demandez le téléchargement du bulletin de : <br />
                    <span className="font-extrabold text-blue-900 text-xs">{name.toUpperCase()}</span>
                  </p>
                </div>

                <div className="text-[11.5px] leading-relaxed text-slate-650 bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-1 text-left">
                  <p>
                    🔒 <b>Finalisé</b> : Retire le filigrane "Brouillon" du bulletin, applique le scellement officiel et prépare le téléchargement officiel.
                  </p>
                  <p>
                    ✏️ <b>Brouillon</b> : Conserve le bulletin modifiable, mais télécharge un PDF d'aperçu portant le marquage de sécurité "Brouillon".
                  </p>
                </div>

                {/* Choices */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const updatedBul = { ...finalizeDialogFor, status: 'Finalisé' as const };
                      onUpdateBulletin(updatedBul);
                      setActiveBulletin(updatedBul); // Update viewed reference
                      setFinalizeDialogFor(null);
                      
                      setIsDownloadingPdf(true);
                      showInstantAlert("Génération du scellement finalisé...");
                      try {
                        const filename = `SyGEC_BULLETIN_${name.toUpperCase().replace(/\s+/g, '_')}_${updatedBul.id.slice(-4)}.pdf`;
                        await downloadElementAsPDF('school-bulletin-printable', filename);
                        showInstantAlert(`Scellement validé d'office ! Bulletin de ${name} téléchargé avec succès.`);
                      } catch (err) {
                        console.error("PDF download failed:", err);
                      } finally {
                        setIsDownloadingPdf(false);
                      }
                    }}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer font-sans"
                  >
                    <span>🔒</span>
                    Oui ! Finaliser et Télécharger
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setFinalizeDialogFor(null);
                      setIsDownloadingPdf(true);
                      showInstantAlert("Génération de l'aperçu brouillon...");
                      try {
                        const filename = `SyGEC_BULLETIN_BROUILLON_${name.toUpperCase().replace(/\s+/g, '_')}_${finalizeDialogFor.id.slice(-4)}.pdf`;
                        await downloadElementAsPDF('school-bulletin-printable', filename);
                        showInstantAlert(`Aperçu Brouillon de ${name} téléchargé avec succès.`);
                      } catch (err) {
                        console.error("PDF download failed:", err);
                      } finally {
                        setIsDownloadingPdf(false);
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans"
                  >
                    <span>📝</span>
                    Télécharger comme Brouillon
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinalizeDialogFor(null)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
