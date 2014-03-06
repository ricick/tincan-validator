# Tincan Validator
Validates Tincan API statements, activities, agents, and states

## Installation
```
npm install tincan-validator
```

## Usage
Can be used sync or async style.

```
var validator = require("tincan-validator");

var statementErrors = validator.validateStatement(myStatement);
console.log(statementErrors);

validator.validateActivity(myActivity, function(activityErrors){
    console.log(activityErrors);
});
```
### Available methods

- validateStatement(statement, callback)
- validateAgent(agent, callback)
- validateActivity(activity, callback)
- validateState(state, callback) //TODO

### Additional methods
These are used internally by the above methods, but are available if you need them.

- validateActor(actor, callback)
- validateGroup(group, callback)
- validateVerb(verb, callback)
- validateLanguageMap(languageMap, callback)
- validateObject(object, callback)
- validateResult(result, callback)
- validateISO8601(timestamp, callback)
- validateContext(context, callback)
- validateVersion(version, callback)
- validateAuthority(authority, callback)

## Developing
```
npm install
grunt test
grunt build
```

Development is all coffeescript located in /src.

Tests are located in /test with mock validation objects in /test/mocks

Any contributions should pass all existing unit tests before a pull request will be accepted.

Ideally unit tests should be written for contributions

## Todo
- validate statement context
- validate statement authority
- validate states
- descriptions for all errors
- add some failure tests