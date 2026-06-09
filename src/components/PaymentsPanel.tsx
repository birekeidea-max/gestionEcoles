import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Payment, Student, School, SchoolClassLevel, SchoolOption } from '../types';
import { downloadElementAsPDF, convertModernColorsToRgb } from '../utils/pdfGenerator';
import { MONTHS, SCHOOL_OPTIONS, CLASS_LEVELS } from '../constants';
import { CongoFlagIcon, CongoCoatOfArms } from './CongoTheme';
import { Landmark, Search, PlusCircle, Check, DollarSign, Calendar, Eye, Bookmark, Printer, RefreshCw, X } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface PaymentsPanelProps {
  payments: Payment[];
  students: Student[];
  currentSchool: School;
  onAddPayment: (payment: Payment) => void;
  onOpenQRScanner: (code: string) => void;
}

export const PaymentsPanel: React.FC<PaymentsPanelProps> = ({
  payments,
  students,
  currentSchool,
  onAddPayment,
  onOpenQRScanner
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [shouldAutoDownload, setShouldAutoDownload] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const showInstantAlert = (text: string) => {
    setAlertMsg(text);
    setTimeout(() => {
      setAlertMsg('');
    }, 4500);
  };

  // Form states
  const [studentNameInput, setStudentNameInput] = useState('');
  const [classLevelInput, setClassLevelInput] = useState<SchoolClassLevel>('7ème EB');
  const [optionInput, setOptionInput] = useState<SchoolOption>('Pédagogie');
  const [amount, setAmount] = useState<number>(15); // Standard monthly fee
  const [currency, setCurrency] = useState<'USD' | 'CDF'>('USD');
  const [month, setMonth] = useState('Septembre');
  const [semester, setSemester] = useState<'1er Semestre' | '2ème Semestre'>('1er Semestre');
  const [formError, setFormError] = useState('');

  // Active school-specific data
  const schoolStudents = students.filter(s => s.schoolId === currentSchool.id);
  const schoolPayments = payments.filter(p => p.schoolId === currentSchool.id);

  // Filter payment list
  const filteredPayments = schoolPayments.filter(p => {
    return p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           p.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!studentNameInput.trim()) {
      setFormError('Veuillez saisir le nom complet de l’élève.');
      return;
    }

    if (amount <= 0) {
      setFormError('Saisissez un montant valide de scolarité.');
      return;
    }

    // Try to link with a registered student under this school if exact name matches
    const matchedStudent = schoolStudents.find(
      s => s.fullName.toLowerCase().trim() === studentNameInput.toLowerCase().trim()
    );

    const studentId = matchedStudent ? matchedStudent.id : `EP-2526-${Math.floor(Math.random() * 90000 + 10000)}`;

    // Create unique receipt metadata
    const recId = `REC-2526-${String(payments.length + 1).padStart(5, '0')}`;
    const refNum = `REF-${currentSchool.name.substring(0, 4).toUpperCase()}-${Math.floor(Math.random() * 90000 + 10000)}`;

    const newPayment: Payment = {
      id: recId,
      studentId: studentId,
      studentName: studentNameInput.trim(),
      classLevel: classLevelInput,
      option: optionInput,
      schoolId: currentSchool.id,
      amount,
      currency,
      month,
      semester,
      date: new Date().toISOString().split('T')[0],
      referenceNumber: refNum
    };

    onAddPayment(newPayment);
    setShowPayModal(false);
    setActiveReceipt(newPayment); // Open generated receipt
    setShouldAutoDownload(true); // Auto download image of receipt!

    // Reset properties
    setStudentNameInput('');
    setClassLevelInput('1ère Année');
    setOptionInput('Pédagogie');
    setAmount(15);
    setCurrency('USD');
  };

  // Find matching registered students for prefill suggestion
  const matchingSuggestions = studentNameInput.trim()
    ? schoolStudents.filter(s => s.fullName.toLowerCase().includes(studentNameInput.toLowerCase()) && s.fullName.toLowerCase() !== studentNameInput.toLowerCase())
    : [];

  const calculateStudentPaidMonths = (studentId: string) => {
    const paidList = schoolPayments.filter(p => p.studentId === studentId);
    return paidList.map(p => p.month);
  };

  const [btStatus, setBtStatus] = useState<'IDLE' | 'SEARCHING' | 'SENDING' | 'SUCCESS'>('IDLE');
  const [btDevice, setBtDevice] = useState('');

  const handleBluetoothSimulation = (receiptId: string) => {
    setBtStatus('SEARCHING');
    setBtDevice('');
    setTimeout(() => {
      setBtStatus('SENDING');
      setBtDevice('Téléphone TECNO Spark du Parent');
      setTimeout(() => {
        setBtStatus('SUCCESS');
      }, 1500);
    }, 1500);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const downloadReceiptAsImage = async () => {
    if (!activeReceipt) return;
    setIsDownloadingImage(true);
    showInstantAlert("Génération du fichier image haute définition... Veuillez patienter.");

    const el = document.getElementById('school-receipt-printable');
    if (!el) {
      showInstantAlert("Erreur: Impossible de trouver l'élément visuel du reçu.");
      setIsDownloadingImage(false);
      return;
    }

    try {
      const originalOverflow = el.style.overflow;
      const originalMaxHeight = el.style.maxHeight;
      const originalHeight = el.style.height;
      el.style.overflow = 'visible';
      el.style.maxHeight = 'none';
      el.style.height = 'auto';

      // Temporarily override window.getComputedStyle to translate modern colors to rgb/rgba
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
          scale: 3, // very sharp high definition details
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
      const filename = `SGESC_RECU_${activeReceipt.id.toUpperCase()}_IMAGE.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      showInstantAlert("Fichier Image brute PNG téléchargé avec succès !");
    } catch (err: any) {
      console.error(err);
      showInstantAlert(`Erreur de téléchargement d'image brute: ${err.message}`);
    } finally {
      setIsDownloadingImage(false);
    }
  };

  useEffect(() => {
    if (activeReceipt && shouldAutoDownload) {
      setShouldAutoDownload(false);
      // Wait for receipt element to be rendered clearly in the DOM
      const timer = setTimeout(async () => {
        setIsDownloadingPdf(true);
        try {
          const pdfName = `SGESC_RECU_${activeReceipt.id.toUpperCase()}.pdf`;
          await downloadElementAsPDF('school-receipt-printable', pdfName);
          showInstantAlert("Reçu officiel PDF généré et téléchargé automatiquement avec succès !");
        } catch (err) {
          console.error("Auto PDF receipt down failed:", err);
          showInstantAlert("Échec du téléchargement automatique du reçu en PDF.");
        } finally {
          setIsDownloadingPdf(false);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeReceipt, shouldAutoDownload]);

  // Convert USD <-> CDF mock rates (1 USD = 2800 CDF for realistic congolese calculations)
  const USD_TO_CDF = 2800;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-1.5 leading-none">
            💵 Comptabilité &bull; Module Frais de Scolarité
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enregistrez les versements mensuels ou trimestriels et générez des reçus de paiement officiels sécurisés par QR-Code.
          </p>
        </div>

        <button
          onClick={() => {
            setShowPayModal(true);
            setFormError('');
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Enregistrer un Versement
        </button>
      </div>

      {/* Financial Health Overview & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par Nom, Matricule ou Numéro de Reçu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Global Financial Metrics */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Total Recouvrable (Mensuel)</span>
            <span className="text-lg font-black font-mono text-emerald-700">
              ${schoolStudents.length * 15}
            </span>
            <span className="text-[8px] text-slate-400 block font-mono">Sur base de $15/élève</span>
          </div>
          <div className="bg-emerald-50 p-2 rounded-xl">
            <Landmark className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-emerald-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold font-mono block">Caisse Réelle Perçue</span>
            <span className="text-xl font-black font-mono">
              ${schoolPayments.reduce((total, p) => {
                const usdVal = p.currency === 'USD' ? p.amount : p.amount / USD_TO_CDF;
                return total + usdVal;
              }, 0).toFixed(1)}
            </span>
            <span className="text-[9px] text-emerald-300 block font-light">Calculé en devises combinées</span>
          </div>
          <RefreshCw className="w-4 h-4 text-emerald-300 shrink-0" />
        </div>
      </div>

      {/* 📊 ANALYSE DE LA CAISSE (PIE CHARTS) */}
      {(() => {
        // 1. Aggregation by Month (USD values)
        const monthlyDataMap: { [key: string]: number } = {};
        schoolPayments.forEach(p => {
          const usdVal = p.currency === 'USD' ? p.amount : p.amount / USD_TO_CDF;
          monthlyDataMap[p.month] = (monthlyDataMap[p.month] || 0) + usdVal;
        });

        const MONTH_ORDER = [
          'Septembre', 'Octobre', 'Novembre', 'Décembre', 
          'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août'
        ];

        const monthlyChartData = Object.keys(monthlyDataMap)
          .map(m => ({
            name: m,
            value: Math.round(monthlyDataMap[m] * 100) / 100
          }))
          .sort((a, b) => MONTH_ORDER.indexOf(a.name) - MONTH_ORDER.indexOf(b.name));

        // 2. Aggregation by Type of Fee / Option
        const optionDataMap: { [key: string]: number } = {};
        schoolPayments.forEach(p => {
          const usdVal = p.currency === 'USD' ? p.amount : p.amount / USD_TO_CDF;
          optionDataMap[p.option] = (optionDataMap[p.option] || 0) + usdVal;
        });

        const optionChartData = Object.keys(optionDataMap).map(opt => ({
          name: opt,
          value: Math.round(optionDataMap[opt] * 100) / 100
        }));

        const CHART_COLORS = [
          '#007FFF', // Congolese sky blue
          '#10B981', // Emerald green
          '#F4D03F', // Congolese yellow
          '#D32F2F', // Congolese red
          '#6366F1', // Indigo
          '#EC4899', // Pink
          '#14B8A6', // Teal
          '#F97316', // Orange
          '#06B6D4', // Cyan
          '#8B5CF6'  // Purple
        ];

        return (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-3xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-2">
                <span>📊</span> Suivi Analytique &bull; Répartition des Recettes
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Visualisation graphique de l'encaissement global par mois d'écolage et par type de frais (par option d'études).
              </p>
            </div>

            {schoolPayments.length === 0 ? (
              <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <span className="text-xl block mb-1">📈</span>
                <p className="text-xs font-bold text-slate-500">Aucun versement n'a encore été enregistré pour alimenter le graphique.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Enregistrez un premier versement pour voir l'analyse graphique s'actualiser.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                {/* Chart 1: Month Split */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-tight flex items-center gap-1.5 border-b border-slate-50 pb-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Statut de Recouvrement par Mois
                  </h4>
                  <div className="h-44 relative w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={monthlyChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {monthlyChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`$${value} USD`, 'Recettes']} 
                          contentStyle={{ background: '#0f172a', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Detailed Legend List with percentages */}
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {monthlyChartData.map((item, index) => {
                      const total = monthlyChartData.reduce((acc, curr) => acc + curr.value, 0) || 1;
                      const percentage = ((item.value / total) * 100).toFixed(1);
                      return (
                        <div key={item.name} className="flex items-center gap-2 bg-slate-50/70 p-1.5 rounded-lg border border-slate-100/60">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                          <div className="min-w-0 flex-1 truncate">
                            <span className="font-extrabold text-slate-800 block truncate text-[10px] leading-tight">{item.name}</span>
                            <span className="text-[9.5px] text-slate-500 font-mono font-bold">${item.value} ({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart 2: Fee/Option Type Split */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-tight flex items-center gap-1.5 border-b border-slate-50 pb-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Encaissements par Option / Filière
                  </h4>
                  <div className="h-44 relative w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={optionChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {optionChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`$${value} USD`, 'Recettes pour l’Option']} 
                          contentStyle={{ background: '#0f172a', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed Legend List with percentages */}
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {optionChartData.map((item, index) => {
                      const total = optionChartData.reduce((acc, curr) => acc + curr.value, 0) || 1;
                      const percentage = ((item.value / total) * 100).toFixed(1);
                      return (
                        <div key={item.name} className="flex items-center gap-2 bg-slate-50/70 p-1.5 rounded-lg border border-slate-100/60">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[(index + 3) % CHART_COLORS.length] }}></span>
                          <div className="min-w-0 flex-1 truncate">
                            <span className="font-extrabold text-slate-800 block truncate text-[10px] leading-tight">{item.name}</span>
                            <span className="text-[9.5px] text-slate-500 font-mono font-bold">${item.value} ({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Ledger lists containing Receipts */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="font-semibold text-slate-700 text-sm">Aucun historique de paiement</h4>
            <p className="text-xs text-slate-400 mt-1">Les versements enregistrés pour l'école figureront sur cette table.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-mono">N° Reçu</th>
                  <th className="py-3 px-4">Élève Payeur</th>
                  <th className="py-3 px-4">Classe &amp; Option</th>
                  <th className="py-3 px-4">Mois / Semestre</th>
                  <th className="py-3 px-4">Montant Versé</th>
                  <th className="py-3 px-4">Date de Versement</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.studentName}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold block">{p.classLevel}</span>
                      <span className="text-[10px] font-mono text-slate-400 block">{p.option}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold bg-blue-50 text-blue-700 border border-blue-150 px-1.5 py-0.5 rounded text-[10px] font-mono inline-block">
                        {p.month}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{p.semester}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-750">
                      {p.currency === 'USD' ? `$${p.amount}` : `${p.amount.toLocaleString('fr-CD')} CDF`}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{new Date(p.date).toLocaleDateString('fr-CD')}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setActiveReceipt(p)}
                        className="py-1 px-2.5 hover:bg-blue-50 text-blue-600 font-semibold border border-blue-100 rounded-lg flex items-center justify-center gap-1 mx-auto text-[11px] cursor-pointer"
                        title="Afficher le reçu officiel"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Reçu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Enregistrer un Versement */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
            <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
              <span className="font-bold text-sm uppercase tracking-wider font-mono flex items-center gap-1.5">
                💵 Caisse d'école RDC &bull; Saisie de Versement
              </span>
              <button onClick={() => setShowPayModal(false)} className="text-white hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-red-50 text-red-750 text-xs rounded-xl border border-red-200">
                  {formError}
                </div>
              )}

              {/* Manual Student Details Saisie */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Nom Complet de l'Élève *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Placide Mwamba Kabongo"
                    value={studentNameInput}
                    onChange={(e) => {
                      setStudentNameInput(e.target.value);
                      setFormError('');
                    }}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold focus:ring-1 focus:ring-emerald-500"
                  />
                  
                  {/* Matching active students recommendations to ease pre-filling */}
                  {matchingSuggestions.length > 0 && (
                    <div className="mt-1.5 bg-sky-50 border border-sky-100 rounded-xl p-2.5 space-y-1">
                      <span className="text-[9.5px] font-bold text-sky-850 block uppercase tracking-wide">
                        💡 Élèves inscrits correspondants (cliquez pour pré-remplir) :
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {matchingSuggestions.slice(0, 3).map(student => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => {
                              setStudentNameInput(student.fullName);
                              setClassLevelInput(student.classLevel);
                              setOptionInput(student.option);
                            }}
                            className="bg-white hover:bg-sky-100 text-[10px] text-sky-850 px-2.5 py-1 rounded-lg border border-sky-200 cursor-pointer font-bold transition-all shadow-2xs"
                          >
                            👤 {student.fullName} ({student.classLevel} &bull; {student.option})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Class & Section Saisie */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-sans">
                      Classe d'Études *
                    </label>
                    <select
                      required
                      value={classLevelInput}
                      onChange={(e) => setClassLevelInput(e.target.value as SchoolClassLevel)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                    >
                      {CLASS_LEVELS.map(cl => (
                        <option key={cl} value={cl}>{cl}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-sans">
                      Section / Option *
                    </label>
                    <select
                      required
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value as SchoolOption)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                    >
                      {SCHOOL_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Month & Semester selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-sans">Semestre Académique</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-1.5 text-xs bg-white font-semibold"
                  >
                    <option value="1er Semestre">1er Semestre</option>
                    <option value="2ème Semestre">2ème Semestre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 font-sans">Mois d'Exercice *</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-1.5 text-xs bg-white font-semibold font-mono"
                  >
                    {MONTHS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount and Currencies */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">Montant et Devise *</label>
                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-2 text-slate-500 text-xs font-bold font-mono">
                      {currency === 'USD' ? '$' : 'CDF'}
                    </span>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 py-1.5 pl-6 pr-3 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="flex rounded-lg border border-slate-350 bg-white overflow-hidden shrink-0">
                    {(['USD', 'CDF'] as const).map(cur => (
                      <button
                        key={cur}
                        type="button"
                        onClick={() => {
                          setCurrency(cur);
                          setAmount(cur === 'USD' ? 15 : 42000); // dynamic auto suggestion trigger
                        }}
                        className={`px-3 py-1 font-mono text-xs font-bold ${
                          currency === cur ? 'bg-emerald-600 text-white' : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>
                </div>
                {currency === 'CDF' && (
                  <p className="text-[10px] text-slate-400 mt-1.5 font-mono text-center">
                    Taux de change indexé: $1.00 USD = {USD_TO_CDF} CDF
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2.5 bg-slate-150 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 shrink-0 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Valider l'Encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Official DRC Invoice/Receipt (Reçu de Paiement) */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-slate-800 border-2 border-slate-200">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                🧾 Formulaire de Reçu de Caisse Officiel
              </span>
              <button onClick={() => { setActiveReceipt(null); setBtStatus('IDLE'); }} className="text-slate-400 hover:text-slate-600 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {alertMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10.5px] font-black rounded-xl text-center animate-pulse">
                {alertMsg}
              </div>
            )}

            {/* Printable official layout */}
            <div id="school-receipt-printable" className="p-6 bg-[#fffbeb] border-2 border-dashed border-amber-300 rounded-xl space-y-4 relative overflow-hidden">
              
              {/* Back watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none">
                <CongoCoatOfArms className="w-56 h-56" opacityClassName="opacity-[0.15]" />
              </div>

              {/* Header block */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-2.5">
                  <CongoCoatOfArms className="w-12 h-12 shrink-0 animate-in fade-in zoom-in-95 duration-200" opacityClassName="opacity-100" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CongoFlagIcon className="w-7 h-4 rounded-xs border border-slate-100" />
                      <span className="text-[10px] font-black uppercase text-slate-800">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
                    </div>
                    <h4 className="text-[13px] font-black uppercase text-blue-700">{currentSchool.name}</h4>
                    <p className="text-[8px] text-slate-500 font-mono">
                      Province: {currentSchool.province} &bull; Ville: {currentSchool.city} &bull; Code: {currentSchool.nationalCode}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-[8px] font-mono tracking-widest text-slate-400 block uppercase">REÇU DE CAISSE SCOLAIRE</span>
                  <span className="font-mono text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 inline-block">{activeReceipt.id}</span>
                </div>
              </div>

              <div className="border-t-2 border-slate-200 py-3 grid grid-cols-2 gap-y-3 gap-x-6 text-xs text-slate-700">
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Élève Bénéficiaire</span>
                  <span className="text-sm font-extrabold text-slate-900 block">{activeReceipt.studentName}</span>
                  <span className="text-[9px] text-slate-400 font-mono">Matricule: {activeReceipt.studentId}</span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Affectation Pédagogique</span>
                  <span className="font-semibold block">{activeReceipt.classLevel}</span>
                  <span className="text-[9px] text-slate-550 bg-slate-100 p-0.5 rounded inline-block truncate max-w-[160px]" title={activeReceipt.option}>Option: {activeReceipt.option}</span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Mois &amp; Semestre</span>
                  <span className="font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-sky-100">{activeReceipt.month}</span>
                  <span className="text-[9px] text-slate-400 block font-light font-mono italic">{activeReceipt.semester}</span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Montant Intégral Versé</span>
                  <span className="text-base font-black text-emerald-700 block font-mono">
                    {activeReceipt.currency === 'USD' ? `$${activeReceipt.amount} USD` : `${activeReceipt.amount.toLocaleString('fr-CD')} CDF`}
                  </span>
                </div>
              </div>

              {/* Audit reference and Security signature */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t-2 border-slate-100 pt-3 gap-3">
                <div className="flex items-center gap-3">
                  {/* Real procedural verification QR layout */}
                  <div
                    onClick={() => onOpenQRScanner(activeReceipt.id)}
                    className="p-1.5 bg-white border-2 border-slate-350 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 flex flex-col items-center gap-1 shrink-0"
                    title="Cliquer pour scanner ce code"
                  >
                    <svg viewBox="0 0 100 100" className="w-14 h-14 text-slate-900" fill="currentColor">
                      {/* Anchor points representing QR layout */}
                      <rect x="0" y="0" width="30" height="30" />
                      <rect x="6" y="6" width="18" height="18" fill="white" />
                      <rect x="10" y="10" width="10" height="10" />

                      <rect x="70" y="0" width="30" height="30" />
                      <rect x="76" y="6" width="18" height="18" fill="white" />
                      <rect x="80" y="10" width="10" height="10" />

                      <rect x="0" y="70" width="30" height="30" />
                      <rect x="6" y="76" width="18" height="18" fill="white" />
                      <rect x="10" y="80" width="10" height="10" />

                      {/* Random data blocks inside safe space */}
                      <rect x="40" y="10" width="12" height="12" />
                      <rect x="45" y="30" width="8" height="15" />
                      <rect x="20" y="45" width="15" height="10" />
                      <rect x="70" y="40" width="15" height="15" />
                      <rect x="85" y="75" width="10" height="10" />
                      <rect x="45" y="75" width="15" height="12" />
                      <polygon points="55,55 68,55 60,68" />
                    </svg>
                    <span className="text-[5px] text-blue-700 font-bold font-mono tracking-widest leading-none">VÉRIFIER QR</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 block font-mono">CODE DE SÉCURITÉ ANTI-FRAUDE</span>
                    <span className="text-[10px] font-mono font-bold block text-slate-800">{activeReceipt.referenceNumber}</span>
                    <span className="text-[9px] text-[#D32F2F] font-semibold block">Sceau de l’Inspecteur Régional RDC</span>
                  </div>
                </div>

                <div className="text-center sm:text-right text-[10px] space-y-1">
                  <span className="text-slate-500 block">Date de validation: {new Date(activeReceipt.date).toLocaleDateString('fr-CD')}</span>
                  <span className="text-slate-400 font-mono block">Signature Comptable: IP-4221</span>
                  <div className="h-6 flex items-center justify-end font-extrabold text-[12px] tracking-tight font-serif italic text-emerald-800 pr-2">
                     Acquitté
                  </div>
                </div>
              </div>

            </div>

            {/* Bluetooth Simulated Status Panel Overlay */}
            {btStatus !== 'IDLE' && (
              <div className="p-3 rounded-xl border text-xs leading-normal animate-fade-in block">
                {btStatus === 'SEARCHING' && (
                  <div className="bg-blue-50 text-blue-800 border-blue-200 p-2.5 rounded-lg flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                      Recherche de canaux Bluetooth à proximité ...
                    </span>
                    <button onClick={() => setBtStatus('IDLE')} className="text-blue-500 text-[10px] uppercase">Annuler</button>
                  </div>
                )}
                {btStatus === 'SENDING' && (
                  <div className="bg-yellow-50 text-yellow-800 border-yellow-200 p-2.5 rounded-lg flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse" />
                      Envoi du fichier RDC_RECU_{activeReceipt.id}.pdf vers "{btDevice}" ...
                    </span>
                    <span className="font-mono text-[10px]">42%</span>
                  </div>
                )}
                {btStatus === 'SUCCESS' && (
                  <div className="bg-emerald-50 text-emerald-800 border-emerald-250 p-2.5 rounded-lg flex items-center justify-between font-extrabold">
                    <span>✓ Reçu de paiement transféré avec succès via RFCOMM !</span>
                    <button onClick={() => setBtStatus('IDLE')} className="text-emerald-700 bg-white/60 hover:bg-white text-[9px] border px-2 py-0.5 rounded uppercase font-bold">Fermer</button>
                  </div>
                )}
              </div>
            )}

            {/* Notice design offline conforme sans partage pour éviter l'embouteillage */}
            <div className="bg-blue-50/55 p-3.5 rounded-xl border border-blue-200/50 space-y-1">
              <span className="text-[9.5px] uppercase font-mono font-bold text-blue-900 flex items-center gap-1.5 leading-none">
                <span>📂</span> Document Conforme Stocké Hors-Ligne
              </span>
              <p className="text-[10.5px] text-slate-655 leading-normal font-semibold">
                Ce reçu réglementaire est sauvegardé localement en toute sécurité. Les options de partage direct sur réseaux sociaux (WhatsApp, Facebook) ont été nettoyées pour éviter d'embouteiller le système. Vous pouvez le télécharger proprement ci-dessous au format PDF (Image) ou l'imprimer directement.
              </p>
            </div>

            {/* Print action bottom */}
            <div className="flex flex-wrap gap-2 justify-end border-t border-slate-100 pt-3 shrink-0">
              <button
                onClick={() => onOpenQRScanner(activeReceipt.id)}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-yellow-600 font-mono text-[10.5px] font-bold rounded-xl border border-slate-220 flex items-center gap-1 cursor-pointer"
              >
                Tester QR Authentification
              </button>
              <button
                onClick={handlePrintReceipt}
                className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer
              </button>

              <button
                onClick={async () => {
                  if (!activeReceipt) return;
                  setIsDownloadingPdf(true);
                  showInstantAlert("Génération du document PDF officiel... Veuillez patienter.");
                  try {
                    await downloadElementAsPDF('school-receipt-printable', `SGESC_RECU_${activeReceipt.id.toUpperCase()}.pdf`);
                    showInstantAlert("Document PDF téléchargé avec succès !");
                  } catch (err) {
                    console.error("PDF download failed:", err);
                    showInstantAlert("Erreur lors de la génération du document PDF.");
                  } finally {
                    setIsDownloadingPdf(false);
                  }
                }}
                disabled={isDownloadingPdf}
                className="py-1.5 px-3.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-800 disabled:opacity-50 text-white text-[10.5px] font-black rounded-xl shadow-md flex items-center gap-1 cursor-pointer font-sans"
                title="Télécharger le reçu d'encaissement officiel en format PDF"
              >
                <span className="text-sm">📥</span>
                {isDownloadingPdf ? "Téléchargement..." : "Télécharger Reçu PDF"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
