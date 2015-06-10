angular.module('localization', []).factory('localize', [
  '$http', '$rootScope', '$window', '$filter', function($http, $rootScope, $window, $filter) {
    var localize;
    localize = {
      language: '',
      dictionary: [],
      url: void 0,
      resourceFileLoaded: false,
      successCallback: function(data) {
        localize.dictionary = data;
        localize.resourceFileLoaded = true;
        $rootScope.$broadcast('localizeResourcesUpdated');
      },
      setLanguage: function(value) {
        localize.language = value;
        localize.initLocalizedResources();
      },
      setUrl: function(value) {
        localize.url = value;
        localize.initLocalizedResources();
      },
      buildUrl: function() {
        var androidLang, lang;
        if (!localize.language) {
          lang = void 0;
          androidLang = void 0;
          if ($window.navigator && $window.navigator.userAgent && (androidLang = $window.navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
            lang = androidLang[1];
          } else {
            lang = $window.navigator.userLanguage || $window.navigator.language;
          }
          localize.language = lang;
        }
        return 'i18n/resources-locale_' + localize.language + '.json';
      },
      initLocalizedResources: function() {
        var url;
        url = localize.url || localize.buildUrl();
        $http({
          method: 'GET',
          url: url,
          cache: false
        }).success(localize.successCallback).error(function() {
          var url;
          url = '/i18n/resources-locale_default.json';
          $http({
            method: 'GET',
            url: url,
            cache: false
          }).success(localize.successCallback);
        });
      },
      getLocalizedString: function(value) {
        var entry, result;
        result = '';
        if (localize.dictionary !== [] && localize.dictionary.length > 0) {
          entry = $filter('filter')(localize.dictionary, function(element) {
            return element.key === value;
          })[0];
          result = entry.value;
        }
        return result;
      }
    };
    localize.initLocalizedResources();
    return localize;
  }
]).filter('i18n', [
  'localize', function(localize) {
    return function(input) {
      return localize.getLocalizedString(input);
    };
  }
]).directive('i18n', [
  'localize', function(localize) {
    var i18nDirective;
    i18nDirective = {
      restrict: 'EAC',
      updateText: function(elm, token) {
        var index, tag, target, values;
        values = token.split('|');
        if (values.length >= 1) {
          tag = localize.getLocalizedString(values[0]);
          if (tag !== null && tag !== void 0 && tag !== '') {
            if (values.length > 1) {
              index = 1;
              while (index < values.length) {
                target = '{' + index - 1 + '}';
                tag = tag.replace(target, values[index]);
                index++;
              }
            }
            elm.text(tag);
          }
        }
      },
      link: function(scope, elm, attrs) {
        scope.$on('localizeResourcesUpdated', function() {
          i18nDirective.updateText(elm, attrs.i18n);
        });
        attrs.$observe('i18n', function(value) {
          i18nDirective.updateText(elm, attrs.i18n);
        });
      }
    };
    return i18nDirective;
  }
]).directive('i18nAttr', [
  'localize', function(localize) {
    var i18NAttrDirective;
    i18NAttrDirective = {
      restrict: 'EAC',
      updateText: function(elm, token) {
        var index, tag, target, values;
        values = token.split('|');
        tag = localize.getLocalizedString(values[0]);
        if (tag !== null && tag !== void 0 && tag !== '') {
          if (values.length > 2) {
            index = 2;
            while (index < values.length) {
              target = '{' + index - 2 + '}';
              tag = tag.replace(target, values[index]);
              index++;
            }
          }
          elm.attr(values[1], tag);
        }
      },
      link: function(scope, elm, attrs) {
        scope.$on('localizeResourcesUpdated', function() {
          i18NAttrDirective.updateText(elm, attrs.i18nAttr);
        });
        attrs.$observe('i18nAttr', function(value) {
          i18NAttrDirective.updateText(elm, value);
        });
      }
    };
    return i18NAttrDirective;
  }
]);
