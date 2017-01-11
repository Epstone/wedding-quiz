/// <binding BeforeBuild='build' />
var gulp = require('gulp'),
    shell = require('gulp-shell');

gulp.task('build', shell.task('au build', {cwd:'WeddingQuiz/wwwroot'}));

gulp.task('watch', function(){
    return gulp.watch(config.src, ['scripts']);
});

gulp.task('default', ['build'], function () {
    // place code for your default task here
});



