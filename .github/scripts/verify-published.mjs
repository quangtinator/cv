const url = new URL('deployment.json', process.env.TEST_BASE_URL);
let lastError;
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    const response = await fetch(`${url}?revision=${process.env.GITHUB_SHA}`, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const published = await response.json();
    if (published.commit !== process.env.GITHUB_SHA) throw new Error('CDN still serves a different revision.');
    console.log(`Published revision verified at ${process.env.TEST_BASE_URL}`);
    process.exit(0);
  } catch (error) { lastError = error; }
  await new Promise(resolve => setTimeout(resolve, 2000));
}
throw lastError;
