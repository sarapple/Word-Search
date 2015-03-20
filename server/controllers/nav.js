var fs = require('fs');
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

    // Function to set up word search view and answers
    processWordSearch: function(letters, words){
        var markers =   this.nodesCreated(letters);
            markers =   this.connectNodes(markers, markers['0,0']);
                        this.findWords(markers, words, markers['0,0']);
        return this.getWords();
    }, 

    // Read .txt file synchronously and return a 2D array, each array separated by new line
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

    // Create nodes for each letter, with direction properties! 
    nodesCreated: function(twoDArray){
        Letter = function(letter, coordX, coordY){
            this.letter = letter;
            this.coordY = coordY;
            this.coordX = coordX;
            this.top    = null;
            this.bot    = null;
            this.left   = null;
            this.right  = null;
            this.dul    = null;
            this.dur    = null;
            this.ddl    = null;
            this.ddr    = null;
            this.touched= false; //keep track to make sure ALL letters were identified
            this.searched=false;
        }

        // Markers is used to create dynamic variables as I build objects from the same class in a loop
        var markers = [];
        this.counter=0; //temp
        this.letters=0; //temp
        for(var y=0; y < twoDArray.length; y++){
            for(var x=0; x < twoDArray[y].length; x++){
                coord = y.toString()+','+x.toString();
                markers[coord] = new Letter(twoDArray[y][x], x, y);  
                this.counter++ //keep track of letters created
            }                                       
        }  
        return markers;   
    },

    // Connect the nodes with pointers
    connectNodes: function(markers, node){
        if(!node.touched){
            this.letters++;
        }
        node.touched = true; 
        var x = node.coordX,
            y = node.coordY,
            goRight      = markers[(y)+','+(x+1)],
            goLeft       = markers[(y)+','+(x-1)],
            goBot        = markers[(y+1)+','+(x)],
            goTop        = markers[(y-1)+','+(x)],
            goBotLeft    = markers[(y+1)+','+(x-1)],
            goBotRight   = markers[(y+1)+','+(x+1)],
            goTopLeft    = markers[(y-1)+','+(x-1)],
            goTopRight   = markers[(y-1)+','+(x+1)];
        if(typeof(goBot) !=='undefined' && node.bot === null){                  //go bot
            node.bot = goBot; 
            this.connectNodes(markers, goBot); 
        }
        if(typeof(goTop) !== 'undefined' && node.top === null){                  //go top
            node.top = goTop; 
            this.connectNodes(markers, goTop);  
        }
        if(typeof(goRight) !== 'undefined' && node.right === null){              //go right
            node.right = goRight;  
            this.connectNodes(markers, goRight);   
        }
        if(typeof(goLeft) !== 'undefined' && node.left === null){                //go left
            node.left = goLeft; 
            this.connectNodes(markers, goLeft);      
        }
        if(typeof(goTopLeft) !== 'undefined' && node.dul === null){               //go topleft
            node.dul = goTopLeft; 
            this.connectNodes(markers, goTopLeft); 
        }
        if(typeof(goTopRight) !== 'undefined' && node.dur === null){               //go topright
            node.dur = goTopRight; 
            this.connectNodes(markers, goTopRight);  
        }
        if(typeof(goBotLeft) !== 'undefined' && node.ddl === null){                //go botleft
            node.ddl = goBotLeft;  
            this.connectNodes(markers, goBotLeft);   
        }
        if(typeof(goBotRight) !== 'undefined' && node.ddr === null){                //go botright
            node.ddr = goBotRight; 
            this.connectNodes(markers, goBotRight);      
        }
        return markers;
    },


    //setter and getter methods for storing foundWords
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

    // Go though the chosen word, and see if the next letter matches in any direction, 
    // if so, proceed in that direction and keep checking
    checkWord: function(node, word, index, direction){
        var wordFound = false;
        if(index==0){
            console.log('in index=0. Letter: ' + word[index] + " word: " + word);
            if (node.top && node.top.letter == word[index+1]) {
                this.checkWord(node['top'], word, index+1, 'top');                 
            }
            if (node.dul && node.dul.letter == word[index+1]) {
                this.checkWord(node['dul'], word, index+1, 'dul');
            }
            if (node.left && node.left.letter == word[index+1]) {
                this.checkWord(node['left'], word, index+1, 'left');
            }
            if (node.ddl && node.ddl.letter == word[index+1]) {
                this.checkWord(node['ddl'], word, index+1, 'ddl');
            }
            if (node.bot && node.bot.letter == word[index+1]) {
                this.checkWord(node['bot'], word, index+1, 'bot');
            }
            if (node.ddr && node.ddr.letter == word[index+1]) {
                this.checkWord(node['ddr'], word, index+1, 'ddr');
            }
            if (node.right && node.right.letter == word[index+1]) {
                this.checkWord(node['right'], word, index+1, 'right');
            }
            if (node.dur && node.dur.letter == word[index+1]) {
                this.checkWord(node['dur'], word, index+1, 'dur');
            }
            return false;           //cases where letter does not match
        }
        else if (index > 0 && index < word.length-1){
            if(node){
                if(word[index]==node.letter){
                    this.checkWord(node[direction], word, index+1, direction);
                }
                else{
                    return false;       //cases where letter does not match
                }
            }
            return false;
        }
        else if(index == word.length-1){
            if(word[index]==node.letter){
                words.splice(this.wordI, 1);
                var str = word.join(""),
                    item =  {
                                XAxis: this.coordX,
                                YAxis: this.coordY,                      
                                word: str,
                            };
                    item.direction = direction;
                    this.addWords(item);
                    return true;
            }
            else{  
                return false;       //cases where letter does not match
            }
        }
        else {
            return false;            //odd scenario, return null
        }
    
    },

    // go through all letters, and see if it matches the letter the word starts with, if so check if
    // the word is what you're looking for by looking at neighbor letters
    findWords: function(markers, words, node){
        this.wordI = null;
        this.coordX = null;
        this.coordY = null;
        if(!node.searched){
            node.searched = true;
            for (var i = 0; i < words.length; i++) {
                if(words[i][0]==node.letter){
                    this.wordI = i;
                    this.coordX = node.coordX;
                    this.coordY = node.coordY;
                    this.checkWord(node, words[i], 0);
                }
            }
        if (node.top && !node.top.searched)      { this.findWords(markers, words, node.top);       }
        if (node.dul && !node.dul.searched)      { this.findWords(markers, words, node.dul);       }
        if (node.left && !node.left.searched)    { this.findWords(markers, words, node.left);      }                      
        if (node.ddl && !node.ddl.searched)      { this.findWords(markers, words, node.ddl);       }  
        if (node.bot && !node.bot.searched)      { this.findWords(markers, words, node.bot);       }  
        if (node.ddr && !node.ddr.searched)      { this.findWords(markers, words, node.ddr);       }  
        if (node.right && !node.right.searched)  { this.findWords(markers, words, node.right);     }  
        if (node.dur && !node.dur.searched)      { this.findWords(markers, words, node.dur);       }
        }
    }
}