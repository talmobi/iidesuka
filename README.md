#  いいですか iidesuka - simple field validator

## Simple to use
```bash
var iidesuka = require( 'iidesuka' )

var req = {
  body: {
    // userID: 'foo',
    userIDs: [ { id: 'foo' }, { id: 'bar' } ]
  }
}

var err = (
  iidesuka( req )
  .typeof( 'body', 'object', 'request body missing' )
  .typeof( 'body.userID', 'string', 'userID is not a string' )
  .instanceof( 'body.userIDs', Array, 'userIDs is not an array' )
  .ne( 'body.userIDs.length', 0, 'userIDs array is empty' )
  .forEach( 'body.userIDs' )
    .e( 'id', 'foo', 'id was not foo' )
    .done()
  .end()
)

if ( err ) console.error( err.toString() )
```

## sample output
```
Invalid fields:
  typeof body.userID !== string: userID is not a string
  id not equal: id was not foo
```

# About
Basic object field validator with simple and descriptive errors.

# Why
To easily describe what you're looking for and easy to understand
error messages for when things go wrong.

`assert` e.g. throws errors that you need to catch and the stacktraces
aren't easy to understand or suitable for sending back to the user of
an API.

# How
Using plain old JavaScript.

# Alternatives
There's a bunch of validators and verifiers on npm. This one is intended
to be really simple.

# Test
```bash
npm test
```

