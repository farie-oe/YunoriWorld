import yunori from '../assets/avatars/yunori.png'
import luna from '../assets/avatars/luna.png'
import hana from '../assets/avatars/hana.png'
import mori from '../assets/avatars/mori.png'
import pixel from '../assets/avatars/pixel.png'
import cosmo from '../assets/avatars/cosmo.png'
import sora from '../assets/avatars/sora.png'
import kage from '../assets/avatars/kage.png'

// The catalogue of built-in Yunori avatars. Adding a new one later is just
// adding another entry here — nothing that renders or picks from this list
// needs to change.
export const BUILT_IN_AVATARS = [
  { id: 'yunori', name: 'Yunori', image: yunori },
  { id: 'luna', name: 'Luna', image: luna },
  { id: 'hana', name: 'Hana', image: hana },
  { id: 'mori', name: 'Mori', image: mori },
  { id: 'pixel', name: 'Pixel', image: pixel },
  { id: 'cosmo', name: 'Cosmo', image: cosmo },
  { id: 'sora', name: 'Sora', image: sora },
  { id: 'kage', name: 'Kage', image: kage },
]

export function getBuiltInAvatar(id) {
  return BUILT_IN_AVATARS.find((avatar) => avatar.id === id) ?? null
}
