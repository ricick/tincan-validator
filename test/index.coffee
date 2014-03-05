require "should"
validator = require "../src/index.coffee"

describe "validator", ->
  it "should exist", ->
    validator.should.not.equal null

describe "validateStatement", ->

  testValid = (mock, valid)->
    console.log "testValid", mock, valid
    statement = require mock
    if valid
      validator.validateStatement statement, (errors)->
        if errors.length
          console.log "errors.length", errors.length
          for error in errors
            console.log error
        errors.length.should.equal 0
    else
      validator.validateStatement statement, (errors)->
        errors.length.should.not.equal 0


  it 'should return no errors for simple statement', ()->
    testValid "./mocks/statement-valid-simple.json", true
  it 'should return no errors for attempted statement', ()->
    testValid "./mocks/statement-valid-attempted.json", true
  it 'should return no errors for long statement', ()->
    testValid "./mocks/statement-valid-long.json", true