var express = require('express'),
    app = express(),
    args = process.argv.splice(2),
    port = args[0] !== 'undefined' ? args[0] : 3000,
    config = require('../bin/config'),
    getContent,
    getStatus,
    respond;

getContent = function(url, callback) {
    var content = '',
        phantom = require('child_process').spawn('phantomjs', [
            '--config=' + __dirname + '/../bin/phantom-config.json',
            __dirname + '/phantom-server.js',
            url
        ]);
    phantom.stdout.setEncoding('utf8');
    phantom.stdout.on('data', function(data) {
        content += data.toString();
    });
    phantom.stderr.on('data', function(data) {
        if (config.verbose) {
            console.log('url: ' + url + ' stderr: ' + data);
        }
    });
    phantom.on('exit', function(code) {
        if (code !== 0) {
            if (config.verbose) {
                console.log('url: ' + url + ' ERROR: PhantomJS Exited with code: ' + code);
            }
        } else {
            if (config.verbose) {
                console.log(
                    'url: ' + url +
                    ' HTMLSnapshot completed successfully.' +
                    ' Content-Length: ' + content.length
                );
            }
            callback(content);
        }
    });
};

getStatus = function(content) {
    // read seoserver-http-status and return status code
    var status = 200;
    try {
        status = Number(
            content
            .split('</head>')[0]
            .split('<head>')[1]
            .match(/meta name="seoserver-http-status" content="(\d{3})"/mi)[1]
        );
    } catch (e) {
        console.log('WARNING: Could not parse status code: ', e);
    }
    return status;
};

respond = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    if (config.verbose) {
        console.log('Headers: ', req.headers);
    }
    var proto = config.x_forwarded_proto || req.headers['x-forwarded-proto'] || 'http',
        host = config.x_forwarded_host || req.headers['x-forwarded-host'],
        url;
    if (req.headers.referer) {
        url = req.headers.referer;
    }
    if (host) {
        url = proto + '://' + host + req.params[0];
    }
    console.log('url:', url);
    getContent(url, function(content) {
        res.status(getStatus(content)).send(content);
    });
};

app.get(/(.*)/, respond);
app.listen(port);
