function ivEncodeEntities(t){return $("<div/>").text(t).html()}function ivDecodeEntities(t){return $("<div/>").html(t).text()}function FixWidth(t,i,n,e){var o=n||80,e=e||0;$(t).each(function(){var t=$(this),n=t.width()-1,r=t.find(i),a=parseInt(n/o)+1;if(a>r.length)return!0;var c=n/a-2*e;r.css({width:c+"px",height:c+"px"}),t.css({minHeight:c*parseInt(r.length/a)-1})}),console.log("Выровнено! =)")}var token=token||"",api=api||"/root/library/",Library=function(t,i){var n=!1;return function(e,o,r){return n?void console.log("> Множественные запросы запрещены"):(n=!0,void $.post(i+e,$.extend({token:t},o||{}),function(i){return n=!1,"object"==typeof i?(t=i.token||!1,t||console.log("> Ошибка: token не найден"),void("function"==typeof r&&r(i))):void console.log("> Некорректен формат ответа сервера")},"json"))}}(token,api),Templates=function(t){var i={};return $(t).each(function(){i[$(this).attr("id")]=$(this).remove().html()}),function(t,n){var n=n||{},e=i[t]||"";for(var o in n){var r=new RegExp("{"+o+"}","g");e=e.replace(r,n[o])}return e}}(".template"),Modal=function(){var t=function(){return $(".msg, .black").remove(),!1},i=function(i,n,e){$("body").append('<div class="black"></div><div class="box msg"></div>');var e=parseInt(e||300);100>e&&(e=300),e>$(window).width()-40&&(e=$(window).width()-40),$(".black").click(t).fadeIn(300);var o=$(".msg").append(i||"<h2>Modal</h2>").addClass("animation-jelly");o.css({width:e,marginLeft:-e/2,top:"50%",marginTop:-o.height()/2-15}),(n||function(){})(o)};return{Open:i,Close:t}}(),Picture=function(){var t=function(t){if(!t)return[0,0];var i=t.split(".").slice(-2,-1)[0],n=t.split(".").slice(-3,-2)[0],e=(i.indexOf("x")>=0?i:n).split("x"),o=[e[0]||1,e[1]||1];return o},i=function(i){var n=t(i);return n[0]>$(window).width()||n[1]>$(window).height()},n=function(t){return t.src_small&&i(t.src_small)?hard+t.src_small:t.src_medium&&i(t.src_medium)?hard+t.src_medium:t.src_large&&i(t.src_large)?hard+t.src_large:hard+t.src_main},e=function(i){var e=t(n(i)),o={W:e[0]||1,H:e[1]||1,padding:e[2]||0},r=o.W/o.H,a={W:$(window).width(),H:$(window).height()},c={top:0,left:0,height:o.H,width:o.W},s=r>a.W/(a.H-o.padding);return(1.5*o.W>a.W||1.5*o.H>a.H)&&(s?(c.height=a.W/r,c.width=a.W):(c.width=(a.H-o.padding)*r,c.height=a.H-o.padding)),c.top=(a.H-o.padding-(c.height||o.H))/2,c.left=(a.W-(c.width||o.W))/2,c};return{Src:n,CSS:e,Size:t}}(),Stack=function(){var t={};return function(i,n){if(i){var e=i.toString();t[e]&&clearInterval(t[e].timeout),t[e]={timer:n||500},t[e].timeout=setInterval(function(){return t[e].timer>0?t[e].timer-=50:(clearInterval(t[e].timeout),void i())},50)}}}(),OAuth=function(){var t="https://"+host+"/login/oauth?type=",i={vk:["https://oauth.vk.com/authorize?client_id=4560732","display=popup","scope=friends","redirect_uri="+t+"vk","response_type=code"].join("&"),fb:["https://www.facebook.com/dialog/oauth?client_id=198760110163592","display=popup","redirect_uri="+t+"fb"].join("&"),gp:["https://accounts.google.com/o/oauth2/auth?client_id=183366446733-u0in3boluil3n9lhqv66g5p63lm52onf.apps.googleusercontent.com","response_type=code","scope=openid","redirect_uri="+t+"gp"].join("&")},n=function(t){if($(this).data("id")&&(t=$(this).data("id")),!i[t])return!1;{var n="status=1,width=600,height=420,location=0,menubar=0,centerscreen=yes",e=window.open(i[t],"OAuth",n);window.location.hostname.split(".")}setInterval(function(){-1!=e.location.hash.indexOf("success")&&(location.reload(),e.close())},400)};return n}();$(function(){var t=function(){$("#main").css({minHeight:$(window).height()-38})};$(window).resize(t),t();var i=function(){Modal.Open(Templates("loginModal"),function(){$(".list .ss a").click(OAuth)},400)};$(".login").click(i)});!function(t){"use strict";function e(t){var e=0,a=0;if(t.offsetParent)do e+=t.offsetLeft,a+=t.offsetTop;while(t=t.offsetParent);return{top:a,left:e}}function a(t){var e="";for(var a in t)t.hasOwnProperty(a)&&(e+=a+":"+t[a]+";");return e}var i=i||{},n=document.querySelectorAll.bind(document),r={duration:500,show:function(t){var i=this,n=document.createElement("div");n.className=n.className+"waves-ripple",i.appendChild(n);var o=e(i),s=t.pageY-o.top,d=t.pageX-o.left,u=1.4*i.clientWidth;n.setAttribute("data-hold",Date.now()),n.setAttribute("data-x",d),n.setAttribute("data-y",s);var l={top:s+"px",left:d+"px"};n.className=n.className+" waves-notransition",n.setAttribute("style",a(l)),n.offsetHeight,n.className=n.className.replace("waves-notransition",""),l["border-width"]=u+"px",l["margin-top"]="-"+u+"px",l["margin-left"]="-"+u+"px",l.opacity="1",l["-webkit-transition-duration"]=r.duration+"ms",l["-moz-transition-duration"]=r.duration+"ms",l["-o-transition-duration"]=r.duration+"ms",l["transition-duration"]=r.duration+"ms",n.setAttribute("style",a(l))},hide:function(){for(var t=this,e=1.4*t.clientWidth,i=null,n=0;n<t.children.length;n++)-1===t.children[n].className.indexOf("waves-ripple")||(i=t.children[n]);if(!i)return!1;var o=i.getAttribute("data-x"),s=i.getAttribute("data-y"),d=Date.now()-Number(i.getAttribute("data-hold")),u=500-d;0>u&&(u=0),setTimeout(function(){var n={top:s+"px",left:o+"px","border-width":e+"px","margin-top":"-"+e+"px","margin-left":"-"+e+"px",opacity:"0","-webkit-transition-duration":r.duration+"ms","-moz-transition-duration":r.duration+"ms","-o-transition-duration":r.duration+"ms","transition-duration":r.duration+"ms"};i.setAttribute("style",a(n)),setTimeout(function(){try{t.removeChild(i)}catch(e){return!1}},300)},u)},wrapInput:function(t){for(var e=0;e<t.length;e++){var a=t[e];if("input"===a.tagName.toLowerCase()){var i=a.parentNode;if("i"===i.tagName.toLowerCase()&&-1!==i.className.indexOf("waves-effect"))return!1;var n=document.createElement("i");n.className=a.className+" waves-input-wrapper";var r=a.getAttribute("style"),o="width:"+a.offsetWidth+"px;height:"+a.clientHeight+"px;";r||(r=""),n.setAttribute("style",o+r),a.className="waves-button-input",a.removeAttribute("style"),i.replaceChild(n,a),n.appendChild(a)}}}};i.displayEffect=function(e){e=e||{},"duration"in e&&(r.duration=e.duration),r.wrapInput(n(".waves-effect")),Array.prototype.forEach.call(n(".waves-effect"),function(e){t.Touch&&(e.addEventListener("touchstart",r.show,!1),e.addEventListener("touchend",r.hide,!1)),e.addEventListener("mousedown",r.show,!1),e.addEventListener("mouseup",r.hide,!1),e.addEventListener("mouseleave",r.hide,!1)})},t.Waves=i}(window);!function(t){"function"==typeof define&&define.amd?define(["jquery"],t):t(jQuery)}(function(t,e){var i=0,n=Array.prototype.slice,s=t.cleanData;t.cleanData=function(e){for(var i,n=0;null!=(i=e[n]);n++)try{t(i).triggerHandler("remove")}catch(o){}s(e)},t.widget=function(e,i,n){var s,o,a,r,u={},d=e.split(".")[0];e=e.split(".")[1],s=d+"-"+e,n||(n=i,i=t.Widget),t.expr[":"][s.toLowerCase()]=function(e){return!!t.data(e,s)},t[d]=t[d]||{},o=t[d][e],a=t[d][e]=function(t,e){return this._createWidget?void(arguments.length&&this._createWidget(t,e)):new a(t,e)},t.extend(a,o,{version:n.version,_proto:t.extend({},n),_childConstructors:[]}),r=new i,r.options=t.widget.extend({},r.options),t.each(n,function(e,n){return t.isFunction(n)?void(u[e]=function(){var t=function(){return i.prototype[e].apply(this,arguments)},s=function(t){return i.prototype[e].apply(this,t)};return function(){var e,i=this._super,o=this._superApply;return this._super=t,this._superApply=s,e=n.apply(this,arguments),this._super=i,this._superApply=o,e}}()):void(u[e]=n)}),a.prototype=t.widget.extend(r,{widgetEventPrefix:o?r.widgetEventPrefix:e},u,{constructor:a,namespace:d,widgetName:e,widgetFullName:s}),o?(t.each(o._childConstructors,function(e,i){var n=i.prototype;t.widget(n.namespace+"."+n.widgetName,a,i._proto)}),delete o._childConstructors):i._childConstructors.push(a),t.widget.bridge(e,a)},t.widget.extend=function(i){for(var s,o,a=n.call(arguments,1),r=0,u=a.length;u>r;r++)for(s in a[r])o=a[r][s],a[r].hasOwnProperty(s)&&o!==e&&(i[s]=t.isPlainObject(o)?t.isPlainObject(i[s])?t.widget.extend({},i[s],o):t.widget.extend({},o):o);return i},t.widget.bridge=function(i,s){var o=s.prototype.widgetFullName||i;t.fn[i]=function(a){var r="string"==typeof a,u=n.call(arguments,1),d=this;return a=!r&&u.length?t.widget.extend.apply(null,[a].concat(u)):a,this.each(r?function(){var n,s=t.data(this,o);return s?t.isFunction(s[a])&&"_"!==a.charAt(0)?(n=s[a].apply(s,u),n!==s&&n!==e?(d=n&&n.jquery?d.pushStack(n.get()):n,!1):void 0):t.error("no such method '"+a+"' for "+i+" widget instance"):t.error("cannot call methods on "+i+" prior to initialization; attempted to call method '"+a+"'")}:function(){var e=t.data(this,o);e?e.option(a||{})._init():t.data(this,o,new s(a,this))}),d}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(e,n){n=t(n||this.defaultElement||this)[0],this.element=t(n),this.uuid=i++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=t.widget.extend({},this.options,this._getCreateOptions(),e),this.bindings=t(),this.hoverable=t(),this.focusable=t(),n!==this&&(t.data(n,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===n&&this.destroy()}}),this.document=t(n.style?n.ownerDocument:n.document||n),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:t.noop,_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(t.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:t.noop,widget:function(){return this.element},option:function(i,n){var s,o,a,r=i;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof i)if(r={},s=i.split("."),i=s.shift(),s.length){for(o=r[i]=t.widget.extend({},this.options[i]),a=0;a<s.length-1;a++)o[s[a]]=o[s[a]]||{},o=o[s[a]];if(i=s.pop(),n===e)return o[i]===e?null:o[i];o[i]=n}else{if(n===e)return this.options[i]===e?null:this.options[i];r[i]=n}return this._setOptions(r),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return this.options[t]=e,"disabled"===t&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!e).attr("aria-disabled",e),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(e,i,n){var s,o=this;"boolean"!=typeof e&&(n=i,i=e,e=!1),n?(i=s=t(i),this.bindings=this.bindings.add(i)):(n=i,i=this.element,s=this.widget()),t.each(n,function(n,a){function r(){return e||o.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof a?o[a]:a).apply(o,arguments):void 0}"string"!=typeof a&&(r.guid=a.guid=a.guid||r.guid||t.guid++);var u=n.match(/^(\w+)\s*(.*)$/),d=u[1]+o.eventNamespace,h=u[2];h?s.delegate(h,d,r):i.bind(d,r)})},_off:function(t,e){e=(e||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,t.unbind(e).undelegate(e)},_delay:function(t,e){function i(){return("string"==typeof t?n[t]:t).apply(n,arguments)}var n=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){t(e.currentTarget).addClass("ui-state-hover")},mouseleave:function(e){t(e.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){t(e.currentTarget).addClass("ui-state-focus")},focusout:function(e){t(e.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(e,i,n){var s,o,a=this.options[e];if(n=n||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(s in o)s in i||(i[s]=o[s]);return this.element.trigger(i,n),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(n))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(n,s,o){"string"==typeof s&&(s={effect:s});var a,r=s?s===!0||"number"==typeof s?i:s.effect||i:e;s=s||{},"number"==typeof s&&(s={duration:s}),a=!t.isEmptyObject(s),s.complete=o,s.delay&&n.delay(s.delay),a&&t.effects&&t.effects.effect[r]?n[e](s):r!==e&&n[r]?n[r](s.duration,s.easing,o):n.queue(function(i){t(this)[e](),o&&o.call(n[0]),i()})}})});!function(e){"use strict";"function"==typeof define&&define.amd?define(["jquery"],e):e(window.jQuery)}(function(e){"use strict";var t=0;e.ajaxTransport("iframe",function(r){if(r.async){var a,n,o;return{send:function(p,i){a=e('<form style="display:none;"></form>'),a.attr("accept-charset",r.formAcceptCharset),o=/\?/.test(r.url)?"&":"?","DELETE"===r.type?(r.url=r.url+o+"_method=DELETE",r.type="POST"):"PUT"===r.type?(r.url=r.url+o+"_method=PUT",r.type="POST"):"PATCH"===r.type&&(r.url=r.url+o+"_method=PATCH",r.type="POST"),n=e('<iframe src="javascript:false;" name="iframe-transport-'+(t+=1)+'"></iframe>').bind("load",function(){var t,o=e.isArray(r.paramName)?r.paramName:[r.paramName];n.unbind("load").bind("load",function(){var t;try{if(t=n.contents(),!t.length||!t[0].firstChild)throw new Error}catch(r){t=void 0}i(200,"success",{iframe:t}),e('<iframe src="javascript:false;"></iframe>').appendTo(a),a.remove()}),a.prop("target",n.prop("name")).prop("action",r.url).prop("method",r.type),r.formData&&e.each(r.formData,function(t,r){e('<input type="hidden"/>').prop("name",r.name).val(r.value).appendTo(a)}),r.fileInput&&r.fileInput.length&&"POST"===r.type&&(t=r.fileInput.clone(),r.fileInput.after(function(e){return t[e]}),r.paramName&&r.fileInput.each(function(t){e(this).prop("name",o[t]||r.paramName)}),a.append(r.fileInput).prop("enctype","multipart/form-data").prop("encoding","multipart/form-data")),a.submit(),t&&t.length&&r.fileInput.each(function(r,a){var n=e(t[r]);e(a).prop("name",n.prop("name")),n.replaceWith(a)})}),a.append(n).appendTo(document.body)},abort:function(){n&&n.unbind("load").prop("src","javascript".concat(":false;")),a&&a.remove()}}}}),e.ajaxSetup({converters:{"iframe text":function(t){return t&&e(t[0].body).text()},"iframe json":function(t){return t&&e.parseJSON(e(t[0].body).text())},"iframe html":function(t){return t&&e(t[0].body).html()},"iframe script":function(t){return t&&e.globalEval(e(t[0].body).text())}}})});!function(e){"use strict";"function"==typeof define&&define.amd?define(["jquery","jquery.ui.widget"],e):e(window.jQuery)}(function(e){"use strict";e.support.xhrFileUpload=!(!window.XMLHttpRequestUpload||!window.FileReader),e.support.xhrFormDataFileUpload=!!window.FormData,e.widget("blueimp.fileupload",{options:{dropZone:e(document),pasteZone:e(document),fileInput:void 0,replaceFileInput:!0,paramName:void 0,singleFileUploads:!0,limitMultiFileUploads:void 0,sequentialUploads:!1,limitConcurrentUploads:void 0,forceIframeTransport:!1,redirect:void 0,redirectParamName:void 0,postMessage:void 0,multipart:!0,maxChunkSize:void 0,uploadedBytes:void 0,recalculateProgress:!0,progressInterval:100,bitrateInterval:500,autoUpload:!0,formData:function(e){return e.serializeArray()},add:function(t,i){(i.autoUpload||i.autoUpload!==!1&&(e(this).data("blueimp-fileupload")||e(this).data("fileupload")).options.autoUpload)&&i.submit()},processData:!1,contentType:!1,cache:!1},_refreshOptionsList:["fileInput","dropZone","pasteZone","multipart","forceIframeTransport"],_BitrateTimer:function(){this.timestamp=+new Date,this.loaded=0,this.bitrate=0,this.getBitrate=function(e,t,i){var r=e-this.timestamp;return(!this.bitrate||!i||r>i)&&(this.bitrate=(t-this.loaded)*(1e3/r)*8,this.loaded=t,this.timestamp=e),this.bitrate}},_isXHRUpload:function(t){return!t.forceIframeTransport&&(!t.multipart&&e.support.xhrFileUpload||e.support.xhrFormDataFileUpload)},_getFormData:function(t){var i;return"function"==typeof t.formData?t.formData(t.form):e.isArray(t.formData)?t.formData:t.formData?(i=[],e.each(t.formData,function(e,t){i.push({name:e,value:t})}),i):[]},_getTotal:function(t){var i=0;return e.each(t,function(e,t){i+=t.size||1}),i},_initProgressObject:function(e){e._progress={loaded:0,total:0,bitrate:0}},_onProgress:function(e,t){if(e.lengthComputable){var i,r=+new Date;if(t._time&&t.progressInterval&&r-t._time<t.progressInterval&&e.loaded!==e.total)return;t._time=r,i=Math.floor(e.loaded/e.total*(t.chunkSize||t._progress.total))+(t.uploadedBytes||0),this._progress.loaded+=i-t._progress.loaded,this._progress.bitrate=this._bitrateTimer.getBitrate(r,this._progress.loaded,t.bitrateInterval),t._progress.loaded=t.loaded=i,t._progress.bitrate=t.bitrate=t._bitrateTimer.getBitrate(r,i,t.bitrateInterval),this._trigger("progress",e,t),this._trigger("progressall",e,this._progress)}},_initProgressListener:function(t){var i=this,r=t.xhr?t.xhr():e.ajaxSettings.xhr();r.upload&&(e(r.upload).bind("progress",function(e){var r=e.originalEvent;e.lengthComputable=r.lengthComputable,e.loaded=r.loaded,e.total=r.total,i._onProgress(e,t)}),t.xhr=function(){return r})},_initXHRData:function(t){var i,r=t.files[0],n=t.multipart||!e.support.xhrFileUpload,o=t.paramName[0];t.headers=t.headers||{},t.contentRange&&(t.headers["Content-Range"]=t.contentRange),n?e.support.xhrFormDataFileUpload&&(t.postMessage?(i=this._getFormData(t),t.blob?i.push({name:o,value:t.blob}):e.each(t.files,function(e,r){i.push({name:t.paramName[e]||o,value:r})})):(t.formData instanceof FormData?i=t.formData:(i=new FormData,e.each(this._getFormData(t),function(e,t){i.append(t.name,t.value)})),t.blob?(t.headers["Content-Disposition"]='attachment; filename="'+encodeURI(r.name)+'"',i.append(o,t.blob,r.name)):e.each(t.files,function(e,r){(window.Blob&&r instanceof Blob||window.File&&r instanceof File)&&i.append(t.paramName[e]||o,r,r.name)})),t.data=i):(t.headers["Content-Disposition"]='attachment; filename="'+encodeURI(r.name)+'"',t.contentType=r.type,t.data=t.blob||r),t.blob=null},_initIframeSettings:function(t){t.dataType="iframe "+(t.dataType||""),t.formData=this._getFormData(t),t.redirect&&e("<a></a>").prop("href",t.url).prop("host")!==location.host&&t.formData.push({name:t.redirectParamName||"redirect",value:t.redirect})},_initDataSettings:function(e){this._isXHRUpload(e)?(this._chunkedUpload(e,!0)||(e.data||this._initXHRData(e),this._initProgressListener(e)),e.postMessage&&(e.dataType="postmessage "+(e.dataType||""))):this._initIframeSettings(e,"iframe")},_getParamName:function(t){var i=e(t.fileInput),r=t.paramName;return r?e.isArray(r)||(r=[r]):(r=[],i.each(function(){for(var t=e(this),i=t.prop("name")||"files[]",n=(t.prop("files")||[1]).length;n;)r.push(i),n-=1}),r.length||(r=[i.prop("name")||"files[]"])),r},_initFormSettings:function(t){t.form&&t.form.length||(t.form=e(t.fileInput.prop("form")),t.form.length||(t.form=e(this.options.fileInput.prop("form")))),t.paramName=this._getParamName(t),t.url||(t.url=t.form.prop("action")||location.href),t.type=(t.type||t.form.prop("method")||"").toUpperCase(),"POST"!==t.type&&"PUT"!==t.type&&"PATCH"!==t.type&&(t.type="POST"),t.formAcceptCharset||(t.formAcceptCharset=t.form.attr("accept-charset"))},_getAJAXSettings:function(t){var i=e.extend({},this.options,t);return this._initFormSettings(i),this._initDataSettings(i),i},_getDeferredState:function(e){return e.state?e.state():e.isResolved()?"resolved":e.isRejected()?"rejected":"pending"},_enhancePromise:function(e){return e.success=e.done,e.error=e.fail,e.complete=e.always,e},_getXHRPromise:function(t,i,r){var n=e.Deferred(),o=n.promise();return i=i||this.options.context||o,t===!0?n.resolveWith(i,r):t===!1&&n.rejectWith(i,r),o.abort=n.promise,this._enhancePromise(o)},_addConvenienceMethods:function(e,t){var i=this;t.submit=function(){return"pending"!==this.state()&&(t.jqXHR=this.jqXHR=i._trigger("submit",e,this)!==!1&&i._onSend(e,this)),this.jqXHR||i._getXHRPromise()},t.abort=function(){return this.jqXHR?this.jqXHR.abort():this._getXHRPromise()},t.state=function(){return this.jqXHR?i._getDeferredState(this.jqXHR):void 0},t.progress=function(){return this._progress}},_getUploadedBytes:function(e){var t=e.getResponseHeader("Range"),i=t&&t.split("-"),r=i&&i.length>1&&parseInt(i[1],10);return r&&r+1},_chunkedUpload:function(t,i){var r,n,o=this,s=t.files[0],a=s.size,l=t.uploadedBytes=t.uploadedBytes||0,p=t.maxChunkSize||a,d=s.slice||s.webkitSlice||s.mozSlice,u=e.Deferred(),h=u.promise();return this._isXHRUpload(t)&&d&&(l||a>p)&&!t.data?i?!0:l>=a?(s.error="Uploaded bytes exceed file size",this._getXHRPromise(!1,t.context,[null,"error",s.error])):(n=function(){var i=e.extend({},t),h=i._progress.loaded;i.blob=d.call(s,l,l+p,s.type),i.chunkSize=i.blob.size,i.contentRange="bytes "+l+"-"+(l+i.chunkSize-1)+"/"+a,o._initXHRData(i),o._initProgressListener(i),r=(o._trigger("chunksend",null,i)!==!1&&e.ajax(i)||o._getXHRPromise(!1,i.context)).done(function(r,s,p){l=o._getUploadedBytes(p)||l+i.chunkSize,i._progress.loaded===h&&o._onProgress(e.Event("progress",{lengthComputable:!0,loaded:l-i.uploadedBytes,total:l-i.uploadedBytes}),i),t.uploadedBytes=i.uploadedBytes=l,i.result=r,i.textStatus=s,i.jqXHR=p,o._trigger("chunkdone",null,i),o._trigger("chunkalways",null,i),a>l?n():u.resolveWith(i.context,[r,s,p])}).fail(function(e,t,r){i.jqXHR=e,i.textStatus=t,i.errorThrown=r,o._trigger("chunkfail",null,i),o._trigger("chunkalways",null,i),u.rejectWith(i.context,[e,t,r])})},this._enhancePromise(h),h.abort=function(){return r.abort()},n(),h):!1},_beforeSend:function(e,t){0===this._active&&(this._trigger("start"),this._bitrateTimer=new this._BitrateTimer,this._progress.loaded=this._progress.total=0,this._progress.bitrate=0),t._progress||(t._progress={}),t._progress.loaded=t.loaded=t.uploadedBytes||0,t._progress.total=t.total=this._getTotal(t.files)||1,t._progress.bitrate=t.bitrate=0,this._active+=1,this._progress.loaded+=t.loaded,this._progress.total+=t.total},_onDone:function(t,i,r,n){var o=n._progress.total;n._progress.loaded<o&&this._onProgress(e.Event("progress",{lengthComputable:!0,loaded:o,total:o}),n),n.result=t,n.textStatus=i,n.jqXHR=r,this._trigger("done",null,n)},_onFail:function(e,t,i,r){r.jqXHR=e,r.textStatus=t,r.errorThrown=i,this._trigger("fail",null,r),r.recalculateProgress&&(this._progress.loaded-=r._progress.loaded,this._progress.total-=r._progress.total)},_onAlways:function(e,t,i,r){this._active-=1,this._trigger("always",null,r),0===this._active&&this._trigger("stop")},_onSend:function(t,i){i.submit||this._addConvenienceMethods(t,i);var r,n,o,s,a=this,l=a._getAJAXSettings(i),p=function(){return a._sending+=1,l._bitrateTimer=new a._BitrateTimer,r=r||((n||a._trigger("send",t,l)===!1)&&a._getXHRPromise(!1,l.context,n)||a._chunkedUpload(l)||e.ajax(l)).done(function(e,t,i){a._onDone(e,t,i,l)}).fail(function(e,t,i){a._onFail(e,t,i,l)}).always(function(e,t,i){if(a._sending-=1,a._onAlways(e,t,i,l),l.limitConcurrentUploads&&l.limitConcurrentUploads>a._sending)for(var r=a._slots.shift();r;){if("pending"===a._getDeferredState(r)){r.resolve();break}r=a._slots.shift()}})};return this._beforeSend(t,l),this.options.sequentialUploads||this.options.limitConcurrentUploads&&this.options.limitConcurrentUploads<=this._sending?(this.options.limitConcurrentUploads>1?(o=e.Deferred(),this._slots.push(o),s=o.pipe(p)):s=this._sequence=this._sequence.pipe(p,p),s.abort=function(){return n=[void 0,"abort","abort"],r?r.abort():(o&&o.rejectWith(l.context,n),p())},this._enhancePromise(s)):p()},_onAdd:function(t,i){var r,n,o,s,a=this,l=!0,p=e.extend({},this.options,i),d=p.limitMultiFileUploads,u=this._getParamName(p);if((p.singleFileUploads||d)&&this._isXHRUpload(p))if(!p.singleFileUploads&&d)for(o=[],r=[],s=0;s<i.files.length;s+=d)o.push(i.files.slice(s,s+d)),n=u.slice(s,s+d),n.length||(n=u),r.push(n);else r=u;else o=[i.files],r=[u];return i.originalFiles=i.files,e.each(o||i.files,function(n,s){var p=e.extend({},i);return p.files=o?s:[s],p.paramName=r[n],a._initProgressObject(p),a._addConvenienceMethods(t,p),l=a._trigger("add",t,p)}),l},_replaceFileInput:function(t){var i=t.clone(!0);e("<form></form>").append(i)[0].reset(),t.after(i).detach(),e.cleanData(t.unbind("remove")),this.options.fileInput=this.options.fileInput.map(function(e,r){return r===t[0]?i[0]:r}),t[0]===this.element[0]&&(this.element=i)},_handleFileTreeEntry:function(t,i){var r,n=this,o=e.Deferred(),s=function(e){e&&!e.entry&&(e.entry=t),o.resolve([e])};return i=i||"",t.isFile?t._file?(t._file.relativePath=i,o.resolve(t._file)):t.file(function(e){e.relativePath=i,o.resolve(e)},s):t.isDirectory?(r=t.createReader(),r.readEntries(function(e){n._handleFileTreeEntries(e,i+t.name+"/").done(function(e){o.resolve(e)}).fail(s)},s)):o.resolve([]),o.promise()},_handleFileTreeEntries:function(t,i){var r=this;return e.when.apply(e,e.map(t,function(e){return r._handleFileTreeEntry(e,i)})).pipe(function(){return Array.prototype.concat.apply([],arguments)})},_getDroppedFiles:function(t){t=t||{};var i=t.items;return i&&i.length&&(i[0].webkitGetAsEntry||i[0].getAsEntry)?this._handleFileTreeEntries(e.map(i,function(e){var t;return e.webkitGetAsEntry?(t=e.webkitGetAsEntry(),t&&(t._file=e.getAsFile()),t):e.getAsEntry()})):e.Deferred().resolve(e.makeArray(t.files)).promise()},_getSingleFileInputFiles:function(t){t=e(t);var i,r,n=t.prop("webkitEntries")||t.prop("entries");if(n&&n.length)return this._handleFileTreeEntries(n);if(i=e.makeArray(t.prop("files")),i.length)void 0===i[0].name&&i[0].fileName&&e.each(i,function(e,t){t.name=t.fileName,t.size=t.fileSize});else{if(r=t.prop("value"),!r)return e.Deferred().resolve([]).promise();i=[{name:r.replace(/^.*\\/,"")}]}return e.Deferred().resolve(i).promise()},_getFileInputFiles:function(t){return t instanceof e&&1!==t.length?e.when.apply(e,e.map(t,this._getSingleFileInputFiles)).pipe(function(){return Array.prototype.concat.apply([],arguments)}):this._getSingleFileInputFiles(t)},_onChange:function(t){var i=this,r={fileInput:e(t.target),form:e(t.target.form)};this._getFileInputFiles(r.fileInput).always(function(e){r.files=e,i.options.replaceFileInput&&i._replaceFileInput(r.fileInput),i._trigger("change",t,r)!==!1&&i._onAdd(t,r)})},_onPaste:function(t){var i=t.originalEvent.clipboardData,r=i&&i.items||[],n={files:[]};return e.each(r,function(e,t){var i=t.getAsFile&&t.getAsFile();i&&n.files.push(i)}),this._trigger("paste",t,n)===!1||this._onAdd(t,n)===!1?!1:void 0},_onDrop:function(e){var t=this,i=e.dataTransfer=e.originalEvent.dataTransfer,r={};i&&i.files&&i.files.length&&e.preventDefault(),this._getDroppedFiles(i).always(function(i){r.files=i,t._trigger("drop",e,r)!==!1&&t._onAdd(e,r)})},_onDragOver:function(t){var i=t.dataTransfer=t.originalEvent.dataTransfer;return this._trigger("dragover",t)===!1?!1:void(i&&-1!==e.inArray("Files",i.types)&&(i.dropEffect="copy",t.preventDefault()))},_initEventHandlers:function(){this._isXHRUpload(this.options)&&(this._on(this.options.dropZone,{dragover:this._onDragOver,drop:this._onDrop}),this._on(this.options.pasteZone,{paste:this._onPaste})),this._on(this.options.fileInput,{change:this._onChange})},_destroyEventHandlers:function(){this._off(this.options.dropZone,"dragover drop"),this._off(this.options.pasteZone,"paste"),this._off(this.options.fileInput,"change")},_setOption:function(t,i){var r=-1!==e.inArray(t,this._refreshOptionsList);r&&this._destroyEventHandlers(),this._super(t,i),r&&(this._initSpecialOptions(),this._initEventHandlers())},_initSpecialOptions:function(){var t=this.options;void 0===t.fileInput?t.fileInput=this.element.is('input[type="file"]')?this.element:this.element.find('input[type="file"]'):t.fileInput instanceof e||(t.fileInput=e(t.fileInput)),t.dropZone instanceof e||(t.dropZone=e(t.dropZone)),t.pasteZone instanceof e||(t.pasteZone=e(t.pasteZone))},_create:function(){var t=this.options;e.extend(t,e(this.element[0].cloneNode(!1)).data()),this._initSpecialOptions(),this._slots=[],this._sequence=this._getXHRPromise(!0),this._sending=this._active=0,this._initProgressObject(this),this._initEventHandlers()},progress:function(){return this._progress},add:function(t){var i=this;t&&!this.options.disabled&&(t.fileInput&&!t.files?this._getFileInputFiles(t.fileInput).always(function(e){t.files=e,i._onAdd(null,t)}):(t.files=e.makeArray(t.files),this._onAdd(null,t)))},send:function(t){if(t&&!this.options.disabled){if(t.fileInput&&!t.files){var i,r,n=this,o=e.Deferred(),s=o.promise();return s.abort=function(){return r=!0,i?i.abort():(o.reject(null,"abort","abort"),s)},this._getFileInputFiles(t.fileInput).always(function(e){r||(t.files=e,i=n._onSend(null,t).then(function(e,t,i){o.resolve(e,t,i)},function(e,t,i){o.reject(e,t,i)}))}),this._enhancePromise(s)}if(t.files=e.makeArray(t.files),t.files.length)return this._onSend(null,t)}return this._getXHRPromise(!1,t&&t.context)}})});$(function(){$("#drop a.select").click(function(){$(this).parent().find("input").click()}),$("#upload").fileupload({limitConcurrentUploads:1,dropZone:$("#drop"),add:function(o,n){n.submit()},fail:function(){location.reload()},done:function(o,n){"0"==n.result?location.href="/root":$("#drop").css({borderColor:"#a00"}).find("p").html("Это не приглашение. Вы что-то попутали #"+(Math.random()+"").substr(2,5))}}),$(document).on("drop dragover",function(o){o.preventDefault()})});