//==============================================================================
// PUBLIC FUNCTIONS
//==============================================================================

//------------------------------------------------------------------------------
// getProperty
//------------------------------------------------------------------------------

function getProperty(data, name) {
  const keys = parsePropertyName(name);
  while (keys.length > 0) {
    const key = keys.shift();
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
  const keys = parsePropertyName(name);
  if (keys.length === 0) {
    return data;
  }
  if (data === null) {
    data = typeof keys[0] === 'number' ? [] : {};
  }
  return _setProperty(data, keys, value);
}

//------------------------------------------------------------------------------
// createPropertyName
//------------------------------------------------------------------------------

function createPropertyName(...args) {
  const tokens = [];
  for (let arg of args) {
    if (typeof arg === 'string') {
      if (tokens.length > 0) {
        tokens.push('.');
      }
      tokens.push(arg);
    } else if (typeof arg === 'number') {
      tokens.push(`[${arg}]`);
    } else {
      throw new Error('Invalid argument type: ' + typeof arg);
    }
  }
  return tokens.join('');
}

//------------------------------------------------------------------------------
// parsePropertyName
//------------------------------------------------------------------------------

function parsePropertyName(s) {
  const tokens = [];
  const token = [];
  let prevDelim = null;
  for (let c of s) {
    switch (c) {
      case '.':
        if (prevDelim !== ']') {
          if (token.length === 0) {
            throw new Error(`Invalid syntax in '${s}' (unexpected '.' character).`);
          }
          tokens.push(token.join(''));
          token.length = 0;
        }
        prevDelim = c;
        break;
      case '[':
        if (prevDelim) {
          throw new Error(`Invalid syntax in '${s}' (unexpected '[' character).`);
        }
        if (token.length > 0) {
          tokens.push(token.join(''));
          token.length = 0;
        }
        prevDelim = c;
        break;
      case ']':
        if (prevDelim) {
          throw new Error(`Invalid syntax in '${s}' (unexpected ']' character).`);
        }
        tokens.push(+token.join(''));
        if (isNaN(tokens[tokens.length - 1])) {
          throw new Error(`Invalid syntax in '${s}' (invalid array index).`);
        }
        token.length = 0;
        prevDelim = c;
        break;
      default:
        if (prevDelim === ']') {
          throw new Error(`Invalid syntax in '${s}' (expected '.' after ']').`);
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

function denormalizeProperties(data, names = [], current = {}) {
  if (data === null) {
    current[createPropertyName(...names)] = null;
  } else if (Array.isArray(data)) {
    data.forEach((d, i) => {
      denormalizeProperties(d, [...names, i], current);
    });
  } else if (typeof data === 'object') {
    Object.keys(data).forEach(key => {
      denormalizeProperties(data[key], [...names, key], current);
    });
  } else {
    current[createPropertyName(...names)] = data;
  }
  return current;
}

//------------------------------------------------------------------------------
// normalizeProperties
//------------------------------------------------------------------------------

function normalizeProperties(properties, normalizeArrays = true) {
  let retval = null;
  Object.keys(properties).forEach(name => {
    retval = setProperty(retval, name, properties[name]);
  });
  if (normalizeArrays) {
    return normalizeArrayProperties(retval);
  } else {
    return retval;
  }
}

//------------------------------------------------------------------------------
// normalizeArrayProperties
//------------------------------------------------------------------------------

function normalizeArrayProperties(data) {
  if (data === null) {
    return null;
  }
  if (Array.isArray(data)) {
    const normalized = data.filter(e => typeof e !== 'undefined');
    return normalized.map(e => normalizeArrayProperties(e));
  }
  if (typeof data === 'object') {
    const retval = {};
    Object.keys(data).forEach(key => {
      retval[key] = normalizeArrayProperties(data[key]);
    });
    return retval;
  }
  return data;
}

//==============================================================================
// PRIVATE FUNCTIONS
//==============================================================================

//------------------------------------------------------------------------------
// _setProperty
//------------------------------------------------------------------------------

function _setProperty(data, keys, value) {
  const key = keys.shift();
  if (keys.length === 0) {
    data[key] = value;
  } else {
    if (data[key] === undefined) {
      // Look ahead at the next key and create an object under the current key
      // depending the type of the next key. If it is a number, this indicates
      // an array. Otherwise, it is a string indicating an object is next.
      if (typeof keys[0] === 'number') {
        data[key] = [];
      } else {
        data[key] = {};
      }
    }
    _setProperty(data[key], keys, value);
  }
  return data;
}

//==============================================================================
// MODULE EXPORTS
//==============================================================================

module.exports = {
  getProperty,
  setProperty,
  createPropertyName,
  parsePropertyName,
  denormalizeProperties,
  normalizeProperties,
  normalizeArrayProperties
};
