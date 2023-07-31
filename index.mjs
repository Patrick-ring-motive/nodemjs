import fetch from 'node-fetch';
import http from 'http';
import fileFromRequest from './static-files.mjs';
import addCorsHeaders from './cors-headers.mjs';
import rcache from './repl-cache.mjs';
import sleep from './sleep.mjs';
import maintain from './auto-maintain.mjs';
import {availReq,availRes} from './availability.mjs';

let hostTarget = 'www.google.com';
let hostList = [];
hostList.push('www.google.com');




let server = http.createServer(onRequest);

server.listen(3000);
maintain(server);

async function onRequest(req, res) {
  try {

    res=availRes(res);
    
    
  //  console.log(Object.keys(responseBuffer).length);
    const hostProxy = req.headers['host'];
    


    if (req.url == '/ping') {
      res.statusCode = 200;
      
      return res.endAvail();
    }
    let path = req.url.replaceAll('*', '');
    let pat = path.split('?')[0].split('#')[0]

    if (pat == '/robots.txt') {
      res.statusCode = 200;
      
      return res.endAvail(
        `User-agent: *
Allow: /`);

    }

    req.key = req.url;
    if (req.key.length > 200) {
      req.key = req.key.slice(0, 199);
    }
    req.key = encodeURIComponent(req.key);

    if ((req.method.toUpperCase() == 'GET') && (rcache.get(req.key))) {
      res = rcache.apply(req.key, res);
      
      return res.endAvail(res.rbody);

    }

    res = addCorsHeaders(res);


    if (pat == '/sw.js') {
      res.setHeader('content-type', 'text/javascript');
      let resBody = Buffer.from(await (await fetch("https://files-servleteer.vercel.app/elgoog/sw.js")).arrayBuffer());
      return res.endAvail(resBody);

    }


    if (pat == '/reverse.css') {
      res.setHeader('content-type', 'text/css');
        return res.endAvail(`html{transform:scaleX(-1);}`);


    }

     if (pat == '/favicon.ico') {
      res.setHeader('content-type', 'image/x-icon');
      let resBody = Buffer.from(await (await fetch("https://files-servleteer.vercel.app/elgoog/favicon.ico")).arrayBuffer());
      return res.endAvail(resBody);

    }


    req.headers.host = hostTarget;
    req.headers.referer = hostTarget;


    /* start reading the body of the request*/
    let bdy = "";
    req.on('readable', function() {
      bdy += req.read()||'';
    });
    req.on('end', async function() {
      /* finish reading the body of the request*/

      /* start copying over the other parts of the request */
      let options = {
        method: req.method,
        headers: req.headers
      };
      /* fetch throws an error if you send a body with a GET request even if it is empty */
      if ((req.method != 'GET') && (req.method != 'HEAD') && (bdy.length > 0)) {
        options = {
          method: req.method,
          headers: req.headers,
          body: bdy
        };
      }
      /* finish copying over the other parts of the request */

      /* fetch from your desired target */
      let response = await fetch('https://' + hostTarget + path, options);

      /* if there is a problem try redirecting to the original */
      if (response.status > 399) {
        res.setHeader('location', 'https://' + hostTarget + path);
        res.statusCode = 302;
        
        return res.endAvail();
      }


      /* copy over response headers  */

      for (let [key, value] of response.headers.entries()) {
        res.setHeader(key, value);
      }
      for (let [key, value] of response.headers.keys()) {
        if (key.length > 1) {
          res.removeHeader(key);
          res.setHeader(key, value);
        }
      }

      res.removeHeader('content-encoding');
      res.removeHeader('content-length');

      res = addCorsHeaders(res);

      /* check to see if the response is not a text format */
      let ct = response.headers.get('content-type');



      res.setHeader('content-type', ct);

      if ((ct) && (!ct.includes('image')) && (!ct.includes('video')) && (!ct.includes('audio'))) {


        /* Copy over target response and return */
        let resBody = await response.text();

        let resNewBody = resBody.replace('<head>',
          `<head modified>
          <script>document.title='ɘlϱooӘ';</script>
          <script src="/sw.js"></script>
          <script src="https://files-servleteer.vercel.app/elgoog/link-resolver.js" host-list="` + btoa(JSON.stringify(hostList)) + `"></script>
<link rel="stylesheet" href="/reverse.css" />`);
        if ((req.method.toUpperCase() == 'GET') && (ct.includes('javascript') || ct.includes('css'))) {
          rcache.add(req.key, res, resNewBody);
        }
       // res.setHeader('content-length',new Blob([resNewBody]).size);
        return res.endAvail(resNewBody);


      } else {


        /* if not a text response then redirect straight to target */
        /*res.setHeader('location', 'https://' + hostTarget + path);
        res.statusCode = 301;
        return res.endAvail();*/

        /* if not text return the raw bytes */

      let resBody = Buffer.from(await response.arrayBuffer());
    //  res.setHeader('content-length',resBody.length);  
      return res.endAvail(resBody);
        

      }
    });
  setTimeout(X=>{try{res.endAvail();delete responseBuffer[res.resId];}catch(e){}},5000);
  } catch (e) {
    console.log(e);
    let stack = e.stack || "";
    res.statusCode = 500;
    
    return res.endAvail('500 ' + e.message + '\n' + stack);

  }
}
