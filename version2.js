var internalApi = {}

function dottribute ( obj, attrs ) {
  if ( typeof attrs !== 'string' ) {
    return obj
  }

  var split = attrs.split( '.' )

  // special case when attrs is empty or single dot
  // assume direct reference instead of key name of object
  // TODO
  var empty = split.filter( function ( val ) {
    return val.trim()
  } )

  if ( empty.length === 0 ) {
    console.log( ' == empty == ' )
    console.log( obj )
    return obj
  }

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

function getState ( stack ) {
  var len = stack.length
  return stack[ len - 1 ]
}

function getPrevState ( stack ) {
  var len = stack.length
  return stack[ len - 2 ]
}

function iidesuka ( source, opts ) {
  var api = new Error()

  // Object.defineProperty( api, 'message', {
  //   value: ( 'iidesuka was not finished; did you call `.end()`?' )
  // } )

  api.message = ( 'iidesuka was not finished; did you call `.end()`?' )

  var stack = []
  var errors = []

  console.log( 'api instanceof Error: ' + (
      api instanceof Error
  ) )

  // initial state
  stack.push( {
    root: true,
    tasks: [],
    target: source,
    type: 'object',
    bail: false
  } )

  // TODO implement state machine?
  function finish () {
    // process all stacks
    console.log( 'finishing' )

    var errors = []

    stack.forEach( function ( val, ind, arr ) {
      var state = val
      var { tasks, target, type } = state

      switch ( type ) {
        case 'object':
          // apply tasks to only this object
          console.log( 'type object: ' + target )
          console.log( target )

          var shouldBail = false

          tasks.forEach( function ( task ) {
            if ( shouldBail ) return

            var err = handleTask( task )

            if ( err ) {
              errors.push( err )
              if ( state.bail ) shouldBail = true
            }
          } )

          break

        case 'array':
          // loop through each elememt in array
          // and apply tasks to each element
          console.log( 'type array: ' + target )
          console.log( target )

          var shouldBail = false

          if ( ! ( target instanceof Array ) ) {
            return errors.push(
              state.attrs + ' was not an array'
            )
          }

          var list = target
          list.forEach( function ( item, ind ) {
            if ( shouldBail ) return

            var _attrs = state.attrs + '[' + ind + ']'

            console.log( 'looping through list item: ' + _attrs )

            tasks.forEach( function ( task ) {
              console.log( item )
              console.log( task.attrs )

              var err = handleTask(
                Object.assign( {}, task, {
                  target: dottribute( item, task._attrs ),
                  attrs: _attrs + '.' + task._attrs
                } )
              )

              if ( err ) {
                errors.push( err )
                if ( state.bail ) shouldBail = true
              }
            } )
          } )

          break

        default: throw new TypeError( 'unknown type: ' + type )
      }
    } )

    // no errors, everything is OK
    if ( errors.length === 0 ) return undefined

    var err = new Error()

    err.message = 'Error invalid fields: \n'

    errors.forEach( function ( msg ) {
      err.message += ( '  ' + msg.trim() + '\n' )
    } )

    err.toString = function () {
      return err.message
    }

    return err
  }

  api.nobail = function () {
    var state = getState( stack )
    state.bail = false

    return api
  }

  api.forEach = function ( attrs ) {
    var state = getState( stack )

    if ( attrs == null ) {
      attrs = '.'
    }

    // console.log( 'forEach attrs: ' + attrs )
    var target = dottribute( state.target, attrs )
    // console.log( 'forEach target: ' + target )

    // TODO pop stack on end
    var newState = {
      tasks: [],
      target: target,
      type: 'array',
      attrs: attrs,
      bail: true // bail by default on arrays
    }

    stack.push( newState )

    return api
  }

  api.end = function () {
    console.log( 'end' )

    var state = getState( stack )

    if ( state.root ) {
      // last end reached, we can finish and process all stacks
      return finish()
    } else {
      var prevState = getPrevState( stack )

      var newState = {}
      newState.root = prevState.root
      newState.target = prevState.target
      newState.type = prevState.type
      newState.bail = prevState.bail
      newState.tasks = []

      stack.push( newState )

      return api
    }
  }

  api.done = api.end
  api.finish = api.end

  api.typeof = function ( _attrs, _type, _detail ) {
    var state = getState( stack )

    // if (
    //   typeof _attrs !== 'undefined' &&
    //   typeof _type === 'undefined'
    // ) {
    //   _type = _attrs
    //   _attrs = '.'
    // }

    var target = dottribute( state.target, _attrs )

    state.tasks.push( {
      type: 'typeof',
      target: target,
      _attrs: _attrs,
      _type: _type,
      _detail: _detail
    } )

    return api
  }

  api.instanceof = function ( _attrs, _instance, _detail ) {
    var state = getState( stack )

    // if (
    //   typeof _attrs !== 'undefined' &&
    //   typeof _instance === 'undefined'
    // ) {
    //   _instance = _attrs
    //   _attrs = '.'
    // }

    var target = dottribute( state.target, _attrs )

    state.tasks.push( {
      type: 'instanceof',
      target: target,
      _attrs: _attrs,
      _instance: _instance,
      _detail: _detail
    } )

    return api
  }

  api.gt = function ( _attrs, _number, _detail ) {
    var state = getState( stack )

    // if (
    //   typeof _attrs !== 'undefined' &&
    //   typeof _number === 'undefined'
    // ) {
    //   _number = _attrs
    //   _attrs = '.'
    // }

    var target = dottribute( state.target, _attrs )

    state.tasks.push( {
      type: 'gt',
      target: target,
      _attrs: _attrs,
      _number: _number,
      _detail: _detail
    } )

    return api
  }

  api.gte = function ( _attrs, _number, _detail ) {
    var state = getState( stack )

    // if (
    //   typeof _attrs !== 'undefined' &&
    //   typeof _number === 'undefined'
    // ) {
    //   _number = _attrs
    //   _attrs = '.'
    // }

    var target = dottribute( state.target, _attrs )

    state.tasks.push( {
      type: 'gte',
      target: target,
      _attrs: _attrs,
      _number: _number,
      _detail: _detail
    } )

    return api
  }

  api.lt = function ( _attrs, _number, _detail ) {
    var state = getState( stack )

    // if (
    //   typeof _attrs !== 'undefined' &&
    //   typeof _number === 'undefined'
    // ) {
    //   _number = _attrs
    //   _attrs = '.'
    // }

    var target = dottribute( state.target, _attrs )

    state.tasks.push( {
      type: 'lt',
      target: target,
      _attrs: _attrs,
      _number: _number,
      _detail: _detail
    } )

    return api
  }

  api.lte = function ( _attrs, _number, _detail ) {
    var state = getState( stack )

    // if (
    //   typeof _attrs !== 'undefined' &&
    //   typeof _number === 'undefined'
    // ) {
    //   _number = _attrs
    //   _attrs = '.'
    // }

    var target = dottribute( state.target, _attrs )

    state.tasks.push( {
      type: 'lte',
      target: target,
      _attrs: _attrs,
      _number: _number,
      _detail: _detail
    } )

    return api
  }

  api.e = function ( _attrs, _value, _detail ) {
    var state = getState( stack )

    // if (
    //   typeof _attrs !== 'undefined' &&
    //   typeof _value === 'undefined'
    // ) {
    //   _value = _attrs
    //   _attrs = '.'
    // }

    var target = dottribute( state.target, _attrs )

    state.tasks.push( {
      type: 'e',
      target: target,
      _attrs: _attrs,
      _value: _value,
      _detail: _detail
    } )

    return api
  }

  api.ne = function ( _attrs, _value, _detail ) {
    var state = getState( stack )

    // if (
    //   typeof _attrs !== 'undefined' &&
    //   typeof _value === 'undefined'
    // ) {
    //   _value = _attrs
    //   _attrs = '.'
    // }

    var target = dottribute( state.target, _attrs )

    state.tasks.push( {
      type: 'ne',
      target: target,
      _attrs: _attrs,
      _value: _value,
      _detail: _detail
    } )

    return api
  }

  return api
}

function handleTask ( task ) {
  console.log( 'handling task' )

  var { _attrs, type, target } = task

  switch ( type ) {
    case 'typeof':
      return _typeof( _attrs, target, task._type, task._detail )
      break

    case 'instanceof':
      return _instanceof( _attrs, target, task._instance, task._detail )
      break

    case 'gt':
      return _gt( _attrs, target, task._number, task._detail )
      break

    case 'gte':
      return _gte( _attrs, target, task._number, task._detail )
      break

    case 'lt':
      return _lt( _attrs, target, task._number, task._detail )
      break

    case 'lte':
      return _lte( _attrs, target, task._number, task._detail )
      break

    case 'e':
      return _e( _attrs, target, task._value, task._detail )
      break

    case 'ne':
      return _ne( _attrs, target, task._value, task._detail )
      break

    default: throw new TypeError( 'unknown type: ' + type )
  }
}

function _typeof ( attrs, target, type, detail ) {
  if ( typeof target === type ) {
    return undefined
  }

  var msg = (
    'typeof ' + attrs + ' !== ' + type
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _instanceof ( attrs, target, instance, detail ) {
  if ( target instanceof instance ) {
    return undefined
  }

  var msg = (
    attrs + ' not instanceof ' + instance
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _gt ( attrs, target, number, detail ) {
  if ( target > number ) {
    return undefined
  }

  var msg = (
    attrs + ' is not greater than ' + number + ', was ' + target
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _gte ( attrs, target, number, detail ) {
  if ( target >= number ) {
    return undefined
  }

  var msg = (
    attrs + ' is not greater than or equal to ' + number + ', was ' + target
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _lt ( attrs, target, number, detail ) {
  if ( target < number ) {
    return undefined
  }

  var msg = (
    attrs + ' is not less than ' + number + ', was ' + target
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _lte ( attrs, target, number, detail ) {
  if ( target <= number ) {
    return undefined
  }

  var msg = (
    attrs + ' is not less than or equal to ' + number + ', was ' + target
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _e ( attrs, target, value, detail ) {
  if ( target === value ) {
    return undefined
  }

  // console.log( 'attrs: ' + attrs )
  // console.log( 'target: ' + target )
  // console.log( 'detail: ' + detail )

  var msg = (
    attrs + ' is not equal to ' + value + ' (when it should)'
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

function _ne ( attrs, target, value, detail ) {
  if ( target !== value ) {
    return undefined
  }

  var msg = (
    attrs + ' is equal to ' + value + ' (when it should not)'
  )

  if ( detail ) msg += ': ' + detail

  return msg
}

module.exports = iidesuka

function test () {
  var data = {
    name: 'giraffe',
    list: [ 1, 2, 3 ],
    list2: [
      { val: 1 },
      { val: 0 },
      { val: 3 }
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
    .end()
  )

  console.log( err + '' )
}
