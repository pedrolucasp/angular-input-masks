'use strict';

var StringMask = require('string-mask');

module.exports = function TimeMaskDirective() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      var timeFormat = '00:00:00';

      if (angular.isDefined(attrs.uiTimeMask) && attrs.uiTimeMask === 'short') {
        timeFormat = '00:00';
      }

      var formattedValueLength = timeFormat.length;
      var unformattedValueLength = timeFormat.replace(':', '').length;
      var timeMask = new StringMask(timeFormat);

      function correctInvalidTimeValue(originalStringValue) {
        var separatedTimeValues, concatenedTimeValues, hours, minutes, seconds;
        if (originalStringValue === '') {
          return originalStringValue;
        }

        separatedTimeValues = originalStringValue.match(/.{1,2}/g);

        hours = parseInt(separatedTimeValues[0]);
        minutes = parseInt(separatedTimeValues[1]);
        seconds = parseInt(separatedTimeValues[2] || 0);

        if (hours > 23) {
          hours = 23;
        }

        if (minutes > 59) {
          minutes = 59;
        }

        if (seconds > 59) {
          seconds = 59;
        }

        concatenedTimeValues = '' + hours + minutes;

        if (seconds > 0) {
          concatenedTimeValues += seconds;
        }

        return concatenedTimeValues;
      }

      function formatter(value) {
        var cleanValue, correctedValue;

        if (ctrl.$isEmpty(value)) {
          return value;
        }

        cleanValue = value.replace(/[^0-9]/g, '').slice(0, unformattedValueLength) || '';
        correctedValue = correctInvalidTimeValue(cleanValue);

        return (timeMask.apply(correctedValue) || '').replace(/[^0-9]$/, '');
      }

      ctrl.$formatters.push(formatter);

      ctrl.$parsers.push(function parser(value) {
        if (ctrl.$isEmpty(value)) {
          return value;
        }

        var viewValue = formatter(value);
        var modelValue = viewValue;

        if (ctrl.$viewValue !== viewValue) {
          ctrl.$setViewValue(viewValue);
          ctrl.$render();
        }

        return modelValue;
      });

      ctrl.$validators.time = function(modelValue) {
        if (ctrl.$isEmpty(modelValue)) {
          return true;
        }

        var splittedValue = modelValue.toString().split(/:/).filter(function(v) {
          return !!v;
        });

        var hours = parseInt(splittedValue[0]),
          minutes = parseInt(splittedValue[1]),
          seconds = parseInt(splittedValue[2] || 0);

        return modelValue.toString().length === formattedValueLength &&
        hours < 24 && minutes < 60 && seconds < 60;
      };
    }
  };
};
