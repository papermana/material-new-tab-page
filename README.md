# Material New Tab Page

A New Tab Page replacement for Google Chrome, incorporating Material design. Includes cards showing installed Chrome Apps, frequently visited sites and weather. Also has search with support for bookmarks.

Only necessary permissions are required on installation, others are requested as the user turns features on.

## Technical

This version is made using React, Flux, Immutable and the [material-ui](material-ui.com) library. This stack works well overall, however one major problem is start-up performance, which is especially crucial for this specific kind of extension.

### Potential performance fixes:
* When `UglifyJS2` starts supporting minification of pure ES6 code, `babel-preset-es2015` transforms can be removed, since they're only necessary to get Uglify working.
* As well, using untranspiled versions of some of the libraries might be a feasible decision then.
* ~~Prerender some parts of the UI to give the user the subjective feeling of a snappier response.~~ Done using a background page.
* ~~Make some `require`s asynchronous.~~ Done for the main bundle but maybe could be used in other parts, e.g. only loading dialogs on demand.
* ?

### Geolocation
Due to [a bug in chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=278555) it is currently impossible to request `geolocation` as an optional permission. This might get solved later.

### TODO
* Start-up performance
* Better scrolling
* Replace the big icon in WeatherCard with some nicer drawing
* Refactor code, add more comments
* Drag-and-drop in the applications card
