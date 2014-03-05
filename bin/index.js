var schema;

schema = require('validate');

module.exports = {
  validateStatement: function(statement, cb) {
    var result, statementSchema, valid;
    valid = true;
    statementSchema = schema({
      id: {
        type: 'string',
        required: false
      },
      actor: {
        type: 'object',
        required: true
      },
      verb: {
        type: 'object',
        required: true
      },
      object: {
        type: 'object',
        required: true
      },
      result: {
        type: 'object',
        required: false
      },
      context: {
        type: 'object',
        required: false
      },
      timestamp: {
        required: false
      },
      stored: {
        type: 'object',
        required: false
      },
      authority: {
        type: 'object',
        required: false
      },
      version: {
        required: false
      },
      attachments: {
        required: false
      }
    });
    result = statementSchema.validate(statement);
    if (result.errors.length > 0) {
      valid = false;
    }
    if (valid) {
      if (!(statement.id.length > 0)) {
        valid = false;
      }
      if (!validateActor(statement.actor)) {
        valid = false;
      }
      if (!validateVerb(statement.verb)) {
        valid = false;
      }
      if (!validateObject(statement.object)) {
        valid = false;
      }
      if (statement.result != null) {
        if (!validateResult(statement.result)) {
          valid = false;
        }
      }
      if (statement.context != null) {
        if (!validateContext(statement)) {
          valid = false;
        }
      }
      if (statement.timestamp != null) {
        if (!validateISO8601(statement.timestamp)) {
          valid = false;
        }
      }
      if (statement.authority != null) {
        if (!validateAuthority(statement.authority)) {
          valid = false;
        }
      }
      if (statement.version != null) {
        if (!validateVersion(statement.version)) {
          valid = false;
        }
      }
    }
    if (typeof cb === "function") {
      cb(valid);
    }
    return valid;
  },
  validateActor: function(actor, cb) {
    var agent, result, valid, _i, _len, _ref;
    valid = true;
    if (actor.objectType === "Group") {
      result = validateAgent(actor);
      if (result === false && actor.member.length === 0) {
        valid = false;
      }
      _ref = actor.member;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        agent = _ref[_i];
        if (!validateAgent(agent)) {
          valid = false;
        }
        if (agent.objectType === "Group") {
          valid = false;
        }
        if (result) {
          if ((actor.mbox != null) && actor.mbox === agent.mbox) {
            valid = false;
          }
          if ((actor.mbox_sha1sum != null) && actor.mbox_sha1sum === agent.mbox_sha1sum) {
            valid = false;
          }
          if ((actor.openid != null) && actor.openid === agent.openid) {
            valid = false;
          }
          if ((actor.account != null) && actor.account === agent.account) {
            valid = false;
          }
        }
      }
    } else {
      if (!validateAgent(actor)) {
        valid = false;
      }
    }
    if (typeof cb === "function") {
      cb(valid);
    }
    return valid;
  },
  validateAgent: function(agent, cb) {
    var IFICount, agentSchema, result, valid;
    valid = true;
    agentSchema = schema({
      objectType: {
        type: 'string',
        required: false
      },
      name: {
        type: 'string',
        required: false
      },
      mbox: {
        type: 'string',
        required: false,
        match: _regexes.email
      },
      mbox_sha1sum: {
        type: 'string',
        required: false,
        match: _regexes.SHA1
      },
      openid: {
        type: 'string',
        required: false
      },
      account: {
        required: false
      }
    });
    result = statementSchema.validate(agent);
    if (result.errors.length > 0) {
      valid = false;
    }
    IFICount = 0;
    if (statement.actor.mbox != null) {
      IFICount++;
    }
    if (statement.actor.mbox_sha1sum != null) {
      IFICount++;
    }
    if (statement.actor.openid != null) {
      IFICount++;
    }
    if (statement.actor.account != null) {
      IFICount++;
    }
    if (IFICount !== 1) {
      valid = false;
    }
    if (typeof cb === "function") {
      cb(valid);
    }
    return valid;
  },
  validateVerb: function(verb, cb) {
    var result, valid, verbSchema;
    verbSchema = schema({
      id: {
        type: 'string',
        required: true
      },
      display: {
        required: false
      }
    });
    result = verbSchema.validate(verb);
    valid = result.errors.length === 0;
    if (!validateLanguageMap(verb.display)) {
      valid = false;
    }
    if (typeof cb === "function") {
      cb(valid);
    }
    return valid;
  },
  validateLanguageMap: function(map, cb) {
    var key, valid, value;
    valid = true;
    for (key in map) {
      value = map[key];
      if (!RFC5646.test(key)) {
        valid = false;
      }
    }
    if (typeof cb === "function") {
      cb(valid);
    }
    return valid;
  },
  validateObject: function(object, cb) {
    var valid;
    valid = true;
    if (object.objectType === "Agent" || object.objectType === "Group") {
      if (!validateActor(object)) {
        valid = false;
      }
    } else if (object.objectType === "StatementRef") {
      if (object.id == null) {
        valid = false;
      }
    } else if (object.objectType === "SubStatement") {
      if (!validateStatement(object)) {
        valid = false;
      }
    } else if (object.objectType === "Activity" || (object.objectType == null)) {
      if (!validateActivity(object)) {
        valid = false;
      }
    } else {
      valid = false;
    }
    if (typeof cb === "function") {
      cb(valid);
    }
    return valid;
  },
  validateActivity: function(activity, cb) {
    var activitySchema, i, result, valid, _i, _len, _ref;
    activitySchema = schema({
      id: {
        type: 'string',
        required: true
      },
      definition: {
        required: false,
        name: {
          type: 'object',
          required: false
        },
        description: {
          type: 'object',
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
          type: 'object',
          required: false
        },
        choices: {
          type: 'object',
          required: false
        },
        scale: {
          type: 'object',
          required: false
        },
        source: {
          type: 'object',
          required: false
        },
        target: {
          type: 'object',
          required: false
        },
        steps: {
          type: 'object',
          required: false
        },
        extensions: {
          type: 'object',
          required: false
        }
      }
    });
    result = activitySchema.validate(activity);
    valid = result.errors.length === 0;
    if (activity.definition != null) {
      if (activity.definition.name != null) {
        if (!validateLanguageMap(activity.definition.name)) {
          valid = false;
        }
      }
      if (activity.definition.description != null) {
        if (!validateLanguageMap(activity.definition.description)) {
          valid = false;
        }
      }
      if (activity.definition.type === "http://adlnet.gov/expapi/activities/cmi.interaction") {
        switch (activity.definition.interactionType) {
          case "true-false":
            if (!((activity.definition.correctResponsesPattern != null) && activity.definition.correctResponsesPattern.length > 0)) {
              valid = false;
            }
            _ref = activity.definition.correctResponsesPattern;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              i = _ref[_i];
              if (!(i === "true" || i === "false")) {
                valid = false;
              }
            }
            break;
          case "choice":
            if (!(activity.definition.correctResponsesPattern.length > 0 && activity.definition.choices.length > 0)) {
              valid = false;
            }
            break;
          case "fill-in":
            if (!(activity.definition.correctResponsesPattern.length > 0)) {
              valid = false;
            }
            break;
          case "long-fill-in":
            if (!(activity.definition.correctResponsesPattern.length > 0)) {
              valid = false;
            }
            break;
          case "matching":
            if (!(activity.definition.correctResponsesPattern.length > 0 && activity.definition.source.length > 0 && activity.definition.target.length > 0 && activity.definition.source.length === activity.definition.target.length)) {
              valid = false;
            }
            break;
          case "performance":
            if (!(activity.definition.correctResponsesPattern.length > 0 && activity.definition.steps.length > 0)) {
              valid = false;
            }
            break;
          case "sequencing":
            if (!(activity.definition.correctResponsesPattern.length > 0 && activity.definition.choices.length > 0)) {
              valid = false;
            }
            break;
          case "likert":
            if (!(activity.definition.correctResponsesPattern.length > 0 && activity.definition.scale.length > 0)) {
              valid = false;
            }
            break;
          case "numeric":
            if (!(activity.definition.correctResponsesPattern.length > 0)) {
              valid = false;
            }
            break;
          case "other":
            if (!(activity.definition.correctResponsesPattern.length > 0)) {
              valid = false;
            }
            break;
          default:
            valid = false;
        }
      }
    }
    if (typeof cb === "function") {
      cb(valid);
    }
    return valid;
  },
  validateResult: function(result, cb) {
    var activitySchema, r, valid;
    activitySchema = schema({
      score: {
        type: 'object',
        required: false,
        scaled: {
          type: 'number',
          required: false
        },
        raw: {
          type: 'number',
          required: false
        },
        min: {
          type: 'number',
          required: false
        },
        max: {
          type: 'number',
          required: false
        }
      },
      success: {
        type: 'boolean',
        required: false
      },
      completion: {
        type: 'boolean',
        required: false
      },
      response: {
        type: 'string',
        required: false
      },
      duration: {
        type: 'string',
        required: false,
        match: _regexes.ISO8601
      },
      extensions: {
        type: 'object',
        required: false
      }
    });
    r = resultSchema.validate(result);
    valid = r.errors.length === 0;
    if (valid) {
      if (result.score) {
        if ((result.score.scaled != null) && (result.score.scaled < -1 || result.score.scaled > 1)) {
          valid = false;
        }
        if ((result.score.min != null) && (result.score.max != null) && result.score.min > result.score.max) {
          valid = false;
        }
        if ((result.score.raw != null) && (result.score.max != null) && result.score.raw > result.score.max) {
          valid = false;
        }
        if ((result.score.raw != null) && (result.score.min != null) && result.score.raw < result.score.min) {
          valid = false;
        }
      }
    }
    if (typeof cb === "function") {
      cb(valid);
    }
    return valid;
  },
  validateISO8601: function(date, cb) {
    var valid;
    valid = _regexes.ISO8601.test(date);
    if (typeof cb === "function") {
      cb(valid);
    }
    return valid;
  },
  validateContext: function(statement, cb) {
    var valid;
    valid = true;
    if (typeof cb === "function") {
      cb(valid);
    }
    return valid;
  },
  validateVersion: function(version, cb) {
    var valid;
    valid = version.indexOf("1.0.") === 0;
    if (typeof cb === "function") {
      cb(valid);
    }
    return valid;
  },
  validateAuthority: function(version, cb) {
    var valid;
    valid = true;
    if (typeof cb === "function") {
      cb(valid);
    }
    return valid;
  },
  _regexes: {
    SHA1: /\b([a-f0-9]{40})\b/,
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    ISO8601: /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/,
    RFC5646: /^(((?<language>([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-(?<script>[A-Za-z]{4}))?(-(?region>[A-Za-z]{2}|[0-9]{3}))?(-(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-(?<extension>[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8}+))*(-(?<privateUse>x(-[A-Za-z0-9]{1,8})+))?)|(?<privateUse>x(-[A-Za-z0-9]{1,8})+)|(?<grandfathered>(en-GB-oed|i-ami|i-bnn|i-defaulti-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-aulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)))$/
  }
};

//# sourceMappingURL=index.js.map
