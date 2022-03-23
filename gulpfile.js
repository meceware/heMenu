const gulp = require( 'gulp' );
const del = require( 'del' );
const rename = require( 'gulp-rename' );
const { rollup } = require( 'rollup' );
const { babel } = require( '@rollup/plugin-babel' );
const commonjs = require( '@rollup/plugin-commonjs' );
const { nodeResolve } = require( '@rollup/plugin-node-resolve' );
const eslint = require( '@rollup/plugin-eslint' );
const { terser } = require( 'rollup-plugin-terser' );
const pckg = require( './package.json' );
const { sass } = require( '@mr-hope/gulp-sass' );
const autoprefixer = require( 'gulp-autoprefixer' );
const cleancss = require( 'gulp-clean-css' );
const serve = require( 'rollup-plugin-serve' );

const gzipSizeFromFileSync = async ( path ) => {
  const gzipSize = await import( 'gzip-size' );
  return gzipSize.gzipSizeFromFileSync( path );
};

const css = () => {
  return gulp.src( 'src/**/*.scss' )
    .pipe( sass().on( 'error', sass.logError ) )
    .pipe( autoprefixer( [ '> 5%', 'last 5 versions' ] ) )
    .pipe( cleancss() )
    .pipe( rename( 'hemenu.min.css' ) )
    .pipe( gulp.dest( 'dist' ) );
};

const devjs = () => {
  return rollup( {
    input: 'src/index.js',
    plugins: [
      eslint(),
      nodeResolve( { mainFields: [ 'jsnext:module', 'jsnext:main' ] } ),
      commonjs(),
      babel( {
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
        presets: [
          [ '@babel/env',
            {
              targets: {
                browsers: [
                  '> 1%',
                  'last 2 Chrome major versions',
                  'last 2 Firefox major versions',
                  'last 2 Edge major versions',
                  'last 2 Safari major versions',
                  'last 3 Android major versions',
                  'last 3 ChromeAndroid major versions',
                  'last 2 iOS major versions',
                ],
              },
              useBuiltIns: 'usage',
              corejs: '3',
            },
          ],
        ],
      } ),
      serve( {
        contentBase: [ 'demo', 'dist' ],
        host: '0.0.0.0',
        port: 8010,
      } ),
    ],
  } ).then( function( bundle ) {
    return bundle.write( {
      name: 'heMenu',
      file: 'dist/hemenu.min.js',
      format: 'umd',
      sourcemap: true,
    } );
  } );
};

const watch = () => {
  gulp.watch( 'src/**/*.js', devjs );
  gulp.watch( 'src/**/*.scss', css );
};

const clean = ( callback ) => {
  // Remove dist folder content
  del( [
    'dist/**/*',
  ] );

  callback();
};

const buildjs = () => {
  const banner =
    '/* \n' +
    ' * heMenu v' + pckg.version + '\n' +
    ' * https://github.com/meceware/heMenu \n' +
    ' * \n' +
    ' * Made by Mehmet Celik (https://www.meceware.com/) \n' +
    ' */';

  return rollup( {
    input: 'src/index.js',
    plugins: [
      eslint(),
      nodeResolve( { mainFields: [ 'jsnext:module', 'jsnext:main' ] } ),
      commonjs(),
      babel( {
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
        presets: [
          [ '@babel/env',
            {
              targets: {
                browsers: [
                  '> 1%',
                  'last 2 Chrome major versions',
                  'last 2 Firefox major versions',
                  'last 2 Edge major versions',
                  'last 2 Safari major versions',
                  'last 3 Android major versions',
                  'last 3 ChromeAndroid major versions',
                  'last 2 iOS major versions',
                ],
              },
              useBuiltIns: 'usage',
              corejs: '3',
            },
          ],
        ],
      } ),
      terser( {
        output: {
          comments: function( node, comment ) {
            if ( 'comment2' === comment.type ) {
              return /Made by Mehmet Celik/.test( comment.value );
            }
          },
        },
      } ),
    ],
  } ).then( function( bundle ) {
    return bundle.write( {
      name: 'heMenu',
      file: 'dist/hemenu.min.js',
      format: 'umd',
      sourcemap: false,
      banner: banner,
    } );
  } ).then( function() {
    return rollup( {
      input: 'src/index.js',
      plugins: [
        eslint(),
        nodeResolve( { mainFields: [ 'jsnext:module', 'jsnext:main' ] } ),
        commonjs(),
        babel( {
          exclude: 'node_modules/**',
          babelHelpers: 'bundled',
        } ),
      ],
    } );
  } ).then( function( bundle ) {
    return bundle.write( {
      name: 'heMenu',
      file: 'dist/hemenu.js',
      format: 'umd',
      sourcemap: false,
      banner: banner,
    } );
  } );
};

const size = ( callback ) => {
  gzipSizeFromFileSync( './dist/hemenu.min.js' ).then( val => {
    console.log( 'JS: gzipped file size: ' + ( Math.round( ( val / 1024 ) * 100 ) / 100 ) + 'KB' );
    gzipSizeFromFileSync( './dist/hemenu.min.css' ).then( val => {
      console.log( 'CSS: gzipped file size: ' + ( Math.round( ( val / 1024 ) * 100 ) / 100 ) + 'KB' );
      callback();
    } );
  } );
};

exports.dev = gulp.series( gulp.parallel( devjs, css ), watch );
exports.build = gulp.series( clean, buildjs, css, size );
