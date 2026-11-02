// Keep Microsoft Clarity recordings limited to the canonical production host.
// Preview and staging responses retain all other scripts and functionality.
const CLARITY_BLOCK = /<!-- Microsoft Clarity -->\s*<script\b[^>]*>[\s\S]*?<\/script>/i;

export async function onRequest(context) {
  const hostname = new URL(context.request.url).hostname.toLowerCase();
  const response = await context.next();

  if (hostname === 'represent.au') return response;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('text/html')) return response;

  const headers = new Headers(response.headers);
  headers.delete('content-length');

  return new Response((await response.text()).replace(CLARITY_BLOCK, ''), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
