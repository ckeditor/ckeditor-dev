/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

'use strict';

// Mock the real XMLHttpRequest so the upload test may work locally.

window.XMLHttpRequest = function() {
	var basePath = bender.config.tests[ bender.testData.group ].basePath;

	return {
		open: function() {},

		send: function() {
			var total = 10259,
				loaded = 0,
				step = Math.round( total / 10 ),
				xhr = this,
				onprogress = this.onprogress,
				onload = this.onload,
				interval;

			// Wait 400 ms for every step.
			interval = setInterval( function() {
				// Add data to 'loaded' counter.
				loaded += step;
				if ( loaded > total ) {
					loaded = total;
				}

				// If file is not loaded call onprogress.
				if ( loaded < total ) {
					onprogress( { loaded: loaded } );
				}
				// If file is loaded call onload.
				else {
					clearInterval( interval );
					xhr.status = 200;
					xhr.responseText = JSON.stringify( {
						fileName: 'smallmoon (another copy)(20).JPG',
						uploaded: 1,
						url: '\/' + basePath + '_assets\/lena.jpg',
						error: {
							number: 201,
							message: ''
						}
					} );
					onload();
				}
			}, 400 );
		},

		// Abort should call onabort.
		abort: function() {
			this.onabort();
		}
	};
};