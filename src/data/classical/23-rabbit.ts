import type { ClassicalNote } from '../types';

// Sources consulted (facts only; wording original):
// - https://en.wikipedia.org/wiki/Balasana (Balasana is not described before
//   the 20th c. — a similar pose in Niels Bukh's 1924 Primary Gymnastics; the
//   article lists "Shasangasana / Sasangasana (Rabbit Pose)" as a separate
//   similar pose: tailbone lifted until the thighs are vertical, head and arms
//   pointing back toward the feet, an intense flexion of the spine; cites the
//   Yoga International article below)
// - https://en.wikipedia.org/wiki/Postures_of_Bikram_Yoga (#23 Rabbit Pose,
//   Sanskrit given as Śasāṁgāsanā; "nearest equivalent in other schools" =
//   Balasana; #21 Half Tortoise is also mapped to Balasana; #22 Camel =
//   Ustrasana; #24 = Janu Sirsasana; the sequence devised by Bikram Choudhury
//   around 1971)
// - https://en.wikipedia.org/wiki/List_of_asanas (no hare/rabbit row at all;
//   Balasana 20th c.; Karnapidasana 20th c., LoY; Halasana 19th c.
//   Sritattvanidhi; Virasana and Vajrasana are meditation seats)
// - https://en.wikipedia.org/wiki/Light_on_Yoga (1966; 200-odd asanas, ~600
//   photographs; each asana graded 1–60; asana section then pranayama; no
//   mention of a rabbit, hare or child's pose)
// - https://en.wiktionary.org/wiki/शश (śaśa: hare/rabbit; also the lunar
//   maria, traditionally seen as a hare; from Proto-Indo-Iranian *ćasás, PIE
//   *ḱeh₂s-, cognate with English "hare"; derived śaśin "moon", śaśāṅka
//   "moon", literally "marked by a hare")
// - https://en.wiktionary.org/wiki/अङ्क (aṅka: hook, curve, side/flank, the
//   bend of the arm/lap, any mark or line, a numeral)
// - https://yogainternational.com/article/view/learn-sasangasana-rabbit-pose/
//   (the moon called sasanga, "having the marks of a hare"; kneeling on a
//   folded blanket; cup the heels or clasp the ankles, thumbs out; chin to the
//   collarbones, crown down, buttocks raised until the thighs approach
//   vertical; a head-weight test — no more than you could press with a hand;
//   hips back toward the heels if the breath is pinched; counter to Camel)
// - https://www.yogapedia.com/definition/6516/shashankasana-yoga and
//   https://www.rishikulyogshala.org/blog/7-incredible-health-benefits-of-hare-pose-shashankasana/
//   (the Bihar-school hare pose: from Vajrasana, arms raised overhead, fold
//   until hands and forehead rest on the floor; glossed shash = hare, ank =
//   lap, with an alternative "moon" reading)
// - https://www.animalia-asana.org/hare-shashankasana/ (Shashankasana is
//   attributed to Swami Satyananda's Asana Pranayama Mudra Bandha) and a web
//   search confirming that book was first published by the Bihar School of
//   Yoga in 1969
// - https://loyindex.org → Eyal Shifroni's published Light on Yoga index sheet
//   https://docs.google.com/spreadsheets/d/e/2PACX-1vSAM6Wu_-FRfZKpiZtgM1qMR40VhJMmUhKcS6MtCO7h7O1Y0_jrh9PiCnBjSitdQq8p-TkuMb-WfsyN/pub?output=csv
//   (208 entries; NO row containing Sasa/Sasanka/Shashank/Sasang/rabbit/hare/
//   Bala; no Adho Mukha Virasana row either. Halasana #91 p. 216 grade 4
//   plates 238–244; Karnapidasana #92 p. 220 grade 1 plates 245–246; Salamba
//   Sirsasana I #74 p. 179 grade 4 plates 176–191; Salamba Sarvangasana I #87
//   p. 205 grade 2 plates 219–234; Virasana #40 p. 120 grade 1 plates 85–92;
//   Yoga Mudrasana #56 p. 144 grade 6 plates 120–122; Pindasana in
//   Sarvangasana #103 p. 234 grade 5 plates 268–269; Kurmasana #133 p. 288
//   grade 14 plates 360–367; Paschimottanasana #67 p. 166 grade 6 plates
//   153–162; Ustrasana #16 p. 87 grade 3 plates 40–41)
// - https://iyengaryoga.org.uk/wp-content/uploads/2022/09/I8-Teaching-syllabi.pdf
//   (Adho Mukha Virasana sits in the introductory forward-extension group with
//   no plate number; Halasana 244; Karnapidasana 246; Salamba Sirsasana I
//   184, 185, 190; Salamba Sarvangasana I 223, 224; Supta Konasana 247)
// - https://en.wikipedia.org/wiki/Halasana (hala = plough; a 19th-c.
//   Langalasana in the Sritattvanidhi; entered from Sarvangasana;
//   Karnapidasana introduced by Vishnudevananda in 1960 and described by
//   Iyengar in Light on Yoga pp. 216–219; Parsva Halasana and Supta Konasana
//   as the other variants)
// - https://en.wikipedia.org/wiki/Karnapidasana (karṇa = ear, pīḍ = to
//   squeeze; a Halasana variation with the knees bent beside the head)
// - https://en.wikipedia.org/wiki/Shirshasana (śīrṣa = head, sālamba =
//   supported; Light on Yoga pp. 179–203 with ten variants; weight on the
//   forearms and the crown)
// - https://en.wikipedia.org/wiki/Bandha_(yoga) (Jalandhara Bandha: neck
//   extended, sternum raised, chin lowered to the chest)
// - https://www.ihanuman.com/asana/karnapidasana (Iyengar-method teaching:
//   from Halasana, knees to the floor beside the ears; head, neck, shoulders
//   and upper arms support; the back lifts up against the thighs' pressure on
//   the trunk; hands beside the spine; toes on a chair if the abdomen is
//   crowded)
// - https://www.ihanuman.com/asana/halasana (arms rotated out to take the
//   shoulders underneath and lift the chest; shoulders on folded blankets;
//   palms press the back to lift the waist and chest, trunk perpendicular)
// - https://yogavastu.com/p/headstand-preparation-with-blocks/ (forearms
//   flat, fingers interlocked behind the skull, crown on the floor, feet
//   walked in toward the trunk, hips lifted high, arms and shoulders doing
//   the work; care with neck, shoulder or back pain)
// - https://yogaselection.com/how-to-do-sirsasana-headstand-step-by-step/
//   (the top of the head placed so the neck keeps its curve; elbows
//   shoulder-width; forearms press down so the shoulders lift and spread;
//   minimal weight on the head; feet walk toward the elbows as the pelvis
//   lifts; a staged progression with blocks)
// - https://yogaselection.com/adho-mukha-virasana/ and
//   https://yogavastu.com/p/virasana-forward/ (big toes together, knees apart
//   at rib width, pelvis on the heels or a folded blanket between them; the
//   spine lengthens forward; head on the mat, a block, or lifted; a
//   counterpose after chest-opening and a recovery position usable anywhere
//   in a sequence)
// - https://courses.bikramyogaworks.com/pages/sasangasana-rabbit-pose (26 & 2
//   execution: heels gripped thumbs outside, fingers inside; chin to chest;
//   forehead to the knees, crown to the floor; hips lifted as high as
//   possible, rolling like a wheel until the arms are straight; beginners
//   stretch only the neck and upper spine at first; two sets)
//
// No `reference`: Light on Yoga has no rabbit, hare or child's pose, so there
// are no plates or grade to cite for the 26 & 2 form itself; the relatives'
// plates above are recorded here for the ladder, not as a reference.
export const rabbit: ClassicalNote = {
  asana: null,
  etymology:
    'Śaśa is the hare — a word old enough to be a cousin of the English one — and śaśāṅka, “hare-marked”, is a Sanskrit name for the moon, whose dark patches were traditionally seen as a hare rather than a face; aṅka, the mark, is also a hook, a curve and a lap, which is why some teachers gloss the name as the hare curled in its lap. Sasangasana is 26 & 2’s spelling of that hare-moon pose, and the shape earns both readings: a small round animal folded on itself, and a crescent. The name clashes with another, though — the Shashankasana of the Bihar School (Satyananda’s Asana Pranayama Mudra Bandha, 1969) is a kneeling fold from Vajrasana with the forehead and the arms laid on the floor in front — a cousin of child’s pose, not of the lifted, rolled-forward ball you make here.',
  contrast:
    'There is no rabbit in Light on Yoga — no hare, and no child’s pose either — so this posture has to be read against three classical neighbours, each of which holds one piece of it. The base and the fold belong to Adho Mukha Virasana, the Iyengar method’s downward-facing hero (a staple of Iyengar teaching that the 1966 book itself does not list): buttocks on the heels, forehead on the floor or a block, the spine lengthening forward as a rest or a counterpose after chest-opening — which is exactly the job Rabbit does after Camel, except that 26 & 2 refuses to let it be a rest, lifting the hips off the heels until the thighs stand nearly vertical and rolling the spine into the fullest flexion of the class. The curve and the chin lock belong to Halasana and its knees-bent cousin Karnapidasana, which Iyengar grades 1 of 60 and files in the shoulderstand cycle: the same C-shaped spine and chin pressed to the chest, turned upside down — there the knees come down to the ears, here the forehead comes to the knees — with the weight carried on shoulders raised on folded blankets and the trunk asked to lift up against the pressure of the thighs, where 26 & 2 sets the crown lightly on the floor and asks the arms, pulling on the heels, to carry everything. The crown-on-the-floor mechanic itself is Iyengar’s headstand preparation — feet walking in, hips lifted high, forearms taking the load, only a light touch on the top of the head — a long-spined position pointing toward inversion, whereas Rabbit keeps the weightless head and rounds the spine on purpose. The reason for the difference is the sequence: Iyengar’s forward bends are mostly long-spine extensions and he saves the tight ball for the inverted cycle, where the shoulders take the weight; 26 & 2 needs one posture that answers Camel’s maximum extension with maximum flexion at once — two counted sets of about twenty seconds in a hot room — and so it builds a kneeling plough and trusts your grip on your heels to keep the neck out of it.',
  refinements: [
    'Find the crown before you fold. Iyengar’s headstand teaching is precise about the contact point — the very top of the skull, so the neck keeps its natural curve and neither the hairline nor the back of the head takes the floor; here the forehead touches the knees, so the crown lands just in front of them, and if you feel the contact sliding toward the hairline, walk the knees in rather than pushing the head further.',
    'Treat the arms as the strut. In Iyengar’s headstand preparation the forearms press down so that the shoulders lift and the head barely touches; in Rabbit the pull on the heels is that same action turned around — the arms straightening as the hips rise so that the weight travels from the pelvis into the hands, and the head stays as light as something you could rest a palm on.',
    'Lift the shoulder blades away from the ears — a constant instruction in the Iyengar method’s Sirsasana and Halasana — by drawing them toward the hips as you pull on the heels; the back of the neck can lengthen only when the shoulders leave it alone.',
    'Build the chin lock from the breastbone. Classical Jalandhara Bandha begins with the sternum lifting to meet a dropping chin, not with the head dragged down; in Rabbit, lifting the chest a fraction into the tuck deepens the throat compression the posture wants while keeping the back of the neck long.',
    'Lengthen against the fold. In Karnapidasana the Iyengar method asks the back to lift up against the thighs pressing on the trunk, so that the curve is stretched open rather than crushed shut; the 26 & 2 cue to roll forward one vertebra at a time is the same idea — the rising hips create the space, and each exhale is spent on length, not on collapse.',
  ],
  stages: [
    'Sitting on the heels with the heels gripped, chin drawn to the chest and only the neck and upper back rounding — the head stays off the floor; this is also the version the neck caution asks for, and it is a complete practice of the throat lock in its own right.',
    'Forehead to the knees and crown to the floor with the hips still resting on or near the heels — Adho Mukha Virasana with a heel grip, and the Iyengar method’s resting shape; a folded towel under the knees if they complain.',
    'Hips lifting halfway while the forehead stays glued to the knees and the arms bend as much as they must — the weight moving into the hands, the crown no heavier than before; if the forehead loses the knees, walk the knees in.',
    'The full roll: hips high, thighs approaching vertical, arms straight, a feather of contact at the crown — and, outside class, Karnapidasana on folded blankets as the Iyengar-method way to feel the same curve with the shoulders carrying the load instead of the arms.',
  ],
  ladder: {
    before: [
      'Virasana (Hero)',
      'Adho Mukha Virasana (Downward-Facing Hero)',
      'Halasana (Plough)',
      'Karnapidasana (Ear-Pressure Pose)',
    ],
    beyond: [
      'Salamba Sirsasana I (Supported Headstand)',
      'Pindasana in Sarvangasana (Embryo in Shoulderstand)',
      'Yoga Mudrasana (Yoga Seal)',
      'Kurmasana (Tortoise)',
    ],
  },
};
