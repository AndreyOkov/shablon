'use strict';

var gulp        = require('gulp'),
    watch       = require('gulp-watch'),
    prefixer    = require('gulp-autoprefixer'),
    uglify      = require('gulp-uglify'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'), // Список поддерживаемых плагинов которые можно использовать вместе с gulp-sourcemap https://github.com/floridoo/gulp-sourcemaps/wiki/Plugins-with-gulp-sourcemaps-support
    rigger      = require('gulp-rigger'),
    cssmin      = require('gulp-minify-css'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    rimraf      = require('rimraf'),
    browserSync = require("browser-sync"),
    rename      = require('gulp-rename'),
    reload      = browserSync.reload;


var path = {
    dist: { //Тут мы укажем куда складывать готовые после сборки файлы
        html:   'dist/',
        js:     'dist/js/',
        css:    'dist/css/',
        img:    'dist/img/',
        fonts:  'dist/fonts/'
    },
    src: { //Пути откуда брать исходники
        html:   'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js:     'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style:  'src/style/main.scss',
        img:    'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts:  'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html:   'src/**/*.html',
        js:     'src/js/**/*.js',
        style:  'src/style/**/*.+(scss|css)',
        img:    'src/img/**/*.*',
        fonts:  'src/fonts/**/*.*'
    },
    clean: './dist',
    move: {
        source: {
            bootstrap: {
                css_a:'bower_components/bootstrap/dist/css/bootstrap.min.css',
                css_b:'bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
                js:'bower_components/bootstrap/dist/js/bootstrap.min.js',
                fonts:'bower_components/bootstrap/dist/fonts/*.*'
            },
            jquery: {
                js: 'bower_components/jquery/dist/jquery.min.js'
            } 
        },
        dest: {
            bootstrap: {
                css:'dist/css',
                js: 'dist/js',
                fonts:'dist/fonts'
            }
        }
    }
};

var config = {
    server: {
        baseDir: "./dist"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil",
    notify: false
};

gulp.task('html:dist', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.dist.html)) //Выплюнем их в папку dist
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('js:dist', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.dist.js)) //Выплюнем готовый файл в dist
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('style:dist', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        // .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.dist.css)) //И в dist
        .pipe(reload({stream: true}));
});

gulp.task('image:dist', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.dist.img)) //И бросим в dist
        .pipe(reload({stream: true}));
});

gulp.task('fonts:dist', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dist.fonts))
});

gulp.task('dist', [
    'html:dist',
    'js:dist',
    'style:dist',
    'fonts:dist',
    'image:dist'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:dist');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:dist');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:dist');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:dist');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:dist');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('move',['clean'], function(){
    var moveCSS = gulp.src([path.move.source.bootstrap.css_a, path.move.source.bootstrap.css_b])
        .pipe(gulp.dest(path.dist.css));
    var moveJS  = gulp.src([path.move.source.bootstrap.js, path.move.source.jquery.js])
        .pipe(gulp.dest(path.dist.js));
    var moveFonts = gulp.src(path.move.source.bootstrap.fonts)
        .pipe(gulp.dest(path.dist.fonts));
});

gulp.task('default', ['move'], function(){
    gulp.start('dist');
    gulp.start('webserver');
    gulp.start('watch');
});