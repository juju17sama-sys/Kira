// ╔══════════════════════════════════════════════════════════════════╗
// ║  HELPER ASSETS — Construit l'URL d'un fichier de /public         ║
// ║                                                                  ║
// ║  En dev   : BASE_URL = '/'      → '/olympe/zeus.png'             ║
// ║  En prod  : BASE_URL = '/Kira/' → '/Kira/olympe/zeus.png'        ║
// ║                                                                  ║
// ║  Permet de servir le site en sous-chemin (GitHub Pages).         ║
// ╚══════════════════════════════════════════════════════════════════╝

const BASE = import.meta.env.BASE_URL;

/**
 * Construit l'URL absolue d'un asset stocke dans /public.
 * @param path Chemin relatif sans slash de tete (ex: 'olympe/zeus.png')
 */
export function assetUrl(path: string): string {
  // Tolere un slash de tete au cas ou
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE}${clean}`;
}
