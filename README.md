Development Environment for 'windowsPopup' AngularJS Module
===========================================================

This project is an application skeleton/demo for a typical usage of  [windowsPopup AngularJS Module](https://github.com/ervinn/windowsPopup) .  

This web app. also contains the **Development Environment** of  [windowsPopup AngularJS Module](https://github.com/ervinn/windowsPopup) .

To download the [latest stable Development Environment (deta v0.0.3) click here](https://github.com/ervinn/windowsPopup-dev/tree/v0.0.3)

#### Next Version -> beta 0.0.4 -(Released NOT YET)

-----
#####New in v0.0.4 :
- Two new optional attributes are added to `wnp-popup` directive. Those are `wnp-on-open` and `wnp-on-close`. Now it is possible to add two callback functions, the function specified in `wnp-on-open` will be called when your window is opened, and the function in `wnp-on-close` will be called when your window is closed. Usage : ...  `wnp-on-open="yourOnOpenFnc(wnpName)" ... wnp-on-close="yourOnCloseFnc(wnpName)" `. Note : you need to use `wnpName` so the Window name will be passed in to your callback. The spelling is important for `wnpName` but the function name can be your choise.
- BUG Fix : When the Child window reseted by pressing the F5 key, now the connections between Child and Parent are not lost.
- Now, Parent window checks if the Child window loaded the AngularJS and windowPopup modules, before the `wnpOnOpen(wnpName)' method is called. If those are not loaded after a certain time interval, then an alert error mesage is presented, and the popup window is closed. The time interval will be configurable. 
- Add E2E (end to end) test cases for the Demo program using [Protractor][protractor]. These tests
are run with the [Protractor][protractor] End-to-End test runner.

-----
#####New in v0.0.3 :
- Made data binding bi-directional. Now when parent updates model data that is linked to child model, the child model is updated automatically.
- Rename directives and services names. All names are prefixed with `wnp-*` .
- Pass a Title text (`wnp-title`) to the Child window, or if that is not specified pass the text of the link the user clicked.
- Add 'Build Your Window' section to the Demo app.

------
#####New in v0.0.2 :

- Now a child window can be a parent and open its own child window.
- A new configuration parameter is added. The new configuration parameter is `autoUpdate`. This value can be specified in the default level, and the Pre-defined window level, or can be passed as an attribute `auto-update` in the `wnp-popup` directive. If the `auto-update` value is `true` (that was always true in v0.0.1), parent window will be automatically updated as data is  typed on the Child. If that value is `false`, the parent won't be automatically updated. A new directive was created (`wnp-update-parent`), which must be placed to a buttom or link, which clicked, the parent window is updated at that time.
- Added `angular-route` to the Demo application for the popup windows loading. Now `windowsPopup.html` is used as template, and based on the #/value on the URL, different partial HTMLs can be loaded inside `windowsPopup.html` .
- New Sample popup partial windows were added to the Demo program, to demonstrate the new features.
- Added test cases for the directive popup-link-model.


-----

## Getting Started

To get you started you can simply clone the windowsPopup-dev repository and install the dependencies:

### Prerequisites

You need git to clone the angular-seed repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test angular-seed. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone windowsPopup-dev

Clone the windowsPopup-dev repository using [git][git]:

```
git clone https://github.com/ervinn/windowsPopup-dev
cd windowsPopup-dev
```

### Install Dependencies

We have two kinds of dependencies in this project: tools and angular framework code.  The tools help
us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].

We have preconfigured `npm` to automatically run `bower` so we can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the angular framework files


### Run the Application

We have preconfigured the project with a simple development web server.  The simplest way to start
this server is:

```
npm start
```

Now browse to the app at `http://localhost:8000/app/index.html`.


## Testing

### Running Unit Tests

The angular-seed app comes preconfigured with unit tests. These are written in
[Jasmine][jasmine], which we run with the [Karma Test Runner][karma]. We provide a Karma
configuration file to run them.

* the configuration is found at `karma.conf.js`
* the unit tests are found next to the code they are testing and are named as `..._test.js`.

The easiest way to run the unit tests is to use the supplied npm script:

```
npm test
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will sit and
watch the source and test files for changes and then re-run the tests whenever any of them change.
This is the recommended strategy; if your unit tests are being run every time you save a file then
you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit.  This is useful if you want to
check that a particular version of the code is operating as expected.  The project contains a
predefined script to do this:

```
npm run test-single-run
```

----

[protractor]: https://github.com/angular/protractor
