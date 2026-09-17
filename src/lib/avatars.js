import yunoriMascot from '../assets/mascot/yunori-mascot.png'

// The catalogue of built-in Yunori avatars. Adding a new one later is just
// adding another entry here — nothing that renders or picks from this list
// needs to change. Final Yunori avatar artwork will be dropped into
// src/assets/avatars/ and added here when it's ready; the mascot is used
// as the first built-in option in the meantime.
export const BUILT_IN_AVATARS = [
  { id: 'yunori', name: 'Yunori', image: yunoriMascot },
]

export function getBuiltInAvatar(id) {
  return BUILT_IN_AVATARS.find((avatar) => avatar.id === id) ?? null
}
