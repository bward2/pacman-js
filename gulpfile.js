const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');

gulp.task('sass', function(){
    return gulp.src('style/**/*.scss')
        .pipe(sass())
        .pipe(concat('app.css'))
        .pipe(gulp.dest('style'))
});

gulp.task('watch', function(){
    gulp.watch('style/**/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'watch']);