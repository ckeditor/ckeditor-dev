/* jshint node: true, browser: false, es3: false */

'use strict';

module.exports = function( grunt ) {
	var cssBanner = [
		'/*',
		'Copyright (c) 2003-' + new Date().getFullYear() + ', CKSource - Frederico Knabben. All rights reserved.',
		'For licensing, see LICENSE.html or http://cksource.com/ckeditor/license',
		'*/'
	].join( '\n' );

	grunt.config.merge( {
		less: {
			basicsample: {
				files: [
					{
						src: 'samples/less/sample.less',
						dest: 'samples/css/sample.css'
					}
				],

				options: {
					paths: [ 'samples/' ],

					banner: cssBanner,
					sourceMap: true,
					sourceMapFilename: 'samples/css/sample.css.map',
					sourceMapURL: 'sample.css.map',
					sourceMapRootpath: '../../'
				}
			},

			toolbarconfigurator: {
				files: [
					{
						src: 'samples/toolbarconfigurator/less/toolbarmodifier.less',
						dest: 'samples/toolbarconfigurator/css/toolbarmodifier.css'
					}
				],

				options: {
					paths: [ 'samples/toolbarconfigurator' ],

					banner: cssBanner,
					sourceMap: true,
					sourceMapFilename: 'samples/toolbarconfigurator/css/toolbarmodifier.css.map',
					sourceMapURL: 'toolbarmodifier.css.map',
					sourceMapRootpath: '../../'
				}
			}
		},

		watch: {
			basicsample: {
				files: '<%= less.basicsample.options.paths[ 0 ] + "/**/*.less" %>',
				tasks: [ 'less:basicsample' ],
				options: {
					nospawn: true
				}
			},

			toolbarconfigurator: {
				files: '<%= less.toolbarconfigurator.options.paths[ 0 ] + "/**/*.less" %>',
				tasks: [ 'less:toolbarconfigurator' ],
				options: {
					nospawn: true
				}
			}
		},

		jsduck: {
			toolbarconfigurator: {
				src: [
					'samples/toolbarconfigurator/js'
				],
				dest: 'samples/toolbarconfigurator/docs'
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-less' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-jsduck' );
};
