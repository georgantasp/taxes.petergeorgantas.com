'use strict';

angular.module('taxes')
.filter('first', function(){
  return _.first;
})
.filter('last', function(){
  return _.last;
})
.filter('moment', function(){
  return function(value, format){
    if(!value){
      return value;
    }
    return value.format(format);
  };
})
.filter('byFunc', function(){
  return function(value, func){
    return _.filter(value, func);
  }
})
.directive('gist', function() {
  return function(scope, elm, attrs) {
    var gistId = attrs.gist;

    var iframe = document.createElement('iframe');
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('frameborder', '0');
    iframe.id = "gist-" + gistId;
    elm[0].appendChild(iframe);

    var iframeHtml = '<html><head><base target="_parent"><style>table{font-size:12px;}</style></head><body onload="parent.document.getElementById(\'' + iframe.id + '\').style.height=document.body.scrollHeight + \'px\'"><scr' + 'ipt type="text/javascript" src="https://gist.github.com/' + gistId + '.js"></sc'+'ript></body></html>';

    var doc = iframe.document;
    if (iframe.contentDocument) doc = iframe.contentDocument;
    else if (iframe.contentWindow) doc = iframe.contentWindow.document;

    doc.open();
    doc.writeln(iframeHtml);
    doc.close();
  };
})
;