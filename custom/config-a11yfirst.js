CKEDITOR.replace('editor', {
  a11yfirst: {
    organization: 'University of Illinois Library',
    a11yPolicyLink: 'http://guides.library.illinois.edu/usersdisabilities/',
    a11yPolicyLabel: 'Information for Users with Disabilities',
  },
  headings: 'h1:h4',
  oneLevel1: true,
  height: 480,
  skin: 'a11yfirst',
  startupFocus: true,
  toolbar: [
    { name: 'heading',        items: [ 'Heading' ] },
    { name: 'list',           items: [ 'NumberedList', 'BulletedList', 'Indent', 'Outdent' ] },
    { name: 'link',           items: [ 'Link', 'Unlink', 'Anchor' ] },
    { name: 'blockformat',    items: [ 'BlockFormat' ] },
    { name: 'blockquote',     items: [ 'Blockquote', 'ShowBlocks' ] },
    { name: 'paragraph',      items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight'] },
    { name: 'misc1',          items: [ 'Image', 'Table' ] },
    { name: 'a11ychecker',    items: [ 'A11ychecker' ] },
    { name: 'a11yfirsthelp',  items: [ 'A11yFirstHelp'] },
    '/',
    { name: 'undoredo',       items: [ 'Undo', 'Redo'] },
    { name: 'clipboard',      items: [ 'Cut', 'Copy', 'Paste', 'PasteFromWord' ] },
    { name: 'search',         items: [ 'Find', 'Replace' ] },
    { name: 'basicstyles',    items: [ 'Bold', 'Italic'] },
    { name: 'removeformat',   items: [ 'RemoveFormat' ] },
    { name: 'inlinestyle',    items: [ 'InlineStyle' ] },
    { name: 'misc2',          items: [ 'Language', 'SpecialChar' ] },
    { name: 'source',         items: [ 'Source' ] }
  ],
  extraPlugins: 'a11ychecker,a11yfirsthelp,a11yformat,a11yheading,a11ystylescombo',
  language_list: [
    'ar:Arabic:rtl',
    'zh:Chinese',
    'cs:Czech',
    'da:Danish',
    'nl:Dutch',
    'fi:Finnish',
    'fr:French',
    'gd:Gaelic',
    'de:German',
    'el:Greek',
    'he:Hebrew:rtl',
    'hi:Hindi',
    'hu:Hungarian',
    'id:Indonesian',
    'it:Italian',
    'ja:Japanese',
    'ko:Korean',
    'la:Latin',
    'no:Norwegian',
    'fa:Persian:rtl',
    'pl:Polish',
    'pt:Portuguese',
    'ru:Russian',
    'es:Spanish',
    'sv:Swedish',
    'th:Thai',
    'tr:Turkish',
    'vi:Vietnamese',
    'yi:Yiddish'
  ]
} );

CKEDITOR.stylesSet.add ( 'default', [
  { name: 'Strong',           element: 'strong', overrides: 'b' },
  { name: 'Emphasis',         element: 'em' , overrides: 'i' },
  { name: 'Marker',           element: 'span', attributes: { 'class': 'marker' } },
  { name: 'Inline quotation', element: 'q' },
  { name: 'Cited work',       element: 'cite' },
  { name: 'Computer code',    element: 'code' },
  { name: 'Subscript',        element: 'sub' },
  { name: 'Superscript',      element: 'sup' },
  { name: 'Deleted Text',     element: 'del' },
  { name: 'Inserted Text',    element: 'ins' },
  { name: 'Strikethrough',    element: 'strike' },
  { name: 'Underline',        element: 'u' }
] );
