import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Pranayama
// - https://en.wikipedia.org/wiki/Ujjayi
// - https://en.wikipedia.org/wiki/Kumbhaka
// - https://en.wikipedia.org/wiki/Bandha_(yoga)
// - https://en.wikipedia.org/wiki/Tadasana
// - https://en.wikipedia.org/wiki/Anuloma_pranayama
// - https://en.wikipedia.org/wiki/Bhastrika
// - https://en.wikipedia.org/wiki/Light_on_Yoga
// - https://en.wikipedia.org/wiki/Bikram_Yoga
// - https://flametreeyogastudio.com.au/yoga/ujjayi-pranayama-iyengar/
// - https://iyengaryogacentre.ca/resources/practice/an-independent-pranayama-practice/
// - https://yogainternational.com/article/view/beat-the-heat-sitali-and-sitkari/
//   (Sitali / Sitkari: the mouth is used on the inhale only; exhale by the nose)
// - https://en.wikipedia.org/wiki/Sama_vritti (equal-duration breath)
//
// No `reference`: Light on Yoga treats the breath in its pranayama section
// (Ujjayi at pp. 441–443 per Wikipedia), which carries no 1–60 difficulty
// grade, and no plate numbers for it could be verified.
export const pranayama: ClassicalNote = {
  asana: null,
  etymology:
    'Prana is breath and, by extension, the life-current traditionally said to ride on it; ayama is the half the scholars argue over — read one way it means stretching out, read another reining in — so pranayama is either breath extended or breath restrained, and the classical practice is both at once. Tradition divides every breath into puraka (the filling), rechaka (the emptying) and kumbhaka (the pot of held air between them); Standing Deep Breathing keeps the first two and leaves the third out. Its nearest named relative, Ujjayi, is “the victorious one” — ud, upward or superior, plus jaya, victory — a name Iyengar reads through the way the chest swells and rises as the breath is drawn in.',
  contrast:
    'Iyengar teaches pranayama as a sitting practice — Siddhasana or another steady seat, chin dropped toward the chest, eyes closed, every breath in and out through the nose — and in the Iyengar method beginners learn it lying over folded blankets, without any holds, before they ever sit up for it. Standing Deep Breathing does nearly the opposite on purpose: you stand in what Iyengar would call Tadasana, eyes open, head dropping back on every exhale, and the out-breath leaves through the mouth on a “ha” (in the classical repertoire the mouth is used only on the inhale, for the cooling breaths Sitali and Sitkari — drawn in over a rolled tongue or through the teeth — and the exhale is, as a rule, nasal) — a warm-up belonging to a sequence that descends from Bishnu Ghosh’s teaching, built to heat the body and settle the room’s attention before ninety minutes of postures, not a practice sat with for its own sake. The one place the two methods meet is the chin: knuckles pressing up while the chin presses down is, mechanically, a chin lock (Jalandhara Bandha) arriving through the arm position — though Iyengar keeps the chin down through the exhale too, where 26 & 2 releases the head back. There is no kumbhaka here either: the classical practice deepens by adding short holds after the inhale and after the exhale, while this one deepens by filling and emptying a little more completely inside the same six counts. The class’s closing breath sits on the same shelf — Iyengar files Kapalabhati as a gentler Bhastrika — so the two exercises that bracket a 26 & 2 class also bracket the classical repertoire: the slow victorious breath at one end, the bellows at the other.',
  refinements: [
    'Widen before you lift. In the Iyengar method the lower ribs are asked to spread wide first — out to the sides and into the back — before the chest is allowed to climb; let the first counts of the inhale go into that width, and only then let the rising elbows carry the breath up under the collarbones.',
    'Match the two halves. Classical pranayama has a name for an inhale and an exhale of equal length — sama vrtti, “even movement” — and the six-count is that idea written out, with both retentions left at zero. If the exhale runs dry before the count is done, slow the release rather than shortening the fill: the posture still wants full lungs, it just wants them paid out evenly.',
    'Keep the inhale’s throat sound a whisper. The soft friction you feel as the breath comes in by the nose is Ujjayi’s narrowed glottis; it should hiss, not rasp — if it turns scratchy the throat has tightened rather than narrowed, and the breath will shorten with it. The “ha” of the exhale is the same open throat, simply let go through the mouth.',
    'Lift the sternum into the lock. Iyengar’s chin lock comes from the breastbone rising to meet a dropping chin, not from the head being driven down; lift the chest up toward the knuckles on the inhale and the back of the neck stays long even as the chin presses.',
    'Let the face do nothing. In the Iyengar method the eyes, brow and tongue soften while the ribs work; with eyes open here, settle the gaze on one point and let the whole effort live below the collarbones.',
  ],
  stages: [
    'Breath first: stand with the knuckles under the chin and the elbows resting together in front of the chest, head level, and find the six-in, six-out rhythm — in by the nose, out by the mouth — before anything moves; stay here until ten breaths pass without any light-headedness.',
    'Add the arms, not the head: lift the elbows on the inhale and bring the forearms together on the exhale with the chin level throughout — this is also the version the neck caution asks for, so it is a complete practice in its own right.',
    'Let the head go back on the exhale only as far as the knuckles stay glued and the throat stays open; a head that falls further than the chin can follow has left the posture.',
    'The full form: elbows up beside the ears, head all the way back, both halves of the count filled to the edge — and, in the spirit of the Iyengar method, the breath so even that the tenth breath matches the first.',
  ],
  ladder: {
    before: ['Tadasana (Mountain)', 'Savasana (Corpse)', 'Ujjayi Pranayama (Victorious Breath)'],
    beyond: [
      'Ujjayi Pranayama with Kumbhaka (Victorious Breath with retention)',
      'Nadi Sodhana Pranayama (Alternate-Nostril Breath)',
      'Bhastrika Pranayama (Bellows Breath)',
    ],
  },
};
