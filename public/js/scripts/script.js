$( document ).ready(function(){
	//some view settings on load
	var height = $("table").height();
	$('ul').css('height', height);
	
	// get answers
	$( "button" ).click(function(e) {
		$('td').css('background-color', 'transparent');
		$.ajax({
			method: "GET",
      		url: "/words",
      		dataType: 'json',
      		success: function(data) {
      			var colors = ['red', 'green', 'blue', 'orange', 'purple'];
      			for (var i = 0; i < data.length; i++) {
      				var colorRand = colors[Math.floor(Math.random() * colors.length)];
      					x = data[i].XAxis,
      					y = data[i].YAxis,
      					box = '#x'+ x.toString() + 'y' + y.toString(),
      					length = data[i].word.length-1,
      					direction = data[i].direction,
      					move = [0,0];
      				$(box).css('background-color', colorRand);
      				switch (direction){
      					case 'top':
      						move = [0,-1];
      						break;
      					case 'bot':
      						move = [0,1];
      						break;
       					case 'left':
      						move = [-1,0];
      						break;
       					case 'right':
      						move = [1,0];
      						break;
       					case 'dur':
      						move = [1,-1];
      						break;
       					case 'dul':
      						move = [-1,-1];
      						break;
       					case 'ddr':
      						move = [1,1];
      						break;
       					case 'ddl':
      						move = [-1,1];
      						break;
      				}
      				while(length){
      					x+=move[0];
      					y+=move[1];
      					box = '#x'+ x.toString() + 'y' + y.toString();
      					length--;
      					var $temp = $('<div style="background:none;display:none;"/>').appendTo('body');
						var transparent = $temp.css('backgroundColor');
						$temp.remove();
      					if ( $(box).css('backgroundColor') != transparent ) {
      						$(box).css('background-color', '#CBCBCB');	
						} else {
							$(box).css('background-color', colorRand);
						}
      				}
      				$('#answers-container tbody').append('<tr><td>'+data[i].word+'</td><td>'+data[i].XAxis+'</td><td>'+data[i].YAxis+'</td><td>'+data[i].direction+'</td></tr>');
      			}
      		}
    	}).responseJSON;
	})

	var words = $('#middle').width() - $('#middle table').width() - 10;
	$('#middle.wordList').css('width', words);
	var counter = 1,
		letter = {},
		letters = [],
		boxes = [],
		letter = {},
		gArray = [],
		inc = [];
		wordStart=false;
	//on click of letter, begin the first letter of found word
	//on second click, combine all letters in the array and check to see if they are in the list
	$( "td" ).click(function() {
		if(!wordStart){
			wordStart = true;
			var coord = $(this).attr('class'),
				coord = coord.split(',');
			gArray.push(parseInt(coord[0]));
			gArray.push(parseInt(coord[1]));			
			letter.letter = $(this).text();
			letter.coordX = coord[0];
			letter.coordY = coord[1];
			letters.push($(this).text());
			boxes.push($(this));
			$(this).css('background-color', '#DFE187');
		}
		else {
			var element = '.';
			for (var i = 0; i < letters.length; i++) {
				element+=letters[i];
			};
			if( $(element).length ){
				for (var i = 0; i < boxes.length; i++) {
					boxes[i].css('background-color', '#A5FFB8');
				};
				$(element).addClass('animated hinge');
				$(element).css('height', 0).delay(2000);
			}
			else {
				for (var i = 0; i < boxes.length; i++) {
					boxes[i].css("background-color", "");
				}
			}
			counter = 1,
			letter = {},
			letters = [],
			boxes = [],
			letter = {},
			gArray = [],
			inc = [];
			wordStart=false;       
		}
	});
	//on hover, make sure the next hover that is highlighted is legal to hover over, and if so, push it to the letters
	$( "td" ).hover(function() {
		if(wordStart){
		  	if (counter==1){
		  		var side = false;
		  		switch($(this).attr('class')){
		 			case ((gArray[0]+1) + ',' + gArray[1]): 		//-right-
		 				side = true;
		 				inc = [1,0];
		 				break;
		 			case ((gArray[0]+1) + ',' + (gArray[1]+1)):  	// right down 
		 				side = true;
		 				inc = [1,1];
		 				break;
		 			case ((gArray[0]+1) + ',' + (gArray[1]-1)): 	//right up
		 				side = true;
		 				inc = [1,-1];
		 				break;
		 			case ((gArray[0]-1) + ',' + gArray[1]):  		//-left-
		 				side = true;
		 				inc = [-1,0];
		 				break;
		 			case ((gArray[0]-1) + ',' + (gArray[1]+1)):  	// left down
		 				side = true;
		 				inc = [-1,1];
		 				break;
		 			case ((gArray[0]-1) + ',' + (gArray[1]-1)): 	// left up
		 				side = true;
		 				inc = [-1,-1];
		 				break;
		 			case (gArray[0] + ',' + (gArray[1]-1)): 		//-down-
		 				side = true;
		 				inc = [0,-1];
		 				break;
		 			case (gArray[0] + ',' + (gArray[1]+1)):  		// -up-
		 				side = true;
		 				inc = [0,1];
		 				break; 				
		  		}
		  		if(side){
		  			gArray[0] += inc[0];
		  			gArray[1] += inc[1];
					$(this).css('background-color', '#DFE187');					
		 			letters.push($(this).text());
					boxes.push($(this));
		 			counter++;
		  		}
		  	}
			else {
				var location = ((gArray[0]+inc[0])+','+(gArray[1]+inc[1]));
				if($(this).attr('class')==location.toString()){
					boxes.push($(this));
					letters.push($(this).text());
					$(this).css('background-color', '#DFE187');	
		 			gArray[0] += inc[0];
		 			gArray[1] += inc[1];	
					counter++;
				}
			}
		}
	});
	//if user makes a mistake, let them leave the table and the highlights resets
	$( "table" ).mouseleave(function() {
		for (var i = 0; i < boxes.length; i++) {
			boxes[i].css("background-color", "");
		};
		counter = 1,
		letter = {},
		letters = [],
		boxes = [],
		letter = {},
		gArray = [],
		inc = [];
		wordStart=false;   
	});
});