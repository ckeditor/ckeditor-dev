/* bender-tags: balloontoolbar */
/* bender-ckeditor-plugins: balloontoolbar */

( function() {
	'use strict';

	bender.editor = {};

	CKEDITOR.skinName = 'kama,/apps/ckeditor/skins/kama/';

	var spy = sinon.spy( CKEDITOR.dom.document.prototype, 'appendStyleSheet' );

	bender.test( {
		_should: {
			ignore: {
				// Our release version is built with moono-lisa skin inlined, thus we can't
				// test it against other skin. We don't have straight way to recognise editor's
				// built version, such trick must be used (#1251).
				'test loading CSS with path': CKEDITOR.revision !== '%REV%'
			}
		},

		'test loading CSS with path': function() {
			assert.areSame( 'kama,/apps/ckeditor/skins/kama/', CKEDITOR.skinName, 'Config skinName should be with path' );
			sinon.assert.calledWith( spy, document.location.origin + '/apps/ckeditor/plugins/balloontoolbar/skins/kama/balloontoolbar.css' );
		}
	} );
} )();
