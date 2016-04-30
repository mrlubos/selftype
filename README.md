# SelfType.js

JavaScript class that animates text similarly to the style that can be found at [Google Docs][google]' or [Slack][]'s homepage.

## Instructions

To use this library in your project, perform the following steps.

1. Copy the class SelfType into your project.
2. Link the HTML elements to SelfType.js. This is done simply by setting an appropriate id attribute on the HTML tags. To activate the element whose contents should be animated, add the `id="st-text"` attribute. To activate the cursor, add the `id = "st-cursor"` attribute. If not set up properly, you will get a console warning.
3. Add your own stylesheets (optional).
4. Start the animation by constructing a `var selftype = new SelfType()` class. You can optionally pass the constructor a configuration object. Below is an example of such object.
	```javascript

	{
        appendPeriod: false,
        backspace: false,
        backspaceHighlight: true,
        highlightColor: '#289BCC',
        highlightHideCursor: true,
        ignoreDiacriticalSigns: true,
        keepWord: true,
        newLine: true,
		pause: 1500,
        pauseStart: 0,
        pauseEnd: 0,
        repeat: false,
        randomize: false,
        searchDOM: true,
		speed: 'slow',
        words: ['hello', 'this', 'is', 'SelfType'], 
	}
	```
    Configuration object properties:
    - `appendText - string` - Any text that should be appended after each word. [default: empty string]
    - `backspace - boolean` - Should the text be removed one letter at a time? [default: false]
    - `backspaceHighlight - boolean` - Should the text be highlighted before being deleted? (only if backspace is set to false) [default: true]
    - `color - string` - The default text colour. [default: #212121]
    - `colors - object` - Object containing colour definitions and values. [default: empty]
    - `diacriticalSigns - array` - Which symbols should be treated as diacritical signs? This has effect only if ignoreDiacriticalSigns is set to false. [default: `[',', '.', '?', '!']`]
    - `highlightColor - string` - Hexadecimal value of the colour to use for the highlight. [default: #289BCC]
    - `highlightHideCursor - boolean` - Should the cursor be hidden while the text is highlighted? [default: true]
    - `ignoreDiacriticalSigns - boolean` - Should the animation continue at the same speed when reaching a diacritical sign in the word? [default: false]
    - `keepWords - boolean` - Should we delete the text after finishing the current word? [default: false]
    - `lightColor - string` - If we are highlighting the text and it is too dark, this colour will be used to create the contrast. [default: #efefef]
    - `newLine - boolean` - Should every word start on a new line? [default: true]
    - `pause - integer` - Time in milliseconds to wait on the end of the animation cycle. [default: 1000]
    - `pauseStart - integer` - Time in mmilliseconds to wait before the word is animated. (optional) If skipped, pause value is used.
    - `pauseEnd - integer` - Time in milliseconds to wait after the word is animated. (optional) If skipped, pause value is used.
    - `plainText - boolean` - By default, every character is wrapped into a separate HTML element. Set plainText to true to disable this behaviour. [default: false]
    - `repeat - boolean` - Should the words be repeated over? [default: false]
    - `randomize - boolean` - Should the words be displayed in random order? [default: false]
    - `randomizeAllowRepeat - boolean` - If the randomize flag is set to true and the randomly picked word matches the last printed word, should we print it anyway? [default: false]
    - `searchDOM - boolean` - If set to true, SelfType will use all 'data-' attributes from the node with id = 'st-text' to construct the options object. In addition, SelfType will process all children nodes and use their contents to construct the word phrases. Turn off if unused to improve the performance. [default: true]
    - `speed - integer | string` - Speed of the animation. [default: 5]
    - `words - array` - Array of strings that will be animated on screen.

    You can also create the configuration object directly from HTML. Simply prepend any of the properties above with *data-* (except for the words) and insert this attribute into the HTML code on the element you chose in step 2, like so: `<span id="st-text" data-words="Hello, SelfType"></span>`. If you want to optimise for SEO or need to insert longer phrases, you can also insert words directly into the HTML instead of constructing them with Javascript, like so.
    ```html

    <i class="st-text" id="st-text">
        <span>Hi!</span>
        <span>My name is Jeff</span>
        <span>I do web development and funky stuff.</span>
    </i><i class="st-cursor" id="st-cursor">|</i>
    ```
5. SelfType also supports basic commands inside of each phrase. Their pattern is `$<command>-<value>;`. Currently, these commands are available:
    - `$wait-<integer>;` - Pauses the animation temporarily within the given word. This is useful for longer phrases, for example `He looked below and saw there a ...$wait-3000; magic potion.` The time to wait should be entered in milliseconds.
    - `$color-<name>;` - You can create your own colour definitions! If you need to make your text more lively, it is very easy to do so. When creating the configuration object, set the colors property to an object whose keys are the property names to be used, such as
    ```javascript

    colors: {
        red: 'red',
        blue: '#00f',
        magicColor: '#346123',
    }
    ```
    Then you can use these variables anywhere in your text to apply the new colour to the text following the command. Consider this example: `<span>This text will have default colour,$color-red; and this one will be red.</span>`
6. The library uses an interval to animate the text. This means that you might need to remove it to prevent memory leaks, depending on your project requirements. You can do so with `selftype.pause()`.
7. The object constructed with `new SelfType()` provides you with the following methods and properties that can be used or modified at any time during the runtime.
    ```javascript

    options - complete configuration object that can be changed on the fly
    pause() - pauses the animation
    play() - resumes the animation
    ```

That's it! Enjoy SelfType!

## Demo

You can view the (older) demo on [CodePen].

[codepen]: http://codepen.io/lmenus/full/eZOYXo/ "SelfType.js demo"
[google]: https://www.google.com/docs/about/ "Google Docs' About Page"
[slack]: http://slack.com "Slack's Homepage"