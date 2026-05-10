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
    hotspot: { x: 50, y: 14, w: 14, h: 18 },
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
    hotspot: { x: 50, y: 38, w: 14, h: 18 },
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
    hotspot: { x: 22, y: 38, w: 14, h: 18 },
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
    hotspot: { x: 78, y: 38, w: 14, h: 18 },
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
    // Calé sur la plateforme circulaire centrale — extrémité gauche du cercle
    hotspot: { x: 37, y: 80, w: 7, h: 12 },
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
    // Plateforme centrale — gauche-centre, légèrement plus bas (en avant du cercle)
    hotspot: { x: 44, y: 82, w: 7, h: 12 },
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
    // Centre exact de la plateforme — la Boîte trône au cœur du cercle
    hotspot: { x: 50, y: 80, w: 8, h: 13 },
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
    // Plateforme centrale — droite-centre, en avant du cercle (symétrique d'Aphrodite)
    hotspot: { x: 56, y: 82, w: 7, h: 12 },
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
    // Plateforme centrale — extrémité droite du cercle (symétrique d'Apollon)
    hotspot: { x: 63, y: 80, w: 7, h: 12 },
    portraitSrc: '/olympe/hermes.png',
    defaultStatus: 'idle',
  },
];

export const getGod = (id: GodId): God => {
  const g = GODS.find((x) => x.id === id);
  if (!g) throw new Error(`Dieu introuvable: ${id}`);
  return g;
};
