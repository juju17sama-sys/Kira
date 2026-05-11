// ╔══════════════════════════════════════════════════════════════════╗
// ║  ARCHIVES — Mémoire projet conservée par la Boîte de Pandore     ║
// ║                                                                  ║
// ║  Données de démo. À terme : connecté au vrai store du pipeline   ║
// ║  Viral AI Studio (clips produits, métriques, leçons retenues).   ║
// ╚══════════════════════════════════════════════════════════════════╝

export type ArchiveKind = 'clip' | 'leçon' | 'succès' | 'erreur';

export interface ArchiveEntry {
  id: string;
  date: string;          // ISO date
  kind: ArchiveKind;
  title: string;
  detail: string;
  // Tags pour la recherche
  tags?: string[];
  // Rapport détaillé optionnel — utilisé par les missions archivées
  // (liste de lignes "dieu — action — durée"), affichage spécifique en modal.
  report?: ArchiveReport;
}

export interface ArchiveReport {
  /** Durée totale du relais en secondes */
  totalSeconds: number;
  /** Une ligne par stage, dans l'ordre */
  stages: {
    godId: string;
    godName: string;
    action: string;
    durationSeconds: number;
    /** S'il y a eu un blocage qui a été résolu */
    wasBlocked?: boolean;
    blockReason?: string;
  }[];
  /** Conclusion auto-générée */
  summary: string;
}

export const ARCHIVES: ArchiveEntry[] = [
  {
    id: 'clip-041',
    date: '2026-05-09',
    kind: 'clip',
    title: 'Clip #041 — Triple kill Lancelot',
    detail: 'Publié sur TikTok le 09/05. Hook validé par Hermès, montage par Poséidon, miniature par Aphrodite.',
    tags: ['mlbb', 'lancelot', 'tiktok'],
  },
  {
    id: 'lecon-013',
    date: '2026-05-08',
    kind: 'leçon',
    title: 'Les hooks à 0:03 fonctionnent mieux que ceux à 0:05',
    detail: 'Athéna a constaté un taux de rétention +18% sur les 12 derniers clips lorsque le hook arrive avant la 4ème seconde.',
    tags: ['hook', 'rétention', 'analyse'],
  },
  {
    id: 'succes-007',
    date: '2026-05-06',
    kind: 'succès',
    title: '1ère vidéo à 100k vues',
    detail: 'Clip #038 a passé les 100 000 vues en 48h. Combo : tendance Zeus + montage rapide Poséidon + miniature contrastée Aphrodite.',
    tags: ['100k', 'tendance', 'milestone'],
  },
  {
    id: 'erreur-004',
    date: '2026-05-05',
    kind: 'erreur',
    title: 'Audio Apollon désynchronisé sur clip #039',
    detail: 'Le drop musical tombait 0.4s après l\'action visuelle. Athéna a bloqué la publication. Apollon a recalibré.',
    tags: ['audio', 'sync', 'qualité'],
  },
  {
    id: 'clip-040',
    date: '2026-05-04',
    kind: 'clip',
    title: 'Clip #040 — Comeback Gusion',
    detail: 'Publié le 04/05. Bon hook mais miniature trop floue. Aphrodite a consigné le retour.',
    tags: ['mlbb', 'gusion', 'comeback'],
  },
  {
    id: 'lecon-012',
    date: '2026-05-03',
    kind: 'leçon',
    title: 'Le violet vend mieux que le rouge en miniature',
    detail: 'Sur 9 tests A/B menés par Aphrodite, les miniatures à dominante violette ont 12% de CTR en plus.',
    tags: ['miniature', 'couleur', 'a/b test'],
  },
  {
    id: 'succes-006',
    date: '2026-05-02',
    kind: 'succès',
    title: 'Pipeline complet en 11 minutes',
    detail: 'Cronos a chronométré : analyse Hadès → montage Poséidon → audio Apollon → miniature Aphrodite → QC Athéna en 11min total.',
    tags: ['performance', 'pipeline'],
  },
  {
    id: 'erreur-003',
    date: '2026-04-30',
    kind: 'erreur',
    title: 'Hashtag obsolète détecté tardivement',
    detail: 'Zeus avait validé un hashtag qui était en chute libre depuis 3 jours. Désormais, refresh des tendances toutes les 6h.',
    tags: ['tendance', 'hashtag', 'process'],
  },
  {
    id: 'lecon-011',
    date: '2026-04-29',
    kind: 'leçon',
    title: 'Les replays > 5 min sont peu rentables à analyser',
    detail: 'Hadès a prouvé qu\'au-delà de 5 minutes de replay, le ratio "moments forts / temps d\'analyse" devient mauvais.',
    tags: ['replay', 'analyse', 'rentabilité'],
  },
];
