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
          value:120

  #load plugins
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-contrib-coffee'

  #register tasks
  #compund tasks
  
  #main tasks to run
  grunt.registerTask 'build', ['coffee', 'coffeelint']