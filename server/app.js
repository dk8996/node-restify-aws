var reqCount = 0;
var restify = require('restify');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var AWS = require('aws-sdk');

//AWS config, create a bucket for putting all the requests
AWS.config.loadFromPath('credentials.json');
AWS.config.update({region: 'us-east-1'});
var s3bucket = new AWS.S3({params: {Bucket: 'data'}});

console.log("about to create a bucket");
s3bucket.createBucket(function() {});


if (cluster.isMaster) {
	console.log('forking ' + numCPUs + ' processes');
	// Fork workers.
	for ( var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {
		console.log('ERROR! worker ' + worker.process.pid + ' died - attempting to restart');
		setTimeout(function() {
			cluster.fork();
		}, 1000); // wait 1 second before forking again
	});
	

	
} else {
	console.log("run");

	var server = restify.createServer();
	server.use(restify.queryParser());
	//plugin sets up all of the default headers for the system
	//server.use(restify.fullResponse());
	//remapps the body json to params but wont work with more complex json objects
	server.use(restify.bodyParser({
		mapParams : false
	}));
	//server.use(restify.bodyParser());
	//server.use(restify.jsonp());
	//server.pre(function(req, res, next) {
	//	req.headers.accept = 'application/json';
	//	return next();
	//});

	server.post('/mappings', mappings);
	server.listen(8080, function() {
		console.log('%s listening at %s', server.name, server.url);
	});
}

function mappings(req, res, next) {
	if (req.params.api_key === undefined) {
		return next(new restify.InvalidCredentialsError('api_key must be supplied'));
	}
	if (req.body === undefined) {
		return next(new restify.InvalidContentError('Invalid JSON in the POST body'));
	}

	reqCount++;
	var data = {
		Key : new Date().getTime().toString() + "-" + reqCount.toString(),
		Body : JSON.stringify(req.body)
	};
	console.log("put object :" + data.Key);
	s3bucket.putObject(data, function(err, data) {
		if (err) {
			console.log("Error uploading data: ", err);
		} else {
			console.log("Successfully uploaded data" + data.Key);
		}
	});
	res.send(202);
	return next();

}

process.on('exit', function() {
	console.log('About to exit.');
});
