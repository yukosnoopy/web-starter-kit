'use strict';

// Plugin load
var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var minimist    = require('minimist');
var browserSync = require('browser-sync');
var del         = require('del');
var pagespeed   = require('psi');
var reload      = browserSync.reload;

// Source path
var path = {
  html      : ['src/pug/**/*.pug', '!src/pug/**/_*.pug'],
  htmlWatch : 'src/pug/**',
  css       : 'src/sass/**/*.scss',
  cssLib    : 'src/sass/lib/*.css',
  js        : 'src/js/*.js',
  jsLib     : 'src/js/lib/*.js',
  img       : 'src/img/**',
  htmlDest  : 'dest/',
  cssDest   : 'dest/css',
  jsDest    : 'dest/js',
  imgDest   : 'dest/img'
};

var envSettings = {
  string : 'env',
  default: {
    env: process.env.NODE_ENV || 'development'
  }
}

// Environment
var options    = minimist(process.argv.slice(2), envSettings);
var production = options.env === 'production';
var config     = {
  envProduction: production
}

// Pug compile
function html() {
  return gulp.src(path.html)
    .pipe($.plumber({errorHandler: $.notify.onError('<%= error.message %>')}))
    .pipe($.pug({
      pretty: false
    }))
    .pipe(gulp.dest(path.htmlDest))
    .pipe($.size({title: 'pug'}))
    .pipe(reload({stream: true}));
}

// Sass compile
function css() {
  return gulp.src(path.css)
    .pipe($.plumber({errorHandler: $.notify.onError('<%= error.message %>')}))
    .pipe($.if(!config.envProduction, $.sourcemaps.init()))
    .pipe($.sass({outputStyle: 'expanded'}))
    .pipe($.pleeease({
      pseudoElements: false,
      opacity       : false,
      autoprefixer  : ["last 2 versions", "ie >= 11", "iOS >= 9", "Android >= 4.4"],
      minifier      : false,
      mqpacker      : true
    }))
    .pipe($.if(config.envProduction, $.cssmin()))
    .pipe($.size({title: 'sass'}))
    .pipe($.concat('common.css'))
    .pipe($.if(!config.envProduction, $.sourcemaps.write('../maps')))
    .pipe(gulp.dest(path.cssDest))
    .pipe(reload({stream: true}));
}

// CSS Plugin concat
function cssLib() {
  return gulp.src(path.cssLib)
    .pipe($.plumber())
    .pipe($.concat('lib.css'))
    .pipe(gulp.dest(path.cssDest))
    .pipe(reload({stream: true}))
    .pipe(reload({stream: true}));
}

// JavaScript optimaize
function js() {
  return gulp.src(path.js)
    .pipe($.plumber({errorHandler: $.notify.onError('<%= error.message %>')}))
    .pipe($.concat('common.js'))
    .pipe($.uglify())
    .pipe($.size({title: 'js'}))
    .pipe(gulp.dest(path.jsDest))
    .pipe(reload({stream: true}));
}

// JavaScript plugin concat
function jsLib() {
  return gulp.src(path.jsLib)
    .pipe($.concat('lib.js'))
    .pipe($.uglify())
    .pipe(gulp.dest(path.jsDest))
    .pipe(reload({stream: true}));
}

// Image optimize
function img() {
  return gulp.src(path.img, { since: gulp.lastRun(img) })
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(path.imgDest))
    .pipe($.size({title: 'img'}))
    .pipe(reload({stream: true}));
}

// //  Copy files
// function copy() {
//   gulp.src([
//     'src/*',
//   ], {
//     dot: true
//   }).pipe(gulp.dest('dist'))
//     .pipe($.size({title: 'copy'}))
// }


// dest folder delete
function clean(cb) {
  return del('dest', cb);
}

// Google page speed
function pageSpeed(cb) {
  pagespeed('example.com', {
    strategy: 'mobile'
  }, cb);
}

// Local server
function bs(cb) {
  return browserSync.init(null, {
    server: {
      baseDir: 'dest'
    },
    ghostMode: false,
    notify: false
  }, cb);
}

// Watch
gulp.task('watch', function (done) {
  gulp.watch(path.htmlWatch, gulp.series(html));
  gulp.watch(path.css, gulp.series(css));
  gulp.watch(path.cssLib, gulp.series(cssLib));
  gulp.watch(path.js, gulp.series(js));
  gulp.watch(path.jsLib, gulp.series(jsLib));
  gulp.watch(path.img, gulp.series(img));
  done();
});

// Default Build
gulp.task('build', gulp.series(
  clean,
  html,
  gulp.parallel(css, cssLib, js, jsLib, img),
  bs
));
gulp.task(pageSpeed);

// Default Build
gulp.task('default', gulp.series('build', 'watch'));
