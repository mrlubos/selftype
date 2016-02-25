'use strict';

class SelfType {
    constructor (config, words) {
        this.loadSettings(config, words);
        this.exposePublicMethods();
        this.getTextDOMNode();
        this.setWord();
    }
  
    addLetter () {
        this.anim_text.innerText += this.word.substr(0, 1);
        this.word = this.word.substr(1);
        if (!this.word) {
            this.setDelay();
        }
    }
    
    default_options () {
        return {
            max_speed: 10,
            min_speed: 1,
        };
    }
    
    default_words () {
        return [
            'awesome', 'amazing', 'the best language ever', 
            'pain', 'blood, sweat and tears', 'torture'
        ];
    }
  
    delayHasPassed () {
        if (!this.timestamp) return true;
        return this.timestamp + this.options.pause < Date.now();
    }
    
    exposePublicMethods () {
        this.pause = this.pauseAnimation;
        this.play  = this.playAnimation;
        this.reset = this.resetAnimation;
    }
    
    getRandomWord () {
        var random = Math.floor(Math.random() * this.words.length);
        var word = this.words[random];
        if (word === this.last_word) {
            word = this.getRandomWord();
        }
        this.last_word = word;
        return word;
    }
  
    getTextDOMNode () {
        var text = document.getElementById('st-text');
        if (text !== null) {
            this.anim_text = text;
        }
    }
  
    loadConfig (config) {
        this.options = this.options();
        
        if (typeof config === 'object') {
            for (var prop in config) {
                if (prop === 'speed') {
                    config[prop] = this.parseSpeed(config[prop]);
                }
                this.options[prop] = config[prop];
            }
        }
    }
    
    loadSettings (config, words) {
        // Checks if the parameters are not swapped and 
        // puts them in the correct order.
        if ((typeof config === 'object' && (config === null || config[0] !== undefined)) || (typeof words === 'object' && Object.keys(words).length)) {
            var save = config;
            config = words;
            words = save;
        }
        
        this.loadConfig(config);
        this.loadWords(words);
    }
    
    loadWords (words) {
        this.words = (typeof words === 'object' && words !== null && words.length) ? words : this.default_words();
    }
  
    options () {
        return {
            pause: 1500,
            speed: 3,
        };
    };
    
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
            } else if (speed < opt.min_speed) {
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
        var _ = this;
        var speed = Math.round(250/_.options.speed);
        
        _.interval = setInterval(function () {
            if (!_.timestamp || (_.timestamp && _.delayHasPassed()))
            {
                _.removeDelay();

                if (_.word) {
                    _.addLetter();
                } else if (_.anim_text.innerText) {
                    _.removeLetter();
                } else {
                    _.setWord();
                }
            }
        }, speed);
    }
  
    removeDelay () {
        this.timestamp = undefined;
    }
  
    removeLetter () {
        var text = this.anim_text.innerText;
        this.anim_text.innerText = text.substr(0, text.length - 1);
        if (!this.anim_text.innerText) {
            this.setDelay();
        }
    }
    
    resetAnimation () {
        this.pauseAnimation();
        this.playAnimation();
    }
  
    setDelay () {
        this.timestamp = Date.now();
    }
    
    setWord () {
        this.word = this.getRandomWord() + '.';
        this.resetAnimation();
    }
}

var st;

window.onload = function () {
    st = new SelfType();
}

window.onbeforeunload = function () {
    if (st !== undefined) {
        st.pause();
    }
};