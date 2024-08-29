const fetch = require('node-fetch');
const { pick } = require('lodash');
const { generateRandomIP, randomUserAgent } = require('./user1.js');
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const copyHeaders = require('./copyHeaders');


const viaHeaders = [
    '1.1 example-proxy-service.com (ExampleProxy/1.0)',
    '1.0 another-proxy.net (Proxy/2.0)',
    '1.1 different-proxy-system.org (DifferentProxy/3.1)',
    '1.1 some-proxy.com (GenericProxy/4.0)',
];

function randomVia() {
    const index = Math.floor(Math.random() * viaHeaders.length);
    return viaHeaders[index];
}

function proxy(req, res) {

  const { url, jpeg, bw, l } = req.query;
  if (!url) {

        const ipAddress = generateRandomIP();
        const ua = randomUserAgent();
        const hdrs = {
            ....pick(req.headers, ['cookie', 'dnt', 'referer']),
            'x-forwarded-for': ipAddress,
            'user-agent': ua,
            'via': randomVia(),
        };

        Object.entries(hdrs).forEach(([key, value]) => res.setHeader(key, value));
        
        return res.end(`1we23`);
  }
  
  const urls = Array.isArray(url) ? url.join('&url=') : url;
  const cleanedUrl = urls.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, 'http://');

  req.params.url = cleanedUrl;
  req.params.webp = !jpeg;
  req.params.grayscale = bw !== '0';
  req.params.quality = parseInt(l, 10) || 40;

    const randomIP = generateRandomIP();
    const userAgent = randomUserAgent();
  
  fetch(req.params.url, {
    headers: {
        ...pick(req.headers, ["cookie", "dnt", "referer"]),
        'user-agent': userAgent,
        'x-forwarded-for': randomIP,
        'via': randomVia(),
    },
    compress: true,
    redirect: 'follow',
  })
    .then(response => {
      if (!response.ok) {
        return redirect(req, res);
      }

      req.params.originType = response.headers.get('content-type') || '';
      req.params.originSize = response.headers.get('content-length') || '0';

      copyHeaders(response, res);
      res.setHeader('content-encoding', 'identity');

      if (shouldCompress(req)) {
        return compress(req, res, response.body);
      } else {
        res.setHeader('x-proxy-bypass', 1);
        res.setHeader('content-length', req.params.originSize);
        return response.body.pipe(res);
      }
    })
    .catch(() => redirect(req, res));
}

module.exports = proxy;
