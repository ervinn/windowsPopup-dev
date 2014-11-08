Development Environment for 'windowsPopup' AngularJS Module
===========================================================

This project is an application skeleton/demo for a typical usage of  [windowsPopup AngularJS Module](https://github.com/ervinn/windowsPopup) .  

This web app. also contains the **Development Environment** of  [windowsPopup AngularJS Module](https://github.com/ervinn/windowsPopup) .

To download the [latest stable Development Environment (deta v0.0.1) click here](https://github.com/ervinn/windowsPopup-dev/releases/tag/v0.0.1)

#### This repository contains the latest changes. The latest stable Version is : [beta v0.0.1](https://github.com/ervinn/windowsPopup-dev/releases/tag/v0.0.1) 

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
