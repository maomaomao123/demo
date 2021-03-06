const gulp = require('gulp');
const less = require('gulp-less');
const stylus = require('gulp-stylus'); // styl文件编译
const rename = require('gulp-rename');
const del = require('del');
const imagemin = require('gulp-imagemin');
const path = require('path');
const autoprefixer = require('gulp-autoprefixer'); // css前缀
const babel = require('gulp-babel'); // babel插件，编译es6的
const cleanCss = require('gulp-clean-css'); // css压缩
const htmlmin = require('gulp-htmlmin'); // html压缩
const uglify = require('gulp-uglify'); // js压缩
const jsonminify = require('gulp-jsonminify2'); // json压缩
// const eslint = require('gulp-eslint');

const srcPath = './src/**';
const distPath = './dist/';
const wxmlFiles = [`${srcPath}/*.wxml`, `!${srcPath}/_template/*.wxml`];
const cssFiles = [
    `${srcPath}/*.less`,
    `!${srcPath}/styles/**/*.less`,
    `!${srcPath}/_template/*.less`,
    `${srcPath}/*.styl`,
    `!${srcPath}/styles/**/*.styl`,
    `!${srcPath}/_template/*.styl`
];
const jsonFiles = [`${srcPath}/*.json`, `!${srcPath}/_template/*.json`];
const jsFiles = [`${srcPath}/*.js`, `!${srcPath}/_template/*.js`, `!${srcPath}/env/*.js`];
const imgFiles = [
    `${srcPath}/*.{png,jpg,gif,ico}`,
    `${srcPath}/**/*.{png,jpg,gif,ico}`
];

/* 清除dist目录 */
gulp.task('clean', done => {
    del.sync(['dist/**/*']);
    done();
});

/* 编译wxml文件 */
const wxml = () => {
    return gulp
        .src(wxmlFiles, { since: gulp.lastRun(wxml) })
        .pipe(htmlmin({
            collapseWhitespace: true, // 压缩HTML
            removeComments: true, // 清除HTML注释
            keepClosingSlash: true // 保持元素末尾的斜杠
        }))
        .pipe(gulp.dest(distPath));
};
gulp.task(wxml);

/* 编译JS文件 */
const js = () => {
    return gulp
        .src(jsFiles, { since: gulp.lastRun(js) })
        .pipe(babel())
        .pipe(uglify({
            compress: true,
        }))
        // .pipe(eslint())
        // .pipe(eslint.format())
        .pipe(gulp.dest(distPath));
};
gulp.task(js);

/* 配置请求地址相关 */
const envJs = (env) => {
    return () => {
        return gulp
            .src(`./src/env/${env}.js`)
            .pipe(babel())
            // .pipe(eslint())
            // .pipe(eslint.format())
            .pipe(rename('env.js'))
            .pipe(gulp.dest(distPath));
    };
};
gulp.task('devEnv', envJs('development'));
gulp.task('testEnv', envJs('testing'));
gulp.task('prodEnv', envJs('production'));

/* 编译json文件 */
const json = () => {
    return gulp
        .src(jsonFiles, { since: gulp.lastRun(json) })
        .pipe(jsonminify())
        .pipe(gulp.dest(distPath));
};
gulp.task(json);

/* 编译less文件 */
const wxss = () => {
    return gulp
        .src(cssFiles)
        .pipe(autoprefixer(['last 2 versions', 'iOS >= 8', 'Android >= 4.0']))
        .pipe(less())
        .pipe(stylus())
        .pipe(cleanCss({keepSpecialComments: '*'}))
        .pipe(rename({ extname: '.wxss' }))
        .pipe(gulp.dest(distPath));
};
gulp.task(wxss);

/* 编译压缩图片 */
const img = () => {
    return gulp
        .src(imgFiles, { since: gulp.lastRun(img) })
        .pipe(imagemin())
        .pipe(gulp.dest(distPath));
};
gulp.task(img);

/* watch */
gulp.task('watch', () => {
    let watchcssFiles = [...cssFiles];
    watchcssFiles.pop();
    gulp.watch(watchcssFiles, wxss);
    gulp.watch(jsFiles, js);
    gulp.watch(imgFiles, img);
    gulp.watch(jsonFiles, json);
    gulp.watch(wxmlFiles, wxml);
});


/* build */
gulp.task(
    'build',
    gulp.series('clean', gulp.parallel('wxml', 'js', 'json', 'wxss', 'img', 'prodEnv'))
);

/* dev */
gulp.task('dev', gulp.series('clean', gulp.parallel('wxml', 'js', 'json', 'wxss', 'img', 'devEnv'), 'watch'));

/* test */
gulp.task('test', gulp.series('clean', gulp.parallel('wxml', 'js', 'json', 'wxss', 'img', 'testEnv')));

/**
 * auto 自动创建page or template or component
 *  -s 源目录（默认为_template)
 * @example
 *   gulp auto -p mypage           创建名称为mypage的page文件
 *   gulp auto -t mytpl            创建名称为mytpl的template文件
 *   gulp auto -c mycomponent      创建名称为mycomponent的component文件
 *   gulp auto -s index -p mypage  创建名称为mypage的page文件
 */
const auto = done => {
    const yargs = require('yargs')
        .example('gulp auto -p mypage', '创建名为mypage的page文件')
        .example('gulp auto -t mytpl', '创建名为mytpl的template文件')
        .example('gulp auto -c mycomponent', '创建名为mycomponent的component文件')
        .example(
            'gulp auto -s index -p mypage',
            '复制pages/index中的文件创建名称为mypage的页面'
        )
        .option({
            s: {
                alias: 'src',
                default: '_template',
                describe: 'copy的模板',
                type: 'string'
            },
            p: {
                alias: 'page',
                describe: '生成的page名称',
                conflicts: ['t', 'c'],
                type: 'string'
            },
            t: {
                alias: 'template',
                describe: '生成的template名称',
                type: 'string',
                conflicts: ['c']
            },
            c: {
                alias: 'component',
                describe: '生成的component名称',
                type: 'string'
            },
            version: { hidden: true },
            help: { hidden: true }
        })
        .fail(msg => {
            done();
            console.error('创建失败!!!');
            console.error(msg);
            console.error('请按照如下命令执行...');
            yargs.parse(['--msg']);
            return;
        })
        .help('msg');

    const argv = yargs.argv;
    const source = argv.s;
    const typeEnum = {
        p: 'pages',
        t: 'templates',
        c: 'components'
    };
    let hasParams = false;
    let name, type;
    for (let key in typeEnum) {
        hasParams = hasParams || !!argv[key];
        if (argv[key]) {
            name = argv[key];
            type = typeEnum[key];
        }
    }

    if (!hasParams) {
        done();
        yargs.parse(['--msg']);
    }

    const root = path.join(__dirname, 'src', type);
    return gulp
        .src(path.join(root, source, '*.*'))
        .pipe(
            rename({
                dirname: name,
                basename: name
            })
        )
        .pipe(gulp.dest(path.join(root)));
};
gulp.task(auto);
