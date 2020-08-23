var http=require('http');
const fs= require('fs');
var path=require('path');
const qrcode = require('qrcode');
const crypto = require('crypto');

const hostname ="192.168.18.23";// '127.0.0.1';//'83.59.176.135'; //'127.0.0.1';
const portHttp = 5001
var servidorHttp=http.createServer(function (solicitud,respuesta){
    function getPostData(cb){
        console.log("getPostData", solicitud.method)
        if (solicitud.method == 'POST') {
            console.log('POST')
            var body = '';
            solicitud.on('data', function(data) {
              body += data;
            })
            solicitud.on('end', function() {
                cb(body);
            })
        }
    }
    var urlSplitted=solicitud.url.split("/");
    console.log(urlSplitted);
    if (solicitud.url == '/') solicitud.url = '/index.html';  
    var filePath = '.' + solicitud.url;
    var extname = String(path.extname(filePath)).toLowerCase();
    var contentType = 'text/html';
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };
    contentType = mimeTypes[extname] || 'application/octet-stream';
    var answer=false;
    if(!answer && urlSplitted.find((e)=>e=="qr")){
        const qrOption = { 
            //margin : 7,
            width : 175,
            errorCorrectionLevel: 'H'
        };
        var juego={id:urlSplitted[urlSplitted.indexOf("qr")+1]}
        getPostData((e)=>{juego.msj=e;console.log(juego)})
        qrcode.toDataURL("http://"+hostname+":"+portHttp+"/mt/"+urlSplitted[urlSplitted.indexOf("qr")+1], qrOption, function (err, url) {
            if(!err){
                respuesta.writeHead(200, { 'Content-Type': "application/octet-stream",'Content-Length': url.length });
                respuesta.end(url, 'utf-8');
            }
        })
        juegos.push(juego);
        answer=true; 
    }
    if(!answer && urlSplitted.find((e)=>e=="mt")){
        contentType = 'text/html';
        fs.readFile('./master.html', function(error, content) {
            if(!error){
                respuesta.writeHead(200, { 'Content-Type': contentType });
                const id=urlSplitted[urlSplitted.indexOf("mt")+1];
                const juego=juegos.find(e=>e.id==id);
                const msj= juego?juego.msj:""
                console.log(id, msj)
                respuesta.write("<div id='contenido'>"+msj+"</div>");
                respuesta.end(content, 'utf-8');
            }
        });
        answer=true;
    }
    if(!answer){
        fs.readFile(filePath, function(error, content) {
            if (error) {
                if(error.code == 'ENOENT'){
                    fs.readFile('./404.html', function(error, content) {
                        respuesta.writeHead(200, { 'Content-Type': contentType });
                        respuesta.end(content, 'utf-8');
                    });
                }
                else {
                    respuesta.writeHead(500);
                    respuesta.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                    respuesta.end();
                }
            }
            else {
                respuesta.writeHead(200, { 'Content-Type': contentType });
                respuesta.end(content, 'utf-8');
            }
        });
        answer=true;
    }
      
});
var juegos=[]

servidorHttp.listen(portHttp);
console.warn('Http listen on port '+portHttp)