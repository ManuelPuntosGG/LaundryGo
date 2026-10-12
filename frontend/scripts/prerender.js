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
    title: 'LaundryGo — Denver Laundry Pickup & Delivery | Per-Pound Pricing',
    description: 'Schedule laundry pickup and delivery in Denver & Boulder, CO. Per-pound pricing from $2.25/lb, 24h turnaround, and eco-friendly wash & fold.',
    canonical: 'https://thelaundrygo.com/',
    heading: 'Fresh Laundry, Delivered to Your Door',
    subheading: 'Professional pickup and delivery laundry service for homes and businesses in Denver, Colorado.',
    contentHtml: `
      <main class="w-full max-w-6xl mx-auto px-4 py-8">
        <header class="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">
            Denver & Boulder, Colorado • Doorstep Pickup & Delivery
          </span>
          <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Fresh Laundry, Delivered to Your Door</h1>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">
            Professional pickup and delivery laundry service for homes and businesses in Denver & Boulder. Simple per-pound pricing, 24h turnaround, and hypoallergenic care.
          </p>
          <div class="pt-4 flex flex-wrap justify-center gap-4">
            <a href="/schedule" class="inline-block px-8 py-3 bg-blue-600 text-white font-black rounded-xl shadow-md hover:bg-blue-700 transition">
              Schedule Free Pickup
            </a>
            <a href="/about" class="inline-block px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition">
              Learn How It Works
            </a>
          </div>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <span class="text-xs font-bold text-blue-600 uppercase">2-Day Delivery</span>
            <h3 class="text-2xl font-black text-slate-900 mt-1 mb-2">$2.25 / lb</h3>
            <p class="text-sm text-slate-600">Standard economical turnaround. Thorough washing, tumble drying, and crisp fold.</p>
          </div>
          <div class="p-6 bg-blue-50 border-2 border-blue-600 rounded-2xl shadow-sm">
            <span class="text-xs font-bold text-blue-700 uppercase">Most Popular • Next Day</span>
            <h3 class="text-2xl font-black text-slate-900 mt-1 mb-2">$2.45 / lb</h3>
            <p class="text-sm text-slate-600">24-hour turnaround returned fresh to your doorstep next day.</p>
          </div>
          <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <span class="text-xs font-bold text-amber-600 uppercase">Same-Day Express</span>
            <h3 class="text-2xl font-black text-slate-900 mt-1 mb-2">$3.85 / lb</h3>
            <p class="text-sm text-slate-600">Morning pickup with same-day return (order before 12:00 PM).</p>
          </div>
        </section>

        <section class="p-8 bg-slate-50 border border-slate-200 rounded-3xl mb-12">
          <h2 class="text-2xl font-black text-slate-900 mb-4 text-center">Service Coverage in Denver & Boulder</h2>
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
          <p>LaundryGo • Denver, CO • (720) 590-8632 • info@thelaundrygo.com</p>
        </footer>
      </main>
    `,
  },
  {
    path: '/about',
    title: 'About LaundryGo — Premium Wash & Fold in Denver & Boulder',
    description: 'Learn about LaundryGo, Denver\'s trusted eco-friendly laundry pickup and delivery service. Contact us at (720) 590-8632.',
    canonical: 'https://thelaundrygo.com/about',
    heading: 'About LaundryGo Denver',
    subheading: 'Premium wash & fold service, eco-friendly detergents, and transparent per-pound pricing across Denver & Boulder.',
    contentHtml: `
      <main class="w-full max-w-6xl mx-auto px-4 py-8">
        <header class="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">
            About LaundryGo
          </span>
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">Denver's Premier Doorstep Laundry Care</h1>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">
            We are dedicated to taking laundry off your to-do list with simple per-pound pricing, fast turnarounds, and gentle eco-friendly detergents.
          </p>
        </header>

        <section class="space-y-6 max-w-4xl mx-auto mb-12">
          <div class="p-6 bg-white border border-slate-200 rounded-2xl">
            <h2 class="text-xl font-bold text-slate-900 mb-2">Our 5-Step Quality Process</h2>
            <ol class="list-decimal list-inside space-y-2 text-sm text-slate-600">
              <li><strong>Doorstep Pickup:</strong> Contactless or in-person bag pickup from your home or office.</li>
              <li><strong>Sorting & Precision Weighing:</strong> Garments sorted by color and fabric temperature sensitivity.</li>
              <li><strong>Eco-Friendly Wash & Clean:</strong> Premium hypoallergenic detergents with sanitized rinse cycles.</li>
              <li><strong>Crisp Folding & Protective Packing:</strong> Neatly folded and wrapped in weatherproof protective bags.</li>
              <li><strong>On-Time Doorstep Delivery:</strong> Returned fresh and ready to put straight into your closet.</li>
            </ol>
          </div>

          <div class="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <h2 class="text-xl font-bold text-slate-900 mb-2">Key Business Rules</h2>
            <ul class="list-disc list-inside space-y-2 text-sm text-slate-600">
              <li>Minimum order requirement: <strong>$40.00</strong>.</li>
              <li>Same-day cutoff: Orders for GoFurther same-day express must be booked before <strong>12:00 PM</strong>.</li>
              <li>Recurring discount: Subscriptions (Daily, Weekly, Bi-weekly, Monthly) receive a <strong>7.5% discount</strong> starting on the 2nd cycle.</li>
              <li>Special inquiries / Commercial laundry: Direct contact at <a href="tel:7205908632" class="text-blue-600 font-bold">(720) 590-8632</a>.</li>
            </ul>
          </div>
        </section>

        <footer class="text-center py-6 border-t border-slate-200 text-xs text-slate-500">
          <p>LaundryGo • Denver, CO • (720) 590-8632 • info@thelaundrygo.com</p>
        </footer>
      </main>
    `,
  },
  {
    path: '/schedule',
    title: 'Schedule Laundry Pickup — LaundryGo Denver & Boulder',
    description: 'Book your laundry pickup today in Denver and Boulder. Choose your preferred turnaround: Standard, Go (Next Day), or GoFurther.',
    canonical: 'https://thelaundrygo.com/schedule',
    heading: 'Schedule Your Laundry Pickup',
    subheading: 'Select turnaround speed, pickup date, and convenient arrival slot.',
    contentHtml: `
      <main class="w-full max-w-4xl mx-auto px-4 py-8">
        <header class="text-center space-y-3 mb-8">
          <h1 class="text-3xl font-black text-slate-900">Schedule Laundry Pickup</h1>
          <p class="text-sm text-slate-600">Choose your service tier, pickup address in Denver or Boulder, and convenient time window.</p>
        </header>
        <section class="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
          <p class="text-slate-700 mb-4">Our interactive 4-step scheduling flow is loading...</p>
          <div class="text-sm text-slate-500">
            Need urgent assistance? Call us directly at <a href="tel:7205908632" class="text-blue-600 font-bold">(720) 590-8632</a>.
          </div>
        </section>
      </main>
    `,
  },
  {
    path: '/login',
    title: 'Sign In — LaundryGo Account & Order History',
    description: 'Sign in to your LaundryGo account to manage pickups, recurring subscriptions, and view orders in Denver & Boulder.',
    canonical: 'https://thelaundrygo.com/login',
    heading: 'Sign In to LaundryGo',
    subheading: 'Access your order history, tracking, and recurring schedules.',
    contentHtml: `
      <main class="w-full max-w-md mx-auto px-4 py-12">
        <header class="text-center space-y-2 mb-6">
          <h1 class="text-2xl font-black text-slate-900">Sign In to LaundryGo</h1>
          <p class="text-xs text-slate-600">Manage orders, pickup subscriptions, and account details.</p>
        </header>
        <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-center text-sm text-slate-600">
          Sign-in portal loading...
        </div>
      </main>
    `,
  },
];

console.log('[prerender] Starting marketing pages prerendering for LaundryGo...');

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

console.log('[prerender] Completed successfully for LaundryGo!');
