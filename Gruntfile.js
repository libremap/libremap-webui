var webui_static = [ '*.html', 'images/**', 'css/**'];
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // lint js files
    jshint: {
      files: ['src/js/**/*.js']
    },
    connect: {
      webui: {
        options: {
          port: 9000,
          base: 'build'
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
      webui_static: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: webui_static,
            dest: 'build/'
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
            'vendor/leaflet/leaflet.css'
          ]
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
              exports: 'bootstrap'
            },
            leaflet: {
              path: 'vendor/leaflet/leaflet.js',
              exports: 'L',
              depends: {
                'jquery': '$'
              }
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
          external: ['jquery', 'bootstrap', 'leaflet']
        }
      }
    },
    watch: {
      webui_static: {
        files: webui_static,
        tasks: ['copy'],
        options: {
          cwd: 'src'
        }
      },
      webui_js: {
        files: ['src/**/*.js'],
        tasks: ['browserify']
      },
      webui_css: {
        files: ['src/**/*.css'],
        tasks: ['concat']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['copy', 'concat', 'browserify', 'connect', 'watch']);
};
