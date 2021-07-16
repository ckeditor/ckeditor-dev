@bender-tags: 4.16.2, 4444, bug
@bender-ui: collapsed
@bender-ckeditor-plugins: wysiwygarea, print, font, colorbutton, format, clipboard, pagebreak, toolbar, floatingspace, link, image2

## Steps
1. Wait for the editor to load.
1. Click preview button.
1. Open browser console in the new tab.

## Expected result
New browser tab with preview are opened correctly with no error in browser console.
## Unexpected result
Only a new tab with no content preview opens and an error occurs in the browser console: `Permission denied to access property "_cke_htmlToLoad" on cross-origin object`.

## Notes
You can add more content into editable or just copy existing to check if the printout still opens e.g. add 50 pages and click print.
