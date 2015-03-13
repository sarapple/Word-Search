// require the controller to route url requests to
var nav 		= require('./../server/controllers/nav.js');
module.exports 	= function Routes(app){
	app.get 	('/',          		function(req,res)  			{ 	nav.index(req,res);			});							
	app.get 	('/words',          		function(req,res)  	{ 	res.send(nav.getWords());	});		
};
