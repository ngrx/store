var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('rxjs/Observable');
var BehaviorSubject_1 = require('rxjs/subject/BehaviorSubject');
var Subject_1 = require('rxjs/Subject');
var core_1 = require('angular2/core');
//store specific operators
require('rxjs/add/operator/map');
require('rxjs/add/operator/distinctUntilChanged');
require('rxjs/add/operator/scan');
require('rxjs/add/operator/zip-static');
var Store = (function (_super) {
    __extends(Store, _super);
    function Store(_dispatcher, _reducers, initialState) {
        _super.call(this, initialState);
        this._dispatcher = _dispatcher;
        this._reducers = _reducers;
        var rootReducer = this._mergeReducers(_reducers, initialState);
        this._storeSubscription = rootReducer.subscribe(this);
    }
    /**
     * It allows to add or update a reducer and its initial state on the fly
     * It can be used when you need to load new parts of your store that are
     * not available when the Store is created at startup
     * @param reducer the function(s) to be added
     * @param initialState the optional dictionary representing the state the new reducer
     * should assume
       */
    Store.prototype.replaceReducer = function (reducer, initialState) {
        var newState = this.value;
        Object.keys(reducer).map(function (key) {
            newState = Object.assign(newState, (_a = {}, _a[key] = initialState[key], _a));
            var _a;
        });
        if (this._storeSubscription) {
            this._dispatcher.remove(this._storeSubscription);
            this._storeSubscription = null;
        }
        this._reducers = Object.assign(this._reducers, reducer);
        var newRootReducer = this._mergeReducers(this._reducers, newState);
        this.next(newState);
        this._storeSubscription = newRootReducer.subscribe(this);
    };
    Store.prototype._mergeReducers = function (reducers, initialState) {
        var _this = this;
        var storeKeys = Object.keys(reducers);
        var _stores = Object.keys(reducers).map(function (key) {
            var reducer = reducers[key];
            var initialReducerState = initialState[key];
            if (!initialReducerState && typeof initialReducerState === 'undefined') {
                initialReducerState = reducer(undefined, { type: '__init' });
                initialState[key] = initialReducerState;
            }
            return _this._dispatcher.scan(reducer, initialReducerState);
        });
        return Observable_1.Observable.zip.apply(Observable_1.Observable, _stores.concat([function () {
            var values = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                values[_i - 0] = arguments[_i];
            }
            return storeKeys.reduce(function (state, key, i) {
                state[storeKeys[i]] = values[i];
                return state;
            }, {});
        }]));
    };
    Store.prototype.select = function (keyOrSelector) {
        if (typeof keyOrSelector === 'string' ||
            typeof keyOrSelector === 'number' ||
            typeof keyOrSelector === 'symbol') {
            return this.map(function (state) { return state[keyOrSelector]; }).distinctUntilChanged();
        }
        else if (typeof keyOrSelector === 'function') {
            return this.map(keyOrSelector).distinctUntilChanged();
        }
        else {
            throw new TypeError("Store@select Unknown Parameter Type: "
                + ("Expected type of function or valid key type, got " + typeof keyOrSelector));
        }
    };
    Store.prototype.dispatch = function (action) {
        this._dispatcher.next(action);
    };
    Store.prototype.createAction = function (type) {
        var _this = this;
        return function (payload) {
            _this.dispatch({ type: type, payload: payload });
        };
    };
    return Store;
})(BehaviorSubject_1.BehaviorSubject);
exports.Store = Store;
var Dispatcher = (function (_super) {
    __extends(Dispatcher, _super);
    function Dispatcher() {
        _super.apply(this, arguments);
    }
    Dispatcher.prototype.dispatch = function (action) {
        this.next(action);
    };
    return Dispatcher;
})(Subject_1.Subject);
exports.Dispatcher = Dispatcher;
exports.provideStore = function (reducers, initialState) {
    if (initialState === void 0) { initialState = {}; }
    return [
        Dispatcher,
        core_1.provide(Store, { useFactory: exports.createStore(reducers, initialState), deps: [Dispatcher] }),
    ];
};
exports.createStore = function (reducers, initialState) {
    if (initialState === void 0) { initialState = {}; }
    return function (dispatcher) {
        return new Store(dispatcher, reducers, initialState);
    };
};
