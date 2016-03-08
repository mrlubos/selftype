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
    - `appendPeriod - boolean` - Should a period be added after the animated text? [default: false]
    - `backspace - boolean` - Should the text be removed one letter at a time? [default: false]
    - `backspaceHighlight - boolean` - Should the text be highlighted before being deleted? (only if backspace is set to false) [default: true]
    - `highlightColor - string` - Hexadecimal value of the colour to use for the highlight. [default: '#289BCC']
    - `highlightHideCursor - boolean` - Should the cursor be hidden while the text is highlighted? [default: true]
    - `keepWord - boolean` - Should we remove the text after finishing the current word? [default: false]
    - `newLine - boolean` - Should every word start on a new line? [default: true]
    - `pause - integer` - Time in ms to wait on the end of the animation cycle. [default: 1000]
    - `pauseStart - integer` - Time in ms to wait before the word is animated. If skipped, pause value is used.
    - `pauseEnd - integer` - Time in ms to wait after the word is animated. If skipped, pause value is used.
    - `repeat - boolean` - Should the entries be repeated infinite times? [default: false]
    - `randomize - boolean` - Should the words be displayed in random order? [default: false]
    - `searchDOM - boolean` - If set to true, SelfType will use all 'data-' attributes from the node with id = 'st-text' to construct the options object. In addition, SelfType will look for all nested `<span>` tags inside of the `st-text` tag, and use their contents to construct the word phrases. Turn off if unused to improve the performance. [default: true]
    - `speed - integer | string` - Speed of the animation. [default: 5]
    - `words - array` - Array of strings that will be animated on screen, at least two strings.

    You can also create the configuration object directly from HTML. Simply prepend any of the properties above with *data-* (except for the words) and insert this attribute into the HTML code on the element you chose in step 2, like so: `<span id="st-text" data-words="amazing, boring"></span>`. You can also insert words directly into the HTML instead of constructing them with Javascript, like so.
    ```html

    <i class="st-text" id="st-text">
        <span>Hi!</span>
        <span>My name is ^1000hmmm ^2000let's call me Jeff</span>
        <span>I do web development and funky stuff.</span>
    </i><i class="st-cursor" id="st-cursor">|</i>
    ```
5. SelfType also supports pauses inside of each phrase. Simply enter the magic formula in form `^<integer>` and replace the integer with the time in milliseconds to wait before moving on. If you need to escape the *^* character, insert another one right after it, like so *^^*. The algorithm looks for the first non-numerical character, so be careful not to start the phrase right after it with a number - if you need to use a number, put a space between the pattern and your phrase. 
6. The library uses an interval to animate the text. This means that you'll have to remove it to prevent memory leaks. You can do so with `selftype.pause()`.
7. The object constructed with `new SelfType()` provides you with the following methods and properties that can be used or modified at any time during the runtime.
    ```javascript

    options - complete configuration object that can be changed
    pause() - pauses the animation
    play() - resumes the animation
    ```

That's it! Enjoy SelfType!

## Demo

You can view the demo on [CodePen].

[codepen]: http://codepen.io/lmenus/full/eZOYXo/ "SelfType.js demo"
[google]: https://www.google.com/docs/about/ "Google Docs' About Page"
[slack]: http://slack.com "Slack's Homepage"