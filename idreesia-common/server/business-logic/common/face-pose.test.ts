import { describe, expect, it } from 'vitest';

import { faceFrontalScore } from './face-pose';

// Landmarks: right eye, left eye, nose tip, right mouth corner, left mouth corner. A frontal face
// as YuNet marks it on a typical registration photo: eyes level, nose centred, mouth below.
const frontal: [number, number][] = [
  [30, 40],
  [70, 40],
  [50, 62.2],
  [35, 80],
  [65, 80],
];

const shiftNose = (dx: number, dy = 0): [number, number][] =>
  frontal.map((p, i) => (i === 2 ? [p[0] + dx, p[1] + dy] : p)) as [number, number][];

describe('faceFrontalScore', () => {
  it('scores a frontal face at or near 100', () => {
    expect(faceFrontalScore(frontal)).toBeGreaterThanOrEqual(95);
  });

  it('drops as the head turns (nose moves sideways)', () => {
    const slight = faceFrontalScore(shiftNose(5));
    const turned = faceFrontalScore(shiftNose(14));
    expect(slight).toBeLessThan(100);
    expect(turned).toBeLessThan(slight);
    expect(faceFrontalScore(shiftNose(20))).toBe(0);
  });

  it('drops as the head tips up or down (nose moves vertically)', () => {
    expect(faceFrontalScore(shiftNose(0, 8))).toBeLessThan(faceFrontalScore(frontal));
    expect(faceFrontalScore(shiftNose(0, -12))).toBeLessThan(50);
  });

  it('ignores head tilt (roll)', () => {
    const angle = Math.PI / 6;
    const rotated = frontal.map(([x, y]) => [
      50 + (x - 50) * Math.cos(angle) - (y - 60) * Math.sin(angle),
      60 + (x - 50) * Math.sin(angle) + (y - 60) * Math.cos(angle),
    ]) as [number, number][];
    expect(Math.abs(faceFrontalScore(rotated) - faceFrontalScore(frontal))).toBeLessThanOrEqual(2);
  });

  it('scores 0 when the eyes coincide', () => {
    expect(faceFrontalScore(frontal.map(() => [50, 50]) as [number, number][])).toBe(0);
  });
});
