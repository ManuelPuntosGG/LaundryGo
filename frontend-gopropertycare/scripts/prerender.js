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
    title: 'GoPropertyCare — Residential Cleaning & Property Care in Denver',
    description: 'Professional residential cleaning, turnover care, and move-in/move-out services across Denver, CO. Transparent sq ft pricing from $0.125/sqft, 100% insured.',
    canonical: 'https://gopropertycare.com/',
    heading: 'Comprehensive Cleaning & Maintenance Solutions',
    subheading: 'Top-tier residential and commercial cleaning solutions tailored to homeowners, real estate professionals, and property managers throughout Denver.',
    contentHtml: `
      <main class="w-full max-w-6xl mx-auto px-4 py-8">
        <header class="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span class="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
            Denver, Colorado • Comprehensive Solutions
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
          <h2 class="text-2xl font-black text-slate-900 mb-4 text-center">Service Coverage in Denver</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-700 max-w-4xl mx-auto">
            <div>
              <h3 class="font-bold text-slate-900 mb-1">Free Travel Zone ($0.00):</h3>
              <p>Denver Central, Downtown, LoDo, RiNo, Highlands, Lakewood, Englewood, Wheat Ridge, Arvada, Westminster, Broomfield.</p>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 mb-1">Extended Coverage ($25.00 Travel Fee):</h3>
              <p>Aurora, Thornton, Centennial, Highlands Ranch.</p>
            </div>
          </div>
        </section>

        <footer class="text-center py-6 border-t border-slate-200 text-xs text-slate-500">
          <p>GoPropertyCare • Denver, CO • (720) 590-8632 • info@gopropertycare.com</p>
        </footer>
      </main>
    `,
  },
  {
    path: '/about',
    title: 'About GoPropertyCare — Trusted Home Cleaning in Denver',
    description: 'Meet GoPropertyCare. Fully insured professional cleaners serving Denver, Lakewood, Aurora, and surrounding areas. Contact us at (720) 590-8632.',
    canonical: 'https://gopropertycare.com/about',
    heading: 'About GoPropertyCare',
    subheading: 'Dedicated to spotless standards, strict checklists, and insured peace of mind across Colorado homes.',
    contentHtml: `
      <main class="w-full max-w-6xl mx-auto px-4 py-8">
        <header class="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">Your Trusted Property Care Partner</h1>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">
            We deliver rigorous, insured, and dependable cleaning for residential properties and short-term rentals throughout Denver.
          </p>
          <div class="pt-4 flex flex-wrap justify-center gap-4">
            <a href="/services" class="inline-block px-8 py-3 bg-emerald-600 text-white font-black rounded-xl shadow-md hover:bg-emerald-700 transition">
              Explore Our Services
            </a>
            <a href="/schedule" class="inline-block px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition">
              Book Online
            </a>
          </div>
        </header>

        <section class="space-y-6 max-w-4xl mx-auto mb-12">
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h2 class="text-xl font-bold text-slate-900 mb-2">Our Core Guarantees</h2>
            <ul class="list-disc list-inside space-y-2 text-sm text-slate-600">
              <li><strong>100% Insured Personnel:</strong> Full liability protection for complete customer peace of mind.</li>
              <li><strong>Background-Checked Specialists:</strong> Punctual, respectful, and vetted cleaners you can trust.</li>
              <li><strong>Rigorous Quality Checklists:</strong> Standardized room-by-room inspection ensuring dependable 5-star results.</li>
              <li><strong>Family &amp; Pet Friendly:</strong> Professional-grade, non-toxic supplies safe for loved ones.</li>
            </ul>
          </div>
        </section>

        <footer class="text-center py-6 border-t border-slate-200 text-xs text-slate-500">
          <p>GoPropertyCare • Denver, CO • (720) 590-8632 • info@gopropertycare.com</p>
        </footer>
      </main>
    `,
  },
  {
    path: '/residential',
    title: 'Residential Cleaning Services — GoPropertyCare Denver',
    description: 'Detailed checklists for Standard Cleaning, Deep Cleaning, Move-In / Move-Out, and Short-Term Rental turnovers in Denver.',
    canonical: 'https://gopropertycare.com/residential',
    heading: 'Residential Cleaning Solutions',
    subheading: 'Comprehensive room-by-room cleaning checklists designed for homes, lease turnovers, and 5-star Airbnb resets across Denver.',
    contentHtml: `
      <main class="w-full max-w-6xl mx-auto px-4 py-8">
        <header class="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">Residential Cleaning Solutions</h1>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">
            Clear, room-by-room checklists tailored for Denver homes, turnover rentals, and property resets.
          </p>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Standard Clean</h3>
            <p class="text-sm text-slate-600">Regular upkeep: kitchen countertops, appliances exteriors, scrubbed bathrooms, vacuumed carpets, and mopped floors.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Deep Clean</h3>
            <p class="text-sm text-slate-600">Detailed reset: baseboards hand-wiped, tile grout scrubbed, soap scum removed, ceiling fans and vent covers cleaned.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Move-In / Move-Out Clean</h3>
            <p class="text-sm text-slate-600">Empty home reset: inside cabinets and drawers, oven and fridge deep clean, closets, and full walkthrough readiness.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Short-Term Rental Turnover</h3>
            <p class="text-sm text-slate-600">Fast guest turnover: fresh bed remaking, sanitized bathrooms, restocked supplies, and 5-star listing presentation.</p>
          </div>
        </section>

        <footer class="text-center py-6 border-t border-slate-200 text-xs text-slate-500">
          <p>GoPropertyCare • Denver, CO • (720) 590-8632 • info@gopropertycare.com</p>
        </footer>
      </main>
    `,
  },
  {
    path: '/commercial',
    title: 'Commercial Cleaning & Janitorial Solutions — GoPropertyCare Denver',
    description: 'Dependable, insured commercial cleaning for offices, retail stores, healthcare clinics, and HOA properties across Denver. Request a 15-min walkthrough.',
    canonical: 'https://gopropertycare.com/commercial',
    heading: 'Commercial Cleaning & Janitorial Solutions',
    subheading: 'Dependable commercial care for offices, retail stores, clinics, and HOA properties. Custom proposals delivered same-day after a 15-minute walkthrough.',
    contentHtml: `
      <main class="w-full max-w-6xl mx-auto px-4 py-8">
        <header class="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">Commercial Cleaning &amp; Janitorial Solutions</h1>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">
            Dependable, insured commercial care for offices, retail stores, healthcare clinics, and HOA properties across Denver.
          </p>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Office Cleaning</h3>
            <p class="text-sm text-slate-600">Workstations, restrooms, break rooms, and conference rooms disinfected for healthy corporate teams.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Retail Cleaning</h3>
            <p class="text-sm text-slate-600">Storefront entry glass, fitting rooms, POS areas, and showroom floors polished for immaculate first impressions.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Medical &amp; Dental Cleaning</h3>
            <p class="text-sm text-slate-600">EPA-registered hospital-grade sanitation, color-coded cloths, and strict infection prevention protocol.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 class="text-xl font-bold text-slate-900 mb-2">HOA &amp; Property Management</h3>
            <p class="text-sm text-slate-600">Clubhouses, fitness centers, hallways, and lobbies maintained with consistent, scheduled care.</p>
          </div>
        </section>

        <footer class="text-center py-6 border-t border-slate-200 text-xs text-slate-500">
          <p>GoPropertyCare • Denver, CO • (720) 590-8632 • info@gopropertycare.com</p>
        </footer>
      </main>
    `,
  },
  {
    path: '/services',
    title: 'Cleaning Services — GoPropertyCare Denver',
    description: 'Detailed checklists for Standard Cleaning, Deep Cleaning, Move-In / Move-Out, and Short-Term Rental turnovers in Denver.',
    canonical: 'https://gopropertycare.com/services',
    heading: 'Our Specialized Cleaning Services',
    subheading: 'Comprehensive room-by-room cleaning checklists designed for homes, turnovers, and property resets.',
    contentHtml: `
      <main class="w-full max-w-6xl mx-auto px-4 py-8">
        <header class="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">Our Specialized Cleaning Services</h1>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">
            Clear, room-by-room checklists tailored for Denver homes, turnover rentals, and property resets.
          </p>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Standard Clean</h3>
            <p class="text-sm text-slate-600">Regular upkeep: kitchen countertops, appliances exteriors, scrubbed bathrooms, vacuumed carpets, and mopped floors.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Deep Clean</h3>
            <p class="text-sm text-slate-600">Detailed reset: baseboards hand-wiped, tile grout scrubbed, soap scum removed, ceiling fans and vent covers cleaned.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Move-In / Move-Out Clean</h3>
            <p class="text-sm text-slate-600">Empty home reset: inside cabinets and drawers, oven and fridge deep clean, closets, and full walkthrough readiness.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Short-Term Rental Turnover</h3>
            <p class="text-sm text-slate-600">Fast guest turnover: fresh bed remaking, sanitized bathrooms, restocked supplies, and 5-star listing presentation.</p>
          </div>
        </section>

        <footer class="text-center py-6 border-t border-slate-200 text-xs text-slate-500">
          <p>GoPropertyCare • Denver, CO • (720) 590-8632 • info@gopropertycare.com</p>
        </footer>
      </main>
    `,
  },
  {
    path: '/schedule',
    title: 'Book Residential Cleaning — GoPropertyCare Denver',
    description: 'Get an instant quote and book residential cleaning online. Choose your sq ft, rooms, and schedule your appointment in Denver.',
    canonical: 'https://gopropertycare.com/schedule',
    heading: 'Book Your Cleaning Service',
    subheading: 'Customize property size, service tier, add-ons, and arrival slot.',
    contentHtml: `
      <main class="w-full max-w-4xl mx-auto px-4 py-8">
        <header class="text-center space-y-3 mb-8">
          <h1 class="text-3xl font-black text-slate-900">Book Residential Cleaning</h1>
          <p class="text-sm text-slate-600">Choose your square footage, room count, and preferred arrival window in Denver.</p>
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
    path: '/order-success',
    title: 'Booking Confirmed — GoPropertyCare Denver',
    description: 'Your GoPropertyCare cleaning booking request has been received.',
    canonical: 'https://gopropertycare.com/order-success',
    heading: 'Booking Request Received',
    subheading: 'We have received your service reservation request.',
    contentHtml: `
      <main class="w-full max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 class="text-3xl font-black text-slate-900 mb-4">Booking Request Received</h1>
        <p class="text-slate-600">Your reservation details are loading...</p>
      </main>
    `,
  },
  {
    path: '/login',
    title: 'Sign In — GoPropertyCare Client Portal',
    description: 'Access your GoPropertyCare account to view cleaning reservations, invoices, and property details in Denver.',
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
  {
    path: '/faq',
    title: 'Frequently Asked Questions — GoPropertyCare Denver',
    description: 'Find answers about residential, commercial, and Airbnb cleaning services, pricing, insurance, supplies, policies, and 100% satisfaction guarantee.',
    canonical: 'https://gopropertycare.com/faq',
    heading: 'Frequently Asked Questions',
    subheading: 'Everything you need to know about our cleaning and property care services in Denver.',
    contentHtml: `
      <main class="w-full max-w-4xl mx-auto px-4 py-8">
        <header class="text-center space-y-3 mb-8">
          <span class="inline-block px-4 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">Help &amp; Information Center</span>
          <h1 class="text-3xl sm:text-4xl font-black text-slate-900">Frequently Asked Questions</h1>
          <p class="text-sm sm:text-base text-slate-600">Everything you need to know about our residential, turnover, and commercial cleaning services across Denver.</p>
        </header>
        <section class="space-y-6">
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h2 class="text-xl font-bold text-slate-900 mb-3">General Questions</h2>
            <p class="text-sm text-slate-600 mb-2 font-semibold">What areas do you serve?</p>
            <p class="text-xs text-slate-500 mb-4">We proudly serve Denver, Englewood, Wheat Ridge, Arvada, Westminster, Thornton, Broomfield, Aurora, Centennial, Castle Rock, and Highlands Ranch.</p>
            <p class="text-sm text-slate-600 mb-2 font-semibold">Are you insured?</p>
            <p class="text-xs text-slate-500 mb-4">Yes, GoPropertyCare is fully insured. Your property and peace of mind are completely protected.</p>
            <p class="text-sm text-slate-600 mb-2 font-semibold">Do you offer a satisfaction guarantee?</p>
            <p class="text-xs text-slate-500">If something was missed, let us know within 6 hours and our team will return to fix it at no extra charge.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h2 class="text-xl font-bold text-slate-900 mb-3">Residential Cleaning Questions</h2>
            <p class="text-sm text-slate-600 mb-2 font-semibold">How much does residential cleaning cost?</p>
            <p class="text-xs text-slate-500 mb-4">Transparent upfront pricing is calculated instantly on our website by square footage or bedroom/bathroom count.</p>
            <p class="text-sm text-slate-600 mb-2 font-semibold">Do I need to be home?</p>
            <p class="text-xs text-slate-500">No. Leave access instructions (lockbox, keypad, front desk) and our insured team takes care of the rest.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h2 class="text-xl font-bold text-slate-900 mb-3">Commercial Cleaning Questions</h2>
            <p class="text-sm text-slate-600 mb-2 font-semibold">How does commercial pricing work?</p>
            <p class="text-xs text-slate-500 mb-4">We provide custom quotes after a quick 15-minute walkthrough, delivered same-day.</p>
            <p class="text-sm text-slate-600 mb-2 font-semibold">Can you clean outside business hours?</p>
            <p class="text-xs text-slate-500">Yes: evenings, early mornings, weekends, or holidays to never disrupt your operations.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h2 class="text-xl font-bold text-slate-900 mb-3">Payments and Policies</h2>
            <p class="text-sm text-slate-600 mb-2 font-semibold">What is your cancellation policy?</p>
            <p class="text-xs text-slate-500 mb-4">Cancel or reschedule at no cost up to 24 hours prior to your scheduled service date.</p>
            <p class="text-sm text-slate-600 mb-2 font-semibold">How can I contact you?</p>
            <p class="text-xs text-slate-500">Call or text (720) 590-8632 or email info@gopropertycare.com (24/7 availability).</p>
          </div>
        </section>
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

  // Inject Google Ads Purchase Conversion snippet for /order-success page
  if (route.path === '/order-success') {
    const conversionSnippet = `    <!-- Event snippet for Purchase conversion page -->
    <script>
      if (typeof gtag === 'function') {
        gtag('event', 'conversion', {
          'send_to': 'AW-18431065578/3WXZCOGXwqkdEOr7ztRE',
          'transaction_id': ''
        });
      }
    </script>
  </head>`;
    html = html.replace('</head>', conversionSnippet);
  }

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
