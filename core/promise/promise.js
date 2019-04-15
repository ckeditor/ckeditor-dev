/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global Promise, ES6Promise */

( function() {
	'use strict';

	CKEDITOR.domReady( function() {
		if ( window.Promise ) {
			CKEDITOR.tools.promise = Promise;
		} else {
			var script = new CKEDITOR.dom.element( 'script' );

			script.setAttributes( {
				type: 'text/javascript',
				src: CKEDITOR.getUrl( 'vendor/promise.js' )
			} );

			if ( script.$.onreadystatechange !== undefined ) {
				script.$.onreadystatechange = function() {
					var readyState = script.$.readyState;

					if ( readyState === 'loaded' || readyState === 'complete' ) {
						CKEDITOR.tools.promise = ES6Promise;
					}
				};
			} else {
				script.$.onload = function() {
					CKEDITOR.tools.promise = ES6Promise;
				};
			}

			CKEDITOR.document.getBody().append( script );
		}
	} );

	/**
	 * Alias for [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
	 * object representing asynchronous operation.
	 *
	 * Uses [ES6-Promise](https://github.com/stefanpenner/es6-promise) as a polyfill.
	 * Note that the polyfill won't be loaded if a browser supports native Promise object.
	 *
	 * See [MDN Promise documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) for
	 * more details how to work with promises.
	 *
	 * @since 4.12.0
	 * @class CKEDITOR.tools.promise
	 */

	/**
	 * Creates a new instance of Promise.
	 *
	 * ```js
	 *	new CKEDITOR.tools.promise( function( resolve, reject ) {
	 *		setTimeout( function() {
	 *			var timestamp;
	 *			try {
	 *				timestamp = ( new Date() ).getTime();
	 *			} catch ( e ) {
	 *				reject( e );
	 *			}
	 *			resolve( timestamp );
	 *		}, 5000 );
	 *	} );
	 * ```
	 *
	 * @param {Function} resolver
	 * @constructor
	 */

} )();