import fetch from 'node-fetch';
import http from 'http';


const hostTarget = 'patrick-ring-motive.github.io';

http.createServer(onRequest).listen(3000);

async function onRequest(req, res) {
  let path = req.url.replaceAll('*', '');
  let pat = path.split('?')[0].split('#')[0];



  /*respond to ping from uptime robot*/
  if (path == '/ping') {
    res.statusCode = 200;
    return res.end();
  }

  req.headers.host = hostTarget;
  req.headers.referer = hostTarget;



  /* start reading the body of the request*/
  let bdy = "";
  req.on('readable', function() {
    bdy += req.read();
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

    /* copy over response headers 

    
    */


    res.headers = response.headers;

    /* check to see if the response is not a text format */
    let ct = response.headers.get('content-type');

    if ((ct) && (ct.indexOf('image') == -1) && (ct.indexOf('video') == -1) && (ct.indexOf('audio') == -1)) {

      const path_list = pat.split('.');
      const path_end = path_list[path_list.length - 1];

      switch (path_end) {
        case 'js':
          res.removeHeader('content-type');
          res.setHeader('content-type', 'text/javascript');
          break;
        case 'css':
          res.removeHeader('content-type');
          res.setHeader('content-type', 'text/css');
          break;
        case 'html':
          res.removeHeader('content-type');
          res.setHeader('content-type', 'text/html');
          break;
        case 'xhtml':
          res.removeHeader('content-type');
          res.setHeader('content-type', 'application/xhtml+xml');
          break;
        case 'xml':
          res.removeHeader('content-type');
          res.setHeader('content-type', 'application/xml');
          break; application / json
        case 'json':
          res.removeHeader('content-type');
          res.setHeader('content-type', 'application/json');
          break; application / json
        case 'jsonp':
          res.removeHeader('content-type');
          res.setHeader('content-type', 'application/javascript');
          break;
        case 'pdf':
          res.removeHeader('content-type');
          res.setHeader('content-type', 'application/pdf');
          break;
        case 'mht':
          res.removeHeader('content-type');
          res.setHeader('content-type', 'multipart/related');
          break;
        case 'mhtml':
          res.removeHeader('content-type');
          res.setHeader('content-type', 'multipart/related');
          break;
        default:
          break;
      }

      /* Copy over target response and return */
      let resBody = await response.text();
      res.end(resBody);


    } else {

      /* if not a text response then redirect straight to target */
      res.setHeader('location', 'https://' + hostTarget + path);
      res.statusCode = 301;
      res.end();

    }
  });


}
