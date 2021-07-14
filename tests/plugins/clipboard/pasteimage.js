/* bender-tags: editor */
/* bender-ckeditor-plugins: clipboard */
/* bender-include: _helpers/pasting.js */
/* globals mockFileReader */

( function() {
	'use strict';

	var originalFileReader = window.FileReader;

	bender.editor = {
		config: {
			allowedContent: true,
			language: 'en'
		}
	};

	bender.test( {
		setUp: function() {
			// (#4612).
			if ( !CKEDITOR.plugins.clipboard.isCustomDataTypesSupported ) {
				assert.ignore();
			}

			mockFileReader();
			this.editor.focus();
		},

		tearDown: function() {
			window.FileReader = originalFileReader;
		},

		'test paste .png from clipboard': function() {
			FileReader.setFileMockType( 'image/png' );
			FileReader.setReadResult( 'load' );

			bender.tools.selection.setWithHtml( this.editor, '<p>Paste image here:{}</p>' );
			this.assertPaste( {
				type: 'image/png',
				expected: '<p>Paste image here:<img data-cke-saved-src="data:image/png;base64,fileMockBase64=" src="data:image/png;base64,fileMockBase64=" />^@</p>'
			} );
		},

		'test paste .jpeg from clipboard': function() {
			FileReader.setFileMockType( 'image/jpeg' );
			FileReader.setReadResult( 'load' );

			bender.tools.selection.setWithHtml( this.editor, '<p>Paste image here:{}</p>' );
			this.assertPaste( {
				type: 'image/jpeg',
				expected: '<p>Paste image here:<img data-cke-saved-src="data:image/jpeg;base64,fileMockBase64=" src="data:image/jpeg;base64,fileMockBase64=" />^@</p>'
			} );
		},

		'test paste .gif from clipboard': function() {
			FileReader.setFileMockType( 'image/gif' );
			FileReader.setReadResult( 'load' );

			bender.tools.selection.setWithHtml( this.editor, '<p>Paste image here:{}</p>' );
			this.assertPaste( {
				type: 'image/gif',
				expected: '<p>Paste image here:<img data-cke-saved-src="data:image/gif;base64,fileMockBase64=" src="data:image/gif;base64,fileMockBase64=" />^@</p>'
			} );
		},

		'test unsupported file type': function() {
			FileReader.setFileMockType( 'application/pdf' );
			FileReader.setReadResult( 'load' );

			bender.tools.selection.setWithHtml( this.editor, '<p>Paste image here:{}</p>' );
			this.assertPaste( {
				type: 'application/pdf',
				expected: '<p>Paste image here:^@</p>'
			} );
		},

		// (#4750)
		'test pasting unsupported file type shows notification': function() {
			var editor = this.editor,
				expectedMsg = editor.lang.clipboard.fileFormatNotSupportedNotification,
				expectedDuration = editor.config.clipboard_notificationDuration,
				spy = sinon.spy( editor, 'showNotification' );

			FileReader.setFileMockType( 'application/pdf' );
			FileReader.setReadResult( 'load' );

			bender.tools.selection.setWithHtml( this.editor, '<p>Paste image here:{}</p>' );
			this.assertPaste( {
				type: 'application/pdf',
				expected: '<p>Paste image here:^@</p>',
				callback: function() {
					spy.restore();

					assert.areSame( 1, spy.callCount, 'There was only one notification' );
					assert.areSame( expectedMsg, spy.getCall( 0 ).args[ 0 ],
						'The notification had correct message' );
					assert.areSame( 'info', spy.getCall( 0 ).args[ 1 ],
						'The notification had correct type' );
					assert.areSame( expectedDuration, spy.getCall( 0 ).args[ 2 ],
						'The notification had correct duration' );
				}
			} );
		},

		'test aborted paste': function() {
			FileReader.setFileMockType( 'image/png' );
			FileReader.setReadResult( 'abort' );

			bender.tools.selection.setWithHtml( this.editor, '<p>Paste image here:{}</p>' );
			this.assertPaste( {
				type: 'image/png',
				expected: '<p>Paste image here:^@</p>'
			} );
		},

		'test failed paste': function() {
			FileReader.setFileMockType( 'image/png' );
			FileReader.setReadResult( 'error' );

			bender.tools.selection.setWithHtml( this.editor, '<p>Paste image here:{}</p>' );
			this.assertPaste( {
				type: 'image/png',
				expected: '<p>Paste image here:^@</p>'
			} );
		},

		// (#3585, #3625)
		'test pasting image alongside other content': function() {
			FileReader.setFileMockType( 'image/png' );
			FileReader.setReadResult( 'load' );

			bender.tools.selection.setWithHtml( this.editor, '<p>{}</p>' );
			this.assertPaste( {
				type: 'image/png',
				expected: '<p><strong>whateva^</strong>@</p><p></p>',
				additionalData: [
					{ type: 'text/html', data: '<strong>whateva</strong>' }
				]
			} );
		},

		assertPaste: function( options ) {
			var type = options.type,
				expected = options.expected,
				additionalData = options.additionalData,
				callback = options.callback;

			this.editor.once( 'paste', function() {
				resume( function() {
					assert.isInnerHtmlMatching( expected, bender.tools.selection.getWithHtml( this.editor ), {
						noTempElements: true,
						fixStyles: true,
						compareSelection: true,
						normalizeSelection: true
					} );

					if ( callback ) {
						callback();
					}
				} );
			}, this, null, 9999 );

			mockPasteFile( this.editor, type, additionalData );

			wait();
		}
	} );

	// Mock paste file from clipboard.
	function mockPasteFile( editor, type, additionalData ) {
		var nativeData = bender.tools.mockNativeDataTransfer(),
			dataTransfer = new CKEDITOR.plugins.clipboard.dataTransfer( nativeData );

		nativeData.files.push( {
			name: 'mock.file',
			type: type
		} );
		nativeData.types.push( 'Files' );

		if ( additionalData ) {
			CKEDITOR.tools.array.forEach( additionalData, function( data ) {
				nativeData.setData( data.type, data.data );
			} );
		}

		dataTransfer.cacheData();

		editor.fire( 'paste', {
			dataTransfer: dataTransfer,
			dataValue: '',
			method: 'paste',
			type: 'auto'
		} );
	}
} )();
