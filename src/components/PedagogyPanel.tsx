import React, { useState, useRef } from 'react';
import { User, Student, School, SchoolClassLevel, SchoolOption, LessonPreparation, ClassJournalEntry } from '../types';
import { SCHOOL_OPTIONS, CLASS_LEVELS, COURSES_BY_OPTION, INITIAL_LESSONS, INITIAL_JOURNAL } from '../constants';
import { CongoFlagIcon, CongoCoatOfArms } from './CongoTheme';
import { 
  ClipboardList, 
  BookOpen, 
  CalendarRange, 
  Plus, 
  CheckCircle, 
  FileUp, 
  FileDown, 
  Printer, 
  Trash, 
  Info, 
  Sparkles, 
  X, 
  ShieldAlert,
  Award,
  Save,
  Trash2,
  Users,
  Search
} from 'lucide-react';

interface PedagogyPanelProps {
  students: Student[];
  currentSchool: School;
  teacherName: string;
  allUsers: User[];
}

export const PedagogyPanel: React.FC<PedagogyPanelProps> = ({
  students,
  currentSchool,
  teacherName,
  allUsers
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'COTATION' | 'PREPARATION' | 'JOURNAL' | 'TEACHERS'>('COTATION');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');

  // Filter school-specific students
  const schoolStudents = students.filter(s => s.schoolId === currentSchool.id);

  // Hidden references for imports
  const cotationInputRef = useRef<HTMLInputElement>(null);
  const prepInputRef = useRef<HTMLInputElement>(null);
  const journalInputRef = useRef<HTMLInputElement>(null);

  // Generic file download helper
  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  };

  // --- SUB-SEC 1: COTATION STATES ---
  const [cotationClass, setCotationClass] = useState<SchoolClassLevel>('4ème Des humanités');
  const [cotationOption, setCotationOption] = useState<SchoolOption>('Latin-Philo');
  const [cotationCourse, setCotationCourse] = useState('Philosophie Générale');
  
  // Custom grading grid inside cotation
  const cotationStudents = schoolStudents.filter(s => s.classLevel === cotationClass && s.option === cotationOption);
  
  const [interrogations, setInterrogations] = useState<Record<string, { i1: number; i2: number; dev: number; ex: number }>>(() => {
    const seed: Record<string, { i1: number; i2: number; dev: number; ex: number }> = {};
    schoolStudents.forEach(s => {
      seed[s.id] = {
        i1: Math.floor(Math.random() * 4) + 6, // /10
        i2: Math.floor(Math.random() * 3) + 7, // /10
        dev: Math.floor(Math.random() * 4) + 6, // /10
        ex: Math.floor(Math.random() * 10) + 26, // /40
      };
    });
    return seed;
  });

  const handleGradeChangeLocal = (studentId: string, field: 'i1' | 'i2' | 'dev' | 'ex', val: string) => {
    const rawNum = Number(val) || 0;
    const maxVal = field === 'ex' ? 40 : 10;
    const clamped = Math.min(maxVal, Math.max(0, rawNum));

    setInterrogations(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId] || { i1: 0, i2: 0, dev: 0, ex: 0 },
        [field]: clamped
      }
    }));
  };

  const [cotationMessage, setCotationMessage] = useState('');

  const handleSaveCotation = () => {
    setCotationMessage('Fiche de cotation pédagogique enregistrée et synchronisée avec le secrétariat.');
    setTimeout(() => setCotationMessage(''), 4000);
  };

  // Cotation Export/Import
  const handleExportCotation = () => {
    const filename = `FICHE_COTATION_${cotationCourse.toUpperCase().replace(/\s+/g, '_')}_${cotationClass.replace(/\s+/g, '')}.json`;
    const payload = JSON.stringify({
      courseName: cotationCourse,
      classLevel: cotationClass,
      option: cotationOption,
      interrogations: interrogations,
      timestamp: new Date().toISOString()
    }, null, 2);
    downloadFile(payload, filename);
  };

  const handleImportCotation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.interrogations) {
          setInterrogations(prev => ({
            ...prev,
            ...data.interrogations
          }));
          setCotationMessage('Fiche de cotation importée et fusionnée avec succès !');
          setTimeout(() => setCotationMessage(''), 4000);
        } else {
          alert('Format non reconnu: aucune fiche de notes valable.');
        }
      } catch (err) {
        alert('Erreur lors du traitement du fichier de cotation JSON.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // --- SUB-SEC 2: PREPARATION STATES ---
  const [lessons, setLessons] = useState<LessonPreparation[]>(INITIAL_LESSONS);
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [selectedPrepView, setSelectedPrepView] = useState<LessonPreparation | null>(null);

  // Prep form states
  const [prepCourse, setPrepCourse] = useState('Philosophie Générale');
  const [prepClass, setPrepClass] = useState<SchoolClassLevel>('4ème Des humanités');
  const [prepOption, setPrepOption] = useState<SchoolOption>('Latin-Philo');
  const [prepSubject, setPrepSubject] = useState('');
  const [prepObjective, setPrepObjective] = useState('');
  const [prepReview, setPrepReview] = useState('');
  const [prepOutline, setPrepOutline] = useState('');
  const [prepExercises, setPrepExercises] = useState('');

  const handleCreatePrep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prepSubject || !prepObjective || !prepOutline) {
      alert('Veuillez remplir les informations obligatoires.');
      return;
    }

    const newPrep: LessonPreparation = {
      id: `les-${Date.now().toString().slice(-4)}`,
      teacherName,
      schoolId: currentSchool.id,
      courseName: prepCourse,
      classLevel: prepClass,
      option: prepOption,
      date: new Date().toISOString().split('T')[0],
      subjectTitle: prepSubject,
      educationalObjective: prepObjective,
      reviewOfPreviousLesson: prepReview,
      lessonOutline: prepOutline,
      exercisesOrEvaluation: prepExercises
    };

    setLessons([newPrep, ...lessons]);
    setShowPrepModal(false);
    // Reset properties
    setPrepSubject('');
    setPrepObjective('');
    setPrepReview('');
    setPrepOutline('');
    setPrepExercises('');
  };

  const handleDeletePrep = (id: string) => {
    if (confirm('Supprimer cette fiche de préparation pédagogique ?')) {
      setLessons(prev => prev.filter(l => l.id !== id));
    }
  };

  // Preps Export/Import
  const handleExportPreparations = () => {
    const filename = `FICHES_PREPARATION_PEDAGOGIQUE_${currentSchool.name.replace(/\s+/g, '_')}.json`;
    downloadFile(JSON.stringify(lessons, null, 2), filename);
  };

  const handleImportPreparations = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const parsedList = Array.isArray(data) ? data : [data];

        parsedList.forEach((prep, idx) => {
          if (!prep.subjectTitle || !prep.educationalObjective) {
            throw new Error(`Structure de leçon non reconnue à l'indice ${idx}`);
          }
        });

        setLessons(prev => {
          const freshPreps = parsedList.filter(p => !prev.some(x => x.id === p.id));
          return [...freshPreps, ...prev];
        });
        alert(`Stockage automatique réussi : ${parsedList.length} préparation(s) pédagogique(s) importée(s) !`);
      } catch (err: any) {
        alert(`Erreur d'import : ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };


  // --- SUB-SEC 3: JOURNAL STATES ---
  const [journals, setJournals] = useState<ClassJournalEntry[]>(INITIAL_JOURNAL);
  const [showJournalModal, setShowJournalModal] = useState(false);

  // Journal form states
  const [jClass, setJClass] = useState<SchoolClassLevel>('4ème Des humanités');
  const [jOption, setJOption] = useState<SchoolOption>('Latin-Philo');
  const [jHourFrom, setJHourFrom] = useState('08:00');
  const [jHourTo, setJHourTo] = useState('09:50');
  const [jSubject, setJSubject] = useState('');
  const [jTaughtTopic, setJTaughtTopic] = useState('');
  const [jAbsents, setJAbsents] = useState(0);
  const [jIncident, setJIncident] = useState('');

  const handleCreateJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jSubject || !jTaughtTopic) {
      alert('Veuillez renseigner le cours et la matière enseignée.');
      return;
    }

    const newEntry: ClassJournalEntry = {
      id: `jou-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      schoolId: currentSchool.id,
      classLevel: jClass,
      option: jOption,
      hourFrom: jHourFrom,
      hourTo: jHourTo,
      subject: jSubject,
      taughtTopic: jTaughtTopic,
      absentStudentCount: jAbsents,
      observedIncident: jIncident
    };

    setJournals([newEntry, ...journals]);
    setShowJournalModal(false);
    // Reset properties
    setJSubject('');
    setJTaughtTopic('');
    setJAbsents(0);
    setJIncident('');
  };

  const handleDeleteJournal = (id: string) => {
    if (confirm('Effacer cette entrée du journal de classe ?')) {
      setJournals(prev => prev.filter(j => j.id !== id));
    }
  };

  // Journal Export/Import
  const handleExportJournal = () => {
    const filename = `JOURNAL_DE_CLASSE_${currentSchool.name.replace(/\s+/g, '_')}.json`;
    downloadFile(JSON.stringify(journals, null, 2), filename);
  };

  const handleImportJournal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const parsedList = Array.isArray(data) ? data : [data];

        parsedList.forEach((j, idx) => {
          if (!j.subject || !j.taughtTopic) {
            throw new Error(`Informations de journal incorrectes à l'indice ${idx}`);
          }
        });

        setJournals(prev => {
          const freshJournals = parsedList.filter(p => !prev.some(x => x.id === p.id));
          return [...freshJournals, ...prev];
        });
        alert(`Mise à jour réussie : ${parsedList.length} heures acquittées dans le journal de classe !`);
      } catch (err: any) {
        alert(`Erreur d'import : ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handlePrintCotation = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-1.5 leading-none">
            📚 Module d'Activités &amp; Documents Pédagogiques
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Espace d'encadrement pédagogique par l'enseignant <span className="font-semibold text-blue-600">{teacherName}</span> pour <span className="font-semibold text-slate-700">{currentSchool.name}</span>.
          </p>
        </div>

        {/* Sub-Tabs selector */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-205 shrink-0 self-start md:self-center flex-wrap gap-1 md:gap-0">
          <button
            onClick={() => setActiveSubTab('COTATION')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'COTATION' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-550 hover:bg-white/50'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Fiches de Cotation
          </button>
          <button
            onClick={() => setActiveSubTab('PREPARATION')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'PREPARATION' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-550 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Préparations de Leçons
          </button>
          <button
            onClick={() => setActiveSubTab('JOURNAL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'JOURNAL' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-550 hover:bg-white/50'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            Journal de Classe
          </button>
          <button
            onClick={() => setActiveSubTab('TEACHERS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'TEACHERS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-550 hover:bg-white/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Corps Enseignant
          </button>
        </div>
      </div>

      {/* --- RENDER 1: FICHE DE COTATION --- */}
      {activeSubTab === 'COTATION' && (
        <div className="space-y-4">
          <input 
            type="file"
            ref={cotationInputRef}
            onChange={handleImportCotation}
            accept=".json"
            className="hidden"
          />
          
          {cotationMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-bold border border-emerald-250">
              ✓ {cotationMessage}
            </div>
          )}

          {/* Configuration selections for cotation */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Classe ciblée</label>
              <select
                value={cotationClass}
                onChange={(e) => setCotationClass(e.target.value as SchoolClassLevel)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold bg-white"
              >
                {CLASS_LEVELS.map(cl => <option key={cl} value={cl}>{cl}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Option ciblée</label>
              <select
                value={cotationOption}
                onChange={(e) => {
                  const opt = e.target.value as SchoolOption;
                  setCotationOption(opt);
                  const firstCourse = COURSES_BY_OPTION[opt]?.[0]?.name || '';
                  setCotationCourse(firstCourse);
                }}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold bg-white"
              >
                {SCHOOL_OPTIONS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cours assigné</label>
              <select
                value={cotationCourse}
                onChange={(e) => setCotationCourse(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold bg-white"
              >
                {(COURSES_BY_OPTION[cotationOption] || []).map(c => (
                  <option key={c.name} value={c.name}>{c.name} (Max: {c.maxPoints})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid spreadsheet of marks */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <span className="font-bold text-xs text-slate-700 uppercase font-mono">
                  📊 Grille de Saisie &bull; {cotationCourse} ({cotationClass})
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Saisissez les interrogations sur /10 et l'examen sur le barème correspondant.</p>
              </div>

              <div className="flex gap-2 w-full md:w-auto shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => cotationInputRef.current?.click()}
                  className="flex-1 md:flex-none border border-slate-300 bg-white hover:bg-slate-50 py-1.5 px-3 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  Importer JSON
                </button>
                <button
                  type="button"
                  onClick={handleExportCotation}
                  className="flex-1 md:flex-none border border-slate-300 bg-white hover:bg-slate-50 py-1.5 px-3 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Exporter JSON
                </button>
                <button
                  type="button"
                  onClick={handlePrintCotation}
                  className="flex-1 md:flex-none border border-slate-300 bg-white hover:bg-slate-50 py-1.5 px-3 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer
                </button>
                <button
                  type="button"
                  onClick={handleSaveCotation}
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold py-1.5 px-4 shadow-sm flex items-center justify-center gap-1 cursor-pointer font-sans"
                >
                  Enregistrer modifications
                </button>
              </div>
            </div>

            {cotationStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold">Aucun élève enregistré en {cotationClass} pour l'Option {cotationOption}.</p>
                <p className="text-[10.5px] text-slate-400">Vous pouvez aller s'enregistrer de nouveaux élèves dans "Inscriptions" ou importer une fiche de cotations.</p>
              </div>
            ) : (
              <div className="overflow-x-auto" id="printable-cotation-sheet">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b">
                      <th className="py-2.5 px-4 w-12 font-mono">MATRICULE</th>
                      <th className="py-2.5 px-4">NOM ET POST-NOM DE L'ÉLÈVE</th>
                      <th className="py-2.5 px-4 text-center">INTERROGATION 1 (/10)</th>
                      <th className="py-2.5 px-4 text-center">INTERROGATION 2 (/10)</th>
                      <th className="py-2.5 px-4 text-center">DEVOIR À DOMICILE (/10)</th>
                      <th className="py-2.5 px-4 text-center">EXAMEN SEMESTRIEL (/40)</th>
                      <th className="py-2.5 px-4 text-center bg-blue-50 text-slate-900">NOTE MOYENNE (/70)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-705">
                    {cotationStudents.map((st) => {
                      const marks = interrogations[st.id] || { i1: 0, i2: 0, dev: 0, ex: 0 };
                      const totalWeighted = marks.i1 + marks.i2 + marks.dev + marks.ex;
                      const averagePercent = Number(((totalWeighted / 70) * 100).toFixed(1));

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                          <td className="py-2.5 px-4 font-mono font-bold text-indigo-850">{st.id.slice(-4)}</td>
                          <td className="py-2.5 px-4 font-extrabold text-slate-800">{st.fullName}</td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={marks.i1}
                              onChange={(e) => handleGradeChangeLocal(st.id, 'i1', e.target.value)}
                              className="w-14 text-center border rounded font-mono font-bold p-1 bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={marks.i2}
                              onChange={(e) => handleGradeChangeLocal(st.id, 'i2', e.target.value)}
                              className="w-14 text-center border rounded font-mono font-bold p-1 bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={marks.dev}
                              onChange={(e) => handleGradeChangeLocal(st.id, 'dev', e.target.value)}
                              className="w-14 text-center border rounded font-mono font-bold p-1 bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="number"
                              min={0}
                              max={40}
                              value={marks.ex}
                              onChange={(e) => handleGradeChangeLocal(st.id, 'ex', e.target.value)}
                              className="w-16 text-center border rounded font-mono font-bold p-1 bg-white"
                            />
                          </td>
                          <td className={`py-2.5 px-4 text-center font-bold bg-blue-50/20 font-mono text-xs ${
                            averagePercent >= 50 ? 'text-emerald-700' : 'text-red-700'
                          }`}>
                            {totalWeighted} pts &bull; {averagePercent}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}


      {/* --- RENDER 2: FICHE DE PRÉPARATION --- */}
      {activeSubTab === 'PREPARATION' && (
        <div className="space-y-4">
          <input 
            type="file"
            ref={prepInputRef}
            onChange={handleImportPreparations}
            accept=".json"
            className="hidden"
          />

          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-sm text-slate-800 block">Fiches de Préparation Pédagogique (Leçons)</span>
              <p className="text-[11px] text-slate-400">Structurez vos objectifs, canevas de matières et heuristiques d’évaluation scolaires.</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => prepInputRef.current?.click()}
                className="border border-slate-350 bg-white hover:bg-slate-50 text-slate-650 rounded-lg text-xs font-bold py-1.5 px-3 flex items-center gap-1 cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5" />
                Importer Fiches (JSON)
              </button>
              <button
                onClick={handleExportPreparations}
                className="border border-slate-350 bg-white hover:bg-slate-50 text-slate-650 rounded-lg text-xs font-bold py-1.5 px-3 flex items-center gap-1 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                Exporter Fiches (JSON)
              </button>
              <button
                onClick={() => setShowPrepModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold py-1.5 px-3.5 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Préparer une Leçon
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((prep) => (
              <div key={prep.id} className="bg-white rounded-xl border border-slate-205 p-5 space-y-3 shadow-xs hover:shadow-md transition-all">
                <div className="flex justify-between items-start border-b pb-2">
                  <div>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold font-mono">
                      {prep.courseName}
                    </span>
                    <h4 className="font-bold text-slate-800 mt-1.5 text-sm">{prep.subjectTitle}</h4>
                    <span className="text-[10px] text-slate-400 block font-sans">Pour la classe de {prep.classLevel} &bull; {prep.option}</span>
                  </div>
                  <button
                    onClick={() => handleDeletePrep(prep.id)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                    title="Supprimer la fiche"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-slate-500 line-clamp-2">
                  <span className="font-bold block text-slate-600">Objectif Opérationnel:</span>
                  {prep.educationalObjective}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-slate-400 font-mono">Date de leçon: {new Date(prep.date).toLocaleDateString('fr-CD')}</span>
                  <button
                    onClick={() => setSelectedPrepView(prep)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer"
                  >
                    Ouvrir la fiche d’art &gt;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* --- RENDER 3: JOURNAL DE CLASSE --- */}
      {activeSubTab === 'JOURNAL' && (
        <div className="space-y-4">
          <input 
            type="file"
            ref={journalInputRef}
            onChange={handleImportJournal}
            accept=".json"
            className="hidden"
          />

          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-sm text-slate-800 block">Journal de Classe Numérique</span>
              <p className="text-[11px] text-slate-400">Consignez les heures, matières réellement dispensées et le suivi des absences.</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => journalInputRef.current?.click()}
                className="border border-slate-350 bg-white hover:bg-slate-50 text-slate-650 rounded-lg text-xs font-bold py-1.5 px-3 flex items-center gap-1 cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5" />
                Importer Journal
              </button>
              <button
                onClick={handleExportJournal}
                className="border border-slate-350 bg-white hover:bg-slate-50 text-slate-650 rounded-lg text-xs font-bold py-1.5 px-3 flex items-center gap-1 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                Exporter Journal
              </button>
              <button
                onClick={() => setShowJournalModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold py-1.5 px-3.5 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Nouvelle Entrée Journal
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase font-mono">
                    <th className="py-2.5 px-4 w-28">Date de séance</th>
                    <th className="py-2.5 px-4">Heures</th>
                    <th className="py-2.5 px-4">Classe &amp; Option</th>
                    <th className="py-2.5 px-4">Matière Enseignée</th>
                    <th className="py-2.5 px-4 text-center font-bold">Nb Absences</th>
                    <th className="py-2.5 px-4">Notes d'incidents / Observations</th>
                    <th className="py-2.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {journals.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50/50 bg-white">
                      <td className="py-2.5 px-4 font-mono font-bold">{new Date(j.date).toLocaleDateString('fr-CD')}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-650">{j.hourFrom} - {j.hourTo}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-bold block">{j.classLevel}</span>
                        <span className="text-[10px] font-mono text-slate-450 block">{j.option}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-slate-800 block text-xs">{j.subject}</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">{j.taughtTopic}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-rose-700">
                        {j.absentStudentCount} élève(s)
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-slate-400 italic">
                        {j.observedIncident || 'R.A.S.'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteJournal(j.id)}
                          className="p-1 px-1.5 text-slate-450 hover:text-red-650 hover:bg-red-50 rounded cursor-pointer"
                          title="Effacer l'entrée"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* --- MODAL FOR LESSON PREPARATION (PREP FORM) --- */}
      {showPrepModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 h-[80vh] flex flex-col">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
              <span className="font-bold text-xs uppercase tracking-wider font-mono">
                📝 Préparer une Leçon d’Art Pédagogique
              </span>
              <button onClick={() => setShowPrepModal(false)} className="text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrep} className="p-6 overflow-y-auto flex-1 space-y-3.5 text-xs text-slate-700">
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 col-span-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Classe</label>
                  <select
                    value={prepClass}
                    onChange={(e) => setPrepClass(e.target.value as SchoolClassLevel)}
                    className="w-full bg-white border rounded p-1"
                  >
                    {CLASS_LEVELS.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Option</label>
                  <select
                    value={prepOption}
                    onChange={(e) => setPrepOption(e.target.value as SchoolOption)}
                    className="w-full bg-white border rounded p-1 shadow-2xs"
                  >
                    {SCHOOL_OPTIONS.map(op => <option key={op.value} value={op.value}>{op.value}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Cours</label>
                  <select
                    value={prepCourse}
                    onChange={(e) => setPrepCourse(e.target.value)}
                    className="w-full bg-white border rounded p-1 border-slate-350"
                  >
                    {(COURSES_BY_OPTION[prepOption] || []).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Titre de la leçon / Sujet du jour *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Le théorème de Pythagore"
                  value={prepSubject}
                  onChange={(e) => setPrepSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Objectif Spécifique / Opérationnel *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex: À la fin de la leçon, l’élève doit être capable de..."
                  value={prepObjective}
                  onChange={(e) => setPrepObjective(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Répétition / Rappels de la leçon précédente</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Rappel de la formule de base et exercices oraux..."
                  value={prepReview}
                  onChange={(e) => setPrepReview(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Matière à enseigner (Décoration / Résumé) *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ex: Introduction, Formule, Démonstrations et figures géométriques principales..."
                  value={prepOutline}
                  onChange={(e) => setPrepOutline(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Application / Évaluation formative</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Faire résoudre l'exercice 4 de la page 12 à 2 élèves..."
                  value={prepExercises}
                  onChange={(e) => setPrepExercises(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPrepModal(false)}
                  className="flex-1 py-2 bg-slate-100 font-sans hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer text-center"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer text-center"
                >
                  Générer la préparation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* --- PREP SIGHTSEEING VIEW MODAL --- */}
      {selectedPrepView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 text-slate-800 flex flex-col h-[80vh]">
            <div className="bg-indigo-755 bg-indigo-900 text-white p-4 flex justify-between items-center shrink-0">
              <span className="font-bold text-xs uppercase tracking-wider font-mono">
                📋 FICHE PRÉPARATOIRE OFFICIELLE
              </span>
              <button onClick={() => setSelectedPrepView(null)} className="text-white hover:text-slate-250 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="prep-sheet-printable" className="p-6 md:p-8 overflow-y-auto flex-1 space-y-4 relative">
              
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.45] pointer-events-none">
                <CongoCoatOfArms className="w-64 h-64" opacityClassName="opacity-100" />
              </div>

              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start relative z-10">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-slate-800 flex items-center gap-1.5 leading-none">
                     MINISTÈRE DE L'EPST DRCONGO
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-500 leading-none">{currentSchool.name}</h4>
                </div>
                <span className="text-[8.5px] font-mono text-slate-400">Date: {new Date(selectedPrepView.date).toLocaleDateString('fr-CD')}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs relative z-10">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-mono leading-none">Enseignant responsable</span>
                  <span className="font-black text-slate-850">{selectedPrepView.teacherName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-mono leading-none">Matière / Branche</span>
                  <span className="font-mono font-black text-indigo-700">{selectedPrepView.courseName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-mono leading-none">Classe assignée</span>
                  <span className="font-semibold">{selectedPrepView.classLevel} &bull; {selectedPrepView.option}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-mono leading-none">Code ID</span>
                  <span className="font-mono text-xs font-bold">{selectedPrepView.id}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-3 relative z-10">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="font-bold text-[10px] text-slate-500 block uppercase tracking-wide mb-1 font-mono">Sujet de la leçon (Titre)</span>
                  <span className="text-[14px] font-black text-slate-800 leading-tight block">{selectedPrepView.subjectTitle}</span>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[10px] text-slate-500 block uppercase tracking-wide font-mono">I. Objectif Spécifique / Opérationnel</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-extrabold">{selectedPrepView.educationalObjective}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[10px] text-slate-500 block uppercase tracking-wide font-mono">II. Heuristique (Rappels de cours)</span>
                  <p className="text-xs text-slate-650 leading-relaxed italic">{selectedPrepView.reviewOfPreviousLesson || 'Aucun rappel particulier enregistré.'}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[10px] text-slate-500 block uppercase tracking-wide font-mono">III. Matière à Enseigner / Développement</span>
                  <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-amber-50/20 p-3 rounded-lg border border-amber-100 font-medium">
                    {selectedPrepView.lessonOutline}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[10px] text-slate-500 block uppercase tracking-wide font-mono">IV. Application de contrôle</span>
                  <p className="text-xs text-slate-755 font-semibold bg-slate-50 p-2.5 rounded border border-slate-150">{selectedPrepView.exercisesOrEvaluation || 'Aucun exercice de contrôle formulé.'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-250 text-[10px] font-mono text-center relative z-10">
                <div>
                  <span className="text-slate-450 block">SIGNATURE ENSEIGNANT</span>
                  <span className="font-bold text-slate-700 block mt-4">{selectedPrepView.teacherName.replace('Prof. ', '')}</span>
                </div>
                <div>
                  <span className="text-slate-450 block">VISA DE LA DIRECTION / INSPECTION</span>
                  <div className="h-6 border-b border-dashed border-slate-300 w-2/3 mx-auto mt-2" />
                </div>
              </div>

            </div>

            <div className="flex justify-end p-4 border-t bg-slate-50 gap-2 shrink-0 rounded-b-2xl">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-1.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer Préparation
              </button>
            </div>
          </div>
        </div>
      )}


      {/* --- JOURNAL DE CLASSE REGISTRATION MODAL --- */}
      {showJournalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 text-slate-700">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wider font-mono">
                📝 Enregistrer un cours au Journal de classe
              </span>
              <button onClick={() => setShowJournalModal(false)} className="text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJournal} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-650">Classe *</label>
                  <select
                    value={jClass}
                    onChange={(e) => setJClass(e.target.value as SchoolClassLevel)}
                    className="w-full bg-white border rounded p-1.5 font-bold"
                  >
                    {CLASS_LEVELS.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-650">Option d’Étude *</label>
                  <select
                    value={jOption}
                    onChange={(e) => setJOption(e.target.value as SchoolOption)}
                    className="w-full bg-white border rounded p-1.5 font-semibold"
                  >
                    {SCHOOL_OPTIONS.map(op => <option key={op.value} value={op.value}>{op.value}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">Heure de début</label>
                  <input
                    type="text"
                    required
                    placeholder="08:00"
                    value={jHourFrom}
                    onChange={(e) => setJHourFrom(e.target.value)}
                    className="w-full border rounded p-1 font-mono text-center font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">Heure de fin</label>
                  <input
                    type="text"
                    required
                    placeholder="09:50"
                    value={jHourTo}
                    onChange={(e) => setJHourTo(e.target.value)}
                    className="w-full border rounded p-1 font-mono text-center font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">Nb Absents</label>
                  <input
                    type="number"
                    min={0}
                    value={jAbsents}
                    onChange={(e) => setJAbsents(Number(e.target.value))}
                    className="w-full border rounded p-1 font-mono text-center font-bold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Branche / Cours dispensé *</label>
                <select
                  value={jSubject}
                  onChange={(e) => setJSubject(e.target.value)}
                  className="w-full bg-white border rounded p-1.5 font-bold"
                >
                  <option value="">-- Sélectionnez le cours --</option>
                  {(COURSES_BY_OPTION[jOption] || []).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Matière exacte enseignée *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Loi d’Ohm et conductibilité des métaux"
                  value={jTaughtTopic}
                  onChange={(e) => setJTaughtTopic(e.target.value)}
                  className="w-full rounded border p-2 font-semibold bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-sans">Incidents / Observations</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Séance animée et bonne écoute, RAS..."
                  value={jIncident}
                  onChange={(e) => setJIncident(e.target.value)}
                  className="w-full rounded border p-2 bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowJournalModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold cursor-pointer text-center"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg font-bold shadow-xs cursor-pointer text-center"
                >
                  Enregistrer l'heure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RENDER 4: LISTE DES ENSEIGNANTS DE L'ÉCOLE --- */}
      {activeSubTab === 'TEACHERS' && (
        <div className="space-y-4 text-left">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-3xs">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-indigo-950 font-sans">
                  <span>👥</span> Annuaire du Corps Enseignant &amp; Personnel de l’Établissement
                </h3>
                <p className="text-[10.5px] text-slate-500 font-medium">
                  Liste exclusive et certifiée des agents, professeurs et comptables rattachés à <span className="font-extrabold text-blue-600">{currentSchool.name}</span>.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-slate-200 w-full sm:max-w-md shrink-0">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, e-mail ou matricule..."
                  value={teacherSearchQuery}
                  onChange={(e) => setTeacherSearchQuery(e.target.value)}
                  className="bg-transparent border-0 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-0 w-full font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider select-none">
                    <th className="py-3 px-4">Identité de l'Enseignant / Agent</th>
                    <th className="py-3 px-4">Matricule National</th>
                    <th className="py-3 px-4">Catégorie / Fonction</th>
                    <th className="py-3 px-4">Numéro de Téléphone</th>
                    <th className="py-3 px-4">Contact Courriel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-sans text-xs">
                  {allUsers
                    .filter(u => u.schoolId === currentSchool.id)
                    .filter(usr => 
                      usr.fullName.toLowerCase().includes(teacherSearchQuery.toLowerCase()) || 
                      (usr.email && usr.email.toLowerCase().includes(teacherSearchQuery.toLowerCase())) ||
                      (usr.matricule && usr.matricule.toLowerCase().includes(teacherSearchQuery.toLowerCase()))
                    )
                    .map((usr, index) => {
                      const fallbackMatricule = usr.matricule || `${7100000 + index}-${usr.role[0] || 'T'}`;
                      return (
                        <tr key={index} className="hover:bg-slate-50/55 transition-colors bg-white">
                          <td className="py-3.5 px-4 font-sans">
                            <span className="font-extrabold text-slate-800 block">{usr.fullName}</span>
                            <span className="text-[9.5px] text-slate-450 block mt-0.5">Enveloppe budgétaire active</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            <span className="bg-slate-100 border border-slate-200 text-blue-700 text-[10.5px] px-2 py-0.5 rounded font-black">
                              {fallbackMatricule}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${
                              usr.role === 'Préfet des études' ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                              usr.role === 'Comptable' ? 'bg-amber-50 text-amber-805 border border-amber-100' :
                              'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              {usr.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-650 font-mono">
                            {usr.phone || 'Non spécifié'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-550">
                            {usr.email || 'Non spécifié'}
                          </td>
                        </tr>
                      );
                    })}
                  {allUsers
                    .filter(u => u.schoolId === currentSchool.id)
                    .filter(usr => 
                      usr.fullName.toLowerCase().includes(teacherSearchQuery.toLowerCase()) || 
                      (usr.email && usr.email.toLowerCase().includes(teacherSearchQuery.toLowerCase())) ||
                      (usr.matricule && usr.matricule.toLowerCase().includes(teacherSearchQuery.toLowerCase()))
                    ).length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium font-sans">
                        Aucun agent de l'établissement ne correspond à la recherche "{teacherSearchQuery}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
