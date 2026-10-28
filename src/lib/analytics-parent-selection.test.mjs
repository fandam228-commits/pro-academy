import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveParentAnalyticsStudent } from './analytics-parent-selection.mjs';
test('ambiguous parent selection is rejected', () => { assert.equal(resolveParentAnalyticsStudent(null, ['a','b']).status, 'ambiguous'); });
