import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.error('[prerender] dist directory not found! Run vite build first.');
  process.exit(1);
}

const templatePath = path.join(distDir, 'index.html');
const baseTemplate = fs.readFileSync(templatePath, 'utf-8');

const routes = [
  {
    path: '/',
    title: 'GoPropertyCare — Residential Cleaning & Property Care in Denver & Boulder',
    description: 'Professional residential cleaning, turnover care, and move-in/move-out services across Denver & Boulder, CO. Transparent sq ft pricing from $0.125/sqft, 100% insured.',
    canonical: 'https://gopropertycare.com/',
    heading: 'Comprehensive Cleaning & Maintenance Solutions',
    subheading: 'Top-tier residential and commercial cleaning solutions tailored to homeowners, real estate professionals, and property managers throughout Denver & Boulder.',
    contentHtml: `
      <main class="w-full max-w-6xl mx-auto px-4 py-8">
        <header class="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span class="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
            Denver & Boulder, Colorado • Comprehensive Solutions
          </span>
          <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Comprehensive Cleaning &amp; Maintenance Solutions
          </h1>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">
            Top-tier residential and commercial cleaning solutions tailored to homeowners, real estate professionals, and property managers throughout the Denver metropolitan area.
          </p>
          <div class="pt-4 flex flex-wrap justify-center gap-4">
            <a href="/schedule" class="inline-block px-8 py-3 bg-emerald-600 text-white font-black rounded-xl shadow-md hover:bg-emerald-700 transition">
              Schedule My Service
            </a>
            <a href="/about" class="inline-block px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition">
              About Our Standards
            </a>
          </div>
        </header>

        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h3 class="text-xl font-black text-slate-900 mt-1 mb-2">Basic Residential</h3>
            <p class="text-2xl font-black text-emerald-600 mb-2">$0.125 <span class="text-xs text-slate-500 font-normal">/ sq ft</span></p>
            <p class="text-xs text-slate-600">Standard regular upkeep for houses and apartments.</p>
          </div>
          <div class="p-6 bg-emerald-50 border-2 border-emerald-600 rounded-2xl shadow-sm">
            <h3 class="text-xl font-black text-slate-900 mt-1 mb-2">Move-In / Move-Out</h3>
            <p class="text-2xl font-black text-emerald-700 mb-2">$0.20 <span class="text-xs text-slate-500 font-normal">/ sq ft</span></p>
            <p class="text-xs text-slate-600">Deep turnover cleaning for lease handover and inspections.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h3 class="text-xl font-black text-slate-900 mt-1 mb-2">STR (On-Site Laundry)</h3>
            <p class="text-2xl font-black text-emerald-600 mb-2">$0.17 <span class="text-xs text-slate-500 font-normal">/ sq ft</span></p>
            <p class="text-xs text-slate-600">Turnover with linens washed and dried on the property.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h3 class="text-xl font-black text-slate-900 mt-1 mb-2">STR (Off-Site Laundry)</h3>
            <p class="text-2xl font-black text-emerald-600 mb-2">$0.23 <span class="text-xs text-slate-500 font-normal">/ sq ft</span></p>
            <p class="text-xs text-slate-600">Turnover with complete off-site professional laundering.</p>
          </div>
        </section>

        <section class="p-8 bg-slate-50 border border-slate-200 rounded-3xl mb-12">
          <h2 class="text-2xl font-black text-slate-900 mb-4 text-center">Service Coverage in Denver &amp; Boulder</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-700 max-w-4xl mx-auto">
            <div>
              <h3 class="font-bold text-slate-900 mb-1">Free Travel Zone ($0.00):</h3>
              <p>Denver Central, Downtown, LoDo, RiNo, Highlands, Lakewood, Englewood, Wheat Ridge, Arvada, Westminster, Boulder, Broomfield.</p>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 mb-1">Extended Coverage ($25.00 Travel Fee):</h3>
              <p>Aurora, Thornton, Centennial, Highlands Ranch.</p>
            </div>
          </div>
        </section>

        <footer class="text-center py-6 border-t border-slate-200 text-xs text-slate-500">
          <p>GoPropertyCare • Denver &amp; Boulder, CO • (720) 590-8632 • info@gopropertycare.com</p>
        </footer>
      </main>
    `,
  },
  {
    path: '/about',
    title: 'About GoPropertyCare — Trusted Home Cleaning in Denver & Boulder',
    description: 'Meet GoPropertyCare. Fully insured professional cleaners serving Denver, Boulder, Lakewood, Aurora, and surrounding areas. Contact us at (720) 590-8632.',
    canonical: 'https://gopropertycare.com/about',
    heading: 'About GoPropertyCare',
    subheading: 'Dedicated to spotless standards, strict checklists, and insured peace of mind across Colorado homes.',
    contentHtml: `
      <main class="w-full max-w-6xl mx-auto px-4 py-8">
        <header class="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span class="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
            About GoPropertyCare
          </span>
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">Your Trusted Property Care Partner</h1>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">
            We deliver rigorous, insured, and dependable cleaning for residential properties and short-term rentals throughout Denver and Boulder.
          </p>
        </header>

        <section class="space-y-6 max-w-4xl mx-auto mb-12">
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h2 class="text-xl font-bold text-slate-900 mb-2">Our Operating Standards</h2>
            <ul class="list-disc list-inside space-y-2 text-sm text-slate-600">
              <li><strong>100% Insured Personnel:</strong> Full liability protection for complete customer peace of mind.</li>
              <li><strong>Rigorous Quality Checklists:</strong> Standardized inspection points on kitchens, bathrooms, and living areas.</li>
              <li><strong>Transparent $/Sq Ft Pricing:</strong> You pay strictly for the size of your space, starting at $0.125/sqft.</li>
              <li><strong>Advance Booking:</strong> Punctual scheduling with next-day and advance reservations (minimum 3h notice).</li>
              <li><strong>Minimum Visit Threshold:</strong> $99.00 minimum order ensures professional crew dispatch and thorough service.</li>
            </ul>
          </div>
        </section>

        <footer class="text-center py-6 border-t border-slate-200 text-xs text-slate-500">
          <p>GoPropertyCare • Denver &amp; Boulder, CO • (720) 590-8632 • info@gopropertycare.com</p>
        </footer>
      </main>
    `,
  },
  {
    path: '/schedule',
    title: 'Book Residential Cleaning — GoPropertyCare Denver & Boulder',
    description: 'Get an instant quote and book residential cleaning online. Choose your sq ft, rooms, and schedule your appointment in Denver & Boulder.',
    canonical: 'https://gopropertycare.com/schedule',
    heading: 'Book Your Cleaning Service',
    subheading: 'Customize property size, service tier, add-ons, and arrival slot.',
    contentHtml: `
      <main class="w-full max-w-4xl mx-auto px-4 py-8">
        <header class="text-center space-y-3 mb-8">
          <h1 class="text-3xl font-black text-slate-900">Book Residential Cleaning</h1>
          <p class="text-sm text-slate-600">Choose your square footage, room count, and preferred arrival window in Denver or Boulder.</p>
        </header>
        <section class="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
          <p class="text-slate-700 mb-4">Our interactive 4-step booking flow is loading...</p>
          <div class="text-sm text-slate-500">
            Questions or commercial properties? Call us at <a href="tel:7205908632" class="text-emerald-700 font-bold">(720) 590-8632</a>.
          </div>
        </section>
      </main>
    `,
  },
  {
    path: '/login',
    title: 'Sign In — GoPropertyCare Client Portal',
    description: 'Access your GoPropertyCare account to view cleaning reservations, invoices, and property details in Denver & Boulder.',
    canonical: 'https://gopropertycare.com/login',
    heading: 'Client Portal Sign In',
    subheading: 'Manage your property care reservations and service history.',
    contentHtml: `
      <main class="w-full max-w-md mx-auto px-4 py-12">
        <header class="text-center space-y-2 mb-6">
          <h1 class="text-2xl font-black text-slate-900">Sign In to GoPropertyCare</h1>
          <p class="text-xs text-slate-600">View upcoming cleanings, past invoices, and manage addresses.</p>
        </header>
        <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-center text-sm text-slate-600">
          Client portal loading...
        </div>
      </main>
    `,
  },
];

console.log('[prerender] Starting marketing pages prerendering for GoPropertyCare...');

for (const route of routes) {
  let html = baseTemplate;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);

  // Replace Meta Description
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${route.description}" />`
  );

  // Replace Canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${route.canonical}" />`
  );

  // Replace Open Graph Title, Description, URL
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${route.title}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${route.description}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${route.canonical}" />`
  );

  // Replace Twitter Card Title, Description
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${route.title}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${route.description}" />`
  );

  // Inject prerendered content into <div id="root">
  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${route.contentHtml}</div>`
  );

  // Target output file
  const outPath =
    route.path === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, route.path.replace(/^\//, ''), 'index.html');

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`[prerender] Rendered route ${route.path} -> ${path.relative(distDir, outPath)}`);
}

console.log('[prerender] Completed successfully for GoPropertyCare!');
