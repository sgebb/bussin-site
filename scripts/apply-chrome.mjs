// Applies the shared footer and <head> extras to every page.
// Idempotent: run from the repo root with  node scripts/apply-chrome.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const footer = `<footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-about">
          <a class="brand" href="/"><img src="/assets/favicon.svg" alt="" class="brand-icon" width="32" height="32" />bussin</a>
          <p>The Azure Service Bus explorer that runs in your browser.</p>
          <a href="https://get.microsoft.com/installer/download/9ntht4mr25cg?referrer=appbadge" target="_blank" rel="noopener" class="ms-store-badge">
            <img class="badge-dark" src="https://get.microsoft.com/images/en-us%20dark.svg" width="150" height="54" loading="lazy" alt="Get Bussin from Microsoft Store"/>
            <img class="badge-light" src="https://get.microsoft.com/images/en-us%20light.svg" width="150" height="54" loading="lazy" alt="Get Bussin from Microsoft Store"/>
          </a>
        </div>
        <nav class="footer-col" aria-labelledby="f-product">
          <h2 id="f-product">Product</h2>
          <ul>
            <li><a href="https://app.bussin.dev/demo" target="_blank" rel="noopener">Live demo</a></li>
            <li><a href="/features/">Features</a></li>
            <li><a href="/how-it-works/">How it works</a></li>
            <li><a href="/security/">Security</a></li>
            <li><a href="/mcp-server/">MCP server</a></li>
            <li><a href="/changelog/">Changelog</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-labelledby="f-guides">
          <h2 id="f-guides">Guides</h2>
          <ul>
            <li><a href="/docs/">Docs</a></li>
            <li><a href="/dead-letter-queue/">Dead-letter queues</a></li>
            <li><a href="/autoforwarding/">Auto-forwarding</a></li>
            <li><a href="/service-bus-linux-mac/">Linux and macOS</a></li>
            <li><a href="/browser-based-service-bus-explorer/">Browser-based explorer</a></li>
            <li><a href="/service-bus-explorer-alternative/">Explorer alternatives</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-labelledby="f-source">
          <h2 id="f-source">Source</h2>
          <ul>
            <li><a href="https://github.com/sgebb/bussin" target="_blank" rel="noopener">App on GitHub</a></li>
            <li><a href="https://github.com/sgebb/bussin-site" target="_blank" rel="noopener">Site on GitHub</a></li>
            <li><a href="https://www.npmjs.com/package/bussin-mcp" target="_blank" rel="noopener">bussin-mcp on npm</a></li>
            <li><a href="https://apps.microsoft.com/detail/9NTHT4MR25CG" target="_blank" rel="noopener">Microsoft Store</a></li>
          </ul>
        </nav>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 Bussin. Source available under BUSL-1.1.</span>
        <span>Free, no account, no backend.</span>
      </div>
    </div>
  </footer>`;

const headExtras = [
  ['theme-color', `<meta name="theme-color" content="#070b14" media="(prefers-color-scheme: dark)">\n  <meta name="theme-color" content="#f6f7f4" media="(prefers-color-scheme: light)">`],
  ['apple-touch-icon', `<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">`],
  ['bricolage-grotesque.woff2', `<link rel="preload" href="/assets/fonts/bricolage-grotesque.woff2" as="font" type="font/woff2" crossorigin>`],
];

const files = execSync('git ls-files "*.html"', { encoding: 'utf8' })
  .split('\n').filter(Boolean)
  .concat(['index.html']);

for (const file of [...new Set(files)]) {
  let s = readFileSync(file, 'utf8');
  if (!s.includes('class="site-footer"')) continue; // redirect stubs etc.
  const before = s;

  s = s.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, footer);

  const favicon = '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">';
  for (const [marker, tag] of headExtras) {
    if (!s.includes(marker)) s = s.replace(favicon, `${favicon}\n  ${tag}`);
  }

  if (!s.includes('class="skip-link"')) {
    s = s.replace(/<body([^>]*)>/, `<body$1>\n  <a class="skip-link" href="#main">Skip to content</a>`);
  }
  s = s.replace('<main class="container page-content">', '<main id="main" class="container page-content">');

  // Mark the current section in the nav.
  const path = '/' + file.replace(/index\.html$/, '');
  s = s.replace(/ aria-current="page"/g, '');
  if (path !== '/') {
    s = s.replace(new RegExp(`(<nav class="menu-panel">[\\s\\S]*?)<a href="${path}">`), `$1<a href="${path}" aria-current="page">`);
  }

  // Comparison marks: give screen readers and crawlers a word, not an empty cell.
  s = s.replace(/<span class="checkmark">✓<\/span>(?!<span class="sr-only">)/g, '<span class="checkmark" aria-hidden="true">✓</span><span class="sr-only">Yes</span>');
  s = s.replace(/<span class="no-mark" aria-hidden="true">✖<\/span>(?!<span class="sr-only">)/g, '<span class="no-mark" aria-hidden="true">✖</span><span class="sr-only">No</span>');
  s = s.replace(/(<td[^>]*>)<span class="partial-mark">~<\/span>(?!<span class="sr-only">)/g, '$1<span class="partial-mark" aria-hidden="true">~</span><span class="sr-only">Partial</span>');

  if (s !== before) {
    writeFileSync(file, s);
    console.log('updated', file);
  }
}
