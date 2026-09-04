import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Shavasana together with its redirects from
//   https://en.wikipedia.org/wiki/Pavanamuktasana and
//   https://en.wikipedia.org/wiki/Supta_Padangusthasana (name roots; the
//   modern date of Pavanamuktasana; the one-knee shape; Supta
//   Padangusthasana as a separate straight-leg form)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (item 14 and its
//   English rendering)
// - https://loyindex.org and its published CSV:
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (no Pavanamuktasana or Apanasana entry; Supta Padangusthasana is grade
//   13, plates 284–287)
// - Plate numbers cross-checked in three Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Supta Padangusthasana I at plates 284–286; the four-level UK syllabus
//   contains no Pavanamuktasana or Apanasana)
// - https://www.ghoshyoga.org/postures-of-ghosh-yoga.html (a modern catalog
//   drawn from five Ghosh-lineage publications; Pavanamuktasana appears in
//   all five, the one-leg version in four, and the seated version in two;
//   the page expressly says its numbers are not a practice sequence)
// - https://yoganga.com/articles/supta-padangusthasana/
// - https://yogaselection.com/supta-padangusthasana/
// - https://yogavastu.com/p/supta-padangusthasana/ (Iyengar-method teaching
//   for Supta Padangusthasana: bent-knee entry, belt, active floor leg,
//   steady pelvis, grounded shoulders, and a soft elbow bend)
// - https://www.wisdomlib.org/definition/pavana and
//   https://www.wisdomlib.org/definition/mukta (dictionary entries: pavana
//   as wind or air; mukta as the past participle of muc, to set free)
//
// `asana` is null and `reference` is omitted because neither the published
// Light on Yoga index nor the Iyengar Yoga UK syllabus contains a standalone
// Pavanamuktasana entry. Supta Padangusthasana is a documented neighbor, not
// a book-backed identification of the 26 & 2 posture.
export const windRemoving: ClassicalNote = {
  asana: null,
  etymology:
    'Pavana means “wind” or “air”; mukta, the past participle of muc, means “released” or “set free”; and asana is a seat or posture. Together, Pavanamuktasana names a posture of released wind. The sources consulted place this named shape in modern yoga rather than the medieval hatha repertoire. Here the name covers the supine one-knee and two-knee forms used in class.',
  contrast:
    'Light on Yoga does not give Pavanamuktasana a standalone entry: it is absent from both the published Light on Yoga index sheet and the four-level Iyengar Yoga UK syllabus. The nearby documented form is Supta Padangusthasana I (grade 13, plates 284–287). The Iyengar-method teaching pages consulted begin that pose with one knee drawn in before a belt is placed around the foot and the leg is extended; their instructions emphasize the grounded leg, an even pelvis, and the backs of the shoulders. In 26 & 2 the belt and straight-leg continuation never arrive. The knee stays folded and travels beside its own ribs while the other leg remains active, making the compression itself the class form. A modern Ghosh Yoga catalog adds lineage context without proving a sequence: Pavanamuktasana occurs in each of the five publications it compares, while one-leg and seated variants also recur. The catalog explicitly says that its numbering is not a practicable order.',
  refinements: [
    'Give the long leg a precise job. Send its back thigh toward the mat, keep its kneecap and toes facing the ceiling, and reach through the inner heel. These actions adapt the bottom-leg work taught for Supta Padangusthasana without changing the 26 & 2 shape.',
    'Keep the pelvis settled as the pull deepens. If the buttock on the hugging side begins to lift, ease the knee away slightly and lengthen that outer hip away from the ribs before drawing the thigh in again.',
    'Anchor the backs of the shoulders and retain an easy bend in the elbows. Let the arms bring the thigh closer without a shrug; keep the head centered and the throat quiet.',
    'Use the posture’s ordinary breathing as part of the alignment. Keep the abdomen receptive, and let an exhale accompany a little more hip flexion instead of forcing the knee down.',
  ],
  stages: [
    'Draw in one knee with the hands behind the thigh. If the long-leg position pulls the pelvis out of level, keep the other foot on the floor for now.',
    'Hold below the kneecap with the other leg straight, weighted, and active. Keep both shoulders and both sides of the pelvis on the mat as the thigh moves toward its own shoulder.',
    'Bring both knees in and hold the shins or opposite elbows. Let the back widen across the floor while the neck and face remain easy.',
    'To explore the neighboring classical path, return to one knee in, place a belt around the ball of that foot, and extend the leg into Supta Padangusthasana I while preserving the floor-leg and pelvic actions.',
  ],
  ladder: {
    before: [
      'Savasana (Corpse)',
      'Supta Baddha Konasana (Reclining Bound Angle)',
      'Urdhva Prasarita Padasana (Upward Extended Feet)',
    ],
    beyond: [
      'Supta Padangusthasana (Reclining Hand-to-Big-Toe)',
      'Jathara Parivartanasana (Revolving Belly)',
      'Ananda Balasana (Happy Baby)',
      'Karnapidasana (Knees-to-Ears)',
    ],
  },
};
