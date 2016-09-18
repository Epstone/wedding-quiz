define('app',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function App() {
    _classCallCheck(this, App);

    this.message = 'Hello World!';
  };
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"bootstrap/css/bootstrap.css\"></require>\n\n    <div class=\"container\">\n        <div class=\"row\">\n\n            <div class=\"col-md-12\">\n                <h1>Wedding Quiz</h1>\n            </div>\n            <hr />\n        </div>\n\n\n        <div class=\"row\">\n            <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\n                <p>Einem bestehenden Spiel beitreten. Den Spielcode erfährst du von deinem Spielleiter.</p>\n                <p><a class=\"btn btn-primary btn-lg\" href=\"#\" role=\"button\">Spiel beitreten</a></p>\n                <hr />\n            </div>\n        </div>\n\n        <div class=\"row\">\n            <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\n                <p>Jetzt ein neues Spiel erstellen und alle mitraten lassen. Spiele werden 14 Tage lang gespeichert.</p>\n                <p><a class=\"btn btn-primary btn-lg\" href=\"#\" role=\"button\">Spiel erstellen</a></p>\n                <hr />\n            </div>\n        </div>\n\n    </div>\n\n</template>"; });
//# sourceMappingURL=app-bundle.js.map