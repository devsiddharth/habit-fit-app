// E2E browser test for HABIT.FIT — drives headless Chrome through the real
// user journey: signup → dashboard → add habit → toggle → reload persistence → sign out.
// Requires: backend on :8091, frontend on :3001. Screenshots land in e2e/shots/.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:3001';
const SHOTS = 'e2e/shots';
const STAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const EMAIL = `browser_${Date.now()}@test.com`;
const PASS = 'secret123';

const results = [];
const ok = (step, msg) => { results.push(['PASS', step, msg]); console.log(`  PASS ${step} — ${msg}`); };
const fail = (step, msg) => { results.push(['FAIL', step, msg]); console.log(`  FAIL ${step} — ${msg}`); };
const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${STAMP}_${name}.png` });

fs.mkdirSync(SHOTS, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
  defaultViewport: { width: 1440, height: 900 },
});

try {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`));

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const text = async () => page.evaluate(() => document.body.innerText);
  const clickByText = async (selector, needle) => {
    const handles = await page.$$(selector);
    for (const h of handles) {
      const t = (await h.evaluate(el => el.textContent)) || '';
      if (t.includes(needle)) { await h.click(); return true; }
    }
    return false;
  };

  /* ── 1. Login page renders ─────────────────────────────────────────── */
  console.log('\n1) Load login page');
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1200);
  let body = await text();
  if (body.includes('Welcome back') && body.includes('Sign in to continue')) ok('login-page', 'auth card rendered');
  else fail('login-page', body.slice(0, 120));
  await shot(page, '1_login');

  /* ── 2. Go to signup ───────────────────────────────────────────────── */
  console.log('\n2) Navigate to signup');
  const wentSignup = await clickByText('a', 'Create one free');
  if (!wentSignup) fail('nav-signup', 'link not found');
  await page.waitForFunction(() => document.body.innerText.includes('Create account'), { timeout: 8000 });
  ok('nav-signup', 'signup page visible');

  /* ── 3. Fill signup form ───────────────────────────────────────────── */
  console.log('\n3) Fill signup form');
  await page.type('input[placeholder="Ankit Kumar"]', 'Browser Tester');
  await page.type('input[placeholder="you@example.com"]', EMAIL);
  const pwInputs = await page.$$('input[type="password"]');
  await pwInputs[0].type(PASS);
  await pwInputs[1].type(PASS);
  await shot(page, '2_signup_filled');

  /* ── 4. Submit → dashboard ─────────────────────────────────────────── */
  console.log('\n4) Submit signup');
  await clickByText('button', 'Create Account');
  await page.waitForFunction(() => document.body.innerText.includes('Hello,'), { timeout: 15000 });
  body = await text();
  if (body.includes('Browser Tester')) ok('signup', 'dashboard shows real name from MySQL');
  else fail('signup', 'name missing on dashboard');
  if (body.includes('No habits yet')) ok('fresh-state', 'new user starts with zero habits');
  else fail('fresh-state', 'unexpected content');
  await shot(page, '3_dashboard_fresh');

  /* ── 5. Add a habit via modal ──────────────────────────────────────── */
  console.log('\n5) Add habit through modal');
  await clickByText('button', 'Add Your First Habit');
  await page.waitForSelector('.modal', { timeout: 8000 });
  await page.type('.modal input.form-input', 'Morning Run');
  // pick the 2nd emoji (📚) and 3rd color for variety
  const emo = await page.$$('.modal button');
  for (const b of emo) {
    const t = (await b.evaluate(el => el.textContent)) || '';
    if (t.trim() === '📚') { await b.click(); break; }
  }
  await shot(page, '4_modal_filled');
  await clickByText('.modal button', 'Save Habit');
  await page.waitForFunction(() => document.body.innerText.includes('Morning Run'), { timeout: 10000 });
  ok('add-habit', 'habit appears in list');
  await sleep(600);
  await shot(page, '5_habit_added');

  /* ── 6. Toggle done → streak 1, confetti ───────────────────────────── */
  console.log('\n6) Toggle habit done');
  body = await text();
  const before = body.includes('0 remaining') ? 0 : 1; // 1 remaining before toggle
  await page.click('.habit-row');
  await page.waitForFunction(
    () => document.body.innerText.includes('All habits done today'),
    { timeout: 10000 }
  );
  body = await text();
  if (body.includes('All habits done today')) ok('toggle', 'row flipped to done (server recomputed streak)');
  else fail('toggle', 'done state not reflected');
  await shot(page, '6_toggled_done');

  /* ── 7. Reload → session + data persist via JWT + MySQL ────────────── */
  console.log('\n7) Hard reload (session restore)');
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(1500);
  body = await text();
  const persisted = body.includes('Morning Run') && body.includes('All habits done today');
  if (persisted) ok('persistence', 'habit + done state survive reload (JWT session restore + MySQL)');
  else fail('persistence', body.slice(0, 120));
  await shot(page, '7_after_reload');

  /* ── 8. Statistics page shows calendar with today marked ───────────── */
  console.log('\n8) Statistics page');
  await clickByText('.nav-item', 'Statistics');
  await sleep(900);
  body = await text();
  if (body.includes('Habit Calendar') && body.includes('Completion Rate per Habit')) ok('stats-page', 'calendar + charts render');
  else fail('stats-page', body.slice(0, 120));
  await shot(page, '8_statistics');

  /* ── 9. Insights page (achievements) ───────────────────────────────── */
  console.log('\n9) Insights page');
  await clickByText('.nav-item', 'AI Insights');
  await sleep(900);
  body = await text();
  if (body.includes('Achievements') && body.includes('unlocked')) ok('insights-page', 'achievements grid renders');
  else fail('insights-page', body.slice(0, 120));
  await shot(page, '9_insights');

  /* ── 10. Profile + sign out ────────────────────────────────────────── */
  console.log('\n10) Profile + sign out');
  await clickByText('.nav-item', 'Profile');
  await sleep(900);
  body = await text();
  if (body.includes('Signed in with Email')) ok('profile-page', 'provider badge shows email auth');
  else fail('profile-page', body.slice(0, 120));
  await shot(page, '10_profile');
  await clickByText('button', 'Sign Out');
  await sleep(1200);
  body = await text();
  if (body.includes('Welcome back')) ok('signout', 'returned to login, JWT cleared');
  else fail('signout', body.slice(0, 120));
  await shot(page, '11_signed_out');

  /* ── 11. Login again with same creds (MySQL roundtrip) ─────────────── */
  console.log('\n11) Login again (data roundtrip)');
  await page.type('input[placeholder="you@example.com"]', EMAIL);
  await page.type('input[type="password"]', PASS);
  await clickByText('button', 'Sign In');
  await page.waitForFunction(() => document.body.innerText.includes('Hello,'), { timeout: 15000 });
  body = await text();
  if (body.includes('Morning Run')) ok('relogin', 'same account sees its habits after re-login');
  else fail('relogin', body.slice(0, 120));
  await shot(page, '12_relogin');

} catch (e) {
  fail('fatal', e.message);
  try {
    const page = (await browser.pages())[0];
    await shot(page, '99_fatal');
  } catch { /* ignore */ }
} finally {
  await browser.close();
  console.log('\n════════ SUMMARY ════════');
  const fails = results.filter(r => r[0] === 'FAIL');
  for (const [s, step, msg] of results) console.log(`${s}  ${step}: ${msg}`);
  console.log(`\n${results.length - fails.length}/${results.length} steps passed`);
  if (consoleErrors.length) {
    console.log('\nBrowser console errors:');
    consoleErrors.forEach(e => console.log('  • ' + e.slice(0, 200)));
  } else {
    console.log('Browser console: clean (no errors)');
  }
  process.exit(fails.length ? 1 : 0);
}
