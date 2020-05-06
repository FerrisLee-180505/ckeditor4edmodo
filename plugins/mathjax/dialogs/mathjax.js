/**
 * Created by chenzuopeng on 15-5-27.
 */
var enLang = {
  '公式不完整': 'Incomplete Formula',
  '公式编辑器': 'Formula Editor',
  '图片选择': 'Picture Select'
}
var zhLang = {
  '公式不完整': '公式不完整',
  '公式编辑器': '公式编辑器',
  '图片选择': '图片选择'
}
var localeObj = {
  'zh-cn': zhLang,
  'en': enLang,
  'en-US': enLang
}

var locale = ''

CKEDITOR.dialog.add('mathjax', function (editor) {
  var width = 952;

  var height = 800;

  function getIFrame () {
    return this.getElement().getFirst().$;
  };

  // var localeArray = ['zh-cn', 'en']
  var localeArray = ['zh-cn']
  function localeMach (locale) {
    if (localeArray.indexOf(locale) !== -1) {
      return locale
    } else {
      return localeArray[0]
    }
  }

  function getIFrameSrc () {
    locale = localStorage.lang
    if (!locale || locale.toLowerCase() === 'zh-cn') {
      return CKEDITOR.basePath + 'plugins/kityformula/dialogs/kityformula-mathjax.html?f=' + (new Date()).valueOf();
    } else {
      var array = [
        'f=' + (new Date()).valueOf(),
        'locale=' + locale.toLowerCase()
      ]
      return CKEDITOR.basePath + 'plugins/kityformula/dialogs/kityformula-mathjax.html?' + array.join('&')
    }
  }

  function existPlaceholder (latex) {
    return latex.trim().indexOf('\\placeholder') > -1;
  }
  console.error('localStorage.lang=', localStorage.lang)
  return {
    title: localeObj[navigator.language]['公式编辑器'],
    minWidth: width,
    minHeight: height,
    resizable: CKEDITOR.DIALOG_RESIZE_NONE,
    contents: [{
      id: 'editor-tab',
      elements: [{
        id: 'editor-element',
        type: 'html',
        // html: '<div style="width:'+width+'px;height:'+height+'px;"><iframe style="width:'+width+'px;height:'+height+'px;" frameborder="no" scrolling="no" src="' + CKEDITOR.basePath + 'plugins/kityformula/dialogs/kityformula-mathjax.html"></iframe></div>',
        html: '<div><iframe style="width:' + width + 'px;height:' + height + 'px;" frameborder="no" scrolling="no" src="' + getIFrameSrc() + '"></iframe></div>',
        setup: function (widget) {
          var iframeWindow = getIFrame.call(this).contentWindow;
          // iframeWindow.parent.currentLatex = CKEDITOR.plugins.mathjax.trim(widget.data.math);

          console.log('current latex:' + CKEDITOR.plugins.mathjax.trim(widget.data.math));
          setTimeout(() => {
            iframeWindow.postMessage(JSON.stringify({
              type: 'init-data',
              text: CKEDITOR.plugins.mathjax.trim(widget.data.math)
            }), '*');
          }, 200);
          // 修复bug #5814,#5481 在某些情况下,在chrome中会出现公式编辑器页面显示空白(iframe的src会变成about:blank)
          iframeWindow.location.replace(getIFrameSrc());
        },
        commit: function (widget) {
          const callback = function (event) {
            console.error('kityformula.html=>', event);
            const { type, text } = JSON.parse(event.data)
            if (type === 'return-current-latex') {
              var latex = text
              if (existPlaceholder(text)) {
                alert(localeObj[localeMach(localStorage.lang)]['公式不完整']);
              } else {
                widget.setData('math', '\\(' + latex + '\\)');
                window.removeEventListener('message', callback)
              }
            }
          }
          window.addEventListener('message', callback, false);
          getIFrame.call(this).contentWindow.postMessage(JSON.stringify({ type: 'get-current-latex' }), '*')
        }
      }]
    }],
    onOk: function () {
      return true;
    }
  };
});
