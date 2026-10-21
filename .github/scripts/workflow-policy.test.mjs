import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectPullRequest } from './workflow-policy.mjs';

const pr = (head = 'issue/12-fix-build', base = 'staging', body = 'Closes #12') => ({
  head: { ref: head, repo: { full_name: 'quangtinator/example' } }, base: { ref: base }, body,
});
test('issue work enters staging with a matching openable issue reference', () => {
  assert.equal(inspectPullRequest(pr(), 'quangtinator/example'), 12);
});
test('only staging can be promoted into production', () => {
  assert.equal(inspectPullRequest(pr('staging', 'main'), 'quangtinator/example'), 12);
  assert.throws(() => inspectPullRequest(pr('issue/12-fix-build', 'main'), 'quangtinator/example'), /promoted/);
});
test('branch issue number must match the issue in the description', () => {
  assert.throws(() => inspectPullRequest(pr('issue/13-fix-build'), 'quangtinator/example'), /issue\/12/);
});
test('missing issue and invalid issue numbers are rejected', () => {
  for (const body of ['', 'Related to #12', 'Closes #0']) assert.throws(() => inspectPullRequest(pr(undefined, undefined, body), 'quangtinator/example'));
});
test('a fork cannot publish a staging deployment through this workflow', () => {
  assert.throws(() => inspectPullRequest(pr(), 'another/example'), /this repository/);
});
test('unsupported targets and malformed branch names are rejected', () => {
  assert.throws(() => inspectPullRequest(pr('issue/12-fix-build', 'release'), 'quangtinator/example'));
  assert.throws(() => inspectPullRequest(pr('issue/12-../main'), 'quangtinator/example'));
});
