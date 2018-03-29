[![npm](https://img.shields.io/npm/v/iidesuka.svg?maxAge=3600&style=flat-square)](https://www.npmjs.com/package/iidesuka)
[![npm](https://img.shields.io/npm/l/iidesuka.svg?maxAge=3600&style=flat-square)](https://github.com/talmobi/iidesuka/blob/master/LICENSE)

#  いいですか iidesuka
simple field validator

## Easy to use
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
```
Invalid fields:
  typeof body.userID !== string: userID is not a string
  id not equal: id was not foo
```

## About
Basic object field validator with simple and descriptive errors.

## Why
To easily describe what you're looking for and easy to understand
error messages for when things go wrong.

`assert` e.g. throws errors that you need to catch and the stacktraces
aren't easy to understand or suitable for sending back to the user of
an API.

## How
Using plain old JavaScript.

## Alternatives
There's a bunch of validators and verifiers on npm. This one is intended
to be very basic and give easy to understand error outputs to users when things go wrong.

## Test
```bash
npm test
```

