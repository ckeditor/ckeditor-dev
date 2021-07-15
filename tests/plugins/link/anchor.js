/* bender-tags: editor */
/* bender-ckeditor-plugins: link,toolbar,basicstyles */

( function() {
	'use strict';

	bender.editor = {};

	bender.test( {
		tearDown: function() {
			var dialog = CKEDITOR.dialog.getCurrent();

			if ( dialog ) {
				dialog.hide();
			}
		},

		// #476
		'test editing anchor': function() {
			var editor = this.editor,
				bot = this.editorBot;

			bot.dialog( 'anchor', function( dialog ) {
				dialog.setValueOf( 'info', 'txtName', 'foo' );
				dialog.getButton( 'ok' ).click();

				var range = new CKEDITOR.dom.range( editor.document );
				range.selectNodeContents( editor.editable().findOne( '[data-cke-real-element-type=anchor]' ) );
				range.select();

				bot.dialog( 'anchor', function( dialog ) {
					dialog.setValueOf( 'info', 'txtName', 'bar' );
					dialog.getButton( 'ok' ).click();
					assert.isInnerHtmlMatching( '<p><a id="bar" name="bar"></a></p>', this.editor.getData() );
				} );
			} );
		},

		// #501
		'test double-click on anchor is opening anchor dialog': function() {
			var editor = this.editor,
				bot = this.editorBot;

			bot.setData( '<p><a name="foo" id="foo"></a></p>', function() {

				var range = new CKEDITOR.dom.range( editor.document );
				range.selectNodeContents( editor.editable().findOne( '[data-cke-real-element-type=anchor]' ) );
				range.select();

				editor.once( 'dialogShow', function( evt ) {
					resume( function() {
						assert.areSame( evt.data._.name, 'anchor', 'Anchor dialog has been opened.' );
					} );
				} );

				editor.fire( 'doubleclick', {
					element: editor.editable().findOne( '[data-cke-real-element-type=anchor]' )
				} );

				wait();
			} );
		},

		// (#3437)
		'test getModel when selection is inside anchor\'s text': function() {
			var editor = this.editor,
				bot = this.editorBot;

			bot.setData( '<p><a id="test" name="test">Foobar</a></p>', function() {
				var range = editor.createRange(),
					anchor = editor.editable().findOne( '#test' ),
					textNode = anchor.getChild( 0 );

				range.selectNodeContents( textNode );
				range.select();

				bot.dialog( 'anchor', function( dialog ) {
					assert.areSame( 'test', dialog.getValueOf( 'info', 'txtName' ) );
					assert.areSame( anchor, dialog.getModel( editor ) );
				} );
			} );
		},

		// (#3863)
		'test prevent duplicated anchors after editing a word with custom style': function() {
			var editor = this.editor,
				bot = this.editorBot,
				template = '[<p><a id="test" name="test"><strong>text</strong></a></p>]',
				expected = '<p><a id="duplicate-test" name="duplicate-test"><strong>text</strong></a></p>';

			bot.setHtmlWithSelection( template );
			bot.dialog( 'anchor', function( dialog ) {
				dialog.setValueOf( 'info', 'txtName', 'duplicate-test' );
				dialog.getButton( 'ok' ).click();

				assert.beautified.html( expected, editor.getData() );
			} );
		},

		// (#4728)
		'test prevent duplicated anchors after editing multiple words with styles': function() {
			var editor = this.editor,
				bot = this.editorBot,
				template = '[<p>Simple <a id="multiTest" name="multiTest" data-cke-saved-name="multiTest"><strong>text</strong></a></p>]',
				expected = '<p><a id="multiTestResult" name="multiTestResult">Simple <strong>text</strong></a></p>';

			bot.setHtmlWithSelection( template );
			bot.dialog( 'anchor', function( dialog ) {
				dialog.setValueOf( 'info', 'txtName', 'multiTestResult' );
				dialog.getButton( 'ok' ).click();

				assert.beautified.html( expected, editor.getData() );
			} );
		},

		// (#4728)
		'test prevent duplicated anchors in the selection: strong > em': function() {
			var editor = this.editor,
				bot = this.editorBot,
				template = '<p>[<strong>Simple<em>Test</em></strong>]</p>',
				expected = '<p><a id="nested" name="nested"><strong>Simple<em>Test</em></strong></a></p>';

			bot.setHtmlWithSelection( template );
			bot.dialog( 'anchor', function( dialog ) {
				dialog.setValueOf( 'info', 'txtName', 'nested' );
				dialog.getButton( 'ok' ).click();

				assert.beautified.html( expected, editor.getData() );
			} );
		},

		// (#4728)
		'test prevent duplicated anchors in the selection: strong > em > span': function() {
			var editor = this.editor,
				bot = this.editorBot,
				template = '<p>[<strong><em><span>test</span></em></strong>]</p>',
				expected = '<p><a id="emphasize" name="emphasize"><strong><em><span>test</span></em></strong></a></p>';

			bot.setHtmlWithSelection( template );
			bot.dialog( 'anchor', function( dialog ) {
				dialog.setValueOf( 'info', 'txtName', 'emphasize' );
				dialog.getButton( 'ok' ).click();

				assert.beautified.html( expected, editor.getData() );
			} );
		},

		// (#4728)
		'test prevent duplicated anchors in the selection of multiline with styled words': function() {
			var editor = this.editor,
				bot = this.editorBot,
				template = '[<p><em><strong>Simple</strong></em></p><p>test</p>]',
				expected = '<p><a id="multiLine" name="multiLine"><em><strong>Simple</strong></em></a></p><p><a id="multiLine" name="multiLine">test</a></p>';

			bot.setHtmlWithSelection( template );
			bot.dialog( 'anchor', function( dialog ) {
				dialog.setValueOf( 'info', 'txtName', 'multiLine' );
				dialog.getButton( 'ok' ).click();

				assert.beautified.html( expected, editor.getData() );
			} );
		},

		// (#4728)
		'test prevent duplicated anchors in the unordered list with styled word': function() {
			var editor = this.editor,
				bot = this.editorBot,
				template = '[<ul><li><s>test</s></li></ul>]',
				expected = '<ul><li><a id="unorderedList" name="unorderedList"><s>test</s></a></li></ul>';

			bot.setHtmlWithSelection( template );
			bot.dialog( 'anchor', function( dialog ) {
				dialog.setValueOf( 'info', 'txtName', 'unorderedList' );
				dialog.getButton( 'ok' ).click();

				assert.beautified.html( expected, editor.getData() );
			} );
		},

		// (#4728)
		'test prevent duplicated anchors in the ordered list with styled word': function() {
			var editor = this.editor,
				bot = this.editorBot,
				template = '[<ol><li><s>test</s></li></ol>]',
				expected = '<ol><li><a id="orderedList" name="orderedList"><s>test</s></a></li></ol>';

			bot.setHtmlWithSelection( template );
			bot.dialog( 'anchor', function( dialog ) {
				dialog.setValueOf( 'info', 'txtName', 'orderedList' );
				dialog.getButton( 'ok' ).click();

				assert.beautified.html( expected, editor.getData() );
			} );
		}
	} );
}() );
