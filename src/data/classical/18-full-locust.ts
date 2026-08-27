import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Salabhasana (śalabha = grasshopper/locust;
//   absent from the medieval hatha texts, first printed in the 1905
//   Yogasopana Purvacatuska, then described independently by Vishnudevananda
//   1960 and Iyengar 1966; main form = legs, arms and head all lifted with the
//   arms reaching straight back; Ardha Salabhasana = one leg and the opposite
//   arm; the Bikram locust is staged — arms under the body, chin down, one leg
//   then both — and follows Bhujangasana; the lead also gives "Purna
//   Salabhasana" as a plain synonym for the everything-lifted form (Yoga
//   Journal 1996); the article does not describe Bikram's winged Full Locust)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#18 Full Locust,
//   Pūrṇaśalabhāsana, nearest classical name Salabhasana; #17 Locust nearest
//   Ardha Salabhasana; #16 Cobra; #19 Bow)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 200+ asanas, ~600
//   photographs; 1–60 difficulty grades; asana / pranayama / courses)
// - https://en.wikipedia.org/wiki/Makarasana (LoY pp. 100–101 gives it as a
//   Salabhasana variation — fingers interlocked behind the head, elbows high,
//   head and legs raised)
// - https://en.wikipedia.org/wiki/Dhanurasana (dhanur = bow; Salabhasana the
//   easier prone backbend before it; Parsva and Urdhva Dhanurasana variants)
// - https://www.wisdomlib.org/definition/shalabha (Monier-Williams:
//   grasshopper, locust; Cappeller adds moth)
// - https://www.wisdomlib.org/definition/purna (pūrṇa: filled, full, whole,
//   complete; from the root pṝ, "to fill")
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Salabhasana #25, p. 99, intensity 1, plates 60–61; Makarasana #26,
//   p. 100, no grade, plate 62; Dhanurasana #27, p. 101, grade 4, plate 63;
//   Parsva Dhanurasana p. 102, grade 4, plates 64–65; Bhujangasana I p. 107,
//   grade 1, plates 72–73; Urdhva Mukha Svanasana p. 108, grade 1, plate 74;
//   Viparita Salabhasana #197, p. 416, grade 58, plate 584; Utthita
//   Trikonasana p. 63, grade 3; Virabhadrasana I p. 69, grade 3; Ardha
//   Chandrasana p. 74, grade 5; the only rows containing "Salabh" are
//   Salabhasana and Viparita Salabhasana — no "Purna" locust entry)
// - Plate 60 cross-checked in two Iyengar-association syllabi (both list
//   Salabhasana 60, Makarasana 62, Dhanurasana 63, Bhujangasana I 73, Urdhva
//   Mukha Svanasana 74 at the entry level; the UK sheet later lists Parsva
//   Dhanurasana 64–65 and Viparita Salabhasana 584):
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
// - https://yoganga.com/articles/salabhasana/ and
//   https://yogauonline.com/yoga-practice-teaching-tips/yoga-for-beginners/marla-apt-refine-your-salabhasana-building-strength-and-vigor-in-locust-pose/
//   (Iyengar-method teaching by a senior certified teacher: arms alongside
//   the body reaching back and lifted parallel to the floor; front thighs
//   turned in and drawn together, reach through the big toes; tailbone nailed
//   down, buttocks working so the pelvis does not swing and jam the low back;
//   front body lengthened, abdomen reaching toward the head; shoulder blades
//   down away from the head with their lower edges cut toward the spine,
//   shoulders rolled back and down, chest broadened and reaching forward;
//   neck long with no congestion at its base; lift on an exhalation; a brief
//   hold of roughly twenty seconds; staged with legs down first; prepared by
//   Trikonasana, Virabhadrasana I and II, Ardha Chandrasana; leads to
//   Dhanurasana, Urdhva Mukha Svanasana, Ustrasana, Urdhva Dhanurasana)
// - https://www.ihanuman.com/asana/salabhasana (Iyengar-lineage form: abdomen
//   the only contact; arms straight back; inner thighs roll in, kneecaps
//   lifted; tailbone down; inner shoulder blades into the back; look forward
//   and up; exhale to rise; knees-bent option for a sore low back)
// - https://www.ihanuman.com/journal/ihanuman/salabhasana-locust-pose-lower-back-pain
//   (Viparita Salabhasana rests on neck and chin with the legs over the head;
//   Ashtanga's Salabhasana A/B lift only the legs with the arms on the floor,
//   outstretched or alongside; other arm options: hands interlaced behind
//   the back, fists under the body)
// - https://yogavastu.com/p/salabhasana/ (Iyengar-method framing: a floor
//   "baby backbend" where the back body learns to lift against gravity
//   before the bigger backbends)
// - https://iyengaryogacanada.com/salabhasana-using-a-wall/ (an Iyengar wall
//   variation: shoulder blades into the back, sharp extension of the legs
//   curling the whole spine — no arms-to-the-sides variation described)
// - https://sivanandalondon.org/twelve-basic-asanas/locust/ (the Sivananda
//   school's "Full Locust" = hands under the body, chin forward, both legs
//   lifted — the shape 26 & 2 files as plain Locust)
// - https://www.artofliving.org/in-en/yoga/yoga-poses/viparita-salabhasana-superman-pose
//   (modern usage: "Viparita Salabhasana / Superman" = arms reaching forward,
//   chest, arms and legs lifted — a different pose from Iyengar's grade-58
//   Viparita Salabhasana)
// - https://courses.bikramyogaworks.com/pages/poorna-salabhasana-full-locust-pose
//   and https://www.bychotyoga.co.uk/portfolio-posts/poorna-salabhasana/
//   (26 & 2 form: arms out like wings, palms down, fingers together, chin on
//   the floor to start, everything lifts on an inhale with only the belly and
//   hip bones down, fingertips near head height, gaze up, keep breathing;
//   third of the spine-strengthening series)
export const fullLocust: ClassicalNote = {
  asana: 'Salabhasana',
  asanaEnglish: 'Locust Pose',
  etymology:
    'Pūrṇa means full, whole or complete — it comes from the root pṝ, “to fill” — and śalabha is the grasshopper or locust (the dictionaries also allow a moth), with āsana a seat or posture: Poorna-Salabhasana is the complete locust, the whole insect off the ground. The prefix is a modern studio label rather than one Light on Yoga uses — Purna Salabhasana appears elsewhere simply as another name for the everything-lifted locust, which Iyengar files under the plain name — and the Sivananda school uses “full locust” for something else again, the hands-under, both-legs lift that 26 & 2 files as plain Locust. The insect itself is a latecomer to the repertoire: no medieval hatha text describes a locust posture, and it first appears in print in a 1905 illustrated Indian manual.',
  reference: { plates: '60–61', difficulty: 1 },
  contrast:
    'Iyengar’s Salabhasana — page 99, plates 60–61, graded 1 of his sixty — is already the whole-body lift: head, chest, straight legs and both arms leave the floor together with only the abdomen bearing you, and Iyengar-method teachers hold it briefly, as a burst of vigour rather than an endurance test, which makes it close kin to your ten honest seconds. What differs is the arms: in Light on Yoga they reach straight back beside the body and lift, so the shoulders roll back and the chest broadens with almost nothing to carry, while 26 & 2 swings them out to shoulder height as wings — and a pair of straight arms held level with the shoulders is a long, heavy lever that lands squarely on the muscles between the shoulder blades and the mid-spine, the region this posture exists to wake. So the wings are the mechanism, not a flourish: Iyengar’s arms-back form asks the back to lift the body, 26 & 2’s winged form asks it to lift the body and hold two outriggers level at the same time, which is why the 26 & 2 version is the heavier shape even though the classical entry sits at the bottom of Iyengar’s scale. Breath runs the other way as well — Iyengar-method teachers cue the lift on an exhalation, to keep the belly long and the low back spacious, where 26 & 2 takes off on the inhale and keeps the breath sipping — and each is coherent with its own hold, one a soft, roomy lift, the other a full-body take-off on a count. One name clash to keep straight: the modern studio “Superman”, arms reaching forward with everything lifted, is often labelled Viparita Salabhasana, but in Light on Yoga Viparita Salabhasana (page 416, plate 584, grade 58) is the locust turned upside down — resting on chin and chest with the legs carried over the head — and the arms-forward lift is simply one more arm position for the plain locust, the winged 26 & 2 form being its nearest neighbour.',
  refinements: [
    'Lengthen before you lift, as the Iyengar method does: reach both legs back toward the wall behind you with the kneecaps drawn up and the inner thighs rolling slightly inward and together, then reach on through the big toes — the height comes from a long leg, not a bent or splayed one, which is the classical content of “knees straight, toes pointed, legs glued together”.',
    'Nail the tailbone down and lengthen the front of the body along the floor. Iyengar teachers keep the buttocks working — firm, not clenched — so the pelvis does not swing up and jam the low back as the legs rise; on your winged take-off that means both hip bones equally heavy and the belly reaching forward along the mat rather than bunching, which is also the first thing to check if the low back complains.',
    'Let the wings grow out of the shoulder blades. Iyengar’s arms-back form draws the shoulder blades down away from the ears and their lower tips in toward the spine while the collarbones widen; keep exactly that action with the arms out to the sides, so the reach through the fingertips goes out and slightly back from the blades rather than up from hunched shoulders, and the chest travels forward as much as up.',
    'Keep the back of the neck long as the gaze rises. In the Iyengar method the head lifts because the chest lifts, with no congestion at the base of the skull — so look forward and up by letting the head ride the rising breastbone, as the cues already say, rather than cranking the chin toward the ceiling.',
    'Borrow the exhale. Iyengar-method teachers lift on an exhalation because it keeps the abdomen long and the low back spacious; in class you take off on the inhale as cued, but you can give every short exhale of the ten-count the same job — lengthen the front body forward on the breath out instead of letting the shape sag — so the lift stays a stretch as well as a strength.',
  ],
  stages: [
    'Wings and chest only, legs resting on the floor: lift the head, chest and both winged arms and hold the arms level — the Iyengar first stage of locust (upper body, legs down) and the very option the Take care notes give for the low back.',
    'Half locust, classical style: lift one straight leg together with the chest and the opposite winged arm while the other arm rests, then swap — Ardha Salabhasana, where each side learns the lift before both are asked for at once.',
    'Everything up with the classical arms: sweep the arms back beside the body, then lift head, chest, arms and both legs together with only the belly on the floor — Iyengar’s Salabhasana as Light on Yoga prints it, the lighter lever that teaches the whole back body to fire at once before the wings add their weight.',
    'The 26 & 2 form: arms out at shoulder height, palms down, and one inhale that lifts chest, arms, head and legs as a single piece — even an inch is the posture; then grow it a breath at a time for the full ten seconds.',
  ],
  ladder: {
    before: [
      'Salabhasana (Locust, the arms-back classical form)',
      'Utthita Trikonasana (Extended Triangle)',
      'Virabhadrasana I (Warrior I)',
      'Ardha Chandrasana (Half Moon, Iyengar’s one-leg balance)',
    ],
    beyond: [
      'Makarasana (Crocodile, the clasped-hands locust)',
      'Dhanurasana (Bow)',
      'Urdhva Mukha Svanasana (Upward-Facing Dog)',
      'Viparita Salabhasana (Inverted Locust)',
    ],
  },
};
