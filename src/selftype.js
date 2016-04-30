'use strict';

class SelfType {
    constructor (options) {
        this.getDOMNodes(); // Sets up the node references.
        this.loadOptions(options); // Sets up the config.
        this.playAnimation();
        return this.returnPublicMethods();
    }
    
    adjustCount () {
        this.count = (this.options.repeat) ? 1 : (this.count + 1);
    }
    
    // Have we waited for long enough to move on with the animation?
    canPrintNextChar () {
        if (!this.timestamp) {
            return true;
        }
        
        var canPrint = this.timestamp + this.timeout <= Date.now();
        
        if (canPrint) {
            this.resetTimeout();
            this.timestamp = undefined; // Remove the delay.
        }
        
        return canPrint;
    }
    
    canPrintNextWord () {
        if (this.options.repeat) {
            return true;
        }
        // If we cannot repeat words, check if
        // we have not run out of words yet.
        return this.count < this.options.words.length;
    }
    
    clearTextNode () {
        this.text.innerHTML = '';
    }
    
    default_options () {
        return {
            appendText: '',
            backgroundColor: 'transparent',
            backspace: false,
            backspaceHighlight: true,
            color: '#212121',
            colors: {}, // Maybe provide default colours later on?
            diacriticalSigns: ['.', ',', '!', '?'],
            highlightColor: '#289BCC',
            highlightHideCursor: true,
            ignoreDiacriticalSigns: false,
            keepWords: true,
            lightColor: '#efefef',
            max_speed: 10,
            min_speed: 1,
            newLine: true,
            pause: 1000,
            plainText: false,
            // Optional - pauseStart,
            // Optionsl - pauseEnd,
            repeat: false,
            randomize: false,
            randomizeAllowRepeat: false,
            searchDOM: true,
            speed: 5,
            words: ['Hello! Looks like you have not set up any words. If you are not sure how to do that, check out the guide at https://github.com/lmenus/SelfType.js'],
        };
    }
    
    deleteAllText () {
        var timeout = 0,
            pause;
        
        if (this.options.backspaceHighlight) {
            pause = (this.options.pauseEnd !== undefined) ? this.options.pauseEnd : this.options.pause;
            timeout = pause / 1.5;
            this.highlightText();
        }
        
        this.pause(timeout);
        setTimeout(function () {
            this.clearTextNode();
            this.resetStyles();
            this.pause();
        }, timeout);
    }
    
    deleteLastChar () {
        var text;
        
        if (this.options.plainText) {
            text = this.text.innerHTML;
            this.text.innerHTML = text.substr(0, text.length - 1);
        }
        else {
            this.text.removeChild(this.text.lastChild);
        }
        
        if (!this.text.innerHTML) {
            this.pause();
        }
    }
    
    dirtyHack () {
        this.text.innerHTML += '<br/>';
        this.text.innerHTML = this.text.innerHTML.substr(0, this.text.innerHTML.length - 4);
    }
    
    errors () {
        return {
            cursor: 'The optional cursor element could not be found! If you wish to include one, insert into your HTML a tag with the attribute id="st-cursor".',
            text: 'The parent node for text could not be found! Are you sure you included an HTML tag with the attribute id="st-text"?',
            words: ['Incorrect parameter set for words.'],
        }
    }
    
    extendOptions(options) {
        if (typeof options !== 'object') {
            return;
        }
        
        for (var prop in options) {
            if (prop === 'speed') {
                this.options[prop] = this.parseSpeed(options[prop]);
            }
            else if (prop === 'words' && this.hasEnoughWords(options[prop])) {
                this.options[prop] = options[prop];
            }
            else {
                this.options[prop] = options[prop];
            }
        }
    }
    
    // Construct the options configuration object
    // from the attributes set on the text parent
    // node.
    getAttrsDOMNode () {
        var options = {},
            tag     = 'data-',
            attrs   = this.text.attributes,
            words   = this.getDOMWords();

        for (var i = 0; i < attrs.length; i++) {
            // Attempt to convert any numbers into integer,
            // otherwise assign the string.
            if (attrs[i].nodeName.indexOf(tag) !== -1) {
                var value  = attrs[i].nodeValue,
                    parsed = parseInt(value),
                    prop   = attrs[i].nodeName.substr(tag.length);
                
                options[prop] = (isNaN(parsed)) ? value : parsed;
            }
        }
        
        if (words.length) {
            options.words = words;
        }
        
        return options;
    }
    
    // Set up the nodes for cursor and text.
    getDOMNodes () {
        var cursor = document.getElementById('st-cursor'),
            text   = document.getElementById('st-text'),
            errors = this.errors();
        
        if (text === null) {
            throw new ReferenceError(errors.text);
        }
        
        this.text = text;
        
        if (cursor === null) {
            console.warn(errors.cursor);
            return;
        }
        
        this.cursor = cursor;
    }
    
    // Get the words array from the children nodes
    // of the text parent node.
    getDOMWords () {
        var words    = [],
            children = this.text.childNodes,
            child;

        for (var i = 0; i < children.length; i++) {
            child = children[i];
            
            if (child.innerHTML) {
                child = child.innerHTML;
            }
            else if (child.textContent) {
                child = child.textContent;

                if (child.match(/\n/g)) {
                    child = this.getWordsFromTextContent(child);
                }
            }
            
            if (typeof child === 'string') {
                child = child.replace(/[\n]/g, '');
            }
            
            if (child) {
                if (typeof child === 'string') {
                    words.push(child);
                }
                else if (typeof child === 'object' && child.length) {
                    child.forEach(function (word) {
                        words.push(word);
                    });
                }
            }
        }
        
        this.clearTextNode();
        return words;
    }
    
    getNextWord () {
        var def_opt = this.default_options(),
            word    = '';
        
        // Reset the color for the word.
        this.options.color = def_opt.color;
        
        if (this.canPrintNextWord()) {
            word = (this.options.randomize) ? this.getRandomWord() : this.getNextWordInArray();
        }

        if (word) {
            this.adjustCount();
            
            word += this.options.appendText;

            // Add a newline, but only if we have already written
            // at least one word, to prevent the initial newline.
            if (this.options.newLine && this.text.innerHTML) {
                this.text.innerHTML += '<br/>';
            }
        }
        
        this.word = word;
    }
    
    getNextWordInArray () {
        var word = this.options.words[this.pointerPosition];
        this.movePointer();
        return word;
    }
    
    getRandomWord () {
        var random = Math.floor(Math.random() * this.options.words.length),
            word   = this.options.words[random];
        
        // If we have selected the same word as last time.
        if (this.pointerPosition === random) {
            // If the user does not permit repeating the same word,
            // generate a new one. The second part is there to
            // prevent getting stuck in an infinite loop.
            if (!this.options.randomizeAllowRepeat && this.options.words.length > 1) {
                word = this.getRandomWord();
            }
        }
        else {
            this.movePointer(random);
        }
        
        return word;
    }
    
    getTimeout () {
        if (this.timeoutOffset > 0) {
            this.timeoutOffset--;
            return 0;
        }
        return this.timeout;
    }

    getWordsFromTextContent (string) {
        var regex = new RegExp(/\n/),
            match = string.match(regex),
            words = [],
            word;

        while (string && match !== null) {
            word = '';
            
            if (string[0] === '\n') {
                string = string.substr(1);
            }

            while (string && (string[0] !== '\n' || !word)) {
                if ((string[0] !== '\n' && string[0] !== ' ') || (string[0] === ' ' && word)) {
                    word += string[0];
                }
                string = string.substr(1);
            }
            
            if (word) {
                words.push(word);
            }

            match = string.match(regex);
        }

        return words;
    }
    
    // Words must be an array with at least one entry.
    hasEnoughWords (words) {
        return words && typeof words === 'object' && words !== null && words.length >= 1;
    }
    
    highlightText () {
        var children;
        
        if (this.options.highlightHideCursor && this.cursor) {
            this.cursor.style.display = 'none';
        }
        
        this.text.style.backgroundColor = this.options.highlightColor;
        if (this.isDarkColor(this.options.highlightColor)) {
            if (this.options.plainText) {
                this.text.style.color = this.options.lightColor;
            }
            else {
                children = this.text.childNodes;
                for (var i = 0; i < children.length; i++) {
                    children[i].style.color = this.options.lightColor;
                }
            }
        }
    }
    
    isDarkColor (color) {
        if (color.indexOf('#') === -1) {
            return false;
        }
        
        var rgb = parseInt(color.substring(1), 16), // Strip the hash sign from the colour.
            r = (rgb >> 16) & 0xff,
            g = (rgb >>  8) & 0xff,
            b = (rgb >>  0) & 0xff,
            med = Math.floor((r + g + b) / 3);

        return med > 255 / 2;
    }
    
    isInArray (needle, haystack) {
        for (var i = 0; i < haystack.length; i++) {
            if (haystack[i] === needle) {
                return haystack[i];
            }
        }
        return false;
    }
    
    isInWord (haystack, offset) {
        offset = offset || 0;
        for (var i = 0; i < haystack.length; i++) {
            if (this.word.substr(offset, haystack[i].length) === haystack[i]) {
                return haystack[i];
            }
        }
        return false;
    }
    
    isValidEntity () {
        return this.isInWord(['&nbsp;']);
    }
  
    // Create the options configuration object.
    loadOptions (options) {
        options = options || {};
        this.options = this.default_options();
        this.extendOptions(options);
        
        if (this.options.searchDOM) {
            this.extendOptions(this.getAttrsDOMNode());
        }
        
        // Private variables.
        this.count = 0;
        this.pointerPosition = 0;
        this.timeout = 0;
        this.timeoutOffset = 0;
        this.timestamp = 0;
    }
    
    movePointer (position) {
        if (position !== undefined) {
            this.pointerPosition = position;
            return;
        }
        
        // Move the pointer as long as there is next character.
        if (this.pointerPosition < this.options.words.length - 1) {
            this.pointerPosition++;
        }
        else {
            this.resetPointer();
        }
    }
    
    parseCommand () {
        var commands = ['color-', 'wait-'],
            command  = this.isInWord(commands, 1), // Offset by 1 = the $ sign.
            full_command = command,
            result = false,
            self = this,
            semicolon,
            value;
        
        function parseSingleCommand (command) {
            command = command.substr(0, command.length - 1);
            
            if (self.word.substr(0, command.length + 2) === '$' + command + '-') {
                full_command = '$' + command + '-';
                semicolon    = self.word.indexOf(';');

                if (semicolon !== -1) {
                    value = self.word.substr(0, semicolon + 1);
                    value = value.substr(full_command.length);
                    value = value.substr(0, value.length - 1); // Remove the semicolon.
                    
                    if (command === 'wait') {
                        if (!isNaN(parseInt(value))) {
                            self.pause(parseInt(value));
                        }
                    }
                    else if (command === 'color') {
                        if (self.options.colors[value]) {
                            self.options.color = self.options.colors[value];
                        }
                    }
                    
                    full_command = full_command + value + ';';
                    self.word = self.word.substr(full_command.length - 1);
                    result = true;
                    
                    command = self.isInWord(commands, 2);
                    full_command = command;
                    
                    self.word = self.word.substr(1);
                    
                    if (command) {
                        parseSingleCommand(command);
                    }
                }
            }
        }
        
        if (command) {
            parseSingleCommand(command);
            self.word = ';' + self.word;
        }
        
        return result;
    }
    
    parseSpeed (speed) {
        if (typeof speed === 'number') {
            if (speed > this.options.max_speed) {
                speed = this.options.max_speed;
            }
            
            if (speed < this.options.min_speed) {
                speed = this.options.min_speed;
            }
        }
        else if (typeof speed === 'string') {
            switch (speed) {
                case 'slow':
                    speed = 1;
                    break;

                case 'fast':
                    speed = 7;
                    break;

                // Tiny special case.
                case 'sonic':
                    speed = 15;
                    break;

                case 'normal':
                default:
                    speed = this.options.speed;
                    break;
            }
        }
        
        return speed;
    }
    
    // Temporarily disables the animation.
    pause (time, offset) {
        var timeout = 0,
            prop = 'pause',
            route;
        
        offset = offset || 0;
        
        if (time !== undefined && !isNaN(time)) {
            timeout = time;
        }
        else {
            route = (!this.text.innerHTML) ? 'pauseStart' : 'pauseEnd';
            if (this.options[route] !== undefined) {
                prop = route;
            }
            timeout = this.options[prop];
        }
                
        this.timeout = timeout;
        this.timeoutOffset = offset;
        this.timestamp = Date.now() + timeout;
    }
    
    // Disables animation completely.
    pauseAnimation () {
        window.clearInterval(this.interval);
    }
    
    pauseDiacriticalSign (char) {
        var log  = Math.round(Math.log(this.options.speed + 1) * 10),
            base = (char === '.') ? 6000 : 3200; // Full stop waits longer.
        this.pause(Math.round(base/(log - 6)), 1);
    }
    
    playAnimation () {
        var self = this;
        
        // Cancel the previous interval.
        if (this.interval) {
            this.pauseAnimation();
        }
        
        this.interval = setInterval(function () {
            if (!self.canPrintNextChar()) {
                return;
            }

            // We are animating a word being written.
            if (self.word) {
                self.printNextChar();
            }
            // We are at the end of the word - remove it?
            else if (self.text.innerHTML && !self.options.keepWords) {
                self.options.backspace ? self.deleteLastChar() : self.deleteAllText();
            }
            // Get next word.
            else {
                self.getNextWord();
            }
        }, Math.round(250 / this.options.speed));
    }
    
    printNextChar () {
        var self = this,
            char = this.word.substr(0, 1);
        
        // HTML entities.
        if (char === '&') {
            expression = isValidEntity();
            if (expression) {
                char = expression;
                this.word = this.word.substr(expression.length - 1);
            }
        }
        
        if (char === '$' && this.parseCommand()) {
            char = '';
        }
        
        if (!this.options.ignoreDiacriticalSigns && this.isInArray(char, this.options.diacriticalSigns)) {
            this.pauseDiacriticalSign(char); // Pause printing the next character.
        }
        
        this.dirtyHack();
        
        setTimeout(function () {
            if (self.options.plainText) {
                self.text.innerHTML += char;
            }
            else {
                self.text.appendChild(self.wrapChar(char));
            }

            self.word = self.word.substr(1); // Remove the character.
            
            self.scrollToBottom(); // Move the scroll if the text is getting too big.
            self.resetTimeout(); // Reset any timeout.
            
            if (!self.word) {
                self.pause();
            }
        }, this.getTimeout());
    }
    
    // Counts on which character of the word we currently are.
    resetPointer () {
        this.pointerPosition = 0;
    }
    
    resetStyles () {
        if (this.options.highlightHideCursor && this.cursor) {
            this.cursor.style.display = '';
        }
        
        this.text.style.backgroundColor = this.default_options().backgroundColor;
        this.text.style.color = this.default_options().color;
    }
    
    resetTimeout () {
        this.timeout = 0;
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
    
    // Wrap the element in <i> tag and apply styles.
    wrapChar (char) {
        var node = document.createElement('i');
        node.style.color = this.options.color;
        node.innerHTML = char;
        return node;
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