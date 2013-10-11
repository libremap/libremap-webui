module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['src/js/**/*.js']
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    copy: {
      webui: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: [ '*.html', 'images', 'css'],
            dest: 'build/'
          }
        ]
      }
    },
    concat: {
      vendor: {
        files: {
          'build/js/vendor.js': [
            'bower_components/bootstrap/dist/js/bootstrap.min.js'
          ],
          'build/css/vendor.css': [
            'bower_components/bootstrap/dist/css/bootstrap.min.css'
          ]
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'copy']);
};
