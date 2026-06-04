import React, { useState, useEffect } from 'react';
import { User, School, Student, Payment, Bulletin, UserRole, ArchivedFile, UserActivity } from './types';
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
  Handshake,
  Search
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
      { fullName: "Révérend Père Préfet Jean-Michel", phone: "+243 815 112 233", role: "Préfet des études", schoolId: "sc-1", email: "jean.michel@boboto.cd", timestamp: "03/06/2026 08:30:15", isOnline: true },
      { fullName: "Sœur Préfète Aimée Mbuyi", phone: "+243 994 482 110", role: "Préfet des études", schoolId: "sc-2", email: "aimee.mbuyi@kabambare.com", timestamp: "02/06/2026 14:22:10", isOnline: false },
      { fullName: "Monsieur le Préfet Pascal Mupende", phone: "+243 853 445 566", role: "Préfet des études", schoolId: "sc-3", email: "pascal.mupende@instgoma.net", timestamp: "02/06/2026 11:05:00", isOnline: true },
      { fullName: "Monseigneur l’Abbé Sylvain Nkulu", phone: "+243 892 783 911", role: "Préfet des études", schoolId: "sc-4", email: "sylvain.nkulu@imara.cd", timestamp: "01/06/2026 16:40:12", isOnline: true },
      { fullName: "Père Préfet Jean-Claude Baguma", phone: "+243 812 554 990", role: "Préfet des études", schoolId: "sc-5", email: "jc.baguma@alfajiri.org", timestamp: "03/06/2026 17:15:00", isOnline: true },
      { fullName: "Préfet Thaddée Lihamba", phone: "+243 991 223 344", role: "Préfet des études", schoolId: "sc-6", email: "thaddee.lihamba@maele.org", timestamp: "03/06/2026 10:20:00", isOnline: false },
      { fullName: "Mère Supérieure Hélène Ngalula", phone: "+243 855 667 788", role: "Préfet des études", schoolId: "sc-7", email: "helene.ngalula@bosangani.cd", timestamp: "03/06/2026 15:10:00", isOnline: true },
      { fullName: "Prof. Kabose Augustin", phone: "+243 812 345 678", role: "Enseignant", schoolId: "sc-1", email: "kabose@boboto.cd", timestamp: "25/05/2026 09:12:00", isOnline: true },
      { fullName: "Mme. Jolie Masengo", phone: "+243 998 765 432", role: "Comptable", schoolId: "sc-1", email: "jolie.masengo@boboto.cd", timestamp: "26/05/2026 10:44:02", isOnline: false },
      { fullName: "Chef d'Antenne National (Admin)", phone: "Superviseur RDC", role: "Administrateur", schoolId: "sc-1", email: "birekeidea@gmail.com", timestamp: "03/06/2026 08:00:00", isOnline: true }
    ];
  });

  const [userActivities, setUserActivities] = useState<UserActivity[]>(() => {
    const local = localStorage.getItem('sgesc_user_activities');
    if (local) return JSON.parse(local);
    return [
      {
        id: "act-1",
        userName: "Révérend Père Préfet Jean-Michel",
        userRole: "Préfet des études",
        schoolName: "Collège Boboto",
        action: "Connexion sécurisée au portail d'établissement",
        timestamp: "03/06/2026 08:30:15",
        category: "SECURITY",
        quality: "Excellent",
        details: "Session ouverte avec succès depuis Kinshasa/Gombe IP: 197.243.2.45"
      },
      {
        id: "act-2",
        userName: "Révérend Père Préfet Jean-Michel",
        userRole: "Préfet des études",
        schoolName: "Collège Boboto",
        action: "Certification numérique d'un bulletin scolaire",
        timestamp: "03/06/2026 09:12:44",
        category: "PEDAGOGICAL",
        quality: "Excellent",
        details: "Validation de la fiche de délibération de Placide Mwamba Kabongo (4ème Des humanités)"
      },
      {
        id: "act-3",
        userName: "Sœur Préfète Aimée Mbuyi",
        userRole: "Préfet des études",
        schoolName: "Lycée Kabambare",
        action: "Versement bancaire enregistré",
        timestamp: "02/06/2026 14:22:10",
        category: "FINANCIAL",
        quality: "Excellent",
        details: "Bordereau REC-2026-10042 de 45 USD pour Grâce Kabange Ilunga approuvé par la comptabilité."
      },
      {
        id: "act-4",
        userName: "Monsieur le Préfet Pascal Mupende",
        userRole: "Préfet des études",
        schoolName: "Institut de Goma",
        action: "Modification d'une fiche de cotation",
        timestamp: "02/06/2026 11:05:00",
        category: "PEDAGOGICAL",
        quality: "Régulier",
        details: "Ajustement des notes d'interrogation en Mathématiques pour le niveau 3ème Des humanités."
      },
      {
        id: "act-5",
        userName: "Monseigneur l’Abbé Sylvain Nkulu",
        userRole: "Préfet des études",
        schoolName: "Collège Imara",
        action: "Inmatriculation d'un nouvel élève",
        timestamp: "01/06/2026 16:40:12",
        category: "ADMINISTRATIVE",
        quality: "Excellent",
        details: "Nouvelle immatriculation nationale créée pour l'élève Sarah Mpiana Kasanda."
      },
      {
        id: "act-6",
        userName: "Père Préfet Jean-Claude Baguma",
        userRole: "Préfet des études",
        schoolName: "Collège Alfajiri",
        action: "Soumission des structures scolaires",
        timestamp: "03/06/2026 17:15:30",
        category: "ADMINISTRATIVE",
        quality: "Excellent",
        details: "Indexation réussie des options organisées: Commerciale et Math-Physique."
      },
      {
        id: "act-7",
        userName: "Mère Supérieure Hélène Ngalula",
        userRole: "Préfet des études",
        schoolName: "Lycée Bosangani",
        action: "Préparation de leçon enregistrée",
        timestamp: "03/06/2026 15:22:00",
        category: "PEDAGOGICAL",
        quality: "Excellent",
        details: "Fiche didactique 'Introduction à la comptabilité générale' validée."
      },
      {
        id: "act-8",
        userName: "Préfet Thaddée Lihamba",
        userRole: "Préfet des études",
        schoolName: "Institut Maele",
        action: "Demande d'homologation d'établissement",
        timestamp: "03/06/2026 10:20:11",
        category: "SECURITY",
        quality: "Régulier",
        details: "Formulaire d'enregistrement de l'école soumis au contrôle central de l'EPST."
      },
      {
        id: "act-9",
        userName: "Mme. Jolie Masengo",
        userRole: "Comptable",
        schoolName: "Collège Boboto",
        action: "Clôture de caisse trimestrielle",
        timestamp: "31/05/2026 15:30:00",
        category: "FINANCIAL",
        quality: "Excellent",
        details: "Génération du rapport global des versements effectués pour la session de Mai."
      }
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

  // States for supervisor central base view
  const [supervisorsTab, setSupervisorsTab] = useState<'SCHOOLS' | 'USERS'>('SCHOOLS');
  const [supervisorSchoolSearch, setSupervisorSchoolSearch] = useState('');
  const [supervisorUserSearch, setSupervisorUserSearch] = useState('');

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
    localStorage.setItem('sgesc_user_activities', JSON.stringify(userActivities));
  }, [userActivities]);

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

  // Sécurisation suprême RDC : Accès direct et pérenne à la plateforme
  useEffect(() => {
    if (currentUser && currentUser.schoolId !== 'all') {
      const uSchool = schools.find(s => s.id === currentUser.schoolId);
      if (!uSchool) {
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

    // Dynamic Activity Logging for Security Audits
    const userSchool = schools.find(s => s.id === userData.schoolId);
    const newActivity: UserActivity = {
      id: `act-${Date.now()}`,
      userName: userData.fullName,
      userRole: userData.role,
      schoolName: userSchool ? userSchool.name : (userData.role === 'Administrateur' ? "Secrétariat Général EPST" : "Établissement RDC"),
      action: "Connexion réussie au portail d'accès",
      timestamp: new Date().toLocaleString('fr-CD'),
      category: 'SECURITY',
      quality: 'Excellent',
      details: `Session sécurisée initiée pour le rôle: ${userData.role}`
    };
    setUserActivities(prev => [newActivity, ...prev]);

    // Register the user to tracked database
    setAllUsers(prev => {
      const emailIx = userData.email ? prev.findIndex(u => u.email === userData.email) : -1;
      const phoneIx = userData.phone ? prev.findIndex(u => u.phone === userData.phone) : -1;
      const nameIx = prev.findIndex(u => u.fullName.toLowerCase() === userData.fullName.toLowerCase());
      
      const matchIx = emailIx !== -1 ? emailIx : (phoneIx !== -1 ? phoneIx : nameIx);

      if (matchIx === -1) {
        const loggedUser: User = {
          ...userData,
          timestamp: new Date().toLocaleString('fr-CD'),
          isOnline: true
        };
        return [loggedUser, ...prev];
      } else {
        return prev.map((u, idx) => {
          if (idx === matchIx) {
            return {
              ...u,
              isOnline: true,
              timestamp: new Date().toLocaleString('fr-CD')
            };
          }
          return u;
        });
      }
    });

    setActiveTab('HOME');
    if (userData.schoolId === 'all') {
      setActiveSchoolId(schools[0]?.id || 'sc-1');
    } else {
      setActiveSchoolId(userData.schoolId);
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      // Mark offline in allUsers
      setAllUsers(prev => prev.map(u => {
        if (u.fullName.toLowerCase() === currentUser.fullName.toLowerCase() || (currentUser.email && u.email === currentUser.email)) {
          return { ...u, isOnline: false };
        }
        return u;
      }));

      // Log activity
      const userSchool = schools.find(s => s.id === currentUser.schoolId);
      const newActivity: UserActivity = {
        id: `act-out-${Date.now()}`,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        schoolName: userSchool ? userSchool.name : (currentUser.role === 'Administrateur' ? "Secrétariat Général EPST" : "Établissement RDC"),
        action: "Déconnexion volontaire",
        timestamp: new Date().toLocaleString('fr-CD'),
        category: 'SECURITY',
        quality: 'Excellent',
        details: "Fermeture de session et retour sécurisé."
      };
      setUserActivities(prev => [newActivity, ...prev]);
    }
    setCurrentUser(null);
  };

  const handleOpenQRScanner = (code: string) => {
    setScanCode(code);
    setIsScannerOpen(true);
  };

  const currentSchool = schools.find(s => s.id === activeSchoolId) || schools[0] || INITIAL_SCHOOLS[0];
  const isSuperAdmin = currentUser?.email === 'birekeidea@gmail.com' || currentUser?.email === 'birekeidea@gmail';

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
        <header className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-205 p-4 mb-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-sky-50 text-[#007FFF] rounded-xl border border-sky-100 shrink-0">
               <CongoFlagIcon className="w-9 h-5 rounded-xs" />
            </span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-black text-slate-900 leading-none">SGESC RDC</h1>
                <span className="text-[9px] bg-[#007FFF] text-white border border-[#007FFF] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  STATUT CONFORME
                </span>
                
                {isOnline ? (
                  <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    En ligne (Local Sécurisé)
                  </span>
                ) : (
                  <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Mode Hors-ligne (Actif - Autonome)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                 Espace Scolaire: <span className="font-bold text-indigo-900">{currentSchool.name}</span> &bull; Code: {currentSchool.nationalCode}
              </p>
            </div>
          </div>

          {/* User Session profile panel */}
          <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0 justify-between">
            <div className="text-right">
              <span className="text-xs font-black block text-slate-900">{currentUser.fullName}</span>
              <span className="text-[9px] text-[#D32F2F] font-black font-mono tracking-wider bg-red-50 border border-red-100 px-1.5 py-0.5 rounded uppercase">{isSuperAdmin ? "Directeur National (Habilité)" : currentUser.role}</span>
            </div>

            {/* School Workspace Switcher for inspecting administrators */}
            {isSuperAdmin && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">Espace:</span>
                <select
                  value={activeSchoolId}
                  onChange={(e) => setActiveSchoolId(e.target.value)}
                  className="bg-slate-50 text-[11px] font-bold text-slate-700 py-1.5 px-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-sky-500"
                >
                  {schools.map(sch => (
                    <option key={sch.id} value={sch.id}>{sch.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-red-600 rounded-xl transition-all cursor-pointer"
              title="Se déconnecter de la plateforme"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Floating Side tab navigation layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 shrink-0 select-none">
            <button
              onClick={() => setActiveTab('HOME')}
              className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center lg:justify-start gap-2.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'HOME' ? 'bg-[#007FFF] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              Tableau de bord
            </button>
            {(currentUser?.role === 'Administrateur' || currentUser?.role === 'Préfet des études' || currentUser?.role === 'Comptable') && (
              <button
                onClick={() => setActiveTab('STUDENTS')}
                className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center lg:justify-start gap-2.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'STUDENTS' ? 'bg-[#007FFF] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                Élèves &amp; Inscriptions
              </button>
            )}
            {(currentUser?.role === 'Administrateur' || currentUser?.role === 'Préfet des études' || currentUser?.role === 'Comptable') && (
              <button
                onClick={() => setActiveTab('PAYMENTS')}
                className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center lg:justify-start gap-2.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'PAYMENTS' ? 'bg-[#007FFF] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                Écolages &amp; Reçus
              </button>
            )}
            {(currentUser?.role === 'Administrateur' || currentUser?.role === 'Préfet des études' || currentUser?.role === 'Comptable' || currentUser?.role === 'Enseignant') && (
              <button
                onClick={() => setActiveTab('BULLETINS')}
                className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center lg:justify-start gap-2.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'BULLETINS' ? 'bg-[#007FFF] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                Bulletins Scolaires
              </button>
            )}
            {(currentUser?.role === 'Administrateur' || currentUser?.role === 'Préfet des études' || currentUser?.role === 'Comptable' || currentUser?.role === 'Enseignant') && (
              <button
                onClick={() => setActiveTab('PEDAGOGY')}
                className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center lg:justify-start gap-2.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'PEDAGOGY' ? 'bg-[#007FFF] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <NotebookPen className="w-4 h-4 shrink-0" />
                Pédagogie &amp; Cotation
              </button>
            )}
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('ADMIN')}
                className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center lg:justify-start gap-2.5 whitespace-nowrap cursor-pointer border border-red-200 ${
                  activeTab === 'ADMIN' ? 'bg-[#D32F2F] text-white shadow-md' : 'bg-red-50 text-red-800 hover:bg-red-100'
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
                
                {/* Elegant Banner featuring Congolese EPST look and feel */}
                <div className="bg-gradient-to-r from-[#007FFF] via-indigo-950 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-md border-b-4 border-[#F4D03F]">
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-25 hidden md:block">
                    <CongoCoatOfArms className="w-48 h-48" opacityClassName="opacity-60" />
                  </div>
                  
                  <div className="relative z-10 max-w-xl space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 bg-[#F4D03F] text-indigo-950 font-mono font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">
                      <span>🇨🇩</span> MINISTERE DE L'EPST - RDC
                    </div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight uppercase font-sans">
                      Portail National de Suivi Scolaire Informatisé
                    </h2>
                    <p className="text-xs text-sky-100 leading-relaxed font-medium">
                      Tableau de bord et base de données de l'école <span className="text-[#F4D03F] font-black underline">{currentSchool.name}</span> ({currentSchool.commune}, province de {currentSchool.province}). Sécurisation par sceau cryptographique QR-Verification de l'EPST.
                    </p>
                  </div>
                </div>

                {(currentUser?.role === 'Inspecteur' || currentUser?.role === 'Coordinateur' || currentUser?.role === 'Directeur') ? (
                  /* 🛡️ VISITOR / INSPECTOR / COORDINATOR CENTRAL AUDIT VIEW */
                  <div className="space-y-6">
                    {/* Supervisor details card */}
                    <div className="bg-amber-50/75 border border-amber-200 rounded-3xl p-6 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left animate-in fade-in duration-150">
                      <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 bg-amber-200 text-amber-950 font-mono font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest border border-amber-300">
                          🛡️ ACCREDITATION ADMINISTRATIVE DE L'EPST
                        </span>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                          {currentUser.role === 'Inspecteur' ? 'Inspecteur National de l’EPST' : currentUser.role === 'Coordinateur' ? 'Coordinateur National de Zone Scolaire' : 'Directeur Visiteur du Réseau'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 font-semibold pt-1">
                          <div>👤 Nom Complet : <span className="font-extrabold text-slate-800">{currentUser.fullName}</span></div>
                          <div>🆔 Matricule d'Agent d'État : <span className="font-mono font-extrabold text-blue-700">{currentUser.matricule}</span></div>
                          {currentUser.axe && (
                            <div className="sm:col-span-2">🌐 Axe de Supervision : <span className="font-extrabold text-[#D32F2F] bg-red-100 border border-red-200/60 px-2.5 py-0.5 rounded">{currentUser.axe}</span></div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-white/90 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-200/80 text-center shrink-0 w-full md:w-auto font-sans">
                        <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Réseau des Écoles</span>
                        <span className="text-2xl font-black text-indigo-950 block">{schools.length} Écoles</span>
                        <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 mt-1 inline-block">Serveur National RDC</span>
                      </div>
                    </div>

                    {/* Notice if Directeur */}
                    {currentUser.role === 'Directeur' && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-left text-xs text-blue-800 leading-relaxed font-bold flex items-center gap-3">
                        <span className="text-2xl shrink-0">ℹ️</span>
                        <div>
                          <p className="font-extrabold uppercase text-[10px] tracking-wider text-blue-900 mb-0.5">Note de la Direction Générale :</p>
                          <p className="font-semibold text-[11px] text-slate-650 font-sans">Le programme national de gestion des écoles primaires n'étant pas encore actif sur la plateforme centrale (traitement exclusif du programme secondaire en phase I), vous visitez simplement la plateforme.</p>
                        </div>
                      </div>
                    )}

                    {/* Tabs navigation for Supervisors */}
                    <div className="flex border-b border-slate-200 gap-1.5 pt-1">
                      <button
                        onClick={() => setSupervisorsTab('SCHOOLS')}
                        className={`py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                          supervisorsTab === 'SCHOOLS'
                            ? 'border-blue-600 text-blue-700 font-extrabold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🏫 Répertoire des Écoles ({schools.length})
                      </button>
                      <button
                        onClick={() => setSupervisorsTab('USERS')}
                        className={`py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                          supervisorsTab === 'USERS'
                            ? 'border-blue-600 text-blue-700 font-extrabold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        👥 Base Centrale des Utilisateurs ({allUsers.length})
                      </button>
                    </div>

                    {supervisorsTab === 'SCHOOLS' ? (
                      /* Schools database for supervisors */
                      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left space-y-4 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-3xs">
                          <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-indigo-950 font-sans">
                              <span>🏫</span> Répertoire d'Audit des Établissements Secondaires RDC
                            </h3>
                            <p className="text-[10.5px] text-slate-500 font-medium">
                              Données d’identification certifiées par le Secrétariat Général Éducation de la République Démocratique du Congo.
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-slate-200 w-full sm:max-w-md shrink-0">
                            <Search className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              placeholder="Rechercher par nom de l'école ou matricule code..."
                              value={supervisorSchoolSearch}
                              onChange={(e) => setSupervisorSchoolSearch(e.target.value)}
                              className="bg-transparent border-0 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-0 w-full font-medium"
                            />
                          </div>
                        </div>

                        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider select-none">
                                <th className="py-3.5 px-6">Nom de l'Établissement</th>
                                <th className="py-3.5 px-6">Province &amp; Localisation</th>
                                <th className="py-3.5 px-6 text-center font-sans">Code National Unique</th>
                                <th className="py-3.5 px-6 font-sans">Préfet Directeur</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium font-sans">
                              {schools
                                .filter(s => 
                                  s.name.toLowerCase().includes(supervisorSchoolSearch.toLowerCase()) || 
                                  s.nationalCode.toLowerCase().includes(supervisorSchoolSearch.toLowerCase())
                                )
                                .map((sch) => (
                                  <tr key={sch.id} className="hover:bg-slate-50/55 transition-colors">
                                    <td className="py-4 px-6">
                                      <div className="font-extrabold text-slate-800 text-xs">{sch.name}</div>
                                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">Enveloppe scolaire active</div>
                                    </td>
                                    <td className="py-4 px-6 text-slate-600 text-[11px]">
                                      <div className="font-semibold">{sch.province}</div>
                                      <div className="text-[10px] text-slate-400">{sch.commune}, {sch.city}</div>
                                    </td>
                                    <td className="py-4 px-6 text-center font-mono text-[11px] font-black text-indigo-950">
                                      <span className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded font-bold">
                                        {sch.nationalCode}
                                      </span>
                                    </td>
                                    <td className="py-4 px-6 text-slate-700 text-xs">
                                      <span className="font-bold">{sch.rectorName}</span>
                                    </td>
                                  </tr>
                                ))}
                              {schools.filter(s => 
                                s.name.toLowerCase().includes(supervisorSchoolSearch.toLowerCase()) || 
                                s.nationalCode.toLowerCase().includes(supervisorSchoolSearch.toLowerCase())
                              ).length === 0 && (
                                <tr>
                                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium font-sans">
                                    Aucune école ne correspond à la recherche "{supervisorSchoolSearch}".
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      /* Central database of users list for supervisors */
                      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left space-y-4 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-3xs">
                          <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-indigo-950 font-sans">
                              <span>👥</span> Répertoire National des Utilisateurs &amp; Agents Enregistrés ({allUsers.length} Utilisateurs)
                            </h3>
                            <p className="text-[10.5px] text-slate-500 font-medium">
                              Consultez en temps réel les identités d'habilitation, catégories administratives et matricules officiels.
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-slate-200 w-full sm:max-w-md shrink-0">
                            <Search className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              placeholder="Chercher par nom, matricule ou adresse e-mail..."
                              value={supervisorUserSearch}
                              onChange={(e) => setSupervisorUserSearch(e.target.value)}
                              className="bg-transparent border-0 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-0 w-full font-medium"
                            />
                          </div>
                        </div>

                        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider select-none">
                                <th className="py-3 px-4">Identité de l'Agent d'État</th>
                                <th className="py-3 px-4">Numéro Matricule</th>
                                <th className="py-3 px-4">Qualité / Catégorie d'accès</th>
                                <th className="py-3 px-4">Établissement rattaché</th>
                                <th className="py-3 px-4">E-mail de contact</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium font-sans text-xs">
                              {allUsers
                                .filter(u => 
                                  u.fullName.toLowerCase().includes(supervisorUserSearch.toLowerCase()) || 
                                  (u.email && u.email.toLowerCase().includes(supervisorUserSearch.toLowerCase())) ||
                                  (u.matricule && u.matricule.toLowerCase().includes(supervisorUserSearch.toLowerCase()))
                                )
                                .map((usr, index) => {
                                  const associatedSch = schools.find(s => s.id === usr.schoolId);
                                  const fallbackMatricule = usr.matricule || `${7100000 + index}-${usr.role[0] || 'X'}`;
                                  return (
                                    <tr key={index} className="hover:bg-slate-50/55 transition-colors">
                                      <td className="py-3.5 px-4 font-sans">
                                        <span className="font-extrabold text-slate-800 block">{usr.fullName}</span>
                                        {usr.phone && <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{usr.phone}</span>}
                                      </td>
                                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                                        <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10.5px] px-2 py-0.5 rounded font-black">
                                          {fallbackMatricule}
                                        </span>
                                      </td>
                                      <td className="py-3.5 px-4">
                                        <span className={`inline-block px-2.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${
                                          usr.role === 'Administrateur' ? 'bg-red-50 text-[#D32F2F] border border-red-100' :
                                          usr.role === 'Inspecteur' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                                          usr.role === 'Préfet des études' ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                                          'bg-slate-100 text-slate-650 border border-slate-200'
                                        }`}>
                                          {usr.role}
                                        </span>
                                      </td>
                                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                                        <span className="font-bold block">{associatedSch ? associatedSch.name : 'Régie Centrale / Inspection'}</span>
                                        <span className="text-[9px] text-slate-400 block mt-0.5">{associatedSch ? `${associatedSch.province} • Code: ${associatedSch.nationalCode}` : 'Niveau National'}</span>
                                      </td>
                                      <td className="py-3.5 px-4 font-mono text-slate-500">
                                        {usr.email || 'Non spécifié'}
                                      </td>
                                    </tr>
                                  );
                                })}
                              {allUsers.filter(u => 
                                u.fullName.toLowerCase().includes(supervisorUserSearch.toLowerCase()) || 
                                (u.email && u.email.toLowerCase().includes(supervisorUserSearch.toLowerCase())) ||
                                (u.matricule && u.matricule.toLowerCase().includes(supervisorUserSearch.toLowerCase()))
                              ).length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium font-sans">
                                    Aucun agent ne correspond à l'argument "{supervisorUserSearch}".
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 🏫 SCHOOL ADMINISTRATIVE DASHBOARD (Default view) */
                  <>
                    {/* Primary dynamic statistics of the school */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-sm transition-all">
                    <div className="p-3 bg-sky-50 text-[#007FFF] rounded-xl border border-sky-100 shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Effectif Élèves</span>
                      <span className="text-xl font-black text-slate-800 leading-none">{schoolStudents.length}</span>
                      <p className="text-[9px] text-[#007FFF] font-bold truncate mt-0.5">Écolages inscrits</p>
                    </div>
                  </div>

                  {currentUser?.role === 'Enseignant' ? (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-sm transition-all duration-150 animate-in fade-in">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
                        <NotebookPen className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Statut Pédagogique</span>
                        <span className="text-xl font-black text-emerald-700 leading-none">Encodage Actif</span>
                        <p className="text-[9px] text-emerald-600 font-bold truncate mt-0.5">Saisie des fiches &amp; notes</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-sm transition-all">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Frais Recouvrés</span>
                        <span className="text-xl font-black text-emerald-700 leading-none">${totalReceivedUSD.toFixed(0)}</span>
                        <p className="text-[9px] text-emerald-600 font-bold truncate mt-0.5">Recettes trimestrielles</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-sm transition-all">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Bulletins Générés</span>
                      <span className="text-xl font-black text-indigo-800 leading-none">{schoolBulletins.length}</span>
                      <p className="text-[9px] text-[#D32F2F] font-extrabold font-mono mt-0.5">{enrollmentSuccessRatio}% Encodés</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-sm transition-all">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shrink-0">
                      <BookOpenCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Code National</span>
                      <span className="text-xs font-black text-slate-800 tracking-wider font-mono block truncate mt-1 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded text-center">
                        {currentSchool.nationalCode}
                      </span>
                      <p className="text-[8px] text-slate-400 block font-sans truncate mt-1">Préfet: {currentSchool.rectorName.substring(0, 16)}...</p>
                    </div>
                  </div>
                </div>

                {/* 📊 TABLEAU COMPATIF NATIONAL DES ÉTABLISSEMENTS DE LA BASE DE DONNÉES */}
                {isSuperAdmin && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                    <div className="bg-gradient-to-r from-indigo-950 to-slate-900 px-5 py-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 font-sans text-white">
                          <span>📊</span> Tableau Récapitulatif des Établissements (Base de Données EPST)
                        </h3>
                        <p className="text-[11px] text-sky-200/90 font-medium">
                          Suivi des effectifs, frais écolages, et bulletins sauvegardés avec archivage automatique.
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[10px] font-mono border border-white/20 select-none">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {schools.length} Écoles Enregistrées
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider select-none">
                            <th className="py-3 px-4">Nom de l'Établissement</th>
                            <th className="py-3 px-4">Province &amp; Localisation</th>
                            <th className="py-3 px-4 text-center">Code National</th>
                            <th className="py-3 px-4 text-center">Effectif Élèves</th>
                            <th className="py-3 px-4 text-center">Frais Recouvrés</th>
                            <th className="py-3 px-4 text-center">Bulletins Générés</th>
                            <th className="py-3 px-4 text-center">Indicateur Archivage</th>
                            <th className="py-3 px-4 text-right">Espace de travail</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {schools.map((sch) => {
                            const schStudents = students.filter(s => s.schoolId === sch.id);
                            const schPayments = payments.filter(p => p.schoolId === sch.id);
                            const schBulletins = bulletins.filter(b => b.schoolId === sch.id);
                            const totalSchUSD = schPayments.reduce((acc, p) => p.currency === 'USD' ? acc + p.amount : acc + (p.amount / 2800), 0);
                            
                            const isSelected = sch.id === currentSchool.id;
                            
                            return (
                              <tr 
                                key={sch.id} 
                                className={`hover:bg-sky-50/30 transition-colors cursor-pointer ${
                                  isSelected ? 'bg-sky-50/50 font-bold border-l-4 border-[#007FFF]' : ''
                                }`}
                                onClick={() => setActiveSchoolId(sch.id)}
                              >
                                <td className="py-3.5 px-4">
                                  <div className="font-extrabold text-slate-800 text-[11.5px]">{sch.name}</div>
                                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">Chef d'Établissement: {sch.rectorName}</div>
                                </td>
                                <td className="py-3.5 px-4 text-slate-600 text-[10.5px]">
                                  <div className="font-semibold">{sch.province}</div>
                                  <div className="text-[9.5px] text-slate-400">{sch.commune}, {sch.city}</div>
                                </td>
                                <td className="py-3.5 px-4 text-center font-mono text-[11px] font-black text-indigo-950">
                                  <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                    {sch.nationalCode}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="text-[10.5px] font-bold text-slate-700 bg-sky-50 border border-sky-100/60 px-2.5 py-0.5 rounded-full">
                                    👤 {schStudents.length} élèves
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700 text-[11px]">
                                  ${totalSchUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="text-[10.5px] font-extrabold text-[#007FFF] bg-blue-50 border border-blue-100/60 px-2.5 py-0.5 rounded">
                                    📝 {schBulletins.length} bulletins
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="inline-flex items-center gap-1 text-[8.5px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-0.5 rounded-full select-none">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Enregistré &amp; Archivé
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSchoolId(sch.id);
                                    }}
                                    className={`px-3 py-1 rounded-lg text-[9.5px] font-black uppercase transition-all border cursor-pointer ${
                                      isSelected 
                                        ? 'bg-[#007FFF] border-[#007FFF] text-white shadow-xs' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    {isSelected ? 'Sélectionné' : 'Voir Espace'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Grid details containing verification & info manual */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left block: Anti-fraud and scanner widget */}
                  <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-[#F4D03F]/10 text-amber-600 rounded-lg shrink-0 border border-[#F4D03F]/20">
                        <ShieldAlert className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Contrôle de conformité &amp; Sceau Républicain</h4>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Intégrité Républicaine RDC</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      Chaque bulletin officiel de notes, carte scolaire numérique d'élèves ou reçu de versement monétaire d’écolage généré par notre plateforme SGESC possède un sceau cryptographique (QR Code) vérifiable par n'importe quel inspecteur ou parent d'élève.
                    </p>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-indigo-950 shrink-0" fill="currentColor">
                          <rect x="2" y="2" width="6" height="6" />
                          <rect x="16" y="2" width="6" height="6" />
                          <rect x="2" y="16" width="6" height="6" />
                          <rect x="9" y="10" width="6" height="4" />
                        </svg>
                        <div>
                          <span className="text-xs font-bold text-indigo-950 block">Saisir manuellement ou tester ?</span>
                          <span className="text-[10px] text-slate-400 block font-mono">Simulateur d’authentification mobile RDC</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenQRScanner('')}
                        className="w-full sm:w-auto bg-indigo-950 hover:bg-slate-900 text-white font-mono text-xs font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        Scanner un document
                      </button>
                    </div>

                    {/* Sûreté de Connexion & Archivage Automatique */}
                    <div className="p-4 bg-sky-50/40 border border-sky-200/60 rounded-xl space-y-2">
                      <div className="flex items-start gap-2.5">
                        <span className="text-base leading-none pt-0.5">📂</span>
                        <div className="space-y-1">
                          <h5 className="text-xs font-black text-indigo-950 leading-tight flex items-center gap-1.5">
                            Sûreté Républicaine et Archivage Automatique
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                              Enregistrement Automatique
                            </span>
                          </h5>
                          <p className="text-[11px] text-slate-600 leading-normal font-semibold">
                            Toutes vos saisies (élèves, paiements, fiches de cotation, lesson plans) sont automatiquement enregistrées et persistées instantanément dans la base de données locale sécurisée (<span className="font-mono text-[10px] text-indigo-600">localStorage</span>). Les documents de bulletins générés sont quant à eux automatiquement archivés sous forme immuable pour l'Inspection Ministérielle. 
                          </p>
                          <p className="text-[10.5px] text-emerald-700 font-bold flex items-center gap-1">
                            <span>✓</span> Synchronisation permanente active &bull; Zéro perte de données en mode autonome.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right block: Quick workspace details */}
                  <div className="bg-indigo-950 text-white rounded-2xl p-5 space-y-4 shadow-xs relative overflow-hidden border-r-4 border-[#007FFF]">
                    <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.25]">
                      <CongoCoatOfArms className="w-32 h-32 scale-110" opacityClassName="opacity-100" />
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-wider text-yellow-300 font-bold">Identifiant d’Établissement</span>
                      <h4 className="text-base font-extrabold truncate mt-0.5">{currentSchool.name}</h4>
                      <p className="text-[10px] text-sky-200 font-light font-sans mt-0.5">Délégation de l’EPST - Division Provinciale</p>
                    </div>

                    <div className="space-y-2 text-[11px] pt-1.5 border-t border-slate-705/60 leading-normal text-sky-100">
                      <p className="flex justify-between border-b border-indigo-900 pb-1">
                        <span className="text-sky-300 uppercase font-mono text-[9px]">Province:</span>
                        <span className="font-bold text-white">{currentSchool.province}</span>
                      </p>
                      <p className="flex justify-between border-b border-indigo-900 pb-1">
                        <span className="text-sky-300 uppercase font-mono text-[9px]">Ville/District:</span>
                        <span className="font-bold text-white">{currentSchool.city}</span>
                      </p>
                      <p className="flex justify-between border-b border-indigo-900 pb-1">
                        <span className="text-sky-300 uppercase font-mono text-[9px]">Commune:</span>
                        <span className="font-bold text-white">{currentSchool.commune}</span>
                      </p>
                      <p className="flex justify-between border-b border-indigo-900 pb-1">
                        <span className="text-sky-300 uppercase font-mono text-[9px]">Autorité (Préfet):</span>
                        <span className="font-bold text-white text-[10px] truncate max-w-[140px] block" title={currentSchool.rectorName}>{currentSchool.rectorName.replace('Monsieur le Préfet ', '').replace('Révérend Père Préfet ', '').replace('Sœur Préfète ', '')}</span>
                      </p>
                    </div>

                    <div className="text-[9px] text-[#F4D03F]/90 bg-white/5 border border-white/10 p-2 rounded text-center tracking-wide font-mono font-semibold">
                      ARCHIVE NUMERIQUE ACTIVE RDC
                    </div>
                  </div>

                </div>
                  </>
                )}

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
                payments={payments}
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
                allUsers={allUsers}
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
                userActivities={userActivities}
                setUserActivities={setUserActivities}
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
