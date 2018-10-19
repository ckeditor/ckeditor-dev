﻿/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview The "placeholder" plugin.
 *
 */

'use strict';

( function() {
	CKEDITOR.plugins.add( 'placeholder', {
		requires: 'widget,dialog',
		lang: 'en,ru', // %REMOVE_LINE_CORE%
		icons: 'placeholder', // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%

		onLoad: function() {
			// Register styles for placeholder widget frame.
			CKEDITOR.addCss( '.cke_placeholder{background-color:#ff0}' );
		},

		init: function( editor ) {
			var lang = editor.lang.placeholder;

			// Register dialog.
			CKEDITOR.dialog.add( 'placeholder', this.path + 'dialogs/placeholder.js' );

			// Put ur init code here.
			var widget = editor.widgets.add( 'placeholder', {
				// Widget code.
				dialog: 'placeholder',
				pathName: lang.pathName,
				// We need to have wrapping element, otherwise there are issues in
				// add dialog.
				template: '<span class="cke_placeholder">[[]]</span>',

				downcast: function() {
					return new CKEDITOR.htmlParser.text( '[[' + this.data.name + ']]' );
				},

				init: function() {
					// Note that placeholder markup characters are stripped for the name.
					this.setData( 'name', this.element.getText().slice( 2, -2 ) );
				},

				data: function() {
					this.element.setText( '[[' + this.data.name + ']]' );
				},

				getLabel: function() {
					return this.editor.lang.widget.label.replace( /%1/, this.data.name + ' ' + this.pathName );
				}
			} );

			editor.addCommand('cpplaceholder', {
				exec: function(e) {
					var fragment = editor.getSelection().getRanges()[0].extractContents();
					var container = CKEDITOR.dom.element.createFromHtml('<span class="cke_placeholder" ' +
						'>[[Company name]]</span>', editor.document);

					fragment.appendTo(container);
					editor.insertElement(container);
					editor.widgets.initOn( container, 'placeholder' );
				}
      });
      editor.addCommand('autosequence', {
				exec: function(e) {
					var fragment = editor.getSelection().getRanges()[0].extractContents();
					var container = CKEDITOR.dom.element.createFromHtml('<span class="cke_placeholder" ' +
						'>[[auto_sequence]]</span>', editor.document);

					fragment.appendTo(container);
					editor.insertElement(container);
					editor.widgets.initOn( container, 'placeholder' );
				}
			});

			editor.ui.addButton && editor.ui.addButton( 'CreatePlaceholder', {
				label: lang.toolbar,
				command: 'placeholder',
				toolbar: 'insert,5',
				icon: 'placeholder'
			} );
			editor.ui.addButton && editor.ui.addButton( 'CreateCpPlaceholder', {
				label: lang.cpField,
				command: 'cpplaceholder',
				toolbar: 'insert,5',
				icon: 'placeholder'
      } );
      editor.ui.addButton && editor.ui.addButton( 'CreateAutoSequence', {
				label: lang.autoSequence,
				command: 'autosequence',
				toolbar: 'insert,5',
				icon: 'placeholder'
			} );
		},

		afterInit: function( editor ) {
			var placeholderReplaceRegex = /\[\[([^\[\]])+\]\]/g;

			editor.dataProcessor.dataFilter.addRules( {
				text: function( text, node ) {
					var dtd = node.parent && CKEDITOR.dtd[ node.parent.name ];

					// Skip the case when placeholder is in elements like <title> or <textarea>
					// but upcast placeholder in custom elements (no DTD).
					if ( dtd && !dtd.span )
						return;

					return text.replace( placeholderReplaceRegex, function( match ) {
						// Creating widget code.
						var widgetWrapper = null,
							innerElement = new CKEDITOR.htmlParser.element( 'span', {
								'class': 'cke_placeholder'
							} );

						// Adds placeholder identifier as innertext.
						innerElement.add( new CKEDITOR.htmlParser.text( match ) );
						widgetWrapper = editor.widgets.wrapElement( innerElement, 'placeholder' );

						// Return outerhtml of widget wrapper so it will be placed
						// as replacement.
						return widgetWrapper.getOuterHtml();
					} );
				}
			} );
		}
	} );

} )();
