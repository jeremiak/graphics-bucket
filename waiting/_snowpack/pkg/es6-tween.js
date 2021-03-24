/* SNOWPACK PROCESS POLYFILL (based on https://github.com/calvinmetcalf/node-process-es6) */
function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
var globalContext;
if (typeof window !== 'undefined') {
    globalContext = window;
} else if (typeof self !== 'undefined') {
    globalContext = self;
} else {
    globalContext = {};
}
if (typeof globalContext.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof globalContext.clearTimeout === 'function') {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
var title = 'browser';
var platform = 'browser';
var browser = true;
var argv = [];
var version = ''; // empty string to avoid regexp issues
var versions = {};
var release = {};
var config = {};

function noop() {}

var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;

function binding(name) {
    throw new Error('process.binding is not supported');
}

function cwd () { return '/' }
function chdir (dir) {
    throw new Error('process.chdir is not supported');
}function umask() { return 0; }

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance = globalContext.performance || {};
var performanceNow =
  performance.now        ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  function(){ return (new Date()).getTime() };

// generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime
function hrtime(previousTimestamp){
  var clocktime = performanceNow.call(performance)*1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor((clocktime%1)*1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds<0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds,nanoseconds]
}

var startTime = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime;
  return dif / 1000;
}

var process = {
  nextTick: nextTick,
  title: title,
  browser: browser,
  env: {"NODE_ENV":"production"},
  argv: argv,
  version: version,
  versions: versions,
  on: on,
  addListener: addListener,
  once: once,
  off: off,
  removeListener: removeListener,
  removeAllListeners: removeAllListeners,
  emit: emit,
  binding: binding,
  cwd: cwd,
  chdir: chdir,
  umask: umask,
  hrtime: hrtime,
  platform: platform,
  release: release,
  config: config,
  uptime: uptime
};

/* global global, self */
let root =
  typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
        ? global
        : undefined || (typeof exports !== 'undefined' ? exports : {});
let requestAnimationFrame = root.requestAnimationFrame || ((fn) => root.setTimeout(fn, 50 / 3));
let cancelAnimationFrame = root.cancelAnimationFrame || ((id) => root.clearTimeout(id));

/**
 * Get browser/Node.js current time-stamp
 * @return Normalised current time-stamp in milliseconds
 * @memberof TWEEN
 * @example
 * TWEEN.now
 */
const now = (function () {
  if (
    typeof process !== 'undefined' &&
    process.hrtime !== undefined &&
    (!process.versions || process.versions.electron === undefined)
  ) {
    return function () {
      const time = process.hrtime();

      // Convert [seconds, nanoseconds] to milliseconds.
      return time[0] * 1000 + time[1] / 1000000
    }
    // In a browser, use window.performance.now if it is available.
  } else if (root.performance !== undefined && root.performance.now !== undefined) {
    // This must be bound, because directly assigning this function
    // leads to an invocation exception in Chrome.
    return root.performance.now.bind(root.performance)
    // Use Date.now if it is available.
  } else {
    const offset =
      root.performance && root.performance.timing && root.performance.timing.navigationStart
        ? root.performance.timing.navigationStart
        : Date.now();
    return function () {
      return Date.now() - offset
    }
  }
})();

/**
 * Lightweight, effecient and modular ES6 version of tween.js
 * @copyright 2019 @dalisoft and es6-tween contributors
 * @license MIT
 * @namespace TWEEN
 * @example
 * // ES6
 * const {add, remove, isRunning, autoPlay} = TWEEN
 */
const _tweens = [];
let isStarted = false;
let _autoPlay = false;
let _onRequestTick = [];
const _ticker = requestAnimationFrame;
let emptyFrame = 0;
let powerModeThrottle = 120;
let _tick;
let handleLag = true;

const _requestTick = () => {
  for (let i = 0; i < _onRequestTick.length; i++) {
    _onRequestTick[i]();
  }
};

/**
 * Adds tween to list
 * @param {Tween} tween Tween instance
 * @memberof TWEEN
 * @example
 * let tween = new Tween({x:0})
 * tween.to({x:200}, 1000)
 * TWEEN.add(tween)
 */
const add = (tween) => {
  let i = _tweens.indexOf(tween);

  if (i > -1) {
    _tweens.splice(i, 1);
  }

  _tweens.push(tween);

  emptyFrame = 0;

  if (_autoPlay && !isStarted) {
    _tick = _ticker(update);
    isStarted = true;
  }
};

/**
 * Runs update loop automaticlly
 * @param {Boolean} state State of auto-run of update loop
 * @example TWEEN.autoPlay(true)
 * @memberof TWEEN
 */
const autoPlay = (state) => {
  _autoPlay = state;
};
/**
 * Removes tween from list
 * @param {Tween} tween Tween instance
 * @memberof TWEEN
 * @example
 * TWEEN.remove(tween)
 */
const remove = (tween) => {
  const i = _tweens.indexOf(tween);
  if (i !== -1) {
    _tweens.splice(i, 1);
  }
  if (_tweens.length === 0) {
    cancelAnimationFrame(_tick);
    isStarted = false;
  }
};

/**
 * Updates global tweens by given time
 * @param {number=} time Timestamp
 * @param {Boolean=} preserve Prevents tween to be removed after finish
 * @memberof TWEEN
 * @example
 * TWEEN.update(500)
 */

const update = (time = now(), preserve) => {
  if (emptyFrame >= powerModeThrottle && handleLag) {
    isStarted = false;
    emptyFrame = 0;
    cancelAnimationFrame(_tick);
    return false
  }

  if (_autoPlay && isStarted) {
    _tick = _ticker(update);
  } else {
    _requestTick();
  }

  if (!_tweens.length) {
    emptyFrame++;
  }

  let i = 0;
  let length = _tweens.length;
  while (i < length) {
    _tweens[i++].update(time, preserve);

    if (length > _tweens.length) {
      // The tween has been removed, keep same index
      i--;
    }

    length = _tweens.length;
  }

  return true
};

/**
 * The state of ticker running
 * @return {Boolean} Status of running updates on all tweens
 * @memberof TWEEN
 * @example TWEEN.isRunning()
 */
const isRunning = () => isStarted;

/**
 * Returns state of lag smoothing handling
 * @return {Boolean} Status of lag smoothing state
 * @memberof TWEEN
 * @example TWEEN.isRunning()
 */
const isLagSmoothing = () => handleLag;

/**
 * The plugins store object
 * @namespace TWEEN.Plugins
 * @memberof TWEEN
 * @example
 * let num = Plugins.num = function (node, start, end) {
 * return t => start + (end - start) * t
 * }
 *
 * @static
 */
const Plugins = {};

/**
 * List of full easings
 * @namespace TWEEN.Easing
 * @example
 * import {Tween, Easing} from 'es6-tween'
 *
 * // then set via new Tween({x:0}).to({x:100}, 1000).easing(Easing.Quadratic.InOut).start()
 */
const Easing = {
  Linear: {
    None (k) {
      return k
    }
  },

  Quadratic: {
    In (k) {
      return Math.pow(k, 2)
    },

    Out (k) {
      return k * (2 - k)
    },

    InOut (k) {
      if ((k *= 2) < 1) {
        return 0.5 * Math.pow(k, 2)
      }

      return -0.5 * (--k * (k - 2) - 1)
    }
  },

  Cubic: {
    In (k) {
      return Math.pow(k, 3)
    },

    Out (k) {
      return --k * k * k + 1
    },

    InOut (k) {
      if ((k *= 2) < 1) {
        return 0.5 * Math.pow(k, 3)
      }

      return 0.5 * ((k -= 2) * k * k + 2)
    }
  },

  Quartic: {
    In (k) {
      return Math.pow(k, 4)
    },

    Out (k) {
      return 1 - --k * k * k * k
    },

    InOut (k) {
      if ((k *= 2) < 1) {
        return 0.5 * Math.pow(k, 4)
      }

      return -0.5 * ((k -= 2) * k * k * k - 2)
    }
  },

  Quintic: {
    In (k) {
      return Math.pow(k, 5)
    },

    Out (k) {
      return --k * k * k * k * k + 1
    },

    InOut (k) {
      if ((k *= 2) < 1) {
        return 0.5 * Math.pow(k, 5)
      }

      return 0.5 * ((k -= 2) * k * k * k * k + 2)
    }
  },

  Sinusoidal: {
    In (k) {
      return 1 - Math.cos((k * Math.PI) / 2)
    },

    Out (k) {
      return Math.sin((k * Math.PI) / 2)
    },

    InOut (k) {
      return 0.5 * (1 - Math.cos(Math.PI * k))
    }
  },

  Exponential: {
    In (k) {
      return k === 0 ? 0 : Math.pow(1024, k - 1)
    },

    Out (k) {
      return k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
    },

    InOut (k) {
      if (k === 0) {
        return 0
      }

      if (k === 1) {
        return 1
      }

      if ((k *= 2) < 1) {
        return 0.5 * Math.pow(1024, k - 1)
      }

      return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2)
    }
  },

  Circular: {
    In (k) {
      return 1 - Math.sqrt(1 - k * k)
    },

    Out (k) {
      return Math.sqrt(1 - --k * k)
    },

    InOut (k) {
      if ((k *= 2) < 1) {
        return -0.5 * (Math.sqrt(1 - k * k) - 1)
      }

      return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1)
    }
  },

  Elastic: {
    In (k) {
      if (k === 0) {
        return 0
      }

      if (k === 1) {
        return 1
      }

      return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI)
    },

    Out (k) {
      if (k === 0) {
        return 0
      }

      if (k === 1) {
        return 1
      }

      return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1
    },

    InOut (k) {
      if (k === 0) {
        return 0
      }

      if (k === 1) {
        return 1
      }

      k *= 2;

      if (k < 1) {
        return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI)
      }

      return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1
    }
  },

  Back: {
    In (k) {
      const s = 1.70158;

      return k * k * ((s + 1) * k - s)
    },

    Out (k) {
      const s = 1.70158;

      return --k * k * ((s + 1) * k + s) + 1
    },

    InOut (k) {
      const s = 1.70158 * 1.525;

      if ((k *= 2) < 1) {
        return 0.5 * (k * k * ((s + 1) * k - s))
      }

      return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2)
    }
  },

  Bounce: {
    In (k) {
      return 1 - Easing.Bounce.Out(1 - k)
    },

    Out (k) {
      let x = 2.75;
      let y = 7.5625;
      if (k < 1 / x) {
        return y * k * k
      } else if (k < 2 / x) {
        return y * (k -= 1.5 / x) * k + 0.75
      } else if (k < 2.5 / x) {
        return y * (k -= 2.25 / x) * k + 0.9375
      } else {
        return y * (k -= 2.625 / x) * k + 0.984375
      }
    },

    InOut (k) {
      if (k < 0.5) {
        return Easing.Bounce.In(k * 2) * 0.5
      }

      return Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5
    }
  },

  Stepped: {
    steps: (steps) => (k) => ((k * steps) | 0) / steps
  }
};

// Frame lag-fix constants
const FRAME_MS = 50 / 3;
const TOO_LONG_FRAME_MS = 250;

const CHAINED_TWEENS = '_chainedTweens';

// Event System
const EVENT_CALLBACK = 'Callback';
const EVENT_UPDATE = 'update';
const EVENT_COMPLETE = 'complete';
const EVENT_START = 'start';
const EVENT_REPEAT = 'repeat';
const EVENT_REVERSE = 'reverse';
const EVENT_PAUSE = 'pause';
const EVENT_PLAY = 'play';
const EVENT_RESTART = 'restart';
const EVENT_STOP = 'stop';
const EVENT_SEEK = 'seek';

// For String tweening stuffs
const STRING_PROP = 'STRING_PROP';
// Also RegExp's for string tweening
const NUM_REGEX = /\s+|([A-Za-z?().,{}:""[\]#%]+)|([-+]=+)?([-+]+)?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]=?\d+)?/g;

// Copies everything, duplicates, no shallow-copy
function deepCopy (source) {
  if ((source && source.nodeType) || source === undefined || typeof source !== 'object') {
    return source
  } else if (Array.isArray(source)) {
    return [].concat(source)
  } else if (typeof source === 'object') {
    let target = {};
    for (let prop in source) {
      target[prop] = deepCopy(source[prop]);
    }
    return target
  }
  return source
}

const isNaNForST = (v) => isNaN(+v) || ((v[0] === '+' || v[0] === '-') && v[1] === '=') || v === '' || v === ' ';

const hexColor = /^#([0-9a-f]{6}|[0-9a-f]{3})$/gi;
const hex2rgb = (all, hex) => {
  let r;
  let g;
  let b;
  if (hex.length === 3) {
    r = hex[0];
    g = hex[1];
    b = hex[2];
    hex = r + r + g + g + b + b;
  }
  let color = parseInt(hex, 16);
  r = (color >> 16) & 255;
  g = (color >> 8) & 255;
  b = color & 255;
  return 'rgb(' + r + ', ' + g + ', ' + b + ')'
};

function decomposeString (fromValue) {
  if (fromValue && fromValue.splice && fromValue.isString) {
    return fromValue
  }
  if (typeof fromValue !== 'string') {
    return fromValue
  }
  if (fromValue.charAt(1) === '=') {
    return fromValue
  }
  const value = fromValue
    .replace(hexColor, hex2rgb)
    .match(NUM_REGEX)
    .map((v) => (isNaNForST(v) ? v : +v));
  value.isString = true;
  return value
}

// Decompose value, now for only `string` that required
function decompose (prop, obj, from, to) {
  const fromValue = from[prop];
  const toValue = to[prop];

  if (fromValue === toValue) {
    return true
  } else if (Array.isArray(fromValue) && Array.isArray(toValue) && fromValue.length === toValue.length) {
    for (let i = 0, len = toValue.length; i < len; i++) {
      const a = fromValue[i];
      const b = toValue[i];

      if (a === b || (typeof a === 'number' && typeof b === 'number')) {
        continue
      } else {
        decompose(i, obj[prop], fromValue, toValue);
      }
    }
  }
  if (typeof fromValue === 'number' && typeof toValue === 'number') ; else if (fromValue && fromValue.splice && fromValue.isString && toValue && toValue.splice && toValue.isString) ; else if (typeof fromValue === 'string' && Array.isArray(toValue)) {
    const fromValue1 = decomposeString(fromValue);
    const toValues = toValue.map(decomposeString);

    from[prop] = fromValue1;
    to[prop] = toValues;
    return true
  } else if (typeof fromValue === 'string' || typeof toValue === 'string') {
    let fromValue1 = Array.isArray(fromValue) && fromValue[0] === STRING_PROP ? fromValue : decomposeString(fromValue);
    let toValue1 = Array.isArray(toValue) && toValue[0] === STRING_PROP ? toValue : decomposeString(toValue);

    if (fromValue1 === undefined) {
      return
    }
    let i = 1;
    while (i < fromValue1.length) {
      if (fromValue1[i] === toValue1[i] && typeof fromValue1[i - 1] === 'string') {
        fromValue1.splice(i - 1, 2, fromValue1[i - 1] + fromValue1[i]);
        toValue1.splice(i - 1, 2, toValue1[i - 1] + toValue1[i]);
      } else {
        i++;
      }
    }

    i = 0;

    if (fromValue1[0] === STRING_PROP) {
      fromValue1.shift();
    }
    if (toValue1[0] === STRING_PROP) {
      toValue1.shift();
    }

    from[prop] = fromValue1;
    to[prop] = toValue1;
    return true
  } else if (typeof fromValue === 'object' && typeof toValue === 'object') {
    if (Array.isArray(fromValue) && !fromValue.isString) {
      return fromValue.map((v, i) => decompose(i, obj[prop], fromValue, toValue))
    } else {
      for (let prop2 in toValue) {
        decompose(prop2, obj[prop], fromValue, toValue);
      }
    }
    return true
  }
  return false
}

// Recompose value
const RGB = 'rgb(';
const RGBA = 'rgba(';

const isRGBColor = (v, i, r = RGB) =>
  typeof v[i] === 'number' && (v[i - 1] === r || v[i - 3] === r || v[i - 5] === r);
function recompose (prop, obj, from, to, t, originalT, stringBuffer) {
  const fromValue = stringBuffer ? from : from[prop];
  let toValue = stringBuffer ? to : to[prop];
  if (toValue === undefined) {
    return fromValue
  }
  if (fromValue === undefined || typeof fromValue === 'string' || fromValue === toValue) {
    return toValue
  } else if (typeof fromValue === 'object' && typeof toValue === 'object') {
    if (!fromValue || !toValue) {
      return obj[prop]
    }
    if (
      typeof fromValue === 'object' &&
      !!fromValue &&
      fromValue.isString &&
      toValue &&
      toValue.splice &&
      toValue.isString
    ) {
      let STRING_BUFFER = '';
      for (let i = 0, len = fromValue.length; i < len; i++) {
        if (fromValue[i] !== toValue[i] || typeof fromValue[i] !== 'number' || typeof toValue[i] === 'number') {
          const isRelative = typeof fromValue[i] === 'number' && typeof toValue[i] === 'string' && toValue[i][1] === '=';
          let currentValue =
            typeof fromValue[i] !== 'number'
              ? fromValue[i]
              : isRelative
                ? fromValue[i] + parseFloat(toValue[i][0] + toValue[i].substr(2)) * t
                : fromValue[i] + (toValue[i] - fromValue[i]) * t;
          if (isRGBColor(fromValue, i) || isRGBColor(fromValue, i, RGBA)) {
            currentValue |= 0;
          }
          STRING_BUFFER += currentValue;
          if (isRelative && originalT === 1) {
            fromValue[i] = fromValue[i] + parseFloat(toValue[i][0] + toValue[i].substr(2));
          }
        } else {
          STRING_BUFFER += fromValue[i];
        }
      }
      if (!stringBuffer) {
        obj[prop] = STRING_BUFFER;
      }
      return STRING_BUFFER
    } else if (Array.isArray(fromValue) && fromValue[0] !== STRING_PROP) {
      for (let i = 0, len = fromValue.length; i < len; i++) {
        if (fromValue[i] === toValue[i] || typeof obj[prop] === 'string') {
          continue
        }
        recompose(i, obj[prop], fromValue, toValue, t, originalT);
      }
    } else if (typeof fromValue === 'object' && !!fromValue && !fromValue.isString) {
      for (let i in fromValue) {
        if (fromValue[i] === toValue[i]) {
          continue
        }
        recompose(i, obj[prop], fromValue, toValue, t, originalT);
      }
    }
  } else if (typeof fromValue === 'number') {
    const isRelative = typeof toValue === 'string';
    obj[prop] = isRelative
      ? fromValue + parseFloat(toValue[0] + toValue.substr(2)) * t
      : fromValue + (toValue - fromValue) * t;
    if (isRelative && originalT === 1) {
      from[prop] = obj[prop];
    }
  } else if (typeof toValue === 'function') {
    obj[prop] = toValue(t);
  }
  return obj[prop]
}

// Dot notation => Object structure converter
// example
// {'scale.x.y.z':'VALUE'} => {scale:{x:{y:{z:'VALUE'}}}}
// Only works for 3-level parsing, after 3-level, parsing dot-notation not works as it's not affects
const propRegExp = /([.[])/g;
const replaceBrace = /\]/g;
const propExtract = function (obj, property) {
  const value = obj[property];
  const props = property.replace(replaceBrace, '').split(propRegExp);
  const propsLastIndex = props.length - 1;
  let lastArr = Array.isArray(obj);
  let lastObj = typeof obj === 'object' && !lastArr;
  if (lastObj) {
    obj[property] = null;
    delete obj[property];
  } else if (lastArr) {
    obj.splice(property, 1);
  }
  return props.reduce((nested, prop, index) => {
    if (lastArr) {
      if (prop !== '.' && prop !== '[') {
        prop *= 1;
      }
    }
    let nextProp = props[index + 1];
    let nextIsArray = nextProp === '[';
    if (prop === '.' || prop === '[') {
      if (prop === '.') {
        lastObj = true;
        lastArr = false;
      } else if (prop === '[') {
        lastObj = false;
        lastArr = true;
      }
      return nested
    } else if (nested[prop] === undefined) {
      if (lastArr || lastObj) {
        nested[prop] = index === propsLastIndex ? value : lastArr || nextIsArray ? [] : lastObj ? {} : null;
        lastObj = lastArr = false;
        return nested[prop]
      }
    } else if (nested[prop] !== undefined) {
      if (index === propsLastIndex) {
        nested[prop] = value;
      }
      return nested[prop]
    }
    return nested
  }, obj)
};

const SET_NESTED = function (nested) {
  if (typeof nested === 'object' && !!nested) {
    for (let prop in nested) {
      if (prop.indexOf('.') !== -1 || prop.indexOf('[') !== -1) {
        propExtract(nested, prop);
      } else if (typeof nested[prop] === 'object' && !!nested[prop]) {
        let nested2 = nested[prop];
        for (let prop2 in nested2) {
          if (prop2.indexOf('.') !== -1 || prop2.indexOf('[') !== -1) {
            propExtract(nested2, prop2);
          } else if (typeof nested2[prop2] === 'object' && !!nested2[prop2]) {
            let nested3 = nested2[prop2];
            for (let prop3 in nested3) {
              if (prop3.indexOf('.') !== -1 || prop3.indexOf('[') !== -1) {
                propExtract(nested3, prop3);
              }
            }
          }
        }
      }
    }
  }
  return nested
};

/**
 * List of full Interpolation
 * @namespace TWEEN.Interpolation
 * @example
 * import {Interpolation, Tween} from 'es6-tween'
 *
 * let bezier = Interpolation.Bezier
 * new Tween({x:0}).to({x:[0, 4, 8, 12, 15, 20, 30, 40, 20, 40, 10, 50]}, 1000).interpolation(bezier).start()
 * @memberof TWEEN
 */
const Interpolation = {
  Linear (v, k, value) {
    const m = v.length - 1;
    const f = m * k;
    const i = Math.floor(f);
    const fn = Interpolation.Utils.Linear;

    if (k < 0) {
      return fn(v[0], v[1], f, value)
    }
    if (k > 1) {
      return fn(v[m], v[m - 1], m - f, value)
    }
    return fn(v[i], v[i + 1 > m ? m : i + 1], f - i, value)
  },

  Bezier (v, k, value) {
    let b = Interpolation.Utils.Reset(value);
    let n = v.length - 1;
    let pw = Math.pow;
    let fn = Interpolation.Utils.Bernstein;

    let isBArray = Array.isArray(b);

    for (let i = 0; i <= n; i++) {
      if (typeof b === 'number') {
        b += pw(1 - k, n - i) * pw(k, i) * v[i] * fn(n, i);
      } else if (isBArray) {
        for (let p = 0, len = b.length; p < len; p++) {
          if (typeof b[p] === 'number') {
            b[p] += pw(1 - k, n - i) * pw(k, i) * v[i][p] * fn(n, i);
          } else {
            b[p] = v[i][p];
          }
        }
      } else if (typeof b === 'object') {
        for (let p in b) {
          if (typeof b[p] === 'number') {
            b[p] += pw(1 - k, n - i) * pw(k, i) * v[i][p] * fn(n, i);
          } else {
            b[p] = v[i][p];
          }
        }
      } else if (typeof b === 'string') {
        let STRING_BUFFER = '';
        let idx = Math.round(n * k);
        let vCurr = v[idx];
        for (let ks = 1, len = vCurr.length; ks < len; ks++) {
          STRING_BUFFER += vCurr[ks];
        }
        return STRING_BUFFER
      }
    }

    return b
  },

  CatmullRom (v, k, value) {
    const m = v.length - 1;
    let f = m * k;
    let i = Math.floor(f);
    const fn = Interpolation.Utils.CatmullRom;

    if (v[0] === v[m]) {
      if (k < 0) {
        i = Math.floor((f = m * (1 + k)));
      }

      return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i, value)
    } else {
      if (k < 0) {
        return fn(v[1], v[1], v[0], v[0], -k, value)
      }

      if (k > 1) {
        return fn(v[m - 1], v[m - 1], v[m], v[m], (k | 0) - k, value)
      }

      return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i, value)
    }
  },

  Utils: {
    Linear (p0, p1, t, v) {
      if (p0 === p1 || typeof p0 === 'string') {
        // Quick return for performance reason
        if (p1.length && p1.splice && p1.isString) {
          p1 = '';
          for (let i = 0, len = p0.length; i < len; i++) {
            p1 += p0[i];
          }
        }
        return p1
      } else if (typeof p0 === 'number') {
        return typeof p0 === 'function' ? p0(t) : p0 + (p1 - p0) * t
      } else if (typeof p0 === 'object') {
        if (p0.length !== undefined) {
          const isForceStringProp = typeof p0[0] === 'string' || p0.isString;
          if (isForceStringProp || p0[0] === STRING_PROP) {
            let STRING_BUFFER = '';
            for (let i = isForceStringProp ? 0 : 1, len = p0.length; i < len; i++) {
              let currentValue =
                t === 0 ? p0[i] : t === 1 ? p1[i] : typeof p0[i] === 'number' ? p0[i] + (p1[i] - p0[i]) * t : p1[i];
              if ((t > 0 && t < 1 && isRGBColor(p0, i)) || isRGBColor(p0, i, RGBA)) {
                currentValue |= 0;
              }
              STRING_BUFFER += currentValue;
            }
            return STRING_BUFFER
          } else if (v && v.length && v.splice) {
            for (let p = 0, len = v.length; p < len; p++) {
              v[p] = Interpolation.Utils.Linear(p0[p], p1[p], t, v[p]);
            }
          }
        } else {
          for (const p in v) {
            v[p] = Interpolation.Utils.Linear(p0[p], p1[p], t, v[p]);
          }
        }
        return v
      }
    },

    Reset (value) {
      if (Array.isArray(value)) {
        for (let i = 0, len = value.length; i < len; i++) {
          value[i] = Interpolation.Utils.Reset(value[i]);
        }
        return value
      } else if (typeof value === 'object') {
        for (let i in value) {
          value[i] = Interpolation.Utils.Reset(value[i]);
        }
        return value
      } else if (typeof value === 'number') {
        return 0
      }
      return value
    },

    Bernstein (n, i) {
      const fc = Interpolation.Utils.Factorial;

      return fc(n) / fc(i) / fc(n - i)
    },

    Factorial: (function () {
      const a = [1];

      return (n) => {
        let s = 1;

        if (a[n]) {
          return a[n]
        }

        for (let i = n; i > 1; i--) {
          s *= i;
        }

        a[n] = s;
        return s
      }
    })(),

    CatmullRom (p0, p1, p2, p3, t, v) {
      if (typeof p0 === 'string') {
        return p1
      } else if (typeof p0 === 'number') {
        const v0 = (p2 - p0) * 0.5;
        const v1 = (p3 - p1) * 0.5;
        const t2 = t * t;
        const t3 = t * t2;

        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
      } else if (typeof p0 === 'object') {
        if (p0.length !== undefined) {
          if (p0[0] === STRING_PROP) {
            let STRING_BUFFER = '';
            for (let i = 1, len = p0.length; i < len; i++) {
              let currentValue =
                typeof p0[i] === 'number' ? Interpolation.Utils.CatmullRom(p0[i], p1[i], p2[i], p3[i], t) : p3[i];
              if (isRGBColor(p0, i) || isRGBColor(p0, i, RGBA)) {
                currentValue |= 0;
              }
              STRING_BUFFER += currentValue;
            }
            return STRING_BUFFER
          }
          for (let p = 0, len = v.length; p < len; p++) {
            v[p] = Interpolation.Utils.CatmullRom(p0[p], p1[p], p2[p], p3[p], t, v[p]);
          }
        } else {
          for (const p in v) {
            v[p] = Interpolation.Utils.CatmullRom(p0[p], p1[p], p2[p], p3[p], t, v[p]);
          }
        }
        return v
      }
    }
  }
};

const Store = {};
function NodeCache (node, object, tween) {
  if (!node || !node.nodeType) {
    return object
  }
  const ID = node.queueID || 'q_' + Date.now();
  if (!node.queueID) {
    node.queueID = ID;
  }
  const storeID = Store[ID];
  if (storeID) {
    if (storeID.object === object && node === storeID.tween.node && tween._startTime === storeID.tween._startTime) {
      remove(storeID.tween);
    } else if (typeof object === 'object' && !!object && !!storeID.object) {
      for (let prop in object) {
        if (prop in storeID.object) {
          if (tween._startTime === storeID.tween._startTime) {
            delete storeID.object[prop];
          } else {
            storeID.propNormaliseRequired = true;
          }
        }
      }
      Object.assign(storeID.object, object);
    }
    return storeID.object
  }

  if (typeof object === 'object' && !!object) {
    Store[ID] = {
      tween,
      object,
      propNormaliseRequired: false
    };
    return Store[ID].object
  }

  return object
}

function Selector (selector, collection, allowRaw) {
  if (collection) {
    return !selector
      ? null
      : (typeof window !== 'undefined' && selector === window) ||
        (typeof document !== 'undefined' && selector === document)
        ? [selector]
        : typeof selector === 'string'
          ? !!document.querySelectorAll && document.querySelectorAll(selector)
          : Array.isArray(selector)
            ? selector
            : selector.nodeType
              ? [selector]
              : allowRaw
                ? selector
                : []
  }
  return !selector
    ? null
    : (typeof window !== 'undefined' && selector === window) ||
      (typeof document !== 'undefined' && selector === document)
      ? selector
      : typeof selector === 'string'
        ? !!document.querySelector && document.querySelector(selector)
        : Array.isArray(selector)
          ? selector[0]
          : selector.nodeType
            ? selector
            : allowRaw
              ? selector
              : null
}

let _id = 0; // Unique ID
const defaultEasing = Easing.Linear.None;

/**
 * Tween main constructor
 * @constructor
 * @class
 * @namespace TWEEN.Tween
 * @param {Object|Element} node Node Element or Tween initial object
 * @param {Object=} object If Node Element is using, second argument is used for Tween initial object
 * @example let tween = new Tween(myNode, {width:'100px'}).to({width:'300px'}, 2000).start()
 */
class Tween {
  /**
   * Easier way to call the Tween
   * @param {Element} node DOM Element
   * @param {object} object - Initial value
   * @param {object} to - Target value
   * @param {object} params - Options of tweens
   * @example Tween.fromTo(node, {x:0}, {x:200}, {duration:1000})
   * @memberof TWEEN.Tween
   * @static
   */
  static fromTo (node, object, to, params = {}) {
    params.quickRender = params.quickRender ? params.quickRender : !to;
    const tween = new Tween(node, object).to(to, params);
    if (params.quickRender) {
      tween.render().update(tween._startTime);
      tween._rendered = false;
      tween._onStartCallbackFired = false;
    }
    return tween
  }
  /**
   * Easier way calling constructor only applies the `to` value, useful for CSS Animation
   * @param {Element} node DOM Element
   * @param {object} to - Target value
   * @param {object} params - Options of tweens
   * @example Tween.to(node, {x:200}, {duration:1000})
   * @memberof TWEEN.Tween
   * @static
   */
  static to (node, to, params) {
    return Tween.fromTo(node, null, to, params)
  }
  /**
   * Easier way calling constructor only applies the `from` value, useful for CSS Animation
   * @param {Element} node DOM Element
   * @param {object} from - Initial value
   * @param {object} params - Options of tweens
   * @example Tween.from(node, {x:200}, {duration:1000})
   * @memberof TWEEN.Tween
   * @static
   */
  static from (node, from, params) {
    return Tween.fromTo(node, from, null, params)
  }
  constructor (node, object) {
    this.id = _id++;
    if (!!node && typeof node === 'object' && !object && !node.nodeType) {
      object = this.object = node;
      node = null;
    } else if (!!node && (node.nodeType || node.length || typeof node === 'string')) {
      node = this.node = Selector(node);
      object = this.object = NodeCache(node, object, this);
    }
    this._valuesEnd = null;
    this._valuesStart = Array.isArray(object) ? [] : {};

    this._duration = 1000;
    this._easingFunction = defaultEasing;
    this._easingReverse = defaultEasing;
    this._interpolationFunction = Interpolation.Linear;

    this._startTime = 0;
    this._initTime = 0;
    this._delayTime = 0;
    this._repeat = 0;
    this._r = 0;
    this._isPlaying = false;
    this._yoyo = false;
    this._reversed = false;

    this._onStartCallbackFired = false;
    this._pausedTime = null;
    this._isFinite = true;
    this._maxListener = 15;
    this._chainedTweensCount = 0;
    this._prevTime = null;

    return this
  }

  /**
   * Sets max `event` listener's count to Events system
   * @param {number} count - Event listener's count
   * @memberof TWEEN.Tween
   */
  setMaxListener (count = 15) {
    this._maxListener = count;
    return this
  }

  /**
   * Adds `event` to Events system
   * @param {string} event - Event listener name
   * @param {Function} callback - Event listener callback
   * @memberof TWEEN.Tween
   */
  on (event, callback) {
    const { _maxListener } = this;
    const callbackName = event + EVENT_CALLBACK;
    for (let i = 0; i < _maxListener; i++) {
      const callbackId = callbackName + i;
      if (!this[callbackId]) {
        this[callbackId] = callback;
        break
      }
    }
    return this
  }

  /**
   * Adds `event` to Events system.
   * Removes itself after fired once
   * @param {string} event - Event listener name
   * @param {Function} callback - Event listener callback
   * @memberof TWEEN.Tween
   */
  once (event, callback) {
    const { _maxListener } = this;
    const callbackName = event + EVENT_CALLBACK;
    for (let i = 0; i < _maxListener; i++) {
      const callbackId = callbackName + i;
      if (!this[callbackId]) {
        this[callbackId] = (...args) => {
          callback.apply(this, args);
          this[callbackId] = null;
        };
        break
      }
    }
    return this
  }

  /**
   * Removes `event` from Events system
   * @param {string} event - Event listener name
   * @param {Function} callback - Event listener callback
   * @memberof TWEEN.Tween
   */
  off (event, callback) {
    const { _maxListener } = this;
    const callbackName = event + EVENT_CALLBACK;
    for (let i = 0; i < _maxListener; i++) {
      const callbackId = callbackName + i;
      if (this[callbackId] === callback) {
        this[callbackId] = null;
      }
    }
    return this
  }

  /**
   * Emits/Fired/Trigger `event` from Events system listeners
   * @param {string} event - Event listener name
   * @memberof TWEEN.Tween
   */
  emit (event, arg1, arg2, arg3) {
    const { _maxListener } = this;
    const callbackName = event + EVENT_CALLBACK;

    if (!this[callbackName + 0]) {
      return this
    }
    for (let i = 0; i < _maxListener; i++) {
      const callbackId = callbackName + i;
      if (this[callbackId]) {
        this[callbackId](arg1, arg2, arg3);
      }
    }
    return this
  }

  /**
   * @return {boolean} State of playing of tween
   * @example tween.isPlaying() // returns `true` if tween in progress
   * @memberof TWEEN.Tween
   */
  isPlaying () {
    return this._isPlaying
  }

  /**
   * @return {boolean} State of started of tween
   * @example tween.isStarted() // returns `true` if tween in started
   * @memberof TWEEN.Tween
   */
  isStarted () {
    return this._onStartCallbackFired
  }

  /**
   * Reverses the tween state/direction
   * @example tween.reverse()
   * @param {boolean=} state Set state of current reverse
   * @memberof TWEEN.Tween
   */
  reverse (state) {
    const { _reversed } = this;

    this._reversed = state !== undefined ? state : !_reversed;

    return this
  }

  /**
   * @return {boolean} State of reversed
   * @example tween.reversed() // returns `true` if tween in reversed state
   * @memberof TWEEN.Tween
   */
  reversed () {
    return this._reversed
  }

  /**
   * Pauses tween
   * @example tween.pause()
   * @memberof TWEEN.Tween
   */
  pause () {
    if (!this._isPlaying) {
      return this
    }

    this._isPlaying = false;

    remove(this);
    this._pausedTime = now();

    return this.emit(EVENT_PAUSE, this.object)
  }

  /**
   * Play/Resume the tween
   * @example tween.play()
   * @memberof TWEEN.Tween
   */
  play () {
    if (this._isPlaying) {
      return this
    }

    this._isPlaying = true;

    this._startTime += now() - this._pausedTime;
    this._initTime = this._startTime;
    add(this);
    this._pausedTime = now();

    return this.emit(EVENT_PLAY, this.object)
  }

  /**
   * Restarts tween from initial value
   * @param {boolean=} noDelay If this param is set to `true`, restarts tween without `delay`
   * @example tween.restart()
   * @memberof TWEEN.Tween
   */
  restart (noDelay) {
    this._repeat = this._r;
    this.reassignValues();

    add(this);

    return this.emit(EVENT_RESTART, this.object)
  }

  /**
   * Seek tween value by `time`. Note: Not works as excepted. PR are welcome
   * @param {Time} time Tween update time
   * @param {boolean=} keepPlaying When this param is set to `false`, tween pausing after seek
   * @example tween.seek(500)
   * @memberof TWEEN.Tween
   * @deprecated Not works as excepted, so we deprecated this method
   */
  seek (time, keepPlaying) {
    const { _duration, _initTime, _startTime, _reversed } = this;

    let updateTime = _initTime + time;
    this._isPlaying = true;

    if (updateTime < _startTime && _startTime >= _initTime) {
      this._startTime -= _duration;
      this._reversed = !_reversed;
    }

    this.update(time, false);

    this.emit(EVENT_SEEK, time, this.object);

    return keepPlaying ? this : this.pause()
  }

  /**
   * Sets tween duration
   * @param {number} amount Duration is milliseconds
   * @example tween.duration(2000)
   * @memberof TWEEN.Tween
   * @deprecated Not works as excepted and useless, so we deprecated this method
   */
  duration (amount) {
    this._duration = typeof amount === 'function' ? amount(this._duration) : amount;

    return this
  }

  /**
   * Sets target value and duration
   * @param {object} properties Target value (to value)
   * @param {number|Object=} [duration=1000] Duration of tween
   * @example let tween = new Tween({x:0}).to({x:100}, 2000)
   * @memberof TWEEN.Tween
   */
  to (properties, duration = 1000, maybeUsed) {
    this._valuesEnd = properties;

    if (typeof duration === 'number' || typeof duration === 'function') {
      this._duration = typeof duration === 'function' ? duration(this._duration) : duration;
    } else if (typeof duration === 'object') {
      for (const prop in duration) {
        if (typeof this[prop] === 'function') {
          const [arg1 = null, arg2 = null, arg3 = null, arg4 = null] = Array.isArray(duration[prop])
            ? duration[prop]
            : [duration[prop]];
          this[prop](arg1, arg2, arg3, arg4);
        }
      }
    }

    return this
  }

  /**
   * Renders and computes value at first render
   * @private
   * @memberof TWEEN.Tween
   */
  render () {
    if (this._rendered) {
      return this
    }
    let { _valuesStart, _valuesEnd, object, node, InitialValues } = this;

    SET_NESTED(object);
    SET_NESTED(_valuesEnd);

    if (node && node.queueID && Store[node.queueID]) {
      const prevTweenByNode = Store[node.queueID];
      if (prevTweenByNode.propNormaliseRequired && prevTweenByNode.tween !== this) {
        for (const property in _valuesEnd) {
          if (prevTweenByNode.tween._valuesEnd[property] !== undefined) ;
        }
        prevTweenByNode.normalisedProp = true;
        prevTweenByNode.propNormaliseRequired = false;
      }
    }

    if (node && InitialValues) {
      if (!object || Object.keys(object).length === 0) {
        object = this.object = NodeCache(node, InitialValues(node, _valuesEnd), this);
      } else if (!_valuesEnd || Object.keys(_valuesEnd).length === 0) {
        _valuesEnd = this._valuesEnd = InitialValues(node, object);
      }
    }
    if (!_valuesStart.processed) {
      for (const property in _valuesEnd) {
        let start = object && object[property] && deepCopy(object[property]);
        let end = _valuesEnd[property];
        if (Plugins[property] && Plugins[property].init) {
          Plugins[property].init.call(this, start, end, property, object);
          if (start === undefined && _valuesStart[property]) {
            start = _valuesStart[property];
          }
          if (Plugins[property].skipProcess) {
            continue
          }
        }
        if (
          (typeof start === 'number' && isNaN(start)) ||
          start === null ||
          end === null ||
          start === false ||
          end === false ||
          start === undefined ||
          end === undefined ||
          start === end
        ) {
          continue
        }
        _valuesStart[property] = start;
        if (Array.isArray(end)) {
          if (!Array.isArray(start)) {
            end.unshift(start);
            for (let i = 0, len = end.length; i < len; i++) {
              if (typeof end[i] === 'string') {
                end[i] = decomposeString(end[i]);
              }
            }
          } else {
            if (end.isString && object[property].isString && !start.isString) {
              start.isString = true;
            } else {
              decompose(property, object, _valuesStart, _valuesEnd);
            }
          }
        } else {
          decompose(property, object, _valuesStart, _valuesEnd);
        }
        if (typeof start === 'number' && typeof end === 'string' && end[1] === '=') {
          continue
        }
      }
      _valuesStart.processed = true;
    }

    if (Tween.Renderer && this.node && Tween.Renderer.init) {
      Tween.Renderer.init.call(this, object, _valuesStart, _valuesEnd);
      this.__render = true;
    }

    this._rendered = true;

    return this
  }

  /**
   * Start the tweening
   * @param {number|string} time setting manual time instead of Current browser timestamp or like `+1000` relative to current timestamp
   * @example tween.start()
   * @memberof TWEEN.Tween
   */
  start (time) {
    this._startTime = time !== undefined ? (typeof time === 'string' ? now() + parseFloat(time) : time) : now();
    this._startTime += this._delayTime;
    this._initTime = this._prevTime = this._startTime;

    this._onStartCallbackFired = false;
    this._rendered = false;
    this._isPlaying = true;

    add(this);

    return this
  }

  /**
   * Stops the tween
   * @example tween.stop()
   * @memberof TWEEN.Tween
   */
  stop () {
    let { _isPlaying, _isFinite, object, _startTime, _duration, _r, _yoyo, _reversed } = this;

    if (!_isPlaying) {
      return this
    }

    let atStart = _isFinite ? (_r + 1) % 2 === 1 : !_reversed;

    this._reversed = false;

    if (_yoyo && atStart) {
      this.update(_startTime);
    } else {
      this.update(_startTime + _duration);
    }
    remove(this);

    return this.emit(EVENT_STOP, object)
  }

  /**
   * Set delay of tween
   * @param {number} amount Sets tween delay / wait duration
   * @example tween.delay(500)
   * @memberof TWEEN.Tween
   */
  delay (amount) {
    this._delayTime = typeof amount === 'function' ? amount(this._delayTime) : amount;

    return this
  }

  /**
   * Chained tweens
   * @param {any} arguments Arguments list
   * @example tween.chainedTweens(tween1, tween2)
   * @memberof TWEEN.Tween
   */
  chainedTweens () {
    this._chainedTweensCount = arguments.length;
    if (!this._chainedTweensCount) {
      return this
    }
    for (let i = 0, len = this._chainedTweensCount; i < len; i++) {
      this[CHAINED_TWEENS + i] = arguments[i];
    }

    return this
  }

  /**
   * Sets how times tween is repeating
   * @param {amount} amount the times of repeat
   * @example tween.repeat(5)
   * @memberof TWEEN.Tween
   */
  repeat (amount) {
    this._repeat = !this._duration ? 0 : typeof amount === 'function' ? amount(this._repeat) : amount;
    this._r = this._repeat;
    this._isFinite = isFinite(amount);

    return this
  }

  /**
   * Set delay of each repeat alternate of tween
   * @param {number} amount Sets tween repeat alternate delay / repeat alternate wait duration
   * @example tween.reverseDelay(500)
   * @memberof TWEEN.Tween
   */
  reverseDelay (amount) {
    this._reverseDelayTime = typeof amount === 'function' ? amount(this._reverseDelayTime) : amount;

    return this
  }

  /**
   * Set `yoyo` state (enables reverse in repeat)
   * @param {boolean} state Enables alternate direction for repeat
   * @param {Function=} _easingReverse Easing function in reverse direction
   * @example tween.yoyo(true)
   * @memberof TWEEN.Tween
   */
  yoyo (state, _easingReverse) {
    this._yoyo = typeof state === 'function' ? state(this._yoyo) : state === null ? this._yoyo : state;
    if (!state) {
      this._reversed = false;
    }
    this._easingReverse = _easingReverse || null;

    return this
  }

  /**
   * Set easing
   * @param {Function} _easingFunction Easing function, applies in non-reverse direction if Tween#yoyo second argument is applied
   * @example tween.easing(Easing.Elastic.InOut)
   * @memberof TWEEN.Tween
   */
  easing (_easingFunction) {
    this._easingFunction = _easingFunction;

    return this
  }

  /**
   * Set interpolation
   * @param {Function} _interpolationFunction Interpolation function
   * @example tween.interpolation(Interpolation.Bezier)
   * @memberof TWEEN.Tween
   */
  interpolation (_interpolationFunction) {
    if (typeof _interpolationFunction === 'function') {
      this._interpolationFunction = _interpolationFunction;
    }

    return this
  }

  /**
   * Reassigns value for rare-case like Tween#restart or for Timeline
   * @private
   * @memberof TWEEN.Tween
   */
  reassignValues (time) {
    const { _valuesStart, object, _delayTime } = this;

    this._isPlaying = true;
    this._startTime = time !== undefined ? time : now();
    this._startTime += _delayTime;
    this._reversed = false;
    add(this);

    for (const property in _valuesStart) {
      const start = _valuesStart[property];

      object[property] = start;
    }

    return this
  }

  /**
   * Updates initial object to target value by given `time`
   * @param {Time} time Current time
   * @param {boolean=} preserve Prevents from removing tween from store
   * @param {boolean=} forceTime Forces to be frame rendered, even mismatching time
   * @example tween.update(100)
   * @memberof TWEEN.Tween
   */
  update (time, preserve, forceTime) {
    let {
      _onStartCallbackFired,
      _easingFunction,
      _interpolationFunction,
      _easingReverse,
      _repeat,
      _delayTime,
      _reverseDelayTime,
      _yoyo,
      _reversed,
      _startTime,
      _prevTime,
      _duration,
      _valuesStart,
      _valuesEnd,
      object,
      _isFinite,
      _isPlaying,
      __render,
      _chainedTweensCount
    } = this;

    let elapsed;
    let currentEasing;
    let property;
    let propCount = 0;

    if (!_duration) {
      elapsed = 1;
      _repeat = 0;
    } else {
      time = time !== undefined ? time : now();

      let delta = time - _prevTime;
      this._prevTime = time;
      if (delta > TOO_LONG_FRAME_MS && isRunning() && isLagSmoothing()) {
        time -= delta - FRAME_MS;
      }

      if (!_isPlaying || (time < _startTime && !forceTime)) {
        return true
      }

      elapsed = (time - _startTime) / _duration;
      elapsed = elapsed > 1 ? 1 : elapsed;
      elapsed = _reversed ? 1 - elapsed : elapsed;
    }

    if (!_onStartCallbackFired) {
      if (!this._rendered) {
        this.render();
        this._rendered = true;
      }

      this.emit(EVENT_START, object);

      this._onStartCallbackFired = true;
    }

    currentEasing = _reversed ? _easingReverse || _easingFunction : _easingFunction;

    if (!object) {
      return true
    }

    for (property in _valuesEnd) {
      const start = _valuesStart[property];
      if ((start === undefined || start === null) && !(Plugins[property] && Plugins[property].update)) {
        continue
      }
      const end = _valuesEnd[property];
      const value = currentEasing[property]
        ? currentEasing[property](elapsed)
        : typeof currentEasing === 'function'
          ? currentEasing(elapsed)
          : defaultEasing(elapsed);
      const _interpolationFunctionCall = _interpolationFunction[property]
        ? _interpolationFunction[property]
        : typeof _interpolationFunction === 'function'
          ? _interpolationFunction
          : Interpolation.Linear;

      if (typeof end === 'number') {
        object[property] = start + (end - start) * value;
      } else if (Array.isArray(end) && !end.isString && !Array.isArray(start)) {
        object[property] = _interpolationFunctionCall(end, value, object[property]);
      } else if (end && end.update) {
        end.update(value);
      } else if (typeof end === 'function') {
        object[property] = end(value);
      } else if (typeof end === 'string' && typeof start === 'number') {
        object[property] = start + parseFloat(end[0] + end.substr(2)) * value;
      } else {
        recompose(property, object, _valuesStart, _valuesEnd, value, elapsed);
      }
      if (Plugins[property] && Plugins[property].update) {
        Plugins[property].update.call(this, object[property], start, end, value, elapsed, property);
      }
      propCount++;
    }

    if (!propCount) {
      remove(this);
      return false
    }

    if (__render && Tween.Renderer && Tween.Renderer.update) {
      Tween.Renderer.update.call(this, object, elapsed);
    }

    this.emit(EVENT_UPDATE, object, elapsed, time);

    if (elapsed === 1 || (_reversed && elapsed === 0)) {
      if (_repeat > 0 && _duration > 0) {
        if (_isFinite) {
          this._repeat--;
        }

        if (_yoyo) {
          this._reversed = !_reversed;
        } else {
          for (property in _valuesEnd) {
            let end = _valuesEnd[property];
            if (typeof end === 'string' && typeof _valuesStart[property] === 'number') {
              _valuesStart[property] += parseFloat(end[0] + end.substr(2));
            }
          }
        }

        this.emit(_yoyo && !_reversed ? EVENT_REVERSE : EVENT_REPEAT, object);

        if (_reversed && _reverseDelayTime) {
          this._startTime = time - _reverseDelayTime;
        } else {
          this._startTime = time + _delayTime;
        }

        return true
      } else {
        if (!preserve) {
          this._isPlaying = false;
          remove(this);
          _id--;
        }
        this.emit(EVENT_COMPLETE, object);
        this._repeat = this._r;

        if (_chainedTweensCount) {
          for (let i = 0; i < _chainedTweensCount; i++) {
            this[CHAINED_TWEENS + i].start(time + _duration);
          }
        }

        return false
      }
    }

    return true
  }
}

export { Easing, Tween, autoPlay };
