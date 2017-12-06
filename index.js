var internalApi = {}

function iidesuka ( obj, opts ) {
  var api = {
    _messages: []
  }

  opts = opts || {}
  if ( opts.bail ) api._bail = true

  api.typeof = function ( attrs, type, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var msg = internalApi.typeof( obj, attrs, type, message )
    if ( msg ) {
      api._messages.push( msg )
    }

    return api
  }

  api.instanceof = function ( attrs, instance, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var msg = internalApi.instanceof( obj, attrs, instance, message )
    if ( msg ) {
      api._messages.push( msg )
    }

    return api
  }

  api.gt = function ( attrs, number, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var msg = internalApi.gt( obj, attrs, number, message )
    if ( msg ) {
      api._messages.push( msg )
    }

    return api
  }

  api.gte = function ( attrs, number, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var msg = internalApi.gte( obj, attrs, number, message )
    if ( msg ) {
      api._messages.push( msg )
    }

    return api
  }

  api.lt = function ( attrs, number, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var msg = internalApi.lt( obj, attrs, number, message )
    if ( msg ) {
      api._messages.push( msg )
    }

    return api
  }

  api.lte = function ( attrs, number, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var msg = internalApi.lte( obj, attrs, number, message )
    if ( msg ) {
      api._messages.push( msg )
    }

    return api
  }

  api.e = function ( attrs, value, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var msg = internalApi.e( obj, attrs, value, message )
    if ( msg ) {
      api._messages.push( msg )
    }

    return api
  }

  api.ne = function ( attrs, value, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var msg = internalApi.ne( obj, attrs, value, message )
    if ( msg ) {
      api._messages.push( msg )
    }

    return api
  }

  api.bail = function () {
    api._bail = true
  }

  api.end = function () {
    if ( api._messages.length === 0 ) {
      return undefined
    }

    var message = 'Error invalid fields: \n'
    api._messages.forEach( function ( msg ) {
      message += ( '  ' + msg.trim() + '\n' )
    } )

    var o = {
      message: message
    }

    o.toString = function () {
      return message
    }

    return o
  }

  api.forEach = function ( attrs ) {
    var subapi = {
      bail: true // bail on first array item that fails by default
    }

    var chains = []

    subapi.typeof = function () {
      chains.push( { fn: 'typeof', args: arguments } )
      return subapi
    }

    subapi.instanceof = function () {
      chains.push( { fn: 'instanceof', args: arguments } )
      return subapi
    }

    subapi.gt = function () {
      chains.push( { fn: 'gt', args: arguments } )
      return subapi
    }

    subapi.gte = function () {
      chains.push( { fn: 'gte', args: arguments } )
      return subapi
    }

    subapi.lt = function () {
      chains.push( { fn: 'lt', args: arguments } )
      return subapi
    }

    subapi.lte = function () {
      chains.push( { fn: 'lte', args: arguments } )
      return subapi
    }

    subapi.e = function () {
      chains.push( { fn: 'e', args: arguments } )
      return subapi
    }

    subapi.ne = function () {
      chains.push( { fn: 'ne', args: arguments } )
      return subapi
    }

    subapi.nobail = function () {
      subapi.bail = false // check every array element
      return subapi
    }

    var target = dottribute( obj, attrs )
    subapi.done = function () {
      if ( api._bail && api._messages.length > 0 ) return api

      if ( !( target instanceof Array ) ) {
        api._messages.push( 'forEach failed ' + attrs + ' is not an Array : ' + message )
        return api
      }

      var messages = []

      var item, i, j, chain, msg
      for ( i = 0; i < target.length; ++i ) {
        item = target[ i ]

        for ( j = 0; j < chains.length; ++j ) {
          chain = chains[ j ]
          msg = internalApi[ chain.fn ].apply( this, parseArgs( item, chain.args ) )
          if ( msg ) {
            messages.push( msg )
          }
        }

        if ( subapi.bail && messages.length !== 0 ) {
          // errors have occurred on this item -- skip the rest
          i = target.length
        }
      }

      // add the messages to the origin api
      api._messages = api._messages.concat( messages )

      return api
    }

    return subapi
  }

  return api
}

function parseArgs ( obj, args ) {
  return (
    [ obj ]
    .concat(
      Object.keys( args ).map( function ( key ) {
        return args[ key ]
      } )
    )
  )
}

function dottribute ( obj, attrs ) {
  var split = attrs.split( '.' )

  var t = obj

  for ( var i = 0; i < split.length; ++i ) {
    var key = split[ i ]
    if (
      ( t != null ) &&
      ( typeof t[ key ] !== 'undefined' )
    ) {
      t = t[ key ]
    } else {
      return undefined
    }
  }

  if ( t === obj ) return undefined

  return t
}

// typeof
internalApi.typeof = function _typeof ( obj, attrs, type, message ) {
  var t = dottribute( obj, attrs )

  if ( typeof t !== type ) {
    return ( 'typeof ' + attrs + ' !== ' + type + ': ' + message )
  }
}

// instanceof
internalApi.instanceof = function _instanceof ( obj, attrs, instance, message ) {
  var t = dottribute( obj, attrs )

  if ( !t ) {
    return ( 'instanceof ' + attrs + ' is ' + t + ': ' + message )
  } else {
    if ( !( t instanceof instance ) ) {
      return ( attrs + ' not instanceof: ' + message )
    }
  }
}

// greater than
internalApi.gt = function _gt ( obj, attrs, number, message ) {
  var t = dottribute( obj, attrs )

  if ( typeof t !== 'number' ) {
    return ( attrs + ' is not a number: ' + message )
  } else {
    if ( t > number ) {
    } else {
      return ( attrs + ' greater than ' + number + ': ' + message )
    }
  }
}

// greater than or equal
internalApi.gte = function _gte ( obj, attrs, number, message ) {
  var t = dottribute( obj, attrs )

  if ( typeof t !== 'number' ) {
    return ( attrs + ' is not a number: ' + message )
  } else {
    if ( t >= number ) {
    } else {
      return ( attrs + ' greater than or equal to ' + number + ': ' + message )
    }
  }
}

// less than
internalApi.lt = function _lt ( obj, attrs, number, message ) {
  var t = dottribute( obj, attrs )

  if ( typeof t !== 'number' ) {
    return ( attrs + ' is not a number: ' + message )
  } else {
    if ( t < number ) {
    } else {
      return ( attrs + ' less than ' + number + ': ' + message )
    }
  }
}

// less than or equal
internalApi.lte = function _lte ( obj, attrs, number, message ) {
  var t = dottribute( obj, attrs )

  if ( typeof t !== 'number' ) {
    return ( attrs + ' is not a number: ' + message )
  } else {
    if ( t <= number ) {
    } else {
      return ( attrs + ' less than or equal to' + number + ': ' + message )
    }
  }
}

// equal
internalApi.e = function _e ( obj, attrs, value, message ) {
  var t = dottribute( obj, attrs )

  if ( t !== value ) {
    return ( attrs + ' not equal: ' + message )
  }
}

// not equal
internalApi.ne = function _ne ( obj, attrs, value, message ) {
  var t = dottribute( obj, attrs )

  if ( t === value ) {
    return ( attrs + ' equal: ' + message )
  }
}

module.exports = iidesuka
