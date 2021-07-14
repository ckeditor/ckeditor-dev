@bender-tags: 4.17.0, feature, 4750
@bender-ui: collapsed
@bender-ckeditor-plugins: wysiwygarea, sourcearea, clipboard, undo, image, floatingspace

1. Drag and drop into the editor file in format unsupported by editor, e.g. SVG or WebP image, PDF file, Word document etc.

	**Expected** Notifaction with "This file format is not supported." message is displayed.

	**Unexpected** Nothing happens.

2. Repeat steps for each editor.
