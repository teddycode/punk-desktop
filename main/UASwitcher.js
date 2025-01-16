/* Use the same user agent as Chrome to improve site compatibility and increase fingerprinting resistance
see https://github.com/minbrowser/min/issues/657 for more information */

const defaultUserAgent = app.userAgentFallback;
let hasCustomUserAgent = false;
let newUserAgent;

if (settings.get('customUserAgent')) {
  newUserAgent = settings.get('customUserAgent');
  hasCustomUserAgent = true;
} else {
  newUserAgent = defaultUserAgent.replace(/谷歌浏览器\/\S+\s/, '').replace(/Electron\/\S+\s/, '');
}
app.userAgentFallback = newUserAgent;

function getFirefoxUA() {
  const rootUAs = {
    mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:FXVERSION.0) Gecko/20100101 Firefox/FXVERSION.0',
    windows: 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:FXVERSION.0) Gecko/20100101 Firefox/FXVERSION.0',
    linux: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:FXVERSION.0) Gecko/20100101 Firefox/FXVERSION.0',
  };

  let rootUA;
  if (process.platform === 'win32') {
    rootUA = rootUAs.windows;
  } else if (process.platform === 'darwin') {
    rootUA = rootUAs.mac;
  } else {
    // 'aix', 'freebsd', 'linux', 'openbsd', 'sunos'
    rootUA = rootUAs.linux;
  }

  /*
  Guess at an appropriate Firefox version to use in the UA.
  We want a recent version (ideally the latest), but not a version that hasn't been released yet.
  New releases are every ~4 weeks, with some delays for holidays. So assume 4.1 weeks, and estimate
  starting from v91 on 2021-08-10
  */

  const fxVersion = 91 + Math.floor((Date.now() - 1628553600000) / (4.1 * 7 * 24 * 60 * 60 * 1000));

  return rootUA.replace(/FXVERSION/g, fxVersion);
}

function requestSwitcher(ses) {
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    enableRefererSettings(details);
    enableGoogleUASwitcher(details);
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
}

// redefine referer
function enableRefererSettings(details) {
  const refererOrigin = 'https://www.punkos.com'; // 设置默认的 Origin
  // 检查请求是否跨源，并手动设置 referer
  const requestOrigin = new URL(details.url).origin;
  if (!details.requestHeaders['Referer']) {
    details.requestHeaders['Referer'] = refererOrigin; // 设置默认的 referer
  } else {
    const currentRefererOrigin = new URL(details.requestHeaders['Referer']).origin;
    if (currentRefererOrigin !== requestOrigin) {
      details.requestHeaders['Referer'] = currentRefererOrigin; // 设置为 origin
    }
  }
  details.requestHeaders['Referer-Policy'] = 'strict-origin-when-cross-origin';
}

/*
Google blocks signin in some cases unless a custom UA is used
see https://github.com/minbrowser/min/issues/868
*/
function enableGoogleUASwitcher(details) {
  if (!hasCustomUserAgent && details.url.includes('accounts.google.com')) {
    const url = new URL(details.url);

    if (url.hostname === 'accounts.google.com') {
      details.requestHeaders['User-Agent'] = getFirefoxUA();
    }
  }

  const chromiumVersion = process.versions.chrome.split('.')[0];
  details.requestHeaders['SEC-CH-UA'] = `"Chromium";v="${chromiumVersion}", " Not A;Brand";v="99"`;
  details.requestHeaders['SEC-CH-UA-MOBILE'] = '?0';
}

app.once('ready', function () {
  requestSwitcher(session.defaultSession);
});

app.on('session-created', requestSwitcher);
