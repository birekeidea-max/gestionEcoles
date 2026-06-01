import React, { useState, useEffect } from 'react';
import { User, School, Student, Payment, Bulletin, UserRole, ArchivedFile } from './types';
import { INITIAL_SCHOOLS, INITIAL_STUDENTS, INITIAL_PAYMENTS, INITIAL_BULLETINS } from './constants';
import { PatrioticBackground, CongoFlagIcon, CongoCoatOfArms } from './components/CongoTheme';
import { QRScannerMock } from './components/QRScannerMock';
import { AuthScreen } from './components/AuthScreen';
import { StudentsPanel } from './components/StudentsPanel';
import { PaymentsPanel } from './components/PaymentsPanel';
import { BulletinsPanel } from './components/BulletinsPanel';
import { PedagogyPanel } from './components/PedagogyPanel';
import { AdminPanel } from './components/AdminPanel';
import { 
  Building2, 
  Users, 
  CreditCard, 
  FileText, 
  NotebookPen, 
  LogOut, 
  ShieldAlert, 
  ShieldCheck, 
  Settings, 
  RefreshCcw, 
  AlertCircle,
  TrendingUp,
  Award,
  BookOpenCheck,
  Handshake
} from 'lucide-react';

export default function App() {
  // Persistence States with initialization from localStorage & fallback to official RDC seed data
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [schools, setSchools] = useState<School[]>(() => {
    const local = localStorage.getItem('sgesc_schools');
    return local ? JSON.parse(local) : INITIAL_SCHOOLS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const local = localStorage.getItem('sgesc_students');
    return local ? JSON.parse(local) : INITIAL_STUDENTS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const local = localStorage.getItem('sgesc_payments');
    return local ? JSON.parse(local) : INITIAL_PAYMENTS;
  });

  const [bulletins, setBulletins] = useState<Bulletin[]>(() => {
    const local = localStorage.getItem('sgesc_bulletins');
    return local ? JSON.parse(local) : INITIAL_BULLETINS;
  });

  const [archivedFiles, setArchivedFiles] = useState<ArchivedFile[]>(() => {
    const local = localStorage.getItem('sgesc_archived_files');
    return local ? JSON.parse(local) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const local = localStorage.getItem('sgesc_user');
    return local ? JSON.parse(local) : null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('sgesc_all_users');
    if (local) return JSON.parse(local);
    return [
      { fullName: "Prof. Kabose Augustin", phone: "+243 812 345 678", role: "Enseignant", schoolId: "sc-1", email: "", timestamp: "25/05/2026 09:12:00" },
      { fullName: "Mme. Jolie Masengo", phone: "+243 998 765 432", role: "Comptable", schoolId: "sc-1", email: "", timestamp: "26/05/2026 10:44:02" },
      { fullName: "Monsieur l'Abbé Pierre Lwamba", phone: "+243 854 321 098", role: "Préfet des études", schoolId: "sc-2", email: "", timestamp: "27/05/2026 11:21:50" },
      { fullName: "Sœur Jeanne d'Arc Mapasa", phone: "+243 897 654 321", role: "Directeur", schoolId: "sc-3", email: "", timestamp: "28/05/2026 07:15:22" },
      { fullName: "Chef d'Antenne National", phone: "Superviseur RDC", role: "Administrateur", schoolId: "sc-1", email: "birekeidea@gmail.com", timestamp: "28/05/2026 08:00:00" }
    ];
  });

  // Navigation and focus environments
  const [activeTab, setActiveTab] = useState<'HOME' | 'STUDENTS' | 'PAYMENTS' | 'BULLETINS' | 'PEDAGOGY' | 'ADMIN'>('HOME');
  const [activeSchoolId, setActiveSchoolId] = useState<string>(() => {
    const localUser = localStorage.getItem('sgesc_user');
    if (localUser) {
      const parsed = JSON.parse(localUser);
      return parsed.schoolId === 'all' ? INITIAL_SCHOOLS[0].id : parsed.schoolId;
    }
    return INITIAL_SCHOOLS[0].id;
  });

  // Antitheft / verification scan state triggers
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanCode, setScanCode] = useState('');

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem('sgesc_schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('sgesc_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('sgesc_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('sgesc_bulletins', JSON.stringify(bulletins));
  }, [bulletins]);

  useEffect(() => {
    localStorage.setItem('sgesc_archived_files', JSON.stringify(archivedFiles));
  }, [archivedFiles]);

  useEffect(() => {
    localStorage.setItem('sgesc_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sgesc_user', JSON.stringify(currentUser));
      if (currentUser.schoolId === 'all') {
        setActiveSchoolId(schools[0]?.id || 'sc-1');
      } else {
        setActiveSchoolId(currentUser.schoolId);
      }
    } else {
      localStorage.removeItem('sgesc_user');
    }
  }, [currentUser, schools]);

  // Sécurisation suprême RDC : Déconnexion automatique si l'école perd son homologation ou est en attente
  useEffect(() => {
    if (currentUser && currentUser.schoolId !== 'all') {
      const uSchool = schools.find(s => s.id === currentUser.schoolId);
      if (!uSchool || uSchool.isApproved === false) {
        setCurrentUser(null);
        localStorage.removeItem('sgesc_user');
      }
    }
  }, [currentUser, schools]);

  // Actions
  const handleAddSchool = (newSchool: School) => {
    setSchools(prev => [...prev, newSchool]);
  };

  const handleLogin = (userData: User) => {
    setCurrentUser(userData);

    // Register the user to tracked database
    setAllUsers(prev => {
      const emailMatches = userData.email && prev.some(u => u.email === userData.email);
      const phoneMatches = userData.phone && prev.some(u => u.phone === userData.phone);
      const nameMatches = prev.some(u => u.fullName.toLowerCase() === userData.fullName.toLowerCase());

      if (!emailMatches && !phoneMatches && !nameMatches) {
        const loggedUser: User = {
          ...userData,
          timestamp: new Date().toLocaleString('fr-CD')
        };
        return [loggedUser, ...prev];
      }
      return prev;
    });

    setActiveTab('HOME');
    if (userData.schoolId === 'all') {
      setActiveSchoolId(schools[0]?.id || 'sc-1');
    } else {
      setActiveSchoolId(userData.schoolId);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleOpenQRScanner = (code: string) => {
    setScanCode(code);
    setIsScannerOpen(true);
  };

  const currentSchool = schools.find(s => s.id === activeSchoolId) || schools[0] || INITIAL_SCHOOLS[0];
  const isSuperAdmin = currentUser?.email === 'birekeidea@gmail.com';

  // Global Workspace statistics computed dynamically from records matching the active school identifier
  const schoolStudents = students.filter(s => s.schoolId === currentSchool.id);
  const schoolPayments = payments.filter(p => p.schoolId === currentSchool.id);
  const schoolBulletins = bulletins.filter(b => b.schoolId === currentSchool.id);

  // Quick state overrides
  const totalReceivedUSD = schoolPayments.reduce((acc, p) => p.currency === 'USD' ? acc + p.amount : acc + (p.amount / 2800), 0);
  const enrollmentSuccessRatio = schoolStudents.length > 0 ? ((schoolBulletins.length / schoolStudents.length) * 100).toFixed(0) : '0';

  if (!currentUser) {
    return (
      <AuthScreen 
        schools={schools}
        onAddSchool={handleAddSchool}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="relative min-h-screen font-sans flex flex-col bg-slate-50">
      
      {/* Visual background component containing DRC emblems */}
      <PatrioticBackground>
        
        {/* Custom Header Nav bar */}
        <header className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-105 shrink-0">
               <CongoFlagIcon className="w-9 h-5 rounded-xs" />
            </span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-black text-slate-800 leading-none">SGESC RDC</h1>
                <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-1.5 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  STATUT CONFORME
                </span>
                
                {isOnline ? (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    En ligne (Local Sécurisé)
                  </span>
                ) : (
                  <span className="text-[9px] bg-amber-500/10 text-amber-700 border border-amber-500/25 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Mode Hors-ligne (Actif - Autonome)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                 Espace Scolaire: <span className="font-bold text-slate-700">{currentSchool.name}</span> &bull; Code: {currentSchool.nationalCode}
              </p>
            </div>
          </div>

          {/* User Session profile panel */}
          <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 justify-between">
            <div className="text-right">
              <span className="text-xs font-black block text-slate-800">{currentUser.fullName}</span>
              <span className="text-[9px] text-[#D32F2F] font-black font-mono tracking-wider bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded uppercase">{isSuperAdmin ? "Directeur National (Habilité)" : currentUser.role}</span>
            </div>

            {/* School Workspace Switcher for inspecting administrators */}
            {isSuperAdmin && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">Espace:</span>
                <select
                  value={activeSchoolId}
                  onChange={(e) => setActiveSchoolId(e.target.value)}
                  className="bg-slate-100 text-[11px] font-bold text-slate-700 py-1.5 px-2.5 rounded-xl border border-slate-250 focus:ring-1 focus:ring-blue-500"
                >
                  {schools.map(sch => (
                    <option key={sch.id} value={sch.id}>{sch.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2 bg-slate-100 hover:bg-slate-205 border border-slate-220 text-slate-500 hover:text-red-600 rounded-xl transition-all cursor-pointer"
              title="Se déconnecter de la plateforme"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Floating Side tab navigation layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 bg-white p-2 rounded-2xl border border-slate-200/80 shrink-0 select-none">
            <button
              onClick={() => setActiveTab('HOME')}
              className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center lg:justify-start gap-2.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'HOME' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-655 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('STUDENTS')}
              className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center lg:justify-start gap-2.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'STUDENTS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-655 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              Élèves &amp; Inscriptions
            </button>
            <button
              onClick={() => setActiveTab('PAYMENTS')}
              className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center lg:justify-start gap-2.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'PAYMENTS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-655 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              Écolages &amp; Reçus
            </button>
            <button
              onClick={() => setActiveTab('BULLETINS')}
              className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center lg:justify-start gap-2.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'BULLETINS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-655 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              Bulletins Scolaires
            </button>
            <button
              onClick={() => setActiveTab('PEDAGOGY')}
              className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center lg:justify-start gap-2.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'PEDAGOGY' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-655 hover:bg-slate-50'
              }`}
            >
              <NotebookPen className="w-4 h-4 shrink-0" />
              Pédagogie &amp; Cotation
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('ADMIN')}
                className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center lg:justify-start gap-2.5 whitespace-nowrap cursor-pointer border border-emerald-600/20 ${
                  activeTab === 'ADMIN' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/65'
                }`}
              >
                <Handshake className="w-4 h-4 shrink-0" />
                🤝 Portail d'Entente
              </button>
            )}
          </nav>

          {/* Primary panels rendering space */}
          <main className="lg:col-span-4 bg-white/50 backdrop-blur-md rounded-2xl md:p-1 relative min-h-[70vh]">

            {/* MAIN PORTAL HOME (DASHBOARD) */}
            {activeTab === 'HOME' && (
              <div className="space-y-6">
                
                {/* Banner featuring Congolese colors and official motto */}
                <div className="bg-gradient-to-r from-blue-750 via-slate-800 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-15 hidden md:block">
                    <CongoCoatOfArms className="w-48 h-48" opacityClassName="opacity-80" />
                  </div>
                  
                  <div className="relative z-10 max-w-xl space-y-2">
                    <div className="inline-flex items-center gap-1 bg-yellow-400 text-slate-900 font-mono font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest">
                      EPST CONGO
                    </div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight uppercase">
                      Bienvenue sur le portail numérique national
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      Suivi scolaire informatisé de l'école <span className="text-yellow-300 font-black">{currentSchool.name}</span> ({currentSchool.commune}, {currentSchool.province}). Protégez les documents d’évaluation à l'aide de notre cryptographie par QR-Verification.
                    </p>
                  </div>
                </div>

                {/* Primary dynamic statistics of the school */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4 hover:shadow-sm transition-all">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Effectif Élèves</span>
                      <span className="text-xl font-black text-slate-800 leading-none">{schoolStudents.length}</span>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">Écolages en cours</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4 hover:shadow-sm transition-all">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Frais Recouvrés</span>
                      <span className="text-xl font-black text-emerald-700 leading-none">${totalReceivedUSD.toFixed(0)}</span>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">Perçus ce trimestre</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4 hover:shadow-sm transition-all">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Bulletins Générés</span>
                      <span className="text-xl font-black text-slate-800 leading-none">{schoolBulletins.length}</span>
                      <p className="text-[9px] text-[#D32F2F] font-bold font-mono mt-0.5">{enrollmentSuccessRatio}% Encodés</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4 hover:shadow-sm transition-all">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                      <BookOpenCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Code National</span>
                      <span className="text-sm font-black text-slate-800 tracking-wider font-mono block truncate mt-0.5">{currentSchool.nationalCode}</span>
                      <p className="text-[8px] text-slate-400 block font-sans truncate">Préfet: {currentSchool.rectorName.substring(0, 16)}...</p>
                    </div>
                  </div>
                </div>

                {/* Grid details containing verification & guide manual */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left block: Anti-fraud and scanner widget */}
                  <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Contrôle de conformité &amp; Anti-Fraude EPST</h4>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Intégrité Républicaine RDC</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      Chaque bulletin officiel de notes, carte scolaire numérique d'élèves ou reçu de versement monétaire d’écolage généré par notre plateforme SGESC possède un sceau cryptographique (QR Code) vérifiable par n'importe quel inspecteur ou parent d'élève.
                    </p>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-800 shrink-0" fill="currentColor">
                          <rect x="2" y="2" width="6" height="6" />
                          <rect x="16" y="2" width="6" height="6" />
                          <rect x="2" y="16" width="6" height="6" />
                          <rect x="9" y="10" width="6" height="4" />
                        </svg>
                        <div>
                          <span className="text-xs font-bold text-slate-700 block">Saisir manuellement ou tester ?</span>
                          <span className="text-[10px] text-slate-400 block font-mono">Simulateur d’authentification mobile RDC</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenQRScanner('')}
                        className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-mono text-xs font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        Scanner un document
                      </button>
                    </div>

                    {/* Sûreté de Connexion Hors-ligne locale */}
                    <div className="p-4 bg-blue-50/40 border border-blue-200/60 rounded-xl space-y-2">
                      <div className="flex items-start gap-2.5">
                        <span className="text-base leading-none pt-0.5">📂</span>
                        <div className="space-y-1">
                          <h5 className="text-xs font-black text-blue-900 leading-tight flex items-center gap-1.5">
                            Sûreté Républicaine : Résilience Hors-ligne Totale
                            <span className="text-[9px] bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                              100% Autonome
                            </span>
                          </h5>
                          <p className="text-[11px] text-slate-600 leading-normal font-semibold">
                            SGESC est conçu à l'épreuve des coupures d'électricité et de réseau. Toutes vos actions (inscription des élèves, encodage des cotes, génération des bulletins et émission des reçus d'écolage) sont stockées de façon sécurisée sur votre matériel en local (<span className="font-mono text-[10px] text-slate-500">localStorage</span>). 
                          </p>
                          <p className="text-[10.5px] text-emerald-700 font-bold flex items-center gap-1">
                            <span>✓</span> Aucune donnée n'est perdue en cas d'absence de connexion Internet.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right block: Quick workspace details */}
                  <div className="bg-slate-850 text-white rounded-2xl p-5 space-y-4 shadow-xs relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.25]">
                      <CongoCoatOfArms className="w-32 h-32 scale-110" opacityClassName="opacity-100" />
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-wider text-yellow-400 font-bold">Identifiant d’Établissement</span>
                      <h4 className="text-base font-extrabold truncate mt-0.5">{currentSchool.name}</h4>
                      <p className="text-[10px] text-slate-300 font-light font-sans mt-0.5">Délégation de l’EPST - Division Provinciale</p>
                    </div>

                    <div className="space-y-2 text-[11px] pt-1.5 border-t border-slate-700/60 leading-normal text-slate-300">
                      <p className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-450 uppercase font-mono text-[9px]">Province:</span>
                        <span className="font-bold text-white">{currentSchool.province}</span>
                      </p>
                      <p className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-450 uppercase font-mono text-[9px]">Ville/District:</span>
                        <span className="font-bold text-white">{currentSchool.city}</span>
                      </p>
                      <p className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-450 uppercase font-mono text-[9px]">Commune:</span>
                        <span className="font-bold text-white">{currentSchool.commune}</span>
                      </p>
                      <p className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-450 uppercase font-mono text-[9px]">Autorité (Préfet):</span>
                        <span className="font-bold text-white text-[10px] truncate max-w-[140px] block" title={currentSchool.rectorName}>{currentSchool.rectorName.replace('Monsieur le Préfet ', '').replace('Révérend Père Préfet ', '').replace('Sœur Préfète ', '')}</span>
                      </p>
                    </div>

                    <div className="text-[9px] text-yellow-300/80 bg-white/5 border border-white/10 p-2 rounded text-center tracking-wide font-mono font-semibold">
                      Réseau National D'Échange
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB: STUDENTS MANAGEMENT */}
            {activeTab === 'STUDENTS' && (
              <StudentsPanel 
                students={students}
                currentSchool={currentSchool}
                onAddStudent={(newSt) => setStudents(prev => [newSt, ...prev])}
                onUpdateStudent={(updatedSt) => setStudents(prev => prev.map(s => s.id === updatedSt.id ? updatedSt : s))}
                onDeleteStudent={(id) => setStudents(prev => prev.filter(s => s.id !== id))}
                onOpenQRScanner={handleOpenQRScanner}
              />
            )}

            {/* TAB: PAYMENTS SESSIONS */}
            {activeTab === 'PAYMENTS' && (
              <PaymentsPanel 
                payments={payments}
                students={students}
                currentSchool={currentSchool}
                onAddPayment={(newPay) => setPayments(prev => [newPay, ...prev])}
                onOpenQRScanner={handleOpenQRScanner}
              />
            )}

            {/* TAB: BULLETINS MODULES */}
            {activeTab === 'BULLETINS' && (
              <BulletinsPanel 
                bulletins={bulletins}
                students={students}
                currentSchool={currentSchool}
                schools={schools}
                archivedFiles={archivedFiles}
                onAddBulletin={(newBul) => setBulletins(prev => [...prev, newBul])}
                onUpdateBulletin={(updatedBul) => setBulletins(prev => prev.map(b => b.id === updatedBul.id ? updatedBul : b))}
                onSaveArchivedFile={(file) => setArchivedFiles(prev => [file, ...prev])}
                onDeleteArchivedFile={(id) => setArchivedFiles(prev => prev.filter(f => f.id !== id))}
                onOpenQRScanner={handleOpenQRScanner}
                onImportBulletins={(importedList) => {
                  setBulletins(prev => {
                    // Filter out existing bulletins with the same ID to prevent duplicates, then merge
                    const filteredPrev = prev.filter(b => !importedList.some(i => i.id === b.id));
                    return [...filteredPrev, ...importedList];
                  });
                }}
              />
            )}

            {/* TAB: PEDAGOGY SUB PANELS */}
            {activeTab === 'PEDAGOGY' && (
              <PedagogyPanel 
                students={students}
                currentSchool={currentSchool}
                teacherName={currentUser.fullName}
              />
            )}

            {/* TAB: GENERAL PLATFORM ADMINISTRATION */}
            {activeTab === 'ADMIN' && isSuperAdmin && (
              <AdminPanel 
                allUsers={allUsers}
                setAllUsers={setAllUsers}
                schools={schools}
                setSchools={setSchools}
                students={students}
                setStudents={setStudents}
                payments={payments}
                setPayments={setPayments}
                bulletins={bulletins}
                setBulletins={setBulletins}
              />
            )}

          </main>
        </div>

      </PatrioticBackground>

      {/* SECURE POPUP: Ministry Verification Simulating Camera QR Scanner Lookup */}
      <QRScannerMock 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        initialCode={scanCode}
      />

    </div>
  );
}
