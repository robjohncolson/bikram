import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Prasarita_Padottanasana (prasarita = spread
//   out, pada = foot, uttana = extended; absent from the medieval hatha texts,
//   described in the 20th c. by Krishnamacharya (Yoga Makaranda, Yogasanagalu),
//   taught by Jois and Iyengar; Light on Yoga pp. 81–85; hands flat on the
//   floor, elbows at right angles, head to the ground; Ashtanga's four hand
//   variants; Parivrtta variant; Supta Konasana as the reclining relative)
// - https://en.wikipedia.org/wiki/Paschimottanasana (paschima = west, i.e. the
//   back of the body, the sushumna in the Yogabija; uttana = intense stretch;
//   Yogabija / Shiva Samhita 14th c., Hatha Yoga Pradipika 1.28–29; LoY
//   pp. 148–151 and 166; Upavishthakonasana pp. 163–165; Janu Sirsasana,
//   Dandasana and Uttanasana as relatives)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#8 Daṇḍāyamana
//   Vibhaktapāda Paścimottānāsana, "Standing Separate Leg Stretching Pose",
//   nearest classical name Prasarita Padottanasana; #10 nearest
//   Parsvottanasana; sequence devised c. 1971)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 200+ asanas, ~600
//   plates; 1–60 difficulty scale, Utthita Trikonasana at grade 3)
// - https://www.wisdomlib.org/definition/vibhakta (vibhakta = divided,
//   separated, parted; vi + bhaj)
// - https://www.yogapedia.com/definition/6449/dandayamana-bibhaktapada-paschimottanasana
//   (arms wrap outside the legs, elbows bent, hands grab the heels)
// - https://www.yogapedia.com/definition/6448/dandayamana-bibhaktapada-janushirasana
//   (bibhakta = separate, pada = foot or leg; via search summary)
// - http://apuntesyogaiyengar.blogspot.com/2011/03/prasarita-padottanasana.html
//   (Iyengar-school notes: outer edges of the feet parallel; first stage
//   fingertips beneath the shoulders with a concave spine parallel to the
//   floor; final stage palms shoulder-width on the feet's line, elbows over
//   the wrists with vertical forearms, crown of the head between the hands;
//   thighs rolled inward from the groins; hips kept over the ankles)
// - https://www.ihanuman.com/asana/prasarita-padottanasana-ii (form II: palms
//   joined behind the back in Paschima Namaskarasana; outer feet down, inner
//   thighs rolled in, crown lengthening toward the floor)
// - https://desayogi.com/prasarita-padottanasana-iyengar-yoga/ (often used as a
//   preparation for headstand; props to support the head; knees bent or head
//   supported for low-back issues; head supported for high blood pressure)
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   (authorship: https://eyalshifroni.com/blog/b-k-s-iyengars-light-on-yoga-asanas-index/)
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (Prasarita Padottanasana I #13, p. 81, intensity 4, plates 29–34;
//   Prasarita Padottanasana II #14, p. 84, intensity 4, plates 35–36;
//   Paschimottanasana p. 166 / 6 / 153–162; Upavistha Konasana p. 163 / 9 /
//   148–152; Uttanasana p. 92 / 8 / 47–48; Padangusthasana p. 89 / 3 / 43–44;
//   Padahastasana p. 91 / 6 / 45–46; Parsvottanasana p. 78 / 6 / 24–28;
//   Adho Mukha Svanasana p. 110 / 5 / 75–76; Kurmasana p. 288 / 14 / 360–367;
//   Salamba Sirsasana I p. 179 / 4 / 176–191; Supta Konasana p. 221 / 2 /
//   247–248)
// - Plates cross-checked in Iyengar-association syllabi:
//   https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Prasarita Padottanasana I 33, 34 at Level 1; II 35, 36; Parsvottanasana
//   26; Padangusthasana 44; Uttanasana 48; Upavistha Konasana 151; Adho Mukha
//   Svanasana 75; Kurmasana 363, 364; Salamba Sirsasana I 184, 185, 190)
//   https://iyengaryogacanada.com/wp-content/uploads/2019/01/syllabi_02-2018.pdf
//   (Prasarita Padottanasana I 31 "concave back", classical presentation via
//   Gem plate 18; II 35, 36; Padangusthasana 43, 44; Adho Mukha Svanasana
//   75, 76; Upavistha Konasana 148 concave / 151 classical; Kurmasana 363–364)
//   https://iyfno.no/wp-content/uploads/2021/03/Level-1_Syllabus.pdf
//   (Prasarita Padottanasana I 33, 34; Parsvottanasana 26; Padangusthasana 44;
//   Uttanasana 48; Upavistha Konasana 151; Adho Mukha Svanasana 75)
export const standingSeparateLegStretching: ClassicalNote = {
  asana: 'Prasarita Padottanasana',
  asanaEnglish: 'Wide-Legged Forward Bend',
  etymology:
    'Dandayamana — from danda, a staff — is the prefix this lineage puts on a shape “held like a rod”, standing; bibhakta is the Sanskrit vibhakta, “divided” or “parted”, in a Bengali-inflected spelling — Bengali sounds a Sanskrit v as b — and pada is the foot or leg, so bibhaktapada simply says the legs are apart. Paschima is the west, and because the tradition pictures the practitioner facing east it means the back of the body (in the subtle anatomy, the central channel along the spine); uttana is an intense stretch and asana a seat or posture — so the whole name reads “the standing, legs-parted version of the back-of-the-body stretch”, borrowed from Paschimottanasana, the seated forward bend that the Hatha Yoga Pradipika already describes in the fifteenth century. Iyengar’s name for the standing wide-leg fold keeps pada and uttana and swaps the rest: prasarita means “spread out”, and Prasarita Padottanasana is the spread-feet intense stretch — a twentieth-century pose, absent from the medieval hatha texts, described by Krishnamacharya in his 1934 Yoga Makaranda and then carried into the Ashtanga and Iyengar syllabi.',
  reference: { plates: '29–34', difficulty: 4 },
  contrast:
    'Light on Yoga treats this as one of its gentler standing poses — Prasarita Padottanasana I is graded 4, easier than Uttanasana’s 8, because spreading the legs shortens the road to the floor — and 26 & 2 reads it the same way, placing it as the breather between Balancing Stick and Triangle. The difference is in what the arms do. Iyengar sets the palms flat on the floor between the feet, on the feet’s own line and shoulder-width apart, bends the elbows to a right angle so the forearms stand vertical, and lengthens the crown of the head down between the hands with the neck long and the legs still carrying the weight; the depth is whatever the hip hinge and the hamstrings can deliver, and his second form removes the hands altogether, joining the palms behind the back so the legs own the fold entirely. 26 & 2 turns the arms into a lever: the hands wrap the heels from the outside and pull, the chin tucks, and the forehead — not the crown — is drawn toward the floor, with the weight leaning into the toes so the hips ride a little ahead of the heels, where Iyengar-school teaching keeps them stacked over the ankles. In a heated room with a counted hold the pull brings a body flat quickly and gives the arms honest work, while Iyengar’s hands-free direction trains the legs to earn the depth and, in the Iyengar method, makes the pose a common preparation for headstand, where the head must again touch the floor without bearing the body.',
  refinements: [
    'Root the fold in the feet the way Iyengar builds every standing pose: press the outer edges and outer heels down while drawing the inner arches up toward the inner groins, then roll the thighs inward from the groins and press the thighbones back. The kneecaps lift on their own — in the Iyengar method the locked knee is a lifted quadriceps, never a joint shoved backward — and the inward roll widens the sitting bones so they can rise as your cue asks.',
    'Give the fold its concave-back stage: with the hands on the shins, ankles or heels, lift the head, reach the chest forward and let the spine run long and slightly hollow, level with the floor, before the exhale takes you down. Iyengar photographs this halfway shape as a plate of its own because it is where the fold moves into the hip joints; in your hold it is the inhale-to-lengthen half of the breath cue.',
    'Once you have the heels, bend the elbows out to the sides and draw the shoulder blades away from the ears, as Iyengar squares the elbows over the flat palms. The pull then comes from the arms and the upper back with the neck free, so the chin can tuck and the forehead reach without the shoulders hunching around the head.',
    'Lean the weight toward the toes as cued, but without letting the heels lighten off the floor: Iyengar presses from the outer hip down through the outer edge of the foot in every wide-leg pose, and that grounded outer heel is what gives the hamstrings something firm to lengthen against.',
    'Treat the forehead’s touch as a touch. Iyengar teachers keep the legs carrying the body even when the crown reaches the floor, and the same holds for your forehead: the thighs stay lifted, the neck stays long, and the head never becomes a fifth foot — which also leaves you able to come up slowly and on purpose, as the blood-pressure caution asks.',
  ],
  stages: [
    'Hands on the hips or fingertips on blocks — Iyengar’s usual support — with the back concave and the head up, spine level with the floor: learn to hinge from the hips with the legs fully working before there is any pull.',
    'Hands on the floor beneath the shoulders, or on the shins or ankles as the posture itself allows, head hanging, elbows beginning to bend, the crown drifting toward the floor as each exhale lengthens the legs.',
    'Heels gripped from the outside, chin tucked, forehead drawn toward the floor between the feet — the complete 26 & 2 form.',
    'Beyond class, the classical finish and its sequel: palms flat between the feet with the forearms vertical and the crown resting lightly between them (plates 33–34), then Prasarita Padottanasana II with the palms joined behind the back and the legs carrying the whole fold.',
  ],
  ladder: {
    before: [
      'Tadasana (Mountain)',
      'Utthita Trikonasana (Extended Triangle)',
      'Adho Mukha Svanasana (Downward-Facing Dog)',
      'Padangusthasana (Big-Toe Hold, the standing forward bend)',
    ],
    beyond: [
      'Prasarita Padottanasana II (Wide-Legged Forward Bend, palms joined behind the back)',
      'Uttanasana (Intense Forward Stretch)',
      'Upavistha Konasana (Seated Wide-Angle Forward Bend)',
      'Kurmasana (Tortoise)',
    ],
  },
};
