/* Routes ------------------------------------------------------------------- */
const routes = {
	images: {
		src: "src/img/**/*.+(jpg|jpeg|JPG|JPEG|png|PNG|svg)",
		build_src: "src/img/**/*.svg",
		src_kraken: "src/img/**/*.+(jpg|jpeg|JPG|JPEG|png|PNG)",
		dest: "dest/images/",
		build: "build/images/",
		watch: "src/img/**/*.+(jpg|jpeg|JPG|JPEG|png|PNG|svg)"
	},
	js: {
		ts: {
			src_ts: "src/ts/index.tslink.ts",
			temporary: "temp/ts/",
			temp_file_name: "index.ts",
			dest_file_name: "index.js",
			watch: "src/ts/**/*.ts",
			types_src: "src/ts/@types/**/*.ts",
			types_dest: "temp/ts/@types/"
		},
		js: {
			temporary: "temp/js/",
			src_js: "src/js/*.js",
			dest: "dest/js/",
			build: "build/js/"
		}
	},
	sass: {
		src: "src/sass/style.scss",
		dest: "dest/css/",
		watch: "src/sass/**/*.scss"
	},
	style: {
		src: "src/sass/**/*.css",
		build_src: ["dest/css/**/*.css", "!dest/css/test.css"],
		dest: "dest/css/",
		build: "build/css/",
		watch: "src/sass/**/*.css"
	},
	html: {
		src: ["src/**/*.html"],
		src_temp: "temp/html/*.html",
		build_temp: "temp/html/",
		dest: "dest/",
		build: "build/",
		watch: ["src/*.html", "src/partials/**/*.html"]
	},
	plugins: {
		src: "src/plugins/**/*",
		dest: "dest/plugins/",
		build: "build/plugins/"
	},
	fonts: {
		src: "src/fonts/**/*.+(ttf|otf|woff|eot)",
		dest: "dest/fonts/",
		build: "build/fonts/"
	},
	server: {
		path: "server.js"
	}
};

const html_include_data = require("./html-include-data.js");
const auth_data = require("./auth.js");

/* Parameters --------------------------------------------------------------- */
const prm = {
	browser: {
		all: {
			server: "./dest",
			port: 3002
		}
	},
	watch: {
		all: {
			ignoreInitial: false
		}
	},
	sass: {
		all: {
		}
	},
	media_queries: {
		all: {
		}
	},
	autoprefixer: {
		all: {
			overrideBrowserslist: ['> 0%'],
			cascade: false
		}
	},
	remove_console: {
		all: {
			namespace: ["console"],
			methods: ["log", "dir"]
		}
	},
	uglify: {
		all: {
		}
	},
	kraken: {
		all: {
			key: auth_data.kraken.key,
			secret: auth_data.kraken.secret,
			lossy: true,
			concurrency: 6
		}
	},
	html_include: {
		all: {
			context: html_include_data
		}
	},
	replace_string: {
		all: {
		},
		del_loop: {
			test: {
				plain: {
					s: "#{2}", // custom episode hash
					r: ""
				}
			},
			build: {
				mode: "node", // here value can be 'node' or 'php'. It set some difference in end build compiling.
				node: {
					plain: {
						s: "#{2}[\\w\\W\\s]+?#{2}", // custom episode
						r: ""
					},
					attr: {
						s: "",
						r: ""
					},
					loop: {
						s: "@{2}for[\\w\\W]+?\\{[\\w\\W\\s]+?\\}", // loop @@for
						r: function(rep) {
							rep = rep.replace(/@{2}for[\w\W^{]+?\{/, "");
							rep = rep.substring(0, rep.length - 1);
							return rep;
						}
					},
					insert1: {
						s: "\\`\\+.{1,}?\\+\\`", // variable insertion `+ +`
						r: ""
					}
				},
				php: {
					plain: {
						s: "#{2}[\\w\\W\\s]+?#{2}", // custom episode
						r: ""
					},
					attr: {
						s: "data-in\\=\".+?\"", // attribute for connect any data to tags
						r: ""
					},
					loop: {
						s: "@{2}for[\\w\\W]+?\\{[\\w\\W\\s]+?\\}", // loop @@for
						r: function(rep) {
							rep = rep.replace(/@{2}for[\w\W]+?\{/, "<!-- LOOP =============== -->");
							rep = rep.substring(0, rep.length - 1);
							return rep + "<!-- end LOOP =============== -->";
						}
					},
					insert1: {
						s: "\\`\\+.{1,}?\\+\\`", // variable insertion `+ +`
						r: ""
					}
				}
			}
		}
	},
	nodemon: {
		all: {
			prop: {
				script: routes.server.path,
				ext: "",
				delay: "2000"
			},
			crash: function() {
				console.error("Crash server!");
			},
			restart: function() {
				console.log("Server restart!");
			}
		}
	},
	html_beautify: {
		all: {
			"indent_size": 1,
			"eol": "\n",
			"indent_level": 0,
			"indent_with_tabs": true,
			"preserve_newlines": true,
			"max_preserve_newlines": 2,
			"brace_style": "collapse",
			"end_with_newline": false
		}
	}
};

/* Packages ----------------------------------------------------------------- */
const DEL = require('del');
const CACHE = require("gulp-cached");
const BROWSER = require("browser-sync").create();
const TYPESCRIPT = require("gulp-typescript");
let TS_PROJECT = TYPESCRIPT.createProject("tsconf.json");
const {
	src,
	dest,
	series,
	parallel,
	watch
} = require("gulp");
const SASS = require("gulp-sass");
SASS.compiler = require('node-sass');
const MEDIA_QUERIES = require("gulp-group-css-media-queries");
const AUTOPREFIXER = require('gulp-autoprefixer');
const REMOVE_CONSOLE = require('gulp-remove-logging');
const UGLIFY = require("gulp-uglify");
const KRAKEN = require("gulp-kraken");
const HTML_INCLUDE = require("gulp-file-include");
const TS_LINK = require('gulp-ts-link');
const NODEMON = require("gulp-nodemon");
const HTML_BEAUTIFY = require('gulp-html-beautify');
const REPLACE_STRING = require('gulp-inject-string');



/* Common functions --------------------------------------------------------- */
// clean directories
let clean_dest = null;
function clean() {
	return DEL(clean_dest + "**/*");
}
function cleanAll() {
	let paths = [routes.images.build + "**/*", routes.js.js.build + "**/*", routes.style.build + "**/*", routes.html.build + "**/*.html", routes.plugins.build + "**/*", routes.fonts.build + "**/*"];
	return DEL(paths);
}

// browsers
function testBrowser() {
	BROWSER.init(prm.browser.all);
}
function testReload(cb) {
	BROWSER.reload();
	cb();
}
function buildBrowser() {
	NODEMON(prm.nodemon.all.prop)
		.on("crash", prm.nodemon.all.crash)
		.on("restart", prm.nodemon.all.restart);
}

// typescript compilation
function putTypes() {
	return src(routes.js.ts.types_src)
		.pipe(dest(routes.js.ts.types_dest));
}
function concatTs() {
	return src(routes.js.ts.src_ts, {
		buffer: false
	})
		.pipe(TS_LINK(routes.js.ts.temp_file_name))
		.pipe(dest(routes.js.ts.temporary));
}
function compileTS() {
	return TS_PROJECT.src()
		.pipe(TS_PROJECT())
		.js.pipe(dest(routes.js.js.temporary));
}
let constructTS = series(putTypes, concatTs, compileTS);




/* TEST functions ----------------------------------------------------------- */
function t_PutImages() {
	return src(routes.images.src)
		.pipe(dest(routes.images.dest));
}

function t_PutJs() {
	return src(routes.js.js.src_js)
		.pipe(dest(routes.js.js.dest));
}

function t_CompileSass() {
	return src(routes.sass.src)
		.pipe(SASS(prm.sass.all).on('error', SASS.logError))
		.pipe(dest(routes.sass.dest));
}

function t_PutCss() {
	return src(routes.style.src)
		.pipe(CACHE())
		.pipe(dest(routes.style.dest));
}

function t_DelHtmlTestMark() {
	let prop = prm.replace_string.del_loop.test;
	return src(routes.html.src)
		.pipe(REPLACE_STRING.replace(prop.plain.s, prop.plain.r))
		.pipe(dest(routes.html.build_temp));
}
function t_CompileHtml() {
	prm.include.test.context.state = "test";
	return src(routes.html.src_temp)
		.pipe(HTML_INCLUDE(prm.html_include.all))
		.pipe(dest(routes.html.dest));
}
let t_ConstructHtml = series(t_DelHtmlTestMark, t_CompileHtml);

function t_PutPlugins() {
	return src(routes.plugins.src)
		.pipe(dest(routes.plugins.dest));
}

function t_PutFonts() {
	return src(routes.fonts.src)
		.pipe(dest(routes.fonts.dest));
}

function t_PutMockUpImages() {
	return src(routes.fonts.src)
		.pipe(dest(routes.fonts.dest));
}

/* BUILD functions ---------------------------------------------------------- */
function b_PutImages() {
	return src(routes.images.src)
		.pipe(dest(routes.images.build));
}

function b_CompileTS() {
	return TS_PROJECT.src()
		.pipe(TS_PROJECT())
		.js.pipe(dest(routes.js.js.build));
}
let b_ConstructTS = series(putTypes, concatTs, b_CompileTS);
function build1_put_js() {
	return src([routes.js.js.src_js, "!src/js/test.js"])
		.pipe(dest(routes.js.js.build));
}

function b_CompileSass() {
	return src(routes.sass.src)
		.pipe(SASS(prm.sass.all).on('error', SASS.logError))
		.pipe(dest(routes.style.build));
}

function b_PutCss() {
	return src(routes.style.src)
		.pipe(CACHE())
		.pipe(dest(routes.style.build));
}

function b_DelHtmlLoopsAndTestStrings() {
	let prop = prm.replace_string.del_loop.build.node;
	return src(routes.html.src)
		.pipe(REPLACE_STRING.replace(prop.plain.s, prop.plain.r))
		.pipe(REPLACE_STRING.replace(prop.loop.s, prop.loop.r))
		.pipe(REPLACE_STRING.replace(prop.insert1.s, prop.insert1.r))
		.pipe(dest(routes.html.build_temp));
}
function b_CompileHtml() {
	prm.include.build.context.state = "none";
	return src(routes.html.build_temp + "*.html")
		.pipe(HTML_INCLUDE(prm.html_include.all))
		.pipe(dest(routes.html.build));
}
let b_ConstructHtml = series(b_DelHtmlLoopsAndTestStrings, b_CompileHtml);

function b_PutPlugins() {
	return src(routes.plugins.src)
		.pipe(dest(routes.plugins.build));
}

function b_PutFonts() {
	return src(routes.fonts.src)
		.pipe(dest(routes.fonts.build));
}

/* BUILD_END functions ------------------------------------------------------ */
function e_PutSvg() {
	return src(routes.images.build_src)
		.pipe(dest(routes.images.build));
}
function e_OptimizeImages() {
	return src(routes.images.src_kraken)
		.pipe(KRAKEN(prm.kraken.all))
		.pipe(dest(routes.images.build));
}
let e_ConstructImages = parallel(e_PutSvg, e_OptimizeImages);

function e_OptimizeJS() {
	return src([routes.js.js.temporary + routes.js.ts.dest_file_name, "!src/js/test.js", routes.js.js.src_js])
		.pipe(REMOVE_CONSOLE(prm.remove_console.all))
		.pipe(UGLIFY(prm.uglify.all))
		.pipe(dest(routes.js.js.build));
}
let e_ConstructJS = series(constructTS, e_OptimizeJS);

function e_OptimizeCss() {
	return src(routes.style.build_src)
		.pipe(MEDIA_QUERIES(prm.media_queries.all))
		.pipe(AUTOPREFIXER(prm.autoprefixer.all))
		.pipe(dest(routes.style.build));
}
let e_ConstructCss = series(t_CompileSass, t_PutCss, e_OptimizeCss);

function e_DelHtmlLoopsAndTestStrings() {
	let prop;
	if(prm.replace_string.del_loop.mode == "node") prop = prm.replace_string.del_loop.build.node;
	else if(prm.replace_string.del_loop.mode == "php") prop = prm.replace_string.del_loop.build.php;
	return src(routes.html.src)
		.pipe(REPLACE_STRING.replace(prop.plain.s, prop.plain.r))
		.pipe(REPLACE_STRING.replace(prop.attr.s, prop.attr.r))
		.pipe(REPLACE_STRING.replace(prop.loop.s, prop.loop.r))
		.pipe(REPLACE_STRING.replace(prop.insert1.s, prop.insert1.r))
		.pipe(dest(routes.html.build_temp));
}
function e_CompileHtml() {
	prm.include.build.context.state = "none";
	return src(routes.html.build_temp + "*.html")
		.pipe(HTML_INCLUDE(prm.html_include.all))
		.pipe(HTML_BEAUTIFY(prm.html_beautify.all))
		.pipe(dest(routes.html.build));
}
let e_ConstructHtml = series(e_DelHtmlLoopsAndTestStrings, e_CompileHtml);


/* EXPORTS ------------------------------------------------------------------ */

// test - template compilation to test; command - gulp
exports.default = function() {
	testBrowser();
	parallel(t_PutPlugins, t_PutFonts, t_PutMockUpImages)();
	watch(routes.images.watch, prm.watch.all.param, series(t_PutImages, testReload));
	watch(routes.js.js.src_js, prm.watch.all.param, series(t_PutJs, testReload));
	watch(routes.style.watch, prm.watch.all.param, series(t_PutCss, testReload));
	watch(routes.sass.watch, prm.watch.all.param, series(t_CompileSass, testReload));
	watch(routes.html.watch, prm.watch.all.param, series(t_ConstructHtml, testReload));
};

// build - compile dirty files to build; command - gulp build
exports.build = function() {
	buildBrowser();
	parallel(b_PutPlugins, b_PutFonts)();
	watch(routes.images.watch, prm.watch.all.param, series(b_PutImages));
	watch(routes.js.ts.watch, prm.watch.all.param, series(b_ConstructTS));
	watch(routes.js.js.src_js, prm.watch.all.param, series(build1_put_js));
	watch(routes.style.watch, prm.watch.all.param, series(b_PutCss));
	watch(routes.sass.watch, prm.watch.all.param, series(b_CompileSass));
	watch(routes.html.watch, prm.watch.all.param, series(b_ConstructHtml));
};

// build_end - compile optimized files to build; command - gulp build_end
const _BuildEnd = parallel(e_ConstructImages, e_ConstructJS, e_ConstructCss, e_ConstructHtml, b_PutPlugins, b_PutFonts);
exports.build_end = series(cleanAll, _BuildEnd);

/* end EXPORTS -------------------------------------------------------------- */