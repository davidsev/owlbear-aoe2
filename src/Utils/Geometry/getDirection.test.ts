import assert from 'node:assert/strict';
import { suite, test } from 'node:test';
import { getDiagonalDirection4, getDirection4, getDirection8 } from './getDirection';

const EPS = 1e-6;

function vectorAtAngle(angle: number): { x: number; y: number } {
    return { x: Math.cos(angle), y: Math.sin(angle) };
}

suite('getDirection8', () => {
    test('returns null for a zero vector', () => {
        assert.equal(getDirection8({ x: 0, y: 0 }), null);
    });

    const cases8: [{ x: number; y: number }, { x: number; y: number }][] = [
        [
            { x: 10, y: 0 },
            { x: 1, y: 0 },
        ],
        [
            { x: 10, y: 10 },
            { x: 1, y: 1 },
        ],
        [
            { x: 0, y: 10 },
            { x: 0, y: 1 },
        ],
        [
            { x: -10, y: 10 },
            { x: -1, y: 1 },
        ],
        [
            { x: -10, y: 0 },
            { x: -1, y: 0 },
        ],
        [
            { x: -10, y: -10 },
            { x: -1, y: -1 },
        ],
        [
            { x: 0, y: -10 },
            { x: 0, y: -1 },
        ],
        [
            { x: 10, y: -10 },
            { x: 1, y: -1 },
        ],
    ];
    for (const [input, expected] of cases8) {
        test(`snaps ${JSON.stringify(input)} to the nearest 8th direction ${JSON.stringify(expected)}`, () => {
            const result = getDirection8(input);
            assert.equal(result?.x, expected.x);
            assert.equal(result?.y, expected.y);
        });
    }

    const boundaryCases8: [string, number, { x: number; y: number }][] = [
        ['just below 0.125π', 0.125 * Math.PI - EPS, { x: 1, y: 0 }],
        ['just above 0.125π', 0.125 * Math.PI + EPS, { x: 1, y: 1 }],
        ['just below -0.125π', -(0.125 * Math.PI - EPS), { x: 1, y: 0 }],
        ['just above -0.125π', -(0.125 * Math.PI + EPS), { x: 1, y: -1 }],
        ['just below 0.375π', 0.375 * Math.PI - EPS, { x: 1, y: 1 }],
        ['just above 0.375π', 0.375 * Math.PI + EPS, { x: 0, y: 1 }],
        ['just below -0.375π', -(0.375 * Math.PI - EPS), { x: 1, y: -1 }],
        ['just above -0.375π', -(0.375 * Math.PI + EPS), { x: 0, y: -1 }],
        ['just below 0.625π', 0.625 * Math.PI - EPS, { x: 0, y: 1 }],
        ['just above 0.625π', 0.625 * Math.PI + EPS, { x: -1, y: 1 }],
        ['just below -0.625π', -(0.625 * Math.PI - EPS), { x: 0, y: -1 }],
        ['just above -0.625π', -(0.625 * Math.PI + EPS), { x: -1, y: -1 }],
        ['just below 0.875π', 0.875 * Math.PI - EPS, { x: -1, y: 1 }],
        ['just above 0.875π', 0.875 * Math.PI + EPS, { x: -1, y: 0 }],
        ['just below -0.875π', -(0.875 * Math.PI - EPS), { x: -1, y: -1 }],
        ['just above -0.875π', -(0.875 * Math.PI + EPS), { x: -1, y: 0 }],
    ];
    for (const [description, angle, expected] of boundaryCases8) {
        test(`snaps an angle ${description} to ${JSON.stringify(expected)}`, () => {
            const result = getDirection8(vectorAtAngle(angle));
            assert.equal(result?.x, expected.x);
            assert.equal(result?.y, expected.y);
        });
    }
});

suite('getDirection4', () => {
    test('returns null for a zero vector', () => {
        assert.equal(getDirection4({ x: 0, y: 0 }), null);
    });

    const cases4: [{ x: number; y: number }, { x: number; y: number }][] = [
        [
            { x: 10, y: 1 },
            { x: 1, y: 0 },
        ],
        [
            { x: -10, y: 1 },
            { x: -1, y: 0 },
        ],
        [
            { x: 1, y: 10 },
            { x: 0, y: 1 },
        ],
        [
            { x: 1, y: -10 },
            { x: 0, y: -1 },
        ],
    ];
    for (const [input, expected] of cases4) {
        test(`snaps ${JSON.stringify(input)} to the nearest 4th direction ${JSON.stringify(expected)}`, () => {
            const result = getDirection4(input);
            assert.equal(result?.x, expected.x);
            assert.equal(result?.y, expected.y);
        });
    }

    const boundaryCases4: [string, number, { x: number; y: number }][] = [
        ['just below 0.25π', 0.25 * Math.PI - EPS, { x: 1, y: 0 }],
        ['just above 0.25π', 0.25 * Math.PI + EPS, { x: 0, y: 1 }],
        ['just below -0.25π', -(0.25 * Math.PI - EPS), { x: 1, y: 0 }],
        ['just above -0.25π', -(0.25 * Math.PI + EPS), { x: 0, y: -1 }],
        ['just below 0.75π', 0.75 * Math.PI - EPS, { x: 0, y: 1 }],
        ['just above 0.75π', 0.75 * Math.PI + EPS, { x: -1, y: 0 }],
        ['just below -0.75π', -(0.75 * Math.PI - EPS), { x: 0, y: -1 }],
        ['just above -0.75π', -(0.75 * Math.PI + EPS), { x: -1, y: 0 }],
    ];
    for (const [description, angle, expected] of boundaryCases4) {
        test(`snaps an angle ${description} to ${JSON.stringify(expected)}`, () => {
            const result = getDirection4(vectorAtAngle(angle));
            assert.equal(result?.x, expected.x);
            assert.equal(result?.y, expected.y);
        });
    }
});

suite('getDiagonalDirection4', () => {
    test('returns null for a zero vector', () => {
        assert.equal(getDiagonalDirection4({ x: 0, y: 0 }), null);
    });

    const casesDiag: [{ x: number; y: number }, { x: number; y: number }][] = [
        [
            { x: 5, y: 1 },
            { x: 1, y: 1 },
        ],
        [
            { x: -5, y: 1 },
            { x: -1, y: 1 },
        ],
        [
            { x: 5, y: -1 },
            { x: 1, y: -1 },
        ],
        [
            { x: -5, y: -1 },
            { x: -1, y: -1 },
        ],
    ];
    for (const [input, expected] of casesDiag) {
        test(`reduces ${JSON.stringify(input)} to the quadrant sign ${JSON.stringify(expected)}`, () => {
            const result = getDiagonalDirection4(input);
            assert.equal(result?.x, expected.x);
            assert.equal(result?.y, expected.y);
        });
    }
});
