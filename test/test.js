const path = require( 'path' )

const test = require( 'tape' )

var iidesuka

if ( process.env.TEST_TARGET === 'source' ) {
  console.log( 'testing source index.js' )
  iidesuka = require( path.join( __dirname, '../index.js' ) )
}

if ( process.env.TEST_TARGET === 'dist' ) {
  console.log( 'testing dist/iidesuka.js' )
  iidesuka = require( path.join( __dirname, '../dist/iidesuka.js' ) )
}

if ( process.env.TEST_TARGET === 'distmin' ) {
  console.log( 'testing dist/iidesuka.min.js' )
  iidesuka = require( path.join( __dirname, '../dist/iidesuka.min.js' ) )
}

test( 'test target selected', function ( t ) {
  t.ok( iidesuka, 'test target selected' )

  if ( !iidesuka ) {
    t.comment( 'select test target by setting env variable TEST_TARGET=$target' )
    t.comment( 'available targets: ' + 'source, dist, distmin' )
    process.exit( 1 )
  }

  t.end()
} )

test( 'test empty object', function ( t ) {
  var o = {}
  var err = iidesuka( o ).end()
  t.equal( err, undefined )
  t.end()
} )

test( 'test non objects', function ( t ) {
  var err = ''

  var o = function () {}
  o.foo = 5
  o.bar = 11

  var err = (
    iidesuka( o )
    .gt( 'bar', 10, 'bar length was 10 or smaller' )
    .gt( 'foo', 10, 'foo length was 10 or smaller' )
    .end()
  ).toString()

  t.ok(
    err.indexOf( 'bar length was 10 or smaller' ) === -1,
    'OK no bar errors found!'
  )

  t.ok(
    err.indexOf( 'foo length was 10 or smaller' ) > 0,
    'OK foo errors found!'
  )

  var s = 'string'

  var err = (
    iidesuka( s )
    .lt( 'length', 10, 'string length greater than 10' )
    .gt( 'length', 10, 'string length less than 10' )
    .end()
  ).toString()

  t.ok(
    err.indexOf( 'string length greater than 10' ) === -1,
    'OK foo errors found!'
  )

  t.ok(
    err.indexOf( 'string length less than 10' ) > 0,
    'OK no bar errors found!'
  )

  var err = (
    iidesuka()
    .lt( 'length', 10, 'string length greater than 10' )
    .gt( 'length', 10, 'string length less than 10' )
    .end()
  ).toString()

  t.ok(
    err,
    'OK errors found!'
  )

  var err = (
    iidesuka( null )
    .lt( 'length', 10, 'string length greater than 10' )
    .gt( 'length', 10, 'string length less than 10' )
    .end()
  ).toString()

  t.ok(
    err,
    'OK errors found!'
  )

  t.end()
} )

test( 'test successful typeof', function ( t ) {
  var user = {
    name: 'blinky'
  }

  var err = (
    iidesuka( user )
    .typeof( 'name', 'string', 'xaxa' )
    .typeof( 'does-not-exist', 'undefined', 'xaxa' )
    .end()
  )
  t.equal( err, undefined )
  t.end()
} )

test( 'test failed typeof', function ( t ) {
  var user = {
    name: 'blinky'
  }

  var err = iidesuka( user ).typeof( 'name', 'object', 'xaxa' ).end()

  t.ok( err.message.indexOf( 'xaxa' ) > 0 )

  t.end()
} )

test( 'test successful instanceof', function ( t ) {
  var user = {
    names: [ 'inky', 'blinky', 'clyde' ]
  }

  var err = (
    iidesuka( user )
    .instanceof( 'names', Array, 'xaxa' )
    .instanceof( 'names', Object, 'xaxa' )
    .end()
  )
  t.equal( err, undefined )
  t.end()
} )

test( 'test failed instanceof', function ( t ) {
  var user = {
    names: [ 'inky', 'blinky', 'clyde' ]
  }

  var err = iidesuka( user ).instanceof( 'names', String, 'xaxa' ).end()
  t.ok( err.message.indexOf( 'xaxa' ) > 0 )
  t.end()
} )

test( 'test successful e, ne, equals, notEquals', function ( t ) {
  var user = {
    name: 'pinky',
    names: [ 'inky', 'blinky', 'clyde' ],
    animal: { type: 'giraffe' }
  }

  var err = (
    iidesuka( user )
    .e( 'name', 'pinky', 'xaxa' )
    .ne( 'name', 'sheep', 'xaxa' )
    .e( 'names.length', 3, 'xaxa' )
    .ne( 'names.length', 2, 'xaxa' )
    .e( 'animal.type', 'giraffe', 'xaxa' )
    .ne( 'animal.type', 'whale', 'xaxa' )
    .e( 'animal', user.animal, 'xaxa' )
    .ne( 'animal', { type: 'giraffe' }, 'xaxa' )
    .end()
  )
  t.equal( err, undefined )
  t.end()
} )

test( 'test failed e, ne, equals, notEquals', function ( t ) {
  var user = {
    name: 'pinky',
    names: [ 'inky', 'blinky', 'clyde' ],
    animal: { type: 'giraffe' }
  }

  var err = (
    iidesuka( user )
    .e( 'name', 'inky', 'xaxaONE' )
    .e( 'names.length', 2, 'xaxaTWO' )
    .ne( 'name', 'pinky', 'xaxaTHREE' )
    .ne( 'names.length', 3, 'xaxaFOUR' )
    .ne( 'animal.type', 'giraffe', 'xaxaFIVE' )
    .e( 'animal.type', 'whale', 'xaxaSIX' )
    .ne( 'animal', user.animal, 'xaxaSEVEN' )
    .e( 'animal', { type: 'giraffe' }, 'xaxaEIGHT' )
    .end()
  )

  t.ok( err.message.indexOf( 'xaxaONE' ) > 0 )
  t.ok( err.message.indexOf( 'xaxaTWO' ) > 0 )
  t.ok( err.message.indexOf( 'xaxaTHREE' ) > 0 )
  t.ok( err.message.indexOf( 'xaxaFOUR' ) > 0 )
  t.ok( err.message.indexOf( 'xaxaFIVE' ) > 0 )
  t.ok( err.message.indexOf( 'xaxaSIX' ) > 0 )
  t.ok( err.message.indexOf( 'xaxaSEVEN' ) > 0 )
  t.ok( err.message.indexOf( 'xaxaEIGHT' ) > 0 )

  t.end()
} )

test( 'test successful gt, gte, lt, lte', function ( t ) {
  var user = {
    name: 'pinky',
    names: [ 'inky', 'blinky', 'clyde' ],
    hundren: 100
  }

  var err = (
    iidesuka( user )
    .gte( 'hundren', 100, 'xaxa' )
    .gte( 'hundren', 99, 'xaxa' )
    .gt( 'hundren', 99, 'xaxa' )
    .lte( 'hundren', 100, 'xaxa' )
    .lte( 'hundren', 101, 'xaxa' )
    .lt( 'hundren', 101, 'xaxa' )
    .end()
  )
  t.equal( err, undefined )
  t.end()
} )

test( 'test failed gt, gte, lt, lte', function ( t ) {
  var user = {
    name: 'pinky',
    names: [ 'inky', 'blinky', 'clyde' ],
    hundren: 100
  }

  var err = (
    iidesuka( user )
    .gte( 'hundren', 100, 'xaxa' )
    .gte( 'hundren', 99, 'xaxa' )
    .gte( 'hundren', 101, 'fail1' )
    .gt( 'hundren', 99, 'xaxa' )
    .gt( 'hundren', 101, 'fail2' )
    .lte( 'hundren', 100, 'xaxa' )
    .lte( 'hundren', 101, 'xaxa' )
    .lte( 'hundren', 99, 'fail3' )
    .lt( 'hundren', 101, 'xaxa' )
    .lt( 'hundren', 99, 'fail4' )
    .lt( 'hundren', 'string', 'fail5' )
    .lt( 'hundren', {}, 'fail6' )
    .lt( 'hundren', [], 'fail7' )
    .lt( 'hundren', NaN, 'fail8' )
    .lt( 'hundren', undefined, 'fail9' )
    .lt( 'hundren', null, 'fail10' )
    .lt( 'hundren', Number, 'fail11' )
    .end()
  )

  t.ok( err.message.indexOf( 'fail1' ) > 0 )
  t.ok( err.message.indexOf( 'fail2' ) > 0 )
  t.ok( err.message.indexOf( 'fail3' ) > 0 )
  t.ok( err.message.indexOf( 'fail4' ) > 0 )
  t.ok( err.message.indexOf( 'fail5' ) > 0 )
  t.ok( err.message.indexOf( 'fail6' ) > 0 )
  t.ok( err.message.indexOf( 'fail7' ) > 0 )
  t.ok( err.message.indexOf( 'fail8' ) > 0 )
  t.ok( err.message.indexOf( 'fail9' ) > 0 )
  t.ok( err.message.indexOf( 'fail10' ) > 0 )
  t.ok( err.message.indexOf( 'xaxa' ) === -1 ) // only failures recorded

  t.end()
} )

test( 'test successful forEach', function ( t ) {
  var user = {
    name: 'pinky',
    list: [
      { name: 'inky', age: 45 },
      { name: 'blinky', age: 18 },
      { name: 'clyde', age: 20 }
    ]
  }

  var err = (
    iidesuka( user )
    .typeof( 'name', 'string', 'xaxa' )
    .e( 'name', 'pinky', 'xaxa' )
    .forEach( 'list' )
      .typeof( 'name', 'string', 'xaxa' )
      .typeof( 'age', 'number', 'xaxa' )
      .gte( 'name.length', 3, 'xaxa' )
      .gte( 'age', 18, 'xaxa' )
      .lte( 'age', 60, 'xaxa' )
      .done()
    .typeof( 'name', 'string', 'xaxa' )
    .e( 'name', 'pinky', 'xaxa' )
    .end()
  )
  t.equal( err, undefined )
  t.end()
} )

test( 'test successful forEach', function ( t ) {
  var user = {
    list: [
      { name: 'dave', age: 17 },
      { name: 'blinky', age: 18 },
      { name: 'dave', age: 20 }
    ]
  }

  var err = (
    iidesuka( user )
    .typeof( 'name', 'string', 'fail1' )
    .e( 'name', 'pinky', 'fail2' )
    .forEach( 'list' )
      .nobail()
      .typeof( 'name', 'string', 'xaxa' )
      .typeof( 'age', 'number', 'xaxa' )
      .e( 'name', 'dave', 'name was not "dave"' )
      .gte( 'age', 18, 'age was less than 18' )
      .done()
    .typeof( 'name', 'string', 'fail5' )
    .e( 'name', 'pinky', 'fail6' )
    .end()
  )

  t.ok( err.message.indexOf( 'fail1' ) > 0 )
  t.ok( err.message.indexOf( 'fail2' ) > 0 )
  t.ok( err.message.indexOf( 'name was not "dave"' ) > 0, 'name was not "dave"' )
  t.ok( err.message.indexOf( 'age was less than 18' ) > 0, 'age was less than 18' )
  t.ok( err.message.indexOf( 'fail5' ) > 0 )
  t.ok( err.message.indexOf( 'fail6' ) > 0 )
  t.ok( err.message.indexOf( 'xaxa' ) === -1, 'no other errors' )

  t.end()
} )

test.only( 'test nested nonexisting forEach', function ( t ) {
  var user = {
  }

  var err = (
    iidesuka( user )
    .instanceof( 'list', Array, 'fail1' )
    .forEach( 'list' )
      .typeof( 'name', 'string', 'xaxa' )
      .done()
    .end()
  )

  t.ok( err.message.indexOf( 'fail1' ) > 0, 'list was not instanceof Array' )
  t.ok( err.message.indexOf( 'xaxa' ) === -1, 'no items looped for non Array' )

  t.end()
} )

test( 'basic usecase', function ( t ) {
  var req = {
    body: {
      userID: 'foo',
      userIDs: [ 'foo', 'bar', 'zoo' ]
    }
  }

  var err = (
    iidesuka( req )
    .typeof( 'body', 'object', 'request body missing' )
    .typeof( 'body.userID', 'string', 'userID is not a string' )
    .instanceof( 'body.userIDs', Array, 'userIDs is not an array' )
    .ne( 'body.userIDs.length', 0, 'userIDs array is empty' )
    .end()
  )

  t.equal( err, undefined )

  t.end()
} )
