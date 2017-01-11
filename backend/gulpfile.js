/// <binding BeforeBuild='build' />
var gulp = require('gulp'),
    shell = require('gulp-shell');

var config = {
    //Include all js files but exclude any min.js files
    src: ['WeddingQuiz/wwwroot/src/**/*.js'], //'!WeddingQuiz/wwwroot/**/*.min.js']
    test: "{}"
}

gulp.task('build', shell.task('au build', { cwd: 'WeddingQuiz/wwwroot' }));

gulp.task('watch',  function () {
    return gulp.watch(config.src, ['build']);
});

gulp.task('default', ['build'], function () {
    // place code for your default task here
});



