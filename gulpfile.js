const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const removeCode = require('gulp-remove-code');

gulp.task('sass', function(){
    return gulp.src('app/style/scss/**/*.scss')
        .pipe(sass())
        .pipe(concat('app.css'))
        .pipe(gulp.dest('build'));
});

gulp.task('compile-js', function(){
    return gulp.src('app/scripts/**/*.js')
        .pipe(removeCode({ production: true }))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('watch', function(){
    gulp.watch('style/**/*.scss', ['sass']);
});

gulp.task('watch-code', function(){
    gulp.watch('app/scripts/**/*.js', ['compile-js']);
});

gulp.task('default', ['sass', 'compile-js']);