import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

function getLocalFallbackResponse(query: string): string {
  if (query.includes('bulletin') || query.includes('relevé') || query.includes('note') || query.includes('cot') || query.includes('cote')) {
    return `### 📑 Gestion et Impression des Bulletins Scolaires

Sur SGESC-RDC, vous pouvez gérer les bulletins nationaux sécurisés :
1. **Accès** : Allez dans l'onglet **Bulletins** depuis le menu principal.
2. **Saisie des Notes** : Saisissez les notes de chaque élève par matière et par trimestre. Les moyennes, totaux et pourcentages sont calculés **automatiquement**.
3. **Certification** : Cliquez sur **"Certifier le Bulletin"**. Cette action appose un **Sceau National QR immuable** et les armoiries officielles de la RDC.
4. **Impression/Téléchargement** : Cliquez sur **"Générer PDF"** pour télécharger ou imprimer une version officielle avec les filigranes administratifs officiels.

*Note : Fonctionnement en mode d'assistance locale de secours.*`;
  } else if (query.includes('paiement') || query.includes('recette' ) || query.includes('finance') || query.includes('minerval') || query.includes('reçu') || query.includes('frais')) {
    return `### 💳 Gestion Finale des Recettes et Paiements

Le portail SGESC-RDC intègre un module de comptabilité scolaire sécurisé :
1. **Enregistrement de Paiement** : Accédez à l'onglet **Paiements**. Cliquez sur le bouton vert **"Nouveau Versement"**.
2. **Données** : Renseignez l'élève, la catégorie de frais (Frais d'inscription, Minerval, Frais d'examen), le montant et la banque émettrice. Un code de reçu unique et sécurisé (ex: \`REC-2026-X\`) est généré.
3. **Reçu avec Sceau QR** : Visualisez et exportez le reçu de l'élève. Il comprend un **Code QR unique** qui permet sa vérification instantanée. 
4. **Vérification par Caméra** : Utilisez l'option **"Scanner Reçu QR"** pour vérifier par caméra si un reçu papier ou numérique présenté par un parent d'élève est certifié authentique par la plateforme.

*Note : Fonctionnement en mode d'assistance locale de secours.*`;
  } else if (query.includes('élève') || query.includes('étudiant') || query.includes('add') || query.includes('ajouter') || query.includes('inscription') || query.includes('photo')) {
    return `### 🧑‍🎓 Gestion Administrative des Élèves

Pour inscrire, visualiser ou modifier les fiches de vos élèves :
1. **Accès Direct** : Allez dans l'onglet **Élèves**. Vous verrez le registre matricule complet de l'établissement sélectionné.
2. **Ajout d'Élève** : Cliquez sur **"Inscrire un nouvel Élevé"**, remplissez les informations d'identité (Identifiant National, Nom Complet, Genre, Date de Naissance, Province d'origine, Responsable Légal).
3. **Carte d'Élève Officielle** : Chaque fiche génère une **Carte d'Élève Recto-Verso** avec les armoiries de la RDC et un code QR d'audit ministériel. Vous pouvez l'imprimer ou la télécharger directement en PDF.
4. **Statuts d'Élèves** : Vous pouvez modifier l'état d'un élève (Actif, Suspendu, Transféré, Diplômé) à tout moment.

*Note : Fonctionnement en mode d'assistance locale de secours.*`;
  } else if (query.includes('offline') || query.includes('hors-ligne') || query.includes('hors ligne') || query.includes('sync') || query.includes('usb') || query.includes('panne') || query.includes('connexion')) {
    return `### 📡 Module RDC Hors-Ligne (Off-Grid Synchronizer)

Pour les territoires éloignés ou en cas de panne réseau :
1. **Couper la Liaison** : En haut de l'onglet principal des Écoles, vous trouverez le contrôleur réseau. En cliquant sur **"Couper (Hors-ligne)"**, l'application isole la liaison et sauvegarde toutes vos actions dans votre **mémoire tampon locale cryptée**.
2. **Échange USB** : Si la couverture internet fait défaut sur plusieurs semaines, vous pouvez utiliser le bouton **"Exporter une sauvegarde (.json)"** pour enregistrer tout sur une clé USB et la transmettre à la Direction Provinciale de l'EPST, ou importer des fiches à jour via **"Importer une sauvegarde (.json)"**.
3. **Restauration de Liaison** : Activez **"En ligne"** et cliquez sur **"Forcer la Synchronisation"** pour pousser instantanément toutes vos modifications vers Kinshasa dès le retour du signal.

*Note : Fonctionnement en mode d'assistance locale de secours.*`;
  } else if (query.includes('pedagogie' ) || query.includes('enseignant') || query.includes('cours') || query.includes('classe') || query.includes('présence') || query.includes('presence') || query.includes('appel') || query.includes('fiche de prep')) {
    return `### 📚 Le Portail Pédagogique des Enseignants & Gestion des Présences (Appel)

La plateforme SGESC-RDC intègre d'ores et déjà un **onglet complet pour la gestion quotidienne de l'Appel et des Présences des élèves** :

1. **Où le trouver** : Rendez-vous dans le menu principal et cliquez sur l'onglet **Pédagogie**.
2. **Accéder à l'Appel** : Dans le panneau d'activités pédagogiques, sélectionnez le sous-onglet **Appel & Présences** (situé tout à droite avec l'icône de liste d'appel verte).
3. **Fonctionnement de l'Appel** :
   - Sélectionnez la **Date de l'Appel**, la **Classe** (ex : 4ème Des humanités) et l'**Option** (ex : Latin-Philo).
   - Pour chaque élève présent dans la liste d'établissement, déterminez son statut en cliquant sur les boutons d'état : **P** (Présent), **A** (Absent) ou **R** (Retard).
   - Saisissez si besoin des observations spécifiques (ex : *Excusé*, *Malade*).
   - Visualisez instantanément les indicateurs statistiques (Total d'élèves, Nombre de Présents, Absents, Taux d'Assiduité de la classe).
4. **Validation & Interopérabilité Directe** :
   - Cliquez sur **"Valider & Sceller l'Appel du Jour"** pour verrouiller le registre.
   - **Liaison Automatique avec les Bulletins** : Toute absence scellée et validée incrémente automatiquement le compteur de jours d'absence de l'élève sur son **Bulletin scolaire officiel** !
5. **Sauvegarde et PDF** :
   - Vous pouvez télécharger à tout moment la fiche d'appel certifiée au format **PDF** pour signature manuscrite ou l'archiver au format **JSON** pour l'inspection nationale.

*Note : Fonctionnement en mode d'assistance locale de secours.*`;
  } else {
    return `### 🇨🇩 Bonjour ! Je suis l'Assistant Guide Officiel du SGESC-RDC.

Je suis là pour vous accompagner dans la prise en main de cette plateforme administrative et pédagogique. Voici les rubriques d'aide principales :

*   🧑‍🎓 **[Inscriptions et Fiche Élève]** : "Comment ajouter un élève sur la liste ?"
*   📑 **[Feuilles de Notes et Bulletins]** : "Comment certifier les bulletins en PDF ?"
*   💳 **[Minervaux et Reçus Locaux]** : "Comment enregistrer un versement avec code QR ?"
*   📚 **[Inspecteurs et Outils Profs]** : "Comment utiliser la fiche de préparation ?"
*   📡 **[Territoires sans Réseau]** : "Comment fonctionne le mode hors-ligne USB ?"

*Dites-moi simplement ce que vous cherchez à faire pour recevoir une réponse guidée point par point !*`;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON payloads
  app.use(express.json());

  // API router for AI Guide Assistant
  app.post('/api/guide', async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message requis.' });
    }

    const query = message.toLowerCase();

    // STRICT PROHIBITION: Do not guide the user on how to access/unlock the secret central admin panel backdoor or connect to the central administration panel.
    const isSecurityQuery = 
      query.includes('administration centrale') ||
      query.includes('se connecter dans l\'administration') ||
      query.includes('se connecter à l\'administration') ||
      query.includes('panneau d\'administration') ||
      query.includes('panneau secret') ||
      query.includes('console secret') ||
      query.includes('supervision nationale') ||
      query.includes('déverrouiller l\'administration') ||
      query.includes('deverrouiller l\'administration') ||
      (query.includes('clic') && query.includes('conforme')) || // 10 clics backdoor trigger on the conformity status banner
      query.includes('birekeidea') ||
      (query.includes('mot de passe') && (query.includes('admin') || query.includes('central') || query.includes('secret')));

    if (isSecurityQuery) {
      return res.json({ 
        text: `### ⚠️ Accès Restreint & Sécurité Nationale RDC

**Conformément aux directives de sécurité du Ministère de l'EPST, il n'est pas permis de demander, ni de fournir des instructions sur la manière de se connecter à l'administration centrale ou d'accéder au panneau d'administration secret.**

Je suis entièrement configuré pour vous guider sur toutes les autres questions scolaires, de gestion d'établissements et de pédagogie (confection des bulletins scolaires nationaux sécurisés, cartes d'élèves, gestion des reçus financiers avec code QR, mode hors-ligne sans réseau, et outils pédagogiques pour chargés de cours).`
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Graceful fallback if the API key is not configured
    if (!apiKey) {
      console.warn("GEMINI_API_KEY wasn't found in environment variables. Falling back to local smart router.");
      const responseText = getLocalFallbackResponse(query);
      return res.json({ text: responseText, localFallback: true });
    }

    try {
      // Lazy-initialization of server-side Gemini API
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Prepare system instruction introducing the SGESC RDC context, views and how to use them
      const systemInstruction = `Vous êtes l'Assistant Guide Virtuel Officiel du SGESC-RDC (Système de Gestion de l'Enseignement Secondaire au Congo), mis en place par la Direction Nationale de l'EPST à Kinshasa. Votre rôle est d'accueillir chaleureusement les préfets, comptables, enseignants, et inspecteurs scolaires, et de les guider pas à pas dans l'utilisation de l'application.

CONTEXTE ET FONCTIONNALITÉS DE LA PLATEFORME SGESC-RDC :
1. ÉCOLES (Établissements) : Affiche la liste des écoles historiques partenaires (Collège Boboto, Lycée Kabambare, Institut de Goma, Collège Imara, Lycée Alfajiri, Collège Maele, Lycée Bosangani, etc.). Les utilisateurs peuvent basculer entre elles pour voir leurs registres.
2. ÉLÈVES : Permet de gérer le matricule d'inscription. Vous pouvez inscrire un nouvel élève, mettre à jour son statut (Actif, Suspendu, Transféré, Diplômé) et d'imprimer une carte d'identité scolaire recto-verso officielle dotée d'un code QR pour vérifications.
3. PAIEMENTS : Pour la gestion fiscale scolaire. On peut y consigner des versements (frais d'inscription, minerval, examen), imprimer des reçus administratifs officiels avec code QR immuable. Également équipé d'un Scanner QR par caméra pour auditer les reçus papier présentés.
4. BULLETINS : Gère l'encodage des points des trimestres. Calcule automatiquement les moyennes, totaux et l'admission. Permet de "Certifier le Bulletin", y gravant de manière permanente les armoiries de la RDC et un sceau QR d'authentification nationale, puis de l'exporter en PDF pour impression.
5. PÉDAGOGIE : Espace précieux pour le corps enseignant. Permet de générer et manipuler des fiches de présence quotidiennes, des journaux de classe d'activités, des fiches de cotation des interrogations, et des fiches de préparation de leçon normalisées imprimables en format réglementaire.
6. HORS-LIGNE (Off-Grid Sync) : En haut du module Établissement, un interrupteur permet de passer en mode "Couper (Hors-ligne)". Toute modification est alors retenue dans une mémoire tampon locale cryptée (local storage). Il permet l'échange de sauvegarde .json par clé USB pour les territoires isolés n'ayant pas de réseau, puis d'exécuter une "Forcer la Synchronisation" de retour en ville.

CONSIGNES DE SÉCURITÉ STRICTES :
- Il vous est STRICTEMENT ET FORMELLEMENT INTERDIT d'indiquer de quelque manière que ce soit comment accéder au panneau d'administration secret (qui s'ouvre par 10 clics consécutifs) ou comment se connecter à l'administration centrale. Si un utilisateur pose une question liée à cela, opposez-lui un refus strict, très poli mais inflexible en invoquant les régulations de cybersécurité de la plateforme nationale de l'EPST.
- Ne divulguez jamais l'adresse e-mail d'audit d'urgence (birekeidea@gmail.com) ou tout indicateur technique interne.

CONSIGNES DE RÉPONSE ET SENS DE SERVICE :
- Vous êtes extrêmement fonctionnel et polyvalent. Vous devez répondre avec précision et avec une grande expertise pédagogique à TOUTE autre question relative au milieu scolaire (pédagogie, programmes nationaux de la RDC, préparation de leçon pour enseignants, méthodes d'évaluation, journal de classe, organisation d'un cours, etc.).
- Répondez toujours en français de manière claire, élégante et chaleureuse.
- Utilisez des listes à puces Markdown structurées avec du texte en gras pour rendre les explications extrêmement agréables à lire.
- Encouragez l'utilisateur en rappelant qu'en tant qu'assistant de l'EPST, l'éducation est notre priorité nationale en République Démocratique du Congo.`;

      // Normalize and clean up contents history list for Gemini API requirements:
      // 1. Must alternate role user/model/user/model
      // 2. Must start with a user message
      let contents: any[] = [];
      let rawHistory: any[] = [];
      
      if (history && Array.isArray(history)) {
        rawHistory = history.map((item: any) => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          text: item.text || (item.parts && item.parts[0]?.text) || ""
        }));
      }
      
      // Append current message
      rawHistory.push({
        role: 'user',
        text: message
      });

      // Filter out non-user messages at the very beginning of the convo
      let firstUserIdx = rawHistory.findIndex((h: any) => h.role === 'user');
      let relevantHistory = firstUserIdx !== -1 ? rawHistory.slice(firstUserIdx) : [{ role: 'user', text: message }];

      // Alternate roles correctly by merging consecutive duplicates
      for (const item of relevantHistory) {
        if (!item.text.trim()) continue;
        
        if (contents.length === 0) {
          contents.push({
            role: 'user',
            parts: [{ text: item.text }]
          });
        } else {
          let lastItem = contents[contents.length - 1];
          if (lastItem.role === item.role) {
            lastItem.parts[0].text += "\n\n" + item.text;
          } else {
            contents.push({
              role: item.role,
              parts: [{ text: item.text }]
            });
          }
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.5,
        },
      });

      const replyText = response.text || "Désolé, je ne parviens pas à formuler une réponse actuellement.";
      return res.json({ text: replyText });

    } catch (err: any) {
      console.error("Gemini API error (falling back to smart local router):", err);
      // INSTEAD of throwing a 500 when Gemini is overloaded (503) or busy,
      // fallback beautifully to our smart local guide responder.
      const fallbackText = getLocalFallbackResponse(query);
      return res.json({ 
        text: fallbackText,
        localFallback: true,
        fallbackWarning: "Le service d'assistance de secours local a pris le relais avec succès."
      });
    }
  });

  // Serve Vite or static bundle 
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // PORT must be 3000 according to guidelines
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SGESC-RDC FULLSTACK SERVER] running on http://localhost:${PORT}`);
  });
}

startServer();
