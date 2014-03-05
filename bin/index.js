var schema;

schema = require('validate');

module.exports = {
  validateStatement: function(statement, cb) {
    var errors, result, statementSchema;
    errors = [];
    statementSchema = schema({
      id: {
        type: 'string'
      },
      actor: {
        type: "object",
        required: true
      },
      verb: {
        type: "object",
        required: true
      },
      object: {
        type: "object",
        required: true
      },
      result: {
        type: "object"
      },
      context: {
        type: "object"
      },
      timestamp: {
        type: "string",
        match: this._regexes.ISO8601
      },
      stored: {
        type: "string",
        match: this._regexes.ISO8601
      },
      authority: {
        type: "object"
      },
      version: {
        type: "string"
      },
      attachments: {
        type: "object"
      }
    });
    result = statementSchema.validate(statement);
    if (result.errors.length > 0) {
      errors = result.errors;
    }
    if (!errors.length) {
      if ((statement.id != null) && statement.id.length === 0) {
        errors.push("statement id has no length");
      }
      this._concatErrors(this.validateActor(statement.actor), errors, "invalid statement actor");
      this._concatErrors(this.validateVerb(statement.verb), errors, "invalid statement verb");
      this._concatErrors(this.validateObject(statement.object), errors, "invalid statement object");
      if (statement.context != null) {
        this._concatErrors(this.validateContext(statement), errors, "invalid statement context");
      }
      if (statement.timestamp != null) {
        this._concatErrors(this.validateISO8601(statement.timestamp), errors, "invalid statement timestamp");
      }
      if (statement.authority != null) {
        this._concatErrors(this.validateAuthority(statement.authority), errors, "invalid statement authority");
      }
      if (statement.version != null) {
        this._concatErrors(this.validateVersion(statement.version), errors, "invalid statement version");
      }
    }
    if (typeof cb === "function") {
      cb(errors);
    }
    return errors;
  },
  validateActor: function(actor, cb) {
    var agent, errors, result, _i, _len, _ref;
    errors = [];
    if (actor.objectType === "Group") {
      errors = this.validateAgent(actor);
      if (errors.length === 0 && actor.member.length === 0) {
        errors.push("actor of type Group has 0 members");
      }
      _ref = actor.member;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        agent = _ref[_i];
        this._concatErrors(this.validateAgent(agent), errors, "invalid group agent");
        if (agent.objectType === "Group") {
          errors.push("actor of type Group must not contain Group Objects");
        }
        if (result) {
          if ((actor.mbox != null) && actor.mbox === agent.mbox) {
            errors.push("Group mbox also used as Agent identifier");
          }
          if ((actor.mbox_sha1sum != null) && actor.mbox_sha1sum === agent.mbox_sha1sum) {
            errors.push("Group mbox_sha1sum also used as Agent identifier");
          }
          if ((actor.openid != null) && actor.openid === agent.openid) {
            errors.push("Group openid also used as Agent identifier");
          }
          if ((actor.account != null) && actor.account === agent.account) {
            errors.push("Group account also used as Agent identifier");
          }
        }
      }
    } else {
      result = this.validateAgent(actor);
      if (result.length !== 0) {
        errors.push("invalid agent");
        errors = errors.concat(result);
      }
    }
    if (typeof cb === "function") {
      cb(errors);
    }
    return errors;
  },
  validateAgent: function(agent, cb) {
    var IFICount, agentSchema, errors, result;
    errors = [];
    agentSchema = schema({
      objectType: {
        type: 'string'
      },
      name: {
        type: 'string'
      },
      mbox: {
        type: 'string',
        match: this._regexes.MBOX
      },
      mbox_sha1sum: {
        type: 'string',
        match: this._regexes.SHA1
      },
      openid: {
        type: 'string'
      },
      account: {
        type: 'object'
      }
    });
    result = agentSchema.validate(agent);
    if (result.errors.length > 0) {
      errors = result.errors;
    }
    IFICount = 0;
    if (agent.mbox != null) {
      IFICount++;
    }
    if (agent.mbox_sha1sum != null) {
      IFICount++;
    }
    if (agent.openid != null) {
      IFICount++;
    }
    if (agent.account != null) {
      IFICount++;
    }
    if (IFICount !== 1) {
      errors.push("Agent must be identified by exactly one IFI");
    }
    if (typeof cb === "function") {
      cb(errors);
    }
    return errors;
  },
  validateVerb: function(verb, cb) {
    var errors, result, valid, verbSchema;
    errors = [];
    verbSchema = schema({
      id: {
        type: 'string',
        required: true
      },
      display: {
        type: "object"
      }
    });
    result = verbSchema.validate(verb);
    valid = result.errors.length === 0;
    if (!this.validateLanguageMap(verb.display)) {
      errors.push("TODO: error description");
    }
    if (typeof cb === "function") {
      cb(errors);
    }
    return errors;
  },
  validateLanguageMap: function(map, cb) {
    var errors, key, value;
    errors = [];
    for (key in map) {
      value = map[key];
      if (!this._regexes.RFC5646.test(key)) {
        errors.push("TODO: error description");
      }
    }
    if (typeof cb === "function") {
      cb(errors);
    }
    return errors;
  },
  validateObject: function(object, cb) {
    var errors;
    errors = [];
    if (object.objectType === "Agent" || object.objectType === "Group") {
      if (!validateActor(object)) {
        errors.push("TODO: error description");
      }
    } else if (object.objectType === "StatementRef") {
      if (object.id == null) {
        errors.push("TODO: error description");
      }
    } else if (object.objectType === "SubStatement") {
      if (!this.validateStatement(object)) {
        errors.push("TODO: error description");
      }
    } else if (object.objectType === "Activity" || (object.objectType == null)) {
      if (!this.validateActivity(object)) {
        errors.push("TODO: error description");
      }
    } else {
      errors.push("TODO: error description");
    }
    if (typeof cb === "function") {
      cb(errors);
    }
    return errors;
  },
  validateActivity: function(activity, cb) {
    var activitySchema, errors, i, result, valid, _i, _len, _ref;
    errors = [];
    activitySchema = schema({
      id: {
        type: 'string',
        required: true
      },
      definition: {
        name: {
          type: "object",
          required: false
        },
        description: {
          type: "object",
          required: false
        },
        type: {
          type: 'string',
          required: false
        },
        moreInfo: {
          type: 'string',
          required: false
        },
        interactionType: {
          type: 'string',
          required: false
        },
        correctResponsesPattern: {
          type: "object",
          required: false
        },
        choices: {
          type: "object",
          required: false
        },
        scale: {
          type: "object",
          required: false
        },
        source: {
          type: "object",
          required: false
        },
        target: {
          type: "object",
          required: false
        },
        steps: {
          type: "object",
          required: false
        },
        extensions: {
          type: "object",
          required: false
        }
      }
    });
    result = activitySchema.validate(activity);
    valid = result.errors.length === 0;
    if (activity.definition != null) {
      if (activity.definition.name != null) {
        if (!this.validateLanguageMap(activity.definition.name)) {
          errors.push("TODO: error description");
        }
      }
      if (activity.definition.description != null) {
        if (!this.validateLanguageMap(activity.definition.description)) {
          errors.push("TODO: error description");
        }
      }
      if (activity.definition.type === "http://adlnet.gov/expapi/activities/cmi.interaction") {
        switch (activity.definition.interactionType) {
          case "true-false":
            if (!((activity.definition.correctResponsesPattern != null) && activity.definition.correctResponsesPattern.length > 0)) {
              errors.push("TODO: error description");
            }
            _ref = activity.definition.correctResponsesPattern;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              i = _ref[_i];
              if (!(i === "true" || i === "false")) {
                errors.push("TODO: error description");
              }
            }
            break;
          case "choice":
            if (!(activity.definition.correctResponsesPattern.length > 0 && activity.definition.choices.length > 0)) {
              errors.push("TODO: error description");
            }
            break;
          case "fill-in":
            if (!(activity.definition.correctResponsesPattern.length > 0)) {
              errors.push("TODO: error description");
            }
            break;
          case "long-fill-in":
            if (!(activity.definition.correctResponsesPattern.length > 0)) {
              errors.push("TODO: error description");
            }
            break;
          case "matching":
            if (!(activity.definition.correctResponsesPattern.length > 0 && activity.definition.source.length > 0 && activity.definition.target.length > 0 && activity.definition.source.length === activity.definition.target.length)) {
              errors.push("TODO: error description");
            }
            break;
          case "performance":
            if (!(activity.definition.correctResponsesPattern.length > 0 && activity.definition.steps.length > 0)) {
              errors.push("TODO: error description");
            }
            break;
          case "sequencing":
            if (!(activity.definition.correctResponsesPattern.length > 0 && activity.definition.choices.length > 0)) {
              errors.push("TODO: error description");
            }
            break;
          case "likert":
            if (!(activity.definition.correctResponsesPattern.length > 0 && activity.definition.scale.length > 0)) {
              errors.push("TODO: error description");
            }
            break;
          case "numeric":
            if (!(activity.definition.correctResponsesPattern.length > 0)) {
              errors.push("TODO: error description");
            }
            break;
          case "other":
            if (!(activity.definition.correctResponsesPattern.length > 0)) {
              errors.push("TODO: error description");
            }
            break;
          default:
            errors.push("TODO: error description");
        }
      }
    }
    if (typeof cb === "function") {
      cb(errors);
    }
    return errors;
  },
  validateResult: function(result, cb) {
    var errors, resultSchema;
    resultSchema = schema({
      score: {
        scaled: {
          type: 'number'
        },
        raw: {
          type: 'number'
        },
        min: {
          type: 'number'
        },
        max: {
          type: 'number'
        }
      },
      success: {
        type: 'boolean'
      },
      completion: {
        type: 'boolean'
      },
      response: {
        type: 'string'
      },
      duration: {
        type: 'string',
        match: this._regexes.ISO8601
      },
      extensions: {
        type: "object"
      }
    });
    errors = resultSchema.validate(result);
    if (errors.length === 0) {
      if (result.score) {
        if ((result.score.scaled != null) && (result.score.scaled < -1 || result.score.scaled > 1)) {
          errors.push("TODO: error description");
        }
        if ((result.score.min != null) && (result.score.max != null) && result.score.min > result.score.max) {
          errors.push("TODO: error description");
        }
        if ((result.score.raw != null) && (result.score.max != null) && result.score.raw > result.score.max) {
          errors.push("TODO: error description");
        }
        if ((result.score.raw != null) && (result.score.min != null) && result.score.raw < result.score.min) {
          errors.push("TODO: error description");
        }
      }
    }
    if (typeof cb === "function") {
      cb(errors);
    }
    return errors;
  },
  validateISO8601: function(date, cb) {
    var errors, valid;
    errors = [];
    valid = this._regexes.ISO8601.test(date);
    if (!valid) {
      errors.push("TODO: error description");
    }
    if (typeof cb === "function") {
      cb(errors);
    }
    return errors;
  },
  validateContext: function(statement, cb) {
    var errors;
    errors = [];
    if (typeof cb === "function") {
      cb(errors);
    }
    return errors;
  },
  validateVersion: function(version, cb) {
    var errors, valid;
    errors = [];
    valid = version.indexOf("1.0.") === 0;
    if (!valid) {
      errors.push("TODO: error description");
    }
    if (typeof cb === "function") {
      cb(errors);
    }
    return errors;
  },
  validateAuthority: function(version, cb) {
    var errors;
    errors = [];
    if (typeof cb === "function") {
      cb(errors);
    }
    return errors;
  },
  _concatErrors: function(result, errors, message) {
    var error, _i, _len, _results;
    if (result.length !== 0) {
      errors.push(message);
      _results = [];
      for (_i = 0, _len = result.length; _i < _len; _i++) {
        error = result[_i];
        _results.push(errors.push(error));
      }
      return _results;
    }
  },
  _regexes: {
    SHA1: /[0-9a-f]{5,40}/,
    MBOX: /^mailto\:((([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/,
    RFC5646: /^(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))(-(0-9A-WY-Za-wy-z+))(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)|((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)))$/,
    ISO8601: /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/
  }
};

//# sourceMappingURL=index.js.map
