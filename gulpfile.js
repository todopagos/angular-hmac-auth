'use strinct';

var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var filesize = require('gulp-filesize');
var jshint = require('gulp-jshint');
var karma = require('karma').server;

var paths = {
  src: ['./src/**/*.js'],
  tests: ['./test/**/*Spec.js']
};

gulp.task('build', function() {
  return gulp.src(paths.src)
   .pipe(concat('hmacAuthInterceptor.js'))
   .pipe(gulp.dest('dist'))
   .pipe(filesize())
   .pipe(uglify())
   .pipe(rename('hmacAuthInterceptor.min.js'))
   .pipe(gulp.dest('dist'))
   .pipe(filesize())
   .on('error', gutil.log)
});

gulp.task('lint', function() {
  return gulp.src(paths.src)
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'));
});

gulp.task('test', function (done) {
  karma.start({ configFile: __dirname + '/karma.conf.js', singleRun: true }, function(exitCode) {
    process.exit(exitCode);
  });
});
