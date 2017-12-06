var iidesuka = require( './dist/iidesuka.min.js' )

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

// console.error output
// Invalid fields:
//   id not equal: id was not foo
