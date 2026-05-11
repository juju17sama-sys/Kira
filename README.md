# Kira — Mont Olympe

> Centre de commandement immersif pour le panthéon d'agents IA du projet **Viral AI Studio**.
> Pas un dashboard. Une civilisation divine vivante.

---

## Vision

Quand on ouvre Kira, on n'entre pas dans une interface SaaS.
On entre dans le **Mont Olympe** — vue panoramique sur les neuf dieux/agents qui font tourner le pipeline.

- **Cronos** veille au sommet (superviseur).
- **Zeus, Poséidon, Hadès** trônent au niveau intermédiaire (la triade frères).
- **Apollon, Aphrodite, Boîte de Pandore, Athéna, Hermès** occupent le cercle inférieur (l'Agora).

Chaque dieu a sa terrasse, son symbole, sa palette, sa flamme. Le décor **est** l'interface.

---

## Le panthéon

| Dieu | Domaine | Rôle pipeline | Palette | Flamme |
|---|---|---|---|---|
| **Cronos** | Maître du Temps | Superviseur, chef d'orchestre | Or sépia | Violette |
| **Zeus** | Roi des Dieux | Tendances, stratégie | Bleu royal / or | Bleue électrique |
| **Poséidon** | Maître des Océans | Montage vidéo, flow | Bleu océan | Bleue aquatique |
| **Hadès** | Roi des Enfers | Analyse gameplay (replays) | Violet sombre | Violette intense |
| **Apollon** | Soleil et Arts | Audio, rythme, BGM | Or éclatant | Dorée chaude |
| **Aphrodite** | Amour et Beauté | Miniatures, visuels | Rose | Rose |
| **Athéna** | Sagesse et Stratégie | Contrôle qualité | Violet / or | Violette |
| **Hermès** | Messager | Copywriting, hooks | Or solaire | Dorée |
| **Boîte de Pandore** | Archives | Mémoire projet | Violet électrique | Violette crépitante |

---

## Les 3 scènes

```
                   ┌─────────────────────┐
                   │   HUB PANORAMIQUE   │
                   │   (Mont Olympe)     │◄─── Page d'accueil
                   └──┬──┬──┬───────────┘
                      │  │  │
       ┌──────────────┘  │  └──────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│  TERRASSE   │  │  SALLE DU    │  │  BOÎTE DE    │
│  (8 dieux)  │  │  COMMANDEMENT│  │  PANDORE     │
│             │  │  (Cronos)    │  │  (archives)  │
└──────┬──────┘  └──────────────┘  └──────────────┘
       │
       ▼
┌─────────────┐
│  PARCHEMIN  │  Action contextuelle :
│  (action)   │  INVOQUER, débloquer, consulter
└─────────────┘
```

### 1. Hub panoramique
Vue aérienne fullscreen du Mont Olympe. Les 9 dieux sont à leurs positions canoniques.
- **Survol** : halo doré + son de hover
- **Clic** : zoom cinématique vers la scène du dieu
- **Compteur** : un rond coloré apparaît à côté du dieu quand des missions actives sont chez lui
- **Flammes de relais** : étincelles dorées qui voyagent entre les dieux quand une mission progresse

### 2. Terrasses individuelles (8 dieux)
- Plein écran, parallax souris, respiration de scène
- Clic sur le dieu → parchemin d'action contextuel
- Bouton retour discret en haut à gauche

### 3. Salle du Commandement (Cronos)
- Stats globales (missions actives / archivées / total)
- Bouton **⟁ INVOQUER UNE NOUVELLE MISSION** rapide
- Timeline visuelle des missions actives : 9 segments par mission, couleur de chaque dieu, flamme pulsante sur le stage actif

### 4. Boîte de Pandore (archives)
- Vue spéciale particules violettes amplifiées
- Filtres : Tout / Clips / Leçons / Succès / Erreurs
- Recherche texte
- **Archivage automatique** des missions terminées
- Détail au clic d'un fragment

---

## Le système de missions en relais

Quand tu cliques **INVOQUER** sur un dieu, une mission est créée et traverse les 9 dieux dans l'ordre :

```
Cronos    → orchestre          ┐
Zeus      → identifie tendance │
Hadès     → analyse gameplay   │
Poséidon  → monte le clip      │  ~50 secondes
Apollon   → ajoute le son      │  en démo
Aphrodite → fait la miniature  │
Hermès    → écrit le hook      │
Athéna    → valide qualité     │ ⚠ peut bloquer (1/3)
Pandore   → archive            ┘
```

À chaque transition :
- 🔥 **Flamme dorée** voyage de l'ancien au nouveau dieu
- 💫 Le dieu actif passe en `working` (flamme + aura colorée)
- 📊 Sa barre de progression avance

### Athéna peut bloquer une mission
Avec 1 chance sur 3, Athéna trouve un défaut (durée, miniature, hook, hashtag, faute…) et **bloque la mission**.
- Notification rouge "⚠ MISSION BLOQUÉE" en haut
- Aller dans le parchemin Athéna → bouton **⟁ DÉBLOQUER ET POURSUIVRE**

---

## Stack technique

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS 3** (palette custom marbre / or / violet sacré)
- **Framer Motion** (transitions, dolly-zoom, particules)
- **Web Audio API** (sons procéduraux — vent, harpe, tintements)
- Typographie : **Cinzel** (titres) + **Cormorant Garamond** (corps)
- Images : **WebP** (carte panoramique + 9 portraits, ~5 MB total)

---

## Architecture du code

```
src/
├── App.tsx                          Orchestrateur de scènes
├── data/
│   ├── gods.ts                      Config des 9 dieux (palette, hotspot, rôle)
│   └── archives.ts                  Archives statiques de démo
├── pipeline/                        ─── Pont avec le pipeline réel ───
│   ├── types.ts                     Mission, MissionStage, PipelineState
│   ├── mockSource.ts                Source simulée (mission relais + Athéna)
│   └── usePipeline.ts               Hooks React + actions invoke/unblock
├── components/
│   ├── PanoramicHub.tsx             Vue 1 — carte fullscreen + éditeur hotspots
│   ├── GodTerrace.tsx               Vue 2 — terrasse d'un dieu (parallax + respiration)
│   ├── CronosCommandRoom.tsx        Vue 3a — salle de commandement Cronos
│   ├── PandoreVault.tsx             Vue 3b — archives Pandore (filtres + recherche)
│   ├── ScrollPanel.tsx              Parchemin contextuel (tâches + missions + actions)
│   ├── AmbientLayer.tsx             Étincelles dorées + brume basse + rayons
│   ├── RelayFlame.tsx               Flamme qui voyage entre dieux à chaque transition
│   ├── NotificationCenter.tsx       Étoiles filantes ✦ done / ⚠ blocked
│   ├── SoundToggle.tsx              Bouton mute/unmute coin haut-droit
│   └── AlertGlyph.tsx               Triangle doré pulsant
└── utils/
    ├── assets.ts                    Helper BASE_URL (compatible GitHub Pages)
    ├── preload.ts                   Préchargement portraits en arrière-plan
    └── sound.ts                     Sons procéduraux Web Audio
public/olympe/
├── mont-olympe.webp                 Carte aérienne du panthéon
├── cronos.webp ... pandore.webp     9 portraits chibi plein corps
```

---

## Modes développeur

| Touche | Effet |
|---|---|
| **D** | Active/désactive l'affichage debug des hotspots (rectangles dorés avec coordonnées) |
| **E** | Active l'éditeur visuel des hotspots (drag & resize + bouton COPIER LE CODE) |

URL : `?debug` ou `?edit` pour activer dès l'arrivée.

---

## Lancer en local

```bash
npm install
npm run dev          # serveur local + accès réseau (utile depuis téléphone)
```

→ <http://localhost:5173/>

## Déployer

Le repo a un workflow GitHub Actions (`.github/workflows/deploy.yml`) qui :
1. Build à chaque push sur `main`
2. Publie sur GitHub Pages : <https://juju17sama-sys.github.io/Kira/>

Prérequis : repo public + Settings → Pages → Source : **GitHub Actions**.

---

## Brancher le vrai pipeline Viral AI Studio

Aujourd'hui, le pipeline est **mocké** dans `src/pipeline/mockSource.ts` :
- statuts simulés
- missions virtuelles qui avancent par timers
- Athéna bloque 1/3 du temps avec raison aléatoire

Pour brancher le vrai backend, il suffira de :
1. Créer `src/pipeline/apiSource.ts` qui implémente `PipelineSource`
2. Remplacer `createMockPipelineSource` par `createApiPipelineSource` dans `usePipeline.ts`
3. Le reste de l'app reste **strictement inchangé** (couplage faible voulu)

---

## Roadmap

- [x] Hub panoramique calibré (9 hotspots)
- [x] Terrasses individuelles + parallax + respiration
- [x] Parchemins contextuels (parchemin de marbre)
- [x] Vue Boîte de Pandore (archives)
- [x] Vue Cronos (salle du commandement)
- [x] Système de missions en relais (9 stages)
- [x] Flamme dorée qui voyage entre dieux
- [x] Athéna intervention aléatoire + déblocage manuel
- [x] Notifications "étoile filante" (done / blocked)
- [x] Sons procéduraux (vent, hover, harpe, chime)
- [x] Bouton mute persistant
- [x] Persistance pipeline en localStorage
- [x] Préchargement des images
- [x] Conversion WebP (-85% de poids)
- [x] Dolly-zoom cinématique à l'entrée des scènes
- [x] Compteurs de missions sur les hotspots du hub
- [x] Responsive de base
- [x] Mode debug (D) + éditeur hotspots (E)
- [ ] Connexion au pipeline réel Viral AI Studio
- [ ] Vraie 3D (quand GLB disponible)
- [ ] Animations idle des dieux dans les terrasses
- [ ] Salle Zeus (vue tendances/stratégie)
- [ ] Salle Hadès (analyse replay interactive)

---

## Direction artistique

**Interdits :**
- Cartes flottantes / médaillons / avatars ronds
- Badges Material UI / shadcn bruts
- Icônes Lucide nues
- Typographie sans-serif moderne (Inter, Roboto…)
- Scroll de page — l'expérience est fullscreen fixe

**Imposés :**
- Marbre, or, violet sacré, flammes
- Typographie romaine (serif)
- Décor = interface principale
- Interactions discrètes : survol, halo, parchemin

---

## Licence

Projet personnel — Julien.
