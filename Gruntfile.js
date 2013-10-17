module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // lint js files
    jshint: {
      files: ['src/js/**/*.js']
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
      webui: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: [ '*.html', 'images/**', 'css/**'],
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
      // browserify libremap.js -> bundle.js
      libremap: {
        dest: 'build/js/libremap.js',
        src: [ 'src/js/libremap.js' ],
        options: {
          debug: grunt.option('debug'),
          external: ['jquery', 'bootstrap', 'leaflet']
        }
      },
      vendor: {
        dest: 'build/vendor/vendor.js',
        src: [],
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
              exports: 'L'
            },
          }
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['copy', 'concat', 'browserify']);
};
