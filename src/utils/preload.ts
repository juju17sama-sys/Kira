// ╔══════════════════════════════════════════════════════════════════╗
// ║  PRELOAD — Préchargement des images de terrasses en arrière-plan ║
// ║                                                                  ║
// ║  Une fois le hub panoramique chargé, on précharge en silence     ║
// ║  toutes les images des terrasses pour que les transitions        ║
// ║  soient instantanées (pas de flash de chargement).               ║
// ║                                                                  ║
// ║  Stratégie : Image() en JS — le navigateur ajoute au cache HTTP. ║
// ╚══════════════════════════════════════════════════════════════════╝

import { GODS } from '../data/gods';
import { assetUrl } from './assets';

let triggered = false;

/**
 * Lance le préchargement des portraits des dieux.
 * Idempotent : peut être appelé plusieurs fois sans effet de bord.
 * Le navigateur met en cache les images au fur et à mesure.
 */
export function preloadGodPortraits() {
  if (triggered || typeof window === 'undefined') return;
  triggered = true;

  // Les portraits dans l'ordre de probabilité d'accès :
  // Cronos en premier (porte la salle du commandement)
  // Puis les autres dans l'ordre du panthéon
  GODS.forEach((god, i) => {
    // Étalé sur 200ms pour ne pas bloquer le rendu initial
    setTimeout(() => {
      const img = new Image();
      img.src = assetUrl(god.portraitSrc);
      // Pas besoin de gérer onload — le navigateur cache de toute façon
    }, 200 + i * 80);
  });
}
