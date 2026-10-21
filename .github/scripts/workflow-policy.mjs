import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function inspectPullRequest(pr, repository) {
  if (pr.head.repo?.full_name !== repository) throw new Error('Use a branch in this repository.');
  if (!['main', 'staging'].includes(pr.base.ref)) throw new Error('Target staging or main.');
  const reference = pr.body?.match(/\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#([1-9]\d*)\b/i);
  if (!reference) throw new Error('Include Closes #<issue-number> in the pull request description.');
  const issue = Number(reference[1]);
  if (pr.base.ref === 'main') {
    if (pr.head.ref !== 'staging') throw new Error('Production changes must be promoted from staging.');
  } else if (!new RegExp(`^issue/${issue}-[a-z0-9]+(?:-[a-z0-9]+)*$`).test(pr.head.ref)) {
    throw new Error(`Use issue/${issue}-description for the linked issue.`);
  }
  return issue;
}

export function stagingEvidenceUrl(api, sha) {
  return `${api}/deployments?sha=${encodeURIComponent(sha)}&environment=staging`;
}

export async function run() {
  const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
  if (!event.pull_request) throw new Error('This check requires a pull_request event.');
  const repository = process.env.GITHUB_REPOSITORY;
  const issue = inspectPullRequest(event.pull_request, repository);
  const response = await fetch(`${process.env.GITHUB_API_URL || 'https://api.github.com'}/repos/${repository}/issues/${issue}`, {
    headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  });
  if (!response.ok) throw new Error(`Cannot verify issue #${issue}: HTTP ${response.status}`);
  const record = await response.json();
  if (record.pull_request) throw new Error('Link an issue, not another pull request.');
  if (record.state !== 'open') throw new Error('The linked issue must be open until production promotion.');
  if (event.pull_request.base.ref === 'main') {
    const sha = event.pull_request.head.sha;
    const headers = { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json' };
    const api = `${process.env.GITHUB_API_URL || 'https://api.github.com'}/repos/${repository}`;
    const runsResponse = await fetch(`${api}/actions/workflows/ci.yml/runs?head_sha=${sha}&event=push`, { headers });
    if (!runsResponse.ok) throw new Error('Cannot verify the staging CI run.');
    const runs = await runsResponse.json();
    if (runs.workflow_runs?.[0]?.conclusion !== 'success') throw new Error('The exact staging revision must pass CI before promotion. Re-run this check after staging CI completes.');
    if (process.env.PAGES_ENABLED === 'true') {
      const deploymentsResponse = await fetch(stagingEvidenceUrl(api, sha), { headers });
      if (!deploymentsResponse.ok) throw new Error('Cannot verify the staging deployment.');
      const deployments = await deploymentsResponse.json();
      if (!deployments.length) throw new Error('The exact revision has no staging deployment.');
      const statusesResponse = await fetch(deployments[0].statuses_url, { headers });
      if (!statusesResponse.ok) throw new Error('Cannot verify staging deployment status.');
      const statuses = await statusesResponse.json();
      if (statuses[0]?.state !== 'success') throw new Error('Staging deployment and hosted smoke tests must pass before promotion.');
    }
  }
  console.log(`Issue #${issue}: branch and promotion policy passed.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch(error => { console.error(error.message); process.exitCode = 1; });
}
