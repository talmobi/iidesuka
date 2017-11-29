function validate ( obj, opts ) {
  var api = {
    _messages: []
  }

  if ( typeof obj !== 'object' ) throw new Error( 'obj must of of type "object"' )

  opts = opts || {}
  if ( opts.bail ) api._bail = true

  api.typeof = function ( attrs, type, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var t = dottribute( obj, attrs )
    if ( typeof t !== type ) {
      api._messages.push( 'typeof ' + attrs + ' !== ' + type + ': ' + message )
    }
    return api
  }

  api.instanceof = function ( attrs, instance, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var t = dottribute( obj, attrs )
    if ( !t ) {
      api._messages.push( 'instanceof ' + attrs + ' is ' + t + ': ' + message )
    } else {
      if ( !( t instanceof instance ) ) {
        api._messages.push( attrs + ' not instanceof: ' + message )
      }
    }
    return api
  }

  api.gt = function ( attrs, number, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var t = dottribute( obj, attrs )
    if ( typeof t !== 'number' ) {
      api._messages.push( attrs + ' is not a number: ' + message )
    } else {
      if ( t > number ) {
      } else {
        api._messages.push( attrs + ' greater than ' + number + ': ' + message )
      }
    }
    return api
  }

  api.gte = function ( attrs, number, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var t = dottribute( obj, attrs )
    if ( typeof t !== 'number' ) {
      api._messages.push( attrs + ' is not a number: ' + message )
    } else {
      if ( t >= number ) {
      } else {
        api._messages.push( attrs + ' greater than or equal to ' + number + ': ' + message )
      }
    }
    return api
  }

  api.lt = function ( attrs, number, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var t = dottribute( obj, attrs )
    if ( typeof t !== 'number' ) {
      api._messages.push( attrs + ' is not a number: ' + message )
    } else {
      if ( t < number ) {
      } else {
        api._messages.push( attrs + ' less than ' + number + ': ' + message )
      }
    }
    return api
  }

  api.lte = function ( attrs, number, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var t = dottribute( obj, attrs )
    if ( typeof t !== 'number' ) {
      api._messages.push( attrs + ' is not a number: ' + message )
    } else {
      if ( t <= number ) {
      } else {
        api._messages.push( attrs + ' less than or equal to' + number + ': ' + message )
      }
    }
    return api
  }

  api.e = function ( attrs, value, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var t = dottribute( obj, attrs )
    if ( t !== value ) {
      api._messages.push( attrs + ' not equal: ' + message )
    }
    return api
  }

  api.ne = function ( attrs, value, message ) {
    if ( api._bail && api._messages.length > 0 ) return api

    var t = dottribute( obj, attrs )
    if ( t === value ) {
      api._messages.push( attrs + ' equal: ' + message )
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

    var message = 'Invalid fields: \n'
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

  return api
}

function dottribute ( obj, attrs ) {
  var split = attrs.split( '.' )

  var t = obj

  for ( var i = 0; i < split.length; ++i ) {
    var key = split[ i ]
    if (
      ( typeof t === 'object' ) &&
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

module.exports = validate
