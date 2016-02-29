# SelfType.js

JavaScript class that animates text similarly to the style that can be found at [Slack][]'s homepage.

## Instructions

To use this library in your project, perform the following steps.

1. Copy the class SelfType into your project.
2. Tag the element whose contents should be animated with the `id="st-text"` attribute.
3. Add your own stylesheets (optional).
4. Start the animation by constructing a `var selftype = new SelfType()` class. You can optionally pass the constructor a configuration object. You can specify the following properties.
	```javascript

	{
        backspace: true // {boolean} should the text be removed one letter at a time?
        backspace_highlight: true // {boolean} should the text be highlighted before being deleted? (only if backspace is set to false)
        highlightColor: '#4991d7' // {string} hexadecimal value of the colour to use for the highlight
		pause: 1000 // {integer} time in milliseconds on the end of animation,
		speed: 1 to 10, 'slow', 'normal', 'fast' // speed of the animation
        words: ['word1', 'word2'] // {array} array of strings that will be animated on screen, min. length = 1
	}
	```
5. The library uses an interval to animate the text. This means that you'll have to remove it to prevent memory leaks. You can do so with `selftype.pause()`.

That's it! Enjoy SelfType!

## Demo

You can view the demo on [CodePen].

[codepen]: http://codepen.io/lmenus/pen/eZOYXo "SelfType.js demo"
[slack]: http://slack.com "Slack's Homepage"