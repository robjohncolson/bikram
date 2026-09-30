import { expect, it } from 'vitest';
import { getLibraryAsana, libraryAsanas } from './index';
import type { RigData } from '../types';

const sheets = Object.values(import.meta.glob<RigData>('../rig/library/*.json', { eager: true, import: 'default' }));

it.each([
  ['baddha-konasana', 'Stretch the legs out straight.', 'Legs long'],
  // the recross sheets animate their finish (RECROSS_SHEETS)
  ['baddha-padmasana', 'stretch the legs out to rest.', 'Legs long (other crossing)'],
  ['matsyasana', 'rest with both legs straight.', 'Legs long (other crossing)'],
  ['parvatasana', 'rest with the legs straight.', 'Legs long (other crossing)'],
  ['parsva-pindasana-in-sarvangasana', 'to finish in straight shoulderstand.', 'Straight shoulderstand'],
  ['urdhva-padmasana-in-sarvangasana', 'return to the shoulderstand.', 'Shoulderstand'],
  ['urdhva-padmasana-in-sarvangasana', 'lie flat.', 'Lie down'],
  ['eka-pada-sarvangasana', 'Slide down slowly and rest.', 'Lie down'],
  ['halasana', 'Lie flat on the back and relax.', 'Lie down'],
  ['karnapidasana', 'Slide down slowly and lie flat.', 'Lie down'],
  ['parsvaika-pada-sarvangasana', 'Slide down slowly and rest.', 'Lie down'],
  ['padangusthasana', 'take the head down between the knees.', 'Head down'],
  ['virabhadrasana-i', 'Bring the feet together, lower the arms and stand in Tadasana.', 'Stand'],
])('%s selects the completed position for %s', (id, ending, label) => {
  const step = getLibraryAsana(id)!.steps.find((s) => s.text.endsWith(ending));
  expect(step, ending).toBeDefined();
  expect(step!.stage).toBeDefined();
  const sheet = sheets.find((d) => d.id === `library:${id}`)!;
  expect(sheet.stages[step!.stage!].label).toBe(label);
});

it.each([
  ['ardha-baddha-padma-paschimottanasana', 'Stretch the right leg out beside the left.'],
  ['ardha-matsyendrasana', 'Stretch the right leg out beside it.'],
  ['ardha-navasana', 'Release the hands.'],
  ['bharadvajasana', 'Stretch the left leg out beside it.'],
  ['janu-sirsasana', 'Straighten the right leg and return to the staff.'],
  ['marichyasana-i', 'Straighten the right leg to return to the staff.'],
  ['marichyasana-ii', 'Extend the right leg to finish.'],
  ['padmasana', 'Stretch both legs out to rest.'],
  ['parsva-halasana', 'Lower your back and legs to the floor and rest.'],
  ['parsvottanasana', 'Bring the feet together and lower the arms into Tadasana.'],
  ['pindasana-in-sarvangasana', 'Release the other foot and return to shoulderstand.'],
  ['siddhasana', 'Release the right heel and stretch both legs out.'],
  ['supta-konasana', 'Lower your back and legs to the floor and rest.'],
  ['supta-padangusthasana', 'Lower the right leg beside the left.'],
  ['trianga-mukhaikapada-paschimottanasana', 'Extend the left leg into the staff.'],
  ['urdhva-dandasana', 'Raise the head and rest.'],
  ['urdhva-dhanurasana', 'Bring the arms down, lengthen the legs and rest.'],
  ['urdhva-mukha-svanasana', 'Settle onto the floor and rest.'],
  ['ustrasana', 'Sit down on the floor and relax.'],
])('%s leaves the unanimated finish unbound', (id, text) => {
  const step = getLibraryAsana(id)!.steps.find((s) => s.text.startsWith(text));
  expect(step, text).toBeDefined();
  expect(step!.stage).toBeUndefined();
});

it('keeps every library step in nondecreasing stage order', () => {
  expect(libraryAsanas).toHaveLength(56);
  for (const pose of libraryAsanas) {
    const stages = pose.steps.flatMap((step) => step.stage === undefined ? [] : [step.stage]);
    expect(stages, pose.id).toEqual([...stages].sort((a, b) => a - b));
  }
});

it('keeps the plough descent separate from the flat rest', () => {
  const step = getLibraryAsana('halasana')!.steps.find((s) => s.stage === 8)!;
  expect(step.text).toBe('Begin to slide down slowly.');
});
