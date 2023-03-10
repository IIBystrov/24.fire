// Вводные данные

// Базовые переменные
const {src, dest, series, parallel, watch} = require("gulp"); // Достать из галпа нужные функции
const sass = require("gulp-sass")(require("sass")); // Подключаем sass
const notify = require("gulp-notify"); // Подключаем notify
const rename = require("gulp-rename"); // Подключаем rename
const autoprefixer = require("gulp-autoprefixer"); // Подключаем автопрефиксер
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const svgSprite = require("gulp-svg-sprite");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const fs = require("fs"); // Подключаем плагин для работы с файловой системой
const clean = require("gulp-clean");
const pug = require("gulp-pug");

// Функции 

// Преобразование стилей
const styles = () => {
    return src("./src/scss/**/*.scss") // Получить файл
        .pipe(sourcemaps.init())
        .pipe(sass({ // Преобразование из scss в css
            outputStyle: "expanded"
        }).on("error", notify.onError()))
        .pipe(rename({  // Добавление .min к файлу
            suffix: ".min"
        }))
        .pipe(autoprefixer({ // Автопрефиксер
            cascade: false,
        }))
        .pipe(cleanCSS({ // Минификация файла
            level: 2
        }))
        .pipe(sourcemaps.write(".")) // Создать файл sourcemap
        .pipe(dest("./dist/css/")) // Вернуть файл
        .pipe(browserSync.stream()); // Обновлять браузер
}

// Работа со шрифтами
const fonts = () => {
    src("./src/fonts/**.ttf")
        .pipe(ttf2woff())
        .pipe(dest("./dist/fonts/"))
    return src("./src/fonts/**.ttf")
        .pipe(ttf2woff2())
        .pipe(dest("./dist/fonts/"))
}

// // Работа с модулями html
// const htmlInclude = () => {
//     return src(["./src/index.html"])
//         .pipe(fileinclude({
//             prefix: "@",
//             basepath: "@file",
//         }))
//         .pipe(dest("./dist"))
//         .pipe(browserSync.stream()); // Обновлять браузер
// }

// Работа с pug
const pug2html = () => {
    return src("src/*.pug")
        .pipe(pug())
        .pipe(dest("./dist"))
        .pipe(browserSync.stream());
};

// Работа с изображениями
const imgToDist = () => {
    return src(["./src/img/**/*.jpg", "./src/img/**/*.png", "./src/img/**/*.jpeg"])
        .pipe(dest("./dist/img")) // Перенос изображений в /dist
}

// Работа с папкой /resources
const resources = () => {
    return src("./src/resources/**")
        .pipe(dest("./dist"))
}

// Создание svg-спрайтов
const svgSprites = () => {
    return src("./src/img/**.svg")
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(dest("./dist/img"))
}

// Удаление папки /dist
const distClean = () => {
    return src(["dist/*"], {read: false})
        .pipe(clean())
}

// Контроль JS
const scripts = () => {
    return src("./src/js/main.js")
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write("."))
        .pipe(dest("./dist/js"))
        .pipe(browserSync.stream());
}

// Слежение за файлами
const watchFiles = () => {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });

    watch("./src/scss/**/*.scss", styles); // Директория слежения и функция после изменения файла
    watch("./src/index.pug", pug2html);
    watch("./src/img/**.jpg", imgToDist);
    watch("./src/img/**.png", imgToDist);
    watch("./src/img/**.jpeg", imgToDist);
    watch("./src/img/**svg", svgSprites); 
    watch("./src/resources/**", resources);  
    watch("./src/fonts/**.ttf", fonts);
    watch("./src/js/**/*.js", scripts);
}

// Присвоение таску функции
exports.styles = styles;
exports.watchFiles = watchFiles;
exports.scripts = scripts;

exports.default = series(distClean, parallel( pug2html, scripts, fonts, resources, imgToDist, svgSprites), styles, watchFiles);