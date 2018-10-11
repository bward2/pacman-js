var gulp = require('gulp');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var gulpIf = require('gulp-if');

gulp.task('sass', function(){
    return gulp.src('style/**/*.scss')
        .pipe(sass()) // Converts Sass to CSS with gulp-sass
        .pipe(gulp.dest('style'))
        .pipe(gulpIf('*.css', cssnano()))
});

gulp.task('watch', function(){
    gulp.watch('style/**/*.scss', ['sass']);
});

gulp.task('default', ['watch']);