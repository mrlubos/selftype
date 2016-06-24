'use strict';

var selftype = function () {};

selftype.prototype.init = function (options) {
	options = options || {};
	options.nodes = options.nodes || {};
        
    if (options.nodes.text) {
        this.text = options.nodes.text;
    } else {
        throw new Error(this.errors().text);
    }
    
    if (options.nodes.cursor) {
        this.cursor = options.nodes.cursor;
    } else {
        console.warn(this.errors().cursor);
    }
    
    this.loadOptions(options);
    this.setWord();
    
    return this.returnPublicMethods();
};

selftype.prototype.addHighlight = function () {
	var def_opt = this.default_options(),
        opt     = this.options;
    
    this.oldValue   = this.text.style.color || def_opt.highlightColor;
    this.oldValueBg = this.text.style.backgroundColor || def_opt.highlightBg;
    
    if (opt.highlightHideCursor === true && this.cursor) {
        this.cursor.style.display = 'none';
    }
    
    this.text.style.backgroundColor = opt.highlightColor;
    if (this.darkColor(opt.highlightColor)) {
        this.text.style.color = def_opt.lightColor;
    }
};

selftype.prototype.addLetter = function () {
    if (this.timeout !== undefined && this.timeout !== '') return;
    
    var self  = this,
        char  = this.word.substr(0, 1),
        color = '',
        expression;
    
    this.setupTimeout();

    if (char === '^') {
        char = this.waitPattern(char);
    }
    
    if (char === '&') {
        if (this.word.substr(0, 6) === '&nbsp;') {
            char = '&nbsp;';
            this.word = this.word.substr(char.length - 1);
        }
    }
    
    if (char === '$' && this.word.substr(1, 5) === 'color') {
        var semicolon = this.word.indexOf(';');
        
        // Colour definition.
        if (semicolon !== -1) {
            expression = this.word.substr(0, semicolon + 1);
            color = expression.substr(7);
            color = color.substr(0, color.length - 1);
            
            if (this.options.colors[color]) {
                color = this.options.colors[color];
            }
            
            this.options.color = color;
            this.word = this.word.substr(expression.length - 1);
            char = '';
        }
    }
    
    if ((!this.options.ignoreDiacriticalSigns) && (char === '.' || char === ',')) {
        this.parsePauseCharacter(char);
    }
    
    this.dirtyHack();
    this.parseTimeout();

    setTimeout(function () {
        // Wrap the element in <i> tag and apply styles.
        var node = document.createElement('i');
        node.style.color = self.options.color;
        node.innerHTML = char;
        self.text.appendChild(node);
        
        self.word = self.word.substr(1);
        self.scrollToBottom();
        self.resetTimeout();
        if (!self.word) {
            self.setDelay();
        }
    }, this.timeout);
};

selftype.prototype.adjustCount = function () {
    if (this.options.repeat === true) {
        this.count = 1;
        return;
    }
    
    if (this.count === undefined) {
        this.count = 0;
    }
    
    this.count++;
};

selftype.prototype.canGenerateNewWord = function () {
    if (this.options.repeat === true) return true;
    return (this.count || 0) < this.options.words.length;
};

selftype.prototype.darkColor = function (color) {
    if (color.indexOf('#') === -1) return false;
    
    var rgb = parseInt(color.substring(1), 16), // Strip the hash sign from the colour.
        r = (rgb >> 16) & 0xff,
        g = (rgb >>  8) & 0xff,
        b = (rgb >>  0) & 0xff,
        med = Math.floor((r + g + b) / 3);

    return med > (255 / 2);
};

selftype.prototype.default_options = function () {
    return {
        color: '#fff',
        default_speed: 5,
        highlightBg: 'transparent',
        highlightColor: 'rgba(0, 0, 0, .7)',
        lightColor: 'rgba(255, 255, 255, .9)',            
        max_speed: 10,
        min_speed: 1,
    };
};

selftype.prototype.delayHasPassed = function () {
    if (!this.timestamp) return true;
    
    var prop  = 'pause',
        route = this.text.innerHTML ? 'pauseEnd' : 'pauseStart';
    
    if (this.options[route] !== undefined) {
        prop = route;
    }
    
    return this.timestamp + this.options[prop] < Date.now();
};

selftype.prototype.dirtyHack = function () {
    this.text.innerHTML += '<br/>';
    this.text.innerHTML = this.text.innerHTML.substr(0, this.text.innerHTML.length - 4);
};

selftype.prototype.emptyTextHTML = function () {
    this.text.innerHTML = '';
};

selftype.prototype.errors = function () {
    return {
        cursor: 'The element for the cursor could not be found! If you do not want to add one, you can ignore this message. Otherwise, make sure you included in your HTML a tag with the id attribute \'st-cursor\'.',
        text: 'The element where SelfType should be initialised could not be found! Are you sure you provided a HTML tag with the id attribute \'st-text\'?',
        words: ['Incorrect parameter set for words.'],
    }
};

selftype.prototype.finishResetText = function () {
    this.emptyTextHTML();
    this.removeHighlight();
    this.setDelay(-(this.options.pause / 4));
    this.resetting_text = false;
};

selftype.prototype.getAttrsDOMNode = function () {
    var options = {},
        attrs   = this.text.attributes || [];

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
};

selftype.prototype.getDOMWords = function () {
    var result = [],
        words  = this.text.querySelectorAll('span');

    for (var i = 0; i < words.length; i++) {
        result.push(words[i].innerHTML);
        words[i].remove();
    }
    
    this.emptyTextHTML();
    return result;
};

selftype.prototype.getNextWord = function () {
    this.wordsIsValidArray({errprCheck: true});
    
    if (this.pointerPosition === undefined) {
        this.resetPointer();
    }
    
    var word = this.options.words[this.pointerPosition];
    this.movePointer(); // Move the pointer after we got the correct word.
    return word;
};

selftype.prototype.getRandomWord = function () {
    this.wordsIsValidArray({errorCheck: true});
    
    var random = Math.floor(Math.random() * this.options.words.length),
        word   = this.options.words[random];
    
    if (this.pointerPosition === random && this.options.words.length > 1) {
        word = this.getRandomWord();
    } else {
        this.movePointer(random);
    }
    
    return word;
};

selftype.prototype.loadOptions = function (options) {
    this.options = this.options();
    this.parseConfigObject(options);
    if (this.options.searchDOM === true) {
        this.parseConfigObject(this.getAttrsDOMNode());
    }
};

selftype.prototype.movePointer = function (position) {
    if (position !== undefined) {
        this.pointerPosition = position;
        return;
    }
    
    if (this.pointerPosition < (this.options.words.length - 1)) {
        this.pointerPosition += 1;
    } else {
        this.resetPointer();
    }
};

selftype.prototype.options = function () {
    return {
        appendPeriod: false,
        backspace: false,
        backspaceHighlight: true,
        color: '#efefef',
        colors: {}, // Maybe provide default colours later on?
        highlightColor: '#289BCC',
        highlightHideCursor: true,
        ignoreDiacriticalSigns: false,
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

selftype.prototype.parseConfigObject = function (options) {
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
};

selftype.prototype.parsePauseCharacter = function (char) {
    var log  = Math.round(Math.log(this.options.speed + 1) * 10),
        base = (char === '.') ? 6000 : 3200;   
    this.next_pause = Math.round(base/(log - 6));
};

selftype.prototype.parseSpeed = function (speed) {
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
                speed = 15;
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
};

selftype.prototype.parseTimeout = function () {
    this.timeout = parseInt(this.timeout);
    if (isNaN(this.timeout)) {
        this.timeout = 0;
    }
};

selftype.prototype.pauseAnimation = function () {
    window.clearInterval(this.interval);
};

selftype.prototype.playAnimation = function () {
    var self = this,
        opt  = this.options;
    
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
};

selftype.prototype.removeHighlight = function () {
    if (this.options.highlightHideCursor === true && this.cursor) {
        this.cursor.style.display = 'inline';
    }
    
    this.text.style.backgroundColor = this.oldValueBg;
    this.text.style.color = this.oldValue;
};

selftype.prototype.removeLetter = function () {
    var text = this.text.innerHTML;
    this.text.innerHTML = text.substr(0, text.length - 1);
    if (!this.text.innerHTML) {
        this.setDelay();
    }
};

selftype.prototype.resetText = function (highlight) {
    if (this.resetting_text === true) {
        return;
    }
    
    this.resetting_text = true;
    
    var self = this,
        opt  = this.options,
        timeout = 0;
    
    if (highlight === true) {
        var pause = (opt.pauseEnd !== undefined) ? opt.pauseEnd : opt.pause;
        timeout = pause / 1.5;
        this.addHighlight();
    }

    setTimeout(function () {
        self.finishResetText();
    }, timeout);
};

selftype.prototype.resetPointer = function () {
    this.pointerPosition = 0;
};

selftype.prototype.resetTimeout = function () {
	this.timeout = '';
};

selftype.prototype.returnPublicMethods = function () {
    return {
        options: this.options,
        pause: this.pauseAnimation.bind(this),
        play: this.playAnimation.bind(this),
    };
};

selftype.prototype.scrollToBottom = function () {
    this.text.parentNode.scrollTop = this.text.parentNode.scrollHeight;
};

selftype.prototype.setDelay = function (len) {
    var offset = 0;
    
    if (len !== undefined && !isNaN(len)) {
        offset = len;
    }
            
    this.timestamp = Date.now() + offset;
};

selftype.prototype.setWord = function () {
    var word    = '',
        def_opt = this.default_options();
    
    // Reset the color for the word.
    this.options.color = def_opt.color;
    
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
};

selftype.prototype.setupTimeout = function () {
    this.resetTimeout();

    if (this.next_pause !== false && this.next_pause !== undefined) {
        this.timeout = this.next_pause;
        this.next_pause = false;
    }  
};

selftype.prototype.waitPattern = function (letter) {
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
};

selftype.prototype.wordsIsValidArray = function (options) {
    var words    = options.words || this.options.words,
        is_valid = typeof words === 'object' && words !== null && words.length >= 1;
    
    if (!is_valid && options.errorCheck === true) {
        this.options.words = this.errors().words;
    }
    
    return is_valid;
};

module.exports = new selftype();