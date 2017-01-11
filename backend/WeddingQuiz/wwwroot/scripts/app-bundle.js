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

    var App = exports.App = function () {
        function App() {
            _classCallCheck(this, App);

            this.message = 'Hello World!';
        }

        App.prototype.configureRouter = function configureRouter(config, router) {
            this.router = router;
            config.title = 'Aurelia';
            config.map([{ route: ['', 'home'], name: 'home', moduleId: 'home/index' }, { route: ['/game/create'], name: 'game', moduleId: 'game/create' }, { route: ['/game/join'], name: 'game', moduleId: 'game/join' }, { route: ['/question/answer'], name: 'question', moduleId: 'question/answer' }, { route: ['/highscore'], name: 'highscore', moduleId: 'highscore/highscore' }, { route: ['/lobby'], name: 'lobby', moduleId: 'lobby/lobby' }]);
        };

        return App;
    }();
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
    aurelia.use.standardConfiguration().router().feature('resources');

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
define('game/create',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var create = exports.create = function create() {
        _classCallCheck(this, create);

        this.message = 'Hello World!';

        this.questions = ['Wer geht am Sonntag zum Bäcker?', 'Wer wäscht ab?', 'Wer räumt auf?', 'Wer macht die Betten?', 'Wer telefoniert häufiger mit Mutti?', 'Wer treibt mehr Sport?', 'Wer hat den besser durchtrainierten Körper?', 'wer benötigt am Bad immer am längsten?', 'Wer ist pünktlicher?', 'Wer kommt immer zu spät?', 'Wer ist lauter beim Sex?', 'Wer hat mehr Lust auf Sex?', 'Wer kann besser verlieren?', 'Wer kann besser gewinnen?', 'Wer schläft länger?'];
    };
});
define('game/join',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var join = exports.join = function join() {
        _classCallCheck(this, join);

        this.message = 'Hello World!';
    };
});
define('highscore/highscore',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var join = exports.join = function join() {
        _classCallCheck(this, join);

        this.message = 'Hello World!';
    };
});
define('home/index',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var index = exports.index = function () {
        function index() {
            _classCallCheck(this, index);

            this.message = 'Hello World blub!';
        }

        index.prototype.createGame = function createGame() {
            alert("create");
        };

        return index;
    }();
});
define('question/answer',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var join = exports.join = function join() {
        _classCallCheck(this, join);

        this.message = 'Hello World!';
    };
});
define('lobby/lobby',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var join = exports.join = function join() {
        _classCallCheck(this, join);

        this.message = 'Hello World!';
    };
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\r\n    <require from=\"bootstrap/css/bootstrap.css\"></require>\r\n    <div class=\"container\">\r\n        <div class=\"row\">\r\n            <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n                <h1>Wedding Quiz</h1>\r\n                <hr />\r\n            </div>\r\n        </div>\r\n        <router-view></router-view>\r\n    </div>\r\n\r\n</template>"; });
define('text!highscore/highscore.html', ['module'], function(module) { module.exports = "<template>\r\n    <h2>Aktuelle Frage</h2>\r\n\r\n    <div class=\"row\">\r\n        <div class=\"text-center\">\r\n            Wer geht am Sonntag gern zum Bäcker?\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 \">\r\n            <button type=\"button\" class=\"btn btn-default btn-block\">Die Braut</button>\r\n        </div>\r\n        <div class=\"col-xs-1 \">\r\n            3\r\n        </div>\r\n        <div class=\"col-xs-5\">\r\n            <div class=\"progress\">\r\n                <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"30\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 30%;\">\r\n                    30%\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 \">\r\n            <button type=\"button\" class=\"btn btn-default btn-block\">Der Bräutigam</button>\r\n        </div>\r\n        <div class=\"col-xs-1 \">\r\n            5\r\n        </div>\r\n        <div class=\"col-xs-5\">\r\n            <div class=\"progress\">\r\n                <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"50\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 50%;\">\r\n                    50%\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 \">\r\n            <button type=\"button\" class=\"btn btn-default btn-block\">Beide</button>\r\n        </div>\r\n        <div class=\"col-xs-1 \">\r\n            2\r\n        </div>\r\n        <div class=\"col-xs-5\">\r\n            <div class=\"progress\">\r\n                <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 20%;\">\r\n                    20%\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <table class=\"table\">\r\n        <thead>\r\n            <tr>\r\n                <th>Platzierung</th>\r\n                <th>Name</th>\r\n                <th>Punkte</th>\r\n            </tr>\r\n        </thead>\r\n        <tbody>\r\n            <tr>\r\n                <td>1.</td>\r\n                <td>Arno</td>\r\n                <td>14</td>\r\n            </tr>\r\n            <tr>\r\n                <td>2.</td>\r\n                <td>Kai</td>\r\n                <td>10</td>\r\n            </tr>\r\n            <tr>\r\n                <td>3.</td>\r\n                <td>Carla + 3</td>\r\n                <td>8</td>\r\n            </tr>\r\n        </tbody>\r\n    </table>\r\n</template>"; });
define('text!home/index.html', ['module'], function(module) { module.exports = "<template>\r\n\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <p>Einem bestehenden Spiel beitreten. Den Spielcode erfährst du von deinem Spielleiter.</p>\r\n            <p><a class=\"btn btn-primary btn-lg\" href=\"#/game/join\" role=\"button\">Spiel beitreten</a></p>\r\n            <hr />\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <p>Jetzt ein neues Spiel erstellen und alle mitraten lassen. Spiele werden 14 Tage lang gespeichert.</p>\r\n            <p><a class=\"btn btn-primary btn-lg\" click.trigger = \"createGame()\"role=\"button\">Spiel erstellen</a></p>\r\n            <hr />\r\n        </div>\r\n    </div>\r\n\r\n</template>"; });
define('text!game/create.html', ['module'], function(module) { module.exports = "<template>\r\n    <h2>Fragen</h2>\r\n    <ul>\r\n        <li repeat.for=\"question of questions\">${question}! </li>\r\n    </ul>\r\n    <button type=\"button\" class=\"btn btn-primary\">Frage hinzufügen</button>\r\n    <hr />\r\n    <h2>Spieler hinzufügen</h2>\r\n    <p>Kai, Arno, Freddy und 12 weitere</p>\r\n    \r\n    <a href=\"#/question/answer\" class=\"btn btn-primary  btn-lg\">Spiel starten</button>\r\n    \r\n</template>"; });
define('text!game/join.html', ['module'], function(module) { module.exports = "<template>\r\n    <row>\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <h2>Spiel beitreten</h2>\r\n        </div>\r\n    </row>\r\n    <row>\r\n        <div class=\"col-xs-4 col-sm-4 col-md-4 col-lg-4\">\r\n            <form>\r\n                <div class=\"form-group\">\r\n                    <label for=\"exampleInputName2\">Dein Name: </label>\r\n                    <input type=\"text\" class=\"form-control\" id=\"exampleInputName2\" placeholder=\"Name\">\r\n                </div>\r\n                <div class=\"form-group\">\r\n                    <label for=\"exampleInputName2\">Spiel Code: </label>\r\n                    <input type=\"text\" class=\"form-control\" id=\"exampleInputName2\" placeholder=\"#af34w2s\">\r\n                </div>\r\n                <button type=\"submit\" class=\"btn btn-default\">Los!</button>\r\n            </form>\r\n        </div>\r\n    </row>\r\n</template>"; });
define('text!lobby/lobby.html', ['module'], function(module) { module.exports = "<template>\r\n    <div class=\"jumbotron\">\r\n        <h1>Ela & Patrick</h1>\r\n        <p>Gäste: Aggi, Eberhardt, Kai, Gerlinde Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unkno</p>\r\n        \r\n        <a class=\"btn btn-lg btn-default\" href=\"#\" role=\"button\">Warten auf Moderator...</a>\r\n        \r\n    </div>\r\n</template>"; });
define('text!question/answer.html', ['module'], function(module) { module.exports = "<template>\r\n    <div class=\"row breadcrumb\">\r\n        <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\">\r\n            Moderator\r\n        </div>\r\n        <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\">\r\n            Frage 5 von 7\r\n        </div>\r\n    </div>\r\n    <div class=\"row\">\r\n        <div class=\"text-center\">\r\n            Wer geht am Sonntag gern zum Bäcker?\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 col-xs-offset-3\">\r\n            <button type=\"button\" class=\"btn btn-default btn-block\">Die Braut</button>\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 col-xs-offset-3\">\r\n            <button type=\"button\" class=\"btn btn-default btn-block\">Der Bräutigam</button>\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 col-xs-offset-3\">\r\n            <button type=\"button\" class=\"btn btn-default btn-block\">Beide</button>\r\n        </div>\r\n    </div>\r\n    <hr />\r\n    <button type=\"button\" class=\"btn btn-primary\">Nächste Frage</button>\r\n</template>"; });
//# sourceMappingURL=app-bundle.js.map