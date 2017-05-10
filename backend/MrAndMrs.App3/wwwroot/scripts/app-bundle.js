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
            config.title = 'Mr & Mrs';
            config.map([{ route: ['', 'home'], name: 'home', moduleId: 'home/index' }, { route: ['/game/create'], name: 'gameCreation', moduleId: 'game/create' }, { route: ['/game/join'], name: 'game', moduleId: 'game/join' }, { route: ['/question/question'], name: 'question', moduleId: 'question/question' }, { route: ['/highscore'], name: 'highscore', moduleId: 'highscore/highscore' }, { route: ['/lobby'], name: 'lobby', moduleId: 'lobby/lobby' }]);
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
define('game/create',['exports', 'services/signalr-service', 'aurelia-framework', 'aurelia-event-aggregator', 'aurelia-router'], function (exports, _signalrService, _aureliaFramework, _aureliaEventAggregator, _aureliaRouter) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.create = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var create = exports.create = (_dec = (0, _aureliaFramework.inject)(_signalrService.SignalrService, _aureliaEventAggregator.EventAggregator, _aureliaRouter.Router), _dec(_class = function () {
        function create(signalrService, eventAggregator, router) {
            _classCallCheck(this, create);

            this.questions = [];

            this.message = 'Hello World!';
            this.playerlist = ["Noch keine Spieler"];
            this.signalrService = signalrService;
            this.eventAggregator = eventAggregator;
            this.router = router;
            this.questionsModel = [];
        }

        create.prototype.activate = function activate(game, routeData) {
            var _this = this;

            var self = this;
            console.log("passed game from other view", game, routeData);
            this.questions = game.questions;
            this.game = game;
            for (var i = 0; i < this.questions.length; i++) {
                this.questionsModel.push({
                    text: this.questions[i],
                    editActive: false,
                    editAction: this.changeEditState
                });
            }

            console.log("questions model is", this.questionsModel);

            window.localStorage.setItem("username", "moderator");
            window.localStorage.setItem("currentGame", game.gameId);
            window.localStorage.setItem("isModerator", true);

            this.signalrService.verifyConnected(game.gameId).then(function () {
                _this.eventAggregator.subscribe('playerListUpdated', function (updatedPlayerList) {
                    console.log("we should update playerlist now for moderator view.");
                    console.log(updatedPlayerList);
                    self.playerlist = updatedPlayerList;
                });

                self.gameId = game.gameId;
            });
        };

        create.prototype.changeEditState = function changeEditState(par) {
            this.editActive = !this.editActive;
        };

        create.prototype.startGame = function startGame() {
            var self = this;
            this.signalrService.startGame(self.game.gameId).then(function () {
                console.log("change view now");
                self.router.navigateToRoute("question", {
                    isModerator: true,
                    gameId: self.game.gameId
                });
            });
        };

        return create;
    }()) || _class);
});
define('game/join',["exports", "aurelia-http-client", "aurelia-router"], function (exports, _aureliaHttpClient, _aureliaRouter) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.join = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var join = exports.join = function () {
        join.inject = function inject() {
            return [_aureliaRouter.Router];
        };

        function join(router) {
            _classCallCheck(this, join);

            this.name = "";
            this.gameId = "";
            this.theRouter = router;
        }

        join.prototype.guid = function guid() {
            return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + this.s4() + this.s4();
        };

        join.prototype.s4 = function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };

        join.prototype.joinGame = function joinGame() {
            var _this = this;

            var client = new _aureliaHttpClient.HttpClient();

            var accountKey = window.localStorage.getItem("accountKey");
            if (!accountKey) {
                accountKey = this.guid();
                window.localStorage.setItem("accountKey", accountKey);
            }

            var postParams = {
                username: this.name,
                gameId: this.gameId,
                accountKey: accountKey
            };

            console.log("try to join game", postParams);

            client.createRequest("/game/join").asPost().withHeader('Content-Type', 'application/json; charset=utf-8').withContent(postParams).send().then(function (data) {
                var result = JSON.parse(data.response);
                console.log("result", result);

                if (result.result === "allow_connection") {
                    if (typeof Storage !== "undefined") {
                        window.localStorage.setItem("username", postParams.username);
                        window.localStorage.setItem("currentGame", result.game.gameId);
                        window.localStorage.setItem("isModerator", false);
                    } else {
                        alert("Sorry, no support for your browser.");
                        return;
                    }

                    if (result.game.state === 0) {
                        _this.theRouter.navigateToRoute("lobby", {
                            gameId: result.game.gameId,
                            username: postParams.username
                        });
                    }

                    if (result.game.state === 1) {
                        _this.theRouter.navigateToRoute("question", {
                            gameId: result.game.gameId
                        });
                    }

                    if (result.game.state === 2) {
                        _this.theRouter.navigateToRoute("highscore", {
                            gameId: result.game.gameId
                        });
                    }
                } else {
                    alert(result.result);
                }
            });
        };

        join.prototype.showHighscore = function showHighscore() {
            this.theRouter.navigateToRoute("highscore", {
                gameId: this.gameId
            });
        };

        return join;
    }();
});
define('highscore/highscore-table',['exports', 'aurelia-framework'], function (exports, _aureliaFramework) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.HighscoreTableCustomElement = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _desc, _value, _class, _descriptor;

  var HighscoreTableCustomElement = exports.HighscoreTableCustomElement = (_class = function HighscoreTableCustomElement() {
    _classCallCheck(this, HighscoreTableCustomElement);

    _initDefineProp(this, 'model', _descriptor, this);
  }, (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'model', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  })), _class);
});
define('highscore/highscore',['exports', 'aurelia-http-client', 'aurelia-event-aggregator', 'services/signalr-service', 'aurelia-framework', 'aurelia-router'], function (exports, _aureliaHttpClient, _aureliaEventAggregator, _signalrService, _aureliaFramework, _aureliaRouter) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.highscore = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    var _dec, _class, _desc, _value, _class2;

    var highscore = exports.highscore = (_dec = (0, _aureliaFramework.inject)(_signalrService.SignalrService, _aureliaEventAggregator.EventAggregator, _aureliaRouter.Router), _dec(_class = (_class2 = function () {
        function highscore(signalrService, eventAggregator, router) {
            _classCallCheck(this, highscore);

            this.message = 'Hello World!';
            this.isFinished = false;
            this.eventAggregator = eventAggregator;
            this.signalrService = signalrService;
            this.currentQuestion = "test";
            this.highscoreTableModel = {
                Entries: [{
                    names: "?",
                    score: "?"
                }]
            };

            this.answerStatistics = {
                mrs: 0,
                mr: 0,
                both: 0
            };
        }

        highscore.prototype.activate = function activate(params) {
            var self = this;

            this.eventAggregator.subscribe("highscoreUpdated", function (highscore) {
                console.log("highscore should be updated.", highscore);
                self.highscoreTableModel = highscore;
            });

            this.eventAggregator.subscribe("gameUpdated", function (game) {
                console.log("game updated.", game);
                self.game = game;
                self.currentQuestion = game.questions[game.currentQuestionIndex];
            });

            this.eventAggregator.subscribe("answerSelected", function (statistics) {
                console.log("Answer statistic updated.", statistics);
                self.answerStatistics = statistics;
            });

            this.eventAggregator.subscribe("playerListUpdated", function (playerList) {
                self.totalPlayers = playerList.length;
            });

            this.game = {
                questions: []
            };

            this.signalrService.verifyConnected(params.gameId).then(function (game) {
                self.game = game;
                console.log("received game on connected state", game);
                self.signalrService.getHighscore();
                return game;
            });
        };

        highscore.prototype.calculatePercentage = function calculatePercentage(count, total) {
            return Math.floor(count / total * 100);
        };

        _createClass(highscore, [{
            key: 'statsMrs',
            get: function get() {
                return this.calculatePercentage(this.answerStatistics.mrs, this.totalPlayers);
            }
        }, {
            key: 'statsMr',
            get: function get() {
                return this.calculatePercentage(this.answerStatistics.mr, this.totalPlayers);
            }
        }, {
            key: 'statsBoth',
            get: function get() {
                return this.calculatePercentage(this.answerStatistics.both, this.totalPlayers);
            }
        }]);

        return highscore;
    }(), (_applyDecoratedDescriptor(_class2.prototype, 'statsMrs', [_aureliaFramework.computedFrom], Object.getOwnPropertyDescriptor(_class2.prototype, 'statsMrs'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'statsMr', [_aureliaFramework.computedFrom], Object.getOwnPropertyDescriptor(_class2.prototype, 'statsMr'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'statsBoth', [_aureliaFramework.computedFrom], Object.getOwnPropertyDescriptor(_class2.prototype, 'statsBoth'), _class2.prototype)), _class2)) || _class);
});
define('home/index',["exports", "aurelia-http-client", "aurelia-router"], function (exports, _aureliaHttpClient, _aureliaRouter) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.index = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var client = new _aureliaHttpClient.HttpClient();

    var index = exports.index = function () {
        index.inject = function inject() {
            return [_aureliaRouter.Router];
        };

        function index(router) {
            _classCallCheck(this, index);

            this.theRouter = router;
        }

        index.prototype.activate = function activate() {
            $("#publishPostButton").click(function () {

                var post = {
                    userName: $("#userNameInput").val() || "Guest",
                    text: $("#textInput").val()
                };
                $.ajax({
                    url: "/api/Posts/AddPost",
                    method: "POST",
                    data: post
                });
            });
        };

        index.prototype.createGame = function createGame() {
            var _this = this;

            console.log("create game start");

            client.post("/game/create").then(function (data) {
                var game = JSON.parse(data.response);
                console.log("created game on server", game);
                _this.theRouter.navigateToRoute("gameCreation", game);
            });
        };

        return index;
    }();
});
define('lobby/lobby',['exports', 'services/signalr-service', 'aurelia-framework', 'aurelia-event-aggregator', 'aurelia-router'], function (exports, _signalrService, _aureliaFramework, _aureliaEventAggregator, _aureliaRouter) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.join = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var join = exports.join = (_dec = (0, _aureliaFramework.inject)(_signalrService.SignalrService, _aureliaEventAggregator.EventAggregator, _aureliaRouter.Router), _dec(_class = function () {
        function join(signalrService, eventAggregator, router) {
            _classCallCheck(this, join);

            console.log("lobby.js: received signalr service in constructor");
            this.message = 'Hello World!';
            this.playerlist = ["Noch keine Spieler"];
            this.signalrService = signalrService;
            this.eventAggregator = eventAggregator;
            this.router = router;
        }

        join.prototype.activate = function activate(params) {
            var _this = this;

            var self = this;
            console.log("welcome to the lobby");

            this.signalrService.verifyConnected(params.gameId).then(function () {
                _this.eventAggregator.subscribe('playerListUpdated', function (updatedPlayerList) {
                    console.log("we should update playerlist now. yes works");
                    console.log(updatedPlayerList);
                    self.playerlist = updatedPlayerList;
                });

                _this.eventAggregator.subscribe("gameStarted", function (game) {
                    self.router.navigateToRoute("question", {
                        isModerator: false,
                        game: game
                    });
                });
            });
        };

        return join;
    }()) || _class);
});
define('question/question',['exports', 'aurelia-framework', 'services/signalr-service', 'aurelia-event-aggregator', 'aurelia-router'], function (exports, _aureliaFramework, _signalrService, _aureliaEventAggregator, _aureliaRouter) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.question = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var question = exports.question = (_dec = (0, _aureliaFramework.inject)(_signalrService.SignalrService, _aureliaEventAggregator.EventAggregator, _aureliaRouter.Router), _dec(_class = function () {
        function question(signalrService, eventAggregator, router) {
            _classCallCheck(this, question);

            this.message = 'Hello World!';
            this.isModerator = false;
            this.signalrService = signalrService;
            this.eventAggregator = eventAggregator;
            this.router = router;
            this.isLastQuestion = false;
            this.selectedAnswer = -1;
        }

        question.prototype.activate = function activate(params) {
            var _this = this;

            var self = this;
            self.gameId = params.gameId;

            this.signalrService.verifyConnected(params.gameId).then(function (game) {
                self.game = game;
                _this.eventAggregator.subscribe("questionChangeRequested", function (updatedQuestionIndex) {
                    console.log("view should change question now.");
                    self.questionIndex = updatedQuestionIndex;
                    self.currentQuestion = game.questions[self.questionIndex];
                    self.isLastQuestion = self.questionIndex + 1 === game.questions.length;
                    self.selectedAnswer = -1;
                });

                _this.eventAggregator.subscribe("answerSelected", function (info) {
                    console.log("some user selected answer", info);
                });

                _this.eventAggregator.subscribe("gameEnded", function () {
                    console.log("moderator as finished game.");
                    self.router.navigateToRoute("highscore", {
                        gameId: self.gameId
                    });
                });

                console.log("question view activated with params", params);
                _this.isModerator = params.isModerator === "true";
                _this.questionIndex = game.currentQuestionIndex;
                _this.currentQuestion = game.questions[_this.questionIndex];
                _this.isLastQuestion = self.questionIndex + 1 === game.questions.length;
            });
        };

        question.prototype.nextQuestion = function nextQuestion() {
            var self = this;
            this.signalrService.verifyConnected().then(function () {
                return self.signalrService.nextQuestion();
            });
        };

        question.prototype.endGame = function endGame() {
            var self = this;
            self.signalrService.verifyConnected().then(function () {
                return self.signalrService.endGame();
            });
        };

        question.prototype.selectAnswer = function selectAnswer(answer) {
            var index = this.questionIndex;
            this.selectedAnswer = answer;
            this.signalrService.selectAnswer(answer, index).then(function () {
                console.log("user info: selected answer" + answer + "for questionIndex: " + index);
            });
        };

        return question;
    }()) || _class);
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('services/game-hub-singleton',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var GameHubSingleton = exports.GameHubSingleton = function () {
        function GameHubSingleton() {
            _classCallCheck(this, GameHubSingleton);

            this.hub = false;
        }

        GameHubSingleton.prototype.createGameHub = function createGameHub(username, gameId) {
            if (this.hub) {
                return hub;
            }

            var hub = $.connection.hub.createHubProxy("postsHub");
            $.connection.hub.qs = 'username=' + username + '&gameId=' + gameId;
            $.connection.hub.logging = true;

            this.hub = hub;
            return hub;
        };

        _createClass(GameHubSingleton, [{
            key: 'instance',
            get: function get() {
                return this.hub;
            }
        }]);

        return GameHubSingleton;
    }();
});
define('services/signalr-service',['exports', 'aurelia-framework', 'aurelia-event-aggregator', 'services/game-hub-singleton'], function (exports, _aureliaFramework, _aureliaEventAggregator, _gameHubSingleton) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SignalrService = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var SignalrService = exports.SignalrService = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator, _gameHubSingleton.GameHubSingleton), _dec(_class = function () {
    function SignalrService(eventAggregator, gameHub) {
      _classCallCheck(this, SignalrService);

      console.log("signalr service constructor created");
      this.eventAggregator = eventAggregator;
      this.gameHub = gameHub;
    }

    SignalrService.prototype.activate = function activate(params) {
      console.log("signalr service activated");
    };

    SignalrService.prototype.getGameId = function getGameId() {
      var gameId = window.localStorage.getItem("currentGame");
      if (!gameId) {
        throw "No gameId currently attached to.";
      }

      return gameId;
    };

    SignalrService.prototype.verifyConnected = function verifyConnected(gameId) {
      var username = window.localStorage.getItem("username");

      if (!gameId) {
        gameId = this.getGameId();
      }

      var self = this;

      var promise = new Promise(function (resolve, reject) {
        if (!!self.gameHub.instance) {
          resolve(self.game);
          return;
        }
        var gameHub = self.gameHub.createGameHub(username, gameId);

        gameHub.on('playerListUpdated', function (updatedPlayerlist) {
          console.log("Received playerlist");
          console.log(updatedPlayerlist);
          self.eventAggregator.publish('playerListUpdated', updatedPlayerlist);
        });

        gameHub.on("gameStarted", function (game) {
          console.log("server signalled game was started by moderator");
          self.eventAggregator.publish('gameStarted', game);
        });

        gameHub.on("questionChangeRequested", function (response) {
          console.log("server signalled question change", response);
          self.eventAggregator.publish('questionChangeRequested', response);
        });

        gameHub.on("answerSelected", function (response) {
          console.log("user selected answer", response);
          self.eventAggregator.publish('answerSelected', response);
        });

        gameHub.on("gameEnded", function (response) {
          console.log("moderator has finished the game", response);
          self.eventAggregator.publish('gameEnded', response);
        });

        gameHub.on("gameUpdated", function (game) {
          self.game = game;
          resolve(game);
          console.log("server sent updated game.", game);
          self.eventAggregator.publish('gameUpdated', game);
        });

        gameHub.on("highscoreUpdated", function (highscore) {
          console.log("server sent highscore update.", highscore);
          self.eventAggregator.publish('highscoreUpdated', highscore);
        });

        $.connection.hub.start().done(function () {
          console.log("hub is started now.");
          gameHub.invoke('updatePlayerList');
        });
      });

      return promise;
    };

    SignalrService.prototype.startGame = function startGame(gameId) {
      var self = this;
      return new Promise(function (resolve, reject) {
        console.log("triggered game start");
        self.gameHub.instance.server.startGame(gameId).done(function () {
          console.log("game started successfully");
          resolve();
        });
      });
    };

    SignalrService.prototype.nextQuestion = function nextQuestion() {
      var self = this;
      console.log("moderator switches to next question");
      return new Promise(function (resolve, reject) {
        self.gameHub.instance.server.showNextQuestion(self.game.gameId).done(function () {
          console.log("next question request sent.");
          resolve();
        });
      });
    };

    SignalrService.prototype.selectAnswer = function selectAnswer(answer, questionIndex) {
      var self = this;
      return new Promise(function (resolve, reject) {
        self.gameHub.instance.server.selectAnswer(answer, questionIndex).done(function () {
          console.log("selected answer sent to server", answer, questionIndex);
          resolve();
        });
      });
    };

    SignalrService.prototype.endGame = function endGame() {
      var self = this;
      return new Promise(function (resolve, reject) {
        self.gameHub.instance.server.endGame(self.game.gameId).done(function () {
          console.log("request end game on server.");
          resolve();
        });
      });
    };

    SignalrService.prototype.getHighscore = function getHighscore() {
      var self = this;
      self.gameHub.instance.server.getHighscore(self.game.gameId).done(function () {
        console.log("request get highscore was received on server.");
      });
    };

    return SignalrService;
  }()) || _class);
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\r\n    <require from=\"bootstrap/css/bootstrap.css\"></require>\r\n    <div class=\"container\">\r\n        <div class=\"row\">\r\n            <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n                <h1>Mr & Mrs</h1>\r\n                <hr />\r\n            </div>\r\n        </div>\r\n        <router-view></router-view>\r\n    </div>\r\n\r\n</template>"; });
define('text!game/create.html', ['module'], function(module) { module.exports = "<template>\r\n    <h2>Spielcode tests: <span data-test-id=\"game-code\">${gameId}</span></h2>\r\n    <h2><span data-test-id=\"total-questions-no\">${questionsModel.length}</span> Fragen</h2>\r\n    <ul class=\"list-group\">\r\n        <li repeat.for=\"question of questionsModel\" class=\"list-group-item\">\r\n            <button click.trigger=\"question.editAction()\" type=\"button\" class=\"btn btn-default\" aria-label=\"Left Align\">\r\n                <span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n            </button> \r\n\r\n            <span> ${question.text}</span>\r\n\r\n            <input show.bind=\"question.editActive\" type=\"text\" placeholder=\"Frage...\" class=\"form-control\" value=\"${question.text}\"></input>\r\n            <button show.bind=\"question.editActive\" type=\"button\" class=\"btn btn-default\" aria-label=\"Left Align\">\r\n                <span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span>\r\n            </button>\r\n        </li>\r\n    </ul>\r\n    <button type=\"button\" class=\"btn btn-primary\">Frage hinzufügen</button>\r\n    <hr />\r\n    <h2>Spieler:</h2>\r\n    <ul>\r\n        <li style=\"display: inline\" repeat.for=\"name of playerlist\">${name}, </li>\r\n    </ul>\r\n    <button class=\"btn btn-primary btn-lg\" click.trigger=\"startGame()\" data-test-id=\"start-game\">Spiel starten</button>\r\n\r\n</template>"; });
define('text!game/join.html', ['module'], function(module) { module.exports = "<template>\r\n    <row>\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <h2>Spiel beitreten</h2>\r\n        </div>\r\n    </row>\r\n    <row>\r\n        <div class=\"col-xs-4 col-sm-4 col-md-4 col-lg-4\">\r\n            <form>\r\n                <div class=\"form-group\">\r\n                    <label for=\"exampleInputName2\">Dein Name: </label>\r\n                    <input type=\"text\" class=\"form-control\" data-test-id=\"textbox-name\" value.bind=\"name\" placeholder=\"Name\">\r\n                </div>\r\n                <div class=\"form-group\">\r\n                    <label for=\"gameId\">Spiel Code: </label>\r\n                    <input type=\"text\" class=\"form-control\" id=\"gameId\" value.bind=\"gameId\" data-test-id=\"textbox-game-id\" placeholder=\"#af34w2s\">\r\n                </div>\r\n                <input type=\"submit\" class=\"btn btn-default\" data-test-id=\"join-game\" click.trigger=\"joinGame()\" value=\"Los!\"></input>\r\n            </form>\r\n        </div>\r\n    </row>\r\n    <row>\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <a href=\"\" click.trigger=\"showHighscore()\" data-test-id=\"show-highscore\">Nur highscore anzeigen</a>\r\n        </div>\r\n    </row>\r\n</template>"; });
define('text!highscore/highscore-table.html', ['module'], function(module) { module.exports = "<template>\r\n  <table class=\"table\" with.bind=\"model\">\r\n    <thead>\r\n      <tr>\r\n        <th>Platzierung</th>\r\n        <th>Name</th>\r\n        <th>Punkte</th>\r\n      </tr>\r\n    </thead>\r\n    <tbody>\r\n      <tr if.bind=\"entries.length > 0\">\r\n        <td>1.</td>\r\n        <td class=\"firstNames\">${entries[0].names}</td>\r\n        <td class=\"firstScore\">${entries[0].score}</td>\r\n      </tr>\r\n      <tr if.bind=\"entries.length > 1\">\r\n        <td>2.</td>\r\n        <td class=\"secondNames\">${entries[1].names}</td>\r\n        <td class=\"secondScore\">${entries[1].score}</td>\r\n      </tr>\r\n      <tr if.bind=\"entries.length > 2\">\r\n        <td>3.</td>\r\n        <td class=\"thirdNames\">${entries[2].names}</td>\r\n        <td class=\"thirdScore\">${entries[2].score}</td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n\r\n</template>"; });
define('text!highscore/highscore.html', ['module'], function(module) { module.exports = "<template bindable=\"highscoreModel\">\r\n    <require from=\"./highscore-table\"></require>\r\n    <h2 data-test-id=\"heading\">Übersicht</h2>\r\n\r\n    <div show.bind=\"game.state === 1\">\r\n        <div class=\"row\">\r\n            <div class=\"text-center\">\r\n                Aktuelle Frage: <span data-test-id=\"current-question\">${currentQuestion}</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"row top10\">\r\n            <div class=\"col-xs-6 \">\r\n                <button type=\"button\" class=\"btn btn-default btn-block\">Die Braut</button>\r\n            </div>\r\n            <div class=\"col-xs-1 \">\r\n                ${answerStatistics.mrs}\r\n            </div>\r\n            <div class=\"col-xs-5\">\r\n                <div class=\"progress\">\r\n                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"30\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: ${statsMrs}%;\">\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"row top10\">\r\n            <div class=\"col-xs-6 \">\r\n                <button type=\"button\" class=\"btn btn-default btn-block\">Der Bräutigam</button>\r\n            </div>\r\n            <div class=\"col-xs-1 \">\r\n                ${answerStatistics.mr}\r\n            </div>\r\n            <div class=\"col-xs-5\">\r\n                <div class=\"progress\">\r\n                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"50\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: ${statsMr}%;\">\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"row top10\">\r\n            <div class=\"col-xs-6 \">\r\n                <button type=\"button\" class=\"btn btn-default btn-block\">Beide</button>\r\n            </div>\r\n            <div class=\"col-xs-1 \">\r\n                ${answerStatistics.both}\r\n            </div>\r\n            <div class=\"col-xs-5\">\r\n                <div class=\"progress\">\r\n                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: ${statsBoth}%;\">\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <highscore-table model.bind=\"highscoreTableModel\"></highscore-table>\r\n</template>"; });
define('text!home/index.html', ['module'], function(module) { module.exports = "<template>\r\n\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <p>Einem bestehenden Spiel beitreten. Den Spielcode erfährst du von deinem Spielleiter.</p>\r\n            <p><a class=\"btn btn-primary btn-lg\" href=\"#/game/join\" role=\"button\" data-test-id=\"join-game\">Spiel beitreten</a></p>\r\n            <hr />\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <p>Jetzt ein neues Spiel erstellen und alle mitraten lassen. Spiele werden 14 Tage lang gespeichert.</p>\r\n            <p><a class=\"btn btn-primary btn-lg\" click.trigger=\"createGame()\" role=\"button\" data-test-id=\"create-game\">Spiel erstellen</a></p>\r\n            <hr />\r\n        </div>\r\n    </div>\r\n\r\n</template>"; });
define('text!lobby/lobby.html', ['module'], function(module) { module.exports = "<template>\r\n    <div class=\"jumbotron\">\r\n        <h2>Ela & Patrick (Lobby)</h2>\r\n        <p>Gäste: </p>\r\n\r\n        <ul>\r\n            <li repeat.for=\"name of playerlist\">${name}</li>\r\n        </ul>\r\n        <a class=\"btn btn-lg btn-default\" href=\"#\" role=\"button\">Warten auf Moderator...</a>\r\n\r\n    </div>\r\n</template>"; });
define('text!question/question.html', ['module'], function(module) { module.exports = "<template>\r\n    <div class=\"row breadcrumb\">\r\n        <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\" show.bind=\"isModerator\">\r\n            <span>Moderator</span>\r\n        </div>\r\n        <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\">\r\n            Frage <span data-test-id=\"current-question-number\">${questionIndex + 1}</span> von <span data-test-id=\"total-question-number\">${game.questions.length}</span>\r\n        </div>\r\n    </div>\r\n    <div class=\"row\">\r\n        <div class=\"text-center\" data-test-id=\"current-question\">\r\n            ${currentQuestion}\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 col-xs-offset-3\">\r\n            <button type=\"button\" class=\"btn btn-default btn-block ${selectedAnswer === 0 ? 'active' : ''}\" click.trigger=\"selectAnswer(0)\" data-test-id=\"select-mrs\">Die Braut</button>\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 col-xs-offset-3\">\r\n            <button type=\"button\" class=\"btn btn-default btn-block ${selectedAnswer === 1 ? 'active' : ''}\" click.trigger=\"selectAnswer(1)\" data-test-id=\"select-mr\">Der Bräutigam</button>\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 col-xs-offset-3\">\r\n            <button type=\"button\" class=\"btn btn-default btn-block ${selectedAnswer === 2 ? 'active' : ''}\" click.trigger=\"selectAnswer(2)\" data-test-id=\"select-both\">Beide</button>\r\n        </div>\r\n    </div>\r\n    <hr />\r\n    <div show.bind=\"isModerator && !isLastQuestion\">\r\n        <button type=\"button\" class=\"btn btn-primary\" click.trigger=\"nextQuestion()\" data-test-id=\"next-question\">Nächste Frage</button>\r\n    </div>\r\n    <div show.bind=\"isModerator && isLastQuestion\">\r\n        <button type=\"button\" class=\"btn btn-primary\" click.trigger=\"endGame()\" data-test-id=\"end-game\">Spiel beenden</button>\r\n    </div>\r\n    <div show.bind=\"!isModerator\">\r\n        <button type=\"button\" class=\"btn btn-primary\">Warten auf Moderator...</button>\r\n    </div>\r\n</template>"; });
//# sourceMappingURL=app-bundle.js.map