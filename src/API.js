// event:timeout supported
var config = require('seedit-config');
var APIScopes = ['common', 'huodong'];
// querystring
var queryString = require('query-string');
var jQuery = require('jquery');
// require iframeTransport for cross-domain use
var $ = require('iframe-ajax')(jQuery);
// for fucking ie
require('json');

var API = {};
// get main domain
var getDomain = function () {
    var hostArray = document.location.host.split('.');
    hostArray.splice(0, 1);
    return hostArray.join('.')
};

// get common API base
var _getURL = function (scope, name, type) {
        var baseURL = '';
        if (/http/.test(scope)) {
            baseURL = scope;
        } else {
            switch (scope) {
                case 'common':
                    baseURL = config.get('commonAPI');
                    break;
                case 'huodong':
                    baseURL = config.get('huodongAPI');
                    break;
                default:
                    baseURL = config.get('commonAPI');
                    break;
            }
        }

        if (name.indexOf('http') !== -1) return name.replace('.json', '.jsonp').replace('jsonpp', 'jsonp');
        return name.indexOf('.') > 0 ? baseURL + '/' + name : baseURL + '/' + name + '.' + type;
    },
    _method = ['GET', 'POST', 'PUT', 'DEL'];

$.each(_method, function (index, value) {
    var method = value.toLowerCase();
    window.__getUid = 0;
    API[method] = function (api, option, successCallback, errorCallback) {
        var _this = this;
        _this.eventCallback = {};
        // default scope
        _this.scope = option.scope;

        if (typeof option === 'string' && /scope/.test(option)) {
            var array = option.split('&');
            var a = array.slice(-1);
            var b = a[0].split('=')[1];
            _this.scope = b;
        }

        delete option.scope;
        var options = {
            context: _this,
            type: 'GET',
            dataType: 'jsonp',
            jsonpCallback: 'request',
            success: function (data) {
                // failure callback
                // 对于API V2,错误值为0外的都发生了请求错误
                if (data['error_code'] && data['error_code'] !== 0) {
                    this.trigger('error', data);
                    if (typeof option === 'function') {
                        successCallback && successCallback.call(this, data);
                    } else {
                        errorCallback && errorCallback.call(this, data);
                    }
                } else {
                    this.trigger('success', data);
                    if (typeof option === 'function') {
                        option.call(this, data);
                    } else {
                        successCallback && successCallback.call(this, data);
                    }
                }
            }
        };

        // build data
        var data = {
            __method: 'GET'
        };

        if (typeof option === 'string') {
            option = queryString.parse(option);
        }
        options.data = typeof option === 'object' ? option : {};

        // build dataType
        var dataType = 'jsonp';
        if (method === 'get') {
            options.jsonp = '__c';
            dataType = 'jsonp';
        } else {
            dataType = 'iframe';
        }
        // build url
        options.url = _getURL(this.scope, api, dataType);
        // build type
        options.type = 'GET';

        if (method !== 'get') {
            options.data.__method = method.toUpperCase();
            if (method === 'del') {
                options.data.__method = 'DELETE';
            }
            options.type = 'POST';
            options.iframe = true;
            options.dataType = 'json';
        }
        if (method !== 'DEL') {
            options.type = 'POST';
            // set document.domain
            var domain = getDomain();
            if (!domain || /^\d+(.*?)\d+$/.test(domain)) {
                alert('必须在生产环境或者本地绑定HOST使用');
                return;
            }

            /*  if (/huodong/.test(options.url)) {
             domain = 'office.bzdev.net';
             }*/
            document.domain = domain;
        }
        // build jsonpCallback
        var key = api.replace('/', '_') + '_' + method;
        // 维护各个请求接口的次数
        this[key] = window.__getUid++;
        // 同一接口不允许有同一个callback名字
        options['jsonpCallback'] = options.url.split('/').slice(3).join('_').replace('.' + options.dataType, '').replace(/\./g, '_') + '_' + this[key];

        $.ajax(options).always(function (jqXHR, textStatus) {
            this.trigger('complete', data);
            if (textStatus === 'timeout') {
                this.trigger('timeout');
            } else if (textStatus === 'abort') {
                this.trigger('abort');
            }
        }).fail(function () {
                this.trigger('fail');
            });
        return this;
    };

    // arale-events 在这里会多次trigger,暂时不清楚原因，于是自己写了个简单的事件支持
    // set event listener
    API[method].prototype.on = function (event, callback) {
        this.eventCallback[event] = this.eventCallback[event] || [];
        this.eventCallback[event].push(callback);
        return this;
    };

    // event trigger
    API[method].prototype.trigger = function (event, data) {
        $(this.eventCallback[event]).each(function (index, one) {
            one(data);
        });
        return this;
    };
});

API.scope = function (scope) {
    return {
        get: function (api, option, successCallback, errorCallback) {
            option.scope = scope;
            return new API.get(api, option, successCallback, errorCallback);
        },
        post: function (api, option, successCallback, errorCallback) {
            if (typeof option === 'object') {
                option.scope = scope;
            } else {
                option += '&scope=' + scope;
            }
            return new API.post(api, option, successCallback, errorCallback);
        },
        put: function (api, option, successCallback, errorCallback, scope) {
            option.scope = scope;
            return new API.put(api, option, successCallback, errorCallback);
        },
        del: function (api, option, successCallback, errorCallback) {
            option.scope = scope;
            return new API.del(api, option, successCallback, errorCallback, scope);
        }
    }
};


module.exports = {
    scope: API.scope,
    get: function (api, option, successCallback, errorCallback) {
        return new API.get(api, option, successCallback, errorCallback);
    },
    post: function (api, option, successCallback, errorCallback) {
        return new API.post(api, option, successCallback, errorCallback);
    },
    put: function (api, option, successCallback, errorCallback) {
        return new API.put(api, option, successCallback, errorCallback);
    },
    del: function (api, option, successCallback, errorCallback) {
        return new API.del(api, option, successCallback, errorCallback);
    }
};