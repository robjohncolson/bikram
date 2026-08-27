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
//
// No `reference`: Light on Yoga treats the breath in its pranayama section
// (Ujjayi at pp. 441–443 per Wikipedia), which carries no 1–60 difficulty
// grade, and no plate numbers for it could be verified.
export const pranayama: ClassicalNote = {
  asana: null,
  etymology:
    'Prana is breath and, by extension, the life-current traditionally said to ride on it; ayama is the half the scholars argue over — read one way it means stretching out, read another reining in — so pranayama is either breath extended or breath restrained, and the classical practice is both at once. Tradition divides every breath into puraka (the filling), rechaka (the emptying) and kumbhaka (the pot of held air between them); Standing Deep Breathing keeps the first two and leaves the third out. Its nearest named relative, Ujjayi, is “the victorious one” — ud, upward or superior, plus jaya, victory — named for the way the chest rises and fills as the breath is drawn in.',
  contrast:
    'Iyengar teaches pranayama as a sitting practice — Siddhasana or another steady seat, chin dropped toward the chest, eyes closed, every breath in and out through the nose — and in the Iyengar method beginners, or anyone with high blood pressure or heart trouble, learn it lying over folded blankets, without holds, before they ever sit up for it. Standing Deep Breathing does nearly the opposite on purpose: you stand in what Iyengar would call Tadasana, eyes open, head dropping back on every exhale, and the out-breath leaves through the mouth on a “ha” (the classical repertoire uses the mouth only for Sitali, breathed over a rolled tongue) — a warm-up from the Ghosh lineage the sequence descends from, built to heat the body and settle the room’s attention before ninety minutes of postures, not a practice sat with for its own sake. The one place the two methods meet is the chin: knuckles pressing up while the chin presses down is, mechanically, a chin lock (Jalandhara Bandha) arriving through the arm position — though Iyengar keeps the chin down through the exhale too, where 26 & 2 releases the head back. There is no kumbhaka here either: the classical practice deepens by adding short holds after the inhale and after the exhale, while this one deepens by filling and emptying a little more completely inside the same six counts. The class’s closing breath sits on the same shelf — Iyengar files Kapalabhati as a gentler Bhastrika — so the two exercises that bracket a 26 & 2 class also bracket the classical repertoire: the slow victorious breath at one end, the bellows at the other.',
  refinements: [
    'Widen before you lift. The Iyengar method opens the bottom of the ribcage sideways — front, sides and back — before any upward movement of the chest; let the first counts of the inhale spread the lower ribs, and only then let the rising elbows carry the breath up under the collarbones.',
    'Match the two halves. In Ujjayi the first thing Iyengar asks for is an exhale as long and as smooth as the inhale, breath after breath, before anything else is added — the six-count is that instruction written out; if the exhale runs dry early, you took in more than you can pay back, so fill a touch less and even the ledger.',
    'Keep the throat sound a whisper. The soft friction in the throat is Ujjayi’s narrowed glottis; it should hiss, not rasp — if it turns scratchy the throat has tightened rather than narrowed, and the breath will shorten with it.',
    'Lift the sternum into the lock. Iyengar’s chin lock comes from the breastbone rising to meet a dropping chin, not from the head being driven down; press the chest up into the knuckles on the inhale and the back of the neck stays long even as the chin presses.',
    'Let the face do nothing. In the Iyengar method the eyes, brow and tongue soften while the ribs work; with eyes open here, settle the gaze on one point and let the whole effort live below the collarbones.',
  ],
  stages: [
    'Breath first: stand with the knuckles under the chin but the arms at rest, head level, and find a six-in, six-out rhythm through the throat; stay here until ten breaths pass without any light-headedness.',
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
