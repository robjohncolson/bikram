import type { Pose } from '../types';

export const pranayama: Pose = {
  id: 'pranayama',
  order: 1,
  englishName: 'Standing Deep Breathing',
  sanskritName: 'Pranayama',
  pronunciation: 'prah-nah-YAH-mah',
  category: 'breathing',
  sets: 2,
  timing: '2 sets of 10 slow breaths',
  approxTotalSeconds: 300,
  summary:
    'The opening breathing exercise: slow, maximal lung-filling breaths with interlaced fingers under the chin. It wakes up the lungs, warms the body from the inside, and sets the meditative pace for the 90 minutes ahead.',
  setup: [
    'Stand with feet together, heels and toes touching.',
    'Interlace all ten fingers and place the knuckles under the chin.',
    'Keep the arms, wrists, and elbows touching in front of the chest.',
  ],
  cues: [
    'Inhale by the nose for a slow count of six, lifting the elbows up beside the ears like wings.',
    'Keep the knuckles glued under the chin — the chin presses down as the elbows rise.',
    'Exhale by the mouth for six counts, dropping the head back and bringing elbows, wrists, and forearms together in front of the face.',
    'Fill the lungs completely on every inhale; empty them completely on every exhale.',
    'Eyes open, body still — only the arms, head, and breath are moving.',
  ],
  breath:
    'Six counts in through the nose with a soft throat friction, six counts out through the mouth with a "ha" sound from deep in the throat.',
  benefits: [
    'Expands lung capacity and trains full, deep breathing.',
    'Oxygenates the blood and gently raises the heart rate to warm up the body.',
    'Improves focus and draws attention inward before the postures begin.',
    'Relieves irritability and helps with sleep quality over time.',
    'Warms up the shoulders, elbows, and neck for the series ahead.',
  ],
  contraindications: [
    'Dizziness or light-headedness — pause and breathe normally, then rejoin.',
    'Neck injuries — keep the head neutral instead of dropping it back on the exhale.',
  ],
  chakras: [
    {
      id: 'throat',
      why: 'The breath is drawn past a gently constricted throat while the chin presses the knuckles, stimulating Vishuddha — the purification center — with every cycle.',
    },
    {
      id: 'heart',
      why: 'The lifting elbows spread the ribs and expand the chest to its fullest, opening the space around Anahata with each maximal inhale.',
    },
  ],
  muscles: [
    { id: 'diaphragm', action: 'strengthens', emphasis: 'primary', note: 'maximal-range breathing is a direct diaphragm and intercostal workout' },
    { id: 'deltoids', action: 'strengthens', emphasis: 'secondary', note: 'repeated slow elbow lifts beside the ears' },
    { id: 'neck', action: 'stretches', emphasis: 'secondary', note: 'chin-down on the inhale, head back on the exhale' },
    { id: 'trapezius', action: 'strengthens', emphasis: 'secondary' },
  ],
  mnemonic:
    'Class begins the way life begins — with a breath. Knuckles under the chin: #1 is the breath before everything.',
  sequenceNote:
    'The sequence opens here because deep breathing warms the body from the inside out and shifts the nervous system into class mode — every posture that follows rides on the breath this exercise establishes.',
};
