// Cloudflare Pages Function — clean social attribution links.
// Profile/bio:
//   /go/{platform}
// Campaign:
//   /go/{platform}/{destination}/{campaign}
// Destinations: home, ppr, buyers, pab, leasing, tenant
// Server-side redirect only. No core website knowledge is delivered by JavaScript.

const PLATFORMS = new Set(['instagram', 'linkedin', 'facebook', 'youtube']);
const DESTINATIONS = {
  home: '/',
  ppr: '/commercial-property-performance-review',
  buyers: '/buyers-agency',
  pab: '/preliminary-acquisition-brief',
  leasing: '/property-management',
  tenant: '/tenant-representation'
};

export async function onRequest({ request, params }) {
  const raw = Array.isArray(params.path) ? params.path : String(params.path || '').split('/');
  const parts = raw.map(cleanSlug).filter(Boolean);
  const platform = parts[0];

  if (!PLATFORMS.has(platform)) return notFound();

  // /go/linkedin etc = permanent profile/bio link.
  if (parts.length === 1) {
    return redirect(request, '/', {
      utm_source: platform,
      utm_medium: 'organic_social',
      utm_campaign: 'profile',
      utm_content: profileContent(platform)
    });
  }

  // /go/linkedin/ppr/property-performance-review
  // The destination alias keeps the public URL clean while the campaign slug
  // identifies the individual post/video/campaign.
  const destination = parts[1];
  const campaign = parts[2];
  if (!DESTINATIONS[destination] || !campaign || parts.length !== 3) return notFound();

  return redirect(request, DESTINATIONS[destination], {
    utm_source: platform,
    utm_medium: 'organic_social',
    utm_campaign: campaign,
    utm_content: destination
  });
}

function redirect(request, path, tags) {
  const u = new URL(path, request.url);
  Object.keys(tags).forEach(k => u.searchParams.set(k, tags[k]));
  return new Response(null, {
    status: 302,
    headers: {
      Location: u.toString(),
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow'
    }
  });
}

function profileContent(platform) {
  if (platform === 'instagram') return 'bio';
  if (platform === 'youtube') return 'channel';
  return 'profile';
}

function cleanSlug(v) {
  return String(v || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 100);
}

function notFound() {
  return new Response('Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' }
  });
}
