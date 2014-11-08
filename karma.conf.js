module.exports = function(config){
 'use strict';
  config.set({

    basePath : './',

    files : [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      
      'app/components/**/*.js',
      'app/*.js',
      'tests/specs/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],
    
    // - Chrome
    // - PhantomJS
    browsers : ['PhantomJS'],

    plugins : [
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
