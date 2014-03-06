schema = require 'validate'
validateStatement = (statement, cb)->
  #console.log "@", @
  #console.log "validateStatement"
  errors = []

  statementSchema = schema
    id:
      type: 'string'
    actor:
      type:"object"
      required: true
    verb:
      type:"object"
      required: true
    object:
      type:"object"
      required: true
    result:
      type:"object"
    context:
      type:"object"
    timestamp:
      type:"string"
      match:_regexes.ISO8601
    stored:
      type:"string"
      match:_regexes.ISO8601
    authority:
      type:"object"
    version:
      type:"string"
    attachments:
      type:"object"

  result = statementSchema.validate statement
  errors = result.errors if result.errors.length > 0
  unless errors.length
    #more detailed object checks
    errors.push "statement id has no length" if statement.id? and statement.id.length is 0
    _concatErrors validateActor(statement.actor), errors, "invalid statement actor"
    _concatErrors validateVerb(statement.verb), errors, "invalid statement verb"
    _concatErrors validateObject(statement.object), errors, "invalid statement object"
    if statement.context?
      _concatErrors validateContext(statement), errors, "invalid statement context"
    if statement.timestamp?
      _concatErrors validateISO8601(statement.timestamp), errors, "invalid statement timestamp"
    if statement.authority?
      _concatErrors validateAuthority(statement.authority), errors, "invalid statement authority"
    if statement.version?
      _concatErrors validateVersion(statement.version), errors, "invalid statement version"

  cb?(errors)
  errors

validateActor = (actor, cb)->
  #console.log "validateActor"
  errors = []
  #A Group represents a collection of Agents and can be used in most of the same situations an Agent can be used. There are two types of Groups, anonymous and identified.
  if actor.objectType is "Group"
    _concatErrors validateGroup(actor), errors, "invalid group"
  else
    _concatErrors validateAgent(actor), errors, "invalid agent"
  cb?(errors)
  errors

validateGroup = (group, cb)->
  errors = []
  #An Anonymous Group MUST NOT include any Inverse Functional Identifiers
  errors = validateAgent group
  #An Anonymous Group MUST include a 'member' property listing constituent Agents.
  errors.push "actor of type Group has 0 members" if errors.length is 0 and group.member.length is 0
  for agent in group.member
    _concatErrors validateAgent(agent), errors, "invalid group agent"

    #An Anonymous Group MUST NOT contain Group Objects in the 'member' property
    #An Identified Group MUST NOT contain Group Objects in the 'member' property.
    errors.push "actor of type Group must not contain Group Objects" if agent.objectType is "Group"
    #An Identified Group SHOULD NOT use Inverse Functional Identifiers that are also used as Agent identifiers.
    errors.push "Group mbox also used as Agent identifier" if (group.mbox? and group.mbox is agent.mbox)
    errors.push "Group mbox_sha1sum also used as Agent identifier" if (group.mbox_sha1sum? and group.mbox_sha1sum is agent.mbox_sha1sum)
    errors.push "Group openid also used as Agent identifier" if (group.openid? and group.openid is agent.openid)
    errors.push "Group account also used as Agent identifier" if (group.account? and group.account is agent.account)
  cb?(errors)
  errors

validateAgent = (agent, cb)->
  #console.log "validateAgent"
  errors = []

  agentSchema = schema
    objectType:
      type: 'string'
    name:
      type: 'string'
    mbox:
      type: 'string'
      match: _regexes.MBOX
    mbox_sha1sum:
      type: 'string'
      match: _regexes.SHA1
    openid:
      type: 'string'
    account:
      type: 'object'
  result = agentSchema.validate agent
  errors = result.errors if result.errors.length > 0
  #An Agent MUST be identified by one (1) of the four types of Inverse Functional Identifiers (see 4.1.2.3 Inverse Functional Identifier);
  #An Agent MUST NOT include more than one (1) Inverse Functional Identifier;
  IFICount = 0
  IFICount++ if agent.mbox?
  IFICount++ if agent.mbox_sha1sum?
  IFICount++ if agent.openid?
  IFICount++ if agent.account?
  if IFICount isnt 1
    errors.push "Agent must be identified by exactly one IFI"
  cb?(errors)
  errors

validateVerb = (verb,cb)->
  #console.log "validateVerb"
  errors = []
  verbSchema = schema
    id:
      type: 'string'
      required: true
    display:
      type:"object"
  result = verbSchema.validate verb
  valid = result.errors.length == 0
  errors.push "TODO: error description" unless validateLanguageMap verb.display
  cb?(errors)
  errors

validateLanguageMap = (map, cb)->
  #console.log "validateLanguageMap"
  errors = []
  # language map is a dictionary where the key is a  RFC 5646 Language Tag, and the value is an string in the language specified in the tag. This map should be populated as fully as possible based on the knowledge of the string in question in different languages
  for key, value of map
    errors.push "TODO: error description" unless _regexes.RFC5646.test key
  cb?(errors)
  errors


validateObject = (object,cb)->
  #console.log "validateObject"
  errors = []
  if object.objectType is "Agent" or object.objectType is "Group"
    errors.push "TODO: error description" unless validateActor object
  else if object.objectType is "StatementRef"
    errors.push "TODO: error description" unless object.id?
  else if object.objectType is "SubStatement"
    errors.push "TODO: error description" unless validateStatement object
  else if object.objectType is "Activity" or !object.objectType?
    errors.push "TODO: error description" unless validateActivity object
  else
    errors.push "TODO: error description"

  cb?(errors)
  errors

validateActivity = (activity, cb)->
  #console.log "validateActivity"
  errors = []
  activitySchema = schema
    id:
      type: 'string'
      required: true
    definition:
      name:
        type:"object"
        required:false
      description:
        type:"object"
        required:false
      type:
        type: 'string'
        required:false
      moreInfo:
        type: 'string'
        required:false
      interactionType:
        type: 'string'
        required:false
      correctResponsesPattern:
        type:"object"
        required:false
      choices:
        type:"object"
        required:false
      scale:
        type:"object"
        required:false
      source:
        type:"object"
        required:false
      target:
        type:"object"
        required:false
      steps:
        type:"object"
        required:false
      extensions:
        type:"object"
        required:false
  result = activitySchema.validate activity
  valid = result.errors.length is 0
  if activity.definition?
    if activity.definition.name?
      errors.push "TODO: error description" unless validateLanguageMap activity.definition.name
    if activity.definition.description?
      errors.push "TODO: error description" unless validateLanguageMap activity.definition.description
    #validate scorm type insteraction activity
    if activity.definition.type is "http://adlnet.gov/expapi/activities/cmi.interaction"
      switch activity.definition.interactionType
        when "true-false"
          errors.push "TODO: error description" unless activity.definition.correctResponsesPattern? and activity.definition.correctResponsesPattern.length > 0
          for i in activity.definition.correctResponsesPattern
            errors.push "TODO: error description" unless i is "true" or i is "false"
        when "choice"
          errors.push "TODO: error description" unless activity.definition.correctResponsesPattern.length>0 and activity.definition.choices.length>0
        when "fill-in"
          errors.push "TODO: error description" unless activity.definition.correctResponsesPattern.length>0
        when "long-fill-in"
          errors.push "TODO: error description" unless activity.definition.correctResponsesPattern.length>0
        when "matching"
          errors.push "TODO: error description" unless activity.definition.correctResponsesPattern.length>0 and activity.definition.source.length>0 and activity.definition.target.length>0 and activity.definition.source.length is activity.definition.target.length
        when "performance"
          errors.push "TODO: error description" unless activity.definition.correctResponsesPattern.length>0 and activity.definition.steps.length>0
        when "sequencing"
          errors.push "TODO: error description" unless activity.definition.correctResponsesPattern.length>0 and activity.definition.choices.length>0
        when "likert"
          errors.push "TODO: error description" unless activity.definition.correctResponsesPattern.length>0 and activity.definition.scale.length>0
        when "numeric"
          errors.push "TODO: error description" unless activity.definition.correctResponsesPattern.length>0
        when "other"
          errors.push "TODO: error description" unless activity.definition.correctResponsesPattern.length>0
        else
          errors.push "TODO: error description"
  cb?(errors)
  errors

validateResult = (result, cb)->
  #console.log "validateResult"
  resultSchema = schema
    score:
      scaled:
        type:'number'
      raw:
        type:'number'
      min:
        type:'number'
      max:
        type:'number'
    success:
      type: 'boolean'
    completion:
      type: 'boolean'
    response:
      type: 'string'
    duration:
      type: 'string'
      match: _regexes.ISO8601
    extensions:
      type:"object"
  errors = resultSchema.validate result
  if errors.length is 0
    if result.score
      errors.push "TODO: error description" if result.score.scaled? and (result.score.scaled < -1 or result.score.scaled > 1)
      errors.push "TODO: error description" if result.score.min? and result.score.max? and result.score.min>result.score.max
      errors.push "TODO: error description" if result.score.raw? and result.score.max? and result.score.raw>result.score.max
      errors.push "TODO: error description" if result.score.raw? and result.score.min? and result.score.raw<result.score.min
  cb?(errors)
  errors

validateISO8601 = (date, cb)->
  #console.log "validateISO8601"
  errors = []
  valid = _regexes.ISO8601.test date
  errors.push "TODO: error description" unless valid
  cb?(errors)
  errors

validateContext = (statement, cb)->
  #console.log "validateContext"
  errors = [] #TODO
  cb?(errors)
  errors

validateVersion = (version, cb)->
  #console.log "validateVersion"
  errors = []
  valid = version.indexOf("1.0.") is 0
  errors.push "TODO: error description" unless valid
  cb?(errors)
  errors

validateAuthority = (version, cb)->
  #console.log "validateAuthority"
  errors = [] #TODO
  cb?(errors)
  errors

_concatErrors = (result, errors, message)->
  if result.length isnt 0
    errors.push message
    for error in result
      errors.push error

_regexes =
  SHA1: /[0-9a-f]{5,40}/
  MBOX: /^mailto\:((([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/
  RFC5646: /^(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))(-(0-9A-WY-Za-wy-z+))(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)|((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)))$/
  ISO8601: /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/


module.exports =
  validateStatement:validateStatement
  validateActor:validateActor
  validateAgent:validateAgent
  validateGroup:validateGroup
  validateVerb:validateVerb
  validateLanguageMap:validateLanguageMap
  validateObject:validateObject
  validateActivity:validateActivity
  validateResult:validateResult
  validateISO8601:validateISO8601
  validateContext:validateContext
  validateVersion:validateVersion
  validateAuthority:validateAuthority