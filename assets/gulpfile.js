var gulp       = require('gulp'),
	nib        = require('nib'),
	hbsfy      = require('hbsfy'),
	gulpif     = require('gulp-if'),
	notify     = require('gulp-notify'),
	uglify     = require('gulp-uglify'),
	stylus     = require('gulp-stylus'),
	browserify = require('gulp-browserify'),
	minify     = require('gulp-minify-css'),
	livereload = require('gulp-livereload');

var getTime = require('./includes/getTime.js'),
	args    = require('yargs').argv;

var isTaskPlugin  = args.module === 'task',
	isProduction  = args.env    === 'prod',
	isMtsAdmin    = args.module === 'admin';

var dest = {
	'theme-js'  : '../js',
	'theme-css' : '../css',
	'task-js'   : '../../../plugins/lessons-tasks-plugin/js',
	'task-css'  : '../../../plugins/lessons-tasks-plugin/css'
};

var assets = {
	'mts-admin'    : './mts-admin',
	'theme-assets' : './theme-assets',
	'task-plugin'  : './wp-plugins/task-plugin'
};

isProduction && gulp.task('default', ['scripts', 'style']);
isProduction || gulp.task('default', ['scripts', 'style', 'watch']);

gulp.task('scripts', function() {
	var scriptData = getDestAndSrc('scripts');

	gulp.src(scriptData.src)
		.pipe(browserify({
			insertGlobals: true,
			transform: ['hbsfy']
		}))
		.pipe(gulpif(isProduction, uglify()))
		.pipe(gulp.dest(scriptData.dest))
		.pipe(notify({
			onLast  : true,
			title   : 'Scripts',
			message : 'Generados: '+getTime()
		}))
		.pipe(livereload());
});

gulp.task('style', function() {
	var scriptData = getDestAndSrc('style');

	gulp.src(scriptData.src)
		.pipe(stylus({
			use    : [nib()],
			errors : true,
			'include css': true
		}))
		.pipe(gulpif(isProduction, minify()))
		.pipe(gulp.dest(scriptData.dest))
		.pipe(notify({
			onLast  : true,
			title   : 'Style',
			message : 'Generados: ' + getTime()
		}))
		.pipe(livereload());
});

gulp.task('watch', function() {
	livereload.listen();

	if(isTaskPlugin) {
		gulp.watch(assets['task-plugin'] + '/**/*.js', ['scripts']);
		gulp.watch(assets['task-plugin'] + '/**/*.hbs', ['scripts']);
		gulp.watch(assets['task-plugin'] + '/**/*.styl', ['style']);
	}
	else if(isMtsAdmin) {
		gulp.watch(assets['mts-admin'] + '/**/*.js', ['scripts']);
		gulp.watch(assets['mts-admin'] + '/**/*.styl', ['style']);
	}
	else {
		gulp.watch(assets['theme-assets'] + '/**/*.js', ['scripts']);
		gulp.watch(assets['theme-assets'] + '/**/*.styl', ['style']);
	}
});

/**
 * Get Source and Dest folders for the assets
 * @param {String} module 
 * @return {Object} dest and source folders for given assets
 */
function getDestAndSrc(module) {
	var data = {
		src : '',
		dest: ''
	};

	if(isTaskPlugin) {
		if(module == 'scripts') {
			data.dest = dest['task-js'];
			data.src  = assets['task-plugin'] + '/admin-script.js';
		}
		else if(module == 'style') {
			data.src  = assets['task-plugin'] + '/style.styl';
			data.dest = dest['task-css'];
		}
	}
	else if(isMtsAdmin) {
		if(module == 'scripts') {
			data.src  = assets['mts-admin'] + '/mts-settings-script.js';
			data.dest = dest['theme-js'];
		}
		else if(module == 'style') {
			data.src  = assets['mts-admin'] + '/mts-settings-style.styl';
			data.dest = dest['theme-css'];
		}
	}
	else {
		if(module == 'scripts') {
			data.src  = assets['theme-assets'] + '/functions.js';
			data.dest = dest['theme-js'];
		}
		else if(module == 'style') {
			data.src  = assets['theme-assets'] + '/style.styl';
			data.dest = dest['theme-css'];
		}
	}

	return data;
}