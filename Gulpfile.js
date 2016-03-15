var gulp = require('gulp');
var sass = require('gulp-sass');
var mainBowerFiles = require('main-bower-files');
var gulpFilter = require('gulp-filter');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var sassPath = './app/assets/stylesheets/**/*.scss';
var cssPath = './app/assets/stylesheets';
var jsPath = './app/assets/javascripts';

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

gulp.task('bower', function() {
  var jsFilter = gulpFilter('**/*.js');
  var cssFilter = gulpFilter('**/*.css');
  gulp
    .src(mainBowerFiles())
    .pipe(jsFilter)
    .pipe(concat('bundle.js'))
    //.pipe(uglify())
    .pipe(gulp.dest(jsPath + '/vendor/'));

  gulp
    .src(mainBowerFiles())
    .pipe(cssFilter)
    .pipe(gulp.dest(cssPath + '/vendor/'));

});

gulp.task('styles', function() {
  gulp
    .src(sassPath)
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(gulp.dest(cssPath));
});

gulp.task('watch', function() {
  gulp
    .watch(sassPath, ['styles']);
});

gulp.task('default', ['styles', 'watch', 'bower']);
