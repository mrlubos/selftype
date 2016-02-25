# SelfType.js

JavaScript class that animates text similarly to the style that can be found at [Slack][]'s homepage.

## Instructions

To use this library in your project, perform the following steps.

1. Copy the class SelfType into your project.
2. Tag the element whose contents should be animated with the `id="st-text"` attribute.
3. Add your own stylesheets (optional).
4. Start the animation by constructing a `var st = new SelfType()` class. You can optionally pass the constructor two parameters - *options* and *words* to display. Below are the examples of parameters.
	```javascript
	var options = {
		pause: milliseconds,
		speed: 1 to 10, 'slow', 'normal', 'fast'
	}
	```

	```javascript
	var words = ['word1', 'word2', 'word3'];
	```
5. The library uses `setInterval()` to animate the text. This means that you'll have to remove it to prevent memory leaks. You can do so with `st.pause()`.

That's it! Enjoy SelfType!

[slack]: http://slack.com "Slack's Homepage"