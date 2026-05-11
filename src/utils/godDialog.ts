// ╔══════════════════════════════════════════════════════════════════╗
// ║  GOD DIALOG — Moteur de réponses conversationnelles              ║
// ║                                                                  ║
// ║  Chaque dieu peut répondre à Julien selon des INTENTS détectés   ║
// ║  par mots-clés. Les réponses sont en personnage (à la 1ère pers).║
// ║                                                                  ║
// ║  Architecture pensée pour être REMPLACÉE par Claude API plus     ║
// ║  tard : il suffira de swap `getGodResponse` par une fonction     ║
// ║  async qui appelle le backend.                                   ║
// ╚══════════════════════════════════════════════════════════════════╝

import type { GodId } from '../data/gods';
import type { PipelineState } from '../pipeline/types';
import { generateGodSpeech } from './godSpeech';

// ─── Intents reconnus ─────────────────────────────────────────────────
type Intent =
  | 'greeting'         // salut, bonjour
  | 'status'           // où en es-tu, mission, statut, travail
  | 'identity'         // qui es-tu, tu fais quoi
  | 'thanks'           // merci
  | 'love'             // bravo, super, génial
  | 'orders'           // travaille, fais X, mission, lance
  | 'apology'          // désolé, pardon
  | 'farewell'         // au revoir, à bientôt
  | 'help'             // aide, comment, que faire
  | 'unknown';

const INTENT_PATTERNS: Record<Exclude<Intent, 'unknown'>, RegExp[]> = {
  greeting: [/\b(salut|bonjour|hello|coucou|hey|bonsoir|yo)\b/i],
  status: [
    /\b(où en es|où en est|status|statut|mission|travail|que fais|tu fais quoi|état)\b/i,
    /\b(en cours|progrès|avancement|rapport)\b/i,
  ],
  identity: [
    /\b(qui es[- ]tu|qui êtes[- ]vous|présente|c'est quoi ton rôle|tu sers à quoi)\b/i,
    /\b(parle[- ]moi de toi|décris[- ]toi)\b/i,
  ],
  thanks: [/\b(merci|thanks|gracias|cimer)\b/i],
  love: [/\b(bravo|super|génial|excellent|parfait|magnifique|incroyable|top|trop bien)\b/i],
  orders: [
    /\b(lance|démarre|commence|fais|travaille|invoque|crée|génère)\b/i,
    /\b(une mission|un clip|un truc|quelque chose)\b/i,
  ],
  apology: [/\b(désolé|pardon|excuse|sorry|mes excuses)\b/i],
  farewell: [/\b(au revoir|à bientôt|à plus|bye|ciao|salut\s*$|bonne nuit)\b/i],
  help: [/\b(aide|help|comment|que faire|j'sais pas|j'comprends pas|c'est quoi)\b/i],
};

function detectIntent(text: string): Intent {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as [
    Exclude<Intent, 'unknown'>,
    RegExp[],
  ][]) {
    if (patterns.some((p) => p.test(text))) return intent;
  }
  return 'unknown';
}

// ─── Réponses par dieu et par intent ─────────────────────────────────
type DialogTable = Record<Intent, string[]>;

const VOICE: Record<GodId, DialogTable> = {
  cronos: {
    greeting: ['Salutations, Julien. Le temps t’écoute.', 'Bienvenue. Que veux-tu orchestrer ?'],
    status: [], // overridden par generateGodSpeech
    identity: ['Je suis Cronos, Maître du Temps. Je supervise le pipeline et arbitre les priorités.'],
    thanks: ['Le temps est précieux, ne le gaspille pas en politesses. Mais merci à toi.'],
    love: ['Le temps récompense la patience. Continue.'],
    orders: ['Très bien. Invoque une mission par le bouton dédié — je l’orchestrerai.'],
    apology: ['Le temps efface tout. Rien n’est grave si tu reprends.'],
    farewell: ['Le temps te suivra. À bientôt.'],
    help: ['Tu peux invoquer une mission, ou consulter les autres dieux pour des tâches précises.'],
    unknown: ['Je n’ai pas saisi. Reformule, et je t’écouterai.', 'Le temps fait écho, mais ton sens m’échappe.'],
  },
  zeus: {
    greeting: ['Que la foudre éclaire ton chemin, Julien.', 'Salut, mortel. Quelles tendances dois-je scruter ?'],
    status: [],
    identity: ['Je suis Zeus, Roi des Dieux. J’identifie les courants viraux et désigne les cibles.'],
    thanks: ['Bien. Le ciel ne récompense que ceux qui osent.'],
    love: ['La foudre te répond. Continue.'],
    orders: ['Donne-moi un sujet et je te trouverai la tendance qui frappe.'],
    apology: ['Le ciel pardonne plus vite que les hommes. Avance.'],
    farewell: ['Que les éclairs te guident.'],
    help: ['Demande-moi un hashtag, une tendance, un timing. Je sais où la foudre tombera.'],
    unknown: ['Le tonnerre gronde, mais tes mots se perdent. Reformule.'],
  },
  poseidon: {
    greeting: ['Les flots te saluent, Julien.', 'Bienvenue dans mon courant.'],
    status: [],
    identity: ['Je suis Poséidon, Maître des Océans. Je monte les clips et leur donne leur flow.'],
    thanks: ['La vague continue. Merci à toi.'],
    love: ['Le rythme est tout. Heureux qu’il te porte.'],
    orders: ['Donne-moi un brut, je le ferai couler.'],
    apology: ['Les marées emportent les regrets. Avance.'],
    farewell: ['Bonne navigation.'],
    help: ['Je m’occupe du montage. Demande-moi une coupe, un rythme, une transition.'],
    unknown: ['Ton message dérive. Reformule, je suis là.'],
  },
  hades: {
    greeting: ['Les ombres te reçoivent.', 'Bienvenue dans la profondeur.'],
    status: [],
    identity: ['Je suis Hadès, Roi des Enfers. Je dissèque les replays pour en extraire les moments-clés.'],
    thanks: ['Rien ne se perd dans mes profondeurs. Merci.'],
    love: ['Les ombres se réjouissent silencieusement.'],
    orders: ['Donne-moi un replay et je trouverai ce qui vibre.'],
    apology: ['Les enfers pardonnent vite. Avance.'],
    farewell: ['Que l’obscurité te garde.'],
    help: ['Je détecte les kills, les retournements, les moments forts d’un replay. Donne-moi le fichier.'],
    unknown: ['Ta voix se perd dans les abysses. Répète.'],
  },
  apollon: {
    greeting: ['Que ma lyre t’accueille, Julien.', 'Salut. Quel rythme cherches-tu ?'],
    status: [],
    identity: ['Je suis Apollon, dieu du Soleil et des Arts. Je choisis la musique et la synchronise au visuel.'],
    thanks: ['La musique te rend, et reprend. Merci.'],
    love: ['Le soleil se réchauffe.'],
    orders: ['Donne-moi un clip muet, je l’habillerai d’une bande-son.'],
    apology: ['Les fausses notes s’oublient. Joue à nouveau.'],
    farewell: ['Bonne route, mélodieuse.'],
    help: ['Je gère le son : BGM, sync, beat. Demande-moi ce que tu veux entendre.'],
    unknown: ['La mélodie de tes mots m’échappe. Reformule.'],
  },
  aphrodite: {
    greeting: ['Doux Julien, sois le bienvenu.', 'Une miniature à composer ?'],
    status: [],
    identity: ['Je suis Aphrodite, déesse de l’Amour et de la Beauté. Je crée les miniatures et habille le visuel.'],
    thanks: ['La beauté se nourrit de gratitude. Merci.'],
    love: ['Mon cœur de déesse en frémit.'],
    orders: ['Décris-moi le clip, je composerai la miniature.'],
    apology: ['L’amour pardonne. Recommence.'],
    farewell: ['Que la beauté te suive.'],
    help: ['Je fais les miniatures, je choisis les couleurs, je place les visages. Donne-moi le contexte.'],
    unknown: ['Tes mots sont jolis mais flous. Reformule, doucement.'],
  },
  athena: {
    greeting: ['Sage Julien, sois le bienvenu.', 'Approche. Aucun défaut ne te sera caché.'],
    status: [],
    identity: ['Je suis Athéna, déesse de la Sagesse et de la Stratégie. Je contrôle la qualité avant publication.'],
    thanks: ['La sagesse récompense la reconnaissance. Merci.'],
    love: ['Le hibou hoche la tête, satisfait.'],
    orders: ['Soumets-moi un clip et je te dirai s’il peut être publié.'],
    apology: ['L’erreur instruit. Pas de regret, juste corriger.'],
    farewell: ['Que la sagesse te guide.'],
    help: ['Je valide les clips. Si je bloque, je te dis pourquoi. Tu peux me débloquer dans mon parchemin.'],
    unknown: ['Le hibou hésite. Reformule plus précisément.'],
  },
  hermes: {
    greeting: ['Salut, mortel rapide.', 'Que veux-tu écrire aujourd’hui ?'],
    status: [],
    identity: ['Je suis Hermès, messager des dieux. J’écris les hooks, descriptions et titres qui accrochent.'],
    thanks: ['Mes ailes te répondent. Merci à toi.'],
    love: ['Mes sandales s’envolent de joie.'],
    orders: ['Donne-moi un sujet, je trouve les mots qui captent.'],
    apology: ['Les mots maladroits s’effacent vite. Continue.'],
    farewell: ['File vite, comme moi.'],
    help: ['Je rédige titres, hooks, descriptions, tags. Donne-moi ton clip ou ton angle.'],
    unknown: ['Tes mots me dépassent. Sois plus direct.'],
  },
  pandore: {
    greeting: ['La Boîte t’accueille.', 'Approche. La mémoire est intacte.'],
    status: [],
    identity: ['Je suis la Boîte de Pandore. Je conserve la mémoire de tout ce qui a été produit, appris, ou raté.'],
    thanks: ['Ta gratitude est archivée.'],
    love: ['Mon contenu en frémit.'],
    orders: ['Pour consulter, regarde simplement à l’intérieur.'],
    apology: ['L’erreur est archivée, mais pas jugée.'],
    farewell: ['Reviens quand tu voudras te souvenir.'],
    help: ['Je conserve les clips passés, les leçons retenues, les erreurs. Filtre et cherche dans la mémoire.'],
    unknown: ['Mes archives ne contiennent rien là-dessus. Reformule.'],
  },
};

/**
 * Génère la réponse du dieu à un message utilisateur.
 * Pour l'intent "status", on s'appuie sur godSpeech pour avoir un message
 * dynamique basé sur le pipeline réel.
 */
export function getGodResponse(
  godId: GodId,
  userMessage: string,
  state: PipelineState,
): string {
  const intent = detectIntent(userMessage);

  // Status → dynamique
  if (intent === 'status') {
    const speech = generateGodSpeech(godId, state);
    return speech.text;
  }

  const table = VOICE[godId];
  const list = table[intent];
  if (list && list.length > 0) {
    // Variante deterministe selon le message (pour éviter le random pur)
    const idx = hashString(userMessage) % list.length;
    return list[idx];
  }
  // Fallback : unknown ou intent vide
  return table.unknown[hashString(userMessage) % table.unknown.length];
}

// Petit hash deterministe pour choisir une variante de réponse
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
