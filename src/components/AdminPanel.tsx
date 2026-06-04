import React, { useState } from 'react';
import { User, School, Student, Payment, Bulletin, UserRole, UserActivity } from '../types';
import { PROVINCES_26 } from '../constants';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  CreditCard, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  UserPlus, 
  Sparkles, 
  Check, 
  X, 
  AlertTriangle,
  MapPin,
  Mail,
  Smartphone,
  Layers,
  Award,
  Download,
  Upload,
  Copy,
  Database,
  Handshake,
  Activity,
  History
} from 'lucide-react';

interface AdminPanelProps {
  allUsers: User[];
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  schools: School[];
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  bulletins: Bulletin[];
  setBulletins: React.Dispatch<React.SetStateAction<Bulletin[]>>;
  userActivities: UserActivity[];
  setUserActivities: React.Dispatch<React.SetStateAction<UserActivity[]>>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  allUsers,
  setAllUsers,
  schools,
  setSchools,
  students,
  setStudents,
  payments,
  setPayments,
  bulletins,
  setBulletins,
  userActivities,
  setUserActivities
}) => {
  // Count unapproved schools needing admin authorize
  const pendingCount = schools.filter(sch => sch.isApproved === false).length;

  // Sub Tabs Grid (Navigation Bar)
  // 'PENDING_APPROVALS': Accès & Homologations
  // 'SCHOOLS': Écoles Homologuées
  // 'USERS': Membres & Rôles
  // 'AUDIT_LOGS': Audit & Suivi d'Activités
  // 'BACKUP_LOAD': Transfert de Données (Exporter, Importer, Copier)
  // 'GLOBAL_STATS': Analyses & Rapports RDC
  const [subTab, setSubTab] = useState<'PENDING_APPROVALS' | 'SCHOOLS' | 'USERS' | 'AUDIT_LOGS' | 'BACKUP_LOAD' | 'GLOBAL_STATS'>(() => {
    return pendingCount > 0 ? 'PENDING_APPROVALS' : 'SCHOOLS';
  });

  // Search & Filters for Users
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Search & Filters for Audit Logs
  const [logQuery, setLogQuery] = useState('');
  const [catFilter, setCatFilter] = useState<string>('ALL');
  const [qualFilter, setQualFilter] = useState<string>('ALL');

  // State Management for Forms
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserIndex, setEditingUserIndex] = useState<number | null>(null);

  // Adding/Editing User Inputs
  const [uName, setUName] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uRole, setURole] = useState<UserRole>('Enseignant');
  const [uSchoolId, setUSchoolId] = useState(schools[0]?.id || 'sc-1');
  const [uMatricule, setUMatricule] = useState('');
  const [uPassword, setUPassword] = useState('');

  // School Forms state
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);

  // Adding/Editing School Inputs
  const [sName, setSName] = useState('');
  const [sProvince, setSProvince] = useState('Kinshasa');
  const [sCity, setSCity] = useState('');
  const [sCommune, setSCommune] = useState('');
  const [sNationalCode, setSNationalCode] = useState('');
  const [sRector, setSRector] = useState('');

  // Backup & Import statuses
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [copyState, setCopyState] = useState(false);

  // --- CORE UTILITY HANDLERS ---
  const triggerDownload = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Full backup JSON export
  const handleExportBackup = () => {
    const backup = {
      version: "1.0.0",
      exportDate: new Date().toLocaleString('fr-CD'),
      exportedBy: "Administration Spécifique du Contrôle Centralisé (EPST)",
      schools,
      allUsers,
      students,
      payments,
      bulletins
    };
    triggerDownload(
      JSON.stringify(backup, null, 2),
      `SGESC_RDC_SAUVEGARDE_SYSTEME_${new Date().toISOString().slice(0,10)}.json`,
      'application/json;charset=utf-8;'
    );
  };

  // Raw helper to parse and replace all collections
  const handleImportJSON = (jsonText: string) => {
    try {
      const parsedData = JSON.parse(jsonText);
      const requiredArrays = ['schools', 'allUsers', 'students', 'payments', 'bulletins'];
      const missing = requiredArrays.filter(key => !Array.isArray(parsedData[key]));
      
      if (missing.length > 0) {
        throw new Error(`Format invalide. Tableaux obligatoires manquants: ${missing.join(', ')}`);
      }
      
      // Load tables to state
      setSchools(parsedData.schools);
      setAllUsers(parsedData.allUsers);
      setStudents(parsedData.students);
      setPayments(parsedData.payments);
      setBulletins(parsedData.bulletins);
      
      // Update browser persistence
      localStorage.setItem('sgesc_schools', JSON.stringify(parsedData.schools));
      localStorage.setItem('sgesc_all_users', JSON.stringify(parsedData.allUsers));
      localStorage.setItem('sgesc_students', JSON.stringify(parsedData.students));
      localStorage.setItem('sgesc_payments', JSON.stringify(parsedData.payments));
      localStorage.setItem('sgesc_bulletins', JSON.stringify(parsedData.bulletins));
      
      return true;
    } catch (err: any) {
      setImportError(err?.message || 'Erreur lors du décodage du fichier JSON de sauvegarde.');
      return false;
    }
  };

  // Click file selector
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    setImportSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = handleImportJSON(text);
      if (success) {
        setImportSuccess(`Importation complétée ! Rétablissement de ${file.name} réussi.`);
      }
    };
    reader.readAsText(file);
  };

  // Drag-and-drop actions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setImportError('');
    setImportSuccess('');
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        setImportError('Veuillez glisser exclusivement un fichier de sauvegarde au format .JSON');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const success = handleImportJSON(text);
        if (success) {
          setImportSuccess(`Importation glissée-déposée réussie ! Base de données restaurée.`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Clipboard copies
  const handleCopyJSONToClipboard = () => {
    const backup = {
      schools,
      allUsers,
      students,
      payments,
      bulletins
    };
    
    navigator.clipboard.writeText(JSON.stringify(backup, null, 2))
      .then(() => {
        setCopyState(true);
        setTimeout(() => setCopyState(false), 3000);
      })
      .catch(() => {
        alert("Action bloquée par la sécurité du navigateur.");
      });
  };

  // CSV Exporters
  const handleExportSchoolsCSV = () => {
    let csv = '\uFEFF'; // BOM UTF-8
    csv += 'ID,Dénomination,Province,Ville_Or_District,Commune_Or_Territoire,Code_National,Chef_Etablissement,Homologue\n';
    schools.forEach(s => {
      csv += `"${s.id}","${s.name.replace(/"/g, '""')}","${s.province}","${s.city}","${s.commune}","${s.nationalCode}","${s.rectorName.replace(/"/g, '""')}","${s.isApproved !== false ? 'OUI' : 'NON'}"\n`;
    });
    triggerDownload(csv, 'SGESC_RDC_REPERTOIRE_ECOLES.csv', 'text/csv;charset=utf-8;');
  };

  const handleExportStudentsCSV = () => {
    let csv = '\uFEFF';
    csv += 'ID_Matricule,Nom_Complet,Classe_Niveau,Option_Scolaire,Genre_Sexe,ID_Ecole\n';
    students.forEach(s => {
      csv += `"${s.id}","${s.fullName.replace(/"/g, '""')}","${s.classLevel}","${s.option}","${s.gender}","${s.schoolId}"\n`;
    });
    triggerDownload(csv, 'SGESC_RDC_LISTE_ELEVES.csv', 'text/csv;charset=utf-8;');
  };

  const handleExportPaymentsCSV = () => {
    let csv = '\uFEFF';
    csv += 'ID_Bordereau,ID_Eleve,Nom_Eleve,Montant,Devise,Type_Frais,Statut,Date_Versement\n';
    payments.forEach(p => {
      csv += `"${p.id}","${p.studentId}","${p.studentName.replace(/"/g, '""')}",${p.amount},"${p.currency}","${p.type}","${p.status}","${p.date}"\n`;
    });
    triggerDownload(csv, 'SGESC_RDC_RAPPORT_VERSEMENTS.csv', 'text/csv;charset=utf-8;');
  };

  const handleExportBulletinsCSV = () => {
    let csv = '\uFEFF';
    csv += 'ID_Bulletin,ID_Eleve,Annee_Scolaire,Evaluation_Conduite,Absences_Jours\n';
    bulletins.forEach(b => {
      csv += `"${b.id}","${b.studentId}","${b.academicYear}","${b.conduct}",${b.daysAbsent}\n`;
    });
    triggerDownload(csv, 'SGESC_RDC_EVALUATIONS_BULLETINS.csv', 'text/csv;charset=utf-8;');
  };

  // --- SAVE ACTIONS ---
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName.trim()) return;

    if (editingUserIndex !== null) {
      setAllUsers(prev => prev.map((usr, idx) => {
        if (idx === editingUserIndex) {
          return {
            ...usr,
            fullName: uName,
            phone: uPhone,
            email: uEmail,
            role: uRole,
            schoolId: uSchoolId,
            matricule: uMatricule.trim() || usr.matricule || `${Math.floor(100000 + Math.random() * 900000)}-X`,
            password: uPassword.trim() || usr.password || '012000'
          };
        }
        return usr;
      }));
      setEditingUserIndex(null);
    } else {
      const newUser: User = {
        fullName: uName,
        phone: uPhone || 'Non spécifié',
        email: uEmail,
        role: uRole,
        schoolId: uSchoolId,
        matricule: uMatricule.trim() || `${Math.floor(1000000 + Math.random() * 9000000)}-${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]}`,
        password: uPassword.trim() || '012000',
        timestamp: new Date().toLocaleString('fr-CD')
      };
      setAllUsers(prev => [newUser, ...prev]);
      setIsAddingUser(false);
    }
    resetUserFields();
  };

  const startEditUser = (usr: User, index: number) => {
    setEditingUserIndex(index);
    setURole(usr.role);
    setUName(usr.fullName);
    setUPhone(usr.phone);
    setUEmail(usr.email || '');
    setUSchoolId(usr.schoolId);
    setUMatricule(usr.matricule || '');
    setUPassword(usr.password || '012000');
    setIsAddingUser(false);
  };

  const deleteUser = (index: number) => {
    if (window.confirm('Voulez-vous vraiment désactiver ce compte d\'agent ?')) {
      setAllUsers(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  const resetUserFields = () => {
    setUName('');
    setUPhone('');
    setUEmail('');
    setURole('Enseignant');
    setUSchoolId(schools[0]?.id || 'sc-1');
    setUMatricule('');
    setUPassword('');
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim() || !sNationalCode.trim() || !sRector.trim()) return;

    if (editingSchoolId !== null) {
      setSchools(prev => prev.map(sch => {
        if (sch.id === editingSchoolId) {
          return {
            ...sch,
            name: sName,
            province: sProvince,
            city: sCity || sProvince,
            commune: sCommune,
            nationalCode: sNationalCode,
            rectorName: sRector
          };
        }
        return sch;
      }));
      setEditingSchoolId(null);
    } else {
      const newSch: School = {
        id: `sc-custom-${Date.now()}`,
        name: sName,
        province: sProvince,
        city: sCity || sProvince,
        commune: sCommune,
        nationalCode: sNationalCode,
        rectorName: sRector,
        isApproved: true // Homologation directe par l'admin central
      };
      setSchools(prev => [...prev, newSch]);
      setIsAddingSchool(false);
    }
    resetSchoolFields();
  };

  const startEditSchool = (sch: School) => {
    setEditingSchoolId(sch.id);
    setSName(sch.name);
    setSProvince(sch.province);
    setSCity(sch.city || sch.province);
    setSCommune(sch.commune);
    setSNationalCode(sch.nationalCode);
    setSRector(sch.rectorName);
    setIsAddingSchool(false);
  };

  const deleteSchool = (id: string) => {
    const studentCount = students.filter(s => s.schoolId === id).length;
    if (studentCount > 0) {
      alert(`Impossible de supprimer : ${studentCount} élèves sont actuellement inscrits dans cet établissement.`);
      return;
    }
    if (window.confirm('Voulez-vous vraiment rayer cette école de la base nationale ?')) {
      setSchools(prev => prev.filter(s => s.id !== id));
    }
  };

  const resetSchoolFields = () => {
    setSName('');
    setSProvince('Kinshasa');
    setSCity('');
    setSCommune('');
    setSNationalCode('');
    setSRector('');
  };

  // Statistics Computations
  const totalSchools = schools.length;
  const totalUsersCount = allUsers.length;
  const totalStudentsCount = students.length;
  const totalBulletinsCount = bulletins.length;

  const totalUSDCollected = payments.reduce((sum, p) => {
    return p.currency === 'USD' ? sum + p.amount : sum + (p.amount / 2800);
  }, 0);

  const filteredUsers = allUsers.filter(usr => {
    const matchesQuery = 
      usr.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (usr.phone && usr.phone.includes(searchQuery)) ||
      (usr.matricule && usr.matricule.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (usr.email && usr.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === 'ALL' || usr.role === roleFilter;

    return matchesQuery && matchesRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner Titulaire Administrateur Bireke Idea */}
      <div className="bg-gradient-to-r from-emerald-650 via-teal-700 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15 hidden md:block">
          <Handshake className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-slate-950 text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest leading-none">
            <Sparkles className="w-3 h-3" />
            Vérifié : Chef d'Antenne National Agrée
          </div>
          <h2 className="text-xl md:text-2xl font-black">
            🤝 Portail d’Entente National Centralisé
          </h2>
          <p className="text-xs text-emerald-50 font-medium leading-relaxed">
            Espace sécurisé de contrôle national. En tant que Directeur National habilite, vous gérez les ententes d'inscription, validez les demandes d'accès d'écoles, et supervisez l'intégrité de la base de données centrale.
          </p>
        </div>
      </div>

      {/* Grid of Global Aggregations (Visual tiles) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">Utilisateurs</span>
            <span className="p-1 bg-rose-50 text-[#D32F2F] rounded-lg"><Users className="w-4 h-4" /></span>
          </div>
          <span className="text-xl font-black block mt-1 text-slate-800">{totalUsersCount}</span>
          <span className="text-[8.5px] text-green-600 font-bold">Inscriptions enregistrées</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">Écoles</span>
            <span className="p-1 bg-blue-50 text-blue-600 rounded-lg"><Building2 className="w-4 h-4" /></span>
          </div>
          <span className="text-xl font-black block mt-1 text-slate-800">{totalSchools}</span>
          <span className="text-[8.5px] text-slate-500 font-semibold truncate block">Homologuées &amp; Enregistrées</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">Apprenants</span>
            <span className="p-1 bg-yellow-50 text-yellow-650 rounded-lg"><Users className="w-4 h-4" /></span>
          </div>
          <span className="text-xl font-black block mt-1 text-slate-800">{totalStudentsCount}</span>
          <span className="text-[8.5px] text-slate-400 block font-semibold">Élèves enregistrés</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">Fonds Réf</span>
            <span className="p-1 bg-green-50 text-green-650 rounded-lg"><CreditCard className="w-4 h-4" /></span>
          </div>
          <span className="text-xl font-black block mt-1 text-emerald-700">${totalUSDCollected.toFixed(0)}</span>
          <span className="text-[8.5px] text-slate-400 block font-medium">Frais scolaires totaux</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">Sceau Bulletins</span>
            <span className="p-1 bg-violet-50 text-violet-600 rounded-lg"><FileText className="w-4 h-4" /></span>
          </div>
          <span className="text-xl font-black block mt-1 text-slate-800">{totalBulletinsCount}</span>
          <span className="text-[8.5px] text-emerald-600 font-extrabold tracking-wide">Fiches d'examens</span>
        </div>
      </div>

      {/* Sub Tabs Selection Bar - REDUCES visual clutter inside the administration space */}
      <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5 shadow-sm">
        
        <button
          onClick={() => { setSubTab('PENDING_APPROVALS'); }}
          className={`py-2 px-3.5 text-xs font-black uppercase tracking-wide rounded-xl transition-all cursor-pointer flex items-center gap-1.5 relative ${
            subTab === 'PENDING_APPROVALS'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Handshake className="w-3.5 h-3.5" />
          <span>🤝 Portail d’Entente</span>
          {pendingCount > 0 ? (
            <span className="px-1.5 py-0.5 text-[9px] font-black bg-blue-600 text-white rounded-full leading-none animate-bounce">
              {pendingCount}
            </span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          )}
        </button>

        <button
          onClick={() => { setSubTab('SCHOOLS'); }}
          className={`py-2 px-3.5 text-xs font-black uppercase tracking-wide rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'SCHOOLS'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Écoles Homologuées ({schools.filter(sc => sc.isApproved !== false).length})</span>
        </button>

        <button
          onClick={() => { setSubTab('USERS'); }}
          className={`py-2 px-3.5 text-xs font-black uppercase tracking-wide rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'USERS'
              ? 'bg-sky-650 text-white shadow-md'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Membres &amp; Habilitations ({allUsers.length})</span>
        </button>

        <button
          onClick={() => { setSubTab('AUDIT_LOGS'); }}
          className={`py-2 px-3.5 text-xs font-black uppercase tracking-wide rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'AUDIT_LOGS'
              ? 'bg-rose-700 text-white shadow-md'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>📟 Audit &amp; Activités ({userActivities.length})</span>
        </button>

        <button
          onClick={() => { setSubTab('BACKUP_LOAD'); }}
          className={`py-2 px-3.5 text-xs font-black uppercase tracking-wide rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'BACKUP_LOAD'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-550 hover:text-slate-905 hover:bg-slate-200/50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>📈 Rapports Excel &amp; CSV</span>
        </button>

        <button
          onClick={() => { setSubTab('GLOBAL_STATS'); }}
          className={`py-2 px-3.5 text-xs font-black uppercase tracking-wide rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'GLOBAL_STATS'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-550 hover:text-slate-905 hover:bg-slate-200/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Rapports RDC</span>
        </button>
      </div>

      {/**************** SUB-TAB: ACCÈS & AUTORISATIONS EN ATTENTE *****************/}
      {subTab === 'PENDING_APPROVALS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-amber-600" />
              CONTRÔLE ET SIGNATURES D'ACCÈS POUR LES ÉTABLISSEMENTS
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Afin de sécuriser la plateforme contre tout enregistrement frauduleux, chaque Préfet d'études ou comptable demandant à indexer sa classe doit être certifié et approuvé par vos soins. Seuls les établissements homologués peuvent générer des bulletins RDC et percevoir des bordereaux de frais.
            </p>
          </div>

          {schools.filter(sch => sch.isApproved === false).length === 0 ? (
            // Exquisite confirmation visual zero state for unhampered administration
            <div className="bg-emerald-50/50 border-2 border-dashed border-emerald-300 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight">SÉCURITÉ DU SYSTÈME INTEGRALE</h5>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  Zéro demande d'homologation en attente d'approbation. Tous les établissements scolaires enregistrés sur le réseau national sont homologués et considérés comme authentiques.
                </p>
              </div>
              <span className="text-[10px] font-mono select-none uppercase font-black tracking-widest bg-emerald-100/60 text-emerald-800 px-3 py-1 rounded-md border border-emerald-200">
                STATUT : CONFORME SGESC RDC
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {schools.filter(sch => sch.isApproved === false).map((sch) => (
                <div key={sch.id} className="bg-white rounded-2xl border-2 border-amber-400/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-amber-500 transition-all">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded uppercase border border-amber-200">
                        Province : {sch.province}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 font-bold">Réf-Soum: {sch.id.slice(-5)}</span>
                    </div>

                    <div>
                      <h5 className="font-extrabold text-slate-900 text-xs leading-snug">{sch.name}</h5>
                      <p className="text-[10.5px] text-slate-500 font-mono mt-0.5">
                        📍 {sch.commune}, {sch.city} &bull; Code de l'école: <b className="text-[#D32F2F] font-mono">{sch.nationalCode}</b>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-500">Préfet / Recteur :</span>
                        <span className="font-extrabold text-[#D32F2F] bg-white px-2 py-0.5 rounded border border-slate-150">{sch.rectorName}</span>
                      </div>
                      {sch.rectorPhone && (
                        <div className="flex justify-between font-mono">
                          <span>Téléphone Direct :</span>
                          <span className="font-bold text-slate-800">{sch.rectorPhone}</span>
                        </div>
                      )}
                      {sch.rectorEmail && (
                        <div className="flex justify-between font-mono">
                          <span>Email professionnel :</span>
                          <span className="font-semibold text-sky-800">{sch.rectorEmail}</span>
                        </div>
                      )}
                      {sch.optionsOrganized && sch.optionsOrganized.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-dashed border-slate-205">
                          <span className="text-[10px] uppercase font-black text-slate-450 block mb-1">Sections Organisées :</span>
                          <div className="flex flex-wrap gap-1">
                            {sch.optionsOrganized.map((opt: string) => (
                              <span key={opt} className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-1.5 py-0.5">
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-4 flex font-sans flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => {
                        if (window.confirm(`Supprimer définitivement la demande d'homologation de "${sch.name}" de la file d'attente ?`)) {
                          setSchools(prev => prev.filter(s => s.id !== sch.id));
                        }
                      }}
                      className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-lg border border-red-200 cursor-pointer transition-all flex items-center gap-1 uppercase"
                    >
                      <Trash2 className="w-3 h-3" />
                      Supprimer
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Rejeter officiellement la demande d'inscription pour l'école "${sch.name}" ?`)) {
                          setSchools(prev => prev.map(s => {
                            if (s.id === sch.id) {
                              return { ...s, isApproved: false }; // It can remain false or be marked marked rejected
                            }
                            return s;
                          }));
                          alert(`La demande de ${sch.name} a été marquée comme rejetée.`);
                        }
                      }}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-205 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-300 cursor-pointer transition-all flex items-center gap-1 uppercase"
                    >
                      <X className="w-3.5 h-3.5" />
                      Rejeter
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Valider l'inscription de l'établissement "${sch.name}"?`)) {
                          setSchools(prev => prev.map(s => {
                            if (s.id === sch.id) {
                              return { ...s, isApproved: true };
                            }
                            return s;
                          }));
                        }
                      }}
                      className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-xs uppercase shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Valider l'inscription
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/**************** SUB-TAB: ÉTABLISSEMENTS HOMOLOGUÉS *****************/}
      {subTab === 'SCHOOLS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white rounded-2xl border border-slate-200 gap-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Établissements Habilités et Homologués</h4>
              <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Sceau République Démocratique du Congo</p>
            </div>

            {!isAddingSchool && editingSchoolId === null && (
              <button
                onClick={() => setIsAddingSchool(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                Inscrire une École
              </button>
            )}
          </div>

          {/* School addition/editing panel */}
          {(isAddingSchool || editingSchoolId !== null) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  {editingSchoolId !== null ? 'Modifier la Fiche d’Établissement' : 'Inscrire une école de la République'}
                </span>
                <button
                  onClick={() => { setIsAddingSchool(false); setEditingSchoolId(null); resetSchoolFields(); }}
                  className="text-slate-450 hover:text-slate-650 text-xs font-semibold"
                >
                  Annuler
                </button>
              </div>

              <form onSubmit={handleSaveSchool} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">Nom Scolaire Complet *</label>
                  <input
                    type="text"
                    required
                    placeholder="INSTITUT SCIENTIFIQUE DE MBANDAKA"
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-1 focus:ring-sky-500 font-bold bg-white text-slate-850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">Province d'administration *</label>
                  <select
                    value={sProvince}
                    onChange={(e) => setSProvince(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-1 focus:ring-sky-500 font-bold bg-white text-slate-700"
                  >
                    {PROVINCES_26.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">Ville / District *</label>
                  <input
                    type="text"
                    required
                    placeholder="Lubumbashi, Goma, Kikwit"
                    value={sCity}
                    onChange={(e) => setSCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-1 focus:ring-sky-500 font-bold bg-white text-slate-850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">Commune / Territoire *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ngaliema, Kadutu, Dilala"
                    value={sCommune}
                    onChange={(e) => setSCommune(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-1 focus:ring-sky-500 font-bold bg-white text-slate-850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">Code National Ministériel *</label>
                  <input
                    type="text"
                    required
                    placeholder="EPST-773420"
                    value={sNationalCode}
                    onChange={(e) => setSNationalCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-1 focus:ring-sky-500 font-bold font-mono bg-white text-slate-850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">Préfet Directeur habilité *</label>
                  <input
                    type="text"
                    required
                    placeholder="Prof. Jean Kabila"
                    value={sRector}
                    onChange={(e) => setSRector(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-1 focus:ring-sky-500 font-bold bg-white text-slate-850"
                  />
                </div>

                <div className="flex items-end justify-end md:col-span-3">
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Valider l'Établissement
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Approved schools list only (Strictly uncluttered!) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {schools.filter(sch => sch.isApproved !== false).map((sch) => {
              const schStudentsCount = students.filter(s => s.schoolId === sch.id).length;
              const schBulletinsCount = bulletins.filter(b => b.schoolId === sch.id).length;
              const schPayCount = payments.filter(p => p.schoolId === sch.id).length;

              return (
                <div key={sch.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8.5px] font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 uppercase flex items-center gap-0.5 shadow-3xs">
                          <Check className="w-2.5 h-2.5" />
                          Homologué
                        </span>
                        <span className="text-[9.5px] font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 uppercase">
                          {sch.province}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{sch.name}</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5 font-mono flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-350" />
                        {sch.commune}, {sch.city}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-4 text-[11px] leading-tight">
                      <div className="text-center">
                        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold">Élèves</span>
                        <span className="font-extrabold text-slate-700 block mt-0.5">{schStudentsCount}</span>
                      </div>
                      <div className="text-center border-x border-slate-200">
                        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold">Payés</span>
                        <span className="font-extrabold text-slate-700 block mt-0.5">{schPayCount}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold">Bulletins</span>
                        <span className="font-extrabold text-slate-755 block mt-0.5">{schBulletinsCount}</span>
                      </div>
                    </div>

                    {sch.optionsOrganized && sch.optionsOrganized.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200">
                        <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Sections Organisées :</span>
                        <div className="flex flex-wrap gap-1">
                          {sch.optionsOrganized.map((opt: string) => (
                            <span key={opt} className="text-[8.5px] font-bold bg-indigo-50/80 text-indigo-700 border border-indigo-150 rounded px-1.5 py-0.5" title={opt}>
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3.5 border-t border-slate-100 pt-3 flex justify-between items-center text-[10.5px]">
                      <div>
                        <span className="text-[8.5px] uppercase font-mono tracking-wider text-slate-400 block font-bold">Recteur / Préfet:</span>
                        <span className="font-bold text-slate-700 truncate max-w-[130px] block" title={sch.rectorName}>
                          {sch.rectorName.replace('Monsieur le Préfet ', '')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8.5px] uppercase font-mono tracking-wider text-slate-400 block font-bold">Code EPST:</span>
                        <span className="font-mono text-[10px] font-black text-slate-800">{sch.nationalCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-150 pt-3 mt-4 flex justify-end gap-1.5">
                    <button
                      onClick={() => startEditSchool(sch)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-sky-600 rounded-lg cursor-pointer transition-all border border-slate-200 text-[11px] font-semibold flex items-center gap-1 shadow-3xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Modifier
                    </button>
                    {schools.length > 1 && (
                      <button
                        onClick={() => deleteSchool(sch.id)}
                        className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-650 rounded-lg cursor-pointer transition-all border border-slate-200 text-[11px] font-semibold flex items-center gap-1 shadow-3xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Retirer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/**************** SUB-TAB: MEMBRES & ACCÈS *****************/}
      {subTab === 'USERS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2 border border-slate-220 w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-450 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher par nom, mobile, email de fonction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 text-xs text-slate-705 placeholder-slate-450 focus:outline-hidden focus:ring-0 w-full font-medium"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-xl py-2 px-3 focus:ring-1 focus:ring-sky-550 shadow-2xs"
              >
                <option value="ALL">Tous les rangs</option>
                <option value="Préfet des études">Préfets des études</option>
                <option value="Enseignant">Enseignants</option>
                <option value="Comptable">Comptables</option>
                <option value="Directeur">Directeurs</option>
                <option value="Inspecteur">Inspecteurs</option>
                <option value="Coordinateur">Coordinateurs</option>
                <option value="Administrateur">Administrateurs</option>
              </select>

              {!isAddingUser && editingUserIndex === null && (
                <button
                  onClick={() => setIsAddingUser(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4" />
                  Inscrire un Agent
                </button>
              )}
            </div>
          </div>

          {/* 🟢 PANEL LIVE DES IDENTITÉS CONNECTÉES */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3.5 shadow-3xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D32F2F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
                <div>
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    📟 IDENTITÉS DES PERSONNES CONNECTÉES EN DIRECT SUR LA PLATEFORME (LIVE SESSIONS)
                  </h4>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Suivi instantané des sessions de travail actives des inspecteurs, directeurs, préfets, enseignants et comptables connectés sur le portail d'administration centrale.
                  </p>
                </div>
              </div>
              <div className="bg-white border border-emerald-250 px-3 py-1 rounded-lg font-mono text-[10px] font-black text-emerald-900 shadow-3xs flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                👤 {allUsers.filter(u => u.isOnline).length} UTILISATEUR(S) EN LIGNE
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border border-emerald-100 shadow-3xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-emerald-100 text-[10px] font-black tracking-wider uppercase font-mono text-emerald-950">
                    <th className="py-2.5 px-4">Identité de l'agent</th>
                    <th className="py-2.5 px-4">Fonction / Rôle</th>
                    <th className="py-2.5 px-4">Établissement rattaché</th>
                    <th className="py-2.5 px-4">Dernière activité enregistrée</th>
                    <th className="py-2.5 px-4 text-center">Canal de transmission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 text-xs">
                  {allUsers.filter(u => u.isOnline).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-medium bg-slate-50/50">
                        Aucun autre utilisateur n'est connecté en ce moment sur la plateforme.
                      </td>
                    </tr>
                  ) : (
                    allUsers.filter(u => u.isOnline).map((usr, uIdx) => {
                      const affSchool = schools.find(s => s.id === usr.schoolId);
                      return (
                        <tr key={uIdx} className="hover:bg-emerald-50/15 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-slate-850 block">{usr.fullName}</span>
                            {usr.phone && <span className="text-[10px] font-mono text-slate-400 block">{usr.phone}</span>}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-805">
                              {usr.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-bold text-slate-700">
                            {affSchool ? affSchool.name : 'Secrétariat Général de l\'EPST (Global)'}
                          </td>
                          <td className="py-3 px-4 text-[10.5px] font-mono text-slate-500">
                            🟢 Actif CD : {usr.timestamp || 'Initialisé'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-700 font-mono animate-pulse">
                              <span>●</span> LIVE SECURE
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {(isAddingUser || editingUserIndex !== null) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-sky-600" />
                  {editingUserIndex !== null ? 'Modifier la fiche de l\'agent de contrôle' : 'Inscrire un nouvel utilisateur habilité'}
                </span>
                <button
                  onClick={() => { setIsAddingUser(false); setEditingUserIndex(null); resetUserFields(); }}
                  className="text-slate-450 hover:text-slate-650 text-xs font-bold"
                >
                  Annuler
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">Nom complet de l'agent *</label>
                  <input
                    type="text"
                    required
                    placeholder="Abbé Justin Mvunzi"
                    value={uName}
                    onChange={(e) => setUName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs focus:ring-1 focus:ring-sky-500 font-bold text-slate-850 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">Mobile (Vérification SMS) *</label>
                  <input
                    type="text"
                    required
                    placeholder="+243 890 000 000"
                    value={uPhone}
                    onChange={(e) => setUPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs font-mono focus:ring-1 focus:ring-sky-500 font-bold text-slate-850 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">E-mail institutionnel (Agréé)</label>
                  <input
                    type="email"
                    placeholder="prefet.institution@gmail.com"
                    value={uEmail}
                    onChange={(e) => setUEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs focus:ring-1 focus:ring-sky-500 font-bold text-slate-850 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">Matricule National de l'Agent</label>
                  <input
                    type="text"
                    placeholder="Laisser vide pour auto-générer"
                    value={uMatricule}
                    onChange={(e) => setUMatricule(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs focus:ring-1 focus:ring-sky-500 font-bold text-slate-850 bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">Clé d'Accès / Mot de passe *</label>
                  <input
                    type="text"
                    required
                    placeholder="Définissez le mot de passe (Ex: 012000)"
                    value={uPassword}
                    onChange={(e) => setUPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs focus:ring-1 focus:ring-sky-500 font-bold text-slate-850 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">Autorisation de niveau / Rôle *</label>
                  <select
                    value={uRole}
                    onChange={(e) => setURole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs font-bold text-slate-700 bg-white focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Préfet des études">Préfet des études</option>
                    <option value="Enseignant">Enseignant</option>
                    <option value="Comptable">Comptable</option>
                    <option value="Directeur">Directeur</option>
                    <option value="Inspecteur">Inspecteur (National)</option>
                    <option value="Coordinateur">Coordinateur</option>
                    <option value="Administrateur">Administrateur</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 font-mono">Établissement rattaché *</label>
                  <select
                    value={uSchoolId}
                    onChange={(e) => setUSchoolId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs font-bold text-slate-700 bg-white focus:ring-1 focus:ring-sky-500"
                  >
                    {schools.map(sch => (
                      <option key={sch.id} value={sch.id}>{sch.name} ({sch.province})</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end justify-end md:col-span-1">
                  <button
                    type="submit"
                    className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Enregistrer l'Agent
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150">
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Identité de l'agent</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Numéro Matricule</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Identifiant & Clé d'Accès (Pass)</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Contrôle d'accès / Fonction</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Etablissement assigné</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Enregistrement (Date CD)</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono text-center">Statut Connexion</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-medium font-sans">
                        Zéro agent trouvé correspondant aux filtres.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((usr, index) => {
                      const affSchool = schools.find(s => s.id === usr.schoolId);
                      // fallback representation for seed users
                      const matriculeFallback = usr.matricule || `${7100000 + index}-${usr.role[0] || 'X'}`;
                      return (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-sans">
                            <span className="font-extrabold text-slate-800 block">{usr.fullName}</span>
                            <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5 items-center font-mono">
                              {usr.phone && (
                                <span className="flex items-center gap-0.5"><Smartphone className="w-2.5 h-2.5 text-slate-350" />{usr.phone}</span>
                              )}
                              {usr.email && (
                                <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5 text-slate-350" />{usr.email}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            <span className="bg-slate-100 border border-slate-200/80 text-blue-700 text-[10.5px] px-2 py-0.5 rounded font-black">
                              {matriculeFallback}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs">
                            <div className="space-y-0.5">
                              <div className="text-slate-700">
                                <span className="font-bold text-slate-400">ID: </span>
                                <span className="font-semibold">{usr.email || usr.phone || usr.fullName}</span>
                              </div>
                              <div className="text-slate-600 font-bold bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded inline-block">
                                <span className="text-amber-500 text-[10px]">🔑 PASS:</span> <span className="text-[#D32F2F] text-[11px] select-all font-black">{usr.password || '012000'}</span>
                              </div>
                            </div>
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
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-700 block text-xs">{affSchool ? affSchool.name : 'Réseau National Global'}</span>
                            <span className="text-[9px] text-slate-450 font-mono block mt-0.5">{affSchool ? `${affSchool.province} • Code: ${affSchool.nationalCode}` : 'Droit absolu'}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] text-slate-450">
                            {usr.timestamp || 'Généré par seed par défaut'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {usr.isOnline ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250 animate-pulse font-mono">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                CONNECTÉ
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium bg-slate-100 text-slate-500 border border-slate-200 font-mono">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                HORS LIGNE
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => startEditUser(usr, index)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-sky-600 rounded-lg cursor-pointer border border-slate-200"
                                title="Formulaire d'Ajustement d'habilitation"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteUser(index)}
                                className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-650 rounded-lg cursor-pointer border border-slate-200"
                                title="Révoquer cet inspecteur"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/**************** SUB-TAB: AUDIT LOGS (SUIVI DES PREFETS & ACTIONS) *****************/}
      {subTab === 'AUDIT_LOGS' && (() => {
        // Render helper code
        const filteredActivities = userActivities.filter(act => {
          const matchesQuery = 
            act.userName.toLowerCase().includes(logQuery.toLowerCase()) ||
            act.schoolName.toLowerCase().includes(logQuery.toLowerCase()) ||
            act.action.toLowerCase().includes(logQuery.toLowerCase()) ||
            (act.details && act.details.toLowerCase().includes(logQuery.toLowerCase()));

          const matchesCategory = catFilter === 'ALL' || act.category === catFilter;
          const matchesQuality = qualFilter === 'ALL' || act.quality === qualFilter;

          return matchesQuery && matchesCategory && matchesQuality;
        });

        const handleSimulateActivity = () => {
          const possibleActions = [
            {
              action: "Génération d'un bulletin trimestriel",
              category: "PEDAGOGICAL",
              quality: "Excellent",
              details: "Génération et archivage de bulletin pour Placide Mwamba. Sceau d'authentification apposé."
            },
            {
              action: "Validation d'une leçon",
              category: "PEDAGOGICAL",
              quality: "Excellent",
              details: "Validation de la fiche de leçon 'Sciences physiques: mouvement uniforme' pour le niveau 4ème."
            },
            {
              action: "Enregistrement de paiement minerval",
              category: "FINANCIAL",
              quality: "Excellent",
              details: "Virement de 15 USD payé par CDF équivalent (42000 CDF) enregistré pour le mois en cours."
            },
            {
              action: "Modification autorisée d'état civil d'un élève",
              category: "ADMINISTRATIVE",
              quality: "Régulier",
              details: "Correction de l'orthographe du nom de famille de l'élève Mwamba (remplacement de 'Mwanba')"
            },
            {
              action: "Tentative de connexion refusée",
              category: "SECURITY",
              quality: "Avertissement",
              details: "Tentative de connexion avec un code d'homologation inexistant. Accès refusé par précaution."
            },
            {
              action: "Rapport d'incident pédagogique",
              category: "PEDAGOGICAL",
              quality: "Avertissement",
              details: "Absence injustifiée d'un enseignant principal signalée sur le journal de classe."
            },
            {
              action: "Forçage de réinitialisation de mot de passe",
              category: "SECURITY",
              quality: "Critique",
              details: "Changement d'habilitation d'accès demandé par un inspecteur provincial."
            },
            {
              action: "Certification d'examen d'État",
              category: "ADMINISTRATIVE",
              quality: "Excellent",
              details: "Fiche d'épreuve enregistrée sous protocole de cryptage national."
            }
          ];

          const nonAdminUsers = allUsers.filter(u => u.role !== 'Administrateur');
          const randomUser = nonAdminUsers.length > 0 
            ? nonAdminUsers[Math.floor(Math.random() * nonAdminUsers.length)] 
            : { fullName: "Préfet Simulien", role: "Préfet des études" as UserRole, schoolId: "sc-1" };

          const randomAction = possibleActions[Math.floor(Math.random() * possibleActions.length)];
          const associatedSchool = schools.find(s => s.id === randomUser.schoolId);

          const newActivity: UserActivity = {
            id: `act-sim-${Date.now()}`,
            userName: randomUser.fullName,
            userRole: randomUser.role,
            schoolName: associatedSchool ? associatedSchool.name : "Établissement RDC",
            action: randomAction.action,
            timestamp: new Date().toLocaleString('fr-CD'),
            category: randomAction.category as any,
            quality: randomAction.quality as any,
            details: randomAction.details
          };

          setUserActivities(prev => [newActivity, ...prev]);
        };

        const handleClearLogs = () => {
          if (window.confirm("Voulez-vous vraiment vider tout l'historique des connexions et d'activité du système ? Cette action est irréversible !")) {
            setUserActivities([]);
          }
        };

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-650" />
                  SUIVI D’ACTIVITÉS &amp; JOURNAL DES CONNEXIONS (AUDIT DE SURETÉ)
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Consultez l'historique des accès au portail administratif et pédagogique, certifiez la qualité des actions émises par les préfets, directeurs et comptables de la République Démocratique du Congo.
                </p>
              </div>

              <div className="flex gap-2 self-stretch sm:self-auto flex-wrap sm:flex-nowrap">
                <button
                  onClick={handleSimulateActivity}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-xs whitespace-nowrap flex items-center gap-1 uppercase"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Simuler une activité
                </button>
                {userActivities.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs py-2 px-3.5 rounded-xl cursor-pointer whitespace-nowrap flex items-center gap-1 uppercase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Vider le registre
                  </button>
                )}
              </div>
            </div>

            {/* FILTERS FOR USER ACTIVITIES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-3xs">
              <div className="relative flex items-center bg-white rounded-xl border border-slate-250 px-3 py-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, école, actions..."
                  value={logQuery}
                  onChange={(e) => setLogQuery(e.target.value)}
                  className="bg-transparent border-0 text-xs text-slate-850 placeholder-slate-450 focus:outline-hidden focus:ring-0 w-full font-semibold"
                />
              </div>

              <div>
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="bg-white border border-slate-250 text-xs font-bold text-slate-700 rounded-xl py-2 px-3.5 focus:ring-1 focus:ring-rose-500 shadow-2xs w-full h-[38px]"
                >
                  <option value="ALL">Toutes les catégories</option>
                  <option value="PEDAGOGICAL">📚 Pédagogique</option>
                  <option value="FINANCIAL">💸 Financier</option>
                  <option value="SECURITY">🛡️ Sécurité</option>
                  <option value="ADMINISTRATIVE">💼 Administratif</option>
                </select>
              </div>

              <div>
                <select
                  value={qualFilter}
                  onChange={(e) => setQualFilter(e.target.value)}
                  className="bg-white border border-slate-250 text-xs font-bold text-slate-700 rounded-xl py-2 px-3.5 focus:ring-1 focus:ring-rose-500 shadow-2xs w-full h-[38px]"
                >
                  <option value="ALL">Toutes les qualités</option>
                  <option value="Excellent">Qualité Excellente</option>
                  <option value="Régulier">Qualité Régulière</option>
                  <option value="Avertissement">Qualité Avertissement</option>
                  <option value="Critique">Qualité Critique (Alerte)</option>
                </select>
              </div>
            </div>

            {/* AUDIT TIMELINE LEDGER */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto font-sans">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-mono font-black text-slate-500">
                      <th className="py-3 px-4">Agent / Rôle</th>
                      <th className="py-3 px-4">Établissement</th>
                      <th className="py-3 px-4">Action effectuée</th>
                      <th className="py-3 px-4">Catégorie</th>
                      <th className="py-3 px-4 text-center">Qualité / Criticité</th>
                      <th className="py-3 px-4 text-right">Date &amp; Heure CD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-sans">
                    {filteredActivities.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400 font-bold bg-slate-50/50">
                          Zéro log trouvé correspondant aux critères d'audit.
                        </td>
                      </tr>
                    ) : (
                      filteredActivities.map((act) => (
                        <tr key={act.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-sans">
                            <span className="font-extrabold text-slate-800 block">{act.userName}</span>
                            <span className="text-[10px] font-mono text-indigo-700 font-bold uppercase">{act.userRole}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-700 block">{act.schoolName}</span>
                          </td>
                          <td className="py-3.5 px-4 max-w-sm">
                            <span className="font-bold text-slate-900 block">{act.action}</span>
                            {act.details && (
                              <span className="text-[10.5px] font-mono text-slate-500 block leading-tight mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                📝 {act.details}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 uppercase font-mono text-[10px] font-extrabold">
                            <span className={`inline-block px-2.5 py-0.5 rounded ${
                              act.category === 'PEDAGOGICAL' ? 'bg-violet-50 text-violet-800 border border-violet-150' :
                              act.category === 'FINANCIAL' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' :
                              act.category === 'SECURITY' ? 'bg-orange-50 text-orange-850 border border-orange-150' :
                              'bg-blue-50 text-blue-800 border border-blue-150'
                            }`}>
                              {act.category === 'PEDAGOGICAL' ? '📚 PÉDAGOGIQUE' :
                               act.category === 'FINANCIAL' ? '💸 FINANCIER' :
                               act.category === 'SECURITY' ? '🛡️ SÉCURITÉ' :
                               '💼 ADMINISTRATIF'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                              act.quality === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' :
                              act.quality === 'Régulier' ? 'bg-sky-50 text-sky-700 border border-sky-250' :
                              act.quality === 'Avertissement' ? 'bg-amber-50 text-amber-800 border border-amber-250' :
                              'bg-rose-50 text-rose-750 border border-rose-250'
                            }`}>
                              {act.quality}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {act.timestamp}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/**************** SUB-TAB: EXPORTS DE RAPPORTS SCOLAIRES AU FORMAT EXCEL & CSV *****************/}
      {subTab === 'BACKUP_LOAD' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-3xs">
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-150">
                <Database className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-extrabold text-slate-800 text-base">
                  CENTRE DE TÉLÉCHARGEMENT DE RAPPORTS SCOLAIRES (EXCEL / CSV)
                </h4>
                <div className="text-emerald-755 font-bold text-xs uppercase tracking-wider mt-0.5">
                  Secrétariat Général de l'EPST • Système de Traitement National
                </div>
              </div>
            </div>
            
            <p className="text-slate-600 leading-relaxed text-sm">
              Conformément aux instructions ministérielles de l'EPST, 
              <strong className="text-slate-850 font-bold"> les mécanismes complexes d'importation et d'exportation de fichiers techniques JSON ont été définitivement supprimés</strong> afin d'alléger l'espace de travail et d'éviter tout incident technique avec les enseignants.
            </p>
            <p className="text-slate-500 text-xs">
              Seules les fiches d'extraction au format universel Tableur (ouvrables directement dans Microsoft Excel, Google Sheets, LibreOffice) sont maintenues ci-dessous pour l'impression des fiches ou la consolidation des statistiques provinciales.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h5 className="font-black text-sm text-slate-700 uppercase tracking-wide">
                Extraction Directe des Registres d'Établissement (Format .CSV)
              </h5>
              <p className="text-xs text-slate-450 mt-1">
                Cliquez sur le registre de votre choix pour lancer un téléchargement immédiat.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="font-extrabold text-sm">Répertoire des Établissements</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                    Extraction complète de la liste des écoles de la RDC enregistrées ou en attente d'homologation ministerielle par les antennes provinciales de l'EPST.
                  </p>
                </div>
                <button
                  onClick={handleExportSchoolsCSV}
                  className="w-full py-2.5 px-3 bg-emerald-650 hover:bg-emerald-755 text-white font-bold rounded-xl cursor-pointer text-center text-xs transition-all shadow-md uppercase"
                >
                  Télécharger le Fichier Excel (.CSV)
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <Users className="w-5 h-5 text-yellow-600 shrink-0" />
                    <span className="font-extrabold text-sm">Registre National des Élèves</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                    Téléchargez les identités scolaires, matricules nationaux, genres, classes et affectations scolaires de tous les élèves enregistrés en base.
                  </p>
                </div>
                <button
                  onClick={handleExportStudentsCSV}
                  className="w-full py-2.5 px-3 bg-emerald-650 hover:bg-emerald-755 text-white font-bold rounded-xl cursor-pointer text-center text-xs transition-all shadow-md uppercase"
                >
                  Télécharger le Fichier Excel (.CSV)
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-extrabold text-sm">Rapports Financiers &amp; Versements</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                    Audit comptable complet comportant l'historique de paiement des minervals régionaux, des frais d'inscription et des cotisations des élèves.
                  </p>
                </div>
                <button
                  onClick={handleExportPaymentsCSV}
                  className="w-full py-2.5 px-3 bg-emerald-650 hover:bg-emerald-755 text-white font-bold rounded-xl cursor-pointer text-center text-xs transition-all shadow-md uppercase"
                >
                  Télécharger le Fichier Excel (.CSV)
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <FileText className="w-5 h-5 text-violet-600 shrink-0" />
                    <span className="font-extrabold text-sm">Évaluations &amp; Registre des Bulletins</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                    Registre des notes, des jours d'absences, de la conduite et des mentions délivrées pour les livrets scolaires certifiés par code QR.
                  </p>
                </div>
                <button
                  onClick={handleExportBulletinsCSV}
                  className="w-full py-2.5 px-3 bg-emerald-650 hover:bg-emerald-755 text-white font-bold rounded-xl cursor-pointer text-center text-xs transition-all shadow-md uppercase"
                >
                  Télécharger le Fichier Excel (.CSV)
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-slate-500 text-xs font-medium flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>Système National de l'EPST en communication cryptée SSL permanente • Les extractions CSV sont datées en temps réel.</span>
            </div>
          </div>
        </div>
      )}

      {/**************** SUB-TAB: GLOBAL STATS *****************/}
      {subTab === 'GLOBAL_STATS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6">
          <div className="border-b border-slate-150 pb-4">
            <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <Award className="w-5 h-5 text-red-650" />
              STATISTIQUES DE SYNTHÈSE SCOLAIRE NATIONAL SGESC RDC
            </h4>
            <span className="text-[10px] text-slate-400 uppercase font-mono mt-1 block">Rapport global consolidé par Division d'Antenne</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Block: Provinces distributions */}
            <div className="space-y-4">
              <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider font-mono">Démographie des Élèves sur les 26 Provinces</h5>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                {PROVINCES_26.map((prov) => {
                  const sCount = students.filter(s => {
                    const sch = schools.find(sc => sc.id === s.schoolId);
                    return sch?.province === prov;
                  }).length;
                  const ratio = students.length > 0 ? (sCount / students.length) * 100 : 0;
                  const hasSchool = schools.some(sc => sc.province === prov);
                  
                  return (
                    <div key={prov} className="space-y-1 py-1 border-b border-slate-50 last:border-0">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 flex items-center gap-1.5">
                          <span>📍</span> {prov} 
                          {!hasSchool && <span className="text-[9px] bg-slate-100 text-slate-400 font-mono px-1 py-0.2 rounded">Inactif</span>}
                          {hasSchool && <span className="text-[9px] bg-emerald-50 text-emerald-650 font-black font-mono px-1 py-0.2 rounded">Actif</span>}
                        </span>
                        <span className="text-slate-500 font-mono">{sCount} Élève{sCount > 1 ? 's' : ''} ({ratio.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                        <div className={`h-1.5 rounded-full ${hasSchool ? 'bg-sky-500' : 'bg-slate-350'}`} style={{ width: `${ratio || (hasSchool ? 5 : 0)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Block: General options statistics */}
            <div className="space-y-4">
              <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider font-mono">Répartition des Options Pédagogiques</h5>
              
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Total Enseignements Générés:</span>
                  <span className="font-bold text-slate-855">{totalBulletinsCount} Bulletins d'évaluation</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Taux est. de Recouvrement (Trimestriel):</span>
                  <span className="font-bold text-emerald-700">92.5% Directeurs de province</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Sceau d’Intégrité Numérique:</span>
                  <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded font-bold uppercase">QR Securisé Actif</span>
                </div>
                <div className="p-3 bg-red-50 border border-red-100 text-red-900 rounded-lg text-[10.5px] leading-relaxed font-semibold flex gap-2 items-start shrink-0">
                  <AlertTriangle className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
                  <span>Tous les documents émis par ces centres scolaires doivent être visés par le Préfet de province sous réserve d’homologation de contrôle.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
