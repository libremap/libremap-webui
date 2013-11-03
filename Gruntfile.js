var webui_static = [ 'index.html', 'images/**', 'css/**'];

module.exports = function(grunt) {
  // read couch.json if it exists
  var couchconfig = grunt.file.exists('couch.json') ?
        grunt.file.readJSON('couch.json') : null;
  var couchpushopts = null;
  if (couchconfig) {
    var couch = grunt.option('couch') || 'localhost';
    if (couch) {
      couchpushopts = {
        options: {
          user: couchconfig.couches[couch].user,
          pass: couchconfig.couches[couch].pass
        }
      };
      couchpushopts[couch] = {};
      var files = {};
      files[couchconfig.couches[couch].database] = 'tmp/libremap-webui.json';
      couchpushopts[couch] = { files: files};
    }
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // lint js files
    jshint: {
      files: ['Gruntfile.js', 'src/js/**/*.js']
    },
    connect: {
      webui: {
        options: {
          port: 9000,
          hostname: '*',
          base: 'build',
          livereload: 31337
        }
      }
    },
    // minify js files
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    // copy static files
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: webui_static,
            dest: 'build/'
          },
          {
            expand: true,
            cwd: 'bower_components/bootstrap/dist',
            src: 'fonts/*',
            dest: 'build/'
          },
          {
            expand: true,
            cwd: 'bower_components/font-awesome',
            src: 'fonts/*',
            dest: 'build/'
          }
        ]
      },
      'build-ddoc': {
        files: [
          {
            expand: true,
            cwd: 'template_ddoc',
            src: '**/*',
            dest: 'build-ddoc/'
          },
          {
            expand: true,
            cwd: 'build',
            src: '**/*',
            dest: 'build-ddoc/_attachments/'
          }
        ]
      }
    },
    concat: {
      // concat vendor css files
      vendor: {
        files: {
          'build/vendor/vendor.css': [
            'bower_components/bootstrap/dist/css/bootstrap.min.css',
            'bower_components/font-awesome/css/font-awesome.min.css',
            'vendor/leaflet/leaflet.css'
          ]
        }
      }
    },
    jst: {
      compile: {
        options: {
          processName: function (filename) {
            return filename.replace(/src\/templates\/(.*)\.html/, '$1');
          }
        },
        files: {
          'build-jst/templates.js': ['src/templates/**/*.html']
        }
      }
    },
    browserify: {
      vendor: {
        src: [],
        dest: 'build/vendor/vendor.js',
        options: {
          shim: {
            jquery: {
              path: 'bower_components/jquery/jquery.min.js',
              exports: '$'
            },
            bootstrap: {
              path: 'bower_components/bootstrap/dist/js/bootstrap.min.js',
              exports: 'bootstrap',
              depends: {
                'jquery': 'jQuery'
              }
            },
            leaflet: {
              path: 'vendor/leaflet/leaflet.js',
              exports: 'L'
            }
          }
        }
      },
      // browserify libremap.js -> bundle.js
      libremap: {
        dest: 'build/js/libremap.js',
        src: [ 'src/js/libremap.js' ],
        options: {
          debug: grunt.option('debug'),
          external: ['jquery', 'bootstrap', 'leaflet'],
          shim: {
            templates: {
              path: 'build-jst/templates.js',
              exports: 'JST',
              depends: {
                'underscore': '_'
              }
            }
          }
        }
      }
    },
    watch: {
      options: {
        livereload: 31337
      },
      webui_config: {
        files: ['config.json'],
        tasks: ['build']
      },
      webui_static: {
        files: webui_static,
        tasks: ['copy'],
        options: {
          cwd: 'src'
        }
      },
      webui_jst: {
        files: ['src/templates/**/*.html'],
        tasks: ['jst', 'browserify:libremap']
      },
      webui_js: {
        files: ['src/**/*.js'],
        tasks: ['browserify:libremap']
      },
      webui_css: {
        files: ['src/**/*.css'],
        tasks: ['concat']
      }
    },
    'couch-compile': {
      'libremap-webui': {
        files: {
          'tmp/libremap-webui.json': 'build-ddoc'
        }
      }
    },
    'couch-push': couchpushopts
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-couch');

  grunt.registerTask('build', ['jshint', 'copy:build', 'concat', 'jst', 'browserify']);
  grunt.registerTask('push', ['build', 'copy:build-ddoc', 'couch']);

  // Default task(s).
  grunt.registerTask('default', ['build', 'connect', 'watch']);
};
