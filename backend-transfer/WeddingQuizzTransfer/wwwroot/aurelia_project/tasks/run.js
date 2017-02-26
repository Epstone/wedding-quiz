import gulp from 'gulp';
import browserSync from 'browser-sync';
import historyApiFallback from 'connect-history-api-fallback/lib';
import project from '../aurelia.json';
import build from './build';
import { CLIOptions } from 'aurelia-cli';

var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var serverStarted = false;

function log(message) {
    console.log(message); //eslint-disable-line no-console
}

function onChange(path) {
    log(`File Changed: ${path}`);
}

function reload(done) {
    browserSync.reload();
    done();
}

let serve = gulp.series(
    build,
    done => {

        if (!serverStarted) {

            console.log("Aktuelles verzeichnis: " + __dirname);
            var webRoot = __dirname + '\\..\\..\\';
            console.log("Aktuelles WebRoot: " + webRoot);
            app.use('/scripts',express.static( webRoot + 'scripts'));
            app.use('/styles', express.static(webRoot + 'styles'));
            
            app.get('/', function (req, res) {
                res.sendfile('./index.html');
            });

            io.on('connection', function (socket) {
                socket.on('chat message', function (msg) {
                    io.emit('chat message', msg);
                });
            });

            http.listen(3999, function () {
                console.log('listening on *:3999');
            });
        }

        //     browserSync({
        //         online: false,
        //         open: false,
        //         port: 9000,
        //         logLevel: 'silent',
        //         server: {
        //             baseDir: ['.'],
        //             middleware: [historyApiFallback(), function (req, res, next) {
        //                 res.setHeader('Access-Control-Allow-Origin', '*');
        //                 next();
        //             }]
        //         }
        //     }, function (err, bs) {
        //         let urls = bs.options.get('urls').toJS();
        //         log(`Application Available At: ${urls.local}`);
        //         log(`BrowserSync Available At: ${urls.ui}`);
        //         done();
        //     });
    }
);


let refresh = gulp.series(
    build,
    reload
);

let watch = function () {
    gulp.watch(project.transpiler.source, refresh).on('change', onChange);
    gulp.watch(project.markupProcessor.source, refresh).on('change', onChange);
    gulp.watch(project.cssProcessor.source, refresh).on('change', onChange);
};

let run;

if (CLIOptions.hasFlag('watch')) {
    run = gulp.series(
        serve,
        watch
    );
} else {
    run = serve;
}

export default run;
