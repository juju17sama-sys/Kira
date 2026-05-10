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

## Architecture des scènes

| Niveau | Vue | Contenu |
|---|---|---|
| 1 | **Hub panoramique** | Vue aérienne du Mont. Survol = halo doré + nom. Clic = zoom vers terrasse. |
| 2 | **Terrasse du dieu** | Plein écran, dieu plein corps. Cartouche d'identité bas-droite. |
| 3 | **Parchemin d'action** | Slide depuis le bas, esthétique parchemin. Tâches, actions, archives. |

### Signalétique d'alerte
- **Triangle doré** discret au-dessus d'un dieu = il a besoin de Julien.
- **Flamme qui pulse** au sol = il travaille.
- **Pas d'aura colorée**, pas de badge rouge agressif.

---

## Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS 3** (palette divine custom)
- **Framer Motion** (transitions immersives)
- Typographie : **Cinzel** (titres) + **Cormorant Garamond** (corps)

---

## Structure

```
src/
├── App.tsx                    Orchestrateur de scènes (hub <-> terrasse)
├── data/
│   └── gods.ts                Configuration des 9 dieux (palette, hotspots, rôles)
├── components/
│   ├── PanoramicHub.tsx       Vue 1 — carte panoramique
│   ├── GodTerrace.tsx         Vue 2 — terrasse du dieu sélectionné
│   ├── ScrollPanel.tsx        Vue 3 — parchemin d'action
│   └── AlertGlyph.tsx         Triangle d'alerte doré
└── index.css                  Reset + import polices
public/olympe/
├── mont-olympe.png            Carte aérienne du panthéon
├── cronos.png                 Terrasses individuelles
├── zeus.png
├── poseidon.png
├── hades.png
├── apollon.png
├── aphrodite.png
├── athena.png
├── hermes.png
└── pandore.png                Boîte de Pandore (archives)
```

---

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir <http://localhost:5173>.

---

## Calibration des hotspots

Les positions cliquables des dieux sur la carte panoramique sont définies dans `src/data/gods.ts`, propriété `hotspot: { x, y, w, h }` (en pourcentage de l'image).

Valeurs actuelles = **estimation initiale**. Une fois la première version lancée, elles seront ajustées finement à la souris pour coller pixel-près à chaque dieu.

---

## Roadmap immersive

- [x] Étape 1 — Hub panoramique fullscreen avec zones cliquables
- [x] Étape 2 — Transition vers terrasse individuelle
- [x] Étape 3 — Panneau parchemin contextuel
- [x] Étape 4 — Glyphes d'alerte (triangles dorés)
- [ ] Étape 5 — Connexion au pipeline réel (Viral AI Studio)
- [ ] Étape 6 — Vue spéciale Boîte de Pandore (archives interactives)
- [ ] Étape 7 — Animations idle (respiration, capes, flammes)
- [ ] Étape 8 — Sons d'ambiance (vent, harpe, tonnerre)
- [ ] Étape 9 — Parallax léger sur la carte panoramique

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
