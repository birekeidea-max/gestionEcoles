import React, { useState, useRef } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  FileDown, 
  Layers
} from 'lucide-react';
import { School, Student, Payment, Bulletin } from '../types';

interface OfflineSyncHubProps {
  isOnline: boolean;
  simulatedOffline: boolean;
  setSimulatedOffline: (val: boolean) => void;
  schools: School[];
  students: Student[];
  payments: Payment[];
  bulletins: Bulletin[];
  onImportData: (data: { schools?: School[]; students?: Student[]; payments?: Payment[]; bulletins?: Bulletin[] }) => void;
}

export function OfflineSyncHub({
  isOnline,
  simulatedOffline,
  setSimulatedOffline,
  schools,
  students,
  payments,
  bulletins,
  onImportData
}: OfflineSyncHubProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isActuallyOnline = isOnline && !simulatedOffline;

  // Simulate a manual forced data sync
  const handleSyncNow = () => {
    if (!isActuallyOnline) return;
    setSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      setSyncing(false);
      setSyncSuccess(true);
      setPendingSyncCount(0);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1500);
  };

  // Export full national database snapshot to JSON file
  const handleExportBackup = () => {
    const backupPayload = {
      timestamp: new Date().toLocaleString('fr-CD'),
      schools,
      students,
      payments,
      bulletins
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    
    const d = new Date();
    const dateFormatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    downloadAnchor.setAttribute("download", `SGESC-RDC-Sauvegarde-${dateFormatted}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import school database from JSON tool
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    setImportSuccess(false);

    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.schools || !json.students || !json.payments || !json.bulletins) {
          throw new Error("Le format du fichier est invalide. Les entités obligatoires sont manquantes.");
        }
        
        onImportData({
          schools: json.schools,
          students: json.students,
          payments: json.payments,
          bulletins: json.bulletins
        });

        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 4000);
      } catch (err: any) {
        setImportError(`Erreur d'importation: ${err.message || "Fichier JSON corrompu ou format incorrect."}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6 text-left animate-in fade-in duration-300" id="offline-sync-hub">
      
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-indigo-50 text-[#007FFF] rounded-2xl border border-indigo-100 shrink-0">
            <Layers className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-1.5 font-sans">
              Module RDC-Hors-Ligne (Off-Grid Synchronizer)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
              Audit et Routage d'Urgence des Provinces
            </span>
          </div>
        </div>

        {/* Simulated connection toggle buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-150 text-xs shrink-0 select-none">
          <button
            type="button"
            onClick={() => setSimulatedOffline(false)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              !simulatedOffline 
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-205' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            En ligne
          </button>
          <button
            type="button"
            onClick={() => setSimulatedOffline(true)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              simulatedOffline 
                ? 'bg-red-650 text-white shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            Couper (Hors-ligne)
          </button>
        </div>
      </div>

      {/* Network Alert Messages */}
      {simulatedOffline ? (
        <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs leading-relaxed font-semibold text-amber-900">
          <span className="text-xl animate-bounce shrink-0">📡</span>
          <div className="space-y-1">
            <h4 className="font-extrabold uppercase text-[10px] tracking-wide text-amber-950">Mode Hors-ligne Activé (Offline Mode Active)</h4>
            <p className="text-slate-650 text-[11px] font-sans">
              La passerelle réseau vers le Ministère de l'EPST à Kinshasa est désactivée. L'application utilise maintenant votre **mémoire tampon locale cryptée (Local Autonomous Storage)**. Vous pouvez ajouter, modifier, certifier, et coter des élèves en toute sécurité; les modifications se synchroniseront automatiquement dès que la connexion sera établie.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-emerald-50/50 border border-emerald-250/50 rounded-2xl flex items-center gap-3 text-xs font-semibold text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="font-extrabold text-[10.5px] uppercase tracking-wide text-emerald-950">Liaison Nationale Active et Fluide</p>
            <p className="text-slate-500 text-[10px] font-sans">
              Vos bases de données locales sont parfaitement synchronisées avec le cluster ministériel du SGESC-RDC.
            </p>
          </div>
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className={`px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold rounded-lg transition-colors font-mono cursor-pointer flex items-center gap-1 shrink-0 ${
              syncing ? 'animate-pulse opacity-75' : ''
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchro...' : 'Forcer Sync'}
          </button>
        </div>
      )}

      {/* Success Notifications */}
      {syncSuccess && (
        <div className="p-3 bg-green-500 text-white text-xs font-bold rounded-xl animate-pulse text-center">
          ✓ Base de données nationale synchronisée avec succès auprès de la direction nationale !
        </div>
      )}

      {importSuccess && (
        <div className="p-3 bg-emerald-500 text-white text-xs font-bold rounded-xl text-center">
          ✓ Données d'écoles et fiches d'élèves importées avec succès ! La base locale a été mise à jour.
        </div>
      )}

      {importError && (
        <div className="p-3 bg-red-650 text-white text-xs font-bold rounded-xl text-center">
          ⚠️ {importError}
        </div>
      )}

      {/* Storage & Record Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Établissements</span>
          <span className="text-lg font-black text-slate-800 block">{schools.length}</span>
          <span className="text-[8.5px] font-bold text-slate-400 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded-full inline-block">Off-grid ready</span>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Effectif Élèves</span>
          <span className="text-lg font-black text-slate-800 block">{students.length}</span>
          <span className="text-[8.5px] font-bold text-slate-450 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full inline-block">Persisté</span>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Reçus Financiers</span>
          <span className="text-lg font-black text-slate-800 block">{payments.length}</span>
          <span className="text-[8.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full inline-block">Sécurisé</span>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Fiches Bulletins</span>
          <span className="text-lg font-black text-slate-800 block">{bulletins.length}</span>
          <span className="text-[8.5px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full inline-block">Sceau QR</span>
        </div>
      </div>

      {/* Backup and Restore Utilities (USB exchange workflow) */}
      <div className="bg-slate-950 text-white rounded-2xl p-5 space-y-3.5 border-b-4 border-[#F4D03F] relative overflow-hidden">
        <div className="absolute right-2 bottom-2 font-mono text-[60px] text-slate-900 font-extrabold select-none opacity-20">
          USB
        </div>
        
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase text-yellow-400 font-mono tracking-wide">
            📁 Échange Hors-Réseau &amp; Import/Export USB (Régie Centrale)
          </h4>
          <p className="text-[11px] text-slate-300 leading-normal font-medium">
            Pour les territoires isolés privés de couverture cellulaire WAN, exportez une copie de sauvegarde immuable compressée (.json) de votre établissement ou importez les bases de données fournies par les inspecteurs régionaux.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex-1 bg-white hover:bg-slate-100 text-indigo-950 py-2 px-4 rounded-xl text-xs font-extrabold font-mono transition-colors border border-white cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#007FFF]" />
            Exporter une sauvegarde (.json)
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-indigo-900 hover:bg-indigo-850 text-white py-2 px-4 rounded-xl text-xs font-extrabold font-mono transition-colors border border-indigo-850 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-yellow-400" />
            Importer une sauvegarde (.json)
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportBackup}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

    </div>
  );
}
