const HOUR = 3600000;
const DAY = HOUR * 24;
const MINUTES5 = HOUR / 12;


globalThis.rcache = Object.create(null);

buildCache();


function buildCache() {

  globalThis.rcache.add = function(url, res, bdy) {

    globalThis.rcache[url] = { status: res.statusCode, headers: res.getHeaders(), body: bdy, timestamp: new Date().getTime() };
    return true;
  }

  globalThis.rcache.get = function(url) {
    return rcache[url];
  }

  globalThis.rcache.uptick = function(url) {

    globalThis.rcache[url].timestamp = new Date().getTime();
    return true;

  }
  globalThis.rcache.delete = function(key) {
    delete globalThis.rcache[key];
  }

  globalThis.rcache.apply = function(url, res) {
    globalThis.rcache.uptick(url)
    let rc = rcache[url];
    res.statusCode = rc.status;
    res.headers = rc.headers;
    res.rbody = rc.body;
    return res;
  }
  globalThis.rcache.end = function(url, res) {
    globalThis.rcache.uptick(url)
    let rc = rcache[url];
    res.statusCode = rc.status;
    res.headers = rc.headers;
    return res.end(rc.body);
  }
}

globalThis.rcache.clean = setInterval(async function() {

  let cache_list = Object.entries(rcache);
  let cache_list_length = cache_list.length;
  for (let i = 0; i < cache_list_length; i++) {
    try {

      if ((new Date().getTime() - cache_list[i][1].timstamp) > HOUR) {
        globalThis.rcache(cache_list[i][0]);
      }

    } catch (e) { continue; }
  }

}, MINUTES5);

export default globalThis.rcache;