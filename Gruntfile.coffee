module.exports = (grunt)->
  #config
  grunt.initConfig
    pkd: grunt.file.readJSON "package.json"

    coffee:
      dev:
        expand:true
        cwd:"src"
        src:["**/*.coffee"]
        dest:"bin/"
        ext:".js"
        options:
          sourceMap:true
          bare:true

    coffeelint:
      app:"src/**/*.coffee"
      options:
        force:true
        max_line_length:
          value:1200

    mochaTest:
      src: ['test/**/*.coffee']
      options:
        require: 'coffee-script/register'


  #load plugins
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-test'

  #register tasks
  #compund tasks
  
  #main tasks to run
  grunt.registerTask 'build', ['coffee', 'coffeelint']
  grunt.registerTask 'test', ['build', 'mochaTest']