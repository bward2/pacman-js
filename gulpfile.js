const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');

gulp.task('sass', function(){
    return gulp.src('app/style/scss/**/*.scss')
        .pipe(sass())
        .pipe(concat('app.css'))
        .pipe(gulp.dest('build'));
});

gulp.task('compile-js', function(){
    return gulp.src('app/scripts/**/*.js')
        .pipe(concat('app.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('watch', function(){
    gulp.watch('style/**/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'compile-js']);