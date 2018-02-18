module.exports = iidesuka

var debugging = false

function log () {
  if ( debugging ) {
    console.log.apply( this, arguments )
  }
}

function iidesuka ( source ) {
  var state = {
    level: 0,
    source: source,
    tasks: []
  }

  var api = new Error()

  // Object.defineProperty( api, 'message', {
  //   value: ( 'iidesuka was not finished; did you call `.end()`?' )
  // } )

  api.message = ( 'iidesuka was not finished; did you call `.end()`?' )

  api.forEach = function ( query, detail ) {
    state.level++

    state.tasks.push( {
      type: 'forEach',
      args: [ query, detail ]
    } )

    return api
  }

  api.end = function () {
    if ( state.level === 0 ) {
      return finish()
    } else {
      state.level--

      state.tasks.push( {
        type: 'end'
      } )

      return api
    }
  }

  // backwards compatability
  api.done = api.end
  api.finish = api.end

  api.nobail = function () {
    state.tasks.push( {
      type: 'nobail'
    } )

    return api
  }

  api.bail = function () {
    state.tasks.push( {
      type: 'bail'
    } )

    return api
  }

  function finish () {
    var errors = []

    var stack = []

    function getTopStack() {
      if ( stack.length > 0 ) {
        return stack[ stack.length - 1 ]
      }

      return undefined
    }

    var shouldBail = false

    var task
    var i = 0
    for ( i = 0; i < state.tasks.length; ++i ) {
      log( 'task index: ' + i  + ' / ' + state.tasks.length )

      task = state.tasks[ i ]

      var target = source

      if ( stack.length > 0 ) {
        log( 'has stack' )

        var s = stack[ stack.length - 1 ]
        log( s )
        target = s.target[ s.index ]

        if ( s && s.shouldBail && errors.length > s.errorsStartedWith ) {
          console.log( 'bailing from loop' )
          break
        }

        if ( s.index >= s.target.length ) {
          // loop finished on the stack
          i = s.endIndex
          stack.pop()
          log( 'stack popped to endIndex: ' + s.endIndex )
          continue
        }
      } else {
        if ( shouldBail && errors.length > 0 ) {
          console.log( 'bailing iidesuka' )
          break
        }
      }

      log( 'task type: ' + task.type )

      switch ( task.type ) {
        case 'nobail':
          var s = getTopStack()
          if ( s ) {
            s.shouldBail = false
          } else {
            shouldBail = false
          }
          break

        case 'bail':
          var s = getTopStack()
          if ( s ) {
            s.shouldBail = true
          } else {
            shouldBail = true
          }
          break

        case 'forEach':
          var [ query, detail ] = task.args

          var list = dottribute( target, query )

          if ( ! ( list instanceof Array ) ) {
            errors.push(
              '.forEach ' + query + ' was not an Array'
            )

            while ( task && task.type !== 'end' ) {
              task = state.tasks[ ++i ]
            }

            if ( task && task.type === 'end' ) {
              continue
            } else {
              return api
            }
          }

          var s = getTopStack()
          var q = ''

          if ( s && s.trace ) {
            q = s.trace + '[' + s.index + ']'
          }

          if ( query !== '.' && query ) {
            if ( query[ 0 ] === '.' ) {
              q += query
            } else {
              q += '.' + query
            }
          }

          stack.push( {
            // source: target,
            trace: q,
            startIndex: i,
            index: 0,
            target: dottribute( target, query ),
            shouldBail: true, // bail by default from loops
            errorsStartedWith: errors.length
          } )

          log( list )

          log( 'stack pushed' )

          break

        case 'end':
          var s = getTopStack()
          s.endIndex = i
          log( 'set endIndex: ' + s.endIndex )
          i = s.startIndex
          s.index++
          log( 'resetting task index to stack startIndex' )
          break

        case 'typeof':
          var err = _typeof( task, target, getTopStack() )
          if ( err ) errors.push( err )
          break

        case 'instanceof':
          var err = _instanceof( task, target )
          if ( err ) errors.push( err )
          break

        case 'e':
          var err = _e( task, target, getTopStack() )
          if ( err ) errors.push( err )
          break

        case 'ne':
          var err = _ne( task, target, getTopStack() )
          if ( err ) errors.push( err )
          break

        case 'gt':
          var err =  _gt( task, target, getTopStack() )
          if ( err ) errors.push( err )
          break

        case 'gte':
          var err =  _gte( task, target, getTopStack() )
          if ( err ) errors.push( err )
          break

        case 'lt':
          var err =  _lt( task, target, getTopStack() )
          if ( err ) errors.push( err )
          break

        case 'lte':
          var err =  _lte( task, target, getTopStack() )
          if ( err ) errors.push( err )
          break

        default:
          throw new Error( 'iidesuka unknown task type: ' + type )
      }
    }

    // no errors, everything is OK
    if ( errors.length === 0 ) return undefined

    var err = new Error()

    err.message = 'Error (iidesuka) invalid fields: \n'

    errors.forEach( function ( msg ) {
      err.message += ( '  ' + msg.trim() + '\n' )
    } )

    err.toString = function () {
      return err.message
    }

    return err
  }

  api.typeof = function ( query, type, detail ) {
    state.tasks.push( {
      type: 'typeof',
      args: [ query, type, detail ]
    } )

    return api
  }

  api.instanceof = function ( query, instance, detail ) {
    state.tasks.push( {
      type: 'instanceof',
      args: [ query, instance, detail ]
    } )

    return api
  }

  api.e = function ( query, value, detail ) {
    state.tasks.push( {
      type: 'e',
      args: [ query, value, detail ]
    } )

    return api
  }

  api.ne = function ( query, value, detail ) {
    state.tasks.push( {
      type: 'ne',
      args: [ query, value, detail ]
    } )

    return api
  }

  api.gt = function ( query, number, detail ) {
    state.tasks.push( {
      type: 'gt',
      args: [ query, number, detail ]
    } )

    return api
  }

  api.gte = function ( query, number, detail ) {
    state.tasks.push( {
      type: 'gte',
      args: [ query, number, detail ]
    } )

    return api
  }

  api.lt = function ( query, number, detail ) {
    state.tasks.push( {
      type: 'lt',
      args: [ query, number, detail ]
    } )

    return api
  }

  api.lte = function ( query, number, detail ) {
    state.tasks.push( {
      type: 'lte',
      args: [ query, number, detail ]
    } )

    return api
  }

  return api
}

function dottribute ( source, query ) {
  if ( typeof query !== 'string' ) {
    return source
  }

  var t = source

  if ( !query || query === '.' ) {
    return t
  }

  var attributes = query.split( '.' )

  if ( !t ) return t

  attributes.forEach( function ( attr ) {
    if (
      ( t != null ) &&
      ( typeof t[ attr ] !== 'undefined' )
    ) {
      t = t[ attr ]
    } else {
      return undefined
    }
  } )

  if ( t === source ) return undefined

  return t
}

function _typeof ( task, target, stack ) {
  var [ query, type, detail ] = task.args

  var t = dottribute( target, query )

  if ( typeof t === type ) return undefined

  var q = ''

  if ( stack && stack.trace ) {
    q = stack.trace + '[' + stack.index + ']'
  }

  if ( query !== '.' && query ) {
    if ( query[ 0 ] === '.' ) {
      q += query
    } else {
      q += '.' + query
    }
  }

  var msg = (
    '.typeof ' + q + ' is not: ' + type
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _instanceof ( task, target, stack ) {
  var [ query, instance, detail ] = task.args

  var t = dottribute( target, query )

  if ( t instanceof instance ) return undefined

  var q = ''

  if ( stack && stack.trace ) {
    q = stack.trace + '[' + stack.index + ']'
  }

  if ( query !== '.' && query ) {
    if ( query[ 0 ] === '.' ) {
      q += query
    } else {
      q += '.' + query
    }
  }

  var msg = (
    '.instanceof ' + q + ' is not: ' + instance
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _e ( task, target, stack ) {
  var [ query, value, detail ] = task.args

  var t = dottribute( target, query )

  if ( t === value ) return undefined

  var q = ''

  if ( stack && stack.trace ) {
    q = stack.trace + '[' + stack.index + ']'
  }

  if ( query !== '.' && query ) {
    if ( query[ 0 ] === '.' ) {
      q += query
    } else {
      q += '.' + query
    }
  }

  var msg = (
    '.e ' + q + ' is not equal to ' + value
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _ne ( task, target, stack ) {
  var [ query, value, detail ] = task.args

  var t = dottribute( target, query )

  if ( t !== value ) return undefined

  var q = ''

  if ( stack && stack.trace ) {
    q = stack.trace + '[' + stack.index + ']'
  }

  if ( query !== '.' && query ) {
    if ( query[ 0 ] === '.' ) {
      q += query
    } else {
      q += '.' + query
    }
  }

  var msg = (
    '.ne ' + q + ' is equal to ' + value
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _gt ( task, target, stack ) {
  var [ query, number, detail ] = task.args

  var t = dottribute( target, query )

  if ( t > number ) return undefined

  var q = ''

  if ( stack && stack.trace ) {
    q = stack.trace + '[' + stack.index + ']'
  }

  if ( query !== '.' && query ) {
    if ( query[ 0 ] === '.' ) {
      q += query
    } else {
      q += '.' + query
    }
  }

  var msg = (
    '.gt ' + q + ' is not greater than: ' + number + ', was ' + t
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _gte ( task, target, stack ) {
  var [ query, number, detail ] = task.args

  var t = dottribute( target, query )

  if ( t >= number ) return undefined

  var q = ''

  if ( stack && stack.trace ) {
    q = stack.trace + '[' + stack.index + ']'
  }

  if ( query !== '.' && query ) {
    if ( query[ 0 ] === '.' ) {
      q += query
    } else {
      q += '.' + query
    }
  }

  var msg = (
    '.gte ' + q + ' is not greater than or equal to: ' + number + ', was ' + t
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _lt ( task, target, stack ) {
  var [ query, number, detail ] = task.args

  var t = dottribute( target, query )

  if ( t < number ) return undefined

  var q = ''

  if ( stack && stack.trace ) {
    q = stack.trace + '[' + stack.index + ']'
  }

  if ( query !== '.' && query ) {
    if ( query[ 0 ] === '.' ) {
      q += query
    } else {
      q += '.' + query
    }
  }

  var msg = (
    '.lt ' + q + ' is not less than: ' + number + ', was ' + t
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _lte ( task, target, stack ) {
  var [ query, number, detail ] = task.args

  var t = dottribute( target, query )

  if ( t <= number ) return undefined

  var q = ''

  if ( stack && stack.trace ) {
    q = stack.trace + '[' + stack.index + ']'
  }

  if ( query !== '.' && query ) {
    if ( query[ 0 ] === '.' ) {
      q += query
    } else {
      q += '.' + query
    }
  }

  var msg = (
    '.lte ' + q + ' is not less than or equal to: ' + number + ', was ' + t
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function test () {
  var data = {
    name: 'giraffe',
    list: [ 2, 3, 1 ],
    list2: [
      { val: 1 },
      { val: 2 },
      { val: 3 }
    ],
    list3: [
      [ { val: 11 } ],
      [ { val: 22 } ],
      [ { val: 33 } ]
    ],
    list4: [
      [
        [
          1,
          2,
          3
        ]
      ]
    ]
  }

  var err = (
    iidesuka( data )
    .e( 'name', 'giraffe' )
    .forEach( 'list' )
      .gt( '.', 0 )
      .end()
    .forEach( 'list2' )
      .gt( 'val', 0 )
      .end()

    .forEach( 'list3' )
      .nobail()
      .forEach( '.' )
        .nobail()
        .gt( 'val', 10 )
        .end()
      .end()

    .forEach( 'list4' )
      .nobail()
      .forEach( '.' )
        .forEach( '.' )
          .gt( '.', 2 )
          .gt( '.', 0 )
          .gt( '.', 2 )
          .end()
        .end()
      .end()

    .end()
  )

  // var err = (
  //   iidesuka( data )
  //   .e( 'name', 'giraffe' )
  //   .forEach( 'list2' )
  //     .gt( 'val', 0 )
  //     .end()
  //   .forEach( 'list3' )
  //     .nobail()
  //     .forEach( '.' )
  //       .nobail()
  //       .gt( 'val', 8 )
  //       .end()
  //     .end()
  //   .end()
  // )

  log( ' ======== ' )
  log( err + '' )
}
