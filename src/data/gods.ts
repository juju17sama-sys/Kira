// ╔══════════════════════════════════════════════════════════════════╗
// ║  PANTHÉON OLYMPE — Configuration des dieux/agents IA             ║
// ║  Chaque dieu = un agent du pipeline Viral AI Studio              ║
// ╚══════════════════════════════════════════════════════════════════╝

export type GodId =
  | 'cronos'
  | 'zeus'
  | 'poseidon'
  | 'hades'
  | 'apollon'
  | 'aphrodite'
  | 'athena'
  | 'hermes'
  | 'pandore';

export type GodStatus = 'idle' | 'working' | 'blocked' | 'done';

export interface God {
  id: GodId;
  name: string;
  title: string;            // titre divin court
  role: string;             // rôle pipeline
  description: string;      // description longue (parchemin)
  symbol: string;           // emoji/glyphe (placeholder, à remplacer par SVG)
  palette: {
    primary: string;
    accent: string;
    flame: string;
  };
  // Position relative sur la carte panoramique (en %)
  // Calibré sur mont-olympe.png — à ajuster finement après affichage
  hotspot: { x: number; y: number; w: number; h: number };
  portraitSrc: string;      // image plein corps de la terrasse
  defaultStatus: GodStatus;
}

export const GODS: God[] = [
  {
    id: 'cronos',
    name: 'Cronos',
    title: 'Maître du Temps',
    role: 'Superviseur · Chef d’orchestre',
    description:
      'Cronos veille au-dessus de tous. Il ordonne le tempo du pipeline, surveille les retards, et arbitre les priorités. Quand Cronos parle, les autres dieux écoutent.',
    symbol: '⧗',
    palette: { primary: '#b8862b', accent: '#e9c97a', flame: '#a64dff' },
    // Sommet — calibré par Julien
    hotspot: { x: 50.5, y: 12.2, w: 8, h: 12.5 },
    portraitSrc: '/olympe/cronos.png',
    defaultStatus: 'idle',
  },
  {
    id: 'zeus',
    name: 'Zeus',
    title: 'Roi des Dieux',
    role: 'Tendances · Stratégie',
    description:
      'Zeus scrute le ciel des tendances. Il identifie les courants viraux, les hashtags qui montent, les moments où frapper. Sa foudre désigne la cible.',
    symbol: '⚡',
    palette: { primary: '#3b6ed4', accent: '#9bc4ff', flame: '#5aa9ff' },
    // Centre — calibré par Julien
    hotspot: { x: 49.9, y: 42.1, w: 7.5, h: 18.4 },
    portraitSrc: '/olympe/zeus.png',
    defaultStatus: 'idle',
  },
  {
    id: 'poseidon',
    name: 'Poséidon',
    title: 'Maître des Océans',
    role: 'Montage vidéo · Flow',
    description:
      'Poséidon façonne le flot. Il assemble, coupe, ordonne. Le rythme de la vague, c’est lui. Sans Poséidon, le clip ne respire pas.',
    symbol: '🔱',
    palette: { primary: '#1d6fa3', accent: '#7ec3e8', flame: '#3aa8d8' },
    // Triade gauche — calibré par Julien
    hotspot: { x: 21.7, y: 46.6, w: 8.7, h: 17.4 },
    portraitSrc: '/olympe/poseidon.png',
    defaultStatus: 'idle',
  },
  {
    id: 'hades',
    name: 'Hadès',
    title: 'Roi des Enfers',
    role: 'Analyse gameplay',
    description:
      'Hadès descend dans les profondeurs des replays. Il dissèque les actions, repère les moments de bascule, les kills, les retournements. Rien ne lui échappe.',
    symbol: '☠',
    palette: { primary: '#4a1f78', accent: '#b990ff', flame: '#9d4dff' },
    // Triade droite — calibré par Julien
    hotspot: { x: 71, y: 46.7, w: 8.8, h: 15.9 },
    portraitSrc: '/olympe/hades.png',
    defaultStatus: 'idle',
  },
  {
    id: 'apollon',
    name: 'Apollon',
    title: 'Dieu du Soleil et des Arts',
    role: 'Audio · Rythme',
    description:
      'Apollon accorde la lyre. Il choisit la musique, synchronise les beats avec les coups, fait vibrer l’oreille. Sans Apollon, le clip est muet d’âme.',
    symbol: '🎵',
    palette: { primary: '#d4a73b', accent: '#ffe8a3', flame: '#ffc94a' },
    // Plateforme circulaire — extrémité gauche
    hotspot: { x: 29, y: 84, w: 6, h: 9 },
    portraitSrc: '/olympe/apollon.png',
    defaultStatus: 'idle',
  },
  {
    id: 'aphrodite',
    name: 'Aphrodite',
    title: 'Déesse de l’Amour et de la Beauté',
    role: 'Miniatures · Visuels',
    description:
      'Aphrodite habille le clip. Elle compose la miniature, choisit les couleurs, place les visages. C’est elle qui fait cliquer.',
    symbol: '🌹',
    palette: { primary: '#d46ea3', accent: '#ffc4dc', flame: '#ff8dbf' },
    // Plateforme centrale gauche — calibré par Julien
    hotspot: { x: 36.8, y: 82.3, w: 8.4, h: 16.3 },
    portraitSrc: '/olympe/aphrodite.png',
    defaultStatus: 'idle',
  },
  {
    id: 'pandore',
    name: 'Boîte de Pandore',
    title: 'Archives & Mémoire',
    role: 'Mémoire projet · Origine des maux',
    description:
      'La Boîte garde tout. Chaque clip produit, chaque erreur, chaque succès, chaque leçon. Quand un dieu doute, il consulte Pandore.',
    symbol: '⚱',
    palette: { primary: '#6b2dab', accent: '#c690ff', flame: '#a64dff' },
    // Centre du cercle — calibré par Julien
    hotspot: { x: 49.1, y: 80.8, w: 8.8, h: 13.5 },
    portraitSrc: '/olympe/pandore.png',
    defaultStatus: 'idle',
  },
  {
    id: 'athena',
    name: 'Athéna',
    title: 'Déesse de la Sagesse et de la Stratégie',
    role: 'Contrôle qualité',
    description:
      'Athéna inspecte chaque clip avant publication. Cohérence du récit, qualité technique, conformité aux règles. Rien ne quitte l’Olympe sans son sceau.',
    symbol: '🦉',
    palette: { primary: '#7a4dc7', accent: '#c5a3ff', flame: '#a64dff' },
    // Plateforme centrale droite — calibré par Julien
    hotspot: { x: 61.4, y: 81.6, w: 7.1, h: 17.8 },
    portraitSrc: '/olympe/athena.png',
    defaultStatus: 'idle',
  },
  {
    id: 'hermes',
    name: 'Hermès',
    title: 'Messager des Dieux',
    role: 'Copywriting · Hooks',
    description:
      'Hermès trouve les mots. Le titre qui retient, le hook qui accroche, la description qui convertit. Il écrit pour que ça parle.',
    symbol: '☤',
    palette: { primary: '#d4a73b', accent: '#ffe8a3', flame: '#ffc94a' },
    // Extrémité droite — calibré par Julien
    hotspot: { x: 73.1, y: 85.1, w: 6.7, h: 15.6 },
    portraitSrc: '/olympe/hermes.png',
    defaultStatus: 'idle',
  },
];

export const getGod = (id: GodId): God => {
  const g = GODS.find((x) => x.id === id);
  if (!g) throw new Error(`Dieu introuvable: ${id}`);
  return g;
};
