import React, { useState } from 'react';
import { ShieldCheck, QrCode, ClipboardCheck, AlertTriangle, Building, User, Award, CheckCircle2 } from 'lucide-react';

interface ScanResult {
  code: string;
  type: 'BULLETIN' | 'RECETTE' | 'CARTE_IDENTITE';
  schoolName: string;
  studentName: string;
  classLevel: string;
  option: string;
  amountOrGradeSummary: string;
  timestamp: string;
  status: 'VALIDE' | 'COMPROMIS' | 'NON_CONFORME';
}

export const QRScannerMock: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}> = ({ isOpen, onClose, initialCode = '' }) => {
  const [typedCode, setTypedCode] = useState(initialCode);
  const [verificationResult, setVerificationResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleVerify = (codeToVerify: string) => {
    setErrorMsg('');
    const code = codeToVerify.trim().toUpperCase();

    if (!code) {
      setErrorMsg('Veuillez saisir un code de vérification.');
      return;
    }

    // Direct simulated lookup of QR payload signatures
    if (code.includes('REF-BOBO') || code.includes('0001') || code.includes('BUL-001')) {
      setVerificationResult({
        code,
        type: 'BULLETIN',
        schoolName: 'Collège Boboto',
        studentName: 'Placide Mwamba Kabongo',
        classLevel: '6ème Année',
        option: 'Latin-Philo',
        amountOrGradeSummary: 'Moyenne Générale: 84.5% - Classement: 1er de la classe (Conduite: Excellente)',
        timestamp: new Date().toLocaleDateString('fr-CD') + ' 10:45',
        status: 'VALIDE'
      });
    } else if (code.includes('LYC') || code.includes('0002') || code.includes('BUL-002')) {
      setVerificationResult({
        code,
        type: 'BULLETIN',
        schoolName: 'Lycée Kabambare',
        studentName: 'Grâce Kabange Ilunga',
        classLevel: '6ème Année',
        option: 'Biochimie',
        amountOrGradeSummary: 'Moyenne Générale: 87.2% - Classement: 1ère de la classe (Conduite: Très Bonne)',
        timestamp: new Date().toLocaleDateString('fr-CD') + ' 11:22',
        status: 'VALIDE'
      });
    } else if (code.includes('GOMA') || code.includes('0003')) {
      setVerificationResult({
        code,
        type: 'RECETTE',
        schoolName: 'Institut de Goma',
        studentName: 'Amani Mulumba Nzaji',
        classLevel: '5ème Année',
        option: 'Math-Physique',
        amountOrGradeSummary: 'Montant Vérifié: 120,000 CDF - Frais Connexes d’Octobre',
        timestamp: new Date().toLocaleDateString('fr-CD') + ' 08:33',
        status: 'VALIDE'
      });
    } else if (code.startsWith('EP-')) {
      // General match
      setVerificationResult({
        code,
        type: 'CARTE_IDENTITE',
        schoolName: 'Établissement Enregistré',
        studentName: 'Élève RDC Enregistré',
        classLevel: 'Classe Confirmée',
        option: 'Option Certifiée',
        amountOrGradeSummary: 'Carte d’élève validée par le Ministère de l’éducation nationale.',
        timestamp: new Date().toLocaleDateString('fr-CD') + ' - Certifié',
        status: 'VALIDE'
      });
    } else if (code.startsWith('REC-')) {
      setVerificationResult({
        code,
        type: 'RECETTE',
        schoolName: 'Établissement Scolaire Conforme',
        studentName: 'Élève Affilié',
        classLevel: 'Classe Enregistrée',
        option: 'Option Scolaire',
        amountOrGradeSummary: 'Scolarité Validée - Reçu authentique numérisé',
        timestamp: new Date().toLocaleDateString('fr-CD') + ' - Reçu Certifié',
        status: 'VALIDE'
      });
    } else {
      // Return beautiful, realistic random mock validation on unrecognized formatted codes
      setVerificationResult({
        code,
        type: 'CARTE_IDENTITE',
        schoolName: 'Système National RDC',
        studentName: 'Document Authentifié de l’Élève',
        classLevel: 'Données vérifiées ',
        option: 'Option Éducative',
        amountOrGradeSummary: `Fichier de Secours #${Math.floor(Math.random() * 90000 + 10000)} - Conforme`,
        timestamp: new Date().toLocaleDateString('fr-CD') + ' - Saisie Manuelle',
        status: 'VALIDE'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-blue-100 flex flex-col">
        {/* Header with National flag accent */}
        <div className="bg-gradient-to-r from-[#007FFF] via-[#F4D03F] to-[#D32F2F] p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 animate-bounce" />
            <div>
              <h3 className="font-sans font-bold text-sm tracking-wider uppercase text-yellow-100">MINISTÈRE DE L'EPST</h3>
              <p className="text-[10px] text-sky-100 font-mono">Service National Anti-Fraude de Vérification des Documents</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 bg-white/20 hover:bg-white/40 text-xs font-bold font-mono px-2.5">
            Fermer
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-4">
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Pour contrer les falsifications de documents scolaires en République Démocratique du Congo, chaque bulletin, reçu de paiement ou carte scolaire possède un QR Code unique contenant sa signature numérique du Ministère de l'EPST.
          </p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Saisissez ou collez la référence de vérification / Code QR :
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <QrCode className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ex: REF-BOBO-98231, EP-2026-0001, etc."
                  value={typedCode}
                  onChange={(e) => setTypedCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-300 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => handleVerify(typedCode)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-sans font-medium text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4" />
                Vérifier
              </button>
            </div>
            {errorMsg && <p className="text-red-500 text-xs mt-1.5 font-sans font-medium">{errorMsg}</p>}
          </div>

          {verificationResult && (
            <div className="rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <span className="text-xs font-bold text-emerald-800 tracking-wider font-mono bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  SIGNATURE SÉCURISÉE VALIDÉE
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{verificationResult.timestamp}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-mono">Type de document</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1 font-mono">
                    {verificationResult.type === 'BULLETIN' && '📋 Bulletin Scolaire Officiel'}
                    {verificationResult.type === 'RECETTE' && '💵 Reçu de Paiement Certifié'}
                    {verificationResult.type === 'CARTE_IDENTITE' && '🪪 Carte Électronique d’Élève'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-mono">Code Référence</span>
                  <span className="font-mono font-bold text-blue-800">{verificationResult.code}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[9px] uppercase font-mono">Établissement</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {verificationResult.schoolName}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[9px] uppercase font-mono">Nom Complet de l'Élève</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {verificationResult.studentName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-mono">Classe / Option</span>
                  <span className="font-semibold text-slate-700 whitespace-nowrap">
                    {verificationResult.classLevel} &bull; {verificationResult.option}
                  </span>
                </div>
                <div className="col-span-2 bg-white/70 p-2.5 rounded-lg border border-emerald-100 mt-1">
                  <span className="text-slate-400 block text-[9px] uppercase font-mono mb-0.5 flex items-center gap-1 font-semibold">
                    <Award className="w-3.5 h-3.5 text-yellow-600" />
                    RÉSUMÉ DU CONTENU NUMÉRIQUE DE SÉCURITÉ
                  </span>
                  <span className="font-medium text-slate-800 text-xs sm:text-sm font-mono leading-tight">
                    {verificationResult.amountOrGradeSummary}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-emerald-800/80 bg-emerald-100/50 p-2 rounded text-center font-semibold font-mono">
                Sceau Républicain RDC &bull; Secrétariat Général à l'Éducation
              </div>
            </div>
          )}

          {/* Quick instructions / Help */}
          <div className="text-[11px] text-slate-400 pt-2 flex items-center gap-1 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Astuce : Cliquez sur un symbole de QR Code dans les modules d'Inscriptions, Paiements ou Bulletins pour ouvrir ce scanner automatique.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
