import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Bhujangasana (bhujanga = snake; the pose is
//   described in Gheranda Samhita 2.42–43, named Sarpasana in the 19th-c.
//   Sritattvanidhi, illustrated as Bhujangasana in the 1905 Yogasopana
//   Purvacatuska; Light on Yoga "Bhujangasana I (Plate 73)", pp. 107–108;
//   classical form: back arched until the arms are straight, legs stay on the
//   floor — the thing that separates it from Upward Dog; Bikram's cobra rises
//   "as far as possible" on back strength alone; Sphinx = Salamba
//   Bhujangasana; Salabhasana listed as preparatory, Balasana as counterpose)
// - https://www.wisdomlib.org/definition/bhujangasana (bhuja "curved" + ga
//   "going" → snake; Gheranda Samhita: body from toes to navel on the ground,
//   palms down, head raised like a serpent; traditionally said to raise bodily
//   heat and rouse kundalini)
// - https://archive.org/stream/Gheranda_Samhita/Gheranda%20samhita_djvu.txt
//   (Vasu's 1914 translation of 2.42–43, confirming the navel-down detail)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#16 Cobra Pose,
//   Bhujangasana — same name in both lineages; #15 Sit-up, #17 Locust)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; ~200 asanas, 600
//   photographs; 1–60 difficulty grades; pranayama section; course appendix)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Bhujangasana I #31, p. 107, intensity 1, plates 72–73; Bhujangasana II
//   #189, p. 396, intensity 37, plates 548–550; Salabhasana #25, p. 99,
//   intensity 1, plates 60–61; Makarasana #26, p. 100, plate 62; Dhanurasana
//   #27, p. 101, intensity 4, plate 63; Chaturanga Dandasana #29, p. 104,
//   intensity 1, plates 66–67; Urdhva Mukha Svanasana #32, p. 108, intensity 1,
//   plate 74; Adho Mukha Svanasana #33, p. 110, intensity 5, plates 75–76;
//   Ustrasana #16, p. 87, intensity 3, plates 40–41; Rajakapotasana #190,
//   p. 397, intensity 38, plates 551–552; Viparita Salabhasana #197, p. 416,
//   intensity 58, plate 584)
// - Plate 73 cross-checked in three Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (all three list Bhujangasana I 73 beside Salabhasana 60, Makarasana 62,
//   Dhanurasana 63, Urdhva Mukha Svanasana 74, Ustrasana 41 at the entry level;
//   the UK sheet files Bhujangasana II 550 and Rajakapotasana 551 at its top)
// - https://www.ihanuman.com/asana/bhujangasana (Iyengar-lineage teaching:
//   palms placed beside the waist, arms press straight until only the pubis
//   still touches; inner thighs roll in, knees tight, toes reach straight back;
//   buttock flesh pressed forward toward the pubis; outer shoulders roll back,
//   shoulder blades down, collarbones broad, lift from the top of the chest
//   under the armpits; back of the neck kept long — trapezius creeping up the
//   neck is the listed fault; inhale to rise, exhale to bend the elbows and
//   rest, repeated two or three times; wrists turned out for wrist pain;
//   Chaturanga, Adho/Urdhva Mukha Svanasana and Supta Virasana as preparation;
//   Dhanurasana, Salabhasana, Ustrasana, Urdhva Dhanurasana as follow-ups)
// - https://yogavastu.com/p/bhujangasana/ (Iyengar-method teaching: one of the
//   "baby backbends" that prepares the bigger ones; hips pressed down, kneecaps
//   pointing at the floor, toes reaching back; an even curve through thoracic
//   and lumbar; used for length in the low back)
// - https://en.wikipedia.org/wiki/Urdhva_Mukha_Svanasana (LoY p. 108, plate
//   74; hips, thighs and knees lift off the floor, unlike cobra)
// - https://en.wikipedia.org/wiki/Salabhasana (LoY 1966; Bikram's staged
//   one-leg / one-leg / both-legs version follows Bhujangasana)
// - https://en.wikipedia.org/wiki/Makarasana (LoY pp. 100–101: a Salabhasana
//   variant, fingers interlocked behind the head, head and legs raised)
// - https://en.wikipedia.org/wiki/Dhanurasana (LoY pp. 101–102; Salabhasana
//   as the easier prone backbend before it)
// - https://en.wikipedia.org/wiki/Ustrasana (LoY pp. 87–88; also #22 of the
//   Bikram sequence)
export const cobra: ClassicalNote = {
  asana: 'Bhujangasana I',
  asanaEnglish: 'Cobra Pose',
  etymology:
    'Bhujanga is the serpent — literally “the one that goes in curves”, from bhuja, a bend (the same word names the arm), and ga, going — and asana is a seat or posture. The name is old: the seventeenth-century Gheranda Samhita already lists the pose as Bhujangasana, and a nineteenth-century Mysore manual calls the same shape Sarpasana, from sarpa, another word for snake. This is one of the few places where the two lineages agree on the name without any translation needed.',
  reference: { plates: '72–73', difficulty: 1 },
  contrast:
    'Iyengar’s Bhujangasana I sits at plates 72–73 and is graded 1 — the easiest rung of his sixty — and it is a hands-assisted arch: the palms are placed back beside the waist, the arms press to straight, and the trunk rises until only the pubic bone still touches, buttocks firm and thighs tight, held on ordinary breathing and repeated two or three times. 26 & 2 keeps the palms under the shoulders, pins the elbows bent, lets the hands go almost weightless and stops at the navel — a half cobra on purpose — because here the lift belongs to the back extensors, and the posture is the first strength rung of a series (Locust, Full Locust, Bow) rather than the front-body opening it is in Light on Yoga. The oldest description, in the Gheranda Samhita, keeps the body from the navel down on the ground and raises the head like a snake — closer in outline to the 26 & 2 navel-down cobra than to the classical straight-arm form, though neither lineage takes the old text as a technique manual. Iyengar files locust, crocodile and bow before cobra and follows it immediately with Urdhva Mukha Svanasana (plate 74, also grade 1), where thighs and knees leave the floor; 26 & 2 runs the same family in the opposite order, cobra first, so that the back is awake before the legs are asked to lift. And the classical cobra keeps climbing long after the beginner’s form: Bhujangasana II (grade 37) brings the feet toward the back of the head, and Rajakapotasana (grade 38) completes the arc — the ladder your ten-second half cobra is standing at the foot of.',
  refinements: [
    'Set the legs the way Iyengar sets them: inner thighs roll inward and down, kneecaps pointing straight at the floor, toes reaching straight back — and then the flesh of the buttocks presses forward toward the pubic bone rather than merely clenching. That gives the 26 & 2 “squeeze the glutes” a direction: the pelvis lengthens forward, and the low back gets length as well as lift.',
    'Arrange the shoulders before the spine moves: outer upper arms roll back, shoulder blades slide down toward the waist, collarbones widen. In the Iyengar method the rise starts from the top of the chest under the armpits — which is the mechanical content of the 26 & 2 cue to reach the chest forward as much as up, and it keeps the arch out of the neck.',
    'Treat the hands as a frame, not a lever. Iyengar’s palms sit back beside the waist and press all the way to straight arms; yours stay under the shoulders and barely bear weight. What transfers is the arm action itself — elbows spiralling in against the ribs, wrists light, the upper arm bones settled back into their sockets — while the back does the lifting.',
    'Keep the back of the neck long even as the eyes travel upward: lift from the base of the skull instead of dropping the head back, so the trapezius does not bunch beneath the skull — the fault Iyengar-trained teachers watch for. If the neck is asking for it, take the gaze level, as the 26 & 2 caution already allows.',
  ],
  stages: [
    'Sphinx — Salamba Bhujangasana, a modern supported cobra with the forearms on the floor and the elbows under the shoulders: practise the leg, buttock and shoulder-blade actions with the spine propped and no decision yet about the neck.',
    'Iyengar’s own first stage of Bhujangasana I: palms pressed lightly, head and chest lifted a few inches, gaze forward. This is also the neck-safe 26 & 2 cobra; hold here with level eyes until the neck is ready to follow the lift.',
    'The 26 & 2 half cobra fully expressed: navel on the floor, elbows bent and glued to the ribs, hands nearly floating, eyes to the ceiling, every inch of the lift from the back. This is the posture, not a step toward one.',
    'Outside the counted set, the classical Bhujangasana I as its own practice: hands walked back beside the waist, arms straightening, trunk rising until only the pubic bone stays down. In class you stop at the navel — the two forms are different postures with the same name.',
  ],
  ladder: {
    before: [
      'Salabhasana (Locust)',
      'Chaturanga Dandasana (Four-Limbed Staff)',
      'Supta Virasana (Reclining Hero)',
      'Adho Mukha Svanasana (Downward-Facing Dog)',
    ],
    beyond: [
      'Urdhva Mukha Svanasana (Upward-Facing Dog)',
      'Dhanurasana (Bow)',
      'Ustrasana (Camel)',
      'Bhujangasana II (Cobra II, feet toward the head)',
    ],
  },
};
