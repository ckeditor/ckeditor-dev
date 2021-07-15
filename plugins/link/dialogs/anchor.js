/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.dialog.add( 'anchor', function( editor ) {
	// Function called in onShow to load selected element.
	var loadElements = function( element ) {
			var attributeValue = element.data( 'cke-saved-name' );
			this.setValueOf( 'info', 'txtName', attributeValue || '' );
		};

	function createFakeAnchor( editor, attributes ) {
		return editor.createFakeElement( editor.document.createElement( 'a', {
			attributes: attributes
		} ), 'cke_anchor', 'anchor' );
	}


	function getSelectedAnchor( selection ) {
		var range = selection.getRanges()[ 0 ],
			element = selection.getSelectedElement();

		// In case of table cell selection, we want to shrink selection from td to a element.
		range.shrink( CKEDITOR.SHRINK_ELEMENT );
		element = range.getEnclosedNode();

		// If selection is inside text, get its parent element (#3437).
		if ( element && element.type === CKEDITOR.NODE_TEXT ) {
			element = element.getParent();
		}

		// If anchor exists and has any styles find the closest parent <a> tag. (#3863)
		if ( element && !element.is( 'a' ) ) {
			element = element.getAscendant( 'a' ) || element;
		}

		if ( element && element.type === CKEDITOR.NODE_ELEMENT &&
			( element.data( 'cke-real-element-type' ) === 'anchor' || element.is( 'a' ) ) ) {
			return element;
		}
	}

	function removeAnchorsWithinRange( range ) {
		var newRange = range.clone();
		newRange.enlarge( CKEDITOR.ENLARGE_ELEMENT );

		var walker = new CKEDITOR.dom.walker( newRange ),
			element = newRange.collapsed ? newRange.startContainer : walker.next(),
			bookmark = range.createBookmark();

		while ( element ) {
			if ( element.type === CKEDITOR.NODE_ELEMENT && element.getAttribute( 'data-cke-saved-name' ) ) {
				element.remove( true );
				// Reset the walker and start from beginning, to check if element has more nested anchors.
				// Without it, next element is null, so there might be space to more nested elements.
				walker.reset();
			}
			element = walker.next();
		}
		range.moveToBookmark( bookmark );
	}

	return {
		title: editor.lang.link.anchor.title,
		minWidth: 300,
		minHeight: 60,
		getModel: function( editor ) {
			return getSelectedAnchor( editor.getSelection() ) || null;
		},
		onOk: function() {
			var name = CKEDITOR.tools.trim( this.getValueOf( 'info', 'txtName' ) ),
				attributes = {
					id: name,
					name: name,
					'data-cke-saved-name': name
				},
				selectedElement = this.getModel( editor );

			if ( selectedElement ) {
				if ( selectedElement.data( 'cke-realelement' ) ) {
					var newFake = createFakeAnchor( editor, attributes );
					newFake.replace( selectedElement );

					// Selecting fake element for IE. (https://dev.ckeditor.com/ticket/11377)
					if ( CKEDITOR.env.ie ) {
						editor.getSelection().selectElement( newFake );
					}
				} else {
					selectedElement.setAttributes( attributes );
				}
			} else {
				var sel = editor.getSelection(),
					range = sel && sel.getRanges()[ 0 ];

				// Empty anchor
				if ( range.collapsed ) {
					var anchor = createFakeAnchor( editor, attributes );
					range.insertNode( anchor );
				} else {
					if ( CKEDITOR.env.ie && CKEDITOR.env.version < 9 )
						attributes[ 'class' ] = 'cke_anchor';

					// (#4728)
					removeAnchorsWithinRange( range );
					// Apply style.
					var style = new CKEDITOR.style( { element: 'a', attributes: attributes } );
					style.type = CKEDITOR.STYLE_INLINE;
					style.applyToRange( range );
				}
			}
		},

		onShow: function() {
			var sel = editor.getSelection(),
				fullySelected = this.getModel( editor ),
				fakeSelected = fullySelected && fullySelected.data( 'cke-realelement' ),
				linkElement = fakeSelected ?
					CKEDITOR.plugins.link.tryRestoreFakeAnchor( editor, fullySelected ) :
					CKEDITOR.plugins.link.getSelectedLink( editor );

			if ( linkElement ) {
				loadElements.call( this, linkElement );
				!fakeSelected && sel.selectElement( linkElement );
			}

			this.getContentElement( 'info', 'txtName' ).focus();
		},
		contents: [ {
			id: 'info',
			label: editor.lang.link.anchor.title,
			accessKey: 'I',
			elements: [ {
				type: 'text',
				id: 'txtName',
				label: editor.lang.link.anchor.name,
				required: true,
				validate: function() {
					if ( !this.getValue() ) {
						alert( editor.lang.link.anchor.errorName ); // jshint ignore:line
						return false;
					}
					return true;
				}
			} ]
		} ]
	};
} );
