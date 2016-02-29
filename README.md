# SelfType.js

JavaScript class that animates text similarly to the style that can be found at [Google Docs][google]' or [Slack][]'s homepage.

## Instructions

To use this library in your project, perform the following steps.

1. Copy the class SelfType into your project.
2. Tag the element whose contents should be animated with the `id="st-text"` attribute.
3. Add your own stylesheets (optional).
4. Start the animation by constructing a `var selftype = new SelfType()` class. You can optionally pass the constructor a configuration object. You can specify the following properties.
	```javascript

	{
        appendPeriod: boolean, // Should a period be added after the animated text? [default: false]
        backspace: boolean, // Should the text be removed one letter at a time? [default: true]
        backspaceHighlight: boolean, // Should the text be highlighted before being deleted? (only if backspace is set to false) [default: true]
        highlightColor: string, // Hexadecimal value of the colour to use for the highlight. [default: '#289BCC']
		pause: integer, // Time in ms to wait on the end of the animation cycle. [default: 1500]
        pauseStart: integer, // Time in ms to wait before the word is animated. If skipped, pause value is used.
        pauseEnd: integer, // Time in ms to wait after the word is animated. If skipped, pause value is used.
        searchDOM: boolean, // If set to true, will use all 'data-' attributes from the node with id = 'st-text' to construct the options object. [default: true]
		speed: 1 to 10, 'slow', 'normal', 'fast', // Speed of the animation. [default: 3]
        words: array, // Array of strings that will be animated on screen, min. length = 2
	}
	```
    You can also create the configuration object directly from HTML. Simply prepend any of the properties above with *data-* and insert this attribute into the HTML code on the element you chose in step 2, like so: `<span id="st-text" data-words="amazing, boring"></span>`
5. The library uses an interval to animate the text. This means that you'll have to remove it to prevent memory leaks. You can do so with `selftype.pause()`.
6. The object constructed with `new SelfType()` provides you with the following methods that can be used or modified at any time during the runtime.
    ```javascript

    selftype.options - complete configuration object that can be changed at any time
    selftype.pause() - pause the animation
    selftype.play() - play the animation
    ```

That's it! Enjoy SelfType!

## Demo

You can view the demo on [CodePen].

[codepen]: http://codepen.io/lmenus/pen/eZOYXo "SelfType.js demo"
[google]: https://www.google.com/docs/about/ "Google Docs' About Page"
[slack]: http://slack.com "Slack's Homepage"