import TinyQueue from 'tinyqueue';
import List from 'collections/list';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var Constants = {
  /**
   * Minimum width/height of a {@link QuadTree cell}.
   */
  MIN_CELL_SIZE: 1e-8,

  /**
   * Factor of average number of entities a glyph should represent before
   * it is considered to be a {@link Glyph big glyph}.
   */
  BIG_GLYPH_FACTOR: 100,

  /**
   * The maximum number of glyphs that should intersect any leaf
   * {@link QuadTree cell} at any point in time. Cells will split when
   * this constant is about to be violated, and will join when a glyph
   * is removed from a cell and joining would not violate this.
   */
  MAX_GLYPHS_PER_CELL: 10,

  /**
   * Number of merge events that a glyph will record at most. This is not
   * strictly enforced by the glyph itself, but should be respected by the
   * {@link FirstMergeRecorder} and other code that records merges.
   *
   * More merges can be recorded with a glyph when many merges occur at the
   * exact same time.
   */
  MAX_MERGES_TO_RECORD: 4,

  /**
   * Whether the big glyph optimization should be used.
   */
  BIG_GLYPHS: false,

  /**
   * Whether merge events are to be created for all pairs of glyphs, or only
   * the first one. Setting this to `true` implies a performance hit.
   * <p>
   * This constant will also determine whether all out of cell events are
   * put into the global event queue (`true`), or not.
   * <p>
   * high values when setting this to `true`, or you need to allocate
   * more memory to the clustering process for large data sets.
   */
  ROBUST: false,

  /**
   * When {@link #ROBUST} is `false`, this flag toggles behavior where
   * glyphs track which glyphs think they'll merge with them first. Merge
   * events are then updated for tracking glyphs, as glyphs merge.
   * <p>
   * {@link #ROBUST}, except for CPU time instead of memory.
   */
  TRACK: true,

  /**
   * Whether messages should be logged at all. This overrides logging
   * configuration from `logging.properties` (but only negatively,
   *
   * it will not log messages when this is disabled in `logging.properties`.
   */
  LOGGING_ENABLED: true,

  /**
   * Whether some statistics should be collected that may be time-intensive
   * to collect. Disable this before measuing running time, just in case.
   */
  STATS_ENABLED: false,

  /**
   * Whether timers should be used to track wall clock computation time.
   */
  TIMERS_ENABLED: true
};

function isRectangle2D(item) {
  return item === null || item instanceof Rectangle2D;
}
var Rectangle2D = /*#__PURE__*/function () {
  function Rectangle2D(x, y, w, h) {
    _classCallCheck(this, Rectangle2D);

    _defineProperty(this, "x", void 0);

    _defineProperty(this, "y", void 0);

    _defineProperty(this, "width", void 0);

    _defineProperty(this, "height", void 0);

    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }
  /**
   * @deprecated use #x
   */


  _createClass(Rectangle2D, [{
    key: "getX",
    value: function getX() {
      return this.x;
    }
    /**
     * @deprecated use #width
     */

  }, {
    key: "getWidth",
    value: function getWidth() {
      return this.width;
    }
    /**
     * @deprecated use #y
     */

  }, {
    key: "getY",
    value: function getY() {
      return this.y;
    }
    /**
     * @deprecated use #height
     */

  }, {
    key: "getHeight",
    value: function getHeight() {
      return this.height;
    }
  }, {
    key: "getMinX",
    value: function getMinX() {
      return this.x;
    }
  }, {
    key: "getMaxX",
    value: function getMaxX() {
      return this.x + this.width;
    }
  }, {
    key: "getMinY",
    value: function getMinY() {
      return this.y;
    }
  }, {
    key: "getMaxY",
    value: function getMaxY() {
      return this.y + this.height;
    }
  }, {
    key: "contains",
    value: function contains(x, y) {
      var x0 = this.getX();
      var y0 = this.getY();
      return x >= x0 && y >= y0 && x < x0 + this.getWidth() && y < y0 + this.getHeight();
    }
  }, {
    key: "getCenterX",
    value: function getCenterX() {
      return this.getX() + this.getWidth() / 2.0;
    }
  }, {
    key: "getCenterY",
    value: function getCenterY() {
      return this.getY() + this.getHeight() / 2.0;
    }
  }]);

  return Rectangle2D;
}();

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayLikeToArray$b(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _unsupportedIterableToArray$b(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray$b(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$b(o, minLen);
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray$b(arr, i) || _nonIterableRest();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray$b(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray$b(arr) || _nonIterableSpread();
}

var _Symbol$iterator$2;

_Symbol$iterator$2 = Symbol.iterator;
var HashSet = /*#__PURE__*/function () {
  function HashSet() {
    var values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, HashSet);

    _defineProperty(this, "__internal", void 0);

    this.__internal = new Set(values);
  }

  _createClass(HashSet, [{
    key: "add",
    value: function add(item) {
      if (this.__internal.has(item)) {
        return false;
      }

      this.__internal.add(item);

      return true;
    }
  }, {
    key: _Symbol$iterator$2,
    value: function value() {
      return this.__internal[Symbol.iterator]();
    }
  }]);

  return HashSet;
}();

var Collectors = /*#__PURE__*/function () {
  function Collectors() {
    _classCallCheck(this, Collectors);
  }

  _createClass(Collectors, null, [{
    key: "toCollection",
    value:
    /**
     * @deprecated useless in js
     * @param create
     */
    function toCollection(create) {
      return create;
    }
  }, {
    key: "toList",
    value: function toList() {
      return function (p1) {
        return p1;
      };
    }
  }, {
    key: "toSet",
    value: function toSet() {
      return function (items) {
        return Array.from(new HashSet(items));
      };
    }
  }]);

  return Collectors;
}();

var _Symbol$iterator$1;

function _createSuper$8(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$9(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$9() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
_Symbol$iterator$1 = Symbol.iterator;
var ArrayList = /*#__PURE__*/function () {
  function ArrayList(size) {
    _classCallCheck(this, ArrayList);

    _defineProperty(this, "__internal", void 0);

    this.__internal = [];
  }

  _createClass(ArrayList, [{
    key: "toString",
    value: function toString() {
      return "[".concat(this.__internal.join(", "), "]");
    }
  }, {
    key: "addI",
    value: function addI(index, value) {
      this.__internal.splice(index, 0, value);
    }
  }, {
    key: "add",
    value: function add(value) {
      this.__internal.push(value);

      return true;
    }
  }, {
    key: "addAll",
    value: function addAll(values) {
      var _this$__internal;

      return this.__internal.length === (_this$__internal = this.__internal).push.apply(_this$__internal, _toConsumableArray(values));
    }
  }, {
    key: _Symbol$iterator$1,
    value: function value() {
      return this.__internal[Symbol.iterator]();
    }
  }, {
    key: "length",
    get: function get() {
      return this.__internal.length;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.__internal = [];
    }
    /**
     * @deprecated useless in js
     */

  }, {
    key: "stream",
    value: function stream() {
      return new Stream(this.__internal);
    }
  }, {
    key: "get",
    value: function get(index) {
      return this.__internal[index];
    }
  }, {
    key: "contains",
    value: function contains(glyph) {
      return this.__internal.includes(glyph);
    }
  }, {
    key: "size",
    value: function size() {
      return this.__internal.length;
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      return this.__internal.length === 0;
    }
  }, {
    key: "removeI",
    value: function removeI(index) {
      if (index === -1) {
        throw new Error("IndexOutOfBoundsException");
      }

      var _this$__internal$spli = this.__internal.splice(index, 1),
          _this$__internal$spli2 = _slicedToArray(_this$__internal$spli, 1),
          item = _this$__internal$spli2[0];

      return item;
    }
  }, {
    key: "remove",
    value: function remove(item) {
      var index = this.__internal.indexOf(item);

      if (index === -1) {
        return false;
      }

      this.__internal.splice(index, 1);

      return true;
    }
  }, {
    key: "set",
    value: function set(index, item) {
      var old = this.__internal[index];

      if (old === undefined) {
        throw new Error("OutOfBoundException");
      }

      this.__internal[index] = item;
      return old;
    }
  }, {
    key: "poll",
    value: function poll() {
      return this.__internal.shift();
    }
  }, {
    key: "pollLast",
    value: function pollLast() {
      return this.__internal.pop();
    }
  }, {
    key: "getLast",
    value: function getLast() {
      return this.__internal[this.__internal.length - 1];
    }
  }, {
    key: "addFirst",
    value: function addFirst(item) {
      return this.__internal.unshift(item);
    }
  }, {
    key: "sort",
    value: function sort(comparator) {
      return this.__internal.sort(comparator);
    }
  }, {
    key: "toArray",
    value: function toArray() {
      return Array.from(this.__internal);
    }
  }, {
    key: "copy",
    value: function copy() {
      return ArrayList.__new(Array.from(this.__internal));
    }
  }, {
    key: "sorted",
    value: function sorted() {}
  }], [{
    key: "__new",
    value: function __new(list) {
      var arr = new ArrayList();
      arr.__internal = list;
      return arr;
    }
  }]);

  return ArrayList;
}();

var Optional = /*#__PURE__*/function () {
  function Optional(value) {
    _classCallCheck(this, Optional);

    _defineProperty(this, "value", void 0);

    this.value = value;
  }

  _createClass(Optional, [{
    key: "get",
    value: function get() {
      if (this.value === null) {
        throw new Error("null pointer exception XD");
      }

      return this.value;
    }
  }]);

  return Optional;
}();

var Stream = /*#__PURE__*/function () {
  function Stream(array) {
    _classCallCheck(this, Stream);

    _defineProperty(this, "__internal", void 0);

    this.__internal = array;
  }

  _createClass(Stream, [{
    key: "length",
    get: function get() {
      return this.__internal.length;
    }
  }, {
    key: "filter",
    value: function filter(callbackfn) {
      this.__internal = this.__internal.filter(callbackfn);
      return this;
    }
  }, {
    key: "collect",
    value: function collect(toCollection) {
      return toCollection(this.__internal);
    }
  }, {
    key: "map",
    value: function map(callbackfn) {
      return new Stream(this.__internal.map(callbackfn));
    }
  }, {
    key: "mapToInt",
    value: function mapToInt(callbackfn) {
      return new NumberStream(this.__internal.map(callbackfn));
    }
  }, {
    key: "max",
    value: function max(comparator) {
      var result = this.__internal.reduce(function (max, item) {
        if (max === null) return item;
        var result = comparator(max, item); // max < item

        if (result < 0) return item;
        return max;
      }, null);

      return new Optional(result);
    }
  }, {
    key: "sorted",
    value: function sorted(comparator) {
      this.__internal.sort(comparator);

      return this;
    }
  }, {
    key: "toArray",
    value: function toArray() {
      return this.__internal;
    }
  }, {
    key: "forEach",
    value: function forEach(callbackfn) {
      this.__internal.forEach(callbackfn);
    }
  }, {
    key: "parallel",
    value: function parallel() {
      return this;
    }
  }, {
    key: "flatMap",
    value: function flatMap(callbackfn) {
      return new Stream(this.__internal.flatMap(callbackfn));
    }
  }, {
    key: "iterator",
    value: function iterator() {
      return this.__internal.values();
    }
  }, {
    key: "distinct",
    value: function distinct() {
      return new Stream(this.collect(Collectors.toSet()));
    }
  }]);

  return Stream;
}();

var NumberStream = /*#__PURE__*/function (_Stream) {
  _inherits(NumberStream, _Stream);

  var _super = _createSuper$8(NumberStream);

  function NumberStream() {
    _classCallCheck(this, NumberStream);

    return _super.apply(this, arguments);
  }

  _createClass(NumberStream, [{
    key: "sum",
    value: function sum() {
      return this.__internal.reduce(function (sum, value) {
        return sum + value;
      }, 0);
    }
  }]);

  return NumberStream;
}(Stream);

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

var PriorityQueue = /*#__PURE__*/function () {
  function PriorityQueue(n) {
    _classCallCheck(this, PriorityQueue);

    _defineProperty(this, "__internal", void 0);

    this.__internal = new TinyQueue([], function (a, b) {
      return a.compareTo(b);
    });
  }

  _createClass(PriorityQueue, [{
    key: "add",
    value: function add(merge) {
      this.__internal.push(merge);

      return true;
    }
  }, {
    key: "peek",
    value: function peek() {
      return this.__internal.peek();
    }
  }, {
    key: "poll",
    value: function poll() {
      return this.__internal.pop();
    }
  }, {
    key: "size",
    value: function size() {
      return this.__internal.length;
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      return this.__internal.length === 0;
    }
  }]);

  return PriorityQueue;
}();

var StringBuilder = /*#__PURE__*/function () {
  function StringBuilder(str) {
    _classCallCheck(this, StringBuilder);

    _defineProperty(this, "__internal", void 0);

    this.__internal = str !== null && str !== void 0 ? str : '';
  }

  _createClass(StringBuilder, [{
    key: "append",
    value: function append(s) {
      this.__internal += s;
      return this;
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.__internal;
    }
  }, {
    key: "length",
    value: function length() {
      return this.__internal.length;
    }
  }]);

  return StringBuilder;
}();

var Utils = /*#__PURE__*/function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _createClass(Utils, null, [{
    key: "clamp",
    value:
    /**
     * Epsilon, useful for double comparison.
     */

    /**
     * Clamp a given value to within the given range.
     *
     * @param value Value to clamp.
     * @param min   Minimum value to return.
     * @param max   Maximum value to return.
     * @return The value closest to {@code value} that is within the closed
     * interval {@code [min, max]}.
     */
    function clamp(value, min, max) {
      if (value < min) {
        return min;
      }

      return Math.min(value, max);
    }
    /**
     * Returns the Euclidean distance between two points {@code p} and {@code q}.
     */

  }, {
    key: "euclidean",
    value: function euclidean() {
      if (arguments.length === 4 && typeof (arguments.length <= 0 ? undefined : arguments[0]) === "number" && typeof (arguments.length <= 1 ? undefined : arguments[1]) === "number" && typeof (arguments.length <= 2 ? undefined : arguments[2]) === "number" && typeof (arguments.length <= 3 ? undefined : arguments[3]) === "number") {
        return this.__euclideanAABB.apply(this, arguments);
      } else if (arguments.length === 3 && isRectangle2D(arguments.length <= 0 ? undefined : arguments[0]) && typeof (arguments.length <= 1 ? undefined : arguments[1]) === "number" && typeof (arguments.length <= 2 ? undefined : arguments[2]) === "number") {
        return this.__euclideanRectangleXY.apply(this, arguments);
      }

      throw new Error("unable to resolve");
    }
    /**
     * Returns the Euclidean distance between two points {@code p} and {@code q}.
     */

  }, {
    key: "__euclideanAABB",
    value: function __euclideanAABB(px, py, qx, qy) {
      return Math.hypot(qx - px, qy - py); // const dx = qx - px;
      // const dy = qy - py;
      // return Math.sqrt(dx * dx + dy * dy);
    }
    /**
     * Returns the minimum Euclidean distance between a point and any point in
     * the given rectangle. This will in particular return -1 when the given
     * point is contained in the rectangle.
     */

  }, {
    key: "__euclideanRectangleXY",
    value: function __euclideanRectangleXY(rect, px, py) {
      if (rect.contains(px, py)) {
        return -1;
      } // determine the distance between the point and the point projected
      // onto the rectangle, or clamped into it, so to say


      return this.__euclideanAABB(px, py, this.clamp(px, rect.getMinX(), rect.getMaxX()), this.clamp(py, rect.getMinY(), rect.getMaxY()));
    }
    /**
     * Returns the index of an object in an array, or -1 if it cannot be found.
     * Uses {@link Object#equals(Object)} to compare objects.
     * @deprecated use Array#indexOf
     */

  }, {
    key: "indexOf",
    value: function indexOf(haystack, needle) {
      for (var i = 0; i < haystack.length; ++i) {
        if (haystack[i] == null && needle == null || needle != null && needle === haystack[i]) {
          return i;
        }
      }

      return -1;
    }
    /**
     * Given two intervals [min, max], return whether they overlap. This method
     * uses at most two comparisons and no branching.
     *
     * @see #openIntervalsOverlap(double[], double[])
     */

  }, {
    key: "intervalsOverlap",
    value: function intervalsOverlap(a, b) {
      return a[1] >= b[0] && a[0] <= b[1];
    }
    /**
     * GIven an iterator, return a fresh iterable instance wrapping the iterator.
     * The returned iterable can only be used once, after that it will throw an
     * {@link Error}.
     *
     * @param iterator Iterator to be wrapped.
     * @deprecated i don't even understand why someone wants to do that !
     */

  }, {
    key: "iterable",
    value: function iterable(_iterator) {
      var _Symbol$iterator;

      return new (_Symbol$iterator = Symbol.iterator, /*#__PURE__*/function () {
        function NewIterable() {
          _classCallCheck(this, NewIterable);

          _defineProperty(this, "callCount", 0);
        }

        _createClass(NewIterable, [{
          key: _Symbol$iterator,
          value: function value() {
            if (++this.callCount === 1) {
              return _iterator;
            } // can only be iterated once


            throw new Error(" can only be iterated once");
          }
          /**
           * @deprecated useless in js
           */

        }, {
          key: "iterator",
          value: function iterator() {
            if (++this.callCount === 1) {
              return _iterator;
            } // can only be iterated once


            throw new Error(" can only be iterated once");
          }
        }]);

        return NewIterable;
      }())();
    }
    /**
     * Join a bunch of strings, ignoring empty strings, with a custom glue.
     *
     * @param glue    String to insert between non-empty strings.
     * @param strings Strings to join.
     * @deprecated really useless in js
     */

  }, {
    key: "join",
    value: function join(glue) {
      var sb = new StringBuilder();

      for (var _len = arguments.length, strings = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        strings[_key - 1] = arguments[_key];
      }

      for (var _i = 0, _strings = strings; _i < _strings.length; _i++) {
        var str = _strings[_i];

        if (sb.length() > 0 && str.length !== 0) {
          sb.append(glue);
        }

        sb.append(str);
      }

      return sb.toString();
    }
    /**
     * Given an array of keys and a map, return an array with all values in the
     * same order as the keys in the input array were.
     *
     * @param keys   Keys to look up.
     * @param map    Map to be used for mapping.
     * @param result Array to write results into. Should have appropriate length.
     */

  }, {
    key: "map",
    value: function map(keys, _map, result) {
      for (var i = 0; i < keys.length; ++i) {
        result[i] = _map.get(keys[i]);
      }

      return result;
    }
    /**
     * Given a zero-width or zero-height rectangle, return if that line segment
     * is on the border of the given rectangle.
     *
     * @param side Line segment to consider.
     * @param rect Rectangle to consider.
     */

  }, {
    key: "onBorderOf",
    value: function onBorderOf(side, rect) {
      return side.getWidth() == 0 && (side.getX() == rect.getMinX() || side.getX() == rect.getMaxX()) && side.getMinY() >= rect.getMinY() && side.getMaxY() <= rect.getMaxY() || side.getHeight() == 0 && (side.getY() == rect.getMinY() || side.getY() == rect.getMaxY()) && side.getMinX() >= rect.getMinX() && side.getMaxX() <= rect.getMaxX();
    }
    /**
     * Given two intervals (min, max), return whether they overlap. This method
     * uses at most two comparisons and no branching.
     *
     * @see #intervalsOverlap(double[], double[])
     */

  }, {
    key: "openIntervalsOverlap",
    value: function openIntervalsOverlap(a, b) {
      return a[1] > b[0] && a[0] < b[1];
    }
    /**
     * Given an iterator, return the number of items in it.
     *
     * @param iterator Iterator that will be iterated to determine the number of
     *                 items it iterates over (when passed to this function).
     * @deprecated really, wtf ?
     */

  }, {
    key: "size",
    value: function size(iterator) {
      var count = 0;
      var res = {
        done: false,
        value: null
      };

      for (; !res.done; res = iterator.next()) {
        count++;
      }

      return count;
    }
    /**
     * Swap two objects from two lists.
     *
     * @param listA  First list.
     * @param indexA Index of item in first list to swap with second.
     * @param listB  Second list.
     * @param indexB Index of item in second list to swap with first.
     */

  }, {
    key: "swap",
    value: function swap(listA, indexA, listB, indexB) {
      var tmp = listA.get(indexA);
      listA.set(indexA, listB.get(indexB));
      listB.set(indexB, tmp);
    }
  }]);

  return Utils;
}();

_defineProperty(Utils, "EPS", 1e-7);

_defineProperty(Utils, "Double", /*#__PURE__*/function () {
  function Double() {
    _classCallCheck(this, Double);
  }

  _createClass(Double, null, [{
    key: "eq",
    value:
    /**
     * Returns whether two double values are equal, up to a difference
     * of {@link Utils#EPS}. This accounts for inaccuracies.
     */
    function eq(a, b) {
      return Math.abs(a - b) <= Utils.EPS;
    }
    /**
     * Returns whether two double values are equal, meaning their
     * difference is greater than {@link Utils#EPS}.
     */

  }, {
    key: "neq",
    value: function neq(a, b) {
      return !this.eq(a, b);
    }
  }]);

  return Double;
}());

function String__length(v) {
  return v.length;
}
var Units;
/**
 * shadowing locales
 */

(function (Units) {
  Units[Units["NANOSECONDS"] = 1] = "NANOSECONDS";
  Units[Units["MICROSECONDS"] = 1000] = "MICROSECONDS";
  Units[Units["MILLISECONDS"] = 1000000] = "MILLISECONDS";
  Units[Units["SECONDS"] = 1000000000] = "SECONDS";
})(Units || (Units = {}));

function _createSuper$7(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$8(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$8() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var Shape = /*#__PURE__*/function (_Rectangle2D) {
  _inherits(Shape, _Rectangle2D);

  var _super = _createSuper$7(Shape);

  function Shape() {
    _classCallCheck(this, Shape);

    return _super.apply(this, arguments);
  }

  _createClass(Shape, [{
    key: "getBounds2D",
    value: function getBounds2D() {
      return this;
    }
  }]);

  return Shape;
}(Rectangle2D);
var GrowFunction = /*#__PURE__*/function () {
  function GrowFunction() {
    _classCallCheck(this, GrowFunction);
  }

  _createClass(GrowFunction, null, [{
    key: "__distGlyphGlyph",
    value: // /**
    //  * Returns the distance between two glyphs. This is the distance the glyphs
    //  * have to bridge before their borders will touch. Effectively, this method
    //  * returns the distance between their center points minus the widths of
    //  * their respective borders. The value returned by this method may be
    //  * negative in case the borders of glyphs overlap.
    //  *
    //  * @param a First glyph.
    //  * @param b Second glyph.
    //  * @deprecated
    //  */
    // static dist(a: Glyph, b: Glyph): number;
    // /**
    //  * Returns the minimum distance between a glyph and any point in the given
    //  * rectangle. This will in particular return {@link Double#NEGATIVE_INFINITY}
    //  * when the given glyph's center point is contained in the rectangle. It will
    //  * return a negative value when the border of a glyph overlaps the rectangle,
    //  * even when the glyph center point is right outside the rectangle.
    //  *
    //  * <p>As with {@link #dist(Glyph, Glyph)}, this method takes the border
    //  * width of the glyph into account. This means that it effectively returns
    //  * the minimum distance between the center point of the glyph and the
    //  * rectangle, minus the width of the glyph's border.
    //  *
    //  * @param rect Description of rectangle.
    //  * @param g    Glyph to consider.
    //  * @deprecated
    //  */
    // static dist(rect: Rectangle2D, g: Glyph): number;
    // static dist(a: Glyph | Rectangle2D, b: Glyph): number {
    //   if (a === null) throw Error("unable to resolve");
    //
    //   if (isGlyph(a)) {
    //     return this.__distGlyphGlyph(a, b);
    //   } else if (isRectangle2D(a)) {
    //     return this.__distRectangleGlyph(a, b);
    //   }
    //
    //   throw Error("unable to resolve");
    // }

    /**
     * Returns the distance between two glyphs. This is the distance the glyphs
     * have to bridge before their borders will touch. Effectively, this method
     * returns the distance between their center points minus the widths of
     * their respective borders. The value returned by this method may be
     * negative in case the borders of glyphs overlap.
     *
     * @param a First glyph.
     * @param b Second glyph.
     */
    function __distGlyphGlyph(a, b) {
      return Utils.euclidean(a.getX(), a.getY(), b.getX(), b.getY());
    }
    /**
     * Returns the minimum distance between a glyph and any point in the given
     * rectangle. This will in particular return {@link Double#NEGATIVE_INFINITY}
     * when the given glyph's center point is contained in the rectangle. It will
     * return a negative value when the border of a glyph overlaps the rectangle,
     * even when the glyph center point is right outside the rectangle.
     *
     * <p>As with {@link #dist(Glyph, Glyph)}, this method takes the border
     * width of the glyph into account. This means that it effectively returns
     * the minimum distance between the center point of the glyph and the
     * rectangle, minus the width of the glyph's border.
     *
     * @param rect Description of rectangle.
     * @param g    Glyph to consider.
     */

  }, {
    key: "__distRectangleGlyph",
    value: function __distRectangleGlyph(rect, g) {
      var d = Utils.__euclideanRectangleXY(rect, g.getX(), g.getY());

      if (d < 0) {
        return Number.NEGATIVE_INFINITY;
      }

      return d;
    }
    /**
     * Returns at which zoom level a glyph touches the given side of the given
     * cell. The glyph is scaled using this {@link GrowFunction}.
     *
     * @param glyph Growing glyph.
     * @param cell  Cell that glyph is assumed to be inside of, altough if not
     *              the time of touching is still correctly calculated.
     * @param side  Side of cell for which calculation should be done.
     * @return Zoom level at which {@code glyph} touches {@code side} side of
     * {@code cell}.
     */

  }, {
    key: "exitAt",
    value: function exitAt(glyph, cell, side) {
      return this.__intersectAtRectangleGlyph(cell.getSide(side), glyph);
    } // /**
    //  * Returns at which zoom level two glyphs will touch. Both glyphs are
    //  * scaled using this {@link GrowFunction}.
    //  *
    //  * @param a First glyph.
    //  * @param b Second glyph.
    //  * @return Zoom level at which {@code a} and {@code b} touch. Returns
    //  * {@link Double#NEGATIVE_INFINITY} if the two glyphs share coordinates.
    //  * @deprecated
    //  */
    // static intersectAt(a: Glyph, b: Glyph): number;
    // /**
    //  * Returns at which zoom level a glyph touches a static rectangle. The
    //  * glyph is scaled using this {@link GrowFunction}.
    //  *
    //  * @param r Static rectangle.
    //  * @param g Growing glyph.
    //  * @return Zoom level at which {@code r} and {@code glyph} touch. If the glyph
    //  * is contained in the rectangle, {@link Double#NEGATIVE_INFINITY} must be
    //  * returned. A negative value may still be returned in case the
    //  * {@code glyph} is right outside {@code r}, but its border overlaps it.
    //  * @deprecated
    //  */
    // static intersectAt(r: Rectangle2D, g: Glyph): number;
    // /**
    //  * Same as {@link #intersectAt(Rectangle2D, Glyph)}, just with different order
    //  * of parameters. This is a convenience function.
    //  * @deprecated
    //  */
    // static intersectAt(glyph: Glyph, r: Rectangle2D): number;
    // static intersectAt(a: Glyph | Rectangle2D, b: Glyph | Rectangle2D): number {
    //   if (a === null || b === null) {
    //     throw new Error("unable to resolve");
    //   }
    //   if (isGlyph(a) && isGlyph(b)) {
    //     return this.__intersectAtGlyphGlyph(a, b);
    //   } else if (isGlyph(a) && isRectangle2D(b)) {
    //     return this.__intersectAtGlyphRectangle(a, b);
    //   } else if (isRectangle2D(a) && isGlyph(b)) {
    //     return this.__intersectAtRectangleGlyph(a, b);
    //   }
    //   throw new Error("unable to resolve");
    // }

    /**
     * Returns at which zoom level two glyphs will touch. Both glyphs are
     * scaled using this {@link GrowFunction}.
     *
     * @param a First glyph.
     * @param b Second glyph.
     * @return Zoom level at which {@code a} and {@code b} touch. Returns
     * {@link Double#NEGATIVE_INFINITY} if the two glyphs share coordinates.
     */

  }, {
    key: "__intersectAtGlyphGlyph",
    value: function __intersectAtGlyphGlyph(a, b) {
      if (a.hasSamePositionAs(b)) {
        return Number.NEGATIVE_INFINITY;
      }

      return this.__distGlyphGlyph(a, b) / (this.weight(a) + this.weight(b));
    }
    /**
     * Returns at which zoom level a glyph touches a static rectangle. The
     * glyph is scaled using this {@link GrowFunction}.
     *
     * @param r Static rectangle.
     * @param g Growing glyph.
     * @return Zoom level at which {@code r} and {@code glyph} touch. If the glyph
     * is contained in the rectangle, {@link Double#NEGATIVE_INFINITY} must be
     * returned. A negative value may still be returned in case the
     * {@code glyph} is right outside {@code r}, but its border overlaps it.
     */

  }, {
    key: "__intersectAtRectangleGlyph",
    value: function __intersectAtRectangleGlyph(r, g) {
      var d = this.__distRectangleGlyph(r, g);

      if (!Number.isFinite(d)) {
        return d;
      }

      return d / this.weight(g);
    }
    /**
     * Same as {@link #intersectAt(Rectangle2D, Glyph)}, just with different order
     * of parameters. This is a convenience function.
     */

  }, {
    key: "__intersectAtGlyphRectangle",
    value: function __intersectAtGlyphRectangle(glyph, r) {
      return this.__intersectAtRectangleGlyph(r, glyph);
    }
    /**
     * Returns the radius of the given glyph at the given time stamp/zoom level.
     *
     * <p>The radius of a glyph is non-negative.
     *
     * @param g  Glyph to calculate radius of.
     * @param at Time stamp/zoom level to determine radius at.
     */

  }, {
    key: "radius",
    value: function radius(g, at) {
      return Math.max(0, at) * this.weight(g);
    }
  }, {
    key: "sizeAt",
    value: function sizeAt(g, at) {
      var r = this.radius(g, at);
      return new Shape(g.getX() - r, g.getY() - r, 2 * r, 2 * r);
    }
    /**
     * Given a glyph, return the weight of that glyph. This will normally be the
     * number of entities represented by the glyph, but it may be multiplied by
     * a compression factor if thresholds have been added and apply.
     *
     * @param glyph Glyph to read weight of.
     */

  }, {
    key: "weight",
    value: function weight(glyph) {
      return Math.sqrt(glyph.getN());
    }
  }]);

  return GrowFunction;
}();

function _createSuper$6(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$7(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$7() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var UncertainQueue = /*#__PURE__*/function (_PriorityQueue) {
  _inherits(UncertainQueue, _PriorityQueue);

  var _super = _createSuper$6(UncertainQueue);

  function UncertainQueue() {
    var _this;

    _classCallCheck(this, UncertainQueue);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "\u03B1", void 0);

    _this.α = 1;
    return _this;
  }

  _createClass(UncertainQueue, [{
    key: "add",
    value: function add(merge) {
      var t = merge.computeAt();
      merge.setLowerBound(t / this.α);
      return _get(_getPrototypeOf(UncertainQueue.prototype), "add", this).call(this, merge);
    }
  }, {
    key: "peek",
    value: function peek() {
      while (!this.isEmpty()) {
        var merge = _get(_getPrototypeOf(UncertainQueue.prototype), "peek", this).call(this);

        var wth = merge.getSmallGlyph();

        if (!wth.isAlive()) {
          _get(_getPrototypeOf(UncertainQueue.prototype), "poll", this).call(this);

          continue; // try the next event
        } // check if event is the first


        var t = merge.computeAt();
        var τ = merge.getLowerBound();

        if (Utils.Double.eq(t, this.α * τ)) {
          return merge;
        } // if not, update its key and reinsert


        _get(_getPrototypeOf(UncertainQueue.prototype), "poll", this).call(this);

        merge.setLowerBound(t / this.α);

        _get(_getPrototypeOf(UncertainQueue.prototype), "add", this).call(this, merge);
      }

      return null;
    }
  }, {
    key: "poll",
    value: function poll() {
      // ensure that the actual first event is the head of the queue
      if (this.peek() == null) {
        return null;
      } // return it if there is one


      return _get(_getPrototypeOf(UncertainQueue.prototype), "poll", this).call(this);
    }
    /**
     * Update α to maintain the invariant.
     *
     * @param event Event that caused need for updating α.
     */

  }, {
    key: "updateAlpha",
    value: function updateAlpha(event) {
      var bigRadius = GrowFunction.radius(event.getGlyphs()[0], event.getAt());
      var smallRadius = GrowFunction.radius(event.getGlyphs()[1], event.getAt());

      if (bigRadius < smallRadius) {
        var tmp = smallRadius;
        smallRadius = bigRadius;
        bigRadius = tmp;
      }

      this.α = (bigRadius - smallRadius) / (bigRadius + smallRadius) * this.α;
    }
  }]);

  return UncertainQueue;
}(PriorityQueue);

var Type = /*#__PURE__*/function () {
  function Type(name, priority) {
    _classCallCheck(this, Type);

    _defineProperty(this, "name", void 0);

    _defineProperty(this, "priority", void 0);

    this.name = name;
    this.priority = priority;
  }

  _createClass(Type, [{
    key: "toString",
    value: function toString() {
      return this.name + ' event';
    }
  }], [{
    key: "values",
    value: function values() {
      return this._values;
    }
  }]);

  return Type;
}();

_defineProperty(Type, "MERGE", new Type('merge', 0));

_defineProperty(Type, "OUT_OF_CELL", new Type('out of cell', 10));

_defineProperty(Type, "_values", [Type.OUT_OF_CELL, Type.MERGE]);

function _createForOfIteratorHelper$a(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$a(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$a(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$a(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$a(o, minLen); }

function _arrayLikeToArray$a(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var Event = /*#__PURE__*/function () {
  /**
   * Timestamp/zoom level at which the event occurs.
   */

  /**
   * Glyph(s) involved in the event.
   */

  /**
   * Construct an event that occurs at the given timestamp/zoom level.
   */
  function Event(at, glyphCapacity) {
    _classCallCheck(this, Event);

    _defineProperty(this, "at", void 0);

    _defineProperty(this, "glyphs", void 0);

    this.at = at;
    this.glyphs = [];
  }

  _createClass(Event, [{
    key: "compareTo",
    value: function compareTo(that) {
      var diff = Math.sign(this.at - that.at);

      if (diff != 0) {
        return diff;
      }

      return this.getType().priority - that.getType().priority;
    }
    /**
     * Returns when the event occurs. This can be interpreted either as a
     * timestamp or as a zoom level.
     *
     * @deprecated use #at
     */

  }, {
    key: "getAt",
    value: function getAt() {
      return this.at;
    }
    /**
     * Returns the number of glyphs involved in this event.
     */

  }, {
    key: "getSize",
    value: function getSize() {
      return this.glyphs.length;
    }
    /**
     * Returns the glyph(s) involved in this event.
     * @deprecated use #glyphs
     */

  }, {
    key: "getGlyphs",
    value: function getGlyphs() {
      return this.glyphs;
    }
    /**
     * Returns the {@link Type} of this {@link Event}.
     */

  }, {
    key: "toString",
    value: function toString() {
      var sb = new StringBuilder(this.getType().toString());
      sb.append(' at ');
      sb.append(this.at);
      sb.append(' involving [');
      var first = true;

      var _iterator = _createForOfIteratorHelper$a(this.glyphs),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var glyph = _step.value;

          if (!first) {
            sb.append(', ');
          }

          if (glyph == null) {
            sb.append('null');
          } else {
            sb.append(glyph.toString());
          }

          first = false;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      sb.append(']');
      return sb.toString();
    }
  }]);

  return Event;
}();

function _createSuper$5(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$6(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$6() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var GlyphMerge = /*#__PURE__*/function (_Event) {
  _inherits(GlyphMerge, _Event);

  var _super = _createSuper$5(GlyphMerge);

  // constructor(a: Glyph, b: Glyph)
  function GlyphMerge(a, b, at) {
    var _this;

    _classCallCheck(this, GlyphMerge);

    if (at === null || at === undefined) {
      at = GrowFunction.__intersectAtGlyphGlyph(a, b);
    }

    _this = _super.call(this, at, 2);
    _this.glyphs[0] = a;
    _this.glyphs[1] = b;
    return _this;
  }

  _createClass(GlyphMerge, [{
    key: "getOther",
    value: function getOther(glyph) {
      if (this.glyphs[0] === glyph) {
        return this.glyphs[1];
      }

      return this.glyphs[0];
    }
  }, {
    key: "getType",
    value: function getType() {
      return Type.MERGE;
    } // /**
    //  * Returns a new {@link UncertainGlyphMerge} instance built on this event.
    //  * @deprecated use new UncertainGlyphMerge
    //  */
    // public uncertain(): UncertainGlyphMerge {
    //   return new UncertainGlyphMerge(this);
    // }

  }]);

  return GlyphMerge;
}(Event);

function _createSuper$4(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$5(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$5() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var OutOfCell = /*#__PURE__*/function (_Event) {
  _inherits(OutOfCell, _Event);

  var _super = _createSuper$4(OutOfCell);

  function OutOfCell(glyph, cell, side, at) {
    var _this;

    _classCallCheck(this, OutOfCell);

    if (at === undefined) {
      at = GrowFunction.exitAt(glyph, cell, side);
    }

    _this = _super.call(this, at, 1);

    _defineProperty(_assertThisInitialized(_this), "cell", void 0);

    _defineProperty(_assertThisInitialized(_this), "side", void 0);

    _this.glyphs = [glyph];
    _this.cell = cell;
    _this.side = side;
    return _this;
  }
  /**
   * @deprecated use #cell
   */


  _createClass(OutOfCell, [{
    key: "getCell",
    value: function getCell() {
      return this.cell;
    }
    /**
     * return #side
     */

  }, {
    key: "getSide",
    value: function getSide() {
      return this.side;
    }
  }, {
    key: "getType",
    value: function getType() {
      return Type.OUT_OF_CELL;
    }
  }]);

  return OutOfCell;
}(Event);

function _createForOfIteratorHelper$9(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$9(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$9(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$9(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$9(o, minLen); }

function _arrayLikeToArray$9(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var UncertainEvent = /*#__PURE__*/function () {
  /**
   * Timestamp/zoom level at which the event occurs at the earliest.
   */

  /**
   * Glyph(s) involved in the event.
   */
  function UncertainEvent(lowerBound, glyphCapacity) {
    _classCallCheck(this, UncertainEvent);

    _defineProperty(this, "lb", void 0);

    _defineProperty(this, "glyphs", void 0);

    this.lb = lowerBound;
    this.glyphs = [];
  }

  _createClass(UncertainEvent, [{
    key: "compareTo",
    value: function compareTo(that) {
      var diff = Math.sign(this.lb - that.lb);

      if (diff != 0) {
        return diff;
      }

      return this.getType().priority - that.getType().priority;
    }
    /**
     * Returns when the event occurs at the earliest. This can be interpreted
     * either as a timestamp or as a zoom level.
     */

  }, {
    key: "getLowerBound",
    value: function getLowerBound() {
      return this.lb;
    }
    /**
     * Returns the number of glyphs involved in this event.
     */

  }, {
    key: "getSize",
    value: function getSize() {
      return this.glyphs.length;
    }
    /**
     * Returns the glyph(s) involved in this event.
     * @deprecated use #glyphs
     */

  }, {
    key: "getGlyphs",
    value: function getGlyphs() {
      return this.glyphs;
    }
    /**
     * Returns the {@link Type} of this {@link UncertainEvent}.
     */

  }, {
    key: "toString",
    value: function toString() {
      var sb = new StringBuilder('uncertain ');
      sb.append(this.getType().toString());
      sb.append(' at (lower bound) ');
      sb.append(this.lb);
      sb.append(' involving [');
      var first = true;

      var _iterator = _createForOfIteratorHelper$9(this.glyphs),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var glyph = _step.value;

          if (!first) {
            sb.append(', ');
          }

          if (glyph == null) {
            sb.append('null');
          } else {
            sb.append(glyph.toString());
          }

          first = false;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      sb.append(']');
      return sb.toString();
    }
  }]);

  return UncertainEvent;
}();

function _createForOfIteratorHelper$8(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$8(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$8(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$8(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$8(o, minLen); }

function _arrayLikeToArray$8(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$4(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$4() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var UncertainGlyphMerge = /*#__PURE__*/function (_UncertainEvent) {
  _inherits(UncertainGlyphMerge, _UncertainEvent);

  var _super = _createSuper$3(UncertainGlyphMerge);

  /**
   * Original event that the uncertain variant was constructed from.
   */

  /**
   * Computed (and updated) actual timestamp/zoom level of merge event.
   */
  function UncertainGlyphMerge(m) {
    var _this;

    _classCallCheck(this, UncertainGlyphMerge);

    _this = _super.call(this, m.at, m.glyphs.length);

    _defineProperty(_assertThisInitialized(_this), "from", void 0);

    _defineProperty(_assertThisInitialized(_this), "at", void 0);

    _this.glyphs = Array.from(m.glyphs);
    _this.from = m;
    _this.at = m.at;
    return _this;
  }
  /**
   * Recompute when this event will happen, but only if the big glyph changed.
   * Otherwise, a cached result is returned immediately.
   */


  _createClass(UncertainGlyphMerge, [{
    key: "computeAt",
    value: function computeAt() {
      // check if the cached answer still holds
      var changed = false;

      for (var i = 0; i < this.glyphs.length; ++i) {
        if (this.glyphs[i].isBig()) {
          var prev = this.glyphs[i];
          this.glyphs[i] = this.glyphs[i].getAdoptivePrimalParent();

          if (this.glyphs[i] != prev) {
            changed = true;
            this.from.glyphs[i] = this.glyphs[i];
          }
        }
      } // recompute, but only if needed


      if (changed) {
        this.at = GrowFunction.__intersectAtGlyphGlyph(this.glyphs[0], this.glyphs[1]);
      }

      return this.at;
    }
    /**
     * @deprecated use #at in js
     */

  }, {
    key: "getAt",
    value: function getAt() {
      return this.at;
    }
  }, {
    key: "getGlyphMerge",
    value: function getGlyphMerge() {
      if (Utils.Double.neq(this.from.at, this.at)) {
        this.from = new GlyphMerge(this.from.glyphs[0], this.from.glyphs[1], this.at);
      }

      return this.from;
    }
  }, {
    key: "getSmallGlyph",
    value: function getSmallGlyph() {
      if (this.glyphs[0].isBig()) {
        return this.glyphs[1];
      }

      return this.glyphs[0];
    }
  }, {
    key: "getType",
    value: function getType() {
      return Type.MERGE;
    }
    /**
     * Update the lower bound of this event.
     *
     * @param lowerBound New lower bound.
     */

  }, {
    key: "setLowerBound",
    value: function setLowerBound(lowerBound) {
      this.lb = lowerBound;
    }
  }, {
    key: "toString",
    value: function toString() {
      var sb = new StringBuilder('uncertain ');
      sb.append(this.getType().toString());
      sb.append(' at ');
      sb.append(this.at);
      sb.append(', lower bound ');
      sb.append(this.lb);
      sb.append(' involving [');
      var first = true;

      var _iterator = _createForOfIteratorHelper$8(this.glyphs),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var glyph = _step.value;

          if (!first) {
            sb.append(', ');
          }

          if (glyph == null) {
            sb.append('null');
          } else {
            sb.append(glyph.toString());
          }

          first = false;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      sb.append(']');
      return sb.toString();
    }
  }]);

  return UncertainGlyphMerge;
}(UncertainEvent);

var _loggers = new Map();

var Logger = /*#__PURE__*/function () {
  function Logger(name) {
    _classCallCheck(this, Logger);

    _defineProperty(this, "_name", void 0);

    _defineProperty(this, "level", void 0);

    this._name = name;
    this.level = Level.FINEST;
  }

  _createClass(Logger, [{
    key: "isLoggable",
    value: function isLoggable(level) {
      var levelValue = this.level;

      if (level < levelValue || levelValue === Level.OFF) {
        return false;
      }

      return true;
    }
  }, {
    key: "log",
    value: function log(level, msg) {
      if (level >= this.level) {
        var prefix = "";
        var offset = 2;

        switch (level) {
          case Level.OFF:
            prefix = "OFF";
            break;

          case Level.SEVERE:
            prefix = "SEVERE";
            break;

          case Level.WARNING:
            prefix = "WARNING";
            break;

          case Level.INFO:
            prefix = "INFO";
            break;

          case Level.CONFIG:
            prefix = "CONFIG";
            break;

          case Level.FINE:
            prefix = "FINE";
            break;

          case Level.FINER:
            prefix = "FINER";
            offset = 4;
            break;

          case Level.FINEST:
            prefix = "FINEST";
            offset = 6;
            break;

          case Level.ALL:
            prefix = "All";
            break;
        }

        prefix = prefix.padEnd(8) + "|" + "".padEnd(offset);

        if (Logger._ps) {
          Logger._ps.println(prefix + msg);
        } else {
          console.log(prefix + msg);
        }
      }
    }
    /**
     * @deprecated use #level
     */

  }, {
    key: "getLevel",
    value: function getLevel() {
      return this.level;
    }
  }, {
    key: "setLevel",
    value: function setLevel(level) {
      this.level = level;
    }
  }], [{
    key: "getLogger",
    value: function getLogger(name) {
      if (!Constants.LOGGING_ENABLED) return null;

      if (_loggers.has(name)) {
        return _loggers.get(name);
      } else {
        var log = new Logger(name);

        _loggers.set(name, log);

        return log;
      }
    }
  }, {
    key: "setPrintStream",
    value: function setPrintStream(ps) {
      ps.reset();
      this._ps = ps;
    }
  }]);

  return Logger;
}();

_defineProperty(Logger, "_ps", void 0);

var Level;

(function (Level) {
  Level[Level["OFF"] = Number.MAX_VALUE] = "OFF";
  Level[Level["SEVERE"] = 1000] = "SEVERE";
  Level[Level["WARNING"] = 900] = "WARNING";
  Level[Level["INFO"] = 800] = "INFO";
  Level[Level["CONFIG"] = 700] = "CONFIG";
  Level[Level["FINE"] = 500] = "FINE";
  Level[Level["FINER"] = 400] = "FINER";
  Level[Level["FINEST"] = 300] = "FINEST";
  Level[Level["ALL"] = Number.MIN_VALUE] = "ALL";
})(Level || (Level = {}));

var Matcher = /*#__PURE__*/function () {
  function Matcher(str, regexp) {
    _classCallCheck(this, Matcher);

    _defineProperty(this, "str", void 0);

    _defineProperty(this, "regexp", void 0);

    _defineProperty(this, "_result", void 0);

    this.str = str;
    this.regexp = regexp;
  }

  _createClass(Matcher, [{
    key: "find",
    value: function find() {
      return this.regexp.test(this.str);
    }
  }, {
    key: "group",
    value: function group(_group) {
      var _this$_result;

      return ((_this$_result = this._result) !== null && _this$_result !== void 0 ? _this$_result : this._result = this.str.match(this.regexp))[_group];
    }
  }, {
    key: "replaceAll",
    value: function replaceAll(s) {
      return this.str.replace(this.regexp, s);
    }
  }]);

  return Matcher;
}();
var Pattern = /*#__PURE__*/function () {
  function Pattern(regexp) {
    _classCallCheck(this, Pattern);

    _defineProperty(this, "regexp", void 0);

    this.regexp = regexp;
  }

  _createClass(Pattern, [{
    key: "matcher",
    value: function matcher(str) {
      return new Matcher(str, this.regexp);
    }
  }], [{
    key: "compile",
    value: function compile(regexp) {
      return new Pattern(regexp);
    }
  }]);

  return Pattern;
}();

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _isNativeReflectConstruct$3() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct$3()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
/**
 * @deprecated use Map, only used for shadowing
 */

var HashMap = /*#__PURE__*/function (_Map) {
  _inherits(HashMap, _Map);

  var _super = _createSuper$2(HashMap);

  function HashMap() {
    _classCallCheck(this, HashMap);

    return _super.call(this);
  }
  /**
   * @deprecated use Map#has
   */


  _createClass(HashMap, [{
    key: "containsKey",
    value: function containsKey(key) {
      return this.has(key);
    }
    /**
     * @deprecated use Map#set
     */

  }, {
    key: "put",
    value: function put(name, value) {
      return this.set(name, value);
    }
    /**
     * @deprecated use Map#keys
     */

  }, {
    key: "keySet",
    value: function keySet() {
      return ArrayList.__new(Array.from(this.keys()));
    }
    /**
     * @deprecated use Map#entries
     */

  }, {
    key: "entrySet",
    value: function entrySet() {
      return ArrayList.__new(Array.from(this.entries(), function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            k = _ref2[0],
            v = _ref2[1];

        return new Entry(k, v);
      }));
    }
    /**
     * @deprecated use Map#delete
     */

  }, {
    key: "remove",
    value: function remove(key) {
      return this["delete"](key);
    }
  }]);

  return HashMap;
}( /*#__PURE__*/_wrapNativeSuper(Map));
var Entry = /*#__PURE__*/function () {
  function Entry(key, value) {
    _classCallCheck(this, Entry);

    _defineProperty(this, "key", void 0);

    _defineProperty(this, "value", void 0);

    this.key = key;
    this.value = value;
  }
  /**
   * @deprecated use #key
   */


  _createClass(Entry, [{
    key: "getKey",
    value: function getKey() {
      return this.key;
    }
    /**
     * @deprecated use #value
     */

  }, {
    key: "getValue",
    value: function getValue() {
      return this.value;
    }
  }], [{
    key: "comparingByKey",
    value: function comparingByKey() {
      return function (a, b) {
        return a.getKey() < b.getKey() ? -1 : a.getKey() > b.getKey() ? 1 : 0;
      };
    }
  }]);

  return Entry;
}();

var Stat = /*#__PURE__*/function () {
  function Stat(value) {
    _classCallCheck(this, Stat);

    _defineProperty(this, "n", void 0);

    _defineProperty(this, "average", void 0);

    _defineProperty(this, "min", void 0);

    _defineProperty(this, "max", void 0);

    _defineProperty(this, "sum", void 0);

    if (value === undefined) {
      this.n = 0;
    } else {
      this.n = 1;
      this.average = this.min = this.max = this.sum = value;
    }
  }
  /**
   * @deperecated use #average
   */


  _createClass(Stat, [{
    key: "getAverage",
    value: function getAverage() {
      return this.average;
    }
    /**
     * @deperecated use #min
     */

  }, {
    key: "getMin",
    value: function getMin() {
      return this.min;
    }
    /**
     * @deperecated use #max
     */

  }, {
    key: "getMax",
    value: function getMax() {
      return this.max;
    }
    /**
     * @deperecated use #n
     */

  }, {
    key: "getN",
    value: function getN() {
      return this.n;
    }
    /**
     * @deperecated use #sum
     */

  }, {
    key: "getSum",
    value: function getSum() {
      return this.sum;
    }
  }, {
    key: "log",
    value: function log(logger, name) {
      if (this.min === this.max) {
        logger.log(Level.FINE, "".concat(name, " was ").concat(this.max.toFixed(2).padStart(13), " and did not change over ").concat(this.n, " measurement").concat(this.n === 1 ? '' : 's'));
      } else {
        logger.log(Level.FINE, "".concat(name, " was ").concat(this.average.toFixed(2).padStart(13), " on average and always between ").concat(this.min, " and ").concat(this.max, " over ").concat(this.n, " measurement").concat(this.n === 1 ? '' : 's'));
      }
    }
  }, {
    key: "logCount",
    value: function logCount(logger, name) {
      logger.log(Level.FINE, "".concat(name, " occured ").concat(this.n === 1 ? 'once' : this.n + ' times'));
    }
  }, {
    key: "logPercentage",
    value: function logPercentage(logger, name) {
      logger.log(Level.FINE, "".concat(name, " ").concat((this.average * 100).toFixed(2), "% of the time"));
    }
  }, {
    key: "record",
    value: function record(value) {
      if (this.n === 0) {
        this.n = 1;
        this.average = this.min = this.max = this.sum = value;
        return;
      }

      this.average += (value - this.average) / ++this.n;
      this.sum += value;

      if (value > this.max) {
        this.max = value;
      }

      if (value < this.min) {
        this.min = value;
      }
    }
    /**
     * Forget about the given value. This method will update the average and sum
     * that are recorded, while the minimum and maximum are invalidated (become
     * {@link Double#NaN}). It is <i>not</i> checked whether the given value has
     * been recorded before, because values are not tracked explicitly.
     *
     * @param value Value to forget about.
     * @throws IllegalStateException When the number of recorded values is 0.
     */

  }, {
    key: "unrecord",
    value: function unrecord(value) {
      if (this.n === 0) {
        throw new Error('cannot unrecord a value when no ' + 'values are recorded');
      }

      this.average -= (value - this.average) / --this.n;
      this.sum -= value;
      this.min = this.max = Number.NaN;
    }
  }]);

  return Stat;
}();

var Comparator = /*#__PURE__*/function () {
  function Comparator() {
    _classCallCheck(this, Comparator);
  }

  _createClass(Comparator, null, [{
    key: "comparingInt",
    value: function comparingInt(callback) {
      return function (a, b) {
        return callback(a) - callback(b);
      };
    }
  }, {
    key: "comparing",
    value: function comparing(callback) {
      return function (a, b) {
        var a0 = callback(a);
        var b0 = callback(b);
        return a0 < b0 ? -1 : a0 > b0 ? 1 : 0;
      };
    }
  }]);

  return Comparator;
}();

function _createForOfIteratorHelper$7(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$7(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$7(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$7(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$7(o, minLen); }

function _arrayLikeToArray$7(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var Stats = /*#__PURE__*/function () {
  function Stats() {
    _classCallCheck(this, Stats);
  }

  _createClass(Stats, null, [{
    key: "count",
    value: function count(name, bool) {
      if (bool !== undefined) {
        this.__countStringBoolean(name, bool);
      }

      this.__countString(name);
    }
  }, {
    key: "__countString",
    value: function __countString(name) {
      this.record("[count] " + name, 1);
    }
  }, {
    key: "__countStringBoolean",
    value: function __countStringBoolean(name, bool) {
      this.record("[perc] " + name, bool ? 1 : 0);
    }
  }, {
    key: "get",
    value: function get(name) {
      if (!this.stats.containsKey(name)) {
        this.stats.put(name, new Stat(0));
      }

      return this.stats.get(name);
    }
  }, {
    key: "log",
    value: function log(name, logger) {
      if (!this.stats.containsKey(name)) {
        return;
      }

      this.stats.get(name).log(logger, name);
    }
  }, {
    key: "logAll",
    value: function logAll(logger) {
      var _this = this;

      logger.log(Level.FINE, "");
      logger.log(Level.FINE, "STATS");
      var padTo = this.stats.keySet().stream().filter(function (n) {
        var tagMatcher = _this.TAG_REGEX.matcher(n);

        return !tagMatcher.find() || tagMatcher.group(1) !== "perc";
      }).map(function (n) {
        return _this.TAG_REGEX.matcher(n).replaceAll("");
      }).max(Comparator.comparingInt(String__length)).get().length; // const f = "%1$-" + padTo + "s";

      var f = function f(k) {
        return k.padEnd(padTo);
      };

      var toSort = new ArrayList();

      var _iterator = _createForOfIteratorHelper$7(this.stats.entrySet()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var e = _step.value;
          toSort.add(e);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      toSort.sort(Comparator.comparing(function (a) {
        return _this.noTag(a.getKey());
      }));

      var _iterator2 = _createForOfIteratorHelper$7(toSort),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _e = _step2.value;
          var tagMatcher = this.TAG_REGEX.matcher(_e.getKey());

          if (tagMatcher.find()) {
            var tag = tagMatcher.group(1);
            var n = f(tagMatcher.replaceAll(""));

            if (tag === "perc") {
              _e.getValue().logPercentage(logger, n);
            } else {
              _e.getValue().logCount(logger, n);
            }
          } else {
            _e.getValue().log(logger, f(_e.getKey()));
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "record",
    value: function record(name, value) {
      if (this.stats.containsKey(name)) {
        this.stats.get(name).record(value);
      } else {
        var stat = new Stat(value);
        this.stats.put(name, stat);
      }
    }
  }, {
    key: "remove",
    value: function remove(name) {
      this.stats.remove(name);
    }
  }, {
    key: "reset",
    value: function reset() {
      this.stats.clear();
    }
    /**
     * Given a stat name, return the name without tag.
     */

  }, {
    key: "noTag",
    value: function noTag(name) {
      var tagMatcher = this.TAG_REGEX.matcher(name);

      if (tagMatcher.find()) {
        return tagMatcher.replaceAll("").trim();
      }

      return name;
    }
  }]);

  return Stats;
}();

_defineProperty(Stats, "TAG_REGEX", Pattern.compile(/^\[([a-z]+)]\s+/));

_defineProperty(Stats, "stats", new HashMap());

function _createForOfIteratorHelper$6(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$6(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$6(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$6(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$6(o, minLen); }

function _arrayLikeToArray$6(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function isNNN(args) {
  return args.length > 0 && typeof args[0] === 'number' && typeof args[1] === 'number' && typeof args[2] === 'number';
}

function isNNNB(args) {
  return args.length > 0 && typeof args[0] === 'number' && typeof args[1] === 'number' && typeof args[2] === 'number' && typeof args[3] === 'number';
}

function isIterable(item) {
  return item[Symbol.iterator] !== undefined && item[Symbol.iterator] !== null;
}

function isGA(args) {
  return isIterable(args) && args[0] instanceof Glyph;
}

function isGlyph(item) {
  return item === null || item instanceof Glyph;
}
var Glyph = /*#__PURE__*/function () {
  function Glyph() {
    _classCallCheck(this, Glyph);

    _defineProperty(this, "track", void 0);

    _defineProperty(this, "trackedBy", void 0);

    _defineProperty(this, "x", void 0);

    _defineProperty(this, "y", void 0);

    _defineProperty(this, "n", void 0);

    _defineProperty(this, "alive", void 0);

    _defineProperty(this, "big", void 0);

    _defineProperty(this, "cells", void 0);

    _defineProperty(this, "uncertainMergeEvents", void 0);

    _defineProperty(this, "adoptedBy", void 0);

    _defineProperty(this, "mergeEvents", void 0);

    _defineProperty(this, "outOfCellEvents", void 0);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (isNNN(args) || isNNNB(args)) {
      var _x = args[0],
          _y = args[1],
          _n = args[2],
          _args$ = args[3],
          _alive = _args$ === void 0 ? false : _args$;

      this.__constructor(_x, _y, _n, _alive);
    } else if (args[0] && isIterable(args[0])) {
      var _glyphs = args[0];

      this.__constructorGlyphs(_glyphs);
    } else if (isGA(args)) {
      this.__constructorGlyphsArray.apply(this, args);
    } else {
      throw new Error('failed to resolve arguments');
    }
  }

  _createClass(Glyph, [{
    key: "__constructor",
    value: function __constructor(x, y, n) {
      var alive = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (n < 1) {
        throw new Error('n must be at least 1');
      }

      this.track = false;

      if (Constants.TRACK && !Constants.ROBUST) {
        this.trackedBy = new ArrayList();
      } else {
        this.trackedBy = null;
      }

      this.x = x;
      this.y = y;
      this.n = n;
      this.alive = alive ? 1 : 0;
      this.big = false;
      this.cells = new ArrayList();
      this.uncertainMergeEvents = null;
      this.adoptedBy = null;
      this.mergeEvents = new PriorityQueue(Constants.MAX_MERGES_TO_RECORD);
      this.outOfCellEvents = new PriorityQueue();
    }
    /**
     * Construct a new glyph that has its center at the weighted average of the
     * centers of the given glyphs, and the sum of their weights.
     *
     * @param glyphs glyphs to construct a new glyph out of.
     */

  }, {
    key: "__constructorGlyphs",
    value: function __constructorGlyphs(glyphs) {
      this.__constructor(0, 0, 1);

      this.n = 0; // fati wtf ?

      var _iterator = _createForOfIteratorHelper$6(glyphs),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var glyph = _step.value;
          this.x += glyph.x * glyph.n;
          this.y += glyph.y * glyph.n;
          this.n += glyph.n;
          this.track = this.track || glyph.track;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.x /= this.n;
      this.y /= this.n;
    }
    /**
     * @see #Glyph(Iterable)
     */

  }, {
    key: "__constructorGlyphsArray",
    value: function __constructorGlyphsArray() {
      for (var _len2 = arguments.length, glyphs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        glyphs[_key2] = arguments[_key2];
      }

      this.__constructorGlyphs(glyphs);
    }
    /**
     * Record another cell intersecting the glyph.
     *
     * @param cell Cell to be added.
     */

  }, {
    key: "addCell",
    value: function addCell(cell) {
      if (!this.cells.contains(cell)) {
        this.cells.add(cell);
      }
    }
    /**
     * Given some {@linkplain #isBig() big} glyph, adopt the uncertain merge
     * events of that glyph onto this one. This will clear the queue of uncertain
     * merge events on {@code bigGlyph}.
     *
     * @param bigGlyph Glyph of which to adopt the uncertain merge events.
     * @param event    The merge event that caused the need for adoption.
     */

  }, {
    key: "adoptUncertainMergeEvents",
    value: function adoptUncertainMergeEvents(bigGlyph, event) {
      if (!this.isBig() || !bigGlyph.isBig()) {
        throw new Error('both this glyph and bigGlyph must be big');
      }

      if (this.uncertainMergeEvents.size() > 0) {
        throw new Error('can only adopt when it has no events yet');
      }

      var old = this.uncertainMergeEvents;
      this.uncertainMergeEvents = bigGlyph.uncertainMergeEvents;
      this.uncertainMergeEvents.updateAlpha(event);
      bigGlyph.uncertainMergeEvents = old;
      bigGlyph.adoptedBy = this;
    }
    /**
     * Returns this glyph, or if it is big and its uncertain merge events have
     * that adopted them, or the glyph that adopted them from that glyph, et
     * cetera, until a glyph is found that did not have its events adopted yet.
     */

  }, {
    key: "getAdoptivePrimalParent",
    value: function getAdoptivePrimalParent() {
      if (this.adoptedBy === null) {
        return this;
      }

      return this.adoptedBy.getAdoptivePrimalParent();
    }
    /**
     * Returns all recorded cells intersecting the glyph.
     * @deprecated use #cells in js
     */

  }, {
    key: "getCells",
    value: function getCells() {
      return this.cells;
    }
    /**
     * Returns the number of entities represented by the glyph.
     * @deprecated use #n in js
     */

  }, {
    key: "getN",
    value: function getN() {
      return this.n;
    }
    /**
     * Returns the X-coordinate of the center of the glyph.
     * @deprecated use #x in js
     */

  }, {
    key: "getX",
    value: function getX() {
      return this.x;
    }
    /**
     * Returns the Y-coordinate of the center of the glyph.
     * @deprecated use #y in js
     */

  }, {
    key: "getY",
    value: function getY() {
      return this.y;
    }
    /**
     * Hash only the location of the glyph, for performance reasons.
     */

  }, {
    key: "hashCode",
    value: function hashCode() {
      return "".concat(this.x, ":").concat(this.y);
    }
    /**
     * Returns whether this glyph and the given one share both X- and Y-
     * coordinates. This is checked using
     * {@link Utils.Double#eq(double, double)}, so with an epsilon.
     *
     * @param that Glyph to consider.
     */

  }, {
    key: "hasSamePositionAs",
    value: function hasSamePositionAs(that) {
      return Utils.Double.eq(this.x, that.x) && Utils.Double.eq(this.y, that.y);
    }
    /**
     * Returns whether this glyph is still taking part in the clustering process.
     */

  }, {
    key: "isAlive",
    value: function isAlive() {
      return this.alive === 1;
    }
    /**
     * Returns whether this glyph is considered to be a big glyph, meaning that
     * at the time of its construction, it was representing more than {@link
     * Constants#BIG_GLYPH_FACTOR} times the average number of entities.
     *
     * <p>Glyphs initially are not big, but can be determined to be big when they
     * {@link QuadTreeClusterer}.
     * @deprecated use #big in js
     */

  }, {
    key: "isBig",
    value: function isBig() {
      return this.big;
    }
    /**
     * Implement strict equality.
     */

  }, {
    key: "equals",
    value: function equals(obj) {
      return this === obj;
    }
    /**
     * Marks this glyph as alive: participating in the clustering process.
     */

  }, {
    key: "participate",
    value: function participate() {
      if (this.alive == 1) {
        throw new Error('having a participating glyph participate');
      }

      if (this.alive == 2) {
        throw new Error('cannot bring a perished glyph back to life');
      }

      this.alive = 1;
    }
    /**
     * Returns the first merge event that will occur with this big glyph, or
     * {@code null} if there is none remaining.
     */

  }, {
    key: "peekUncertain",
    value: function peekUncertain() {
      return this.uncertainMergeEvents.peek();
    }
    /**
     * Marks this glyph as not alive: no longer participating in the clustering
     * process.
     */

  }, {
    key: "perish",
    value: function perish() {
      this.alive = 2;
    }
    /**
     * Same as {@link #peekUncertain()}, but actually removes that event from
     * the internal queue it is stored in.
     */

  }, {
    key: "pollUncertain",
    value: function pollUncertain() {
      return this.uncertainMergeEvents.poll();
    }
    /**
     * Add the next event, if any, to the given queue. This will add the first
     * {@link #record(GlyphMerge) recorded} event to the given queue.
     *
     * @param q Event queue to add {@link GlyphMerge} to.
     * @param l Logger to log events to. Can be {@code null}.
     * @return Whether an event was popped into the queue.
     */

  }, {
    key: "popMergeInto",
    value: function popMergeInto(q, l) {
      if (this.big) {
        throw new Error("big glyphs don't pop merge events into the shared queue");
      } // try to pop a merge event into the queue as long as the previously
      // recorded merge is with a glyph that is still alive... give up as
      // soon as no recorded events remain


      while (!this.mergeEvents.isEmpty()) {
        var merge = this.mergeEvents.poll();
        var wth = merge.getOther(this);

        if (!wth.isAlive() || wth.isBig()) {
          continue; // try the next event
        }

        q.add(merge);

        if (Constants.TRACK && !Constants.ROBUST) {
          if (!wth.trackedBy.contains(this)) {
            wth.trackedBy.add(this);
          }
        }

        if (l !== null) {
          l.log(Level.FINEST, "\u2192 merge at ".concat(merge.getAt().toFixed(3), " with ").concat(wth));
        } // we found an event and added it to the queue, return


        return true;
      } // no recorded events remain, we cannot add an event


      return false;
    }
    /**
     * Add the next event, if any, to the given queue. This will add the first
     * {@link #record(OutOfCell) recorded} event to the given queue.
     *
     * @param q Event queue to add {@link OutOfCell} to.
     * @param l Logger to log events to, can be {@code null}.
     * @return Whether an event was popped into the queue.
     */

  }, {
    key: "popOutOfCellInto",
    value: function popOutOfCellInto(q, l) {
      if (this.big) {
        throw new Error("big glyphs don't pop out of cell events into the shared queue");
      }

      var added = false;

      while (!this.outOfCellEvents.isEmpty()) {
        var o = this.outOfCellEvents.poll();

        if (l !== null) {
          l.log(Level.FINEST, "popping ".concat(o, " into the queue"));
        }

        q.add(o);
        added = true;

        if (!Constants.ROBUST) {
          return true;
        }
      }

      if (Constants.ROBUST && added) {
        return true;
      }

      if (l != null) {
        l.log(Level.FINEST, 'no out of cell event to pop');
      }

      return false;
    }
    /**
     * Acknowledge that the given event will happen.
     *
     * @param event Event involving this glyph.
     */

  }, {
    key: "record",
    value: function record(event) {
      if (event instanceof GlyphMerge) {
        return this.__recordG(event);
      } else if (event instanceof UncertainGlyphMerge) {
        return this.__recordU(event);
      } else if (event instanceof OutOfCell) {
        return this.__recordO(event);
      }

      throw new Error('unresolved choice');
    }
    /**
     * Acknowledge that the given event will happen.
     *
     * @param event Event involving this glyph.
     */

  }, {
    key: "__recordG",
    value: function __recordG(event) {
      this.mergeEvents.add(event);
    }
    /**
     * Acknowledge that the given event will happen.
     *
     * @param event Event involving this glyph.
     */

  }, {
    key: "__recordU",
    value: function __recordU(event) {
      this.uncertainMergeEvents.add(event);
    }
    /**
     * Acknowledge that the given event will happen.
     *
     * @param event Event involving this glyph.
     */

  }, {
    key: "__recordO",
    value: function __recordO(event) {
      this.outOfCellEvents.add(event);
    }
    /**
     * Record a cell no longer intersecting the glyph.
     *
     * @param cell Cell to be removed.
     */

  }, {
    key: "removeCell",
    value: function removeCell(cell) {
      this.cells.remove(cell);
    }
    /**
     * Update whether this glyph is big using the given statistic.
     *
     * @param glyphSize Statistic covering number of entities represented by
     *                  other glyphs, used to determine if this glyph {@link #isBig()}.
     */

  }, {
    key: "setBig",
    value: function setBig(glyphSize) {
      if (!Constants.BIG_GLYPHS) {
        return;
      }

      this.big = this.n > glyphSize.getAverage() * Constants.BIG_GLYPH_FACTOR;
      Stats.count('glyph was big when it participated', this.big); // if the glyph is big, initialize uncertain merge event tracking

      if (this.big) {
        this.uncertainMergeEvents = new UncertainQueue();
      }
    }
    /**
     * Change number of entities represented by this glyph. Should not normally
     *
     * @param n New number of entities.
     * @deprecated use #n in js
     */

  }, {
    key: "setN",
    value: function setN(n) {
      this.n = n;
    }
  }, {
    key: "toString",
    value: function toString() {
      // String.format("glyph [x = %.2f, y = %.2f, n = %d]", x, y, n)
      return "glyph [x = ".concat(this.x.toFixed(2), ", y = ").concat(this.y.toFixed(2), ", n = ").concat(this.n, "]");
    }
  }], [{
    key: "__isAlive",
    value: function __isAlive(g) {
      return g.isAlive();
    }
  }]);

  return Glyph;
}();

/**
 * @deprecated use typeof === "number"
 * @param item
 */
function isNumber(item) {
  return typeof item === 'number';
}

function _createForOfIteratorHelper$5(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$5(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$5(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$5(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$5(o, minLen); }

function _arrayLikeToArray$5(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function isSide(item) {
  return item === null || item instanceof Side;
}

function isRNN(args) {
  return args.length > 2 && isRectangle2D(args[0]) && isNumber(args[1]) && isNumber(args[2]);
}

var Side = /*#__PURE__*/function () {
  function Side(name, a, b, id) {
    _classCallCheck(this, Side);

    _defineProperty(this, "_quadrants", void 0);

    _defineProperty(this, "_others", void 0);

    _defineProperty(this, "_id", void 0);

    _defineProperty(this, "_name", void 0);

    this._name = name;
    this._id = id;
    this._others = null;
    this._quadrants = [a, b];
  }

  _createClass(Side, [{
    key: "toString",
    value: function toString() {
      return this._name;
    }
  }, {
    key: "opposite",
    value: function opposite() {
      return Side.values()[(this.ordinal() + 2) % 4];
    }
  }, {
    key: "others",
    value: function others() {
      if (this._others === null) {
        this._others = [null, null, null];
        var i = 0;

        var _iterator = _createForOfIteratorHelper$5(Side.values()),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var that = _step.value;

            if (that !== this) {
              this._others[i++] = that;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      return this._others;
    }
    /**
     * Returns the two quadrants on this side. For example, passing LEFT
     * will yield the indices of the top left and bottom left quadrants.
     * Indices as per {@link #quadrant(int)}.
     *
     * @return Indices of quadrants on given side.
     */

  }, {
    key: "quadrants",
    value: function quadrants() {
      return this._quadrants;
    }
  }, {
    key: "ordinal",
    value: function ordinal() {
      return this._id;
    }
  }], [{
    key: "interval",
    value: function interval(rect, side) {
      if (side == Side.TOP || side == Side.BOTTOM) {
        return [rect.getMinX(), rect.getMaxX()];
      }

      return [rect.getMinY(), rect.getMaxY()];
    }
    /**
     * Given an index of a quadrant as used in {@link QuadTree}, return a
     * descriptor of that quadrant.
     *
     * @param index Index of a quadrant. Quadrants are indexed as in the
     *              children of a {@link QuadTree}. That is, {@code [top left,
     *              top right, bottom left, bottom right]}.
     * @return A descriptor of the quadrant. This is simply an array with
     * two sides that together describe the quadrant.
     */

  }, {
    key: "quadrant",
    value: function quadrant() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length > 0) {
        if (isNumber(args[0])) {
          return this.__quadrantIdx(args[0]);
        } else if (isRNN(args)) {
          return this.__quadrantRXY.apply(this, args);
        }
      }

      throw new Error('failed to resolve choice');
    }
    /**
     * Given an index of a quadrant as used in {@link QuadTree}, return a
     * descriptor of that quadrant.
     *
     * @param index Index of a quadrant. Quadrants are indexed as in the
     *              children of a {@link QuadTree}. That is, {@code [top left,
     *              top right, bottom left, bottom right]}.
     * @return A descriptor of the quadrant. This is simply an array with
     * two sides that together describe the quadrant.
     */

  }, {
    key: "__quadrantIdx",
    value: function __quadrantIdx(index) {
      if (index < 0 || index > 3) {
        throw new Error('illegal argument');
      }

      var descriptor = [null, null];
      var i = 0;

      var _iterator2 = _createForOfIteratorHelper$5(this.values()),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var side = _step2.value;

          if (side._quadrants[0] == index || side._quadrants[1] == index) {
            descriptor[i++] = side;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return descriptor;
    }
    /**
     * Given a cell and a point in that cell, return the index of the quadrant
     * (order as per {@link #quadrant(int)}) that the point is in.
     */

  }, {
    key: "__quadrantRXY",
    value: function __quadrantRXY(cell, x, y) {
      return (y < cell.getCenterY() ? 0 : 2) + (x < cell.getCenterX() ? 0 : 1);
    }
    /**
     * Given a quadrant as per {@link #quadrant(int)} and a side, return the
     * quadrant that lies to that side. Some combinations will be illegal,
     * in those cases garbage output is returned (as in, incorrect).
     */

  }, {
    key: "quadrantNeighbor",
    value: function quadrantNeighbor(index, side) {
      switch (index) {
        // top left quadrant
        case 0:
          return side.ordinal();
        // top right quadrant

        case 1:
          return (index + side.ordinal()) % 4;
        // bottom left quadrant

        case 2:
          return side == Side.TOP ? 0 : 3;
        // bottom right quadrant

        case 3:
          return side == Side.TOP ? 1 : 2;

        default:
          return -1;
      } // to make compiler happy

    }
  }, {
    key: "values",
    value: function values() {
      return this._values;
    }
  }]);

  return Side;
}();

_defineProperty(Side, "TOP", new Side("TOP", 0, 1, 0));

_defineProperty(Side, "RIGHT", new Side("RIGHT", 1, 3, 1));

_defineProperty(Side, "BOTTOM", new Side("BOTTOM", 2, 3, 2));

_defineProperty(Side, "LEFT", new Side("LEFT", 0, 2, 3));

_defineProperty(Side, "_values", [Side.TOP, Side.RIGHT, Side.BOTTOM, Side.LEFT]);

var Arrays = /*#__PURE__*/function () {
  function Arrays() {
    _classCallCheck(this, Arrays);
  }

  _createClass(Arrays, null, [{
    key: "asList",
    value: function asList(array) {
      return array;
    }
  }, {
    key: "stream",
    value: function stream(items, from, upto) {
      return new Stream(items.slice(from, upto));
    }
  }, {
    key: "nCopies",
    value: function nCopies(length, value) {
      return Array.from({
        length: length
      }, function () {
        return value;
      });
    }
  }, {
    key: "rotate",
    value: function rotate(arr, count) {
      count -= arr.__internal.length * Math.floor(count / arr.__internal.length);

      arr.__internal.push.apply(arr.__internal, arr.__internal.splice(0, count));

      return arr;
    }
  }]);

  return Arrays;
}();

var LinkedList = /*#__PURE__*/function () {
  function LinkedList() {
    _classCallCheck(this, LinkedList);

    _defineProperty(this, "__internal", new List());
  }

  _createClass(LinkedList, [{
    key: "add",
    value: function add(item) {
      return this.__internal.push(item);
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      return this.__internal.length === 0;
    }
  }, {
    key: "poll",
    value: function poll() {
      return this.__internal.shift();
    }
  }, {
    key: "addAll",
    value: function addAll(values) {
      var _this$__internal;

      return (_this$__internal = this.__internal).push.apply(_this$__internal, _toConsumableArray(values));
    }
  }]);

  return LinkedList;
}();

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var ArrayDeque = /*#__PURE__*/function (_ArrayList) {
  _inherits(ArrayDeque, _ArrayList);

  var _super = _createSuper$1(ArrayDeque);

  function ArrayDeque() {
    _classCallCheck(this, ArrayDeque);

    return _super.apply(this, arguments);
  }

  return ArrayDeque;
}(ArrayList);

var System = function System() {
  _classCallCheck(this, System);
};

_defineProperty(System, "out", {
  println: function println() {
    var _console;

    (_console = console).log.apply(_console, arguments);
  }
});

_defineProperty(System, "err", {
  println: function println() {
    var _console2;

    (_console2 = console).error.apply(_console2, arguments);
  }
});

var Timer = /*#__PURE__*/function () {
  /**
   * Construct a new timer, and immediately start it.
   */
  function Timer() {
    _classCallCheck(this, Timer);

    _defineProperty(this, "count", void 0);

    _defineProperty(this, "running", void 0);

    _defineProperty(this, "started", void 0);

    _defineProperty(this, "totalElapsed", void 0);

    this.count = 0;
    this.totalElapsed = 0;
    this.running = false;
    this.started = null;
    this.start();
  }
  /**
   * Returns a timestamp that can be used to measure elapsed time.
   */


  _createClass(Timer, [{
    key: "getElapsed",
    value:
    /**
     * Returns how much time passed since this timer was last started.
     */
    function getElapsed() {
      return Timer.now() - this.started;
    }
    /**
     * Returns how much time has passed between all start and stop events on
     * this timer. When the timer is currently running, that time is <em>not</em>
     * included in this value.
     */

  }, {
    key: "getElapsedTotal",
    value: function getElapsedTotal() {
      return this.totalElapsed;
    }
    /**
     * Returns how many times this timer was stopped.
     */

  }, {
    key: "getNumCounts",
    value: function getNumCounts() {
      return this.count;
    }
    /**
     * Returns the given timespan in a given unit.
     *
     * @param timeSpan Timespan in nanoseconds.
     * @param units    Unit to transform into.
     */

  }, {
    key: "log",
    value:
    /**
     * {@link #stop() Stop} this timer and log the {@link #getElapsedTotal()
     * total elapsed time} to the given logger instance, at level
     * {@link Level#FINE}.
     *
     * @param logger Logger to log to.
     * @param name   Name of event that was timed.
     * @param level  Level to log at.
     */
    function log(logger, name) {
      var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Level.FINE;
      this.stop();

      if (logger !== null) {
        logger.log(level, "".concat(name, " took ").concat(Timer["in"](this.totalElapsed, Units.SECONDS).toFixed(2).padStart(5), " seconds (wall clock time").concat(this.count === 1 ? '' : ", ".concat(this.count, " timings"))); // logger.log(level, "{0} took {1} seconds (wall clock time{2})",
        //     new Object[]{name, String.format("%5.2f", Timers.in(
        //     totalElapsed, Units.SECONDS)),
        //     (this.count == 1 ? "" : String.format(", %s timings",
        //         NumberFormat.getIntegerInstance().format(count)))});
      } else {
        System.out.println("".concat(name, " took ").concat(Timer["in"](this.totalElapsed, Units.SECONDS).toFixed(3).padStart(5), " seconds (wall clock time").concat(this.count === 1 ? '' : ", ".concat(this.count, " timings"))); // System.out.println(String.format(
        //     "%1$s took %2$5.3f seconds (wall clock time%3$s",
        //     name, Timers.in(totalElapsed, Units.SECONDS),
        //     (count == 1 ? "" : String.format(", %s timings",
        //         NumberFormat.getIntegerInstance().format(count)))
        // ));
      }
    }
    /**
     * Start the timer. Starting a running timer has no effect.
     */

  }, {
    key: "start",
    value: function start() {
      if (this.running) {
        return;
      }

      this.started = Timer.now();
      this.running = true;
    }
    /**
     * Stop the timer, record time passed since last start event. Stopping a
     * stopped timer has no effect.
     */

  }, {
    key: "stop",
    value: function stop() {
      if (!this.running) {
        return;
      }

      this.totalElapsed += this.getElapsed();
      this.count++;
      this.running = false;
    }
  }], [{
    key: "now",
    value: function now() {
      var _process$hrtime = process.hrtime(),
          _process$hrtime2 = _slicedToArray(_process$hrtime, 2),
          seconds = _process$hrtime2[0],
          nano = _process$hrtime2[1];

      return seconds * 10e9 + nano;
    }
  }, {
    key: "in",
    value: function _in(timeSpan, units) {
      return timeSpan / units;
    }
  }]);

  return Timer;
}();

function _createForOfIteratorHelper$4(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$4(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$4(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$4(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$4(o, minLen); }

function _arrayLikeToArray$4(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var Timers = /*#__PURE__*/function () {
  function Timers() {
    _classCallCheck(this, Timers);
  }

  _createClass(Timers, null, [{
    key: "elapsed",
    value:
    /**
     * Map of timer names to objects recording full timer information.
     */

    /**
     * Returns how much time has passed between all start and stop events on
     * the given timer. When the timer is currently running, that time is
     * <em>not</em> included in this value.
     * <p>
     * Use {@link #in(long, Units)} to convert the value returned by this
     * function to a specific time unit.
     *
     * @param name Name of the timer.
     * @see #in(long, Units)
     */
    function elapsed(name) {
      if (!this.timers.containsKey(name)) {
        return -1;
      }

      return this.timers.get(name).getElapsedTotal();
    }
    /**
     * Returns the given timespan in a given unit.
     *
     * @param timeSpan Timespan in nanoseconds.
     * @param units    Unit to transform into.
     * @deprecated use Timer.in
     */

  }, {
    key: "in",
    value: function _in(timeSpan, units) {
      return timeSpan / units;
    }
    /**
     * Log the time that elapsed to the given logger. This will
     * {@link Timer#stop() stop} the timer and log its {@link
      * Timer#getElapsedTotal() total elapsed time}.
     * <p>
     * This will log at level {@link Level#FINE}.
     *
     * @param name   Name of the timer.
     * @param logger Logger to log to.
     * @see Utils.Timers#start(String)
     */

  }, {
    key: "log",
    value: function log(name, logger) {
      var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Level.FINE;

      if (!this.timers.containsKey(name)) {
        return;
      }

      this.timers.get(name).log(logger, name, level);
    }
    /**
     * Log the time that elapsed on all timers recorded so far. This will
     * {@link Timer#stop() stop} the timers and log their {@link
      * Timer#getElapsedTotal() total elapsed time}.
     *
     * @param logger Logger to log to.
     */

  }, {
    key: "logAll",
    value: function logAll(logger) {
      logger.log(Level.FINE, "");
      logger.log(Level.FINE, "TIMERS");
      var seen = false;
      var best = null;
      var comparator = Comparator.comparingInt(String__length);

      var _iterator = _createForOfIteratorHelper$4(this.timers.keySet()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var s = _step.value;

          if (!seen || comparator(s, best) > 0) {
            seen = true;
            best = s;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var padTo = (seen ? best : "").length; // const f = "%1$-" + padTo + "s";

      var f = function f(k) {
        return k.padEnd(padTo);
      }; // log entries without section


      var toSort = new ArrayList();

      var _iterator2 = _createForOfIteratorHelper$4(this.timers.entrySet()),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var stringTimerEntry = _step2.value;

          if (!stringTimerEntry.getKey().startsWith("[")) {
            toSort.add(stringTimerEntry);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      toSort.sort(Entry.comparingByKey());

      var _iterator3 = _createForOfIteratorHelper$4(toSort),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _stringTimerEntry = _step3.value;

          _stringTimerEntry.getValue().log(logger, f(_stringTimerEntry.getKey()));
        } // log entries in a section

      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      var list = new ArrayList();

      var _iterator4 = _createForOfIteratorHelper$4(this.timers.entrySet()),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var _stringTimerEntry2 = _step4.value;

          if (_stringTimerEntry2.getKey().startsWith("[")) {
            list.add(_stringTimerEntry2);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      list.sort(Entry.comparingByKey());
      var timersInSections = list.toArray();
      var lastSection = "";

      var _iterator5 = _createForOfIteratorHelper$4(timersInSections),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var timersInSection = _step5.value;
          var e = timersInSection;
          var offset = e.getKey().indexOf("]") + 1;
          var section = e.getKey().substring(0, offset);

          if (section !== lastSection) {
            lastSection = section;
            logger.log(Level.FINE, "");
            logger.log(Level.FINE, lastSection);
          }

          e.getValue().log(logger, f(e.getKey().substring(offset + 1)));
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
    /**
     * Returns a timestamp that can be used to measure elapsed time.
     * @deprecated use Timer.now
     */

  }, {
    key: "now",
    value: function now() {
      var _process$hrtime = process.hrtime(),
          _process$hrtime2 = _slicedToArray(_process$hrtime, 2),
          seconds = _process$hrtime2[0],
          nano = _process$hrtime2[1];

      return seconds * 10e9 + nano;
    }
    /**
     * Start a new timer with the given name. Overwrites any existing timer
     * with the same name, so can be used to restart timers too.
     *
     * @param name Name of the timer. Used when reading off elapsed time.
     * @see Utils.Timers#log(String, Logger)
     */

  }, {
    key: "start",
    value: function start(name) {
      if (this.timers.containsKey(name)) {
        this.timers.get(name).start();
      } else {
        this.timers.put(name, new Timer());
      }
    }
    /**
     * Record time passed since last start event on the given timer. This
     * time will now be included in {@code getElapsedTotal}. Stopping a
     * stopped timer has no effect.
     *
     * @param name Name of the timer to stop.
     */

  }, {
    key: "stop",
    value: function stop(name) {
      this.timers.get(name).stop();
    }
  }, {
    key: "reset",
    value: function reset() {
      this.timers.clear();
    }
  }]);

  return Timers;
}();

_defineProperty(Timers, "timers", new HashMap());

var _Symbol$iterator;

function _createForOfIteratorHelper$3(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$3(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$3(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$3(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen); }

function _arrayLikeToArray$3(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function isArrayList(item) {
  return item instanceof ArrayList;
}

_Symbol$iterator = Symbol.iterator;
var QuadTree = /*#__PURE__*/function () {
  /**
   * Rectangle describing this cell.
   */

  /**
   * Parent pointer. Will be {@code null} for the root cell.
   */

  /**
   * Whether {@link #parent} thinks {@code this} is a child of it. The root
   * cell can never be an orphan, because it does not have a parent.
   */

  /**
   * Child cells, in the order: top left, top right, bottom left, bottom right.
   * Will be {@code null} for leaf cells.
   */

  /**
   * Glyphs intersecting the cell.
   */

  /**
   * Cache {@link #getNeighbors(Side)} for every side, but only for leaves.
   */

  /**
   * Construct a rectangular QuadTree cell at given coordinates.
   *
   * @param x X-coordinate of top left corner of cell.
   * @param y Y-coordinate of top left corner of cell.
   * @param w Width of cell.
   * @param h Height of cell.
   */
  function QuadTree(x, y, w, h) {
    _classCallCheck(this, QuadTree);

    _defineProperty(this, "cell", void 0);

    _defineProperty(this, "parent", void 0);

    _defineProperty(this, "_isOrphan", void 0);

    _defineProperty(this, "children", void 0);

    _defineProperty(this, "glyphs", void 0);

    _defineProperty(this, "neighbors", void 0);

    this.cell = new Rectangle2D(x, y, w, h);
    this.parent = null;
    this._isOrphan = false;
    this.children = null;
    this.glyphs = new ArrayList(Constants.MAX_GLYPHS_PER_CELL);
    this.neighbors = new ArrayList(Side.values().length);

    var _iterator = _createForOfIteratorHelper$3(Side.values()),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _side = _step.value;
        this.neighbors.add(new ArrayList());
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
  /**
   * Reset to being a cell without glyphs nor children.
   * @Deprecated
   */


  _createClass(QuadTree, [{
    key: "clear",
    value: function clear() {
      if (this.children != null) {
        var _iterator2 = _createForOfIteratorHelper$3(this.children),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var child = _step2.value;
            child.clear();
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        this.children = null;
      }

      if (this.glyphs != null) {
        var _iterator3 = _createForOfIteratorHelper$3(this.glyphs),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var _glyph = _step3.value;

            _glyph.removeCell(this);
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        this.glyphs.clear();
      } else {
        this.glyphs = new ArrayList(Constants.MAX_GLYPHS_PER_CELL);
      }

      var _iterator4 = _createForOfIteratorHelper$3(this.neighbors),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var neighborsOnSide = _step4.value;
          neighborsOnSide.clear();
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
    /**
     * Returns whether the given point is contained in this QuadTree cell. This
     * is true when the following conditions are satisfied:
     * - cell.minX <= x; and
     * - cell.minY <= y; and
     * - x < cell.maxX or x == root.maxX; and
     * - y < cell.maxY or y == root.maxY.
     * The above ensures that only a single cell at each level of the QuadTree
     * will contain any given point, while simultaneously all points in the
     * bounding box of the QuadTree are claimed by a cell at every level.
     *
     * @param x X-coordinate of query point.
     * @param y Y-coordinate of query point.
     */

  }, {
    key: "contains",
    value: function contains(x, y) {
      var root = this.getRoot();
      return this.cell.getMinX() <= x && this.cell.getMinY() <= y && (x < this.cell.getMaxX() || x == root.cell.getMaxX()) && (y < this.cell.getMaxY() || y == root.cell.getMaxY());
    }
    /**
     * @deprecated use {@link glyphs} instead
     */

  }, {
    key: "getGlyphs",
    value: function getGlyphs() {
      return this.glyphs;
    }
  }, {
    key: "getGlyphsAlive",
    value: function getGlyphsAlive() {
      if (this.glyphs == null) {
        return this.glyphs;
      }

      var result = new ArrayList();

      var _iterator5 = _createForOfIteratorHelper$3(this.glyphs),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _glyph2 = _step5.value;

          if (_glyph2.isAlive()) {
            result.add(_glyph2);
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      return result;
    }
  }, {
    key: "getHeight",
    value: function getHeight() {
      return this.cell.getHeight();
    }
  }, {
    key: "getLeaves",
    value: function getLeaves() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length > 0) {
        if (isSide(args[0])) {
          var _side2 = args[0];

          if (isArrayList(args[1])) {
            var _result = args[1];
            return this.__getLeavesSideResult(_side2, _result);
          } else if (isRectangle2D(args[1])) {
            var _rectangle = args[1],
                _result2 = args[2];
            return this.__getLeavesSideRectangleResult(_side2, _rectangle, _result2);
          }

          return this.__getLeavesSide(_side2);
        } else if (isRectangle2D(args[0])) {
          var _rectangle2 = args[0];

          if (isArrayList(args[1])) {
            var _result3 = args[1];
            return this.__getLeavesRectangleResult(_rectangle2, _result3);
          }

          return this.__getLeavesRectangle(_rectangle2);
        } else if (isGlyph(args[0])) {
          var _glyph3 = args[0];

          if (typeof args[1] === "number") {
            var _at = args[1];

            if (isArrayList(args[2])) {
              var _result4 = args[2];
              return this.__getLeavesGlyphAtResult(_glyph3, _at, _result4);
            }

            return this.__getLeavesGlyphAt(_glyph3, _at);
          }
        }

        throw new Error("unresolved choice");
      } else {
        return this.__getLeaves();
      }
    }
  }, {
    key: "__getLeaves",
    value: function __getLeaves() {
      Timers.start("[QuadTree] getLeaves");
      var leaves = new ArrayList();
      var considering = new ArrayDeque();
      considering.add(this);

      while (!considering.isEmpty()) {
        var cell = considering.poll();

        if (cell.isLeaf()) {
          leaves.add(cell);
        } else {
          considering.addAll(Arrays.asList(cell.children));
        }
      }

      Timers.stop("[QuadTree] getLeaves");
      return leaves;
    }
    /**
     * Returns a set of all QuadTree cells that are descendants of this cell,
     * {@link #isLeaf() leaves} and have one side touching the {@code side}
     * border of this cell.
     *
     * @param side Side of cell to find leaves on.
     */

  }, {
    key: "__getLeavesSide",
    value: function __getLeavesSide(side) {
      Timers.start("[QuadTree] getLeaves");
      var result = new ArrayList();

      this.__getLeavesSideResult(side, result);

      Timers.stop("[QuadTree] getLeaves");
      return result;
    }
    /**
     * Returns a set of all QuadTree cells that are descendants of this cell,
     * {@link #isLeaf() leaves} and intersect the given rectangle.
     *
     * @param rectangle The query rectangle.
     */

  }, {
    key: "__getLeavesRectangle",
    value: function __getLeavesRectangle(rectangle) {
      Timers.start("[QuadTree] getLeaves(Rectangle2D)");
      var result = new ArrayList();

      this.__getLeavesRectangleResult(rectangle, result);

      Timers.stop("[QuadTree] getLeaves(Rectangle2D)");
      return result;
    }
    /**
     * Return a set of all leaves of this QuadTree that intersect the given
     * glyph at the given point in time.
     *
     * @param glyph The glyph to consider.
     * @param at    Timestamp/zoom level at which glyph size is determined.
     * @see #insert(Glyph, double)
     */

  }, {
    key: "__getLeavesGlyphAt",
    value: function __getLeavesGlyphAt(glyph, at) {
      Timers.start("[QuadTree] getLeaves");
      var result = new ArrayList();

      this.__getLeavesGlyphAtResult(glyph, at, result);

      Timers.stop("[QuadTree] getLeaves");
      return result;
    }
    /**
     * Return a set of the neighboring cells on the given side of this cell.
     *
     * @param side Side of cell to find neighbors on.
     */

  }, {
    key: "getNeighbors",
    value: function getNeighbors(side) {
      return this.neighbors.get(side.ordinal());
    }
    /**
     * Returns the first ancestor (parent, grandparent, ...) that is <i>not</i>
     * an {@link #isOrphan() orphan}. In case this node is not an orphan, this
     * will return a self reference.
     */

  }, {
    key: "getNonOrphanAncestor",
    value: function getNonOrphanAncestor() {
      var node = this;

      while (node.isOrphan()) {
        node = node.parent;
      }

      return node;
    }
  }, {
    key: "getParent",
    value: function getParent() {
      return this.parent;
    }
  }, {
    key: "getRectangle",
    value: function getRectangle() {
      return this.cell;
    }
  }, {
    key: "getRoot",
    value: function getRoot() {
      if (this.isRoot()) {
        return this;
      }

      return this.parent.getRoot();
    } // @ts-ignore

  }, {
    key: "getSide",
    value: function getSide(side) {
      return new Rectangle2D(this.cell.getX() + (side === Side.RIGHT ? this.cell.getWidth() : 0), this.cell.getY() + (side === Side.BOTTOM ? this.cell.getHeight() : 0), side == Side.TOP || side === Side.BOTTOM ? this.cell.getWidth() : 0, side == Side.RIGHT || side === Side.LEFT ? this.cell.getHeight() : 0);
    }
    /**
     * Returns the number of cells that make up this QuadTree.
     */

  }, {
    key: "getSize",
    value: function getSize() {
      if (this.isLeaf()) {
        return 1;
      }

      var size = 1;

      var _iterator6 = _createForOfIteratorHelper$3(this.children),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var child = _step6.value;
          size += child.getSize();
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      return size;
    }
    /**
     * Returns the maximum number of links that need to be followed before a
     * leaf cell is reached.
     */

  }, {
    key: "getTreeHeight",
    value: function getTreeHeight() {
      if (this.isLeaf()) {
        return 0;
      }

      var height = 1;

      var _iterator7 = _createForOfIteratorHelper$3(this.children),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var child = _step7.value;
          var childHeight = child.getTreeHeight();
          height = Math.max(height, childHeight + 1);
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }

      return height;
    }
  }, {
    key: "getWidth",
    value: function getWidth() {
      return this.cell.getWidth();
    }
  }, {
    key: "getX",
    value: function getX() {
      return this.cell.getX();
    }
  }, {
    key: "getY",
    value: function getY() {
      return this.cell.getY();
    }
    /**
     * Insert a given glyph into all cells of this QuadTree it intersects. This
     * method does not care about {@link QuadTree}.
     *
     * @param glyph The glyph to insert.
     * @param at    Timestamp/zoom level at which insertion takes place.
     * @return In how many cells the glyph has been inserted.
     * @see #getLeaves(Glyph, double)
     */

  }, {
    key: "insert",
    value: function insert(glyph, at) {
      Stats.count("QuadTree insert");

      var intersect = GrowFunction.__intersectAtGlyphRectangle(glyph, this.cell); // if we intersect at some point, but later than current time
      // (this means that a glyph is in a cell already when its border is in
      //  the cell! see GrowFunction#intersectAt(Glyph, Rectangle2D)


      if (intersect > at + Utils.EPS) {
        Stats.count("QuadTree insert", false);
        return 0;
      } // otherwise, we will insert!


      Stats.count("QuadTree insert", true);
      Timers.start("[QuadTree] insert");
      var inserted = 0; // keep track of number of cells we insert into

      if (this.isLeaf()) {
        if (!this.glyphs.contains(glyph)) {
          this.glyphs.add(glyph);
          glyph.addCell(this);
          inserted = 1;
        }
      } else {
        var _iterator8 = _createForOfIteratorHelper$3(this.children),
            _step8;

        try {
          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var child = _step8.value;
            inserted += child.insert(glyph, at);
          }
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }
      }

      Timers.stop("[QuadTree] insert");
      return inserted;
    }
    /**
     * Insert a given glyph into this QuadTree, but treat it as only its center
     * and handle the insertion as a regular QuadTree insertion. This means that
     * a split may be triggered by this insertion, in order to maintain the
     * maximum capacity of cells.
     *
     * @param glyph The glyph center to insert.
     * @return Whether center has been inserted.
     */

  }, {
    key: "insertCenterOf",
    value: function insertCenterOf(glyph) {
      Stats.count("QuadTree insertCenterOf");

      if (glyph.getX() < this.cell.getMinX() || glyph.getX() > this.cell.getMaxX() || glyph.getY() < this.cell.getMinY() || glyph.getY() > this.cell.getMaxY()) {
        Stats.count("QuadTree insertCenterOf", false);
        return false;
      }

      Stats.count("QuadTree insertCenterOf", true); // can we insert here?

      Timers.start("[QuadTree] insert");

      if (this.isLeaf() && this.glyphs.size() < Constants.MAX_GLYPHS_PER_CELL) {
        if (!this.glyphs.contains(glyph)) {
          this.glyphs.add(glyph);
          glyph.addCell(this);
        }

        return true;
      } // split if necessary


      if (this.isLeaf()) {
        this.__split();
      } // insert into correct child


      this.children[Side.quadrant(this.cell, glyph.getX(), glyph.getY())].insertCenterOf(glyph);
      Timers.stop("[QuadTree] insert");
      return true;
    }
    /**
     * Returns whether this cell is an orphan, which it is when its parent has
     * joined and forgot about its children.
     */

  }, {
    key: "isOrphan",
    value: function isOrphan() {
      return this._isOrphan;
    }
    /**
     * Returns whether this cell has child cells.
     */

  }, {
    key: "isLeaf",
    value: function isLeaf() {
      return this.children == null;
    }
  }, {
    key: "isRoot",
    value: function isRoot() {
      return this.parent == null;
    }
    /**
     * {@inheritDoc}
     * <p>
     * This iterator will iterate over all cells of the QuadTree in a top-down
     * manner: first a node, then its children.
     * @deprecated
     * @use Symbol.iterator
     */

  }, {
    key: "iterator",
    value: function iterator() {
      return new Quaderator(this);
    }
  }, {
    key: _Symbol$iterator,
    value: function value() {
      return new Quaderator(this);
    }
    /**
     * Returns an iterator over all alive glyphs in this QuadTree.
     */

  }, {
    key: "iteratorGlyphsAlive",
    value: function iteratorGlyphsAlive() {
      return this.__getLeaves().stream().flatMap(function (cell) {
        return cell.getGlyphsAlive().toArray();
      }).iterator();
    }
    /**
     * Remove the given glyph from this cell, if it is associated with it.
     * This method does <i>not</i> remove the cell from the glyph.
     *
     * @param glyph Glyph to be removed.
     * @param at    Time/zoom level at which glyph is removed. Used only to
     *              record when a join took place, if a join is triggered.
     * @return Whether removing the glyph caused this cell to merge with its
     * siblings into its parent, making this cell an
     * {@link #isOrphan() orphan}. If this happens, merge events may
     * need to be updated and out of cell events may be outdated.
     */

  }, {
    key: "removeGlyph",
    value: function removeGlyph(glyph, at) {
      Stats.count("QuadTree remove");

      if (this.glyphs != null) {
        Stats.count("QuadTree remove", this.glyphs.remove(glyph));
      } else {
        Stats.count("QuadTree remove", false);
      }

      if (this.parent != null) {
        return this.parent.joinMaybe(at);
      }

      return false;
    }
    /**
     * Performs a regular QuadTree split, treating all glyphs associated with
     * this cell as points, namely their centers. Distributes associated glyphs
     * to the relevant child cells.
     *
     * @see #split(double)
     * @deprecated
     */

  }, {
    key: "split",
    value: function split(at) {
      if (typeof at === "number") {
        return this.__splitAt(at);
      } else if (at === undefined) {
        return this.__split();
      }

      throw new Error("better resolver");
    }
    /**
     * Performs a regular QuadTree split, treating all glyphs associated with
     * this cell as points, namely their centers. Distributes associated glyphs
     * to the relevant child cells.
     *
     * @see #split(double)
     */

  }, {
    key: "__split",
    value: function __split() {
      Timers.start("[QuadTree] split");
      this.splitCell(); // possibly distribute glyphs

      if (!this.glyphs.isEmpty()) {
        var _iterator9 = _createForOfIteratorHelper$3(this.glyphs),
            _step9;

        try {
          for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
            var _glyph4 = _step9.value;
            this.children[Side.quadrant(this.cell, _glyph4.getX(), _glyph4.getY())].insertCenterOf(_glyph4);
          } // only maintain glyphs in leaves

        } catch (err) {
          _iterator9.e(err);
        } finally {
          _iterator9.f();
        }

        this.glyphs = null;
      } // notify listeners


      Timers.stop("[QuadTree] split");
    }
    /**
     * Split this cell in four and associate glyphs in this cell with the child
     * cells they overlap.
     *
     * @param at Timestamp/zoom level at which split takes place.
     * @see #split()
     */

  }, {
    key: "__splitAt",
    value: function __splitAt(at) {
      Timers.start("[QuadTree] split");
      this.splitCell(); // possibly distribute glyphs

      if (!this.glyphs.isEmpty()) {
        // insert glyph in every child cell it overlaps
        // (a glyph can be inserted into more than one cell!)
        var _iterator10 = _createForOfIteratorHelper$3(this.glyphs),
            _step10;

        try {
          for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
            var _glyph5 = _step10.value;

            // don't bother with dead glyphs
            if (_glyph5.isAlive()) {
              this.insert(_glyph5, at);
            }
          } // only maintain glyphs in leaves

        } catch (err) {
          _iterator10.e(err);
        } finally {
          _iterator10.f();
        }

        this.glyphs = null; // ensure that split did in fact have an effect

        var _iterator11 = _createForOfIteratorHelper$3(this.children),
            _step11;

        try {
          for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
            var child = _step11.value;

            if (child.glyphs.size() > Constants.MAX_GLYPHS_PER_CELL) {
              child.__splitAt(at);
            }
          }
        } catch (err) {
          _iterator11.e(err);
        } finally {
          _iterator11.f();
        }
      } // notify listeners


      Timers.stop("[QuadTree] split");
    }
  }, {
    key: "toString",
    value: function toString() {
      return "".concat(QuadTree.name, "[cell = [").concat(this.cell.getMinX(), " ; ").concat(this.cell.getMaxX(), "] x [").concat(this.cell.getMinY(), " ; ").concat(this.cell.getMaxY(), "]]"); // return String.format("%s[cell = [%.2f ; %.2f] x [%.2f ; %.2f]]",
      //     this.getClass().getName(),
      //     cell.getMinX(), cell.getMaxX(), cell.getMinY(), cell.getMaxY());
    }
    /**
     * Actual implementation of {@link #getLeaves(Glyph, double)}.
     */

  }, {
    key: "__getLeavesGlyphAtResult",
    value: function __getLeavesGlyphAtResult(glyph, at, result) {
      if (GrowFunction.__intersectAtGlyphRectangle(glyph, this.cell) > at + Utils.EPS) {
        return;
      }

      if (this.isLeaf()) {
        result.add(this);
      } else {
        var _iterator12 = _createForOfIteratorHelper$3(this.children),
            _step12;

        try {
          for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
            var child = _step12.value;

            child.__getLeavesGlyphAtResult(glyph, at, result);
          }
        } catch (err) {
          _iterator12.e(err);
        } finally {
          _iterator12.f();
        }
      }
    }
    /**
     * Add all leaf cells on the given side of the current cell to the given
     * set. If this cell is a leaf, it will add itself as a whole.
     *
     * @param side   Side of cell to take leaves on.
     * @param result Set to add cells to.
     */

  }, {
    key: "__getLeavesSideResult",
    value: function __getLeavesSideResult(side, result) {
      this.__getLeavesSideRectangleResult(side, null, result);
    }
    /**
     * Add all leaf cells intersecting the given rectangle to the given set. If
     * this cell is a leaf, it will add itself as a whole.
     *
     * @param rectangle Query rectangle.
     * @param result    Set to add cells to.
     */

  }, {
    key: "__getLeavesRectangleResult",
    value: function __getLeavesRectangleResult(rectangle, result) {
      if (Utils.intervalsOverlap([this.cell.getMinX(), this.cell.getMaxX()], [rectangle.getMinX(), rectangle.getMaxX()]) && Utils.intervalsOverlap([this.cell.getMinY(), this.cell.getMaxY()], [rectangle.getMinY(), rectangle.getMaxY()])) {
        if (this.isLeaf()) {
          result.add(this);
        } else {
          var _iterator13 = _createForOfIteratorHelper$3(this.children),
              _step13;

          try {
            for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
              var child = _step13.value;

              child.__getLeavesRectangleResult(rectangle, result);
            }
          } catch (err) {
            _iterator13.e(err);
          } finally {
            _iterator13.f();
          }
        }
      }
    }
    /**
     * Add all leaf cells on the given side of the current cell to the given
     * set that intersect the range defined by extending the given rectangle to
     * the given side and its opposite direction infinitely far.
     *
     * @see QuadTree#getLeaves(Side, ArrayList)
     */

  }, {
    key: "__getLeavesSideRectangleResult",
    value: function __getLeavesSideRectangleResult(side, range, result) {
      if (range != null) {
        // reduce checking overlap to a 1D problem, as the given range and
        // this cell are extended to infinity in one dimension
        var r = [null, null];
        var c = [null, null];

        if (side == Side.TOP || side == Side.BOTTOM) {
          r[0] = range.getMinX();
          r[1] = range.getMaxX();
          c[0] = this.cell.getMinX();
          c[1] = this.cell.getMaxX();
        } else {
          r[0] = range.getMinY();
          r[1] = range.getMaxY();
          c[0] = this.cell.getMinY();
          c[1] = this.cell.getMaxY();
        } // in case there is no overlap, return


        if (!Utils.openIntervalsOverlap(r, c)) {
          return;
        }
      }

      if (this.isLeaf()) {
        result.add(this);
        return;
      }

      var _iterator14 = _createForOfIteratorHelper$3(side.quadrants()),
          _step14;

      try {
        for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
          var i = _step14.value;

          this.children[i].__getLeavesSideRectangleResult(side, range, result);
        }
      } catch (err) {
        _iterator14.e(err);
      } finally {
        _iterator14.f();
      }
    }
    /**
     * If the total number of glyphs of all children is at most
     * and those children are leaves, delete the
     * children (thus making this cell a leaf), and adopt the glyphs of the
     * deleted children in this cell.
     *
     * @param at Time/zoom level at which join takes place. Used only to record
     *           when a join happened, if one is triggered.
     * @return Whether a join was performed.
     */

  }, {
    key: "joinMaybe",
    value: function joinMaybe(at) {
      Timers.start("[QuadTree] join");

      if (this.isLeaf()) {
        Timers.stop("[QuadTree] join");
        return false;
      }

      var s = 0;

      var _iterator15 = _createForOfIteratorHelper$3(this.children),
          _step15;

      try {
        for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
          var _child = _step15.value;

          if (!_child.isLeaf()) {
            Timers.stop("[QuadTree] join");
            return false;
          }

          s += _child.getGlyphsAlive().size();
        }
      } catch (err) {
        _iterator15.e(err);
      } finally {
        _iterator15.f();
      }

      if (s > Constants.MAX_GLYPHS_PER_CELL) {
        Timers.stop("[QuadTree] join");
        return false;
      } // do a join, become a leaf, adopt glyphs and neighbors of children


      Stats.count("QuadTree join cells");
      this.glyphs = new ArrayList(Constants.MAX_GLYPHS_PER_CELL);

      for (var quadrant = 0; quadrant < this.children.length; ++quadrant) {
        var child = this.children[quadrant];

        var _iterator16 = _createForOfIteratorHelper$3(child.getGlyphsAlive()),
            _step16;

        try {
          for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
            var _glyph6 = _step16.value;

            if (!this.glyphs.contains(_glyph6)) {
              this.glyphs.add(_glyph6);

              _glyph6.addCell(this);
            }

            _glyph6.removeCell(child);
          }
        } catch (err) {
          _iterator16.e(err);
        } finally {
          _iterator16.f();
        }

        child.glyphs = null;
        child._isOrphan = true; // adopt neighbors, keep neighbors of orphan intact
        // only adopt neighbors outside of the joined cell
        // also, be careful to not have duplicate neighbors

        var _iterator17 = _createForOfIteratorHelper$3(Side.quadrant(quadrant)),
            _step17;

        try {
          for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
            var _side3 = _step17.value;
            var ns = this.neighbors.get(_side3.ordinal());

            var _iterator18 = _createForOfIteratorHelper$3(child.neighbors.get(_side3.ordinal())),
                _step18;

            try {
              for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
                var n = _step18.value;

                if (!ns.contains(n)) {
                  ns.add(n);
                }
              }
            } catch (err) {
              _iterator18.e(err);
            } finally {
              _iterator18.f();
            }
          }
        } catch (err) {
          _iterator17.e(err);
        } finally {
          _iterator17.f();
        }
      } // update neighbor pointers of neighbors; point to this instead of
      // any of what previously were our children, but are now orphans


      var _iterator19 = _createForOfIteratorHelper$3(Side.values()),
          _step19;

      try {
        for (_iterator19.s(); !(_step19 = _iterator19.n()).done;) {
          var _side4 = _step19.value;

          var _iterator20 = _createForOfIteratorHelper$3(this.neighbors.get(_side4.ordinal())),
              _step20;

          try {
            for (_iterator20.s(); !(_step20 = _iterator20.n()).done;) {
              var neighbor = _step20.value;
              var neighborNeighbors = neighbor.neighbors.get(_side4.opposite().ordinal());

              var _iterator21 = _createForOfIteratorHelper$3(this.children),
                  _step21;

              try {
                for (_iterator21.s(); !(_step21 = _iterator21.n()).done;) {
                  var _child2 = _step21.value;
                  neighborNeighbors.remove(_child2);
                } // the below does not need an "interval overlaps" check; if the
                // child interval overlapped, then our interval will also

              } catch (err) {
                _iterator21.e(err);
              } finally {
                _iterator21.f();
              }

              neighborNeighbors.add(this);
            }
          } catch (err) {
            _iterator20.e(err);
          } finally {
            _iterator20.f();
          }
        } // we become a leaf now, sorry kids

      } catch (err) {
        _iterator19.e(err);
      } finally {
        _iterator19.f();
      }

      this.children = null;
      Timers.stop("[QuadTree] join"); // recursively check if parent could join now

      if (this.parent != null) {
        this.parent.joinMaybe(at);
      } // since we joined, return `true` independent of whether parent joined


      return true;
    }
    /**
     * If not a leaf yet, create child cells and associate them with this cell
     * as being their parent. This method does <em>not</em> reassign any glyphs
     * associated with this cell to children.
     * <p>
     * The {@link #neighbors} of the newly created child cells will be
     * initialized correctly. The {@link #neighbors} of this cell will be
     * cleared - only leaf cells maintain who their neighbors are.
     *
     * @see #split()
     * @see #split(double)
     */

  }, {
    key: "splitCell",
    value: function splitCell() {
      // already split?
      if (!this.isLeaf()) {
        throw new Error("cannot split cell that is already split");
      } // do the split


      Stats.count("QuadTree split cell");
      this.children = [null, null, null, null];
      var x = this.getX();
      var y = this.getY();
      var w = this.getWidth();
      var h = this.getHeight();

      if (w / 2 < Constants.MIN_CELL_SIZE || h / 2 < Constants.MIN_CELL_SIZE) {
        throw new Error("cannot split a tiny cell");
      }

      for (var i = 0; i < 4; ++i) {
        this.children[i] = new QuadTree(x + (i % 2 == 0 ? 0 : w / 2), y + (i < 2 ? 0 : h / 2), w / 2, h / 2);
        this.children[i].parent = this;
      } // update neighbors of neighbors; we split now


      var _iterator22 = _createForOfIteratorHelper$3(Side.values()),
          _step22;

      try {
        for (_iterator22.s(); !(_step22 = _iterator22.n()).done;) {
          var _side5 = _step22.value;

          var _iterator24 = _createForOfIteratorHelper$3(this.neighbors.get(_side5.ordinal())),
              _step24;

          try {
            for (_iterator24.s(); !(_step24 = _iterator24.n()).done;) {
              var neighbor = _step24.value;
              var neighborsOnOurSide = neighbor.neighbors.get(_side5.opposite().ordinal());
              neighborsOnOurSide.remove(this);

              var _iterator25 = _createForOfIteratorHelper$3(_side5.quadrants()),
                  _step25;

              try {
                for (_iterator25.s(); !(_step25 = _iterator25.n()).done;) {
                  var quadrant = _step25.value;

                  // only add as neighbors when they actualy neighbor our
                  // newly created children
                  if (Utils.openIntervalsOverlap(Side.interval(this.children[quadrant].cell, _side5), Side.interval(neighbor.cell, _side5))) {
                    neighborsOnOurSide.add(this.children[quadrant]);
                  }
                }
              } catch (err) {
                _iterator25.e(err);
              } finally {
                _iterator25.f();
              }
            }
          } catch (err) {
            _iterator24.e(err);
          } finally {
            _iterator24.f();
          }
        } // update neighbors

      } catch (err) {
        _iterator22.e(err);
      } finally {
        _iterator22.f();
      }

      var _iterator23 = _createForOfIteratorHelper$3(Side.values()),
          _step23;

      try {
        for (_iterator23.s(); !(_step23 = _iterator23.n()).done;) {
          var _side6 = _step23.value;
          var neighborsOnSide = this.neighbors.get(_side6.ordinal());

          var _iterator26 = _createForOfIteratorHelper$3(_side6.quadrants()),
              _step26;

          try {
            for (_iterator26.s(); !(_step26 = _iterator26.n()).done;) {
              var _quadrant = _step26.value;
              var qi = Side.interval(this.children[_quadrant].cell, _side6); // distribute own neighbors over children
              // ensure that the neighbor is "in range" of the child
              // cell; technically, we would need to consider the
              // side.opposite() of the neighbor, but since it reduces
              // to a 1D comparison with the exact same interval, we
              // save ourselves some calculation and do it like this

              var list = new ArrayList();

              var _iterator27 = _createForOfIteratorHelper$3(neighborsOnSide),
                  _step27;

              try {
                for (_iterator27.s(); !(_step27 = _iterator27.n()).done;) {
                  var _neighbor = _step27.value;

                  if (Utils.openIntervalsOverlap(qi, Side.interval(_neighbor.cell, _side6))) {
                    list.add(_neighbor);
                  }
                }
              } catch (err) {
                _iterator27.e(err);
              } finally {
                _iterator27.f();
              }

              this.children[_quadrant].neighbors.get(_side6.ordinal()).addAll(list.toArray()); // the children are neighbors of each other; record this


              this.children[_quadrant].neighbors.get(_side6.opposite().ordinal()).add(this.children[Side.quadrantNeighbor(_quadrant, _side6.opposite())]);
            }
          } catch (err) {
            _iterator26.e(err);
          } finally {
            _iterator26.f();
          }

          neighborsOnSide.clear();
        }
      } catch (err) {
        _iterator23.e(err);
      } finally {
        _iterator23.f();
      }
    }
  }]);

  return QuadTree;
}();
/**
 * Iterator for QuadTrees.
 */

var Quaderator = /*#__PURE__*/function () {
  function Quaderator(quadTree) {
    _classCallCheck(this, Quaderator);

    _defineProperty(this, "toVisit", void 0);

    this.toVisit = new LinkedList();
    this.toVisit.add(quadTree);
  }

  _createClass(Quaderator, [{
    key: "isDone",
    value: function isDone() {
      return this.toVisit.isEmpty();
    }
  }, {
    key: "next",
    value: function next() {
      var value = this.toVisit.poll();

      if (!value.isLeaf()) {
        this.toVisit.addAll(value.children); // Collections.addAll(this.toVisit, value.children);
      }

      return {
        value: value,
        done: this.isDone()
      };
    }
  }]);

  return Quaderator;
}();

function _createForOfIteratorHelper$2(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$2(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$2(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$2(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen); }

function _arrayLikeToArray$2(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var HierarchicalClustering = /*#__PURE__*/function () {
  /**
   * Create a (node of a) hierarchical clustering that represents a glyph and
   * the glyphs it was created from. The clustering records at which point in
   * time/zooming the merge happened as well.
   *
   * @param glyph       Glyph that was created from a merge.
   * @param at          Time or zoom level at which the merge happened.
   * @param createdFrom One or more glyphs that were merged into {@code glyph}.
   *                    It is also possible to construct a hierarchical clustering of a
   *                    single glyph by omitting this parameter.
   */
  function HierarchicalClustering(glyph, at) {
    _classCallCheck(this, HierarchicalClustering);

    _defineProperty(this, "glyph", void 0);

    _defineProperty(this, "at", void 0);

    _defineProperty(this, "createdFrom", void 0);

    this.glyph = glyph;
    this.at = at;

    for (var _len = arguments.length, createdFrom = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      createdFrom[_key - 2] = arguments[_key];
    }

    if (createdFrom.length === 0) {
      this.createdFrom = null;
    } else {
      this.createdFrom = ArrayList.__new(Array.from(createdFrom)); // this.createdFrom = new ArrayList<HierarchicalClustering>(createdFrom)
    }
  }

  _createClass(HierarchicalClustering, [{
    key: "alsoCreatedFrom",
    value: function alsoCreatedFrom(from) {
      if (this.createdFrom == null) {
        this.createdFrom = new ArrayList(2);
      }

      if (!this.createdFrom.contains(from)) {
        this.createdFrom.add(from);
      }
    }
  }, {
    key: "compareTo",
    value: function compareTo(that) {
      return Math.sign(this.at - that.at);
    }
    /**
     * @deprecated use #at
     */

  }, {
    key: "getAt",
    value: function getAt() {
      return this.at;
    }
    /**
     * @deprecated use #glyph
     */

  }, {
    key: "getGlyph",
    value: function getGlyph() {
      return this.glyph;
    }
  }, {
    key: "setGlyph",
    value: function setGlyph(glyph) {
      this.glyph = glyph;
    }
  }, {
    key: "toString",
    value: function toString() {
      var indent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var showCreatedFrom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var showCreatedFromRecursively = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var limit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;
      var moreIndent = indent + '  ';
      var sb = new StringBuilder(indent);
      sb.append(HierarchicalClustering.name);
      sb.append('[\n');
      sb.append(moreIndent);
      sb.append(this.glyph.toString());
      sb.append(' at ');
      sb.append(this.at);

      if (this.createdFrom == null) {
        sb.append('\n');
      } else {
        sb.append("from (".concat(this.createdFrom.size(), ")\n")); // sb.append(String.format(" from (%d)\n", createdFrom.size()));

        if (showCreatedFrom) {
          this.createdFrom.sort(function (hc1, hc2) {
            var d = Math.sign(hc2.getAt() - hc1.getAt());

            if (d === 0) {
              return hc2.getGlyph().getN() - hc1.getGlyph().getN();
            }

            return d;
          });
          var i = 0;

          var _iterator = _createForOfIteratorHelper$2(this.createdFrom),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var hc = _step.value;
              sb.append(hc.toString(moreIndent, showCreatedFromRecursively, showCreatedFromRecursively, limit));
              if (++i == limit) break;
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }

          if (i < this.createdFrom.size()) {
            sb.append(moreIndent);
            sb.append('... (').append(this.createdFrom.size() - i).append(' more)\n');
          }
        }
      }

      sb.append(indent);
      sb.append(']\n');
      return sb.toString();
    }
  }]);

  return HierarchicalClustering;
}();

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function getLogger() {
  var _l;

  var l;
  return Constants.LOGGING_ENABLED && (_l = l = Logger.getLogger("FirstMergeRecorder")) !== null && _l !== void 0 && _l.isLoggable(Level.FINER) ? l : null;
}
/**
 * The logger of this class, that is instantiated only when logging is
 * enabled and {@link Level#FINE} messages are loggable. This is done because
 * there are some heavy-to-construct logging parameters, which are guarded by
 * cheap {@code LOGGER != null} checks. This is more efficient than checking
 * repeatedly whether the message is loggable.
 */


var LOGGER$1 = getLogger();
var FirstMerge = /*#__PURE__*/function () {
  /**
   * First times at which merge events with {@link FirstMergeRecorder#from}
   * are recorded so far. This will contain the timestamp of the first
   * event, then the timestamp of the second, et cetera.
   */

  /**
   * Set of glyphs that touch {@link FirstMergeRecorder#from} at time
   * {@link #at}. In practice this will almost always contain just a
   * single glyph. Similarly to {@link #at}, this is a list that tracks
   * the set for the first, second, ... merge events.
   */

  /**
   * Number of merges that have been recorded.
   */
  function FirstMerge() {
    _classCallCheck(this, FirstMerge);

    _defineProperty(this, "at", void 0);

    _defineProperty(this, "glyphs", void 0);

    _defineProperty(this, "size", void 0);

    this.at = ArrayList.__new(Arrays.nCopies(Constants.MAX_MERGES_TO_RECORD, Number.POSITIVE_INFINITY)); // this.at = new ArrayList(Collections.nCopies(
    //     Constants.MAX_MERGES_TO_RECORD, Double.POSITIVE_INFINITY));

    this.glyphs = new ArrayList(Constants.MAX_MERGES_TO_RECORD);

    for (var i = 0; i < Constants.MAX_MERGES_TO_RECORD; ++i) {
      this.glyphs.add(new ArrayList(1));
    }

    this.size = 0;

    if (LOGGER$1 !== null) {
      LOGGER$1.log(Level.FINER, "constructed an empty FirstMerge ####");
    }
  }

  _createClass(FirstMerge, [{
    key: "accept",
    value: function accept(parent, candidate) {
      if (LOGGER$1 !== null) {
        LOGGER$1.log(Level.FINER, "accepting ".concat(candidate, " into ####")); // LOGGER.log(Level.FINER, "accepting {0} into #{1}",
        //     new Object[]{candidate, hashCode()});
      }

      var at = GrowFunction.__intersectAtGlyphGlyph(parent._from, candidate);

      for (var i = 0; i < Constants.MAX_MERGES_TO_RECORD; ++i) {
        if (at < this.at.get(i)) {
          if (!Number.isFinite(this.at.get(i))) {
            this.size++;
          } // make room to shift, if needed


          if (this.at.size() === Constants.MAX_MERGES_TO_RECORD) {
            this.at.removeI(this.at.size() - 1);
            this.glyphs.addI(i, this.glyphs.removeI(this.glyphs.size() - 1));
          }

          this.at.addI(i, at);
          this.glyphs.get(i).clear();
          this.glyphs.get(i).add(candidate);
          break;
        } else if (at == this.at.get(i)) {
          this.glyphs.get(i).add(candidate);
          break;
        } // if at > this.at.get(i), try next i...

      }

      if (LOGGER$1 !== null) {
        LOGGER$1.log(Level.FINER, "#### now has glyphs ".concat(this.glyphs.toArray().join(", "), " at [").concat(this.at.toArray().join(", "), "]")); // LOGGER.log(Level.FINER, "#{0} now has glyphs {1} at {2}",
        //     new Object[]{
        //     hashCode(),
        //     "[" + glyphs.stream().map((glyphSet) ->
        //         glyphSet.stream().map(Glyph::toString).collect(
        //             Collectors.joining(", "))
        //     ).collect(Collectors.joining("], [")) + "]",
        //     "[" + this.at.stream().map(Object::toString).collect(
        //         Collectors.joining(", ")) + "]"
        // });
      }
    }
  }, {
    key: "combine",
    value: function combine(that) {
      if (LOGGER$1 != null) {
        LOGGER$1.log(Level.FINER, "combining #### and ####;\n#### has glyphs ".concat(this.glyphs.toArray().join(", "), " at ").concat(this.at, ";\n#### has glyphs ").concat(that.glyphs.toArray().join(", "), " at ").concat(that.at)); // LOGGER.log(Level.FINER,
        //     "combining #{0} and #{1};\n#{0} has glyphs {2} at {3};\n#{1} has glyphs {4} at {5}",
        //     new Object[]{hashCode(), that.hashCode(),
        // "[" + this.glyphs.stream().map((glyphSet) ->
        //     glyphSet.stream().map(Glyph::toString)
        //         .collect(
        //             Collectors.joining(", "))
        // ).collect(Collectors.joining("], [")) + "]",
        // "[" + this.at.stream().map(Object::toString).collect(
        //     Collectors.joining(", ")) + "]",
        // "[" + that.glyphs.stream().map((glyphSet) ->
        //     glyphSet.stream().map(Glyph::toString)
        //         .collect(
        //             Collectors.joining(", "))
        // ).collect(Collectors.joining("], [")) + "]",
        // "[" + that.at.stream().map(Object::toString).collect(
        //     Collectors.joining(", ")) + "]"
        // });
      }

      var thisInd = 0;
      var thatInd = 0;
      var result = FirstMergeRecorder.COMBINE_RESULT;

      for (var i = 0; i < Constants.MAX_MERGES_TO_RECORD; ++i) {
        // need to be careful here that we don't have both lists
        // reference the same sublist; won't go well with resetting
        if (that.at.get(thatInd) < this.at.get(thisInd)) {
          Utils.swap(result.at, i, that.at, thatInd);
          Utils.swap(result.glyphs, i, that.glyphs, thatInd);
          thatInd++;
        } else if (Utils.Double.eq(that.at.get(thatInd), this.at.get(thisInd))) {
          // } else if (that.at.get(thatInd) === this.at.get(thisInd) && that.at.get(thatInd) !== Number.POSITIVE_INFINITY) {
          // because in JAVA it's
          //! } else if (that.at.get(thatInd) == this.at.get(thisInd)) {
          // AND NOT
          //! } else if (that.at.get(thatInd).equals(this.at.get(thisInd))) {
          Utils.swap(result.at, i, that.at, thatInd);
          Utils.swap(result.glyphs, i, that.glyphs, thatInd);
          result.glyphs.get(i).addAll(this.glyphs.get(thisInd).toArray());
          thisInd++;
          thatInd++;
        } else {
          // that.at.get(thatInd > this.at.get(thisInd)
          Utils.swap(result.at, i, this.at, thisInd);
          Utils.swap(result.glyphs, i, this.glyphs, thisInd);
          thisInd++;
        }

        result.size++;
      }

      if (LOGGER$1 !== null) {
        LOGGER$1.log(Level.FINER, "result #### of merging #### and #### has glyphs ".concat(result.glyphs.toArray().join(", "), " at ").concat(result.at, " (storing in #### now)")); // LOGGER.log(Level.FINER,
        //     "result #{0} of merging #{3} and #{4} has glyphs {1} at {2} (storing in #{3} now)",
        //     new Object[]{
        //     result.hashCode(),
        //     "[" + result.glyphs.stream().map((glyphSet) ->
        //         glyphSet.stream().map(Glyph::toString)
        //             .collect(
        //                 Collectors.joining(", "))
        //     ).collect(Collectors.joining("], [")) + "]",
        //     "[" + result.at.stream().map(Object::toString).collect(
        //         Collectors.joining(", ")) + "]",
        //         this.hashCode(), that.hashCode()
        // });
      } // swap properties with result


      var tmpAt = this.at;
      this.at = result.at;
      result.at = tmpAt;
      var tmpGlyphs = this.glyphs;
      this.glyphs = result.glyphs;
      result.glyphs = tmpGlyphs; // as we reset result and primitive is copied anyway, no need to swap

      this.size = result.size; // reset result, ready for reuse

      result.reset();
      return this;
    }
  }, {
    key: "getGlyphs",
    value: function getGlyphs() {
      return this.glyphs.get(0);
    }
  }, {
    key: "reset",
    value: function reset() {
      this.resizeIfNeeded();

      for (var i = 0; i < Constants.MAX_MERGES_TO_RECORD; ++i) {
        this.at.set(i, Number.POSITIVE_INFINITY);
        this.glyphs.get(i).clear();
      }

      this.size = 0;
    }
  }, {
    key: "resizeIfNeeded",
    value: function resizeIfNeeded() {
      var ws = Constants.MAX_MERGES_TO_RECORD;
      var cs = this.at.size();

      if (cs < ws) {
        for (var i = cs; i < ws; ++i) {
          this.at.add(Number.POSITIVE_INFINITY);
          this.glyphs.add(new ArrayList(1));
        }
      } else if (cs > ws) {
        for (var _i = cs - 1; _i >= ws; --_i) {
          this.at.removeI(_i);
          this.glyphs.removeI(_i);
        }
      }
    }
  }, {
    key: "pop",
    value: function pop(from) {
      if (this.size === 0) {
        return null;
      }

      var at = this.at.get(0);
      Arrays.rotate(this.at, 1); // Collections.rotate(this.at, -1);

      var glyphs = this.glyphs.get(0);
      Arrays.rotate(this.glyphs, 1); // Collections.rotate(this.glyphs, -1);

      this.size--;
      var result = new Array(glyphs.size());
      var i = 0;

      var _iterator = _createForOfIteratorHelper$1(glyphs),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var wth = _step.value;
          result[i++] = new GlyphMerge(from, wth, Constants.ROBUST ? GrowFunction.__intersectAtGlyphGlyph(from, wth) : at);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return result;
    }
  }]);

  return FirstMerge;
}();
var FirstMergeRecorder = /*#__PURE__*/function () {
  function FirstMergeRecorder() {
    _classCallCheck(this, FirstMergeRecorder);

    _defineProperty(this, "_from", void 0);

    _defineProperty(this, "merge", void 0);

    this._from = null;
    this.merge = new FirstMerge();
  }
  /**
   * @see #addEventsTo(MultiQueue, Logger)
   */


  _createClass(FirstMergeRecorder, [{
    key: "addEventsTo",
    value: function addEventsTo(q) {
      var l = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var merges;

      if (Constants.ROBUST) {
        var _iterator2 = _createForOfIteratorHelper$1(this.merge.getGlyphs()),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var glyph = _step2.value;
            q.add(new GlyphMerge(this._from, glyph));
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        this.merge.getGlyphs().clear();
      } else {
        while ((merges = this.merge.pop(this._from)) !== null) {
          var _iterator3 = _createForOfIteratorHelper$1(merges),
              _step3;

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var merge = _step3.value;

              if (LOGGER$1 !== null) {
                LOGGER$1.log(Level.FINE, "recorded ".concat(merge));
              }

              this._from.__recordG(merge);
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }

        this._from.popMergeInto(q, l);
      }

      FirstMergeRecorder.firstReusedRecord = null; // we can reuse all records again
    }
  }, {
    key: "collector",
    value: function collector() {
      var _this = this;

      if (FirstMergeRecorder.collector === undefined) {
        FirstMergeRecorder.collector = function (glyphs) {
          return glyphs.reduce(function (m, g) {
            m.accept(_this, g);
            return m;
          }, FirstMergeRecorder.newInstance());
        }; // FirstMergeRecorder.collector = Collector.of(
        //     FirstMergeRecorder.newInstance(),
        //     (m, g) => m.accept(g),
        //     (a, b) => a.combine(b),
        //     Characteristics.UNORDERED);

      }

      return FirstMergeRecorder.collector;
    }
    /**
     * Start recording possible merges with the given glyph, forgetting about
     * all previous state.
     *
     * @param from Glyph with which merges should be recorded starting now.
     */

  }, {
    key: "from",
    value: function (_from) {
      function from(_x) {
        return _from.apply(this, arguments);
      }

      from.toString = function () {
        return _from.toString();
      };

      return from;
    }(function (from) {
      if (LOGGER$1 !== null) {
        LOGGER$1.log(Level.FINE, "recording merges from ".concat(from));
      }

      this._from = from;
      this.merge.reset();
    }
    /**
     * {@link #record Record} all glyphs in the given stream, as long as
     * they are  and not {@link #from}.
     * <p>
     * This method may use parallelization to speed up recording.
     *
     * @param glyphs Stream of glyphs to record.
     * @deprecated
     */
    )
  }, {
    key: "record",
    value:
    /**
     * @deprecated
     * @param glyphs
     * @param from
     * @param upto
     */
    function record(glyphs, from, upto) {
      if (Array.isArray(glyphs) && from !== undefined && upto !== undefined) {
        return this.__recordGlyphNumberNumber(glyphs, from, upto);
      } else if (glyphs instanceof Stream) {
        return this.__recordStream(glyphs);
      } else if (glyphs instanceof ArrayList) {
        return this.__recordArrayList(glyphs);
      }

      throw new Error("failed to find a way");
    }
    /**
     * {@link #record Record} all glyphs in the given array between the
     * given indices (including {@code from}, excluding {@code upto}). Only when
     * they are  and not {@link #from}, they are recorded.
     * <p>
     * This method may use parallelization to speed up recording.
     *
     * @param glyphs Array of glyphs to look in.
     * @param from   First index of glyph to record.
     * @param upto   Index up to but excluding which glyphs will be recorded.
     */

  }, {
    key: "__recordGlyphNumberNumber",
    value: function __recordGlyphNumberNumber(glyphs, from, upto) {
      this.__recordStream(Arrays.stream(glyphs, from, upto));
    }
    /**
     * {@link #record Record} all glyphs in the given set, as long as
     * they are  and not {@link #from}.
     * <p>
     * This method may use parallelization to speed up recording.
     *
     * @param glyphs Set of glyphs to record.
     */

  }, {
    key: "__recordArrayList",
    value: function __recordArrayList(glyphs) {
      if (glyphs !== null) {
        this.__recordStream(glyphs.stream());
      }
    }
    /**
     * {@link #record Record} all glyphs in the given stream, as long as
     * they are  and not {@link #from}.
     * <p>
     * This method may use parallelization to speed up recording.
     *
     * @param glyphs Stream of glyphs to record.
     */

  }, {
    key: "__recordStream",
    value: function __recordStream(glyphs) {
      var _this2 = this;

      var stream = glyphs.filter(function (glyph) {
        return glyph.isAlive() && glyph != _this2._from;
      });

      if (Constants.ROBUST) {
        this.merge.getGlyphs().addAll(stream.collect(Collectors.toSet()));
      } else {
        this.merge.combine(stream.collect(this.collector()));
      }
    }
  }, {
    key: "recordAllPairs",
    value: function recordAllPairs(cell, q) {
      var glyphs = cell.getGlyphs().toArray();

      for (var i = 0; i < glyphs.length; ++i) {
        // add events for when two glyphs in the same cell touch
        this.from(glyphs[i]);
        Timers.start("first merge recording 5");

        this.__recordGlyphNumberNumber(glyphs, i + 1, glyphs.length);

        Timers.stop("first merge recording 5");
        this.addEventsTo(q);
      }
    }
  }], [{
    key: "getInstance",
    value:
    /**
     * Return a reference to the singleton instance of this class, creating an
     * instance when not done before. The instance will use the given
     * {@link GrowFunction}, and when an instance was created before then the
     * grow function being used by that instance is changed before a reference
     * to it is returned. <b>Note</b> that that will change the grow function
     * being used for all users of the singleton instance!
     * <p>
     * The reason that this class has a singleton instance is that it internally
     * uses the Stream API with instances of a private inner class. Other
     * instances of {@link FirstMergeRecorder} may, via the Stream API, use
     * instances of the private inner class that have a different parent. This
     * goes, as one might expect, horribly wrong. Using a singleton instance is
     * a quick and easy way around this problem.
     *
     * @return A reference to the singleton instance of this class.
     */
    function getInstance() {
      var _this$INSTANCE;

      return (_this$INSTANCE = this.INSTANCE) !== null && _this$INSTANCE !== void 0 ? _this$INSTANCE : this.INSTANCE = new FirstMergeRecorder();
    }
    /**
     * Collector for stream operations.
     */

  }, {
    key: "newInstance",
    value:
    /**
     * Returns an instance of {@link FirstMerge} that is {@link FirstMerge#reset()}
     * and ready to accept and combine. This method may cache instances and reuse
     * them. {@link #REUSABLE_RECORDS} is used to this end.
     */
    function newInstance() {
      // attempt to use cache
      if (this.REUSABLE_RECORDS.size() > 0 && (this.firstReusedRecord == null || this.REUSABLE_RECORDS.getLast() != this.firstReusedRecord)) {
        var _record = this.REUSABLE_RECORDS.pollLast();

        this.REUSABLE_RECORDS.addFirst(_record);

        if (this.firstReusedRecord === null) {
          this.firstReusedRecord = _record;
        }

        return _record;
      } // we are forced to create a new instance, do so


      var record = new FirstMerge();
      this.REUSABLE_RECORDS.addFirst(record);

      if (this.firstReusedRecord === null) {
        this.firstReusedRecord = record;
      }

      return record;
    }
    /**
     * Glyph with which merges are recorded.
     */

  }]);

  return FirstMergeRecorder;
}();

_defineProperty(FirstMergeRecorder, "collector", void 0);

_defineProperty(FirstMergeRecorder, "INSTANCE", void 0);

_defineProperty(FirstMergeRecorder, "REUSABLE_RECORDS", new ArrayDeque());

_defineProperty(FirstMergeRecorder, "COMBINE_RESULT", new FirstMerge());

_defineProperty(FirstMergeRecorder, "firstReusedRecord", null);

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var MultiQueue = /*#__PURE__*/function (_PriorityQueue) {
  _inherits(MultiQueue, _PriorityQueue);

  var _super = _createSuper(MultiQueue);

  function MultiQueue(a, capacity) {
    var _this;

    _classCallCheck(this, MultiQueue);

    var shadow_capacity = capacity;
    var previous = null;

    if (typeof a === 'number') {
      shadow_capacity = a;
    } else {
      previous = a;
    }

    _this = _super.call(this, shadow_capacity);

    _defineProperty(_assertThisInitialized(_this), "counts", void 0);

    _defineProperty(_assertThisInitialized(_this), "id", void 0);

    _defineProperty(_assertThisInitialized(_this), "next", void 0);

    _defineProperty(_assertThisInitialized(_this), "root", void 0);

    _this.counts = previous === null ? [0, 0, 0] : null;
    _this.id = previous === null ? 0 : previous.id + 1;
    _this.next = null;
    _this.root = previous === null ? _assertThisInitialized(_this) : previous.root;
    return _this;
  }
  /**
   * Returns the number of deletions from this queue.
   */


  _createClass(MultiQueue, [{
    key: "getDeletions",
    value: function getDeletions() {
      return this.getCount(MultiQueue.DELETION);
    }
    /**
     * Returns the number of elements that was discarded.
     */

  }, {
    key: "getDiscarded",
    value: function getDiscarded() {
      return this.getCount(MultiQueue.DISCARD);
    }
    /**
     * Returns the number of elements that was added.
     */

  }, {
    key: "getInsertions",
    value: function getInsertions() {
      return this.getCount(MultiQueue.INSERTION);
    }
  }, {
    key: "getNumQueues",
    value: function getNumQueues() {
      var q = this;

      while (q.next !== null) {
        q = q.next;
      }

      return q.id + 1;
    }
  }, {
    key: "add",
    value: function add(e) {
      this.count(MultiQueue.INSERTION);

      if (this === this.root) {
        Timers.start('queue operations');
      } // not split yet, or element can go here anyway?


      var t = _get(_getPrototypeOf(MultiQueue.prototype), "add", this).call(this, e);

      if (this === this.root) {
        Timers.stop('queue operations');
        Stats.record(e.getType().toString(), 1);
      }

      return t;
    }
  }, {
    key: "discard",
    value: function discard() {
      this.count(MultiQueue.DISCARD);

      this._pollString(' discarded');
    }
  }, {
    key: "peek",
    value: function peek() {
      var e = _get(_getPrototypeOf(MultiQueue.prototype), "peek", this).call(this); // try to find something better in next queue(s)


      if (this.next !== null) {
        var f = this.next.peek();

        if (e == null || f != null && f.getAt() < e.getAt()) {
          e = f;
        }
      }

      return e;
    }
  }, {
    key: "poll",
    value: function poll() {
      this.count(MultiQueue.DELETION);
      return this._pollString(' handled');
    }
  }, {
    key: "_pollString",
    value: function _pollString(type) {
      Timers.start('queue operations');
      var e = this.peek();

      this._pollEvent(e);

      Timers.stop('queue operations');
      Stats.record('queue size', this.size());
      Stats.record(e.getType().toString() + type, 1);
      return e;
    }
  }, {
    key: "_pollEvent",
    value: function _pollEvent(e) {
      if (_get(_getPrototypeOf(MultiQueue.prototype), "peek", this).call(this) == e) {
        _get(_getPrototypeOf(MultiQueue.prototype), "poll", this).call(this);

        return;
      } // the way we found `e` means that there must be a `next` now


      this.next._pollEvent(e);
    }
  }, {
    key: "size",
    value: function size() {
      return this.root.sizeNoPrev();
    }
  }, {
    key: "count",
    value: function count(index) {
      this.root.counts[index]++;
    }
  }, {
    key: "getCount",
    value: function getCount(index) {
      return this.root.counts[index];
    }
  }, {
    key: "sizeNoPrev",
    value: function sizeNoPrev() {
      return _get(_getPrototypeOf(MultiQueue.prototype), "size", this).call(this) + (this.next == null ? 0 : this.next.sizeNoPrev());
    }
  }]);

  return MultiQueue;
}(PriorityQueue);

_defineProperty(MultiQueue, "INSERTION", 0);

_defineProperty(MultiQueue, "DELETION", 1);

_defineProperty(MultiQueue, "DISCARD", 2);

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
/**
 * Object that is used to easily share state between
 * {@link QuadTreeClusterer#cluster() cluster} and
 * PriorityQueue) handleGlyphMerge}.
 */

var GlobalState = // we have a queue for nested merges, and a temporary array that is reused,
// and two sets that are reused somewhere deep in the algorithm
// mapping from glyphs to (currently) highest level nodes in resulting clustering
// finally, create an indication of which glyphs still participate
// statistic for sizes of currently alive glyphs
// list of alive big glyphs; these are not in the QuadTree and thus tracked separately
// used as output parameter of #processNestedMerges to indicate if a big glyph was merged
function GlobalState(map) {
  _classCallCheck(this, GlobalState);

  _defineProperty(this, "nestedMerges", new PriorityQueue());

  _defineProperty(this, "createdFromTmp", [null, null]);

  _defineProperty(this, "trackersNeedingUpdate", new ArrayList());

  _defineProperty(this, "orphanedCells", new ArrayList());

  _defineProperty(this, "map", void 0);

  _defineProperty(this, "numAlive", 0);

  _defineProperty(this, "glyphSize", new Stat());

  _defineProperty(this, "bigGlyphs", new ArrayList(2));

  _defineProperty(this, "mergedBigGlyph", false);

  this.map = map;
};

var LOGGER = Constants.LOGGING_ENABLED ? Logger.getLogger("QuadTreeClusterer") : null;
var QuadTreeClusterer = /*#__PURE__*/function () {
  /**
   * Tree with {@link Glyph glyphs} that need clustering.
   */

  /**
   * Resulting clustering.
   */

  /**
   * Single object that is used to easily find merge events to be added.
   */
  function QuadTreeClusterer(tree) {
    _classCallCheck(this, QuadTreeClusterer);

    _defineProperty(this, "tree", void 0);

    _defineProperty(this, "result", void 0);

    _defineProperty(this, "rec", void 0);

    this.tree = tree;
    this.result = null;
    this.rec = null;
  }

  _createClass(QuadTreeClusterer, [{
    key: "cluster",
    value: function cluster() {
      // for debugging only: checking the number of glyphs/entities
      var defaultLevel = LOGGER == null ? null : LOGGER.getLevel();

      if (LOGGER != null) {
        LOGGER.log(Level.FINER, "ENTRY into AgglomerativeClustering#cluster()");
        LOGGER.log(Level.FINE, "clustering using ".concat(Utils.join(" + ", Constants.ROBUST ? "ROBUST" : "", Constants.TRACK && !Constants.ROBUST ? "TRACK" : "", !Constants.ROBUST && !Constants.TRACK ? "FIRST MERGE ONLY" : "", "NO BUCKETING"), " strategy")); // LOGGER.log(Level.FINE, "clustering using {0} strategy", Utils.join(" + ",
        //     (Constants.ROBUST ? "ROBUST" : ""),
        //     (Constants.TRACK && !Constants.ROBUST ? "TRACK" : ""),
        //     (!Constants.ROBUST && !Constants.TRACK ? "FIRST MERGE ONLY" : ""),
        //     "NO BUCKETING"));

        LOGGER.log(Level.FINE, "using the Linear Area Growing Circles grow function");
        LOGGER.log(Level.FINE, "QuadTree has ".concat(this.tree.getSize(), " nodes and height ").concat(this.tree.getTreeHeight(), ", having at most ").concat(Constants.MAX_GLYPHS_PER_CELL, " glyphs per cell and cell size at least ").concat(Constants.MIN_CELL_SIZE.toExponential())); // LOGGER.log(Level.FINE, "QuadTree has {0} nodes and height {1}, having "
        //     + "at most {2} glyphs per cell and cell size at least {3}",
        //     new Object[]{tree.getSize(), tree.getTreeHeight(),
        //     Constants.MAX_GLYPHS_PER_CELL, Double.toString(Constants.MIN_CELL_SIZE)});

        if (LOGGER.isLoggable(Level.FINE)) {
          var n = 0;

          var _iterator = _createForOfIteratorHelper(this.tree.__getLeaves()),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var leaf = _step.value;
              Stats.record("glyphs per cell", leaf.getGlyphs().size());

              var _iterator2 = _createForOfIteratorHelper(leaf.getGlyphs()),
                  _step2;

              try {
                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                  var glyph = _step2.value;
                  n += glyph.getN();
                }
              } catch (err) {
                _iterator2.e(err);
              } finally {
                _iterator2.f();
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }

          Stats.record("total # works", n);
        }
      }

      if (Constants.TIMERS_ENABLED) {
        Timers.start("clustering");
      } // construct a queue, put everything in there - 10x number of glyphs
      // appears to be a good estimate for needed capacity without bucketing


      var q = new MultiQueue(10 * Utils.size(this.tree.iteratorGlyphsAlive())); // also create a result for each glyph, and a map to find them

      var map = new HashMap(); // then create a single object that is used to find first merges

      this.rec = FirstMergeRecorder.getInstance(); // group temporary and shared variables together in one object to reduce
      // the number of parameters to #handleGlyphMerge

      var state = new GlobalState(map); // start recording merge events

      var rect = this.tree.getRectangle();

      var _iterator3 = _createForOfIteratorHelper(this.tree.__getLeaves()),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _leaf = _step3.value;

          var glyphs = _leaf.getGlyphs().toArray();

          for (var i = 0; i < glyphs.length; ++i) {
            // add events for when two glyphs in the same cell touch
            if (LOGGER !== null) LOGGER.log(Level.FINEST, glyphs[i].toString());
            this.rec.from(glyphs[i]);
            if (Constants.TIMERS_ENABLED) Timers.start("first merge recording 1");

            this.rec.__recordGlyphNumberNumber(glyphs, i + 1, glyphs.length);

            if (Constants.TIMERS_ENABLED) Timers.stop("first merge recording 1");
            this.rec.addEventsTo(q, LOGGER); // add events for when a glyph grows out of its cell

            var _iterator9 = _createForOfIteratorHelper(Side.values()),
                _step9;

            try {
              for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                var side = _step9.value;

                // only create an event when it is not a border of the root
                if (!Utils.onBorderOf(_leaf.getSide(side), rect)) {
                  // now, actually create an OUT_OF_CELL event
                  glyphs[i].record(new OutOfCell(glyphs[i], _leaf, side));
                }
              }
            } catch (err) {
              _iterator9.e(err);
            } finally {
              _iterator9.f();
            }

            glyphs[i].popOutOfCellInto(q, LOGGER); // create clustering leaves for all glyphs, count them as alive

            map.put(glyphs[i], new HierarchicalClustering(glyphs[i], 0));
            state.numAlive++;
            state.glyphSize.record(glyphs[i].getN());

            if (!glyphs[i].isAlive()) {
              if (LOGGER != null) {
                LOGGER.log(Level.SEVERE, "unexpected dead glyph in input");
              }

              return null;
            }
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      if (LOGGER != null) {
        LOGGER.log(Level.FINE, "created ".concat(q.size(), " events initially, for ").concat(state.numAlive, " glyphs")); // LOGGER.log(Level.FINE, "created {0} events initially, for {1} glyphs",
        //     new Object[]{q.size(), state.numAlive});
      } // merge glyphs until no pairs to merge remain


      var e;

      while ((e = QuadTreeClusterer.getNextEvent(q, state)) !== null) {
        // log on a slightly higher urgency level when one of the glyphs is tracked
        if (LOGGER !== null) {
          if (LOGGER.getLevel() > Level.FINER) {
            var _iterator4 = _createForOfIteratorHelper(e.getGlyphs()),
                _step4;

            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                var _glyph = _step4.value;

                if (_glyph.track) {
                  LOGGER.setLevel(Level.FINEST);
                  break;
                }
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }
          } // log about handling this event


          LOGGER.log(Level.FINER, "handling ".concat(e.getType(), " at ").concat(e.getAt().toFixed(3), " involving")); // LOGGER.log(Level.FINER, "handling {0} at {1} involving",
          //     new Object[]{e.getType(), e.getAt()});

          var _iterator5 = _createForOfIteratorHelper(e.getGlyphs()),
              _step5;

          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              var _glyph2 = _step5.value;
              LOGGER.log(Level.FINER, _glyph2.toString());
            }
          } catch (err) {
            _iterator5.e(err);
          } finally {
            _iterator5.f();
          }
        } // depending on the type of event, handle it appropriately
        // determine whether one of the glyphs is tracked
        // check if one of the glyphs is big; if so, handle separately
        // handle the merge either normally, or as a big glyph merge


        switch (e.getType()) {
          case Type.MERGE:
            {
              var track = false;

              var _iterator6 = _createForOfIteratorHelper(e.getGlyphs()),
                  _step6;

              try {
                for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                  var _glyph3 = _step6.value;
                  track = track || _glyph3.track;
                }
              } catch (err) {
                _iterator6.e(err);
              } finally {
                _iterator6.f();
              }

              var big = null;
              var bigBig = false;

              var _iterator7 = _createForOfIteratorHelper(e.getGlyphs()),
                  _step7;

              try {
                for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                  var _glyph4 = _step7.value;

                  if (_glyph4.isBig()) {
                    if (big == null) {
                      big = _glyph4;
                    } else {
                      // if there is more than one big glyph involved,
                      // handle it normally
                      big = null;
                      bigBig = true;
                      break;
                    }
                  }
                }
              } catch (err) {
                _iterator7.e(err);
              } finally {
                _iterator7.f();
              }

              if (big === null) {
                if (bigBig) {
                  Stats.count("merge big/big");
                } else {
                  Stats.count("merge small/small");
                }

                this.handleGlyphMerge(e, state, q, track);
              } else {
                Stats.count("merge small/big");
                this.handleBigGlyphMerge(e, state, q, track);
              }

              break;
            }

          case Type.OUT_OF_CELL:
            {
              if (Constants.TIMERS_ENABLED) Timers.start("out of cell event processing");
              this.handleOutOfCell(e, map, false, q);
              if (Constants.TIMERS_ENABLED) Timers.stop("out of cell event processing");
            }
        }

        this.step(); // check ourselves, conditionally
        // reset higher log level for tracked glyphs, if applicable

        if (LOGGER !== null) LOGGER.setLevel(defaultLevel);
      }

      if (LOGGER != null) {
        if (LOGGER.isLoggable(Level.FINE)) {
          Stats.record("total # works", this.result.getGlyph().getN());
        }

        LOGGER.log(Level.FINE, "created ".concat(q.getInsertions(), " events, handled ").concat(q.getDeletions(), " and discarded ").concat(q.getDiscarded(), "; ").concat(q.getInsertions() - q.getDeletions() - q.getDiscarded(), " events were never considered")); // LOGGER.log(Level.FINE, "created {0} events, handled {1} and discarded "
        //     + "{2}; {3} events were never considered",
        //     new Object[]{q.getInsertions(), q.getDeletions(),
        //     q.getDiscarded(), q.getInsertions() - q.getDeletions() -
        // q.getDiscarded()});

        var _iterator8 = _createForOfIteratorHelper(Type.values()),
            _step8;

        try {
          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var t = _step8.value;
            var tn = t.toString();
            var s = Stats.get(tn);
            LOGGER.log(Level.FINE, "\u2192 ".concat(s.getSum(), " ").concat(tn, "s (").concat(Stats.get(tn + " handled").getSum(), " handled, ").concat(Stats.get(tn + " discarded").getSum(), " discarded)")); // LOGGER.log(Level.FINE, "→ {1} {0}s ({2} handled, {3} discarded)", new Object[]{
            //     tn, s.getSum(), Stats.get(tn + " handled").getSum(),
            //         Stats.get(tn + " discarded").getSum()});

            Stats.remove(tn);
            Stats.remove(tn + " handled");
            Stats.remove(tn + " discarded");
          }
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }

        LOGGER.log(Level.FINE, "events were stored in ".concat(q.getNumQueues(), " queue(s)")); // LOGGER.log(Level.FINE, "events were stored in {0} queue(s)", q.getNumQueues());

        LOGGER.log(Level.FINE, "QuadTree has ".concat(this.tree.getSize(), " nodes and height ").concat(this.tree.getTreeHeight(), " now")); // LOGGER.log(Level.FINE, "QuadTree has {0} nodes and height {1} now",
        //     new Object[]{tree.getSize(), tree.getTreeHeight()});

        Stats.logAll(LOGGER);
      }

      if (Constants.TIMERS_ENABLED) Timers.logAll(LOGGER);
      if (LOGGER != null) LOGGER.log(Level.FINER, "RETURN from AgglomerativeClustering#cluster()");
      return this;
    }
  }, {
    key: "getName",
    value: function getName() {
      return "QuadTree Clusterer";
    }
    /**
     * Find glyphs that overlap the given glyph at the given timestamp/zoom level,
     * and create merge events for those instances. Add those merge events to the
     * given priority queue.
     * <p>
     * The merge events created by this function are with {@code null} instead of
     * with {@code with}, for convenience reasons in the nested merge loop. That
     * is, the `merged` glyph changes (the object), even though the conceptual
     * glyph does not. Representing with {@code null} fixes that problem.
     *
     * @param wth      Glyph to check overlap with.
     * @param at        Timestamp/zoom level at which overlap must be checked.
     * @param addTo     Queue to add merge events to.
     * @param bigGlyphs List of big glyphs currently alive.
     * @return Whether any overlap was found at all.
     */

  }, {
    key: "findOverlap",
    value: function findOverlap(wth, at, addTo, bigGlyphs) {
      var foundOverlap = false; // check glyphs in cells of the given glyph

      var bAt; // before `at`, used to store time/zoom level of found merges

      var _iterator10 = _createForOfIteratorHelper(this.tree.__getLeavesGlyphAt(wth, at)),
          _step10;

      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var cell = _step10.value;

          var _iterator12 = _createForOfIteratorHelper(cell.getGlyphsAlive()),
              _step12;

          try {
            for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
              var glyph = _step12.value;

              if ((bAt = GrowFunction.__intersectAtGlyphGlyph(wth, glyph)) <= at) {
                foundOverlap = true;
                addTo.add(new GlyphMerge(null, glyph, bAt));
              }
            }
          } catch (err) {
            _iterator12.e(err);
          } finally {
            _iterator12.f();
          }
        } // also check big glyphs separately

      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }

      var _iterator11 = _createForOfIteratorHelper(bigGlyphs),
          _step11;

      try {
        for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
          var big = _step11.value;

          if (big !== wth && (bAt = GrowFunction.__intersectAtGlyphGlyph(wth, big)) <= at) {
            foundOverlap = true;
            addTo.add(new GlyphMerge(null, big, bAt));
          }
        }
      } catch (err) {
        _iterator11.e(err);
      } finally {
        _iterator11.f();
      }

      return foundOverlap;
    }
    /**
     * Returns the first event that will happen. Normally, this is the head of
     * the given {@link MultiQueue} (modulo discarded events). However, the queues
     * of {@linkplain GlobalState#bigGlyphs big glyphs} are also checked.
     *
     * @return The next event to occur, or {@code null} if there are no more
     * events to handle or only a single alive glyph left.
     */

  }, {
    key: "handleBigGlyphMerge",
    value: function handleBigGlyphMerge(m, s, q, track) {
      if (Constants.TIMERS_ENABLED) {
        Timers.start("[merge event processing] big");
      } // process the merge and all merges that it causes


      var merged = this.processNestedMerges(m, s, q, track); // is the merged glyph not big anymore?

      if (!merged.isBig()) {
        // update queues of big glyphs
        var _iterator13 = _createForOfIteratorHelper(s.bigGlyphs),
            _step13;

        try {
          for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
            var big = _step13.value;
            big.record(new UncertainGlyphMerge(new GlyphMerge(big, merged)));
          } // record merge events and out of cell events

        } catch (err) {
          _iterator13.e(err);
        } finally {
          _iterator13.f();
        }

        this.recordEventsForGlyph(merged, m.getAt(), q);
      } else {
        // we can adopt the merge events if it was a simple big/small merge
        // otherwise we need to rebuild from scratch
        if (s.mergedBigGlyph) {
          this.initializeBigGlyphEvents(merged, s);
        } else {
          // update merge events
          var _iterator14 = _createForOfIteratorHelper(m.getGlyphs()),
              _step14;

          try {
            for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
              var glyph = _step14.value;

              if (glyph.isBig()) {
                merged.adoptUncertainMergeEvents(glyph, m);
              }
            }
          } catch (err) {
            _iterator14.e(err);
          } finally {
            _iterator14.f();
          }
        }
      } // update bookkeeping


      this.recordGlyphAndStats(merged, s, track);

      if (Constants.TIMERS_ENABLED) {
        Timers.stop("[merge event processing] big");
      }
    }
  }, {
    key: "handleGlyphMerge",
    value: function handleGlyphMerge(m, s, q, track) {
      // process the merge and all merges that it causes
      var merged = this.processNestedMerges(m, s, q, track); // if the glyph became big now, it has not been inserted into the QuadTree
      // we need to initialize its queue in that case

      if (merged.isBig()) {
        this.initializeBigGlyphEvents(merged, s);
      } else {
        // update queues of big glyphs
        var _iterator15 = _createForOfIteratorHelper(s.bigGlyphs),
            _step15;

        try {
          for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
            var big = _step15.value;
            big.record(new UncertainGlyphMerge(new GlyphMerge(big, merged)));
          } // record merge events and out of cell events

        } catch (err) {
          _iterator15.e(err);
        } finally {
          _iterator15.f();
        }

        this.recordEventsForGlyph(merged, m.getAt(), q);
      } // update bookkeeping


      this.recordGlyphAndStats(merged, s, track);
    }
  }, {
    key: "handleOutOfCell",
    value: function handleOutOfCell(o, map, includeOutOfCell, q) {
      var glyph = o.getGlyphs()[0]; // possibly include the event

      if (includeOutOfCell && Utils.Double.neq(map.get(glyph).getAt(), o.getAt())) {
        var hc = new HierarchicalClustering(glyph, o.getAt(), map.get(glyph));
        map.put(glyph, hc);
      } // handle orphaned cells


      var cell = o.getCell().getNonOrphanAncestor();

      if (o.getCell() !== cell) {
        // if the event was for an internal border of this non-orphan cell,
        // we don't have to add merge events anymore
        if (!Utils.onBorderOf(o.getCell().getSide(o.getSide()), cell.getRectangle())) {
          // we do need to add an event for when this glyph grows out of
          // the non-orphan cell, because that has not been done yet
          glyph.record(new OutOfCell(glyph, cell, o.getSide()));
          glyph.popOutOfCellInto(q, LOGGER);
          return; // nothing to be done anymore
        }
      } // because of the above check for the border being on the actual border of
      // the non-orphaned cell, the timestamp is exactly the same, so we do not
      // need to (re)calculate it


      var oAt = o.getAt();
      var oppositeSide = o.getSide().opposite(); // create merge events with the glyphs in the neighbors
      // we take the size of the glyph at that point in time into account

      var sideInterval = Side.interval(GrowFunction.sizeAt(glyph, oAt).getBounds2D(), o.getSide());
      if (LOGGER !== null) LOGGER.log(Level.FINER, "size at border is [".concat(sideInterval, "]")); // Copy the set of neighbors returned, as the neighbors may in fact change
      // while the out of cell event is being handled; inserting the glyph into
      // the neighboring cells can cause a split to occur and the neighbors to
      // update. All of that is avoided by making a copy now.

      var neighbors = cell.getNeighbors(o.getSide()).copy(); // const neighbors = new ArrayList(cell.getNeighbors(o.getSide()));

      if (LOGGER !== null) {
        LOGGER.log(Level.FINEST, "growing out of ".concat(o.getSide(), " of ").concat(o.getCell(), " into")); // LOGGER.log(Level.FINEST, "growing out of {1} of {0} into",
        //     new Object[]{o.getCell(), o.getSide();});
      }

      var _iterator16 = _createForOfIteratorHelper(neighbors),
          _step16;

      try {
        for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
          var neighbor = _step16.value;
          if (LOGGER !== null) LOGGER.log(Level.FINEST, neighbor.toString()); // ensure that glyph actually grows into this neighbor

          if (!Utils.intervalsOverlap(Side.interval(neighbor.getSide(oppositeSide), oppositeSide), sideInterval)) {
            if (LOGGER !== null) LOGGER.log(Level.FINEST, "→ but not at this point in time, so ignoring");
            continue;
          } // ensure that glyph was not in this cell yet


          if (neighbor.getGlyphs() !== null && neighbor.getGlyphs().contains(glyph)) {
            if (LOGGER !== null) LOGGER.log(Level.FINEST, "→ but was already in there, so ignoring"); // there might still be other interesting events for this glyph

            glyph.popOutOfCellInto(q, LOGGER);
            continue;
          } // register glyph in cell(s) it grows into


          neighbor.insert(glyph, oAt); // split cell if necessary, to maintain maximum glyphs per cell

          var grownInto = void 0;

          if (neighbor.getGlyphs() !== null && neighbor.getGlyphs().size() > Constants.MAX_GLYPHS_PER_CELL) {
            // 1. split and move glyphs in cell to appropriate leaf cells
            //    (this may split the cell more than once!)
            neighbor.__splitAt(oAt); // 2. invalidate out of cell events with `neighbor`
            //    → done by discarding such events as they exit the queue
            //      (those events work on non-leaf cells; detectable)
            // 3. invalidate merge events across cell boundaries
            //    → not strictly needed; this may result in having multiple
            //      merge events for the same pair of glyphs, but once the
            //      first one is handled, the others are discarded
            // this step is currently not implemented
            // 4. continue with making events in appropriate cells instead
            //    of `neighbor` or all glyphs associated with `neighbor`


            grownInto = neighbor.__getLeavesGlyphAt(glyph, oAt);

            if (LOGGER !== null && LOGGER.isLoggable(Level.FINE)) {
              var _iterator17 = _createForOfIteratorHelper(neighbor.__getLeaves()),
                  _step17;

              try {
                for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
                  var iin = _step17.value;
                  Stats.record("glyphs per cell", iin.getGlyphsAlive().size());
                }
              } catch (err) {
                _iterator17.e(err);
              } finally {
                _iterator17.f();
              }
            }
          } else {
            grownInto = neighbor.__getLeaves();
          }

          this.rec.from(glyph);

          var _iterator18 = _createForOfIteratorHelper(grownInto),
              _step18;

          try {
            for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
              var _iin = _step18.value;
              // create merge events with glyphs in the cells the glyph grows
              // into - we must do this to get correctness
              Timers.start("first merge recording 4");

              this.rec.__recordArrayList(_iin.getGlyphs());

              Timers.stop("first merge recording 4"); // create out of cell events for the cells the glyph grows into,
              // but only when they happen after the current event

              var _iterator19 = _createForOfIteratorHelper(o.getSide().opposite().others()),
                  _step19;

              try {
                for (_iterator19.s(); !(_step19 = _iterator19.n()).done;) {
                  var side = _step19.value;
                  var at = GrowFunction.exitAt(glyph, _iin, side);

                  if (at >= oAt) {
                    // only create an event when at least one neighbor on
                    // this side does not contain the glyph yet
                    var create = false;

                    var neighbors2 = _iin.getNeighbors(side);

                    var _iterator20 = _createForOfIteratorHelper(neighbors2),
                        _step20;

                    try {
                      for (_iterator20.s(); !(_step20 = _iterator20.n()).done;) {
                        var neighbor2 = _step20.value;

                        if (!neighbor2.getGlyphs().contains(glyph)) {
                          create = true;
                          break;
                        }
                      }
                    } catch (err) {
                      _iterator20.e(err);
                    } finally {
                      _iterator20.f();
                    }

                    if (!create) {
                      continue;
                    } // now, actually create an OUT_OF_CELL event


                    if (LOGGER !== null) //     LOGGER.log(Level.FINEST, "→ out of {0} of {2} at {1}",
                      //          new Object[]{side, at, in});
                      LOGGER.log(Level.FINEST, "\u2192 out of ".concat(side, " of ").concat(_iin, " at ").concat(at.toFixed(3)));
                    glyph.record(new OutOfCell(glyph, _iin, side, at));
                  }
                }
              } catch (err) {
                _iterator19.e(err);
              } finally {
                _iterator19.f();
              }
            }
          } catch (err) {
            _iterator18.e(err);
          } finally {
            _iterator18.f();
          }

          glyph.popOutOfCellInto(q, LOGGER);
          this.rec.addEventsTo(q, LOGGER);
        }
      } catch (err) {
        _iterator16.e(err);
      } finally {
        _iterator16.f();
      }
    }
    /**
     * Given a big glyph, create uncertain merge events with all other glyphs in
     * the QuadTree, and other big glyphs if there are any.
     */

  }, {
    key: "initializeBigGlyphEvents",
    value: function initializeBigGlyphEvents(glyph, s) {
      // other big glyphs
      var _iterator21 = _createForOfIteratorHelper(s.bigGlyphs),
          _step21;

      try {
        for (_iterator21.s(); !(_step21 = _iterator21.n()).done;) {
          var big = _step21.value;
          glyph.record(new UncertainGlyphMerge(new GlyphMerge(glyph, big)));
        } // non-big glyphs

      } catch (err) {
        _iterator21.e(err);
      } finally {
        _iterator21.f();
      }

      var _iterator22 = _createForOfIteratorHelper(this.tree.iteratorGlyphsAlive()),
          _step22;

      try {
        for (_iterator22.s(); !(_step22 = _iterator22.n()).done;) {
          var small = _step22.value;
          glyph.record(new UncertainGlyphMerge(new GlyphMerge(glyph, small)));
        }
      } catch (err) {
        _iterator22.e(err);
      } finally {
        _iterator22.f();
      }
    }
    /**
     * Given a merge event, see if performing it would cause more merges, and
     * process those repeatedly until no overlap remains. This function also
     * has glyphs that tracked any merged glyphs update who they track, and
     * inserts the merged glyph into the QuadTree. When the merging of glyphs
     * causes cells of the QuadTree to join, then new merge events are created
     * in those joined cells as well.
     */

  }, {
    key: "processNestedMerges",
    value: function processNestedMerges(m, s, q, track) {
      if (Constants.TIMERS_ENABLED) {
        Timers.start("[merge event processing] total");

        if (track) {
          Timers.start("[merge event processing] total (track)");
        }
      }

      s.nestedMerges.add(m);
      s.mergedBigGlyph = false; // create a merged glyph and ensure that the merged glyph does not
      // overlap other glyphs at this time - repeat until no more overlap

      var merged = null;
      var mergedHC = null;
      var mergedAt = m.getAt();

      if (Constants.TIMERS_ENABLED) {
        Timers.start("[merge event processing] nested merges");
      }

      do {
        nestedMerge: while (!s.nestedMerges.isEmpty()) {
          m = s.nestedMerges.poll(); // check that all glyphs in the merge are still alive

          var _iterator23 = _createForOfIteratorHelper(m.getGlyphs()),
              _step23;

          try {
            for (_iterator23.s(); !(_step23 = _iterator23.n()).done;) {
              var glyph = _step23.value;

              if (glyph !== null && !glyph.isAlive()) {
                continue nestedMerge;
              }
            }
          } catch (err) {
            _iterator23.e(err);
          } finally {
            _iterator23.f();
          }

          if (LOGGER !== null) {
            LOGGER.log(Level.FINEST, "handling nested " + m);
          } // create a merged glyph, update clustering


          if (mergedHC === null) {
            merged = new Glyph(m.getGlyphs());
            mergedHC = _construct(HierarchicalClustering, [merged, mergedAt].concat(_toConsumableArray(Utils.map(m.getGlyphs(), s.map, s.createdFromTmp))));
          } else {
            mergedHC.alsoCreatedFrom(s.map.get(m.getGlyphs()[1]));
            merged = new Glyph(merged, m.getGlyphs()[1]);
            mergedHC.setGlyph(merged);

            if (m.getGlyphs()[1].isBig()) {
              s.mergedBigGlyph = true;
              Stats.count("merge nested big");
            } else {
              Stats.count("merge nested small");
            }
          } // mark merged glyphs as dead


          var _iterator24 = _createForOfIteratorHelper(m.getGlyphs()),
              _step24;

          try {
            for (_iterator24.s(); !(_step24 = _iterator24.n()).done;) {
              var _glyph5 = _step24.value;

              // we skip the `merged` glyph, see `#findOverlap`
              if (_glyph5 === null || !_glyph5.isAlive()) {
                continue;
              }

              _glyph5.perish();

              s.numAlive--;
              s.glyphSize.unrecord(_glyph5.getN());

              if (_glyph5.isBig()) {
                s.bigGlyphs.remove(_glyph5);
              } // copy the set of cells the glyph is in currently, because we
              // are about to change that set and don't want to deal with
              // ConcurrentModificationExceptions...


              var _iterator25 = _createForOfIteratorHelper(_glyph5.getCells().copy()),
                  _step25;

              try {
                for (_iterator25.s(); !(_step25 = _iterator25.n()).done;) {
                  var cell = _step25.value;

                  if (cell.removeGlyph(_glyph5, mergedAt)) {
                    // handle merge events (later, see below)
                    s.orphanedCells.add(cell); // out of cell events are handled when they
                    // occur, see #handleOutOfCell
                  }
                } // update merge events of glyphs that tracked merged glyphs

              } catch (err) {
                _iterator25.e(err);
              } finally {
                _iterator25.f();
              }

              if (Constants.TRACK && !Constants.ROBUST) {
                var _iterator26 = _createForOfIteratorHelper(_glyph5.trackedBy),
                    _step26;

                try {
                  for (_iterator26.s(); !(_step26 = _iterator26.n()).done;) {
                    var tracker = _step26.value;

                    if (!s.trackersNeedingUpdate.contains(tracker)) {
                      s.trackersNeedingUpdate.add(tracker);
                    }
                  }
                } catch (err) {
                  _iterator26.e(err);
                } finally {
                  _iterator26.f();
                }
              }
            }
          } catch (err) {
            _iterator24.e(err);
          } finally {
            _iterator24.f();
          }

          if (LOGGER !== null) {
            LOGGER.log(Level.FINEST, "\u2192 merged glyph is ".concat(merged));
          }
        }
      } while (this.findOverlap(merged, mergedAt, s.nestedMerges, s.bigGlyphs));

      if (Constants.TIMERS_ENABLED) {
        Timers.stop("[merge event processing] nested merges");
        Timers.start("[merge event processing] merge events in joined cells");
      } // handle adding merge events in joined cells


      var uniqueValues = new HashSet();

      var _iterator27 = _createForOfIteratorHelper(s.orphanedCells),
          _step27;

      try {
        for (_iterator27.s(); !(_step27 = _iterator27.n()).done;) {
          var quadTree = _step27.value;
          var nonOrphanAncestor = quadTree.getNonOrphanAncestor();

          if (uniqueValues.add(nonOrphanAncestor)) {
            if (Constants.TIMERS_ENABLED) Timers.start("record all pairs");
            this.rec.recordAllPairs(nonOrphanAncestor.getNonOrphanAncestor(), q);
            if (Constants.TIMERS_ENABLED) Timers.stop("record all pairs");
          }
        }
      } catch (err) {
        _iterator27.e(err);
      } finally {
        _iterator27.f();
      }

      s.orphanedCells.clear();

      if (Constants.TIMERS_ENABLED) {
        Timers.stop("[merge event processing] merge events in joined cells");
        Timers.start("[merge event processing] tracker updating");
      } // update merge events of glyphs that tracked merged glyphs


      if (Constants.TRACK && !Constants.ROBUST) {
        var _iterator28 = _createForOfIteratorHelper(s.trackersNeedingUpdate),
            _step28;

        try {
          for (_iterator28.s(); !(_step28 = _iterator28.n()).done;) {
            var orphan = _step28.value;

            if (orphan.isAlive()) {
              Stats.record("orphan cells", orphan.getCells().size());

              if (!orphan.popMergeInto(q, LOGGER)) {
                this.rec.from(orphan);
                if (Constants.TIMERS_ENABLED) Timers.start("first merge recording 2");

                var _iterator29 = _createForOfIteratorHelper(orphan.getCells()),
                    _step29;

                try {
                  for (_iterator29.s(); !(_step29 = _iterator29.n()).done;) {
                    var _cell = _step29.value;

                    this.rec.__recordArrayList(_cell.getGlyphs());
                  }
                } catch (err) {
                  _iterator29.e(err);
                } finally {
                  _iterator29.f();
                }

                if (Constants.TIMERS_ENABLED) Timers.stop("first merge recording 2");
                this.rec.addEventsTo(q, LOGGER);
              }
            }
          }
        } catch (err) {
          _iterator28.e(err);
        } finally {
          _iterator28.f();
        }

        s.trackersNeedingUpdate.clear();
      }

      if (Constants.TIMERS_ENABLED) {
        Timers.stop("[merge event processing] tracker updating");
        Timers.start("[merge event processing] merged glyph insert");
      } // add new glyph to QuadTree cell(s)


      merged.setBig(s.glyphSize);

      if (!merged.isBig()) {
        this.tree.insert(merged, mergedAt);

        if (LOGGER !== null) {
          LOGGER.log(Level.FINER, "inserted merged glyph into ".concat(merged.getCells().size(), " cells"));
        }
      }

      if (Constants.TIMERS_ENABLED) {
        Timers.stop("[merge event processing] merged glyph insert");
      } // eventually, the last merged glyph is the root


      s.map.put(merged, mergedHC);
      this.result = mergedHC;
      return merged;
    }
  }, {
    key: "recordGlyphAndStats",
    value: function recordGlyphAndStats(merged, s, track) {
      merged.participate();
      s.numAlive++;
      s.glyphSize.record(merged.getN());

      if (merged.isBig()) {
        Stats.record("merged cells big glyphs", merged.getCells().size());
        Stats.record("glyphs around big glyphs", merged.getCells().stream().mapToInt(function (cell) {
          return cell.getGlyphsAlive().size();
        }).sum());
        s.bigGlyphs.add(merged);
        Stats.record("number of big glyphs", s.bigGlyphs.size());
      }

      if (Constants.TIMERS_ENABLED) {
        Timers.stop("[merge event processing] total");

        if (track) {
          Timers.stop("[merge event processing] total (track)");
        }
      }
    }
    /**
     * Given a freshly created glyph originating from a merge, loop over the
     * QuadTree cells of that glyph and record out of cell events for all.
     * In the same loop, find merges as well, using the global {@link #rec}.
     */

  }, {
    key: "recordEventsForGlyph",
    value: function recordEventsForGlyph(merged, at, q) {
      if (Constants.TIMERS_ENABLED) Timers.start("[merge event processing] merge event recording"); // create events with remaining glyphs
      // (we always have to loop over cells here, `merged` has just
      //  been created and thus hasn't recorded merge events yet)

      this.rec.from(merged);
      Stats.record("merged cells", merged.getCells().size());

      var _iterator30 = _createForOfIteratorHelper(merged.getCells()),
          _step30;

      try {
        for (_iterator30.s(); !(_step30 = _iterator30.n()).done;) {
          var cell = _step30.value;
          if (Constants.TIMERS_ENABLED) Timers.start("first merge recording 3");

          this.rec.__recordArrayList(cell.getGlyphs());

          if (Constants.TIMERS_ENABLED) Timers.stop("first merge recording 3"); // create out of cell events

          var _iterator31 = _createForOfIteratorHelper(Side.values()),
              _step31;

          try {
            for (_iterator31.s(); !(_step31 = _iterator31.n()).done;) {
              var side = _step31.value;
              // only create an event when at least one neighbor on
              // this side does not contain the merged glyph yet
              var create = false;
              if (Constants.TIMERS_ENABLED) Timers.start("neighbor finding");
              var neighbors = cell.getNeighbors(side);
              if (Constants.TIMERS_ENABLED) Timers.stop("neighbor finding");

              var _iterator32 = _createForOfIteratorHelper(neighbors),
                  _step32;

              try {
                for (_iterator32.s(); !(_step32 = _iterator32.n()).done;) {
                  var neighbor = _step32.value;

                  if (!neighbor.getGlyphs().contains(merged)) {
                    create = true;
                    break;
                  }
                }
              } catch (err) {
                _iterator32.e(err);
              } finally {
                _iterator32.f();
              }

              if (!create) {
                continue;
              } // now, actually create an OUT_OF_CELL event, but only
              // if the event is still about to happen


              var ooe = new OutOfCell(merged, cell, side);

              if (ooe.getAt() > at) {
                merged.record(ooe);
                if (LOGGER !== null) LOGGER.log(Level.FINEST, "\u2192 out of ".concat(side, " of ").concat(cell, " at ").concat(ooe.getAt().toFixed(3)));
              }
            }
          } catch (err) {
            _iterator31.e(err);
          } finally {
            _iterator31.f();
          }
        }
      } catch (err) {
        _iterator30.e(err);
      } finally {
        _iterator30.f();
      }

      merged.popOutOfCellInto(q, LOGGER);
      this.rec.addEventsTo(q, LOGGER);
      if (Constants.TIMERS_ENABLED) Timers.stop("[merge event processing] merge event recording");
    }
    /**
     * Executed right before going to the next iteration of the event handling
     * loop. Possibly pauses executiong, depending on parameter.
     */

  }, {
    key: "step",
    value: function step() {
      if (Constants.STATS_ENABLED) {
        Stats.record("QuadTree cells", Utils.size(this.tree.iterator()));
        Stats.record("QuadTree leaves", this.tree.__getLeaves().size());
        Stats.record("QuadTree height", this.tree.getTreeHeight());
      }
    }
    /**
     * Returns the latest result of executing the clustering algorithm. Initially
     * {@code null}.
     */

  }, {
    key: "getClustering",
    value: function getClustering() {
      return this.result;
    }
    /**
     * Forget about any clustering obtained so far.
     */

  }, {
    key: "reset",
    value: function reset() {
      this.result = null;
    }
  }], [{
    key: "getNextEvent",
    value: function getNextEvent(q, s) {
      if (s.numAlive <= 1) {
        return null;
      } // check the queue


      var event = null;
      var queueEvent = null;

      findQueueEvent: while (!q.isEmpty()) {
        event = q.peek(); // we ignore out of cell events for non-leaf cells

        if (event.getType() == Type.OUT_OF_CELL && !event.getCell().isLeaf()) {
          q.discard();
          continue;
        } // we ignore this event if not all glyphs from it are alive anymore


        var _iterator33 = _createForOfIteratorHelper(event.getGlyphs()),
            _step33;

        try {
          for (_iterator33.s(); !(_step33 = _iterator33.n()).done;) {
            var glyph = _step33.value;

            if (!glyph.isAlive()) {
              q.discard();
              continue findQueueEvent;
            }
          }
        } catch (err) {
          _iterator33.e(err);
        } finally {
          _iterator33.f();
        }

        event = queueEvent = q.peek();
        break;
      } // check the big glyphs


      var bigGlyph = null;

      var _iterator34 = _createForOfIteratorHelper(s.bigGlyphs),
          _step34;

      try {
        for (_iterator34.s(); !(_step34 = _iterator34.n()).done;) {
          var big = _step34.value;
          LOGGER === null || LOGGER === void 0 ? void 0 : LOGGER.log(Level.FINER, "searching for uncertain merge on ".concat(big));
          var bEvt = big.peekUncertain();
          LOGGER === null || LOGGER === void 0 ? void 0 : LOGGER.log(Level.FINER, "found ".concat(bEvt));

          if (event == null || bEvt != null && bEvt.getAt() < event.getAt()) {
            event = bEvt.getGlyphMerge();
            bigGlyph = big;
          }
        } // if we are going with the queue event, remove it from the queue
        // otherwise remove it from the queue of the glyph it came from

      } catch (err) {
        _iterator34.e(err);
      } finally {
        _iterator34.f();
      }

      if (event !== null) {
        if (event === queueEvent) {
          q.poll();
        } else {
          bigGlyph.pollUncertain();
        }
      }

      return event;
    }
  }]);

  return QuadTreeClusterer;
}();

export { Constants, QuadTree, QuadTreeClusterer };
