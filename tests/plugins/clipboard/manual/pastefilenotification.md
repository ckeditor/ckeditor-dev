@bender-tags: 4.17.0, feature, 4750
@bender-ui: collapsed
@bender-ckeditor-plugins: wysiwygarea, clipboard, undo, image, floatingspace

1. Paste into the editor file in format unsupported by editor, e.g. SVG or WebP image, PDF file, Word document etc.

	**Expected:** Notifaction with "This file format is not supported." message is displayed.

	**Unexpected:** Nothing happens.

	**Note:** Depending on OS, browsers can lack support for pasting files other than images. In such a case, test with images only. Please also note that copying a file (e.g. via context menu) is a different thing than copying a _content_ of this file. These two operations are the same only for images.
2. Repeat steps for each editor.
