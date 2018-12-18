var gulp = require('gulp'),
    rigger = require('gulp-rigger'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    connect = require('gulp-connect'),
    prefixer = require('gulp-autoprefixer');
//paths

var path = {
    src: {
        js: 'public/src/js/*.js',
        css: 'public/src/css/*.scss',
        images: 'public/src/images/**/*.*',
        fonts: 'public/src/fonts/**/*.*'
    },
    build: {
        js: 'public/js/',
        css: 'public/css/',
        images: 'public/images/',
        fonts: 'public/fonts/'
    },
    watch: {
        js: 'public/src/js/**/*.js',
        css: 'public/src/css/**/*.scss',
        images: 'public/src/images/**/*.*',
        fonts: 'public/src/fonts/**/*.*'
    },
    clean: ''
};

//tasks
function handleError(err) {
    console.log(err.toString());
    this.emit('end');

}

gulp.task('connect', function () {
    connect.server({
        root: './',
        livereload: true
    });
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .on('error', handleError)
        .pipe(sourcemaps.init())
        .on('error', handleError)
        //.pipe(uglify())
        //.on('error', handleError)
        .pipe(gulp.dest(path.build.js))
        .on('error', handleError)
        .pipe(connect.reload())
});

gulp.task('style:build', function () {
    gulp.src(path.src.css)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on('error', handleError)
        .pipe(prefixer('last 15 versions'))
        .pipe(cssmin())
        .pipe(gulp.dest(path.build.css))
        .pipe(connect.reload())
});

gulp.task('images:build', function () {
    gulp.src(path.src.images)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.images))
        .pipe(connect.reload())
});

gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('watch', function () {
    gulp.watch([path.watch.js], function (event, cb) {
        gulp.start('js:build');

    });
    gulp.watch([path.watch.css], function (event, cb) {
        gulp.start('style:build')

    });
    gulp.watch([path.watch.images], function (event, cb) {
        gulp.start('images:build');
    });
});
gulp.task('default', ['connect', 'watch']);