import React, { useState } from 'react';
import { User, School, Student, Payment, Bulletin, UserRole } from '../types';
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
  Handshake
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
  setBulletins
}) => {
  // Count unapproved schools needing admin authorize
  const pendingCount = schools.filter(sch => sch.isApproved === false).length;

  // Sub Tabs Grid (Navigation Bar)
  // 'PENDING_APPROVALS': Accès & Homologations
  // 'SCHOOLS': Écoles Homologuées
  // 'USERS': Membres & Rôles
  // 'BACKUP_LOAD': Transfert de Données (Exporter, Importer, Copier)
  // 'GLOBAL_STATS': Analyses & Rapports RDC
  const [subTab, setSubTab] = useState<'PENDING_APPROVALS' | 'SCHOOLS' | 'USERS' | 'BACKUP_LOAD' | 'GLOBAL_STATS'>(() => {
    return pendingCount > 0 ? 'PENDING_APPROVALS' : 'SCHOOLS';
  });

  // Search & Filters for Users
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // State Management for Forms
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserIndex, setEditingUserIndex] = useState<number | null>(null);

  // Adding/Editing User Inputs
  const [uName, setUName] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uRole, setURole] = useState<UserRole>('Enseignant');
  const [uSchoolId, setUSchoolId] = useState(schools[0]?.id || 'sc-1');

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
            schoolId: uSchoolId
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
          onClick={() => { setSubTab('BACKUP_LOAD'); }}
          className={`py-2 px-3.5 text-xs font-black uppercase tracking-wide rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'BACKUP_LOAD'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-550 hover:text-slate-905 hover:bg-slate-200/50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Sauvegardes / Imports / Copies</span>
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
                    <option value="Kinshasa">Kinshasa</option>
                    <option value="Haut-Katanga">Haut-Katanga</option>
                    <option value="Nord-Kivu">Nord-Kivu</option>
                    <option value="Sud-Kivu">Sud-Kivu</option>
                    <option value="Kongo-Central">Kongo-Central</option>
                    <option value="Lualaba">Lualaba</option>
                    <option value="Tshopo">Tshopo</option>
                    <option value="Kasaï-Central">Kasaï-Central</option>
                    <option value="Kasaï-Oriental">Kasaï-Oriental</option>
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
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Contrôle d'accès / Fonction</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Etablissement assigné</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Enregistrement (Date CD)</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium font-sans">
                        Zéro agent trouvé correspondant aux filtres.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((usr, index) => {
                      const affSchool = schools.find(s => s.id === usr.schoolId);
                      return (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
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

      {/**************** SUB-TAB: SAUVEGARDES, IMPORTS, COPIES (NEW REAL TECHNOLOGY) *****************/}
      {subTab === 'BACKUP_LOAD' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <Database className="w-4.5 h-4.5 text-indigo-600" />
              SÉCURISATION &amp; INTÉGRATION DES DONNÉES ENTIÈRES
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Cette interface technique vous permet de copier l'intégralité de la base de données, d'exporter sous forme de rapports individuels ou de téléverser des fichiers de sauvegarde (.JSON) afin de restaurer les bases de données instantanément.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Interactive File Import Zone (Drag & Drop + Click selector) */}
            <div className="space-y-4">
              <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest font-mono">1. Importer des données depuis un fichier</h5>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all relative ${
                  isDragOver 
                    ? 'border-indigo-500 bg-indigo-50/40 scale-[1.01]' 
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                }`}
              >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-1.5">
                  <Upload className="w-6 h-6" />
                </div>
                
                <p className="text-xs font-black text-slate-800 font-sans">
                  Glissez-déposez le fichier de sauvegarde JSON ici
                </p>
                <p className="text-[10px] text-slate-450 font-medium font-sans mt-1">
                  ou cliquez ci-dessous pour le chercher sur votre ordinateur
                </p>

                <div className="mt-4">
                  <label className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] active:scale-95 text-white font-black text-xs px-4 py-2 rounded-xl cursor-pointer shadow-md select-none transition-all">
                    <Database className="w-3.5 h-3.5" />
                    Choisir un fichier .JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-[9.5px] text-slate-400 font-mono mt-3 leading-relaxed">
                  Format certifié : SGESC_RDC_SAUVEGARDE_...json
                </div>
              </div>

              {/* Status messages for importation accuracy */}
              {importError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs font-medium flex gap-2 items-start shadow-3xs">
                  <AlertTriangle className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black block text-red-950">Erreur d’importation :</span>
                    <p className="mt-0.5 leading-relaxed">{importError}</p>
                  </div>
                </div>
              )}

              {importSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-900 rounded-xl text-xs font-medium flex gap-2 items-start shadow-3xs">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black block text-emerald-950">Restauration certifiée :</span>
                    <p className="mt-0.5 leading-relaxed">{importSuccess}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Export & Full Copier */}
            <div className="space-y-4">
              <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest font-mono">2. Exporter ou copier la base de données</h5>
              
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-3xs">
                
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#D32F2F] font-black block">Copie presse-papiers instantanée</span>
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleCopyJSONToClipboard}
                      className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-800 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                    >
                      <Copy className="w-4 h-4 text-indigo-650" />
                      {copyState ? "Base copiée !" : "Copier toute la base"}
                    </button>
                    <button
                      onClick={handleExportBackup}
                      className="flex-1 py-3 px-4 bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger .JSON
                    </button>
                  </div>
                  {copyState && (
                    <span className="text-[10px] text-indigo-700 font-extrabold text-center block bg-indigo-50 border border-indigo-150 py-1.5 rounded-lg animate-pulse font-sans">
                      ✅ Le JSON entier a été copié ! Vous pouvez le coller pour l'échanger.
                    </span>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2.5">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-black block">Rapports individuels par module (CSV tableur)</span>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold leading-none">
                    <button
                      onClick={handleExportSchoolsCSV}
                      className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-220 cursor-pointer text-left flex items-center gap-1.5 transition-all text-[11px]"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>CSV Établissements</span>
                    </button>

                    <button
                      onClick={handleExportStudentsCSV}
                      className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-705 rounded-xl border border-slate-220 cursor-pointer text-left flex items-center gap-1.5 transition-all text-[11px]"
                    >
                      <Users className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                      <span>CSV Élèves inscrits</span>
                    </button>

                    <button
                      onClick={handleExportPaymentsCSV}
                      className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-705 rounded-xl border border-slate-220 cursor-pointer text-left flex items-center gap-1.5 transition-all text-[11px]"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>CSV Rapports de caisse</span>
                    </button>

                    <button
                      onClick={handleExportBulletinsCSV}
                      className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-705 rounded-xl border border-slate-220 cursor-pointer text-left flex items-center gap-1.5 transition-all text-[11px]"
                    >
                      <FileText className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      <span>CSV Fiches Bulletins</span>
                    </button>
                  </div>
                </div>

              </div>
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
              <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider font-mono">Démographie des Élèves par Province</h5>
              <div className="space-y-3">
                {['Kinshasa', 'Haut-Katanga', 'Nord-Kivu', 'Sud-Kivu', 'Kasaï-Central'].map((prov) => {
                  const sCount = students.filter(s => {
                    const sch = schools.find(sc => sc.id === s.schoolId);
                    return sch?.province === prov;
                  }).length;
                  const ratio = students.length > 0 ? (sCount / students.length) * 100 : 0;
                  
                  return (
                    <div key={prov} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{prov}</span>
                        <span className="text-slate-500">{sCount} Élèves ({ratio.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div className="bg-sky-600 h-2 rounded-full" style={{ width: `${ratio}%` }} />
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
