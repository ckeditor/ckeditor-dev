/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @fileOverview Preview plugin.
 */

( function() {
	'use strict';

	var pluginName = 'preview';

	// Register a plugin named "preview".
	CKEDITOR.plugins.add( pluginName, {
		// jscs:disable maximumLineLength
		lang: 'af,ar,az,bg,bn,bs,ca,cs,cy,da,de,de-ch,el,en,en-au,en-ca,en-gb,eo,es,es-mx,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,oc,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
		// jscs:enable maximumLineLength
		icons: 'preview,preview-rtl', // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%
		init: function( editor ) {
			editor.addCommand( pluginName, {
				modes: { wysiwyg: 1 },
				canUndo: false,
				readOnly: 1,
				exec: CKEDITOR.plugins.preview.createPreview
			} );
			editor.ui.addButton && editor.ui.addButton( 'Preview', {
				label: editor.lang.preview.preview,
				command: pluginName,
				toolbar: 'document,40'
			} );
		}
	} );

	/**
	 * Namespace providing a set of helper functions for working with the editor content preview, exposed by the
	 * [Preview](https://ckeditor.com/cke4/addon/preview) plugin.
	 *
	 * @since 4.14.0
	 * @singleton
	 * @class CKEDITOR.plugins.preview
	 */
	CKEDITOR.plugins.preview = {
		/**
		 * Generates the print preview for the given editor.
		 *
		 * **Note**: This function will open a new browser window with the editor's content HTML.
		 *
		 * @param {CKEDITOR.editor} editor The editor instance.
		 * @returns {CKEDITOR.dom.window} A newly created window that contains the preview HTML.
		 */
		createPreview: function( editor ) {
			var previewHtml = createPreviewHtml( editor ),
				eventData = { dataValue: previewHtml },
				windowDimensions = getWindowDimensions(),
				// For IE we should use window.location rather than setting url in window.open (https://dev.ckeditor.com/ticket/11146).
				previewLocation = getPreviewLocation(),
				previewUrl = getPreviewUrl(),
				previewWindow,
				doc;

			// (https://dev.ckeditor.com/ticket/9907) Allow data manipulation before preview is displayed.
			// Also don't open the preview window when event cancelled.
			if ( editor.fire( 'contentPreview', eventData ) === false ) {
				return false;
			}

			// In cases where we force reloading the location or setting concrete URL to open,
			// we need a way to pass content to the opened window. We do it by hack with
			// passing it through window's parent property.
			if ( previewLocation || previewUrl ) {
				window._cke_htmlToLoad = eventData.dataValue;
			}

			previewWindow = window.open( previewUrl, null, generateWindowOptions( windowDimensions ) );

			// For IE we want to assign whole js stored in previewLocation, but in case of
			// popup blocker activation oWindow variable will be null (https://dev.ckeditor.com/ticket/11597).
			if ( previewLocation && previewWindow ) {
				previewWindow.location = previewLocation;
			}

			if ( !window._cke_htmlToLoad ) {
				doc = previewWindow.document;

				doc.open();
				doc.write( eventData.dataValue );
				doc.close();
			}

			return new CKEDITOR.dom.window( previewWindow );
		}
	};

	function createPreviewHtml( editor ) {
		var pluginPath = CKEDITOR.plugins.getPath( 'preview' ),
			config = editor.config,
			title = editor.lang.preview.preview,
			baseTag = generateBaseTag();

		if ( config.fullPage ) {
			return editor.getData().replace( /<head>/, '$&' + baseTag )
				.replace( /[^>]*(?=<\/title>)/, '$& &mdash; ' + title );
		}

		return config.docType + '<html dir="' + config.contentsLangDirection + '">' +
			'<head>' +
				baseTag +
				'<title>' + title + '</title>' +
				CKEDITOR.tools.buildStyleHtml( config.contentsCss ) +
				'<link rel="stylesheet" media="screen" href="' + pluginPath + 'styles/screen.css">' +
			'</head>' + createBodyHtml() +
				editor.getData() +
			'</body></html>';

		function generateBaseTag() {
			var template = '<base href="{HREF}">',
				origin = location.origin,
				pathname = location.pathname;

			if ( !config.baseHref && !CKEDITOR.env.gecko ) {
				return '';
			}

			if ( config.baseHref ) {
				return template.replace( '{HREF}', config.baseHref );
			}

			// As we use HTML file in Gecko, we must fix the incorrect base for
			// relative paths.
			pathname = pathname.split( '/' );
			pathname.pop();
			pathname = pathname.join( '/' );

			return template.replace( '{HREF}', origin + pathname + '/' );
		}

		function createBodyHtml() {
			var html = '<body>',
				body = editor.document && editor.document.getBody();

			if ( !body ) {
				return html;
			}

			if ( body.getAttribute( 'id' ) ) {
				html = html.replace( '>', ' id="' + body.getAttribute( 'id' ) + '">' );
			}

			if ( body.getAttribute( 'class' ) ) {
				html = html.replace( '>', ' class="' + body.getAttribute( 'class' ) + '">' );
			}

			return html;
		}
	}

	function getWindowDimensions() {
		var screen = window.screen;

		return {
			width: Math.round( screen.width * 0.8 ),
			height: Math.round( screen.height * 0.7 ),
			left: Math.round( screen.width * 0.1 )
		};
	}

	function generateWindowOptions( dimensions ) {
		return [
			'toolbar=yes',
			'location=no',
			'status=yes',
			'menubar=yes',
			'scrollbars=yes',
			'resizable=yes',
			'width=' + dimensions.width,
			'height=' + dimensions.height,
			'left=' + dimensions.left
		].join( ',' );
	}

	function getPreviewLocation() {
		// #(4444)
		if ( !CKEDITOR.env.ie && !CKEDITOR.env.gecko ) {
			return null;
		}

		return 'javascript:void( (function(){' + // jshint ignore:line
			'document.open();' +
			// Support for custom document.domain.
			// Strip comments and replace parent with window.opener in the function body.
			( '(' + CKEDITOR.tools.fixDomain + ')();' ).replace( /\/\/.*?\n/g, '' ).replace( /parent\./g, 'window.opener.' ) +
			'document.write( window.opener._cke_htmlToLoad );' +
			'document.close();' +
			'window.opener._cke_htmlToLoad = null;' +
		'})() )';
	}

	function getPreviewUrl() {
		var pluginPath = CKEDITOR.plugins.getPath( 'preview' );

		if ( !CKEDITOR.env.gecko ) {
			return '';
		}

		// With Firefox only, we need to open a special preview page, so
		// anchors will work properly on it (https://dev.ckeditor.com/ticket/9047).
		return CKEDITOR.getUrl( pluginPath + 'preview.html' );
	}
} )();

/**
 * Event fired when executing the `preview` command that allows for additional data manipulation.
 * With this event, the raw HTML content of the preview window to be displayed can be altered
 * or modified.
 *
 * **Note** This event **should** also be used to sanitize HTML to mitigate possible XSS attacks. Refer to the
 * {@glink guide/dev_best_practices#validate-preview-content Validate preview content} section of the Best Practices
 * article to learn more.
 *
 * @event contentPreview
 * @member CKEDITOR.editor
 * @param {CKEDITOR.editor} editor This editor instance.
 * @param data
 * @param {String} data.dataValue The data that will go to the preview.
 */
