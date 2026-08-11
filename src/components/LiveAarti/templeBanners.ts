// Shared temple banner map — kept separate so cards don't pull in WatchModal/Dialog.
import shivWallpaper from '@/pages/images/shiv_wallpaper.webp';
import krishnaMain from '@/pages/images/krishna main.webp';
import meditationDesktop from '@/pages/images/meditation_desktop_wallpaper.webp';
import deityHanuman from '@/assets/deities/hanuman.webp';
import kashiVishwanathImg from '@/pages/images/kashi vishwanath.webp';
import ujjainMahakalImg from '@/pages/images/Ujjain Mahakaleshwar Jyotirlinga dd astro.jpg';
import mayapurTvImg from '@/pages/images/radha_krishna_hd mayapur tv.webp';
import salasarBalajiImg from '@/pages/images/salasar_balaji desktop.webp';
import khatuShyamImg from '@/pages/images/shyam_mandir_desktop_hd.webp';
import salangpurHanumanImg from '@/pages/images/Hanumanji_HD_WebP.webp';
import somnathTempleImg from '@/pages/images/shiv_temple_hd.webp';
import doordarshanNationalImg from '@/pages/images/shree_ram_ultra_hd.webp';

export function resolveTempleBanner(templeId: string): string {
  switch (templeId) {
    case 'mayapur-tv':
      return mayapurTvImg;
    case 'somnath-temple':
      return somnathTempleImg;
    case 'kashi-vishwanath':
      return kashiVishwanathImg;
    case 'salasar-balaji':
      return salasarBalajiImg;
    case 'salangpur-hanumanji':
      return salangpurHanumanImg;
    case 'shyam-bhakti-rang':
      return khatuShyamImg;
    case 'dd-astro':
      return ujjainMahakalImg;
    case 'doordarshan-national':
      return doordarshanNationalImg;
    case 'radha-vallabh-vrindavan':
      return krishnaMain;
    default:
      if (templeId.includes('kashi') || templeId.includes('mahakal') || templeId.includes('somnath')) {
        return shivWallpaper;
      }
      if (templeId.includes('mayapur') || templeId.includes('radha') || templeId.includes('shyam')) {
        return krishnaMain;
      }
      if (templeId.includes('balaji') || templeId.includes('hanuman')) {
        return deityHanuman;
      }
      return meditationDesktop;
  }
}
