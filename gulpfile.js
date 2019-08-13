/* Routes ------------------------------------------------------------------- */
const routes = {
	images: {
		all: {
			src: {
				all: "src/img/**/*.+(jpg|jpeg|JPG|JPEG|png|PNG|svg)",
				build: "src/img/**/*.svg"
			},
			test: {
				dir: "test/images/"
			},
			build: {
				dir: "build/images/"
			},
			watch: {
				all: "src/img/**/*.+(jpg|jpeg|JPG|JPEG|png|PNG|svg)"
			}
		},
		kraken: {
			src: {
				build: "src/img/**/*.svg"
			}
		},
		mockup: {
			src: {
				all: "src/img/mock-up/*.jpg"
			},
			test: {
				dir: "test/mock-up/"
			}
		}
	},
	js: {
		all: {
			src: {
				all: ["src/js/*.js", "!src/js/test.js"],
				test: "src/js/test.js",
				build: ["src/js/*.js", "!src/js/test.js", "temp/js/index.js"]
			},
			temp: {
				dir: "temp/js/"
			},
			test: {
				dir: "test/js/"
			},
			build: {
				dir: "build/js/"
			},
			watch: {
				all: "src/ts/**/*.js",
				test: "src/js/test.js"
			}
		},
		ts: {
			src: {
				all: "src/ts/index.tslink.ts",
				types: "src/ts/@types/**/*.ts"
			},
			temp: {
				dir: "temp/ts/",
				file: "index.ts",
				types: "temp/ts/@types/"
			},
			watch: {
				all: "src/ts/**/*.ts"
			}
		}
	},
	style: {
		all: {
			src: {
				test: "src/sass/**/*.css",
				build: ["test/css/**/*.css", "!test/css/test.css"]
			},
			test: {
				dir: "test/css/"
			},
			build: {
				dir: "build/css/"
			},
			watch: {
				all: "src/sass/**/*.css"
			}
		},
		sass: {
			src: {
				all: "src/sass/style.scss"
			},
			watch: {
				all: "src/sass/**/*.scss"
			}
		}
	},
	html: {
		all: {
			watch: {
				all: ["src/*.html", "src/partials/**/*.html"]
			}
		},
		replace_string: {
			src: {
				all: "src/**/*.html"
			},
			temp: {
				dir: "temp/html/"
			}
		},
		html_include: {
			src: {
				all: "temp/html/*.html"
			},
			test: {
				dir: "test/"
			},
			build: {
				dir: "build/"
			}
		}
	},
	plugins: {
		all: {
			src: {
				all: "src/plugins/**/*"
			},
			test: {
				dir: "test/plugins/"
			},
			build: {
				dir: "build/plugins/"
			}
		}
	},
	fonts: {
		all: {
			src: {
				all: "src/fonts/**/*.+(ttf|otf|woff|eot)"
			},
			test: {
				dir: "test/fonts/"
			},
			build: {
				dir: "build/fonts/"
			}
		}
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
	let paths = [routes.images.all.build.dir + "**/*", routes.style.all.build.dir + "**/*", routes.html.html_include.build.dir + "**/*.html", routes.plugins.all.build.dir + "**/*", routes.fonts.all.build.dir + "**/*", routes.js.all.build.dir + "**/*"];
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
	return src(routes.js.ts.src.types)
		.pipe(dest(routes.js.ts.temp.types));
}
function concatTs() {
	return src(routes.js.ts.src.all, {
		buffer: false
	})
		.pipe(TS_LINK(routes.js.ts.temp.file))
		.pipe(dest(routes.js.ts.temp.dir));
}
function compileTS() {
	return TS_PROJECT.src()
		.pipe(TS_PROJECT())
		.js.pipe(dest(routes.js.all.temp.dir));
}
let constructTS = series(putTypes, concatTs, compileTS);




/* TEST functions ----------------------------------------------------------- */
function t_PutImages() {
	return src(routes.images.all.src.all)
		.pipe(dest(routes.images.all.test.dir));
}

function t_PutJs() {
	return src(routes.js.all.src.test)
		.pipe(dest(routes.js.all.test.dir));
}

function t_CompileSass() {
	return src(routes.style.sass.src.all)
		.pipe(SASS(prm.sass.all).on('error', SASS.logError))
		.pipe(dest(routes.style.all.test.dir));
}

function t_PutCss() {
	return src(routes.style.all.src.test)
		.pipe(CACHE())
		.pipe(dest(routes.style.all.test.dir));
}

function t_DelHtmlTestMark() {
	let prop = prm.replace_string.del_loop.test;
	return src(routes.html.replace_string.src.all)
		.pipe(REPLACE_STRING.replace(prop.plain.s, prop.plain.r))
		.pipe(dest(routes.html.replace_string.temp.dir));
}
function t_CompileHtml() {
	prm.include.test.context.state = "test";
	return src(routes.html.html_include.src.all)
		.pipe(HTML_INCLUDE(prm.html_include.all))
		.pipe(dest(routes.html.html_include.test.dir));
}
let t_ConstructHtml = series(t_DelHtmlTestMark, t_CompileHtml);

function t_PutPlugins() {
	return src(routes.plugins.all.src.all)
		.pipe(dest(routes.plugins.all.test.dir));
}

function t_PutFonts() {
	return src(routes.fonts.all.src.all)
		.pipe(dest(routes.fonts.all.test.dir));
}

function t_PutMockUpImages() {
	return src(routes.images.mockup.src.all)
		.pipe(dest(routes.images.mockup.test.dir));
}

/* BUILD functions ---------------------------------------------------------- */
function b_PutImages() {
	return src(routes.images.all.src.all)
		.pipe(dest(routes.images.all.build.dir));
}

function b_CompileTS() {
	return TS_PROJECT.src()
		.pipe(TS_PROJECT())
		.js.pipe(dest(routes.js.all.build.dir));
}
let b_ConstructTS = series(putTypes, concatTs, b_CompileTS);
function build1_put_js() {
	return src(routes.js.all.src.all)
		.pipe(dest(routes.js.all.build.dir));
}

function b_CompileSass() {
	return src(routes.style.sass.src.all)
		.pipe(SASS(prm.sass.all).on('error', SASS.logError))
		.pipe(dest(routes.style.all.build.dir));
}

function b_PutCss() {
	return src(routes.style.all.src.build)
		.pipe(CACHE())
		.pipe(dest(routes.style.all.build.dir));
}

function b_DelHtmlLoopsAndTestStrings() {
	let prop = prm.replace_string.del_loop.build.node;
	return src(routes.html.replace_string.src.all)
		.pipe(REPLACE_STRING.replace(prop.plain.s, prop.plain.r))
		.pipe(REPLACE_STRING.replace(prop.loop.s, prop.loop.r))
		.pipe(REPLACE_STRING.replace(prop.insert1.s, prop.insert1.r))
		.pipe(dest(routes.html.replace_string.temp.dir));
}
function b_CompileHtml() {
	prm.include.build.context.state = "none";
	return src(routes.html.html_include.src.all)
		.pipe(HTML_INCLUDE(prm.html_include.all))
		.pipe(dest(routes.html.html_include.build.dir));
}
let b_ConstructHtml = series(b_DelHtmlLoopsAndTestStrings, b_CompileHtml);

function b_PutPlugins() {
	return src(routes.plugins.all.src.all)
		.pipe(dest(routes.plugins.all.build.dir));
}

function b_PutFonts() {
	return src(routes.fonts.all.src.all)
		.pipe(dest(routes.fonts.all.build.dir));
}

/* BUILD_END functions ------------------------------------------------------ */
function e_PutSvg() {
	return src(routes.images.all.src.build)
		.pipe(dest(routes.images.all.build.dir));
}
function e_OptimizeImages() {
	return src(routes.images.kraken.src.build)
		.pipe(KRAKEN(prm.kraken.all))
		.pipe(dest(routes.images.all.build.dir));
}
let e_ConstructImages = parallel(e_PutSvg, e_OptimizeImages);

function e_OptimizeJS() {
	return src(routes.js.all.src.build)
		.pipe(REMOVE_CONSOLE(prm.remove_console.all))
		.pipe(UGLIFY(prm.uglify.all))
		.pipe(dest(routes.js.all.build.dir));
}
let e_ConstructJS = series(constructTS, e_OptimizeJS);

function e_OptimizeCss() {
	return src(routes.style.all.src.build)
		.pipe(MEDIA_QUERIES(prm.media_queries.all))
		.pipe(AUTOPREFIXER(prm.autoprefixer.all))
		.pipe(dest(routes.style.all.build.dir));
}
let e_ConstructCss = series(t_CompileSass, t_PutCss, e_OptimizeCss);

function e_DelHtmlLoopsAndTestStrings() {
	let prop;
	if(prm.replace_string.del_loop.mode == "node") prop = prm.replace_string.del_loop.build.node;
	else if(prm.replace_string.del_loop.mode == "php") prop = prm.replace_string.del_loop.build.php;
	return src(routes.html.replace_string.src.all)
		.pipe(REPLACE_STRING.replace(prop.plain.s, prop.plain.r))
		.pipe(REPLACE_STRING.replace(prop.attr.s, prop.attr.r))
		.pipe(REPLACE_STRING.replace(prop.loop.s, prop.loop.r))
		.pipe(REPLACE_STRING.replace(prop.insert1.s, prop.insert1.r))
		.pipe(dest(routes.html.replace_string.temp.dir));
}
function e_CompileHtml() {
	prm.include.build.context.state = "none";
	return src(routes.html.html_include.src.all)
		.pipe(HTML_INCLUDE(prm.html_include.all))
		.pipe(HTML_BEAUTIFY(prm.html_beautify.all))
		.pipe(dest(routes.html.html_include.build.dir));
}
let e_ConstructHtml = series(e_DelHtmlLoopsAndTestStrings, e_CompileHtml);


/* EXPORTS ------------------------------------------------------------------ */

// test - template compilation to test; command - gulp
exports.default = function() {
	testBrowser();
	parallel(t_PutPlugins, t_PutFonts, t_PutMockUpImages)();
	watch(routes.images.all.watch.all, prm.watch.all.param, series(t_PutImages, testReload));
	watch(routes.js.all.watch.test, prm.watch.all.param, series(t_PutJs, testReload));
	watch(routes.style.all.watch.all, prm.watch.all.param, series(t_PutCss, testReload));
	watch(routes.style.sass.watch.all, prm.watch.all.param, series(t_CompileSass, testReload));
	watch(routes.html.all.watch.all, prm.watch.all.param, series(t_ConstructHtml, testReload));
};

// build - compile dirty files to build; command - gulp build
exports.build = function() {
	buildBrowser();
	parallel(b_PutPlugins, b_PutFonts)();
	watch(routes.images.all.watch.all, prm.watch.all.param, series(b_PutImages));
	watch(routes.js.ts.watch.all, prm.watch.all.param, series(b_ConstructTS));
	watch(routes.js.all.watch.all, prm.watch.all.param, series(build1_put_js));
	watch(routes.style.all.watch.all, prm.watch.all.param, series(b_PutCss));
	watch(routes.style.sass.watch.all, prm.watch.all.param, series(b_CompileSass));
	watch(routes.html.all.watch.all, prm.watch.all.param, series(b_ConstructHtml));
};

// build_end - compile optimized files to build; command - gulp build_end
const _BuildEnd = parallel(e_ConstructImages, e_ConstructJS, e_ConstructCss, e_ConstructHtml, b_PutPlugins, b_PutFonts);
exports.build_end = series(cleanAll, _BuildEnd);

/* end EXPORTS -------------------------------------------------------------- */