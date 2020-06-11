//==============================================================================
// PUBLIC FUNCTIONS
//==============================================================================

//------------------------------------------------------------------------------
// getProperty
//------------------------------------------------------------------------------

function getProperty(data, name) {
  var keys = parsePropertyName(name);
  while (keys.length > 0) {
    var key = keys.shift();
    data = data[key];
    if (data === undefined) {
      break;
    }
  }
  return data;
}

//------------------------------------------------------------------------------
// setProperty
//------------------------------------------------------------------------------

function setProperty(data, name, value) {
  var keys = parsePropertyName(name);
  return _setProperty(data, keys, value);
}

//------------------------------------------------------------------------------
// createPropertyName
//------------------------------------------------------------------------------

function createPropertyName() {
  var tokens = [];
  var args = Array.prototype.slice.call(arguments);
  var nargs = args.length;
  if (nargs === 1 && Array.isArray(args[0])) {
    args = args[0];
    nargs = args.length;
  }
  for (var i = 0; i < nargs; i++) {
    var arg = args[i];
    if (typeof arg === 'string') {
      if (tokens.length > 0) {
        tokens.push('.');
      }
      tokens.push(arg);
    } else if (typeof arg === 'number') {
      tokens.push('[' + arg + ']');
    } else {
      throw new Error('Invalid argument type at index ' + i + ' (must be string or number).');
    }
  }
  return tokens.join('');
}

//------------------------------------------------------------------------------
// parsePropertyName
//------------------------------------------------------------------------------

function parsePropertyName(s) {
  if (Array.isArray(s)) {
    return s;
  }
  var tokens = [];
  var token = [];
  var charCount = s.length;
  var prevDelim = null;
  for (var i = 0; i < charCount; i++) {
    var c = s.charAt(i);
    switch (c) {
      case '.':
        if (prevDelim !== ']') {
          if (token.length === 0) {
            throw new Error("Invalid syntax (unexpected '.' character): " + s);
          }
          tokens.push(token.join(''));
          token.length = 0;
        }
        prevDelim = c;
        break;
      case '[':
        if (prevDelim) {
          throw new Error("Invalid syntax (unexpected '[' character): " + s);
        }
        if (token.length > 0) {
          tokens.push(token.join(''));
          token.length = 0;
        }
        prevDelim = c;
        break;
      case ']':
        if (prevDelim) {
          throw new Error("Invalid syntax (unexpected ']' character): " + s);
        }
        tokens.push(+token.join(''));
        if (isNaN(tokens[tokens.length - 1])) {
          throw new Error('Invalid syntax (array index is not a number): ' + s);
        }
        token.length = 0;
        prevDelim = c;
        break;
      default:
        if (prevDelim === ']') {
          throw new Error("Invalid syntax (expected '.' after ']'): " + s);
        }
        token.push(c);
        prevDelim = null;
        break;
    }
  }
  if (token.length > 0) {
    tokens.push(token.join(''));
  }
  return tokens;
}

//------------------------------------------------------------------------------
// denormalizeProperties
//------------------------------------------------------------------------------

function denormalizeProperties(data, keys, map) {
  if (arguments.length === 1) {
    keys = [];
    map = {};
  }
  if (_isArray(data)) {
    data.forEach(function (d, i) {
      denormalizeProperties(d, keys.concat(i), map);
    });
  } else if (_isObject(data)) {
    Object.keys(data).forEach(function (key) {
      denormalizeProperties(data[key], keys.concat(key), map);
    });
  } else {
    map[createPropertyName(keys)] = data;
  }
  return map;
}

//------------------------------------------------------------------------------
// normalizeProperties
//------------------------------------------------------------------------------

function normalizeProperties(map, normalizeArrays) {
  if (typeof normalizeArrays === 'undefined') {
    normalizeArrays = true;
  }
  if (!_isObject(map)) {
    throw new Error("The 'map' argument must be an object.");
  }
  var retval = null;
  Object.keys(map).forEach(function (name) {
    retval = setProperty(retval, name, map[name]);
  });
  if (normalizeArrays) {
    return normalizeArrayProperties(retval);
  } else {
    return retval;
  }
}

//------------------------------------------------------------------------------
// copyProperties
//------------------------------------------------------------------------------

function copyProperties(data, normalizeArrays) {
  if (typeof normalizeArrays === 'undefined') {
    normalizeArrays = true;
  }
  return normalizeProperties(denormalizeProperties(data), normalizeArrays);
}

//------------------------------------------------------------------------------
// normalizeArrayProperties
//------------------------------------------------------------------------------

function normalizeArrayProperties(data) {
  if (_isArray(data)) {
    var normalized = data.filter(function (e) {
      return typeof e !== 'undefined';
    });
    return normalized.map(function (e) {
      return normalizeArrayProperties(e);
    });
  }
  if (_isObject(data)) {
    var retval = {};
    Object.keys(data).forEach(function (key) {
      retval[key] = normalizeArrayProperties(data[key]);
    });
    return retval;
  }
  return data;
}

//==============================================================================
// PRIVATE FUNCTIONS
//==============================================================================

function _setProperty(data, keys, value) {
  var key = keys.shift();
  switch (typeof key) {
    case 'string':
      if (data == null) {
        data = {};
      }
      if (!_isObject(data)) {
        throw new Error("Expected an object for '" + key + "'");
      }
      data[key] = _setProperty(data[key], keys, value);
      break;
    case 'number':
      if (data == null) {
        data = [];
      }
      if (!_isArray(data)) {
        throw new Error("Expected an array for '" + key + "'");
      }
      data[key] = _setProperty(data[key], keys, value);
      break;
    default:
      return value;
  }
  return data;
}

function _isArray(val) {
  return Array.isArray(val);
}

function _isObject(val) {
  return val != null && val.constructor === Object;
}

function _isUndefined(val) {
  return typeof val === 'undefined';
}

//==============================================================================
// MODULE EXPORTS
//==============================================================================

module.exports = {
  getProperty: getProperty,
  setProperty: setProperty,
  createPropertyName: createPropertyName,
  parsePropertyName: parsePropertyName,
  denormalizeProperties: denormalizeProperties,
  normalizeProperties: normalizeProperties,
  copyProperties: copyProperties,
  normalizeArrayProperties: normalizeArrayProperties,
};
