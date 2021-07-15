@bender-tags: 4.16.1, bug, link, 4728
@bender-ui: collapsed
@bender-ckeditor-plugins: link, toolbar, wysiwygarea, basicstyles, sourcearea, clipboard, enterkey, link, list, liststyle, tabletools, tableselection, undo, format, elementspath

Play with the anchors.

Things to check:

* creating anchors,
* creating anchors with styled words,
* creating anchors with heavily styled content ( p>em>strong> etc.),
* creating anchors with different paragraph format,
* creating anchors with multiline words,
* modifying existing anchors.

Notes:
* Testing multiline creating anchors should create anchors for each line.
* Editing a few words with an existing anchor should replace it with one for the entire range.
