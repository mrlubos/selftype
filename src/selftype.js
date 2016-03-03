'use strict';

class SelfType {
    constructor (options) {
        this.getDOMNodes();
        this.loadOptions(options);
        this.setWord();
        
        return this.returnPublicMethods();
    }
    
    addHighlight () {
        var opt = this.default_options();
        this.oldValue = this.text.style.color || opt.highlightColor;
        this.oldValueBg = this.text.style.backgroundColor || opt.highlightBg;
        
        if (this.options.highlightHideCursor === true) {
            this.hideCursor();
        }
        
        this.text.style.backgroundColor = this.options.highlightColor;
        if (this.darkColor(this.options.highlightColor)) {
            this.text.style.color = opt.lightColor;
        }
    }
  
    addLetter () {
        var _that = this;
        
        if (this.timeout === undefined || this.timeout === '') {
            this.timeout = '';
            var letter = this.word.substr(0, 1);

            if (letter === '^') {
                if (this.word.substr(1, 1) != '^') {
                    if (!this.escape_next) {
                        this.word = this.word.substr(1);
                        letter = this.word.substr(0, 1);

                        while (letter.match(/[0-9]/)) {
                            this.timeout += letter;
                            this.word = this.word.substr(1);
                            letter = this.word.substr(0, 1);
                        }
                    }

                    this.escape_next = false;
                } else { // Escaped.
                    this.escape_next = true;
                }
            }

            this.timeout = parseInt(this.timeout);
            if (isNaN(this.timeout)) this.timeout = 0;

            setTimeout(function () {
                _that.timeout = '';
                _that.text.innerText += _that.word.substr(0, 1);
                _that.word = _that.word.substr(1);
                if (!_that.word) {
                    _that.text.parentNode.scrollTop = _that.text.parentNode.scrollHeight;
                    _that.setDelay();
                }
            }, this.timeout);
        }
    }
    
    darkColor (color) {
        if (color.indexOf('#') === -1) return false;
        
        var rgb = parseInt(color.substring(1), 16); // strip the hash sign from the colour
        var r = (rgb >> 16) & 0xff;  // extract red
        var g = (rgb >>  8) & 0xff;  // extract green
        var b = (rgb >>  0) & 0xff;  // extract blue
        
        var med = Math.floor((r + g + b) / 3);

        if (med > 255 / 2) {
            return true;
        }
        
        return false;
    }
    
    default_options () {
        return {
            highlightBg: 'transparent',
            highlightColor: 'rgba(0, 0, 0, .7)',
            lightColor: 'rgba(255, 255, 255, .9)',            
            max_speed: 10,
            min_speed: 1,
        };
    }
  
    delayHasPassed () {
        if (!this.timestamp) return true;
        
        if (!this.text.innerText) { // pauseStart
            if (this.options.pauseStart !== undefined) {
                return this.timestamp + this.options.pauseStart < Date.now();
            }
        } else { // pauseEnd
            if (this.options.pauseEnd !== undefined) {
                return this.timestamp + this.options.pauseEnd < Date.now();
            }
        }
        
        return this.timestamp + this.options.pause < Date.now();
    }
    
    errors () {
        return {
            cursor: 'The element for the cursor could not be found! If you do not want to add one, you can ignore this message. Otherwise, make sure you included in your HTML a tag with the id attribute \'st-cursor\'.',
            text: 'The element where SelfType should be initialised could not be found! Are you sure you provided a HTML tag with the id attribute \'st-text\'?',
            words: ['Incorrect parameter set for words.'],
        }
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
    
    getCount () {
        return this.count || 0;
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
            result.push(words[i].innerText);
            words[i].remove();
        }
        return result;
    }
    
    getNextWord () {
        if (this.pointerPosition === undefined) {
            this.resetPointer();
        }
        
        var word = this.options.words[this.pointerPosition];
        this.movePointer();
        return word;
    }
    
    getRandomWord () {
        var w = this.options.words;
        if (typeof w !== 'object' || w === null || w.length === 0) {
            this.options.words = this.errors().words;
        }
        
        var random = Math.floor(Math.random() * this.options.words.length);
        var word = this.options.words[random];
        
        if (this.pointerPosition === random && this.options.words.length > 1) {
            word = this.getRandomWord();
        } else {
            this.movePointer(random);
        }
        
        return word;
    }
    
    hideCursor () {
        if (!this.cursor) return;
        this.cursor.style.display = 'none';
    }
    
    increaseCount () {
        if (this.count === undefined) {
            this.count = 0;
        }
        
        this.count++;
    }
  
    loadOptions (options) {
        this.options = this.options();
        this.parseConfigObject(options);
        if (this.options.searchDOM === true) {
            this.parseDOMConfig();
        }
    }
    
    movePointer (position) {
        if (position !== undefined) {
            this.pointerPosition = position;
        } else {
            if (this.pointerPosition < this.options.words.length - 1) {
                this.pointerPosition += 1;
            } else {
                this.resetPointer();
            }
        }
    }
  
    options () {
        return {
            appendPeriod: false,
            backspace: true,
            backspaceHighlight: true,
            highlightColor: '#289BCC',
            highlightHideCursor: true,
            keepWord: false,
            newLine: false,
            pause: 1500,
            repeat: false,
            randomize: false,
            searchDOM: true,
            speed: 3,
            words: ['awesome', 'amazing', 'the best language ever', 'pain', 'blood, sweat and tears', 'torture', 'legen^3000dary'],
        };
    };
    
    parseConfigObject(options) {
        if (typeof options !== 'object') return;
        
        for (var prop in options) {
            if (prop === 'speed') {
                options[prop] = this.parseSpeed(options[prop]);
            }

            if (prop === 'words') {
                options[prop] = (typeof options[prop] === 'object' && options[prop] !== null && options[prop].length >= 2) ? options[prop] : this.options.words;
            }

            this.options[prop] = options[prop];
        }
    }
    
    parseDOMConfig () {
        this.parseConfigObject(this.getAttrsDOMNode());
    }
    
    parseSpeed (speed) {
        if (typeof speed === 'string') {
            switch (speed) {
                case 'slow':
                    speed = 1;
                    break;

                case 'fast':
                    speed = 5;
                    break;

                case 'sonic':
                    speed = 10;
                    break;

                case 'medium':
                case 'normal':
                default:
                    speed = 3;
                    break;
            }
        } else if (typeof speed === 'number') {
            var opt = this.default_options();
            
            if (speed > opt.max_speed) {
                speed = opt.max_speed;
            }
            
            if (speed < opt.min_speed) {
                speed = opt.min_speed;
            }
        } else {
            speed = 3;
        }
        
        return speed;
    }
    
    pauseAnimation () {
        window.clearInterval(this.interval);
    }
    
    playAnimation () {
        var _that = this;
        var speed = Math.round(250/_that.options.speed);
        
        if (this.interval) {
            this.pauseAnimation();
        }
        
        if (!this.text) return;
        
        _that.interval = setInterval(function () {
            if (!_that.timestamp || (_that.timestamp && _that.delayHasPassed()))
            {
                _that.removeDelay();

                if (_that.word) {
                    _that.addLetter();
                } else if (_that.text.innerText && _that.options.keepWord === false) {
                    if (_that.options.backspace === true) {
                        _that.removeLetter();
                    } else {
                        _that.resetAnimText(_that.options.backspaceHighlight);
                    }
                } else {
                    _that.setWord();
                }
            }
        }, speed);
    }
  
    removeDelay () {
        this.timestamp = undefined;
    }
    
    removeHighlight () {
        if (this.options.highlightHideCursor === true) {
            this.showCursor();
        }
        
        this.text.style.backgroundColor = this.oldValueBg;
        this.text.style.color = this.oldValue;
    }
  
    removeLetter () {
        var text = this.text.innerText;
        this.text.innerText = text.substr(0, text.length - 1);
        if (!this.text.innerText) {
            this.setDelay();
        }
    }
    
    resetAnimation () {
        this.pauseAnimation();
        this.playAnimation();
    }
    
    resetAnimText (highlight) {
        if (this.resetting_text === true) {
            return;
        } else {
            this.resetting_text = true;
        }
        
        var _that = this;
        var pause = (this.options.pauseEnd !== undefined) ? this.options.pauseEnd : this.options.pause;
        var timeout = (highlight === true) ? (pause / 1.5) : 0;
            
        if (highlight === true) {
            this.addHighlight();
        }

        setTimeout(function () {
            _that.text.innerText = '';
            _that.removeHighlight();
            _that.setDelay(-(_that.options.pause / 4));
            _that.resetting_text = false;
        }, timeout);
    }
    
    resetCount () {
        this.count = 1;
    }
    
    resetPointer () {
        this.pointerPosition = 0;
    }
    
    returnPublicMethods () {
        return {
            options: this.options,
            //pause: this.pauseAnimation,
            //play: this.playAnimation,
        };
    }
  
    setDelay (len) {
        var offset = 0;
        
        if (len !== undefined && typeof len === 'number') {
            offset = len;
        }
                
        this.timestamp = Date.now() + offset;
    }
    
    setWord () {
        var set_word = false;
        
        if (this.options.repeat || (!this.options.repeat && this.getCount() < this.options.words.length)) {
            this.word = (this.options.randomize === true) ? this.getRandomWord() : this.getNextWord();
            set_word = true;
        }
        
        if (set_word) {
            if (this.options.appendPeriod === true) {
                this.word += '.';
            }

            if (this.options.newLine === true) {
                this.word += '\n';
            }

            if (this.options.repeat === false) {
                this.increaseCount();
            } else {
                this.resetCount();
            }
            
            this.playAnimation();
        }
    }
    
    showCursor () {
        if (!this.cursor) return;
        this.cursor.style.display = 'inline';
    }
}

var selftype;

function addListeners () {
    var input = document.getElementsByTagName('input');
    for (var i = 0; i < input.length; i++) {
        input[i].addEventListener('click', function (e) {
            toggleStyle(e.srcElement.defaultValue, e.srcElement.checked);
        });
    }
}

function toggleStyle (style, checked) {
    if (selftype === undefined) return;
    
    var radios = ['default', 'noBack', 'noHigh'];
    var key;
    
    if (radios.indexOf(style) > -1) {
        if (style === 'default') {
            selftype.options.backspace = true;
            return;
        }

        selftype.options.backspace = false;

        if (style === 'noBack') {
            selftype.options.backspaceHighlight = true;
        } else if (style === 'noHigh') {
            selftype.options.backspaceHighlight = false;
        }
    } else {
        switch (style) {
            case 'keepWord':
                key = 'keepWord';
                break;
            case 'newLine':
                key = 'newLine';
                break;
            case 'random':
                key = 'randomize';
                break;
            case 'repeat':
                key = 'repeat';
                break;
        }
        
        selftype.options[key] = checked;
    }
}

window.onload = function () {
    addListeners();
    selftype = new SelfType({
        backspace: false,
        keepWord: true,
        newLine: true,
    });
}

window.onbeforeunload = function () {
    if (selftype !== undefined) {
        selftype.pause();
    }
};