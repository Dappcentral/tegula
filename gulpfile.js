const { dest, series, src } = require("gulp");
const babel = require("gulp-babel");
const del = require("del");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");

const clean = cb => del(["dist"], cb);

const build = () =>
  src(["src/*.js"])
    .pipe(sourcemaps.init())
    .pipe(replace(/require\((["']\.[^'"]+)/g, "require($1.min"))
    .pipe(
      babel({
        plugins: ["@babel/transform-runtime"],
        presets: ["@babel/env"],
      }),
    )
    .pipe(uglify())
    .pipe(rename({ extname: ".min.js" }))
    .pipe(sourcemaps.write("."))
    .pipe(dest("dist"));

module.exports.default = series(clean, build);
