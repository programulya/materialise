var express = require('express'),
    app = express(),
    route = require('routes/route'),
    http = require('http'),
    HttpError = require('error').HttpError,
    EmailSender = require('libs/EmailSender'),
    logger = require("libs/log")(module),
    config = require("config");

require("mongooseDb");
app.use(express.favicon());

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
    app.use(express.cookieParser());
    app.use(express.bodyParser({ keepExtensions: true, uploadDir: './tmp' }));
    app.set('views', __dirname + "/views");
    app.set('view engine', 'hbs');
});

app.use( require("middleware/sendHttpError") );

//routing
route(app);

//404
app.use(function(req, res, next){
    logger.log('warn', { status: 404, url: req.url });
    res.status(404);
    res.render('error', { status: 404, url: req.url });
});

app.use(function(err, req, res, next){

    logger.log('error', { error: err });

    if( typeof err == "number"){
        err = new HttpError(err);
    }

    if( err instanceof HttpError ){
        res.sendHttpError(err);
        //emailSender = new EmailSender({text: err.status + err.message.error});
    }else{

        if( app.get("env") == "development" ){
            express.errorHandler()(err, req, res, next);
        }else{
            express.errorHandler()(err, req, res, next);
            res.send(500);
        }
    }

})

//create server
var server = http.createServer(app);
server.listen(config.get("port"));
logger.info("Web server listening: " + config.get("port"));
