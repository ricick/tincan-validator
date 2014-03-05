# Tincan Validator

## Installation
```
npm install tincan-validator
```

## Usage
```
var validator = require("tincan-validator");
var errors = validator.validateStatement(myStatement);
```

## Developing
```
npm install
grunt test
grunt build
```

## Todo
- validate statement context
- validate statement authority
- validate states
- validate activities
- validate agents
- descriptions for all errors
- add some failure tests