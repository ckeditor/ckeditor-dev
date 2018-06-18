/* bender-tags: emoji */
/* bender-ckeditor-plugins: emoji,toolbar,stylescombo,format,clipboard,undo */

( function() {
	'use strict';


	bender.editors = {
		inline: {
			creator: 'inline',
			name: 'inline',
			startupData: '<p>foo:grinning_face:bar :not_emoji:</p>'
		},
		classic: {
			creator: 'replace',
			name: 'classic',
			startupData: '<p>foo:grinning_face:bar :not_emoji:</p>'
		},
		divarea: {
			creator: 'replace',
			name: 'divarea',
			startupData: '<p>foo:grinning_face:bar :not_emoji:</p>',
			config: {
				extraPlugins: 'divarea',
				emoji_blacklistedElements: [ 'section', 'pre', 'code' ]
			}
		}
	};

	var singleTests = {
		'test emoji doesn\'t create additional undo step on creation': function() {
			bender.editorBot.create( {
				creator: 'replace',
				startupData: '<p>foo:grinning_face:bar :not_emoji:</p>'
			}, function( bot ) {
				var editor = bot.editor;
				editor.fire( 'saveSnapshot' );
				assert.areSame( '<p>foo😀bar :not_emoji:</p>', editor.getData() );
				assert.areSame( editor.undoManager.snapshots.length, 1 );
			} );
		}
	};

	var tests = {
		setUp: function() {
			if ( CKEDITOR.env.ie && CKEDITOR.env.version < 9 ) {
				assert.ignore();
			}
		},

		'test emoji is converted during editor creation': function( editor ) {
			assert.areSame( '<p>foo😀bar :not_emoji:</p>', editor.getData() );
		},

		'test emoji is converted during setData': function( editor, bot ) {
			bot.setData( '<p>bar:slightly_smiling_face:baz :not_emoji:</p>', function() {
				assert.areSame( '<p>bar🙂baz :not_emoji:</p>', editor.getData() );
			} );
		},

		'test emoji is converted durign insertText': function( editor, bot ) {
			bot.setHtmlWithSelection( '<p>hello^world</p>' );
			editor.insertText( ':face_with_tears_of_joy:' );
			assert.areSame( '<p>hello😂world</p>', editor.getData() );
		},

		'test emoji is not converted durign insertText': function( editor, bot ) {
			bot.setHtmlWithSelection( '<p>hello^world</p>' );
			editor.insertText( ':this_should_not_be_converted:' );
			assert.areSame( '<p>hello:this_should_not_be_converted:world</p>', editor.getData() );
		},

		'test emoji is not converted in pre and code tags': function( editor, bot ) {
			bot.setData( '<p>foo:grinning_face:bar</p><pre>foo:grinning_face:bar</pre><p><code>foo:grinning_face:bar</code></p>', function() {
				assert.areSame( '<p>foo😀bar</p><pre>foo:grinning_face:bar</pre><p><code>foo:grinning_face:bar</code></p>', editor.getData() );
			} );
		},

		'test emoji with paste event': function( editor, bot ) {
			bot.setHtmlWithSelection( '<p>111^222</p>' );

			editor.once( 'afterPaste', function() {
				resume( function() {
					assert.areSame( '<p>111🦄222</p>', editor.getData() );
				} );
			} );

			bender.tools.emulatePaste( editor, ':unicorn_face:' );

			wait();
		}
	};

	tests = bender.tools.createTestsForEditors( CKEDITOR.tools.objectKeys( bender.editors ), tests );

	CKEDITOR.tools.array.forEach( CKEDITOR.tools.objectKeys( singleTests ), function( key ) {
		if ( tests[ key ] === undefined ) {
			tests[ key ] = singleTests[ key ];
		}
	} );

	bender.test( tests );
} )();
