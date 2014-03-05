schema = require 'validate'
module.exports =
  validateStatement:(statement, cb)->
    valid = true

    statementSchema = schema
      id:
        type: 'string'
        required: false
      actor:
        type:'object'
        required: true
      verb:
        type:'object'
        required: true
      object:
        type:'object'
        required: true
      result:
        type:'object'
        required: false
      context:
        type:'object'
        required: false
      timestamp:
        required: false
      stored:
        type:'object'
        required: false
      authority:
        type:'object'
        required: false
      version:
        required: false
      attachments:
        required: false

    result = statementSchema.validate statement
    valid = false if result.errors.length > 0
    if valid
      #more detailed object checks
      valid = false unless statement.id.length > 0
      valid = false unless validateActor statement.actor
      valid = false unless validateVerb statement.verb
      valid = false unless validateObject statement.object
      (valid = false unless validateResult statement.result) if statement.result?
      (valid = false unless validateContext statement) if statement.context?
      (valid = false unless validateISO8601 statement.timestamp) if statement.timestamp?
      (valid = false unless validateAuthority statement.authority) if statement.authority?
      (valid = false unless validateVersion statement.version) if statement.version?

    cb?(valid)
    valid

  validateActor:(actor, cb)->
    valid = true
    #A Group represents a collection of Agents and can be used in most of the same situations an Agent can be used. There are two types of Groups, anonymous and identified.
    if actor.objectType is "Group"
      #An Anonymous Group MUST NOT include any Inverse Functional Identifiers
      result = validateAgent actor
      #An Anonymous Group MUST include a 'member' property listing constituent Agents.
      valid = false if result is false and actor.member.length is 0
      for agent in actor.member
        valid = false unless validateAgent agent
        #An Anonymous Group MUST NOT contain Group Objects in the 'member' property
        #An Identified Group MUST NOT contain Group Objects in the 'member' property.
        valid = false if agent.objectType is "Group"
        #An Identified Group SHOULD NOT use Inverse Functional Identifiers that are also used as Agent identifiers.
        if result
          valid = false if (actor.mbox? and actor.mbox is agent.mbox)
          valid = false if (actor.mbox_sha1sum? and actor.mbox_sha1sum is agent.mbox_sha1sum)
          valid = false if (actor.openid? and actor.openid is agent.openid)
          valid = false if (actor.account? and actor.account is agent.account)
    else
      valid = false unless validateAgent actor
    cb?(valid)
    valid

  validateAgent:(agent, cb)->
    valid = true

    agentSchema = schema
      objectType:
        type: 'string'
        required: false
      name:
        type: 'string'
        required: false
      mbox:
        type: 'string'
        required: false
        match: _regexes.email
      mbox_sha1sum:
        type: 'string'
        required: false
        match: _regexes.SHA1
      openid:
        type: 'string'
        required: false
      account:
        required: false
    result = statementSchema.validate agent
    valid = false if result.errors.length > 0
    #An Agent MUST be identified by one (1) of the four types of Inverse Functional Identifiers (see 4.1.2.3 Inverse Functional Identifier);
    #An Agent MUST NOT include more than one (1) Inverse Functional Identifier;
    IFICount = 0
    IFICount++ if statement.actor.mbox?
    IFICount++ if statement.actor.mbox_sha1sum?
    IFICount++ if statement.actor.openid?
    IFICount++ if statement.actor.account?
    valid = false if IFICount isnt 1
    cb?(valid)
    valid

  validateVerb:(verb,cb)->
    verbSchema = schema
      id:
        type: 'string'
        required: true
      display:
        required: false
    result = verbSchema.validate verb
    valid = result.errors.length == 0
    valid = false unless validateLanguageMap verb.display
    cb?(valid)
    valid

  validateLanguageMap:(map, cb)->
    valid = true
    # language map is a dictionary where the key is a  RFC 5646 Language Tag, and the value is an string in the language specified in the tag. This map should be populated as fully as possible based on the knowledge of the string in question in different languages
    for key, value of map
      valid = false unless RFC5646.test key
    cb?(valid)
    valid


  validateObject:(object,cb)->
    valid = true
    if object.objectType is "Agent" or object.objectType is "Group"
      valid = false unless validateActor object
    else if object.objectType is "StatementRef"
      valid = false unless object.id?
    else if object.objectType is "SubStatement"
      valid = false unless validateStatement object
    else if object.objectType is "Activity" or !object.objectType?
      valid = false unless validateActivity object
    else
      valid = false

    cb?(valid)
    valid

  validateActivity:(activity, cb)->
    activitySchema = schema
      id:
        type: 'string'
        required: true
      definition:
        required: false
        name:
          type:'object'
          required:false
        description:
          type:'object'
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
          type:'object'
          required:false
        choices:
          type:'object'
          required:false
        scale:
          type:'object'
          required:false
        source:
          type:'object'
          required:false
        target:
          type:'object'
          required:false
        steps:
          type:'object'
          required:false
        extensions:
          type:'object'
          required:false
    result = activitySchema.validate activity
    valid = result.errors.length is 0
    if activity.definition?
      if activity.definition.name?
        valid = false unless validateLanguageMap activity.definition.name
      if activity.definition.description?
        valid = false unless validateLanguageMap activity.definition.description
      #validate scorm type insteraction activity
      if activity.definition.type is "http://adlnet.gov/expapi/activities/cmi.interaction"
        switch activity.definition.interactionType
          when "true-false"
            valid = false unless activity.definition.correctResponsesPattern? and activity.definition.correctResponsesPattern.length > 0
            for i in activity.definition.correctResponsesPattern
              valid = false unless i is "true" or i is "false"
          when "choice"
            valid = false unless activity.definition.correctResponsesPattern.length>0 and activity.definition.choices.length>0
          when "fill-in"
            valid = false unless activity.definition.correctResponsesPattern.length>0
          when "long-fill-in"
            valid = false unless activity.definition.correctResponsesPattern.length>0
          when "matching"
            valid = false unless activity.definition.correctResponsesPattern.length>0 and activity.definition.source.length>0 and activity.definition.target.length>0 and activity.definition.source.length is activity.definition.target.length
          when "performance"
            valid = false unless activity.definition.correctResponsesPattern.length>0 and activity.definition.steps.length>0
          when "sequencing"
            valid = false unless activity.definition.correctResponsesPattern.length>0 and activity.definition.choices.length>0
          when "likert"
            valid = false unless activity.definition.correctResponsesPattern.length>0 and activity.definition.scale.length>0
          when "numeric"
            valid = false unless activity.definition.correctResponsesPattern.length>0
          when "other"
            valid = false unless activity.definition.correctResponsesPattern.length>0
          else
            valid = false
    cb?(valid)
    valid
  
  validateResult:(result, cb)->
    activitySchema = schema
      score:
        type:'object'
        required: false
        scaled:
          type:'number'
          required: false
        raw:
          type:'number'
          required: false
        min:
          type:'number'
          required: false
        max:
          type:'number'
          required: false
      success:
        type: 'boolean'
        required: false
      completion:
        type: 'boolean'
        required: false
      response:
        type: 'string'
        required: false
      duration:
        type: 'string'
        required: false
        match: _regexes.ISO8601
      extensions:
        type:'object'
        required: false
    r = resultSchema.validate result
    valid = r.errors.length is 0
    if valid
      if result.score
        valid = false if result.score.scaled? and (result.score.scaled < -1 or result.score.scaled > 1)
        valid = false if result.score.min? and result.score.max? and result.score.min>result.score.max
        valid = false if result.score.raw? and result.score.max? and result.score.raw>result.score.max
        valid = false if result.score.raw? and result.score.min? and result.score.raw<result.score.min
    cb?(valid)
    valid

  validateISO8601:(date, cb)->
    valid = _regexes.ISO8601.test date
    cb?(valid)
    valid

  validateContext:(statement, cb)->
    valid = true #TODO
    cb?(valid)
    valid

  validateVersion:(version, cb)->
    valid = version.indexOf("1.0.") is 0
    cb?(valid)
    valid

  validateAuthority:(version, cb)->
    valid = true #TODO
    cb?(valid)
    valid

  _regexes:
    SHA1: /\b([a-f0-9]{40})\b/
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ISO8601: /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/
    RFC5646: /^(((?<language>([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-(?<script>[A-Za-z]{4}))?(-(?region>[A-Za-z]{2}|[0-9]{3}))?(-(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-(?<extension>[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8}+))*(-(?<privateUse>x(-[A-Za-z0-9]{1,8})+))?)|(?<privateUse>x(-[A-Za-z0-9]{1,8})+)|(?<grandfathered>(en-GB-oed|i-ami|i-bnn|i-defaulti-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-aulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)))$/