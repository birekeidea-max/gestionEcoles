import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Student, School, SchoolClassLevel, SchoolOption } from '../types';
import { downloadStudentCardAsPDF, convertModernColorsToRgb } from '../utils/pdfGenerator';
import { SCHOOL_OPTIONS, CLASS_LEVELS } from '../constants';
import { CongoFlagIcon, CongoCoatOfArms } from './CongoTheme';
import { Search, UserPlus, FileEdit, Trash2, IdCard, Check, X, ShieldAlert, Image, Calendar, MapPin, Sparkles, Filter, Printer } from 'lucide-react';

// Built-in Congolese student sample photos/avatars
const AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
];

interface StudentsPanelProps {
  students: Student[];
  currentSchool: School;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onOpenQRScanner: (code: string) => void;
  payments?: any[];
}

export const StudentsPanel: React.FC<StudentsPanelProps> = ({
  students,
  currentSchool,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onOpenQRScanner,
  payments = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('All');
  const [filterOption, setFilterOption] = useState<string>('All');
  const [selectedVerifyMonth, setSelectedVerifyMonth] = useState<string>('Septembre');
  
  // Modals / Form editing state
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showIdCard, setShowIdCard] = useState<Student | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  // Handle uploading custom photo from the file manager
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Download high quality composite PNG image of the card (front + back side-by-side)
  const downloadCardAsImage = async () => {
    if (!showIdCard) return;
    setIsDownloadingImage(true);
    try {
      const frontEl = document.getElementById('school-card-front');
      const backEl = document.getElementById('school-card-back');
      if (!frontEl || !backEl) {
        alert("Les éléments de la carte ne sont pas prêts pour la génération.");
        return;
      }

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

      let canvasFront;
      let canvasBack;
      try {
        // Generate front elements canvas at high pixel ratio
        canvasFront = await html2canvas(frontEl, {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#0f172a'
        });

        // Generate back elements canvas at high pixel ratio
        canvasBack = await html2canvas(backEl, {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#020617'
        });
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
      }

      // Create main canvas to merge side-by-side
      const combinedCanvas = document.createElement('canvas');
      combinedCanvas.width = canvasFront.width + canvasBack.width + 40; // width + horizontal gap
      combinedCanvas.height = Math.max(canvasFront.height, canvasBack.height) + 40; // height + vertical padding

      const ctx = combinedCanvas.getContext('2d');
      if (ctx) {
        // Aesthetic dark canvas background padding
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

        // Render front
        ctx.drawImage(canvasFront, 20, 20);
        // Render back next to it
        ctx.drawImage(canvasBack, canvasFront.width + 20, 20);

        // Convert canvas image data
        const url = combinedCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `SyGEC_CARTE_${showIdCard.fullName.toUpperCase().replace(/\s+/g, '_')}_${showIdCard.id}.png`;
        link.href = url;
        link.click();
      }
    } catch (err) {
      console.error("Error downloading card as image:", err);
    } finally {
      setIsDownloadingImage(false);
    }
  };

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [birthDate, setBirthDate] = useState('2010-01-01');
  const [address, setAddress] = useState('');
  const [classLevel, setClassLevel] = useState<SchoolClassLevel>('7ème EB');
  const [option, setOption] = useState<SchoolOption>('Pédagogie');
  const [guardianName, setGuardianName] = useState('');
  const [photoUrl, setPhotoUrl] = useState(AVATARS[0]);

  const [formError, setFormError] = useState('');

  // Filter students belonging to the active school
  const schoolStudents = students.filter(s => s.schoolId === currentSchool.id);
  
  const filteredStudents = schoolStudents.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === 'All' || s.classLevel === filterClass;
    const matchesOption = filterOption === 'All' || s.option === filterOption;
    return matchesSearch && matchesClass && matchesOption;
  });

  const openAddForm = () => {
    setSelectedStudent(null);
    setFullName('');
    setGender('M');
    setBirthDate('2010-01-01');
    setAddress('');
    setClassLevel('1ère Année');
    setOption('Pédagogie');
    setGuardianName('');
    setPhotoUrl(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
    setFormError('');
    setIsEditing(true);
  };

  const openEditForm = (student: Student) => {
    setSelectedStudent(student);
    setFullName(student.fullName);
    setGender(student.gender);
    setBirthDate(student.birthDate);
    setAddress(student.address);
    setClassLevel(student.classLevel);
    setOption(student.option);
    setGuardianName(student.guardianName);
    setPhotoUrl(student.photoUrl || AVATARS[0]);
    setFormError('');
    setIsEditing(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !address.trim() || !guardianName.trim()) {
      setFormError('Veuillez remplir tous les champs requis.');
      return;
    }

    if (selectedStudent) {
      // Modify existing student
      onUpdateStudent({
        ...selectedStudent,
        fullName,
        gender,
        birthDate,
        address,
        classLevel,
        option,
        guardianName,
        photoUrl
      });
    } else {
      // Create new student
      const newId = `EP-2026-${String(students.length + 1).padStart(4, '0')}`;
      onAddStudent({
        id: newId,
        fullName,
        gender,
        birthDate,
        address,
        classLevel,
        option,
        schoolId: currentSchool.id,
        guardianName,
        photoUrl,
        enrollmentDate: new Date().toISOString().split('T')[0]
      });
    }

    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet élève de l’établissement scolaire ?')) {
      onDeleteStudent(id);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-1.5 leading-none">
            🗂️ Direction de Scolarité &bull; Gestion des Élèves
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Inscrivez, affectez et générez les cartes électroniques sécurisées de l'établissement <span className="font-semibold text-blue-600">{currentSchool.name}</span>.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Inscrire un Élève
        </button>
      </div>

      {/* Database Filters & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filters Panel */}
        <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par Nom complet ou ID élèves..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-hidden"
              >
                <option value="All">Toutes Classes</option>
                {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-hidden max-w-40 truncate"
              >
                <option value="All">Toutes Options</option>
                {SCHOOL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800">Écolage :</span>
              <select
                value={selectedVerifyMonth}
                onChange={(e) => setSelectedVerifyMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-emerald-800 focus:outline-hidden"
              >
                <option value="Septembre">Septembre</option>
                <option value="Octobre">Octobre</option>
                <option value="Novembre">Novembre</option>
                <option value="Décembre">Décembre</option>
                <option value="Janvier">Janvier</option>
                <option value="Février">Février</option>
                <option value="Mars">Mars</option>
                <option value="Avril">Avril</option>
                <option value="Mai">Mai</option>
                <option value="Juin">Juin</option>
              </select>
            </div>
          </div>
        </div>

        {/* mini stats */}
        <div className="bg-slate-800 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold block">Effectif Actif</span>
            <span className="text-2xl font-black font-mono leading-none">{schoolStudents.length}</span>
            <span className="text-[10px] text-slate-300 block font-light">Élèves enregistrés</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold block">Féminin/Masculin</span>
            <span className="text-sm font-bold font-mono">
              ♀️ {schoolStudents.filter(s => s.gender === 'F').length} / ♂️ {schoolStudents.filter(s => s.gender === 'M').length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Students Grid/Table container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="font-semibold text-slate-700 text-sm">Aucun élève trouvé</h4>
            <p className="text-xs text-slate-400 mt-1">Ajustez vos filtres ou inscrivez un nouvel élève pour débuter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-mono">ID Élève</th>
                  <th className="py-3.5 px-4">Nom Complet</th>
                  <th className="py-3.5 px-4">Sexe</th>
                  <th className="py-3.5 px-4">Classe &amp; Option</th>
                  <th className="py-3.5 px-2">Responsable</th>
                  <th className="py-3.5 px-4 text-center">Statut Écolage ({selectedVerifyMonth})</th>
                  <th className="py-3.5 px-4 text-center">Actions Sécurisées</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-800">{student.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.photoUrl || AVATARS[0]}
                          alt={student.fullName}
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-sm">{student.fullName}</span>
                          <span className="text-[10px] text-slate-400 block font-sans">Né(e) le {new Date(student.birthDate).toLocaleDateString('fr-CD')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-1.5 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                        student.gender === 'M' ? 'bg-sky-50 text-sky-700 border border-sky-150' : 'bg-pink-50 text-pink-700 border border-pink-150'
                      }`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-slate-700 block">{student.classLevel}</span>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100/80 px-1 py-0.5 rounded truncate inline-block max-w-[140px]" title={student.option}>
                          {student.option}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-500 font-medium">
                      {student.guardianName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {(() => {
                        const isPaid = payments.some(
                          (p: any) => p.studentId === student.id && p.month === selectedVerifyMonth
                        );
                        return isPaid ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-250 font-extrabold uppercase text-[9px] px-2.5 py-1 rounded-full cursor-help select-none" title="Versement enregistré et validé par la comptabilité">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Payé {selectedVerifyMonth.substring(0, 4)}.
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-250 font-extrabold uppercase text-[9px] px-2.5 py-1 rounded-full cursor-help select-none" title="Aucun versement enregistré pour ce mois de scolarité">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                            Impayé
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setShowIdCard(student)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-150 flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors"
                          title="Générer Carte d'élève"
                        >
                          <IdCard className="w-3.5 h-3.5" />
                          Carte
                        </button>
                        <button
                          onClick={() => openEditForm(student)}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg border border-yellow-250 cursor-pointer"
                          title="Modifier les données"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-250 cursor-pointer"
                          title="Retirer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Register / Edit Student Form */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <span className="font-bold text-sm uppercase tracking-wider font-mono">
                {selectedStudent ? '✏️ Modifier la Fiche Élève' : '📝 Nouvelle Fiche d\'Inscription'}
              </span>
              <button onClick={() => setIsEditing(false)} className="text-white hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[80vh] space-y-4">
              {formError && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                  {formError}
                </div>
              )}

              {/* Photo Select */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center gap-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Photo d’Identité</span>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                  <div className="relative">
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded-full border-2 border-slate-300 object-cover bg-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <label
                      htmlFor="student-photo-upload"
                      className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-xs border border-white"
                      title="Charger depuis votre appareil"
                    >
                      <span className="text-[10px]">📁</span>
                    </label>
                    <input
                      id="student-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="hidden"
                    />
                  </div>
                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <span className="text-[10px] text-slate-450 block font-sans">Charger photo depuis le gestionnaire de fichiers ou choisir un modèle :</span>
                    
                    <div className="flex flex-wrap gap-1.5 items-center justify-center sm:justify-start pt-1">
                      <button
                        type="button"
                        onClick={() => document.getElementById('student-photo-upload')?.click()}
                        className="py-1 px-2.5 bg-blue-50 border border-blue-200 hover:bg-blue-100/80 text-blue-700 text-[9.5px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        ⚡ Importer Photo
                      </button>
                      
                      {AVATARS.map((avUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoUrl(avUrl)}
                          className={`w-7 h-7 rounded-md overflow-hidden border transition-all ${
                            photoUrl === avUrl ? 'border-blue-600 ring-2 ring-blue-500/15' : 'border-slate-300 opacity-60'
                          }`}
                        >
                          <img src={avUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nom Complet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Placide Mwamba"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sexe *</label>
                  <div className="flex gap-2">
                    {(['M', 'F'] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`flex-1 py-1.5 rounded-lg border font-mono font-bold text-xs ${
                          gender === g ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-300'
                        }`}
                      >
                        {g === 'M' ? 'Masculin (M)' : 'Féminin (F)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Date de Naissance *</label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-1.5 pl-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nom Tuteur / Parent *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Augustin Mwamba"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Affectation Classe *</label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value as SchoolClassLevel)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold bg-white"
                  >
                    {CLASS_LEVELS.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Affectation Option *</label>
                  <select
                    value={option}
                    onChange={(e) => setOption(e.target.value as SchoolOption)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold bg-white max-w-full"
                  >
                    {SCHOOL_OPTIONS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Adresse Résidentielle *</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                  <textarea
                    required
                    rows={2}
                    placeholder="Ex: Avenue Kasa-Vubu 49, Commune de Bandalungwa"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 pl-8 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 bg-slate-150 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 shrink-0 select-none cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer select-none"
                >
                  {selectedStudent ? 'Mettre à jour la fiche' : 'Inscrire définitivement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DRC Electronic Student ID Card */}
      {showIdCard && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-800 text-white">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#007FFF] flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                Aperçu de la Carte d'Élève Numérique
              </span>
              <button onClick={() => setShowIdCard(null)} className="text-slate-400 hover:text-white p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Double-Sided printable layout container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block">
              
              {/* CARD FRONT SIDE */}
              <div id="school-card-front" className="relative w-80 h-48 mx-auto rounded-xl overflow-hidden shadow-xl border border-blue-400/30 flex flex-col justify-between p-3"
                   style={{
                     background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                     boxShadow: 'inset 0 0 40px rgba(0, 127, 255, 0.15)'
                   }}>
                {/* Top decorative stripe resembling DRC flag */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#007FFF] via-[#F4D03F] to-[#D32F2F]" />
                <div className="absolute inset-0 opacity-[0.38] flex items-center justify-center pointer-events-none">
                  <CongoCoatOfArms className="w-40 h-40" opacityClassName="opacity-100" />
                </div>

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-slate-700 pb-1 z-10">
                  <div className="flex items-center gap-1.5 text-left">
                    <CongoCoatOfArms className="w-7 h-7 shrink-0" opacityClassName="opacity-100" />
                    <div>
                      <h5 className="text-[7.5px] font-black uppercase text-yellow-300 leading-none">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</h5>
                      <span className="text-[5.5px] text-slate-300 uppercase tracking-widest leading-none font-bold block mt-0.5">{currentSchool.name}</span>
                    </div>
                  </div>
                  <span className="text-[6px] font-mono text-slate-400 font-bold bg-slate-800 px-1 py-0.5 rounded">EPST</span>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-4 gap-2 py-1.5 z-10 flex-1 items-center">
                  {/* Photo content */}
                  <div className="col-span-1 text-center">
                    <img
                      src={showIdCard.photoUrl || AVATARS[0]}
                      className="w-14 h-16 object-cover rounded-md border border-slate-600 bg-slate-800"
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[5px] text-[#007FFF] font-bold font-mono block mt-1">{showIdCard.id}</span>
                  </div>

                  {/* Student Details */}
                  <div className="col-span-3 text-left space-y-1 pl-1">
                    <div>
                      <span className="text-[5px] text-slate-400 block uppercase font-mono leading-none">Nom complet</span>
                      <span className="text-[10px] font-black font-sans leading-none block text-white">{showIdCard.fullName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 bg-slate-850/60 p-1 rounded-sm border border-slate-800">
                      <div>
                        <span className="text-[4px] text-slate-400 block uppercase leading-none font-mono">Classe</span>
                        <span className="text-[7px] font-bold text-yellow-100">{showIdCard.classLevel}</span>
                      </div>
                      <div>
                        <span className="text-[4px] text-slate-400 block uppercase leading-none font-mono">Genre</span>
                        <span className="text-[7px] font-bold text-yellow-100">{showIdCard.gender}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[5px] text-slate-400 block uppercase font-mono leading-none">Option</span>
                      <span className="text-[8px] font-semibold text-cyan-400 uppercase tracking-tight">{showIdCard.option}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer with verification key */}
                <div className="flex items-center justify-between border-t border-slate-700/60 pt-1 z-10">
                  <span className="text-[5px] text-slate-500 font-mono tracking-wider">ANNÉE SCOLAIRE: 2025-2026</span>
                  
                  {/* Miniature verify anchor */}
                  <div className="flex items-center gap-1 cursor-pointer bg-slate-800 px-1 py-0.5 rounded border border-slate-700 hover:bg-slate-700/80"
                       onClick={() => onOpenQRScanner(showIdCard.id)}>
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-yellow-400 shrink-0" fill="currentColor">
                      <rect x="2" y="2" width="6" height="6" />
                      <rect x="16" y="2" width="6" height="6" />
                      <rect x="2" y="16" width="6" height="6" />
                      <rect x="9" y="10" width="6" height="4" />
                    </svg>
                    <span className="text-[5px] font-black tracking-wide font-mono text-emerald-400">QR SÉCURISÉ EPST</span>
                  </div>
                </div>
              </div>

              {/* CARD BACK SIDE */}
              <div id="school-card-back" className="relative w-80 h-48 mx-auto rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between p-3 text-[6px] text-slate-300">
                <div className="border-b border-slate-800 pb-1 flex justify-between">
                  <span className="font-bold text-[7px] uppercase tracking-wider text-yellow-300">RÈGLEMENT DE SCOLAIRE RDC</span>
                  <span className="text-[5px] text-slate-500 font-mono">Code National: {currentSchool.nationalCode}</span>
                </div>

                <div className="space-y-1 pt-1.5 flex-1 leading-normal text-slate-400">
                  <p>1. Cette carte scolaire électronique est strictement personnelle et infalsifiable.</p>
                  <p>2. Elle doit être présentée à l'entrée de l'établissement et lors de chaque session des examens d'État.</p>
                  <p>3. En cas de perte, veuillez contacter immédiatement la préfecture de l'école {currentSchool.name}.</p>
                  <p>4. La falsification de ce document officiel est punie par la loi congolaise.</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div className="text-center font-mono">
                    <span className="block text-[4px] text-slate-500">SIGNATIVE DE L'ÉLÈVE</span>
                    <div className="h-6 flex items-center justify-center font-sans tracking-tight text-white/50 text-[8px] italic pr-2">
                       {showIdCard.fullName.split(' ')[0]}
                    </div>
                  </div>
                  <div className="text-center font-mono relative">
                    <span className="block text-[4px] text-slate-500">LE PRÉFET DES ÉTUDES</span>
                    <div className="text-[7px] text-white font-bold leading-tight mt-1">{currentSchool.rectorName.replace('Monsieur le Préfet ', '').replace('Révérend Père Préfet ', '').replace('Sœur Préfète ', '')}</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-blue-500/10 italic rounded-full border border-blue-500/20 px-1 select-none pointer-events-none rotate-12 uppercase font-black">
                      Sceau Boboto
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Print & Verify helpers */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-800 justify-end">
              <span className="text-[10px] text-slate-400 self-center font-mono">
                Référence QR-Verif: <span className="text-blue-400">{showIdCard.id}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onOpenQRScanner(showIdCard.id)}
                  className="flex-1 sm:flex-none py-1.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 font-mono text-[11px] font-bold rounded-lg border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                    <rect x="2" y="2" width="6" height="6" />
                    <rect x="16" y="2" width="6" height="6" />
                    <rect x="2" y="16" width="6" height="6" />
                    <rect x="9" y="10" width="6" height="4" />
                  </svg>
                  Tester QR Éducateur
                </button>
                <button
                  onClick={handlePrintCard}
                  className="flex-1 sm:flex-none py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg shadow-md flex items-center justify-center gap-1 cursor-pointer font-sans"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer
                </button>
                <button
                  onClick={async () => {
                    if (!showIdCard) return;
                    setIsDownloadingPdf(true);
                    try {
                      await downloadStudentCardAsPDF('school-card-front', 'school-card-back', `SyGEC_CARTE_${showIdCard.id.toUpperCase()}.pdf`);
                    } catch (err) {
                      console.error("PDF download failed:", err);
                    } finally {
                      setIsDownloadingPdf(false);
                    }
                  }}
                  disabled={isDownloadingPdf}
                  className="flex-1 sm:flex-none py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg shadow-md flex items-center justify-center gap-1 cursor-pointer font-sans"
                >
                  <span className="text-xs">💾</span>
                  {isDownloadingPdf ? "PDF en cours..." : "Télécharger PDF"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
