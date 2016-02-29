'use strict';

class SelfType {
    constructor (options) {
        this.getTextDOMNode();
        this.loadOptions(options);
        this.setWord();
        
        return this.returnPublicMethods();
    }
    
    addHighlight () {
        var opt = this.default_options();
        this.oldValue = this.text.style.color || opt.highlightColor;
        this.oldValueBg = this.text.style.backgroundColor || opt.highlightBg;
        
        this.text.style.backgroundColor = this.options.highlightColor;
        if (this.darkColor(this.options.highlightColor)) {
            this.text.style.color = opt.lightColor;
        }
    }
  
    addLetter () {
        this.text.innerText += this.word.substr(0, 1);
        this.word = this.word.substr(1);
        if (!this.word) {
            this.setDelay();
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
            words: ['Incorrect parameter set for words.'],
        }
    }
    
    getAttrsDOMNode () {
        var options = {};
        
        var attrs = this.text.attributes;
        for (var i = 0; i < attrs.length; i++) {
            if (attrs[i].nodeName.indexOf('data-') > -1) {
                var val = (attrs[i].nodeName === 'data-words') ? this.parseDOMWords(attrs[i].nodeValue) : attrs[i].nodeValue;
                var parsed = parseInt(val);
                
                options[attrs[i].nodeName.substr(5)] = (isNaN(parsed)) ? val : parsed;
            }
        }
        
        return options;
    }
    
    getRandomWord () {
        var w = this.options.words;
        if (typeof w !== 'object' || w === null || w.length === 0) {
            this.options.words = this.errors().words;
        }
        
        var random = Math.floor(Math.random() * this.options.words.length);
        var word = this.options.words[random];
        if (word === this.last_word && this.options.words.length > 1) {
            word = this.getRandomWord();
        }
        this.last_word = word;
        return word;
    }
  
    getTextDOMNode () {
        var text = document.getElementById('st-text');
        if (text !== null) {
            this.text = text;
        }
    }
  
    loadOptions (options) {
        this.options = this.options();
        this.parseConfigObject(options);
        if (this.options.searchDOM === true) {
            this.parseDOMConfig();
        }
    }
  
    options () {
        return {
            appendPeriod: false,
            backspace: true,
            backspaceHighlight: true,
            highlightColor: '#289BCC',
            pause: 1500,
            searchDOM: true,
            speed: 3,
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
                options[prop] = (typeof options[prop] === 'object' && options[prop] !== null && options[prop].length >= 2) ? options[prop] : this.options.words;
            }

            this.options[prop] = options[prop];
        }
    }
    
    parseDOMConfig () {
        this.parseConfigObject(this.getAttrsDOMNode());
    }
    
    parseDOMWords (string) {
        var array = string.split(',');
        var i = 0;
        array.forEach(function (value) {
            array[i] = array[i].trim();
            i++;
        })
        return array;
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
        
        _that.interval = setInterval(function () {
            if (!_that.timestamp || (_that.timestamp && _that.delayHasPassed()))
            {
                _that.removeDelay();

                if (_that.word) {
                    _that.addLetter();
                } else if (_that.text.innerText) {
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
        var timeout = (highlight === true) ? (this.options.pause / 1.5) : 0;
            
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
    
    returnPublicMethods () {
        return {
            options: this.options,
            pause: this.pauseAnimation,
            play: this.playAnimation,
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
        this.word = this.getRandomWord();
        
        if (this.options.appendPeriod === true) {
            this.word += '.';
        }
        
        this.resetAnimation();
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