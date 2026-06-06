import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { SCHOOL_OPTIONS, INITIAL_SCHOOLS, PROVINCES_26 } from '../constants';
import { CongoCoatOfArms, CongoFlagIcon } from './CongoTheme';
import secSchoolHero from '../assets/images/sec_school_hero_1780578435655.png';
import { 
  ShieldCheck, 
  School, 
  Smartphone, 
  ArrowRight, 
  UserCheck, 
  Plus, 
  ListFilter, 
  Landmark, 
  Mail, 
  Lock, 
  ShieldAlert, 
  Chrome, 
  X, 
  ChevronRight 
} from 'lucide-react';

interface AuthScreenProps {
  schools: any[];
  onAddSchool: (school: any) => void;
  onLogin: (userData: { fullName: string; phone: string; role: UserRole; schoolId: string; email?: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ schools, onAddSchool, onLogin }) => {
  const [authMode, setAuthMode] = useState<'STANDARD' | 'SUPER_ADMIN'>('STANDARD');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // 2-Step Verification (2FA) states
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [generated2FACode, setGenerated2FACode] = useState('');
  const [input2FACode, setInput2FACode] = useState('');
  const [pendingLoginUserData, setPendingLoginUserData] = useState<any | null>(null);
  const [twoFAError, setTwoFAError] = useState('');

  // 2-Step Secret DB Password states
  const [isVerifyingDatabaseSecret, setIsVerifyingDatabaseSecret] = useState(false);
  const [databaseSecretInput, setDatabaseSecretInput] = useState('');
  const [databaseSecretError, setDatabaseSecretError] = useState('');

  const trigger2FA = (userData: { fullName: string; phone: string; role: UserRole; schoolId: string; email?: string }) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGenerated2FACode(code);
    setPendingLoginUserData(userData);
    setIsVerifying2FA(true);
    setTwoFAError('');
    setInput2FACode('');
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (input2FACode.replace(/\s+/g, '') === generated2FACode) {
      onLogin(pendingLoginUserData);
      setIsVerifying2FA(false);
    } else {
      setTwoFAError("❌ Code de vérification incorrect. Saisissez le code temporaire actif d'habilitation.");
    }
  };

  // State variables for normal registration and login forms

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [matricule, setMatricule] = useState('');
  const [agentPasswordInput, setAgentPasswordInput] = useState('012000');
  const [axe, setAxe] = useState('Kinshasa-Est');
  const [role, setRole] = useState<UserRole>('Préfet des études');
  const approvedSchools = schools.filter(s => s.isApproved !== false);
  const [selectedSchoolId, setSelectedSchoolId] = useState(approvedSchools[0]?.id || schools[0]?.id || 'sc-1');
  const [isRegisteringSchool, setIsRegisteringSchool] = useState(false);

  // Specific inputs for refined teacher authentication (EPST directives)
  const [teacherMatriculeEtablissement, setTeacherMatriculeEtablissement] = useState('');
  const [teacherNomComplet, setTeacherNomComplet] = useState('');
  const [teacherPostNom, setTeacherPostNom] = useState('');
  const [teacherMatriculePersonnel, setTeacherMatriculePersonnel] = useState('');
  const [teacherNomEtablissement, setTeacherNomEtablissement] = useState('');

  // Hidden state to reveal Central Admin Portal
  const [showCentralPortal, setShowCentralPortal] = useState(false);
  const [flagClicks, setFlagClicks] = useState(0);
  const flagClickTimeoutRef = useRef<any>(null);

  const handleFlagClick = () => {
    if (flagClickTimeoutRef.current) {
      clearTimeout(flagClickTimeoutRef.current);
    }
    
    // Reset consecutive clicks if there is no click for 4 seconds
    flagClickTimeoutRef.current = setTimeout(() => {
      setFlagClicks(0);
    }, 4000);

    const nextClicks = flagClicks + 1;
    if (nextClicks >= 10) {
      setFlagClicks(0);
      setShowCentralPortal(true);
      setAuthMode('SUPER_ADMIN');
      setAdminEmail('');
      setAdminPassword('');
      setDatabaseSecretInput('');
    } else {
      setFlagClicks(nextClicks);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('superadmin') === 'true') {
      setShowCentralPortal(true);
      setAuthMode('SUPER_ADMIN');
    }
  }, []);

  // Auto-fill configuration with "Remember Me"
  const [rememberMe, setRememberMe] = useState(true);
  const [schoolInputMode, setSchoolInputMode] = useState<'SELECT' | 'MANUAL'>('SELECT');
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [customSchoolProvince, setCustomSchoolProvince] = useState('Kinshasa');
  const [customSchoolNationalCode, setCustomSchoolNationalCode] = useState('');

  // New school registration form
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolProvince, setNewSchoolProvince] = useState('Kinshasa');
  const [newSchoolCity, setNewSchoolCity] = useState('');
  const [newSchoolCommune, setNewSchoolCommune] = useState('');
  const [newSchoolNationalCode, setNewSchoolNationalCode] = useState('');
  const [newSchoolRector, setNewSchoolRector] = useState('');
  const [newSchoolRectorPhone, setNewSchoolRectorPhone] = useState('');
  const [newSchoolRectorEmail, setNewSchoolRectorEmail] = useState('');
  const [newSchoolRectorPassword, setNewSchoolRectorPassword] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]); // Selected sections / options
  const [registrationSuccess, setRegistrationSuccess] = useState<any | null>(null);

  const [formError, setFormError] = useState('');

  // Load remembered credentials from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sgesc_remembered_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.matricule) setMatricule(parsed.matricule);
        if (parsed.axe) setAxe(parsed.axe);
        if (parsed.role) setRole(parsed.role);
        if (parsed.schoolInputMode) setSchoolInputMode(parsed.schoolInputMode);
        if (parsed.customSchoolName) setCustomSchoolName(parsed.customSchoolName);
        if (parsed.customSchoolProvince) setCustomSchoolProvince(parsed.customSchoolProvince);
        if (parsed.customSchoolNationalCode) setCustomSchoolNationalCode(parsed.customSchoolNationalCode);
        if (parsed.selectedSchoolId) setSelectedSchoolId(parsed.selectedSchoolId);
        if (parsed.agentPasswordInput) setAgentPasswordInput(parsed.agentPasswordInput);
      } catch (e) {
        console.error("Erreur lors de la recouverte des identifiants mémorisés:", e);
      }
    }
  }, []);

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (
      !newSchoolName || 
      !newSchoolCommune || 
      !newSchoolNationalCode || 
      !newSchoolRector || 
      !newSchoolRectorPhone || 
      !newSchoolRectorEmail || 
      !newSchoolRectorPassword
    ) {
      setFormError('Veuillez remplir tous les champs obligatoires du formulaire.');
      return;
    }

    if (selectedOptions.length === 0) {
      setFormError('Veuillez sélectionner au moins une option/section organisée par votre école.');
      return;
    }

    const newSchoolObj = {
      id: `sc-custom-${Date.now()}`,
      name: newSchoolName,
      province: newSchoolProvince,
      city: newSchoolCity || newSchoolProvince,
      commune: newSchoolCommune,
      nationalCode: newSchoolNationalCode,
      rectorName: newSchoolRector,
      isApproved: true,
      rectorPhone: newSchoolRectorPhone,
      rectorEmail: newSchoolRectorEmail,
      rectorPassword: newSchoolRectorPassword,
      optionsOrganized: selectedOptions
    };

    onAddSchool(newSchoolObj);
    
    // Automatically login and redirect into the system
    onLogin({
      fullName: newSchoolRector,
      phone: newSchoolRectorPhone,
      role: 'Préfet des études',
      schoolId: newSchoolObj.id,
      email: newSchoolRectorEmail,
      matricule: `PREF-${Math.floor(10000 + Math.random() * 90000)}`,
      password: newSchoolRectorPassword
    });

    // Reset fields
    setNewSchoolName('');
    setNewSchoolCommune('');
    setNewSchoolNationalCode('');
    setNewSchoolRector('');
    setNewSchoolRectorPhone('');
    setNewSchoolRectorEmail('');
    setNewSchoolRectorPassword('');
    setSelectedOptions([]);
    setIsRegisteringSchool(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (authMode === 'SUPER_ADMIN') {
      const emailNorm = adminEmail.trim().toLowerCase();
      const passNorm = adminPassword.trim();
      if ((emailNorm !== 'birekeidea@gmail.com' && emailNorm !== 'birekeidea@gmail') || passNorm !== 'b012000b') {
        setFormError('Mot de passe ou email d’administrateur général invalide.');
        return;
      }
      setPendingLoginUserData({
        fullName: 'Bireke Idea',
        phone: 'Administrateur Général',
        role: 'Administrateur',
        schoolId: 'all',
        email: 'birekeidea@gmail.com'
      });
      setIsVerifyingDatabaseSecret(true);
      setDatabaseSecretInput('');
      setDatabaseSecretError('');
      return;
    }

    if (role === 'Enseignant') {
      if (!teacherNomComplet.trim()) {
        setFormError('Veuillez indiquer votre nom complet.');
        return;
      }
      if (!teacherPostNom.trim()) {
        setFormError('Veuillez indiquer votre post-nom d’enseignant.');
        return;
      }
      if (!teacherNomEtablissement.trim()) {
        setFormError('Veuillez renseigner le nom complet de l’établissement scolaire de rattachement.');
        return;
      }
      if (!teacherMatriculeEtablissement.trim()) {
        setFormError('Le Matricule d’établissement d’enseignement secondaire (Code National RDC) est requis.');
        return;
      }

      // Automatically identify the teacher's school by national code or school name
      const matchedSchool = schools.find(s => 
        (s.nationalCode && s.nationalCode.toLowerCase().trim() === teacherMatriculeEtablissement.toLowerCase().trim()) ||
        (s.name && s.name.toLowerCase().trim() === teacherNomEtablissement.toLowerCase().trim())
      );

      if (!matchedSchool) {
        setFormError("⚠️ Votre école n'est pas répertoriée dans la base centrale. Prière de demander au chef d'établissement (Préfet) de créer/enregistrer l'espace école d'abord.");
        return;
      }

      // All schools are auto-approved for testing and immediate work!

      // Successful redirections for teachers
      onLogin({
        fullName: `${teacherNomComplet.trim()} ${teacherPostNom.trim()}`,
        phone: '+243 Enseignant',
        role: 'Enseignant',
        schoolId: matchedSchool.id,
        email: `${teacherNomComplet.toLowerCase().replace(/\s+/g, '')}@ecole.cd`,
        matricule: teacherMatriculePersonnel.trim() || 'Nouvelle recrue (Sans matricule d’agent)',
        password: '012000'
      });
      return;
    }

    if (role === 'Inspecteur' || role === 'Coordinateur' || role === 'Directeur') {
      if (!fullName.trim()) {
        setFormError('Veuillez indiquer votre nom complet d’autorité administrative.');
        return;
      }
      if (!phone.trim()) {
        setFormError('Un numéro de téléphone congolais valide est requis.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setFormError('Une adresse email professionnelle est requise.');
        return;
      }
      if (!matricule.trim()) {
        setFormError('Le Numéro Matricule national d’autorité étatique est obligatoire.');
        return;
      }
      if ((role === 'Inspecteur' || role === 'Coordinateur') && !axe.trim()) {
        setFormError('Veuillez préciser l’Axe Territorial ou Éducatif de contrôle.');
        return;
      }

      if (rememberMe) {
        const credentialsToSave = {
          fullName,
          phone,
          email,
          matricule,
          axe,
          role,
          selectedSchoolId: 'all'
        };
        localStorage.setItem('sgesc_remembered_credentials', JSON.stringify(credentialsToSave));
      }

      onLogin({
        fullName,
        phone,
        role,
        schoolId: 'all',
        email,
        matricule,
        axe: (role === 'Inspecteur' || role === 'Coordinateur') ? axe : undefined,
        password: 'Agent012000'
      });
      return;
    }

    if (!fullName.trim()) {
      setFormError('Veuillez indiquer votre nom complet.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Un numéro de téléphone congolais valide est requis.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Une adresse email valide est requise pour pouvoir se connecter.');
      return;
    }
    if (!matricule.trim()) {
      setFormError('Le Numéro Matricule ou Identifiant Unique de l’agent RDC est obligatoire.');
      return;
    }

    let targetSchoolId = selectedSchoolId;

    if (schoolInputMode === 'MANUAL') {
      const trimmedSchoolName = customSchoolName.trim();
      if (!trimmedSchoolName) {
        setFormError("Veuillez renseigner le nom de votre établissement scolaire.");
        return;
      }

      // Check if existing
      const matchedSchool = schools.find(s => s.name.toLowerCase() === trimmedSchoolName.toLowerCase());
      if (matchedSchool) {
        targetSchoolId = matchedSchool.id;
      } else {
        // Create as approved
        const newId = `sc-manual-${Date.now()}`;
        const newSchoolObj = {
          id: newId,
          name: trimmedSchoolName,
          province: customSchoolProvince,
          city: customSchoolProvince,
          commune: 'Commune Scolaire',
          nationalCode: customSchoolNationalCode || `ND-${Math.floor(100000 + Math.random() * 900000)}`,
          rectorName: fullName,
          rectorEmail: email,
          rectorPhone: phone,
          isApproved: true, // Auto approved!
          optionsOrganized: ['Pédagogie', 'Latin-Philo'] // Default sections
        };
        onAddSchool(newSchoolObj);
        targetSchoolId = newId;
      }
    } else {
      if (!selectedSchoolId) {
        setFormError('Veuillez sélectionner votre établissement de rattachement.');
        return;
      }
    }

    const targetSchool = schools.find(s => s.id === targetSchoolId) || { name: customSchoolName, isApproved: true };
    // Auto approved!

    // Save with Remember Me
    if (rememberMe) {
      const credentialsToSave = {
        fullName,
        phone,
        email,
        matricule,
        role,
        selectedSchoolId: targetSchoolId,
        schoolInputMode,
        customSchoolName,
        customSchoolProvince,
        customSchoolNationalCode,
        agentPasswordInput
      };
      localStorage.setItem('sgesc_remembered_credentials', JSON.stringify(credentialsToSave));
    } else {
      localStorage.removeItem('sgesc_remembered_credentials');
    }

    onLogin({
      fullName,
      phone,
      role,
      schoolId: targetSchoolId,
      email,
      matricule,
      password: agentPasswordInput
    });
  };

  if (isVerifyingDatabaseSecret) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-950 z-[200] font-sans animate-in fade-in duration-200">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#D32F2F] via-yellow-400 to-[#D32F2F] animate-pulse" />
        <div className="absolute top-10 left-10 hidden lg:block opacity-10">
          <CongoCoatOfArms className="w-56 h-56" opacityClassName="opacity-80" />
        </div>
        
        <div className="max-w-md w-full space-y-6 bg-slate-900 border border-slate-800 text-white px-8 py-10 rounded-3xl shadow-2xl relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <span className="relative inline-block p-4 bg-red-650/10 border border-red-500/20 rounded-full text-red-500 animate-pulse">
              <ShieldCheck className="w-12 h-12 text-[#D32F2F]" />
              <span className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-infinite"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xs font-mono tracking-widest text-[#F4D03F] block uppercase font-black">
              🛡️ DOUBLE AUTHENTIFICATION DE LA BASE CENTRALE
            </h2>
            <h3 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight">
              Mot de passe Secret de la Base Centrale
            </h3>
            <p className="text-[11.5px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              Pour des raisons absolues d'intégrité de la Base de Données Administrative Centrale, veuillez saisir le mot de passe secret pour déconnecter ou débloquer le répertoire national.
            </p>
          </div>

          {databaseSecretError && (
            <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-900/30 text-center font-bold">
              {databaseSecretError}
            </p>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            if (databaseSecretInput.trim() === '012000') {
              onLogin(pendingLoginUserData);
              setIsVerifyingDatabaseSecret(false);
            } else {
              setDatabaseSecretError("❌ Mot de passe secret de la base de données centrale invalide.");
            }
          }} className="space-y-4">
            <div>
              <label className="block text-[11px] text-slate-400 uppercase tracking-widest font-mono text-left mb-1.5 font-bold">
                Entrez le mot de passe secret de la base *
              </label>
              <input
                type="password"
                required
                placeholder="Saisissez la clé d'accès sécurisée"
                value={databaseSecretInput}
                onChange={(e) => setDatabaseSecretInput(e.target.value)}
                className="w-full text-center text-xl font-mono tracking-widest font-extrabold rounded-xl border border-slate-700 bg-slate-950 py-3 text-red-500 shadow-inner focus:outline-hidden focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] placeholder-slate-700"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsVerifyingDatabaseSecret(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer transition-colors uppercase font-mono"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all uppercase font-mono tracking-wider animate-pulse"
              >
                Accéder à la Base
              </button>
            </div>
          </form>

          <p className="text-[9.5px] text-slate-500 font-mono">
            ID de session administrative : RDC-CENTRAL-DB-SECURE
          </p>
        </div>
      </div>
    );
  }

  if (isVerifying2FA) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-900 z-[200] font-sans">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-sky-500 via-yellow-400 to-red-500 animate-pulse" />
        <div className="absolute top-10 left-10 hidden lg:block opacity-10">
          <CongoCoatOfArms className="w-56 h-56" opacityClassName="opacity-80" />
        </div>
        
        <div className="max-w-md w-full space-y-6 bg-slate-950/90 text-white px-8 py-10 rounded-3xl border border-slate-800 shadow-2xl relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <span className="relative inline-block p-4 bg-red-650/10 border border-red-500/20 rounded-full text-red-500">
              <ShieldCheck className="w-12 h-12" />
              <span className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-infinite"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xs font-mono tracking-widest text-[#F4D03F] block uppercase font-black">
              🔐 CONTRÔLE DE SÛRETÉ NATIONAL EPST-RDC
            </h2>
            <h3 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight">
              Vérification en Deux Étapes
            </h3>
            <p className="text-[11px] text-slate-450 max-w-xs mx-auto leading-relaxed">
              Pour des raisons d'intégrité de la Base de Données Administrative Centrale, un code d'habilitation temporaire a été envoyé à votre périphérique sécurisé.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-left space-y-3">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider font-mono">
                📟 Code de Session Temporaire (Device Bridge Code)
              </span>
              <span className="text-3xl font-extrabold text-yellow-400 block tracking-widest font-mono select-all mt-1 bg-yellow-400/5 py-1.5 rounded-lg border border-yellow-400/10">
                {generated2FACode.slice(0,3)} {generated2FACode.slice(3)}
              </span>
            </div>
          </div>

          {twoFAError && (
            <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-900/30 text-center font-semibold">
              {twoFAError}
            </p>
          )}

          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div>
              <label className="block text-[11px] text-slate-400 uppercase tracking-widest font-mono text-left mb-1.5 font-bold">
                Entrez le code de vérification à 6 chiffres
              </label>
              <input
                type="text"
                maxLength={7}
                required
                placeholder="000 000"
                value={input2FACode}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length > 3) {
                    val = val.slice(0, 3) + ' ' + val.slice(3, 6);
                  }
                  setInput2FACode(val);
                }}
                className="w-full text-center text-2xl font-mono tracking-widest font-extrabold rounded-xl border border-slate-800 bg-slate-900 py-3 text-yellow-400 shadow-inner focus:outline-hidden focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 placeholder-slate-705"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsVerifying2FA(false)}
                className="flex-1 py-3 bg-slate-905 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold border border-slate-850 cursor-pointer transition-colors uppercase font-mono"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all uppercase font-mono tracking-wider"
              >
                Autoriser l'Accès
              </button>
            </div>
          </form>

          <p className="text-[10px] text-slate-500 font-mono">
            ID d'accès cryptographique : RDC-{generated2FACode}-SEC
          </p>
        </div>
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-100 z-10 font-sans">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-sky-500 via-yellow-400 to-red-500" />
        <div className="absolute top-10 left-10 hidden lg:block opacity-30">
          <CongoCoatOfArms className="w-56 h-56" opacityClassName="opacity-80" />
        </div>
        <div className="max-w-md w-full space-y-6 bg-white px-8 py-10 rounded-3xl border border-slate-250 shadow-2xl text-center relative z-10">
          <div className="flex justify-center">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm animate-bounce">
              <ShieldCheck className="w-12 h-12" />
            </div>
          </div>
          <h2 className="text-lg font-black text-slate-850 uppercase tracking-tight">DEMANDE TRANSMISE AVEC SUCCÈS</h2>
          
          <div className="text-left bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-3 text-slate-700">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none font-mono">Établissement proposé</span>
              <span className="font-extrabold text-[#D32F2F] text-sm block mt-0.5">{registrationSuccess.schoolName}</span>
              <span className="text-[10px] opacity-75 block font-mono">Code National EPST: {registrationSuccess.nationalCode}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none font-mono">Nom du Préfet Requérant</span>
              <span className="font-extrabold text-slate-800 block mt-0.5">{registrationSuccess.rectorName}</span>
              <span className="text-[10px] opacity-75 block font-mono">Téléphone: {registrationSuccess.phone}</span>
            </div>
            <div className="border-t border-slate-200 pt-2.5 mt-2 text-slate-650 leading-relaxed space-y-1">
              <span className="font-black text-blue-700 block text-[11px]">🛡️ Notification de validation d’intégrité :</span>
              <span className="block text-[11.5px] leading-relaxed">Conformément aux protocoles de sécurité SGESC, la création d'un espace d'apprentissage nécessite une homologation directe du Chef d'Antenne National habilité.</span>
              <span className="block text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 mt-2 text-center">🔐 Votre établissement sera accessible pour vous et vos enseignants dès validation de l'administrateur !</span>
            </div>
          </div>

          <button
            onClick={() => {
              setRegistrationSuccess(null);
              setIsRegisteringSchool(false);
            }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all uppercase"
          >
            Fermer le guichet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-100 z-10 font-sans">
      {/* Absolute high-fidelity watermark elements */}
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-sky-500 via-yellow-400 to-red-500" />
      
      <div className="absolute top-10 left-10 hidden lg:block opacity-40">
        <CongoCoatOfArms className="w-56 h-56" opacityClassName="opacity-80" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-md px-8 py-10 rounded-3xl border border-slate-200/50 shadow-2xl relative z-10">
        
        {/* Header containing Emblem details */}
        <div className="text-center relative">
          <div className="flex justify-center mb-3">
            <span 
              onClick={handleFlagClick} 
              className="relative inline-block select-none cursor-pointer hover:scale-110 active:scale-95 transition-all duration-150 group" 
              title="Drapeau RDC (Double-Clique ou Clics Successifs)"
            >
              <CongoFlagIcon className="w-16 h-10 shadow-md border border-slate-100 rounded-sm group-hover:shadow-lg transition-shadow" />
              {flagClicks > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-mono text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white animate-pulse">
                  {flagClicks}
                </span>
              )}
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-800">
            SGESC <span className="text-sky-600">RDC</span>
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 tracking-wider font-semibold uppercase">
            Système de Gestion des Écoles Secondaires
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            République Démocratique du Congo &bull; Plateforme Nationale Unifiée (26 Provinces)
          </p>

          {/* Majestic Ministerial School Education Banner */}
          <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200/80 shadow-3xs aspect-video bg-slate-50 relative group">
            <img 
              src={secSchoolHero} 
              alt="EPST RDC Éducation et Excellence Académique"
              className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-[1.01]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent p-3 text-left">
              <span className="text-[8.5px] uppercase tracking-wider font-mono font-black text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/30">
                PROJET NATIONAL D'ÉCONOMIE ENSEIGNANTE
              </span>
              <span className="block text-white font-extrabold text-[11px] mt-1 leading-tight">
                Direction d'Habilitation • Administration Scolaire Centrale EPST
              </span>
            </div>
          </div>
        </div>

        {formError && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-200 shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {!isRegisteringSchool ? (
          <div className="space-y-5 mt-6">
            {/* TABS SELECTOR FOR ACCESS METHOD (ONLY visible if unlocked/via secret URL parameter) */}
            {showCentralPortal && (
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-3xs animate-fade-in">
                <button
                  type="button"
                  onClick={() => { setAuthMode('STANDARD'); setFormError(''); }}
                  className={`flex-1 py-1.5 text-center text-[10.5px] font-black rounded-lg transition-all cursor-pointer ${
                    authMode === 'STANDARD'
                      ? 'bg-white text-slate-800 shadow-xs border border-slate-300/40'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  🏫 Portail des Écoles (Agent / Préfet)
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('SUPER_ADMIN'); setFormError(''); }}
                  className={`flex-1 py-1.5 text-center text-[10.5px] font-black rounded-lg transition-all cursor-pointer ${
                    authMode === 'SUPER_ADMIN'
                      ? 'bg-slate-950 text-amber-400 font-extrabold shadow-sm border border-amber-500/20'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  🔑 Admin de la Base
                </button>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              {authMode === 'STANDARD' ? (
                <div className="space-y-4">
                  {/* DIRECTIVE ULTRA-SÉCURITAIRE RDC */}
                  <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-[11px] leading-relaxed text-slate-700 font-semibold space-y-1.5 shadow-3xs">
                    <div className="flex items-center gap-1.5 text-rose-840 uppercase font-black tracking-wide text-[10.5px]">
                      <ShieldAlert className="w-4 h-4 text-[#D32F2F] shrink-0" />
                      <span>🔒 Contrôle National Centralisé</span>
                    </div>
                    <p className="font-medium text-slate-650">
                      Conformément aux directives de l'EPST, <b>aucun enseignant ni préfet</b> ne peut accéder à la base de données de son école aussi longtemps que sa demande de création de compte n'a pas été formellement validée par l'<b>Administration du Contrôle Centralisé de l'EPST</b>.
                    </p>
                  </div>

                  {/* User Roles inside DRC school (Rendered at top of login form) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-sky-500" />
                      Rôle de Fonction d’Accès
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {([
                        'Préfet des études',
                        'Comptable',
                        'Enseignant',
                        'Directeur',
                        'Inspecteur',
                        'Coordinateur'
                      ] as UserRole[]).map((r) => (
                        <button
                          type="button"
                          key={r}
                          onClick={() => setRole(r)}
                          className={`text-left text-xs px-3 py-2 rounded-lg border font-medium transition-all ${
                            role === r
                              ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-xs ring-1 ring-sky-500/10'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {role === 'Enseignant' ? (
                    /* REFINED TEACHER FORM FIELDS (EPST Directive) */
                    <div className="space-y-4 p-4 bg-sky-50/50 border border-sky-100 rounded-2xl">
                      <div className="flex items-center gap-1.5 text-blue-800 font-extrabold text-[12px] uppercase tracking-wide">
                        <span>🧑‍🏫 Identification Enseignant Homologué</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Nom de l'Enseignant *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Kabose Augustin"
                          value={teacherNomComplet}
                          onChange={(e) => setTeacherNomComplet(e.target.value)}
                          className="w-full rounded-xl border border-slate-305 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-505 focus:outline-hidden text-slate-800 font-medium bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Post-nom de l'Enseignant *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Augustin"
                          value={teacherPostNom}
                          onChange={(e) => setTeacherPostNom(e.target.value)}
                          className="w-full rounded-xl border border-slate-305 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-505 focus:outline-hidden text-slate-800 font-medium bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Matricule personnel d'agent de l'État
                          <span className="text-[10px] text-slate-400 font-normal lowercase pl-1">(facultatif si nouvelle recrue)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: AG-2384729"
                          value={teacherMatriculePersonnel}
                          onChange={(e) => setTeacherMatriculePersonnel(e.target.value)}
                          className="w-full rounded-xl border border-slate-305 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-505 focus:outline-hidden text-slate-800 font-mono bg-white"
                        />
                      </div>

                      <div className="border-t border-slate-200/60 my-4 pt-3 space-y-3">
                        <span className="text-[10.5px] font-black text-slate-500 uppercase tracking-widest block font-mono">Rattachement Établissement Scolaire</span>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                            Nom de l'établissement d'enseignement secondaire *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Institut de Goma"
                            value={teacherNomEtablissement}
                            onChange={(e) => setTeacherNomEtablissement(e.target.value)}
                            className="w-full rounded-xl border border-slate-305 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-505 focus:outline-hidden text-slate-800 font-medium bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                            Matricule de l'établissement d'enseignement secondaire *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Code National (Ex: 01019284)"
                            value={teacherMatriculeEtablissement}
                            onChange={(e) => setTeacherMatriculeEtablissement(e.target.value)}
                            className="w-full rounded-xl border border-slate-305 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-505 focus:outline-hidden text-slate-800 font-mono bg-white font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (role === 'Inspecteur' || role === 'Coordinateur' || role === 'Directeur') ? (
                    /* INSPECTORS & COORDINATORS & DIRECTEURS */
                    <div className="space-y-4 p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-left">
                      <div className="flex items-center gap-1.5 text-amber-800 font-extrabold text-[12px] uppercase tracking-wide">
                        <span>🛡️ Espace Autorité d'Inspection de l'EPST</span>
                      </div>

                      <p className="text-[11px] leading-relaxed text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                        {role === 'Directeur' 
                          ? "Le programme national de l'école primaire n'étant pas encore actif sur la plateforme, l'accès vous est fourni en mode visiteur simple du réseau."
                          : "Vous devez renseigner votre matricule et l'axe de supervision de votre juridiction pour pouvoir auditer la plateforme scolaire."
                        }
                      </p>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Nom Complet *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Paul Kabongo"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full rounded-xl border border-slate-305 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-505 focus:outline-hidden text-slate-800 font-medium bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Numéro de Téléphone *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="Ex: +243 812 345 678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-slate-305 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-505 focus:outline-hidden text-slate-800 font-medium bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Adresse Email Personnel / Pro *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="Ex: paul.kabongo@epst.cd"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-305 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-505 focus:outline-hidden text-slate-805 font-medium bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Numéro Matricule ou d’Agent de l’État *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: MAT-INSP-2849"
                          value={matricule}
                          onChange={(e) => setMatricule(e.target.value)}
                          className="w-full rounded-xl border border-slate-305 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-505 focus:outline-hidden text-slate-805 font-bold bg-white font-mono"
                        />
                      </div>

                      {(role === 'Inspecteur' || role === 'Coordinateur') && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                            Axe Territorial de Supervision *
                          </label>
                          <select
                            value={axe}
                            onChange={(e) => setAxe(e.target.value)}
                            className="w-full text-slate-800 rounded-xl border border-slate-300 py-2.5 px-3 text-xs bg-white font-bold"
                          >
                            <option value="Axe Kinshasa-Est">Axe Kinshasa-Est</option>
                            <option value="Axe Kinshasa-Ouest">Axe Kinshasa-Ouest</option>
                            <option value="Axe Goma-Ville &amp; Territoires">Axe Goma-Ville &amp; Territoires</option>
                            <option value="Axe Lubumbashi-Sud">Axe Lubumbashi-Sud</option>
                            <option value="Axe Kivu &amp; Maniema">Axe Kivu &amp; Maniema</option>
                            <option value="Axe Kongo-Central">Axe Kongo-Central</option>
                            <option value="Axe Kisangani-Province">Axe Kisangani-Province</option>
                            <option value="Axe Kasaï National">Axe Kasaï National</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* RECTORS, DIRECTEURS, ET COMPTABLES FORM FIELDS */
                    <>
                      {/* Espace Établissement selection toggle */}
                      <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700 uppercase tracking-wide block">Établissement</span>
                          <div className="flex bg-slate-200 p-0.5 rounded-lg border border-slate-250 font-mono">
                            <button
                              type="button"
                              onClick={() => setSchoolInputMode('SELECT')}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all ${
                                schoolInputMode === 'SELECT'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              Choisir
                            </button>
                            <button
                              type="button"
                              onClick={() => setSchoolInputMode('MANUAL')}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all ${
                                schoolInputMode === 'MANUAL'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              Taper
                            </button>
                          </div>
                        </div>

                        {schoolInputMode === 'SELECT' ? (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label htmlFor="school-select" className="text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                                <School className="w-3.5 h-3.5 text-sky-500" />
                                Répertoire école homologuée
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsRegisteringSchool(true)}
                                className="text-[9px] font-extrabold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 bg-sky-50 px-1.5 py-0.5 rounded cursor-pointer transition-all border border-sky-100"
                              >
                                + Nouvelle École
                              </button>
                            </div>
                            <select
                              id="school-select"
                              value={selectedSchoolId}
                              onChange={(e) => setSelectedSchoolId(e.target.value)}
                              className="block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs shadow-xs focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500/20 font-medium text-slate-800"
                            >
                              {approvedSchools.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.province})
                                </option>
                              ))}
                            </select>
                            <p className="text-[9px] text-indigo-500 mt-1 font-mono">
                              Code Unique EPST: {approvedSchools.find(s => s.id === selectedSchoolId)?.nationalCode || 'Non certifié'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 text-xs">
                            <div>
                              <label htmlFor="manual-school" className="block text-[10px] font-bold text-slate-655 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <School className="w-3 h-3 text-sky-500" />
                                Nom complet de l'établissement *
                              </label>
                              <input
                                id="manual-school"
                                type="text"
                                required
                                placeholder="Ex: Institut Saint Thomas"
                                value={customSchoolName}
                                onChange={(e) => setCustomSchoolName(e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 py-1.5 px-2.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-sky-500/30 font-medium text-slate-800"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Province RDC</span>
                                <select
                                  value={customSchoolProvince}
                                  onChange={(e) => setCustomSchoolProvince(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 py-1 px-1.5 text-[10px] bg-white text-slate-800 font-semibold"
                                >
                                  {PROVINCES_26.map(prov => (
                                    <option key={prov} value={prov}>{prov}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <span className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Code National (facultatif)</span>
                                <input
                                  type="text"
                                  placeholder="Ex: 01019284"
                                  value={customSchoolNationalCode}
                                  onChange={(e) => setCustomSchoolNationalCode(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 py-1 px-1.5 text-[10px] font-mono font-medium"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Full Name */}
                      <div>
                        <label htmlFor="fullname" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                          Nom Complet *
                        </label>
                        <div className="relative">
                          <input
                            id="fullname"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ex: Abbé Pierre Lwamba"
                            className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 font-medium text-slate-800"
                          />
                        </div>
                      </div>

                      {/* Telephone */}
                      <div>
                        <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          Numéro de Téléphone *
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ex: +243 812 345 678"
                          className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 font-mono tracking-wider font-medium text-slate-800"
                        />
                      </div>

                      {/* Email (conform EPST requirement) */}
                      <div>
                        <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          Adresse Email Personnel *
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Ex: prefet@ecole.cd"
                          className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 font-medium text-slate-800"
                        />
                      </div>

                      {/* Matricule Identifiant (conforme directives) */}
                      <div>
                        <label htmlFor="matricule" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <span className="text-sky-600 font-extrabold text-[12px] leading-none">🆔</span>
                          Numéro Matricule / Identifiant d’Agent *
                        </label>
                        <input
                          id="matricule"
                          type="text"
                          required
                          value={matricule}
                          onChange={(e) => setMatricule(e.target.value)}
                          placeholder="Ex: MT-2637284 ou ID-9284"
                          className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 font-mono tracking-wider font-semibold text-slate-800"
                        />
                        <p className="text-[9.5px] text-slate-400 mt-1">
                          Saisissez votre numéro matricule officiel d'établissement homologué EPST.
                        </p>
                      </div>

                      {/* Mot de passe de Connexion d'Agent */}
                      <div>
                        <label htmlFor="agent-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <span className="text-sky-600 font-extrabold text-[12px] leading-none">🔑</span>
                          Mot de passe de Connexion d'Agent *
                        </label>
                        <input
                          id="agent-password"
                          type="password"
                          required
                          value={agentPasswordInput}
                          onChange={(e) => setAgentPasswordInput(e.target.value)}
                          placeholder="Définissez votre clé d'accès (Sera visible sur le Portail d'Admin)"
                          className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm shadow-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 text-slate-800 font-medium"
                        />
                        <p className="text-[9.5px] text-slate-400 mt-1">
                          Saisissez le mot de passe (clé d'accès) visible par la direction informatique nationale.
                        </p>
                      </div>
                    </>
                  )}

                  {/* SE SOUVENIR DE MOI Checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer shrink-0 mt-0.5"
                    />
                    <label htmlFor="remember-me" className="text-[11px] leading-snug font-bold text-slate-655 select-none cursor-pointer">
                      <b>Se souvenir de moi</b> (mémorise mes identifiants pour les prochaines connexions)
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-red-50/75 text-red-953 border border-red-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold block text-red-700">🛡️ Authentification d'Intégrité Administrative</span>
                    <span className="text-[10.5px] leading-relaxed text-slate-600 block">Saisissez l'adresse mail administrative nationale pour valider la clé d'inspection de la plateforme.</span>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label htmlFor="admin-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Adresse Email Administrateur *
                    </label>
                    <input
                      id="admin-email"
                      type="email"
                      required
                      placeholder="Entrez votre adresse e-mail homologuée"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs shadow-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 font-medium text-slate-850"
                    />
                  </div>
 
                  {/* Password Input */}
                  <div>
                    <label htmlFor="admin-pass" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Mot de passe de Sécurité Général *
                    </label>
                    <input
                      id="admin-pass"
                      type="password"
                      required
                      placeholder="Mot de passe confidentiel"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-305 py-2.5 px-3.5 text-xs shadow-sm focus:border-sky-505 focus:outline-hidden focus:ring-2 focus:ring-sky-505/20 font-medium text-slate-850"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => { setAuthMode('STANDARD'); setFormError(''); }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold block mx-auto py-1 text-center hover:underline cursor-pointer"
                  >
                    Retour à l'identification standard
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg cursor-pointer transition-all duration-200"
              >
                <span className="absolute right-0 top-0 bottom-0 pr-4 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-sky-200 group-hover:translate-x-1 transition-transform" />
                </span>
                Entrer dans l'espace sécurisé
              </button>
            </form>

          </div>
        ) : (
          /* Register New School Form */
          <form className="mt-8 space-y-4" onSubmit={handleCreateSchool}>
            <div className="flex border-b border-slate-100 pb-3 justify-between items-center">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1 uppercase tracking-wide">
                <Landmark className="w-4 h-4 text-emerald-500" />
                Enregistrer une école rdc
              </span>
              <button
                type="button"
                onClick={() => setIsRegisteringSchool(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Retour
              </button>
            </div>

            <div className="space-y-3.5 max-h-[45vh] overflow-y-auto px-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Nom complet de l'établissement *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Institut Saint Thomas"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs focus:ring-emerald-500 focus:ring-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Province RDC</label>
                  <select
                    value={newSchoolProvince}
                    onChange={(e) => {
                      setNewSchoolProvince(e.target.value);
                      setNewSchoolCity(e.target.value);
                    }}
                    className="w-full rounded-lg border border-slate-300 py-2 px-2 text-xs"
                  >
                    {PROVINCES_26.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Ville &bull; District</label>
                  <input
                    type="text"
                    placeholder="Ex: Goma, Lubumbashi"
                    value={newSchoolCity}
                    onChange={(e) => setNewSchoolCity(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Commune *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lingwala, Karisimbi"
                    value={newSchoolCommune}
                    onChange={(e) => setNewSchoolCommune(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Code National EPST *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 01019284"
                    value={newSchoolNationalCode}
                    onChange={(e) => setNewSchoolNationalCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-3 space-y-3">
                <span className="text-xs font-black text-emerald-700 block uppercase tracking-wider">Identifiants Personnels du Préfet</span>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Nom du Préfet des études *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Monsieur l'Abbé Pierre Lwamba"
                    value={newSchoolRector}
                    onChange={(e) => setNewSchoolRector(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Téléphone du Préfet *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+243 812 345 678"
                      value={newSchoolRectorPhone}
                      onChange={(e) => setNewSchoolRectorPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Email Administratif *</label>
                    <input
                      type="email"
                      required
                      placeholder="prefet@ecole.cd"
                      value={newSchoolRectorEmail}
                      onChange={(e) => setNewSchoolRectorEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Mot de passe de Connexion *</label>
                  <input
                    type="password"
                    required
                    placeholder="Définissez votre mot de passe"
                    value={newSchoolRectorPassword}
                    onChange={(e) => setNewSchoolRectorPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs"
                  />
                </div>

                {/* Options/Sections organisées par l'école */}
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-bold text-slate-700 block uppercase mb-1">
                    Options / Sections organisées *
                  </span>
                  <p className="text-[9.5px] text-slate-450 block mb-2 leading-tight">
                    Sélectionnez les filières organisées par votre école pour vous attribuer les documents pédagogiques appropriés.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-1 text-xs max-h-36 overflow-y-auto p-2 border border-slate-200 bg-slate-50/50 rounded-xl">
                    {SCHOOL_OPTIONS.map((opt) => {
                      const isChecked = selectedOptions.includes(opt.value);
                      return (
                        <label 
                          key={opt.value} 
                          className={`flex items-start gap-1 px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            isChecked 
                              ? 'bg-emerald-50/80 border-emerald-350 text-emerald-800' 
                              : 'bg-white border-slate-205 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedOptions(prev => prev.filter(o => o !== opt.value));
                              } else {
                                setSelectedOptions(prev => [...prev, opt.value]);
                              }
                            }}
                            className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-550 mt-0.5 shrink-0"
                          />
                          <div>
                            <span className="font-extrabold block text-[10px] leading-tight">{opt.value}</span>
                            <span className="text-[8px] opacity-75 block leading-none">{opt.label}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  
                  <div className="flex gap-2 mt-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedOptions(SCHOOL_OPTIONS.map(o => o.value))}
                      className="text-[9px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 hover:bg-sky-100 transition-colors"
                    >
                      Tout cocher
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOptions([])}
                      className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-200 transition-colors"
                    >
                      Désélectionner tout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRegisteringSchool(false)}
                className="flex-1 py-2 bg-slate-100 font-sans hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-600 shrink-0"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Créer l'espace scolaire
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-5 text-[10px] text-slate-400 border-t border-slate-100 pt-4 flex items-center justify-center gap-1 font-semibold select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Accès crypté &bull; Données d’écoles sécurisées RDC EPST</span>
        </div>
      </div>
    </div>
  );
};
