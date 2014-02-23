module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  
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
    },
    jshint: {
      all: ["monkier.js"]
    }
  });

  grunt.registerTask('default', ['jshint','uglify','docco']);
};