// SUMMARY: Connect to the MONGODB database (generate error if can't connect). Load all files stored in the models foder

var mongoose = require('mongoose'),
	env = process.env.NODE_ENV || 'test', //set env to whatever is set in NODE, if not set then use development
	config = require('./config')[env], //whatever comes back from it, set it to env
    fs = require('fs');

// Bootstrap db connection
// Connect to mongodb
var connect = function(){
	var options = { server: { socketOptions: { keepAlive: 1 } } };
	mongoose.connect(config.db, options);
};
connect();

// Error Handler
mongoose.connection.on('error', function(err){
	console.log(err);
})

//Reconnect when closed
mongoose.connection.on('disconnected', function() {
	connect();
})

//Bootstrap-load the models equivalent of autoload
var models_path = __dirname + '/../server/models';
fs.readdirSync(models_path).forEach(function (file) {
	if (~file.indexOf('.js')) require(models_path + '/' + file)
})