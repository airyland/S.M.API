define("seedit/API/0.0.1/API",["seedit/iframeAjax/0.0.1/iframeAjax","gallery/json/1.0.3/json"],function(a,b,c){var d=jQuery;a("seedit/iframeAjax/0.0.1/iframeAjax"),window.JSON||a("gallery/json/1.0.3/json");var e={},f=function(){return window.seedit&&seedit.CONFIG.APIBaseURL?seedit.CONFIG.APIBaseURL:"http://common.seedit.com/"}(),g=function(a,b){return a.indexOf(".")>0?f+a:f+a+"."+b},h=["GET","POST","PUT","DEL"],i=function(a,b,c){var e={type:"get",dataType:"jsonp",data:{__method:"GET"},jsonp:"__c",jsonpCallback:"request",success:function(a){a.error_code&&0!==a.error_code?c&&c.call(this,a):b&&b.call(this,a)},error:function(){}};a.url=g(a.api,a.dataType),d.extend(e,a);var f=a.api.replace("/","_")+"_"+a.data.__method;delete a.api,void 0===this[f]?this[f]=1:this[f]++,e.jsonpCallback=f.replace(".","_")+"_"+this[f],"get"!==e.type&&(e.type="POST",e.iframe=!0,e.dataType="json",e.url=g(e.api,"iframe")),d.ajax(e)};d.each(h,function(a,b){e[b.toLowerCase()]=function(a,c,e,f){var g={};if("function"==typeof c){if("function"==typeof e){var f;f=e}e=c}else g=c;d.extend(g,{__method:"DEL"===b?"DELETE":b});var h={api:a,dataType:"jsonp",data:g};"string"==typeof arguments[arguments.length-1]&&(h.dataType=arguments[arguments.length-1]),d.extend(h,c),"get"!==b.toLowerCase()&&(h.type="POST",document.domain="seedit.com"),i(h,e,f)}}),c.exports=e});
