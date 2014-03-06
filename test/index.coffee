require "should"
validator = require "../src/index.coffee"

describe "validator", ->
  it "should exist", ->
    validator.should.not.equal null

testValid = (mock, method, valid)->
  console.log "testValid", mock, valid
  object = require mock
  method object, (errors)->
    if valid
      if errors.length
        console.log "errors.length", errors.length
        for error in errors
          console.log error
      errors.length.should.equal 0
    else
      errors.length.should.not.equal 0

describe "validateStatement", ->
  it 'should return no errors for simple statement', ()->
    testValid "./mocks/statement-valid-simple.json", validator.validateStatement, true
  it 'should return no errors for attempted statement', ()->
    testValid "./mocks/statement-valid-attempted.json", validator.validateStatement, true
  it 'should return no errors for long statement', ()->
    testValid "./mocks/statement-valid-long.json", validator.validateStatement, true

describe "validateActivity", ->
  it 'should return no errors for simple activity', ()->
    testValid "./mocks/activity-valid-simple.json", validator.validateActivity, true

describe "validateAgent", ->
  it 'should return no errors for simple agent', ()->
    testValid "./mocks/agent-valid-simple.json", validator.validateAgent, true

describe "validateGroup", ->
  it 'should return no errors for simple group', ()->
    testValid "./mocks/group-valid-simple.json", validator.validateGroup, true