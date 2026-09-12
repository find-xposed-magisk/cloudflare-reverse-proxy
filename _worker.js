const BLOCKED_HOSTS = /^(localhost$|127\.|0\.0\.0\.0$|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|::1$|metadata\.google\.internal$)/i;

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
async function handleRequest(request) {
  const url = new URL(request.url);
  const actualUrlStr = url.pathname.replace("/proxy/", "") + url.search + url.hash
  const actualUrl = new URL(actualUrlStr)
  if (!['http:', 'https:'].includes(actualUrl.protocol) || BLOCKED_HOSTS.test(actualUrl.hostname)) {
    return new Response('Forbidden', { status: 403 });
  }
  const modifiedRequest = new Request(actualUrl, {
    headers: request.headers,
    method: request.method,
    body: request.body,
    redirect: 'follow'
  });
  const response = await fetch(modifiedRequest);
  const modifiedResponse = new Response(response.body, response);
  modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
  return modifiedResponse;
}
