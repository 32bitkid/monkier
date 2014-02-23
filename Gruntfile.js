module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-docco');
  
  // Project configuration.
  grunt.initConfig({
    uglify: {
      all: {
        files: {
          'monkier-min.js': ['monkier.js']
        }
      }
    },
    docco: {
      debug: {
        src: ['monkier.js'],
        options: {
          output: 'docs/'
        }
      }
    }
  });
};