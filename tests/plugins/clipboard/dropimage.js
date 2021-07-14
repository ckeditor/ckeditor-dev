/* bender-tags: editor */
/* bender-ckeditor-plugins: clipboard */
/* bender-include: _helpers/pasting.js */
/* globals mockFileReader */

( function() {
	'use strict';

	var setHtmlWithSelection = bender.tools.setHtmlWithSelection,
		originalFileReader = window.FileReader,
		onDrop,
		onPaste;

	bender.editor = {
		config: {
			allowedContent: true,
			language: 'en'
		}
	};

	var tests = {
		setUp: function() {
			if ( !CKEDITOR.plugins.clipboard.isFileApiSupported ) {
				assert.ignore();
			}

			mockFileReader();
			CKEDITOR.plugins.clipboard.resetDragDataTransfer();

			this.editor.removeListener( 'drop', onDrop );
			this.editor.removeListener( 'paste', onPaste );
		},

		tearDown: function() {
			window.FileReader = originalFileReader;
		},

		'test drop .png image': function() {
			var dropEvt = bender.tools.mockDropEvent(),
				imageType = 'image/png',
				expected = '<p class="p">Paste image here:<img src="data:image/png;base64,fileMockBase64=" /></p>';

			FileReader.setFileMockType( imageType );
			FileReader.setReadResult( 'load' );

			setHtmlWithSelection( this.editor, '<p class="p">Paste image here:^</p>' );
			assertDropImage( {
				editor: this.editor,
				event: dropEvt,
				type: imageType,
				expectedData: expected,
				dropRange: {
					dropContainer: this.editor.editable().findOne( '.p' ).getChild( 0 ),
					dropOffset: 17
				}
			} );
		},

		'test drop .jpeg image': function() {
			var dropEvt = bender.tools.mockDropEvent(),
				imageType = 'image/jpeg',
				expected = '<p class="p">Paste image here:<img src="data:image/jpeg;base64,fileMockBase64=" /></p>';

			FileReader.setFileMockType( imageType );
			FileReader.setReadResult( 'load' );

			setHtmlWithSelection( this.editor, '<p class="p">Paste image here:^</p>' );
			assertDropImage( {
				editor: this.editor,
				event: dropEvt,
				type: imageType,
				expectedData: expected,
				dropRange: {
					dropContainer: this.editor.editable().findOne( '.p' ).getChild( 0 ),
					dropOffset: 17
				}
			} );
		},

		'test drop .gif image': function() {
			var dropEvt = bender.tools.mockDropEvent(),
				imageType = 'image/gif',
				expected = '<p class="p">Paste image here:<img src="data:image/gif;base64,fileMockBase64=" /></p>';

			FileReader.setFileMockType( imageType );
			FileReader.setReadResult( 'load' );

			setHtmlWithSelection( this.editor, '<p class="p">Paste image here:^</p>' );
			assertDropImage( {
				editor: this.editor,
				event: dropEvt,
				type: imageType,
				expectedData: expected,
				dropRange: {
					dropContainer: this.editor.editable().findOne( '.p' ).getChild( 0 ),
					dropOffset: 17
				}
			} );
		},

		'test drop unsupported image type': function() {
			var dropEvt = bender.tools.mockDropEvent(),
				imageType = 'application/pdf',
				expected = '<p class="p">Paste image here:</p>';

			FileReader.setFileMockType( imageType );
			FileReader.setReadResult( 'load' );

			setHtmlWithSelection( this.editor, '<p class="p">Paste image here:^</p>' );
			assertDropImage( {
				editor: this.editor,
				event: dropEvt,
				type: imageType,
				expectedData: expected,
				dropRange: {
					dropContainer: this.editor.editable().findOne( '.p' ).getChild( 0 ),
					dropOffset: 17
				}
			} );
		},

		// (#4750)
		'test dropping unsupported image type shows notification': function() {
			var dropEvt = bender.tools.mockDropEvent(),
				imageType = 'application/pdf',
				expectedData = '<p class="p">Paste image here:</p>',
				expectedMsg = this.editor.lang.clipboard.fileFormatNotSupportedNotification,
				expectedDuration = this.editor.config.clipboard_notificationDuration,
				notificationSpy = sinon.spy( this.editor, 'showNotification' );

			FileReader.setFileMockType( imageType );
			FileReader.setReadResult( 'load' );

			setHtmlWithSelection( this.editor, '<p class="p">Paste image here:^</p>' );
			assertDropImage(  {
				editor: this.editor,
				event: dropEvt,
				type: imageType,
				expectedData: expectedData,
				dropRange: {
					dropContainer: this.editor.editable().findOne( '.p' ).getChild( 0 ),
					dropOffset: 17
				},
				callback: function() {
					notificationSpy.restore();

					assert.areSame( 1, notificationSpy.callCount, 'There was only one notification' );
					assert.areSame( expectedMsg, notificationSpy.getCall( 0 ).args[ 0 ],
						'The notification had correct message' );
					assert.areSame( 'info', notificationSpy.getCall( 0 ).args[ 1 ],
					'The notification had correct type' );
					assert.areSame( expectedDuration, notificationSpy.getCall( 0 ).args[ 2 ],
						'The notification had correct duration' );
				}
			} );
		},

		'test abort drop': function() {
			var dropEvt = bender.tools.mockDropEvent(),
				imageType = 'image/png',
				expected = '<p class="p">Paste image here:</p>';

			FileReader.setFileMockType( imageType );
			FileReader.setReadResult( 'abort' );

			setHtmlWithSelection( this.editor, '<p class="p">Paste image here:^</p>' );
			assertDropImage( {
				editor: this.editor,
				event: dropEvt,
				type: imageType,
				expectedData: expected,
				dropRange: {
					dropContainer: this.editor.editable().findOne( '.p' ).getChild( 0 ),
					dropOffset: 17
				}
			} );
		},

		'test failed drop': function() {
			var dropEvt = bender.tools.mockDropEvent(),
				imageType = 'image/gif',
				expected = '<p class="p">Paste image here:</p>';

			FileReader.setFileMockType( imageType );
			FileReader.setReadResult( 'error' );

			setHtmlWithSelection( this.editor, '<p class="p">Paste image here:^</p>' );
			assertDropImage( {
				editor: this.editor,
				event: dropEvt,
				type: imageType,
				expectedData: expected,
				dropRange: {
					dropContainer: this.editor.editable().findOne( '.p' ).getChild( 0 ),
					dropOffset: 17
				}
			} );
		}
	};

	bender.test( tests );

	function mockDropFile( type ) {
		var nativeData = bender.tools.mockNativeDataTransfer(),
			dataTransfer = new CKEDITOR.plugins.clipboard.dataTransfer( nativeData );

		nativeData.files.push( {
			name: 'mock.file',
			type: type
		} );

		nativeData.types.push( 'Files' );
		dataTransfer.cacheData();

		return dataTransfer.$;
	}

	function assertDropImage( options ) {
		var editor = options.editor,
			evt = options.event,
			type = options.type,
			expectedData = options.expectedData,
			callback = options.callback,
			dropRangeOptions = options.dropRange,
			dropTarget = CKEDITOR.plugins.clipboard.getDropTarget( editor ),
			range = new CKEDITOR.dom.range( editor.document );

		range.setStart( dropRangeOptions.dropContainer, dropRangeOptions.dropOffset );
		evt.testRange = range;

		// Push data into clipboard and invoke paste event
		evt.$.dataTransfer = mockDropFile( type );

		onDrop = function( dropEvt ) {
			var dropRange = dropEvt.data.dropRange;

			dropRange.startContainer = dropRangeOptions.dropContainer;
			dropRange.startOffset = dropRangeOptions.dropOffset;
			dropRange.endOffset = dropRangeOptions.dropOffset;
		};

		onPaste = function() {
			resume( function() {
				assert.beautified.html( expectedData, editor.getData() );

				if ( callback ) {
					callback();
				}
			} );
		};

		editor.on( 'drop', onDrop );
		editor.on( 'paste', onPaste );

		dropTarget.fire( 'drop', evt );

		wait();
	}
} )();
