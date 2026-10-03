import yunori from '../assets/avatars/yunori.png'
import luna from '../assets/avatars/luna.png'
import hana from '../assets/avatars/hana.png'
import mori from '../assets/avatars/mori.png'
import pixel from '../assets/avatars/pixel.png'
import cosmo from '../assets/avatars/cosmo.png'
import sora from '../assets/avatars/sora.png'
import kage from '../assets/avatars/kage.png'

import poseSitting from '../assets/avatars/poses/sitting.png'
import poseHappyHearts from '../assets/avatars/poses/happy-hearts.png'
import poseWinking from '../assets/avatars/poses/winking.png'
import poseConfused from '../assets/avatars/poses/confused.png'
import poseGrumpy from '../assets/avatars/poses/grumpy.png'
import poseSleeping from '../assets/avatars/poses/sleeping.png'
import posePeeking from '../assets/avatars/poses/peeking.png'
import poseCheering from '../assets/avatars/poses/cheering.png'
import poseLaptop from '../assets/avatars/poses/laptop.png'
import poseSmiling from '../assets/avatars/poses/smiling.png'
import poseCrying from '../assets/avatars/poses/crying.png'
import poseHuggingHeart from '../assets/avatars/poses/hugging-heart.png'
import poseSurprised from '../assets/avatars/poses/surprised.png'
import poseSideProfile from '../assets/avatars/poses/side-profile.png'
import poseBubbleTea from '../assets/avatars/poses/bubble-tea.png'
import posePlaying from '../assets/avatars/poses/playing.png'
import poseBackView from '../assets/avatars/poses/back-view.png'
import poseUnderBlanket from '../assets/avatars/poses/under-blanket.png'
import poseResting from '../assets/avatars/poses/resting.png'
import poseRunning from '../assets/avatars/poses/running.png'

// The catalogue of built-in Yunori avatars. Adding a new one later is just
// adding another entry here — nothing that renders or picks from this list
// needs to change. profiles.avatar_value stores the `id`, so ids must stay
// stable even when the artwork is replaced.
//
// `group` splits the picker into sections: 'classic' avatars are the eight
// theme characters (each also paired with a theme in lib/themes.js), while
// 'poses' are extra picker-only options with no theme attached.
export const BUILT_IN_AVATARS = [
  { id: 'yunori', name: 'Yunori', image: yunori, group: 'classic' },
  { id: 'luna', name: 'Luna', image: luna, group: 'classic' },
  { id: 'hana', name: 'Hana', image: hana, group: 'classic' },
  { id: 'mori', name: 'Mori', image: mori, group: 'classic' },
  { id: 'pixel', name: 'Pixel', image: pixel, group: 'classic' },
  { id: 'cosmo', name: 'Cosmo', image: cosmo, group: 'classic' },
  { id: 'sora', name: 'Sora', image: sora, group: 'classic' },
  { id: 'kage', name: 'Kage', image: kage, group: 'classic' },

  { id: 'pose-sitting', name: 'Sitting', image: poseSitting, group: 'poses' },
  { id: 'pose-happy-hearts', name: 'Happy Hearts', image: poseHappyHearts, group: 'poses' },
  { id: 'pose-winking', name: 'Winking', image: poseWinking, group: 'poses' },
  { id: 'pose-confused', name: 'Confused', image: poseConfused, group: 'poses' },
  { id: 'pose-grumpy', name: 'Grumpy', image: poseGrumpy, group: 'poses' },
  { id: 'pose-sleeping', name: 'Sleeping', image: poseSleeping, group: 'poses' },
  { id: 'pose-peeking', name: 'Peeking', image: posePeeking, group: 'poses' },
  { id: 'pose-cheering', name: 'Cheering', image: poseCheering, group: 'poses' },
  { id: 'pose-laptop', name: 'Laptop', image: poseLaptop, group: 'poses' },
  { id: 'pose-smiling', name: 'Smiling', image: poseSmiling, group: 'poses' },
  { id: 'pose-crying', name: 'Crying', image: poseCrying, group: 'poses' },
  { id: 'pose-hugging-heart', name: 'Hugging Heart', image: poseHuggingHeart, group: 'poses' },
  { id: 'pose-surprised', name: 'Surprised', image: poseSurprised, group: 'poses' },
  { id: 'pose-side-profile', name: 'Side Profile', image: poseSideProfile, group: 'poses' },
  { id: 'pose-bubble-tea', name: 'Bubble Tea', image: poseBubbleTea, group: 'poses' },
  { id: 'pose-playing', name: 'Playing', image: posePlaying, group: 'poses' },
  { id: 'pose-back-view', name: 'Back View', image: poseBackView, group: 'poses' },
  { id: 'pose-under-blanket', name: 'Under Blanket', image: poseUnderBlanket, group: 'poses' },
  { id: 'pose-resting', name: 'Resting', image: poseResting, group: 'poses' },
  { id: 'pose-running', name: 'Running', image: poseRunning, group: 'poses' },
]

export const CLASSIC_AVATARS = BUILT_IN_AVATARS.filter((avatar) => avatar.group === 'classic')
export const POSE_AVATARS = BUILT_IN_AVATARS.filter((avatar) => avatar.group === 'poses')

export function getBuiltInAvatar(id) {
  return BUILT_IN_AVATARS.find((avatar) => avatar.id === id) ?? null
}
