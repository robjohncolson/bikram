import type { Chakra } from './types';

/**
 * The seven chakras, root to crown. Colors are tuned to stay readable
 * as accents on both light and dark surfaces.
 */
export const chakras: Chakra[] = [
  {
    id: 'root',
    number: 1,
    sanskritName: 'Muladhara',
    englishName: 'Root Chakra',
    color: '#d64545',
    location: 'base of the spine, pelvic floor',
    element: 'earth',
    bija: 'LAM',
    themes: ['grounding', 'safety', 'stability', 'survival'],
    description:
      'The foundation of the energy body. A balanced root chakra feels like standing on solid ground: secure, present, and physically at home in the body. Standing postures that press the feet into the floor and work the legs speak directly to Muladhara.',
  },
  {
    id: 'sacral',
    number: 2,
    sanskritName: 'Svadhisthana',
    englishName: 'Sacral Chakra',
    color: '#e8772e',
    location: 'lower abdomen, below the navel',
    element: 'water',
    bija: 'VAM',
    themes: ['creativity', 'pleasure', 'emotion', 'fluidity'],
    description:
      'The seat of feeling and flow. Svadhisthana governs the hips, sacrum, and reproductive organs; hip-opening and pelvis-mobilizing postures stir its watery, creative energy and help emotion move instead of stagnate.',
  },
  {
    id: 'solar-plexus',
    number: 3,
    sanskritName: 'Manipura',
    englishName: 'Solar Plexus Chakra',
    color: '#d9a514',
    location: 'upper abdomen, between navel and sternum',
    element: 'fire',
    bija: 'RAM',
    themes: ['willpower', 'confidence', 'digestion', 'transformation'],
    description:
      'The body’s fire center — the "city of jewels." Manipura fuels willpower, self-discipline, and digestion. Core work, twists, and compression postures kindle this inner fire, which is why so much of a hot yoga class seems to radiate from the belly.',
  },
  {
    id: 'heart',
    number: 4,
    sanskritName: 'Anahata',
    englishName: 'Heart Chakra',
    color: '#3f9e5f',
    location: 'center of the chest',
    element: 'air',
    bija: 'YAM',
    themes: ['love', 'compassion', 'openness', 'connection'],
    description:
      'The bridge between the lower (earthly) and upper (spiritual) chakras. Anahata opens with backbends and chest-expanding postures — anything that lifts the sternum and draws the shoulders back invites breath, generosity, and connection.',
  },
  {
    id: 'throat',
    number: 5,
    sanskritName: 'Vishuddha',
    englishName: 'Throat Chakra',
    color: '#2e7fc2',
    location: 'throat and neck',
    element: 'ether (space)',
    bija: 'HAM',
    themes: ['expression', 'truth', 'communication', 'purification'],
    description:
      'The purification center governing voice and truth-telling. Postures that compress or stretch the throat — chin to chest, or neck extended back — stimulate Vishuddha along with the thyroid and parathyroid glands it is mapped to.',
  },
  {
    id: 'third-eye',
    number: 6,
    sanskritName: 'Ajna',
    englishName: 'Third Eye Chakra',
    color: '#5a5fc7',
    location: 'between the eyebrows',
    element: 'light',
    bija: 'OM',
    themes: ['intuition', 'focus', 'insight', 'imagination'],
    description:
      'The command center of perception. Ajna sharpens with single-pointed concentration — balancing postures that demand a fixed gaze, and forehead-to-knee compressions that physically press awareness toward the space between the brows.',
  },
  {
    id: 'crown',
    number: 7,
    sanskritName: 'Sahasrara',
    englishName: 'Crown Chakra',
    color: '#8d5bbf',
    location: 'crown of the head',
    element: 'consciousness',
    bija: 'silence',
    themes: ['transcendence', 'unity', 'surrender', 'awareness'],
    description:
      'The thousand-petaled lotus at the top of the head — pure awareness beyond the personal self. Postures that rest the crown on the floor, and the deep stillness of Savasana, gesture toward Sahasrara: effort dissolving into presence.',
  },
];

export const chakraById = new Map(chakras.map((c) => [c.id, c]));
