'use strict';

class SelfType {
    constructor (options) {
        this.getDOMNodes();
        this.loadOptions(options);
        this.setWord();
        
        return this.returnPublicMethods();
    }
    
    addHighlight () {
        var def_opt = this.default_options();
        var opt = this.options;
        
        this.oldValue = this.text.style.color || def_opt.highlightColor;
        this.oldValueBg = this.text.style.backgroundColor || def_opt.highlightBg;
        
        if (opt.highlightHideCursor === true && this.cursor) {
            this.cursor.style.display = 'none';
        }
        
        this.text.style.backgroundColor = opt.highlightColor;
        if (this.darkColor(opt.highlightColor)) {
            this.text.style.color = def_opt.lightColor;
        }
    }
  
    addLetter () {
        if (this.timeout !== undefined && this.timeout !== '') return;
        
        var self = this;
        var char = this.word.substr(0, 1);
        
        this.setupTimeout();

        if (char === '^') char = this.waitPattern(char);
        if (char === '.' || char === ',') this.parsePauseCharacter(char);
        
        this.dirtyHack();
        this.parseTimeout();

        setTimeout(function () {
            self.text.innerHTML += char;
            self.word = self.word.substr(1);
            self.scrollToBottom();
            self.resetTimeout();
            if (!self.word) {
                self.setDelay();
            }
        }, this.timeout);
    }
    
    adjustCount () {
        if (this.options.repeat === true) {
            this.count = 1;
            return;
        }
        
        if (this.count === undefined) {
            this.count = 0;
        }
        
        this.count++;
    }
    
    canGenerateNewWord () {
        if (this.options.repeat === true) return true;
        return (this.count || 0) < this.options.words.length;
    }
    
    darkColor (color) {
        if (color.indexOf('#') === -1) return false;
        
        var rgb = parseInt(color.substring(1), 16); // Strip the hash sign from the colour.
        var r = (rgb >> 16) & 0xff; 
        var g = (rgb >>  8) & 0xff;
        var b = (rgb >>  0) & 0xff;
        
        var med = Math.floor((r + g + b) / 3);

        if (med > 255 / 2) return true;
        
        return false;
    }
    
    default_options () {
        return {
            default_speed: 5,
            highlightBg: 'transparent',
            highlightColor: 'rgba(0, 0, 0, .7)',
            lightColor: 'rgba(255, 255, 255, .9)',            
            max_speed: 10,
            min_speed: 1,
        };
    }
  
    delayHasPassed () {
        if (!this.timestamp) return true;
        
        var prop = 'pause';
        var route = (!this.text.innerHTML) ? 'pauseStart' : 'pauseEnd';
        
        if (this.options[route] !== undefined) {
            prop = route;
        }
        
        return this.timestamp + this.options[prop] < Date.now();
    }
    
    dirtyHack () {
        this.text.innerHTML += '<br/>';
        this.text.innerHTML = this.text.innerHTML.substr(0, this.text.innerHTML.length - 4);
    }
    
    emptyTextHTML () {
        this.text.innerHTML = '';
    }
    
    errors () {
        return {
            cursor: 'The element for the cursor could not be found! If you do not want to add one, you can ignore this message. Otherwise, make sure you included in your HTML a tag with the id attribute \'st-cursor\'.',
            text: 'The element where SelfType should be initialised could not be found! Are you sure you provided a HTML tag with the id attribute \'st-text\'?',
            words: ['Incorrect parameter set for words.'],
        }
    }
    
    finishResetText () {
        this.emptyTextHTML();
        this.removeHighlight();
        this.setDelay(-(this.options.pause / 4));
        this.resetting_text = false;
    }
    
    getAttrsDOMNode () {
        if (!this.text) return;
        
        var options = {};
        
        var attrs = this.text.attributes;
        for (var i = 0; i < attrs.length; i++) {
            if (attrs[i].nodeName.indexOf('data-') > -1) {
                var val = attrs[i].nodeValue;
                var parsed = parseInt(val);
                
                options[attrs[i].nodeName.substr(5)] = (isNaN(parsed)) ? val : parsed;
            }
        }
        
        var words = this.getDOMWords();
        if (words.length) options.words = words;
        
        return options;
    }
    
    getDOMNodes () {
        var cursor = document.getElementById('st-cursor');
        var text = document.getElementById('st-text');
        
        if (text !== null) {
            this.text = text;
        } else {
            console.warn(this.errors().text);
        }
        
        if (cursor !== null) {
            this.cursor = cursor;
        } else {
            console.warn(this.errors().cursor);
        }
    }
    
    getDOMWords () {
        var result = [];
        var words = this.text.querySelectorAll('span');
        for (var i = 0; i < words.length; i++) {
            result.push(words[i].innerHTML);
            words[i].remove();
        }
        
        this.emptyTextHTML();
        return result;
    }
    
    getNextWord () {
        this.wordsIsValidArray({errprCheck: true});
        
        if (this.pointerPosition === undefined) {
            this.resetPointer();
        }
        
        var word = this.options.words[this.pointerPosition];
        this.movePointer(); // Move the pointer after we got the correct word.
        return word;
    }
    
    getRandomWord () {
        this.wordsIsValidArray({errorCheck: true});
        
        var random = Math.floor(Math.random() * this.options.words.length);
        var word = this.options.words[random];
        
        if (this.pointerPosition === random && this.options.words.length > 1) {
            word = this.getRandomWord();
        } else {
            this.movePointer(random);
        }
        
        return word;
    }
  
    loadOptions (options) {
        this.options = this.options();
        this.parseConfigObject(options);
        if (this.options.searchDOM === true) {
            this.parseConfigObject(this.getAttrsDOMNode());
        }
    }
    
    movePointer (position) {
        if (position !== undefined) {
            this.pointerPosition = position;
            return;
        }
        
        if (this.pointerPosition < (this.options.words.length - 1)) {
            this.pointerPosition += 1;
        } else {
            this.resetPointer();
        }
    }
  
    options () {
        return {
            appendPeriod: false,
            backspace: false,
            backspaceHighlight: true,
            highlightColor: '#289BCC',
            highlightHideCursor: true,
            keepWord: true,
            newLine: true,
            pause: 1000,
            repeat: false,
            randomize: false,
            searchDOM: true,
            speed: 5,
            words: ['awesome', 'amazing', 'the best language ever', 'pain', 'blood, sweat and tears', 'torture'],
        };
    };
    
    parseConfigObject(options) {
        if (typeof options !== 'object') return;
        
        for (var prop in options) {
            if (prop === 'speed') {
                options[prop] = this.parseSpeed(options[prop]);
            }

            if (prop === 'words') {
                options[prop] = (this.wordsIsValidArray({words: options[prop]})) ? options[prop] : this.options.words;
            }

            this.options[prop] = options[prop];
        }
    }
    
    parsePauseCharacter (char) {
        var log = Math.round(Math.log(this.options.speed + 1) * 10);
        var base = (char === '.') ? 6000 : 3200;   
        this.next_pause = Math.round(base/(log - 6));
    }
    
    parseSpeed (speed) {
        var opt = this.default_options();
        
        if (typeof speed === 'string') {
            switch (speed) {
                case 'slow':
                    speed = 1;
                    break;

                case 'fast':
                    speed = 7;
                    break;

                case 'sonic':
                    speed = 10;
                    break;

                case 'normal':
                default:
                    speed = opt.default_speed;
                    break;
            }
        } else if (typeof speed === 'number') {
            if (speed > opt.max_speed) {
                speed = opt.max_speed;
            }
            
            if (speed < opt.min_speed) {
                speed = opt.min_speed;
            }
        } else {
            speed = opt.default_speed;
        }
        
        return speed;
    }
    
    parseTimeout () {
        this.timeout = parseInt(this.timeout);
        if (isNaN(this.timeout)) {
            this.timeout = 0;
        }
    }
    
    pauseAnimation () {
        window.clearInterval(this.interval);
    }
    
    playAnimation () {
        if (this.text === undefined || this.text === null) return;
        
        var self = this;
        var opt = this.options;
        
        if (this.interval) {
            this.pauseAnimation();
        }
        
        self.interval = setInterval(function () {
            if (self.timestamp && !self.delayHasPassed()) return;

            self.timestamp = undefined; // Removes the delay.

            if (self.word) {
                self.addLetter();
            } else if (self.text.innerHTML && opt.keepWord === false) {
                opt.backspace === true ? self.removeLetter() : self.resetText(opt.backspaceHighlight);
            } else {
                self.setWord();
            }
        }, Math.round(250 / opt.speed));
    }
    
    removeHighlight () {
        if (this.options.highlightHideCursor === true && this.cursor) {
            this.cursor.style.display = 'inline';
        }
        
        this.text.style.backgroundColor = this.oldValueBg;
        this.text.style.color = this.oldValue;
    }
  
    removeLetter () {
        var text = this.text.innerHTML;
        this.text.innerHTML = text.substr(0, text.length - 1);
        if (!this.text.innerHTML) {
            this.setDelay();
        }
    }
    
    resetText (highlight) {
        if (this.resetting_text === true) {
            return;
        }
        
        this.resetting_text = true;
        
        var self = this;
        var opt = this.options;
        var timeout = 0;
        
        if (highlight === true) {
            var pause = (opt.pauseEnd !== undefined) ? opt.pauseEnd : opt.pause;
            timeout = pause / 1.5;
            this.addHighlight();
        }

        setTimeout(function () {
            self.finishResetText();
        }, timeout);
    }
    
    resetPointer () {
        this.pointerPosition = 0;
    }
    
    resetTimeout () {
        this.timeout = '';
    }
    
    returnPublicMethods () {
        return {
            options: this.options,
            pause: this.pauseAnimation.bind(this),
            play: this.playAnimation.bind(this),
        };
    }
    
    scrollToBottom () {
        this.text.parentNode.scrollTop = this.text.parentNode.scrollHeight;
    }
  
    setDelay (len) {
        var offset = 0;
        
        if (len !== undefined && !isNaN(len)) {
            offset = len;
        }
                
        this.timestamp = Date.now() + offset;
    }
    
    setWord () {
        var word = '';
        
        if (this.canGenerateNewWord()) {
            word = (this.options.randomize === true) ? this.getRandomWord() : this.getNextWord();
        }

        if (word !== '') {
            this.adjustCount();
            
            if (this.options.appendPeriod === true) {
                word += '.';
            }

            if (this.options.newLine === true && this.text.innerHTML) {
                this.text.innerHTML += '<br/>';
            }
        }
        
        this.word = word;
        this.playAnimation();
    }
    
    setupTimeout () {
        this.resetTimeout();

        if (this.next_pause !== false && this.next_pause !== undefined) {
            this.timeout = this.next_pause;
            this.next_pause = false;
        }
    }
    
    waitPattern (letter) {
        this.word = this.word.substr(1);
        
        if (this.word.substr(0, 1) !== '^') {
            if (this.timeout === undefined || this.timeout !== '' ) {
                this.timeout = '';
            }

            do {
                letter = this.word.substr(0, 1);
                this.timeout += letter;
                this.word = this.word.substr(1);
            } while (this.word.substr(0, 1).match(/[0-9]/));
            
            return this.word.substr(0, 1);
        }
        
        return letter;
    }
    
    wordsIsValidArray (options) {
        var words = options.words || this.options.words;
        var is_valid = typeof words === 'object' && words !== null && words.length >= 1;
        
        if (!is_valid && options.errorCheck === true) {
            this.options.words = this.errors().words;
        }
        
        return is_valid;
    }
}

var selftype;

window.onload = function () {
    selftype = new SelfType();
}

window.onbeforeunload = function () {
    if (selftype !== undefined) {
        selftype.pause();
    }
};