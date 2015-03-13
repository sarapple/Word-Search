// require mongo models and use schema created in server/models
var mongoose= require('mongoose'),
    User    = mongoose.model('User'),
    fs = require('fs');

module.exports = {

	// Display the view that includes letters, words, and results
	index: function(req, res){
        var letters = this.loadText("./public/puzzle/WordSearch.txt", 'utf8');
            words = this.loadText("./public/puzzle/WordList.txt", 'utf8'),
            results = this.processWordSearch(letters,words);
            send = {    letters: letters,
                        words: words,
                        results: results
                    };
        res.render('pages/index', send);
	},

    //function to set up word search view and answers
    processWordSearch: function(letters, words){
        var markers = this.nodesCreated(letters);
        var markers = this.connectNodes(markers, markers[0+','+0]);
        var results = this.findWords(markers,words, markers[0+','+0]);
        return this.getWords();
    }, 

    //read .txt file synchronously and return a 2D array, each array separated by new line
    loadText: function(file, type){
        var letters = fs.readFileSync(file, type),
            rowArray = letters.split('\n'),
            twoDArray = [],
            oneDArray = [],
            rowCounter = 0,
            stopCounting = false;
        for (var i = 0; i < letters.length; i++) {
            if(stopCounting) { rowCounter++; }
            if(letters[i]!==' '){
                if(letters[i]=='\n' || i==letters.length-rowCounter-2){
                    twoDArray.push(oneDArray);
                    oneDArray=[];
                    stopCounting = true;
                }
                else if (i>letters.length-rowCounter-1 && i < letters.length-1) {
                    oneDArray.push(letters[i].toUpperCase());
                }
                else if(i == letters.length-1){
                    oneDArray.push(letters[i].toUpperCase());   
                    twoDArray.push(oneDArray);                 
                }
                else {
                    oneDArray.push(letters[i].toUpperCase());
                }
            }
        }
        return twoDArray;
    },

    //Create nodes for each letter, with direction properties!
    nodesCreated: function(twoDArray){
        Letter = function(letter, coordX, coordY){
            this.letter = letter;
            this.coordX = coordX;
            this.coordY = coordY;
            this.top = null;
            this.bot = null;
            this.left = null;
            this.right = null;
            this.dul = null;
            this.dur = null;
            this.ddl = null;
            this.ddr = null;
        }

        //markers is used to create dynamic variables as I build objects from the same class in a loop
        var markers = [];
        for(var i=0; i < twoDArray.length; i++){
            for(var j=0; j < twoDArray[i].length; j++){
                coord = i.toString()+','+j.toString();
                markers[coord] = new Letter(twoDArray[i][j], i, j);    
            }                                       
        }  
        return markers;   
    },

    //connect the nodes with pointers
    connectNodes: function(markers, node){
        var i = node.coordX,
            j = node.coordY; 

        //assign pointers for all directions for each letter
        if(typeof(markers[(i+1)+','+j]) != 'undefined' && markers[i+','+j].bot == null){                    //go bot
            markers[i+','+j].bot = markers[(i+1)+','+j]; 
            this.connectNodes(markers, markers[(i+1)+','+j]); 
        }
        if(typeof(markers[(i-1)+','+j]) != 'undefined' && markers[i+','+j].top == null){                    //go top
            markers[i+','+j].top = markers[(i-1)+','+j]; 
            this.connectNodes(markers, markers[(i-1)+','+j]);  
        }
        if(typeof(markers[i+','+(j+1)]) != 'undefined' && markers[i+','+j].right == null){                   //go right
            markers[i+','+j].right = markers[i+','+(j+1)];  
            this.connectNodes(markers, markers[i+','+(j+1)]);   
        }
        if(typeof(markers[i+','+(j-1)]) != 'undefined' && markers[i+','+j].left == null){                     //go left
            markers[i+','+j].left = markers[i+','+(j-1)]; 
            this.connectNodes(markers, markers[i+','+(j-1)]);      
        }
        if(typeof(markers[(i-1)+','+(j-1)]) != 'undefined' && markers[i+','+j].dul == null){                    //go topleft
            markers[i+','+j].dul = markers[(i-1)+','+(j-1)]; 
            this.connectNodes(markers, markers[(i-1)+','+(j-1)]); 
        }
        if(typeof(markers[(i-1)+','+(j+1)]) != 'undefined' && markers[i+','+j].dur == null){                    //go topright
            markers[i+','+j].dur = markers[(i-1)+','+(j+1)]; 
            this.connectNodes(markers, markers[(i-1)+','+(j+1)]);  
        }
        if(typeof(markers[(i+1)+','+(j-1)]) != 'undefined' && markers[i+','+j].ddl == null){                   //go botleft
            markers[i+','+j].ddl = markers[(i+1)+','+(j-1)];  
            this.connectNodes(markers, markers[(i+1)+','+(j-1)]);   
        }
        if(typeof(markers[(i+1)+','+(j+1)]) != 'undefined' && markers[i+','+j].ddr == null){                     //go botright
            markers[i+','+j].ddr = markers[(i+1)+','+(j+1)]; 
            this.connectNodes(markers, markers[(i+1)+','+(j+1)]);      
        }
        return markers;
    },

    // Go though the chosen word, and see if the next letter matches in any direction, if so, proceed in that direction and keep checking
    checkWord: function(node, word, index, direction){
        if(index==0){
            if (node.top && node.top.letter == word[index+1]) {
                return this.checkWord(node['top'], word, index+1, 'top');                        
            }
            else if (node.dul &&  node.dul.letter == word[index+1]) {
                return this.checkWord(node['dul'], word, index+1, 'dul');
            }
            else if (node.left && node.left.letter == word[index+1]) {
                return this.checkWord(node['left'], word, index+1, 'left');
            }
            else if (node.ddl && node.ddl.letter == word[index+1]) {
                return this.checkWord(node['ddl'], word, index+1, 'ddl');
            }
            else if (node.bot && node.bot.letter == word[index+1]) {
                return this.checkWord(node['bot'], word, index+1, 'bot');
            }
            else if (node.ddr && node.ddr.letter == word[index+1]) {
                return this.checkWord(node['ddr'], word, index+1, 'ddr');
            }
            else if (node.right && node.right.letter == word[index+1]) {
                return this.checkWord(node['right'], word, index+1, 'right');
            }
            else if (node.dur && node.dur.letter == word[index+1]) {
                return this.checkWord(node['dur'], word, index+1, 'dur');
            }
            else {
                return false;
            }
        }
        else if (index > 0 && index < word.length-1){
            if(word[index]==node.letter && node[direction]){
                return this.checkWord(node[direction], word, index+1, direction);
            }
            else{
                return false;
            }
        }
        else if(index == word.length-1){
            if(word[index]==node.letter){
                return direction;
            }
            else{
                return false;
            }
        }
        else {
            return false;
        }
    
    },

    //putter and getter methods for storing foundWords
    getWords: function(){
        if(!this.foundWords){
            this.foundWords = [];
        }   
        return this.foundWords;
    },
    addWords: function(object){
        if(!this.foundWords){
            this.foundWords = [];
        }   
        for (var i = 0; i < this.foundWords.length; i++) {
            if(this.foundWords[i].word==object.word){
                var wordExists = true;
            }
        }
        if(!wordExists){
            this.foundWords.push(object);
        }
    },

    //go through all letters in the scramble, see if it starts with any in the wordList, if it does, run findWords for each.
    findWords: function(markers, words, node){
        if(typeof node.searched === 'undefined'){
            node.searched=false;
        }
        if(!node.searched){
            for (var i = 0; i < words.length; i++) {
                if(words[i][0]==node.letter){
                    var foundWord = this.checkWord(node, words[i], 0);
                    if(foundWord){
                        var str = words[i].join("")
                        var directionCopy = foundWord;
                        var item =  {
                                    XAxis: node.coordX,
                                    YAxis: node.coordY,                      
                                    word: str,
                                    }
                        item.direction = directionCopy;
                        this.addWords(item)
                        words.splice (i, 1);
                    }
                }
            }
            
            node.searched = true;
            if (node.top) { var top = this.findWords(markers, words, node.top);     }
            if (node.dul) { var dul = this.findWords(markers, words, node.dul);     }
            if (node.left){ var left = this.findWords(markers, words, node.left);    }                      
            if (node.ddl) { var ddl = this.findWords(markers, words, node.ddl);     }  
            if (node.bot) { var bot = this.findWords(markers, words, node.bot);     }  
            if (node.ddr) { var ddr = this.findWords(markers, words, node.ddr);     }  
            if (node.right){ var right = this.findWords(markers, words, node.right);  }  
            if (node.dur) { var dur = this.findWords(markers, words, node.dur);     }
            
        }

        return;             
    }
}