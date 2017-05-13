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
            this.newQuestionText = "";
        }

        create.prototype.activate = function activate(params) {
            var _this = this;

            var self = this;
            this.gameId = params.gameId;

            console.log("questions model is", this.questionsModel);

            window.localStorage.setItem("username", "moderator");
            window.localStorage.setItem("currentGame", this.gameId);
            window.localStorage.setItem("isModerator", true);

            this.signalrService.verifyConnected(this.gameId).then(function (game) {
                self.game = game;
                self.questions = game.questions;

                for (var i = 0; i < self.questions.length; i++) {
                    self.questionsModel.push({
                        text: self.questions[i],
                        editActive: false,
                        editAction: self.changeEditState,
                        updateAction: function updateAction(question) {
                            return self.applyQuestionUpdate(self, question);
                        }
                    });
                }

                _this.eventAggregator.subscribe('playerListUpdated', function (updatedPlayerList) {
                    console.log("we should update playerlist now for moderator view.");
                    console.log(updatedPlayerList);
                    self.playerlist = updatedPlayerList;
                });
            });
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

        create.prototype.changeEditState = function changeEditState() {
            this.editActive = !this.editActive;
        };

        create.prototype.addQuestion = function addQuestion() {
            var self = this;
            var questionToCreate = {
                text: this.newQuestionText,
                editActive: false,
                editAction: this.changeEditState
            };

            this.questionsModel.push(questionToCreate);

            this.updateQuestions();
        };

        create.prototype.applyQuestionUpdate = function applyQuestionUpdate(parent, child) {
            child.editActive = false;
            parent.updateQuestions.apply(parent);
        };

        create.prototype.updateQuestions = function updateQuestions() {
            var rawQuestions = this.questionsModel.map(function (question) {
                return question.text;
            });
            console.log("questions to update:", rawQuestions);

            this.signalrService.updateQuestions(rawQuestions).then(function () {
                console.log("questions updated on server");
                self.newQuestionText = "";
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
                _this.theRouter.navigateToRoute("gameCreation", { gameId: game.gameId });
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
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
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

    SignalrService.prototype.updateQuestions = function updateQuestions(questions) {
      var self = this;
      return new Promise(function (resolve, reject) {
        self.gameHub.instance.server.updateQuestions(self.game.gameId, questions).done(function () {
          console.log("update questions request was received on server.");
          resolve();
        });
      });
    };

    return SignalrService;
  }()) || _class);
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\r\n    <require from=\"styles/bootstrap.min.css\"></require>\r\n    <require from='styles/styles.css'></require>\r\n    <div class=\"container\">\r\n        <div class=\"row\">\r\n            <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n                <h1 class=\"handwriting\">Mister & Misses</h1>\r\n                <hr />\r\n            </div>\r\n        </div>\r\n        <router-view></router-view>\r\n    </div>\r\n</template>"; });
define('text!styles/bootstrap.min.css', ['module'], function(module) { module.exports = "/*! Generated by Live LESS Theme Customizer */\n.label,sub,sup{vertical-align:baseline}\nbody,figure{margin:0}\n.navbar-fixed-bottom .navbar-collapse,.navbar-fixed-top .navbar-collapse,.pre-scrollable{max-height:340px}\nhtml{font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;font-size:10px;-webkit-tap-highlight-color:transparent}\narticle,aside,details,figcaption,figure,footer,header,hgroup,main,menu,nav,section,summary{display:block}\naudio,canvas,progress,video{display:inline-block;vertical-align:baseline}\naudio:not([controls]){display:none;height:0}\n[hidden],template{display:none}\na{background-color:transparent}\na:active,a:hover{outline:0}\nb,optgroup,strong{font-weight:700}\ndfn{font-style:italic}\nh1{margin:.67em 0}\nmark{background:#ff0;color:#000}\nsub,sup{font-size:75%;line-height:0;position:relative}\nsup{top:-.5em}\nsub{bottom:-.25em}\nimg{border:0;vertical-align:middle}\nsvg:not(:root){overflow:hidden}\nhr{box-sizing:content-box;height:0}\npre,textarea{overflow:auto}\ncode,kbd,pre,samp{font-size:1em}\nbutton,input,optgroup,select,textarea{color:inherit;font:inherit;margin:0}\nbutton{overflow:visible}\nbutton,select{text-transform:none}\nbutton,html input[type=button],input[type=reset],input[type=submit]{-webkit-appearance:button;cursor:pointer}\nbutton[disabled],html input[disabled]{cursor:default}\nbutton::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}\ninput[type=checkbox],input[type=radio]{box-sizing:border-box;padding:0}\ninput[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{height:auto}\ninput[type=search]::-webkit-search-cancel-button,input[type=search]::-webkit-search-decoration{-webkit-appearance:none}\ntable{border-collapse:collapse;border-spacing:0}\ntd,th{padding:0}\n@media print{blockquote,img,pre,tr{page-break-inside:avoid}\n*,:after,:before{background:0 0!important;color:#000!important;box-shadow:none!important;text-shadow:none!important}\na,a:visited{text-decoration:underline}\na[href]:after{content:\" (\" attr(href) \")\"}\nabbr[title]:after{content:\" (\" attr(title) \")\"}\na[href^=\"javascript:\"]:after,a[href^=\"#\"]:after{content:\"\"}\nblockquote,pre{border:1px solid #999}\nthead{display:table-header-group}\nimg{max-width:100%!important}\nh2,h3,p{orphans:3;widows:3}\nh2,h3{page-break-after:avoid}\n.navbar{display:none}\n.btn>.caret,.dropup>.btn>.caret{border-top-color:#000!important}\n.label{border:1px solid #000}\n.table{border-collapse:collapse!important}\n.table td,.table th{background-color:#fff!important}\n.table-bordered td,.table-bordered th{border:1px solid #ddd!important}\n}\n.img-thumbnail,body{background-color:#fff}\n.btn,.btn-danger.active,.btn-danger:active,.btn-default.active,.btn-default:active,.btn-info.active,.btn-info:active,.btn-primary.active,.btn-primary:active,.btn-warning.active,.btn-warning:active,.btn.active,.btn:active,.dropdown-menu>.disabled>a:focus,.dropdown-menu>.disabled>a:hover,.form-control,.navbar-toggle,.open>.dropdown-toggle.btn-danger,.open>.dropdown-toggle.btn-default,.open>.dropdown-toggle.btn-info,.open>.dropdown-toggle.btn-primary,.open>.dropdown-toggle.btn-warning{background-image:none}\n@font-face{font-family:'Glyphicons Halflings';src:url(../fonts/glyphicons-halflings-regular.eot);src:url(../fonts/glyphicons-halflings-regular.eot?#iefix) format('embedded-opentype'),url(../fonts/glyphicons-halflings-regular.woff2) format('woff2'),url(../fonts/glyphicons-halflings-regular.woff) format('woff'),url(../fonts/glyphicons-halflings-regular.ttf) format('truetype'),url(../fonts/glyphicons-halflings-regular.svg#glyphicons_halflingsregular) format('svg')}\n.glyphicon{position:relative;top:1px;display:inline-block;font-family:'Glyphicons Halflings';font-style:normal;font-weight:400;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}\n.glyphicon-asterisk:before{content:\"\\002a\"}\n.glyphicon-plus:before{content:\"\\002b\"}\n.glyphicon-eur:before,.glyphicon-euro:before{content:\"\\20ac\"}\n.glyphicon-minus:before{content:\"\\2212\"}\n.glyphicon-cloud:before{content:\"\\2601\"}\n.glyphicon-envelope:before{content:\"\\2709\"}\n.glyphicon-pencil:before{content:\"\\270f\"}\n.glyphicon-glass:before{content:\"\\e001\"}\n.glyphicon-music:before{content:\"\\e002\"}\n.glyphicon-search:before{content:\"\\e003\"}\n.glyphicon-heart:before{content:\"\\e005\"}\n.glyphicon-star:before{content:\"\\e006\"}\n.glyphicon-star-empty:before{content:\"\\e007\"}\n.glyphicon-user:before{content:\"\\e008\"}\n.glyphicon-film:before{content:\"\\e009\"}\n.glyphicon-th-large:before{content:\"\\e010\"}\n.glyphicon-th:before{content:\"\\e011\"}\n.glyphicon-th-list:before{content:\"\\e012\"}\n.glyphicon-ok:before{content:\"\\e013\"}\n.glyphicon-remove:before{content:\"\\e014\"}\n.glyphicon-zoom-in:before{content:\"\\e015\"}\n.glyphicon-zoom-out:before{content:\"\\e016\"}\n.glyphicon-off:before{content:\"\\e017\"}\n.glyphicon-signal:before{content:\"\\e018\"}\n.glyphicon-cog:before{content:\"\\e019\"}\n.glyphicon-trash:before{content:\"\\e020\"}\n.glyphicon-home:before{content:\"\\e021\"}\n.glyphicon-file:before{content:\"\\e022\"}\n.glyphicon-time:before{content:\"\\e023\"}\n.glyphicon-road:before{content:\"\\e024\"}\n.glyphicon-download-alt:before{content:\"\\e025\"}\n.glyphicon-download:before{content:\"\\e026\"}\n.glyphicon-upload:before{content:\"\\e027\"}\n.glyphicon-inbox:before{content:\"\\e028\"}\n.glyphicon-play-circle:before{content:\"\\e029\"}\n.glyphicon-repeat:before{content:\"\\e030\"}\n.glyphicon-refresh:before{content:\"\\e031\"}\n.glyphicon-list-alt:before{content:\"\\e032\"}\n.glyphicon-lock:before{content:\"\\e033\"}\n.glyphicon-flag:before{content:\"\\e034\"}\n.glyphicon-headphones:before{content:\"\\e035\"}\n.glyphicon-volume-off:before{content:\"\\e036\"}\n.glyphicon-volume-down:before{content:\"\\e037\"}\n.glyphicon-volume-up:before{content:\"\\e038\"}\n.glyphicon-qrcode:before{content:\"\\e039\"}\n.glyphicon-barcode:before{content:\"\\e040\"}\n.glyphicon-tag:before{content:\"\\e041\"}\n.glyphicon-tags:before{content:\"\\e042\"}\n.glyphicon-book:before{content:\"\\e043\"}\n.glyphicon-bookmark:before{content:\"\\e044\"}\n.glyphicon-print:before{content:\"\\e045\"}\n.glyphicon-camera:before{content:\"\\e046\"}\n.glyphicon-font:before{content:\"\\e047\"}\n.glyphicon-bold:before{content:\"\\e048\"}\n.glyphicon-italic:before{content:\"\\e049\"}\n.glyphicon-text-height:before{content:\"\\e050\"}\n.glyphicon-text-width:before{content:\"\\e051\"}\n.glyphicon-align-left:before{content:\"\\e052\"}\n.glyphicon-align-center:before{content:\"\\e053\"}\n.glyphicon-align-right:before{content:\"\\e054\"}\n.glyphicon-align-justify:before{content:\"\\e055\"}\n.glyphicon-list:before{content:\"\\e056\"}\n.glyphicon-indent-left:before{content:\"\\e057\"}\n.glyphicon-indent-right:before{content:\"\\e058\"}\n.glyphicon-facetime-video:before{content:\"\\e059\"}\n.glyphicon-picture:before{content:\"\\e060\"}\n.glyphicon-map-marker:before{content:\"\\e062\"}\n.glyphicon-adjust:before{content:\"\\e063\"}\n.glyphicon-tint:before{content:\"\\e064\"}\n.glyphicon-edit:before{content:\"\\e065\"}\n.glyphicon-share:before{content:\"\\e066\"}\n.glyphicon-check:before{content:\"\\e067\"}\n.glyphicon-move:before{content:\"\\e068\"}\n.glyphicon-step-backward:before{content:\"\\e069\"}\n.glyphicon-fast-backward:before{content:\"\\e070\"}\n.glyphicon-backward:before{content:\"\\e071\"}\n.glyphicon-play:before{content:\"\\e072\"}\n.glyphicon-pause:before{content:\"\\e073\"}\n.glyphicon-stop:before{content:\"\\e074\"}\n.glyphicon-forward:before{content:\"\\e075\"}\n.glyphicon-fast-forward:before{content:\"\\e076\"}\n.glyphicon-step-forward:before{content:\"\\e077\"}\n.glyphicon-eject:before{content:\"\\e078\"}\n.glyphicon-chevron-left:before{content:\"\\e079\"}\n.glyphicon-chevron-right:before{content:\"\\e080\"}\n.glyphicon-plus-sign:before{content:\"\\e081\"}\n.glyphicon-minus-sign:before{content:\"\\e082\"}\n.glyphicon-remove-sign:before{content:\"\\e083\"}\n.glyphicon-ok-sign:before{content:\"\\e084\"}\n.glyphicon-question-sign:before{content:\"\\e085\"}\n.glyphicon-info-sign:before{content:\"\\e086\"}\n.glyphicon-screenshot:before{content:\"\\e087\"}\n.glyphicon-remove-circle:before{content:\"\\e088\"}\n.glyphicon-ok-circle:before{content:\"\\e089\"}\n.glyphicon-ban-circle:before{content:\"\\e090\"}\n.glyphicon-arrow-left:before{content:\"\\e091\"}\n.glyphicon-arrow-right:before{content:\"\\e092\"}\n.glyphicon-arrow-up:before{content:\"\\e093\"}\n.glyphicon-arrow-down:before{content:\"\\e094\"}\n.glyphicon-share-alt:before{content:\"\\e095\"}\n.glyphicon-resize-full:before{content:\"\\e096\"}\n.glyphicon-resize-small:before{content:\"\\e097\"}\n.glyphicon-exclamation-sign:before{content:\"\\e101\"}\n.glyphicon-gift:before{content:\"\\e102\"}\n.glyphicon-leaf:before{content:\"\\e103\"}\n.glyphicon-fire:before{content:\"\\e104\"}\n.glyphicon-eye-open:before{content:\"\\e105\"}\n.glyphicon-eye-close:before{content:\"\\e106\"}\n.glyphicon-warning-sign:before{content:\"\\e107\"}\n.glyphicon-plane:before{content:\"\\e108\"}\n.glyphicon-calendar:before{content:\"\\e109\"}\n.glyphicon-random:before{content:\"\\e110\"}\n.glyphicon-comment:before{content:\"\\e111\"}\n.glyphicon-magnet:before{content:\"\\e112\"}\n.glyphicon-chevron-up:before{content:\"\\e113\"}\n.glyphicon-chevron-down:before{content:\"\\e114\"}\n.glyphicon-retweet:before{content:\"\\e115\"}\n.glyphicon-shopping-cart:before{content:\"\\e116\"}\n.glyphicon-folder-close:before{content:\"\\e117\"}\n.glyphicon-folder-open:before{content:\"\\e118\"}\n.glyphicon-resize-vertical:before{content:\"\\e119\"}\n.glyphicon-resize-horizontal:before{content:\"\\e120\"}\n.glyphicon-hdd:before{content:\"\\e121\"}\n.glyphicon-bullhorn:before{content:\"\\e122\"}\n.glyphicon-bell:before{content:\"\\e123\"}\n.glyphicon-certificate:before{content:\"\\e124\"}\n.glyphicon-thumbs-up:before{content:\"\\e125\"}\n.glyphicon-thumbs-down:before{content:\"\\e126\"}\n.glyphicon-hand-right:before{content:\"\\e127\"}\n.glyphicon-hand-left:before{content:\"\\e128\"}\n.glyphicon-hand-up:before{content:\"\\e129\"}\n.glyphicon-hand-down:before{content:\"\\e130\"}\n.glyphicon-circle-arrow-right:before{content:\"\\e131\"}\n.glyphicon-circle-arrow-left:before{content:\"\\e132\"}\n.glyphicon-circle-arrow-up:before{content:\"\\e133\"}\n.glyphicon-circle-arrow-down:before{content:\"\\e134\"}\n.glyphicon-globe:before{content:\"\\e135\"}\n.glyphicon-wrench:before{content:\"\\e136\"}\n.glyphicon-tasks:before{content:\"\\e137\"}\n.glyphicon-filter:before{content:\"\\e138\"}\n.glyphicon-briefcase:before{content:\"\\e139\"}\n.glyphicon-fullscreen:before{content:\"\\e140\"}\n.glyphicon-dashboard:before{content:\"\\e141\"}\n.glyphicon-paperclip:before{content:\"\\e142\"}\n.glyphicon-heart-empty:before{content:\"\\e143\"}\n.glyphicon-link:before{content:\"\\e144\"}\n.glyphicon-phone:before{content:\"\\e145\"}\n.glyphicon-pushpin:before{content:\"\\e146\"}\n.glyphicon-usd:before{content:\"\\e148\"}\n.glyphicon-gbp:before{content:\"\\e149\"}\n.glyphicon-sort:before{content:\"\\e150\"}\n.glyphicon-sort-by-alphabet:before{content:\"\\e151\"}\n.glyphicon-sort-by-alphabet-alt:before{content:\"\\e152\"}\n.glyphicon-sort-by-order:before{content:\"\\e153\"}\n.glyphicon-sort-by-order-alt:before{content:\"\\e154\"}\n.glyphicon-sort-by-attributes:before{content:\"\\e155\"}\n.glyphicon-sort-by-attributes-alt:before{content:\"\\e156\"}\n.glyphicon-unchecked:before{content:\"\\e157\"}\n.glyphicon-expand:before{content:\"\\e158\"}\n.glyphicon-collapse-down:before{content:\"\\e159\"}\n.glyphicon-collapse-up:before{content:\"\\e160\"}\n.glyphicon-log-in:before{content:\"\\e161\"}\n.glyphicon-flash:before{content:\"\\e162\"}\n.glyphicon-log-out:before{content:\"\\e163\"}\n.glyphicon-new-window:before{content:\"\\e164\"}\n.glyphicon-record:before{content:\"\\e165\"}\n.glyphicon-save:before{content:\"\\e166\"}\n.glyphicon-open:before{content:\"\\e167\"}\n.glyphicon-saved:before{content:\"\\e168\"}\n.glyphicon-import:before{content:\"\\e169\"}\n.glyphicon-export:before{content:\"\\e170\"}\n.glyphicon-send:before{content:\"\\e171\"}\n.glyphicon-floppy-disk:before{content:\"\\e172\"}\n.glyphicon-floppy-saved:before{content:\"\\e173\"}\n.glyphicon-floppy-remove:before{content:\"\\e174\"}\n.glyphicon-floppy-save:before{content:\"\\e175\"}\n.glyphicon-floppy-open:before{content:\"\\e176\"}\n.glyphicon-credit-card:before{content:\"\\e177\"}\n.glyphicon-transfer:before{content:\"\\e178\"}\n.glyphicon-cutlery:before{content:\"\\e179\"}\n.glyphicon-header:before{content:\"\\e180\"}\n.glyphicon-compressed:before{content:\"\\e181\"}\n.glyphicon-earphone:before{content:\"\\e182\"}\n.glyphicon-phone-alt:before{content:\"\\e183\"}\n.glyphicon-tower:before{content:\"\\e184\"}\n.glyphicon-stats:before{content:\"\\e185\"}\n.glyphicon-sd-video:before{content:\"\\e186\"}\n.glyphicon-hd-video:before{content:\"\\e187\"}\n.glyphicon-subtitles:before{content:\"\\e188\"}\n.glyphicon-sound-stereo:before{content:\"\\e189\"}\n.glyphicon-sound-dolby:before{content:\"\\e190\"}\n.glyphicon-sound-5-1:before{content:\"\\e191\"}\n.glyphicon-sound-6-1:before{content:\"\\e192\"}\n.glyphicon-sound-7-1:before{content:\"\\e193\"}\n.glyphicon-copyright-mark:before{content:\"\\e194\"}\n.glyphicon-registration-mark:before{content:\"\\e195\"}\n.glyphicon-cloud-download:before{content:\"\\e197\"}\n.glyphicon-cloud-upload:before{content:\"\\e198\"}\n.glyphicon-tree-conifer:before{content:\"\\e199\"}\n.glyphicon-tree-deciduous:before{content:\"\\e200\"}\n.glyphicon-cd:before{content:\"\\e201\"}\n.glyphicon-save-file:before{content:\"\\e202\"}\n.glyphicon-open-file:before{content:\"\\e203\"}\n.glyphicon-level-up:before{content:\"\\e204\"}\n.glyphicon-copy:before{content:\"\\e205\"}\n.glyphicon-paste:before{content:\"\\e206\"}\n.glyphicon-alert:before{content:\"\\e209\"}\n.glyphicon-equalizer:before{content:\"\\e210\"}\n.glyphicon-king:before{content:\"\\e211\"}\n.glyphicon-queen:before{content:\"\\e212\"}\n.glyphicon-pawn:before{content:\"\\e213\"}\n.glyphicon-bishop:before{content:\"\\e214\"}\n.glyphicon-knight:before{content:\"\\e215\"}\n.glyphicon-baby-formula:before{content:\"\\e216\"}\n.glyphicon-tent:before{content:\"\\26fa\"}\n.glyphicon-blackboard:before{content:\"\\e218\"}\n.glyphicon-bed:before{content:\"\\e219\"}\n.glyphicon-apple:before{content:\"\\f8ff\"}\n.glyphicon-erase:before{content:\"\\e221\"}\n.glyphicon-hourglass:before{content:\"\\231b\"}\n.glyphicon-lamp:before{content:\"\\e223\"}\n.glyphicon-duplicate:before{content:\"\\e224\"}\n.glyphicon-piggy-bank:before{content:\"\\e225\"}\n.glyphicon-scissors:before{content:\"\\e226\"}\n.glyphicon-bitcoin:before,.glyphicon-btc:before,.glyphicon-xbt:before{content:\"\\e227\"}\n.glyphicon-jpy:before,.glyphicon-yen:before{content:\"\\00a5\"}\n.glyphicon-rub:before,.glyphicon-ruble:before{content:\"\\20bd\"}\n.glyphicon-scale:before{content:\"\\e230\"}\n.glyphicon-ice-lolly:before{content:\"\\e231\"}\n.glyphicon-ice-lolly-tasted:before{content:\"\\e232\"}\n.glyphicon-education:before{content:\"\\e233\"}\n.glyphicon-option-horizontal:before{content:\"\\e234\"}\n.glyphicon-option-vertical:before{content:\"\\e235\"}\n.glyphicon-menu-hamburger:before{content:\"\\e236\"}\n.glyphicon-modal-window:before{content:\"\\e237\"}\n.glyphicon-oil:before{content:\"\\e238\"}\n.glyphicon-grain:before{content:\"\\e239\"}\n.glyphicon-sunglasses:before{content:\"\\e240\"}\n.glyphicon-text-size:before{content:\"\\e241\"}\n.glyphicon-text-color:before{content:\"\\e242\"}\n.glyphicon-text-background:before{content:\"\\e243\"}\n.glyphicon-object-align-top:before{content:\"\\e244\"}\n.glyphicon-object-align-bottom:before{content:\"\\e245\"}\n.glyphicon-object-align-horizontal:before{content:\"\\e246\"}\n.glyphicon-object-align-left:before{content:\"\\e247\"}\n.glyphicon-object-align-vertical:before{content:\"\\e248\"}\n.glyphicon-object-align-right:before{content:\"\\e249\"}\n.glyphicon-triangle-right:before{content:\"\\e250\"}\n.glyphicon-triangle-left:before{content:\"\\e251\"}\n.glyphicon-triangle-bottom:before{content:\"\\e252\"}\n.glyphicon-triangle-top:before{content:\"\\e253\"}\n.glyphicon-console:before{content:\"\\e254\"}\n.glyphicon-superscript:before{content:\"\\e255\"}\n.glyphicon-subscript:before{content:\"\\e256\"}\n.glyphicon-menu-left:before{content:\"\\e257\"}\n.glyphicon-menu-right:before{content:\"\\e258\"}\n.glyphicon-menu-down:before{content:\"\\e259\"}\n.glyphicon-menu-up:before{content:\"\\e260\"}\n*,:after,:before{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}\nbody{font-family:\"Helvetica Neue\",Helvetica,Arial,sans-serif;font-size:14px;line-height:1.42857143;color:#333}\nbutton,input,select,textarea{font-family:inherit;font-size:inherit;line-height:inherit}\na{color:#de0000;text-decoration:none}\na:focus,a:hover{color:#910000;text-decoration:underline}\na:focus{outline:-webkit-focus-ring-color auto 5px;outline-offset:-2px}\n.carousel-inner>.item>a>img,.carousel-inner>.item>img,.img-responsive,.thumbnail a>img,.thumbnail>img{display:block;max-width:100%;height:auto}\n.img-rounded{border-radius:6px}\n.img-thumbnail{padding:4px;line-height:1.42857143;border:1px solid #ddd;border-radius:4px;-webkit-transition:all .2s ease-in-out;-o-transition:all .2s ease-in-out;transition:all .2s ease-in-out;display:inline-block;max-width:100%;height:auto}\n.img-circle{border-radius:50%}\nhr{margin-top:20px;margin-bottom:20px;border:0;border-top:1px solid #eee}\n.sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);border:0}\n.sr-only-focusable:active,.sr-only-focusable:focus{position:static;width:auto;height:auto;margin:0;overflow:visible;clip:auto}\n[role=button]{cursor:pointer}\n.h1,.h2,.h3,.h4,.h5,.h6,h1,h2,h3,h4,h5,h6{font-family:inherit;font-weight:500;line-height:1.1;color:inherit}\n.h1 .small,.h1 small,.h2 .small,.h2 small,.h3 .small,.h3 small,.h4 .small,.h4 small,.h5 .small,.h5 small,.h6 .small,.h6 small,h1 .small,h1 small,h2 .small,h2 small,h3 .small,h3 small,h4 .small,h4 small,h5 .small,h5 small,h6 .small,h6 small{font-weight:400;line-height:1;color:#777}\n.h1,.h2,.h3,h1,h2,h3{margin-top:20px;margin-bottom:10px}\n.h1 .small,.h1 small,.h2 .small,.h2 small,.h3 .small,.h3 small,h1 .small,h1 small,h2 .small,h2 small,h3 .small,h3 small{font-size:65%}\n.h4,.h5,.h6,h4,h5,h6{margin-top:10px;margin-bottom:10px}\n.h4 .small,.h4 small,.h5 .small,.h5 small,.h6 .small,.h6 small,h4 .small,h4 small,h5 .small,h5 small,h6 .small,h6 small{font-size:75%}\n.h1,h1{font-size:36px}\n.h2,h2{font-size:30px}\n.h3,h3{font-size:24px}\n.h4,h4{font-size:18px}\n.h5,h5{font-size:14px}\n.h6,h6{font-size:12px}\np{margin:0 0 10px}\n.lead{margin-bottom:20px;font-size:16px;font-weight:300;line-height:1.4}\naddress,blockquote .small,blockquote footer,blockquote small,dd,dt,pre{line-height:1.42857143}\ndt,kbd kbd,label{font-weight:700}\n@media (min-width:768px){.lead{font-size:21px}\n}\n.small,small{font-size:85%}\n.mark,mark{background-color:#fcf8e3;padding:.2em}\n.list-inline,.list-unstyled{list-style:none;padding-left:0}\n.text-left{text-align:left}\n.text-right{text-align:right}\n.btn,.text-center{text-align:center}\n.text-justify{text-align:justify}\n.text-nowrap{white-space:nowrap}\n.text-lowercase{text-transform:lowercase}\n.text-uppercase{text-transform:uppercase}\n.text-capitalize{text-transform:capitalize}\n.text-muted{color:#777}\n.text-primary{color:#de0000}\na.text-primary:focus,a.text-primary:hover{color:#ab0000}\n.text-success{color:#3c763d}\na.text-success:focus,a.text-success:hover{color:#2b542c}\n.text-info{color:#31708f}\na.text-info:focus,a.text-info:hover{color:#245269}\n.text-warning{color:#8a6d3b}\na.text-warning:focus,a.text-warning:hover{color:#66512c}\n.text-danger{color:#a94442}\na.text-danger:focus,a.text-danger:hover{color:#843534}\n.bg-primary{color:#fff;background-color:#de0000}\na.bg-primary:focus,a.bg-primary:hover{background-color:#ab0000}\n.bg-success{background-color:#dff0d8}\na.bg-success:focus,a.bg-success:hover{background-color:#c1e2b3}\n.bg-info{background-color:#d9edf7}\na.bg-info:focus,a.bg-info:hover{background-color:#afd9ee}\n.bg-warning{background-color:#fcf8e3}\na.bg-warning:focus,a.bg-warning:hover{background-color:#f7ecb5}\n.bg-danger{background-color:#f2dede}\na.bg-danger:focus,a.bg-danger:hover{background-color:#e4b9b9}\npre code,table{background-color:transparent}\n.page-header{padding-bottom:9px;margin:40px 0 20px;border-bottom:1px solid #eee}\ndl,ol,ul{margin-top:0}\nol,ul{margin-bottom:10px}\nol ol,ol ul,ul ol,ul ul{margin-bottom:0}\n.list-inline{margin-left:-5px}\n.list-inline>li{display:inline-block;padding-left:5px;padding-right:5px}\ndl{margin-bottom:20px}\ndd{margin-left:0}\n@media (min-width:768px){.dl-horizontal dt{float:left;width:160px;clear:left;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dl-horizontal dd{margin-left:180px}\n}\nabbr[data-original-title],abbr[title]{cursor:help;border-bottom:1px dotted #777}\n.initialism{font-size:90%;text-transform:uppercase}\nblockquote{padding:10px 20px;margin:0 0 20px;font-size:17.5px;border-left:5px solid #eee}\nblockquote ol:last-child,blockquote p:last-child,blockquote ul:last-child{margin-bottom:0}\nblockquote .small,blockquote footer,blockquote small{display:block;font-size:80%;color:#777}\nblockquote .small:before,blockquote footer:before,blockquote small:before{content:'\\2014 \\00A0'}\n.blockquote-reverse,blockquote.pull-right{padding-right:15px;padding-left:0;border-right:5px solid #eee;border-left:0;text-align:right}\ncaption,th{text-align:left}\ncode,kbd{padding:2px 4px;font-size:90%}\n.blockquote-reverse .small:before,.blockquote-reverse footer:before,.blockquote-reverse small:before,blockquote.pull-right .small:before,blockquote.pull-right footer:before,blockquote.pull-right small:before{content:''}\n.blockquote-reverse .small:after,.blockquote-reverse footer:after,.blockquote-reverse small:after,blockquote.pull-right .small:after,blockquote.pull-right footer:after,blockquote.pull-right small:after{content:'\\00A0 \\2014'}\naddress{margin-bottom:20px;font-style:normal}\ncode,kbd,pre,samp{font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace}\ncode{color:#c7254e;background-color:#f9f2f4;border-radius:4px}\nkbd{color:#fff;background-color:#333;border-radius:3px;box-shadow:inset 0 -1px 0 rgba(0,0,0,.25)}\nkbd kbd{padding:0;font-size:100%;box-shadow:none}\npre{display:block;padding:9.5px;margin:0 0 10px;font-size:13px;word-break:break-all;word-wrap:break-word;color:#333;background-color:#f5f5f5;border:1px solid #ccc;border-radius:4px}\n.container,.container-fluid{margin-right:auto;margin-left:auto}\npre code{padding:0;font-size:inherit;color:inherit;white-space:pre-wrap;border-radius:0}\n.container,.container-fluid{padding-left:15px;padding-right:15px}\n.pre-scrollable{overflow-y:scroll}\n@media (min-width:768px){.container{width:750px}\n}\n@media (min-width:992px){.container{width:970px}\n}\n@media (min-width:1200px){.container{width:1170px}\n}\n.row{margin-left:-15px;margin-right:-15px}\n.col-lg-1,.col-lg-10,.col-lg-11,.col-lg-12,.col-lg-2,.col-lg-3,.col-lg-4,.col-lg-5,.col-lg-6,.col-lg-7,.col-lg-8,.col-lg-9,.col-md-1,.col-md-10,.col-md-11,.col-md-12,.col-md-2,.col-md-3,.col-md-4,.col-md-5,.col-md-6,.col-md-7,.col-md-8,.col-md-9,.col-sm-1,.col-sm-10,.col-sm-11,.col-sm-12,.col-sm-2,.col-sm-3,.col-sm-4,.col-sm-5,.col-sm-6,.col-sm-7,.col-sm-8,.col-sm-9,.col-xs-1,.col-xs-10,.col-xs-11,.col-xs-12,.col-xs-2,.col-xs-3,.col-xs-4,.col-xs-5,.col-xs-6,.col-xs-7,.col-xs-8,.col-xs-9{position:relative;min-height:1px;padding-left:15px;padding-right:15px}\n.col-xs-1,.col-xs-10,.col-xs-11,.col-xs-12,.col-xs-2,.col-xs-3,.col-xs-4,.col-xs-5,.col-xs-6,.col-xs-7,.col-xs-8,.col-xs-9{float:left}\n.col-xs-12{width:100%}\n.col-xs-11{width:91.66666667%}\n.col-xs-10{width:83.33333333%}\n.col-xs-9{width:75%}\n.col-xs-8{width:66.66666667%}\n.col-xs-7{width:58.33333333%}\n.col-xs-6{width:50%}\n.col-xs-5{width:41.66666667%}\n.col-xs-4{width:33.33333333%}\n.col-xs-3{width:25%}\n.col-xs-2{width:16.66666667%}\n.col-xs-1{width:8.33333333%}\n.col-xs-pull-12{right:100%}\n.col-xs-pull-11{right:91.66666667%}\n.col-xs-pull-10{right:83.33333333%}\n.col-xs-pull-9{right:75%}\n.col-xs-pull-8{right:66.66666667%}\n.col-xs-pull-7{right:58.33333333%}\n.col-xs-pull-6{right:50%}\n.col-xs-pull-5{right:41.66666667%}\n.col-xs-pull-4{right:33.33333333%}\n.col-xs-pull-3{right:25%}\n.col-xs-pull-2{right:16.66666667%}\n.col-xs-pull-1{right:8.33333333%}\n.col-xs-pull-0{right:auto}\n.col-xs-push-12{left:100%}\n.col-xs-push-11{left:91.66666667%}\n.col-xs-push-10{left:83.33333333%}\n.col-xs-push-9{left:75%}\n.col-xs-push-8{left:66.66666667%}\n.col-xs-push-7{left:58.33333333%}\n.col-xs-push-6{left:50%}\n.col-xs-push-5{left:41.66666667%}\n.col-xs-push-4{left:33.33333333%}\n.col-xs-push-3{left:25%}\n.col-xs-push-2{left:16.66666667%}\n.col-xs-push-1{left:8.33333333%}\n.col-xs-push-0{left:auto}\n.col-xs-offset-12{margin-left:100%}\n.col-xs-offset-11{margin-left:91.66666667%}\n.col-xs-offset-10{margin-left:83.33333333%}\n.col-xs-offset-9{margin-left:75%}\n.col-xs-offset-8{margin-left:66.66666667%}\n.col-xs-offset-7{margin-left:58.33333333%}\n.col-xs-offset-6{margin-left:50%}\n.col-xs-offset-5{margin-left:41.66666667%}\n.col-xs-offset-4{margin-left:33.33333333%}\n.col-xs-offset-3{margin-left:25%}\n.col-xs-offset-2{margin-left:16.66666667%}\n.col-xs-offset-1{margin-left:8.33333333%}\n.col-xs-offset-0{margin-left:0}\n@media (min-width:768px){.col-sm-1,.col-sm-10,.col-sm-11,.col-sm-12,.col-sm-2,.col-sm-3,.col-sm-4,.col-sm-5,.col-sm-6,.col-sm-7,.col-sm-8,.col-sm-9{float:left}\n.col-sm-12{width:100%}\n.col-sm-11{width:91.66666667%}\n.col-sm-10{width:83.33333333%}\n.col-sm-9{width:75%}\n.col-sm-8{width:66.66666667%}\n.col-sm-7{width:58.33333333%}\n.col-sm-6{width:50%}\n.col-sm-5{width:41.66666667%}\n.col-sm-4{width:33.33333333%}\n.col-sm-3{width:25%}\n.col-sm-2{width:16.66666667%}\n.col-sm-1{width:8.33333333%}\n.col-sm-pull-12{right:100%}\n.col-sm-pull-11{right:91.66666667%}\n.col-sm-pull-10{right:83.33333333%}\n.col-sm-pull-9{right:75%}\n.col-sm-pull-8{right:66.66666667%}\n.col-sm-pull-7{right:58.33333333%}\n.col-sm-pull-6{right:50%}\n.col-sm-pull-5{right:41.66666667%}\n.col-sm-pull-4{right:33.33333333%}\n.col-sm-pull-3{right:25%}\n.col-sm-pull-2{right:16.66666667%}\n.col-sm-pull-1{right:8.33333333%}\n.col-sm-pull-0{right:auto}\n.col-sm-push-12{left:100%}\n.col-sm-push-11{left:91.66666667%}\n.col-sm-push-10{left:83.33333333%}\n.col-sm-push-9{left:75%}\n.col-sm-push-8{left:66.66666667%}\n.col-sm-push-7{left:58.33333333%}\n.col-sm-push-6{left:50%}\n.col-sm-push-5{left:41.66666667%}\n.col-sm-push-4{left:33.33333333%}\n.col-sm-push-3{left:25%}\n.col-sm-push-2{left:16.66666667%}\n.col-sm-push-1{left:8.33333333%}\n.col-sm-push-0{left:auto}\n.col-sm-offset-12{margin-left:100%}\n.col-sm-offset-11{margin-left:91.66666667%}\n.col-sm-offset-10{margin-left:83.33333333%}\n.col-sm-offset-9{margin-left:75%}\n.col-sm-offset-8{margin-left:66.66666667%}\n.col-sm-offset-7{margin-left:58.33333333%}\n.col-sm-offset-6{margin-left:50%}\n.col-sm-offset-5{margin-left:41.66666667%}\n.col-sm-offset-4{margin-left:33.33333333%}\n.col-sm-offset-3{margin-left:25%}\n.col-sm-offset-2{margin-left:16.66666667%}\n.col-sm-offset-1{margin-left:8.33333333%}\n.col-sm-offset-0{margin-left:0}\n}\n@media (min-width:992px){.col-md-1,.col-md-10,.col-md-11,.col-md-12,.col-md-2,.col-md-3,.col-md-4,.col-md-5,.col-md-6,.col-md-7,.col-md-8,.col-md-9{float:left}\n.col-md-12{width:100%}\n.col-md-11{width:91.66666667%}\n.col-md-10{width:83.33333333%}\n.col-md-9{width:75%}\n.col-md-8{width:66.66666667%}\n.col-md-7{width:58.33333333%}\n.col-md-6{width:50%}\n.col-md-5{width:41.66666667%}\n.col-md-4{width:33.33333333%}\n.col-md-3{width:25%}\n.col-md-2{width:16.66666667%}\n.col-md-1{width:8.33333333%}\n.col-md-pull-12{right:100%}\n.col-md-pull-11{right:91.66666667%}\n.col-md-pull-10{right:83.33333333%}\n.col-md-pull-9{right:75%}\n.col-md-pull-8{right:66.66666667%}\n.col-md-pull-7{right:58.33333333%}\n.col-md-pull-6{right:50%}\n.col-md-pull-5{right:41.66666667%}\n.col-md-pull-4{right:33.33333333%}\n.col-md-pull-3{right:25%}\n.col-md-pull-2{right:16.66666667%}\n.col-md-pull-1{right:8.33333333%}\n.col-md-pull-0{right:auto}\n.col-md-push-12{left:100%}\n.col-md-push-11{left:91.66666667%}\n.col-md-push-10{left:83.33333333%}\n.col-md-push-9{left:75%}\n.col-md-push-8{left:66.66666667%}\n.col-md-push-7{left:58.33333333%}\n.col-md-push-6{left:50%}\n.col-md-push-5{left:41.66666667%}\n.col-md-push-4{left:33.33333333%}\n.col-md-push-3{left:25%}\n.col-md-push-2{left:16.66666667%}\n.col-md-push-1{left:8.33333333%}\n.col-md-push-0{left:auto}\n.col-md-offset-12{margin-left:100%}\n.col-md-offset-11{margin-left:91.66666667%}\n.col-md-offset-10{margin-left:83.33333333%}\n.col-md-offset-9{margin-left:75%}\n.col-md-offset-8{margin-left:66.66666667%}\n.col-md-offset-7{margin-left:58.33333333%}\n.col-md-offset-6{margin-left:50%}\n.col-md-offset-5{margin-left:41.66666667%}\n.col-md-offset-4{margin-left:33.33333333%}\n.col-md-offset-3{margin-left:25%}\n.col-md-offset-2{margin-left:16.66666667%}\n.col-md-offset-1{margin-left:8.33333333%}\n.col-md-offset-0{margin-left:0}\n}\n@media (min-width:1200px){.col-lg-1,.col-lg-10,.col-lg-11,.col-lg-12,.col-lg-2,.col-lg-3,.col-lg-4,.col-lg-5,.col-lg-6,.col-lg-7,.col-lg-8,.col-lg-9{float:left}\n.col-lg-12{width:100%}\n.col-lg-11{width:91.66666667%}\n.col-lg-10{width:83.33333333%}\n.col-lg-9{width:75%}\n.col-lg-8{width:66.66666667%}\n.col-lg-7{width:58.33333333%}\n.col-lg-6{width:50%}\n.col-lg-5{width:41.66666667%}\n.col-lg-4{width:33.33333333%}\n.col-lg-3{width:25%}\n.col-lg-2{width:16.66666667%}\n.col-lg-1{width:8.33333333%}\n.col-lg-pull-12{right:100%}\n.col-lg-pull-11{right:91.66666667%}\n.col-lg-pull-10{right:83.33333333%}\n.col-lg-pull-9{right:75%}\n.col-lg-pull-8{right:66.66666667%}\n.col-lg-pull-7{right:58.33333333%}\n.col-lg-pull-6{right:50%}\n.col-lg-pull-5{right:41.66666667%}\n.col-lg-pull-4{right:33.33333333%}\n.col-lg-pull-3{right:25%}\n.col-lg-pull-2{right:16.66666667%}\n.col-lg-pull-1{right:8.33333333%}\n.col-lg-pull-0{right:auto}\n.col-lg-push-12{left:100%}\n.col-lg-push-11{left:91.66666667%}\n.col-lg-push-10{left:83.33333333%}\n.col-lg-push-9{left:75%}\n.col-lg-push-8{left:66.66666667%}\n.col-lg-push-7{left:58.33333333%}\n.col-lg-push-6{left:50%}\n.col-lg-push-5{left:41.66666667%}\n.col-lg-push-4{left:33.33333333%}\n.col-lg-push-3{left:25%}\n.col-lg-push-2{left:16.66666667%}\n.col-lg-push-1{left:8.33333333%}\n.col-lg-push-0{left:auto}\n.col-lg-offset-12{margin-left:100%}\n.col-lg-offset-11{margin-left:91.66666667%}\n.col-lg-offset-10{margin-left:83.33333333%}\n.col-lg-offset-9{margin-left:75%}\n.col-lg-offset-8{margin-left:66.66666667%}\n.col-lg-offset-7{margin-left:58.33333333%}\n.col-lg-offset-6{margin-left:50%}\n.col-lg-offset-5{margin-left:41.66666667%}\n.col-lg-offset-4{margin-left:33.33333333%}\n.col-lg-offset-3{margin-left:25%}\n.col-lg-offset-2{margin-left:16.66666667%}\n.col-lg-offset-1{margin-left:8.33333333%}\n.col-lg-offset-0{margin-left:0}\n}\ncaption{padding-top:8px;padding-bottom:8px;color:#777}\n.table{width:100%;max-width:100%;margin-bottom:20px}\n.table>tbody>tr>td,.table>tbody>tr>th,.table>tfoot>tr>td,.table>tfoot>tr>th,.table>thead>tr>td,.table>thead>tr>th{padding:8px;line-height:1.42857143;vertical-align:top;border-top:1px solid #ddd}\n.table>thead>tr>th{vertical-align:bottom;border-bottom:2px solid #ddd}\n.table>caption+thead>tr:first-child>td,.table>caption+thead>tr:first-child>th,.table>colgroup+thead>tr:first-child>td,.table>colgroup+thead>tr:first-child>th,.table>thead:first-child>tr:first-child>td,.table>thead:first-child>tr:first-child>th{border-top:0}\n.table>tbody+tbody{border-top:2px solid #ddd}\n.table .table{background-color:#fff}\n.table-condensed>tbody>tr>td,.table-condensed>tbody>tr>th,.table-condensed>tfoot>tr>td,.table-condensed>tfoot>tr>th,.table-condensed>thead>tr>td,.table-condensed>thead>tr>th{padding:5px}\n.table-bordered,.table-bordered>tbody>tr>td,.table-bordered>tbody>tr>th,.table-bordered>tfoot>tr>td,.table-bordered>tfoot>tr>th,.table-bordered>thead>tr>td,.table-bordered>thead>tr>th{border:1px solid #ddd}\n.table-bordered>thead>tr>td,.table-bordered>thead>tr>th{border-bottom-width:2px}\n.table-striped>tbody>tr:nth-of-type(odd){background-color:#f9f9f9}\n.table-hover>tbody>tr:hover,.table>tbody>tr.active>td,.table>tbody>tr.active>th,.table>tbody>tr>td.active,.table>tbody>tr>th.active,.table>tfoot>tr.active>td,.table>tfoot>tr.active>th,.table>tfoot>tr>td.active,.table>tfoot>tr>th.active,.table>thead>tr.active>td,.table>thead>tr.active>th,.table>thead>tr>td.active,.table>thead>tr>th.active{background-color:#f5f5f5}\ntable col[class*=col-]{position:static;float:none;display:table-column}\ntable td[class*=col-],table th[class*=col-]{position:static;float:none;display:table-cell}\n.btn-group>.btn-group,.btn-toolbar .btn,.btn-toolbar .btn-group,.btn-toolbar .input-group,.dropdown-menu{float:left}\n.table-hover>tbody>tr.active:hover>td,.table-hover>tbody>tr.active:hover>th,.table-hover>tbody>tr:hover>.active,.table-hover>tbody>tr>td.active:hover,.table-hover>tbody>tr>th.active:hover{background-color:#e8e8e8}\n.table>tbody>tr.success>td,.table>tbody>tr.success>th,.table>tbody>tr>td.success,.table>tbody>tr>th.success,.table>tfoot>tr.success>td,.table>tfoot>tr.success>th,.table>tfoot>tr>td.success,.table>tfoot>tr>th.success,.table>thead>tr.success>td,.table>thead>tr.success>th,.table>thead>tr>td.success,.table>thead>tr>th.success{background-color:#dff0d8}\n.table-hover>tbody>tr.success:hover>td,.table-hover>tbody>tr.success:hover>th,.table-hover>tbody>tr:hover>.success,.table-hover>tbody>tr>td.success:hover,.table-hover>tbody>tr>th.success:hover{background-color:#d0e9c6}\n.table>tbody>tr.info>td,.table>tbody>tr.info>th,.table>tbody>tr>td.info,.table>tbody>tr>th.info,.table>tfoot>tr.info>td,.table>tfoot>tr.info>th,.table>tfoot>tr>td.info,.table>tfoot>tr>th.info,.table>thead>tr.info>td,.table>thead>tr.info>th,.table>thead>tr>td.info,.table>thead>tr>th.info{background-color:#d9edf7}\n.table-hover>tbody>tr.info:hover>td,.table-hover>tbody>tr.info:hover>th,.table-hover>tbody>tr:hover>.info,.table-hover>tbody>tr>td.info:hover,.table-hover>tbody>tr>th.info:hover{background-color:#c4e3f3}\n.table>tbody>tr.warning>td,.table>tbody>tr.warning>th,.table>tbody>tr>td.warning,.table>tbody>tr>th.warning,.table>tfoot>tr.warning>td,.table>tfoot>tr.warning>th,.table>tfoot>tr>td.warning,.table>tfoot>tr>th.warning,.table>thead>tr.warning>td,.table>thead>tr.warning>th,.table>thead>tr>td.warning,.table>thead>tr>th.warning{background-color:#fcf8e3}\n.table-hover>tbody>tr.warning:hover>td,.table-hover>tbody>tr.warning:hover>th,.table-hover>tbody>tr:hover>.warning,.table-hover>tbody>tr>td.warning:hover,.table-hover>tbody>tr>th.warning:hover{background-color:#faf2cc}\n.table>tbody>tr.danger>td,.table>tbody>tr.danger>th,.table>tbody>tr>td.danger,.table>tbody>tr>th.danger,.table>tfoot>tr.danger>td,.table>tfoot>tr.danger>th,.table>tfoot>tr>td.danger,.table>tfoot>tr>th.danger,.table>thead>tr.danger>td,.table>thead>tr.danger>th,.table>thead>tr>td.danger,.table>thead>tr>th.danger{background-color:#f2dede}\n.table-hover>tbody>tr.danger:hover>td,.table-hover>tbody>tr.danger:hover>th,.table-hover>tbody>tr:hover>.danger,.table-hover>tbody>tr>td.danger:hover,.table-hover>tbody>tr>th.danger:hover{background-color:#ebcccc}\n.table-responsive{overflow-x:auto;min-height:.01%}\n@media screen and (max-width:767px){.table-responsive{width:100%;margin-bottom:15px;overflow-y:hidden;-ms-overflow-style:-ms-autohiding-scrollbar;border:1px solid #ddd}\n.table-responsive>.table{margin-bottom:0}\n.table-responsive>.table>tbody>tr>td,.table-responsive>.table>tbody>tr>th,.table-responsive>.table>tfoot>tr>td,.table-responsive>.table>tfoot>tr>th,.table-responsive>.table>thead>tr>td,.table-responsive>.table>thead>tr>th{white-space:nowrap}\n.table-responsive>.table-bordered{border:0}\n.table-responsive>.table-bordered>tbody>tr>td:first-child,.table-responsive>.table-bordered>tbody>tr>th:first-child,.table-responsive>.table-bordered>tfoot>tr>td:first-child,.table-responsive>.table-bordered>tfoot>tr>th:first-child,.table-responsive>.table-bordered>thead>tr>td:first-child,.table-responsive>.table-bordered>thead>tr>th:first-child{border-left:0}\n.table-responsive>.table-bordered>tbody>tr>td:last-child,.table-responsive>.table-bordered>tbody>tr>th:last-child,.table-responsive>.table-bordered>tfoot>tr>td:last-child,.table-responsive>.table-bordered>tfoot>tr>th:last-child,.table-responsive>.table-bordered>thead>tr>td:last-child,.table-responsive>.table-bordered>thead>tr>th:last-child{border-right:0}\n.table-responsive>.table-bordered>tbody>tr:last-child>td,.table-responsive>.table-bordered>tbody>tr:last-child>th,.table-responsive>.table-bordered>tfoot>tr:last-child>td,.table-responsive>.table-bordered>tfoot>tr:last-child>th{border-bottom:0}\n}\nfieldset,legend{padding:0;border:0}\nfieldset{margin:0;min-width:0}\nlegend{display:block;width:100%;margin-bottom:20px;font-size:21px;line-height:inherit;color:#333;border-bottom:1px solid #e5e5e5}\nlabel{display:inline-block;max-width:100%;margin-bottom:5px}\ninput[type=search]{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;-webkit-appearance:none}\ninput[type=checkbox],input[type=radio]{margin:4px 0 0;margin-top:1px\\9;line-height:normal}\n.form-control,output{display:block;font-size:14px;line-height:1.42857143;color:#555}\ninput[type=file]{display:block}\ninput[type=range]{display:block;width:100%}\nselect[multiple],select[size]{height:auto}\ninput[type=file]:focus,input[type=checkbox]:focus,input[type=radio]:focus{outline:-webkit-focus-ring-color auto 5px;outline-offset:-2px}\noutput{padding-top:7px}\n.form-control{width:100%;height:34px;padding:6px 12px;background-color:#fff;border:1px solid #ccc;border-radius:4px;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);box-shadow:inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s;-o-transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s}\n.form-control:focus{border-color:#66afe9;outline:0;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6)}\n.form-control::-moz-placeholder{color:#999;opacity:1}\n.form-control:-ms-input-placeholder{color:#999}\n.form-control::-webkit-input-placeholder{color:#999}\n.has-success .checkbox,.has-success .checkbox-inline,.has-success .control-label,.has-success .form-control-feedback,.has-success .help-block,.has-success .radio,.has-success .radio-inline,.has-success.checkbox label,.has-success.checkbox-inline label,.has-success.radio label,.has-success.radio-inline label{color:#3c763d}\n.form-control::-ms-expand{border:0;background-color:transparent}\n.form-control[disabled],.form-control[readonly],fieldset[disabled] .form-control{background-color:#eee;opacity:1}\n.form-control[disabled],fieldset[disabled] .form-control{cursor:not-allowed}\ntextarea.form-control{height:auto}\n@media screen and (-webkit-min-device-pixel-ratio:0){input[type=date].form-control,input[type=time].form-control,input[type=datetime-local].form-control,input[type=month].form-control{line-height:34px}\n.input-group-sm input[type=date],.input-group-sm input[type=time],.input-group-sm input[type=datetime-local],.input-group-sm input[type=month],input[type=date].input-sm,input[type=time].input-sm,input[type=datetime-local].input-sm,input[type=month].input-sm{line-height:30px}\n.input-group-lg input[type=date],.input-group-lg input[type=time],.input-group-lg input[type=datetime-local],.input-group-lg input[type=month],input[type=date].input-lg,input[type=time].input-lg,input[type=datetime-local].input-lg,input[type=month].input-lg{line-height:46px}\n}\n.form-group{margin-bottom:15px}\n.checkbox,.radio{position:relative;display:block;margin-top:10px;margin-bottom:10px}\n.checkbox label,.radio label{min-height:20px;padding-left:20px;margin-bottom:0;font-weight:400;cursor:pointer}\n.checkbox input[type=checkbox],.checkbox-inline input[type=checkbox],.radio input[type=radio],.radio-inline input[type=radio]{position:absolute;margin-left:-20px;margin-top:4px\\9}\n.checkbox+.checkbox,.radio+.radio{margin-top:-5px}\n.checkbox-inline,.radio-inline{position:relative;display:inline-block;padding-left:20px;margin-bottom:0;vertical-align:middle;font-weight:400;cursor:pointer}\n.checkbox-inline+.checkbox-inline,.radio-inline+.radio-inline{margin-top:0;margin-left:10px}\n.checkbox-inline.disabled,.checkbox.disabled label,.radio-inline.disabled,.radio.disabled label,fieldset[disabled] .checkbox label,fieldset[disabled] .checkbox-inline,fieldset[disabled] .radio label,fieldset[disabled] .radio-inline,fieldset[disabled] input[type=checkbox],fieldset[disabled] input[type=radio],input[type=checkbox].disabled,input[type=checkbox][disabled],input[type=radio].disabled,input[type=radio][disabled]{cursor:not-allowed}\n.form-control-static{padding-top:7px;padding-bottom:7px;margin-bottom:0;min-height:34px}\n.form-control-static.input-lg,.form-control-static.input-sm{padding-left:0;padding-right:0}\n.form-group-sm .form-control,.input-sm{font-size:12px;padding:5px 10px;border-radius:3px}\n.input-sm{height:30px;line-height:1.5}\nselect.input-sm{height:30px;line-height:30px}\nselect[multiple].input-sm,textarea.input-sm{height:auto}\n.form-group-sm .form-control{height:30px;line-height:1.5}\n.form-group-sm select.form-control{height:30px;line-height:30px}\n.form-group-sm select[multiple].form-control,.form-group-sm textarea.form-control{height:auto}\n.form-group-sm .form-control-static{height:30px;min-height:32px;padding:6px 10px;font-size:12px;line-height:1.5}\n.form-group-lg .form-control,.input-lg{font-size:18px;padding:10px 16px;border-radius:6px}\n.input-lg{height:46px;line-height:1.3333333}\nselect.input-lg{height:46px;line-height:46px}\nselect[multiple].input-lg,textarea.input-lg{height:auto}\n.form-group-lg .form-control{height:46px;line-height:1.3333333}\n.form-group-lg select.form-control{height:46px;line-height:46px}\n.form-group-lg select[multiple].form-control,.form-group-lg textarea.form-control{height:auto}\n.form-group-lg .form-control-static{height:46px;min-height:38px;padding:11px 16px;font-size:18px;line-height:1.3333333}\n.has-feedback{position:relative}\n.has-feedback .form-control{padding-right:42.5px}\n.form-control-feedback{position:absolute;top:0;right:0;z-index:2;display:block;width:34px;height:34px;line-height:34px;text-align:center;pointer-events:none}\n.collapsing,.dropdown,.dropup{position:relative}\n.form-group-lg .form-control+.form-control-feedback,.input-group-lg+.form-control-feedback,.input-lg+.form-control-feedback{width:46px;height:46px;line-height:46px}\n.form-group-sm .form-control+.form-control-feedback,.input-group-sm+.form-control-feedback,.input-sm+.form-control-feedback{width:30px;height:30px;line-height:30px}\n.has-success .form-control{border-color:#3c763d;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);box-shadow:inset 0 1px 1px rgba(0,0,0,.075)}\n.has-success .form-control:focus{border-color:#2b542c;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #67b168;box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #67b168}\n.has-success .input-group-addon{color:#3c763d;border-color:#3c763d;background-color:#dff0d8}\n.has-warning .checkbox,.has-warning .checkbox-inline,.has-warning .control-label,.has-warning .form-control-feedback,.has-warning .help-block,.has-warning .radio,.has-warning .radio-inline,.has-warning.checkbox label,.has-warning.checkbox-inline label,.has-warning.radio label,.has-warning.radio-inline label{color:#8a6d3b}\n.has-warning .form-control{border-color:#8a6d3b;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);box-shadow:inset 0 1px 1px rgba(0,0,0,.075)}\n.has-warning .form-control:focus{border-color:#66512c;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #c0a16b;box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #c0a16b}\n.has-warning .input-group-addon{color:#8a6d3b;border-color:#8a6d3b;background-color:#fcf8e3}\n.has-error .checkbox,.has-error .checkbox-inline,.has-error .control-label,.has-error .form-control-feedback,.has-error .help-block,.has-error .radio,.has-error .radio-inline,.has-error.checkbox label,.has-error.checkbox-inline label,.has-error.radio label,.has-error.radio-inline label{color:#a94442}\n.has-error .form-control{border-color:#a94442;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);box-shadow:inset 0 1px 1px rgba(0,0,0,.075)}\n.has-error .form-control:focus{border-color:#843534;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #ce8483;box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #ce8483}\n.has-error .input-group-addon{color:#a94442;border-color:#a94442;background-color:#f2dede}\n.has-feedback label~.form-control-feedback{top:25px}\n.has-feedback label.sr-only~.form-control-feedback{top:0}\n.help-block{display:block;margin-top:5px;margin-bottom:10px;color:#737373}\n@media (min-width:768px){.form-inline .form-control-static,.form-inline .form-group{display:inline-block}\n.form-inline .control-label,.form-inline .form-group{margin-bottom:0;vertical-align:middle}\n.form-inline .form-control{display:inline-block;width:auto;vertical-align:middle}\n.form-inline .input-group{display:inline-table;vertical-align:middle}\n.form-inline .input-group .form-control,.form-inline .input-group .input-group-addon,.form-inline .input-group .input-group-btn{width:auto}\n.form-inline .input-group>.form-control{width:100%}\n.form-inline .checkbox,.form-inline .radio{display:inline-block;margin-top:0;margin-bottom:0;vertical-align:middle}\n.form-inline .checkbox label,.form-inline .radio label{padding-left:0}\n.form-inline .checkbox input[type=checkbox],.form-inline .radio input[type=radio]{position:relative;margin-left:0}\n.form-inline .has-feedback .form-control-feedback{top:0}\n}\n.form-horizontal .checkbox,.form-horizontal .checkbox-inline,.form-horizontal .radio,.form-horizontal .radio-inline{margin-top:0;margin-bottom:0;padding-top:7px}\n.form-horizontal .checkbox,.form-horizontal .radio{min-height:27px}\n.form-horizontal .form-group{margin-left:-15px;margin-right:-15px}\n.form-horizontal .has-feedback .form-control-feedback{right:15px}\n@media (min-width:768px){.form-horizontal .control-label{text-align:right;margin-bottom:0;padding-top:7px}\n.form-horizontal .form-group-lg .control-label{padding-top:11px;font-size:18px}\n.form-horizontal .form-group-sm .control-label{padding-top:6px;font-size:12px}\n}\n.btn{display:inline-block;margin-bottom:0;font-weight:400;vertical-align:middle;touch-action:manipulation;cursor:pointer;border:1px solid transparent;white-space:nowrap;padding:6px 12px;font-size:14px;line-height:1.42857143;border-radius:4px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}\n.btn.active.focus,.btn.active:focus,.btn.focus,.btn:active.focus,.btn:active:focus,.btn:focus{outline:-webkit-focus-ring-color auto 5px;outline-offset:-2px}\n.btn.focus,.btn:focus,.btn:hover{color:#333;text-decoration:none}\n.btn.active,.btn:active{outline:0;-webkit-box-shadow:inset 0 3px 5px rgba(0,0,0,.125);box-shadow:inset 0 3px 5px rgba(0,0,0,.125)}\n.btn.disabled,.btn[disabled],fieldset[disabled] .btn{cursor:not-allowed;opacity:.65;filter:alpha(opacity=65);-webkit-box-shadow:none;box-shadow:none}\na.btn.disabled,fieldset[disabled] a.btn{pointer-events:none}\n.btn-default{color:#333;background-color:#fff;border-color:#ccc}\n.btn-default.focus,.btn-default:focus{color:#333;background-color:#e6e6e6;border-color:#8c8c8c}\n.btn-default.active,.btn-default:active,.btn-default:hover,.open>.dropdown-toggle.btn-default{color:#333;background-color:#e6e6e6;border-color:#adadad}\n.btn-default.active.focus,.btn-default.active:focus,.btn-default.active:hover,.btn-default:active.focus,.btn-default:active:focus,.btn-default:active:hover,.open>.dropdown-toggle.btn-default.focus,.open>.dropdown-toggle.btn-default:focus,.open>.dropdown-toggle.btn-default:hover{color:#333;background-color:#d4d4d4;border-color:#8c8c8c}\n.btn-default.disabled.focus,.btn-default.disabled:focus,.btn-default.disabled:hover,.btn-default[disabled].focus,.btn-default[disabled]:focus,.btn-default[disabled]:hover,fieldset[disabled] .btn-default.focus,fieldset[disabled] .btn-default:focus,fieldset[disabled] .btn-default:hover{background-color:#fff;border-color:#ccc}\n.btn-default .badge{color:#fff;background-color:#333}\n.btn-primary{color:#fff;background-color:#de0000;border-color:#c40000}\n.btn-primary.focus,.btn-primary:focus{color:#fff;background-color:#ab0000;border-color:#450000}\n.btn-primary.active,.btn-primary:active,.btn-primary:hover,.open>.dropdown-toggle.btn-primary{color:#fff;background-color:#ab0000;border-color:#870000}\n.btn-primary.active.focus,.btn-primary.active:focus,.btn-primary.active:hover,.btn-primary:active.focus,.btn-primary:active:focus,.btn-primary:active:hover,.open>.dropdown-toggle.btn-primary.focus,.open>.dropdown-toggle.btn-primary:focus,.open>.dropdown-toggle.btn-primary:hover{color:#fff;background-color:#870000;border-color:#450000}\n.btn-primary.disabled.focus,.btn-primary.disabled:focus,.btn-primary.disabled:hover,.btn-primary[disabled].focus,.btn-primary[disabled]:focus,.btn-primary[disabled]:hover,fieldset[disabled] .btn-primary.focus,fieldset[disabled] .btn-primary:focus,fieldset[disabled] .btn-primary:hover{background-color:#de0000;border-color:#c40000}\n.btn-primary .badge{color:#de0000;background-color:#fff}\n.btn-success{color:#fff;background-color:#5cb85c;border-color:#4cae4c}\n.btn-success.focus,.btn-success:focus{color:#fff;background-color:#449d44;border-color:#255625}\n.btn-success.active,.btn-success:active,.btn-success:hover,.open>.dropdown-toggle.btn-success{color:#fff;background-color:#449d44;border-color:#398439}\n.btn-success.active.focus,.btn-success.active:focus,.btn-success.active:hover,.btn-success:active.focus,.btn-success:active:focus,.btn-success:active:hover,.open>.dropdown-toggle.btn-success.focus,.open>.dropdown-toggle.btn-success:focus,.open>.dropdown-toggle.btn-success:hover{color:#fff;background-color:#398439;border-color:#255625}\n.btn-success.active,.btn-success:active,.open>.dropdown-toggle.btn-success{background-image:none}\n.btn-success.disabled.focus,.btn-success.disabled:focus,.btn-success.disabled:hover,.btn-success[disabled].focus,.btn-success[disabled]:focus,.btn-success[disabled]:hover,fieldset[disabled] .btn-success.focus,fieldset[disabled] .btn-success:focus,fieldset[disabled] .btn-success:hover{background-color:#5cb85c;border-color:#4cae4c}\n.btn-success .badge{color:#5cb85c;background-color:#fff}\n.btn-info{color:#fff;background-color:#5bc0de;border-color:#46b8da}\n.btn-info.focus,.btn-info:focus{color:#fff;background-color:#31b0d5;border-color:#1b6d85}\n.btn-info.active,.btn-info:active,.btn-info:hover,.open>.dropdown-toggle.btn-info{color:#fff;background-color:#31b0d5;border-color:#269abc}\n.btn-info.active.focus,.btn-info.active:focus,.btn-info.active:hover,.btn-info:active.focus,.btn-info:active:focus,.btn-info:active:hover,.open>.dropdown-toggle.btn-info.focus,.open>.dropdown-toggle.btn-info:focus,.open>.dropdown-toggle.btn-info:hover{color:#fff;background-color:#269abc;border-color:#1b6d85}\n.btn-info.disabled.focus,.btn-info.disabled:focus,.btn-info.disabled:hover,.btn-info[disabled].focus,.btn-info[disabled]:focus,.btn-info[disabled]:hover,fieldset[disabled] .btn-info.focus,fieldset[disabled] .btn-info:focus,fieldset[disabled] .btn-info:hover{background-color:#5bc0de;border-color:#46b8da}\n.btn-info .badge{color:#5bc0de;background-color:#fff}\n.btn-warning{color:#fff;background-color:#f0ad4e;border-color:#eea236}\n.btn-warning.focus,.btn-warning:focus{color:#fff;background-color:#ec971f;border-color:#985f0d}\n.btn-warning.active,.btn-warning:active,.btn-warning:hover,.open>.dropdown-toggle.btn-warning{color:#fff;background-color:#ec971f;border-color:#d58512}\n.btn-warning.active.focus,.btn-warning.active:focus,.btn-warning.active:hover,.btn-warning:active.focus,.btn-warning:active:focus,.btn-warning:active:hover,.open>.dropdown-toggle.btn-warning.focus,.open>.dropdown-toggle.btn-warning:focus,.open>.dropdown-toggle.btn-warning:hover{color:#fff;background-color:#d58512;border-color:#985f0d}\n.btn-warning.disabled.focus,.btn-warning.disabled:focus,.btn-warning.disabled:hover,.btn-warning[disabled].focus,.btn-warning[disabled]:focus,.btn-warning[disabled]:hover,fieldset[disabled] .btn-warning.focus,fieldset[disabled] .btn-warning:focus,fieldset[disabled] .btn-warning:hover{background-color:#f0ad4e;border-color:#eea236}\n.btn-warning .badge{color:#f0ad4e;background-color:#fff}\n.btn-danger{color:#fff;background-color:#d9534f;border-color:#d43f3a}\n.btn-danger.focus,.btn-danger:focus{color:#fff;background-color:#c9302c;border-color:#761c19}\n.btn-danger.active,.btn-danger:active,.btn-danger:hover,.open>.dropdown-toggle.btn-danger{color:#fff;background-color:#c9302c;border-color:#ac2925}\n.btn-danger.active.focus,.btn-danger.active:focus,.btn-danger.active:hover,.btn-danger:active.focus,.btn-danger:active:focus,.btn-danger:active:hover,.open>.dropdown-toggle.btn-danger.focus,.open>.dropdown-toggle.btn-danger:focus,.open>.dropdown-toggle.btn-danger:hover{color:#fff;background-color:#ac2925;border-color:#761c19}\n.btn-danger.disabled.focus,.btn-danger.disabled:focus,.btn-danger.disabled:hover,.btn-danger[disabled].focus,.btn-danger[disabled]:focus,.btn-danger[disabled]:hover,fieldset[disabled] .btn-danger.focus,fieldset[disabled] .btn-danger:focus,fieldset[disabled] .btn-danger:hover{background-color:#d9534f;border-color:#d43f3a}\n.btn-danger .badge{color:#d9534f;background-color:#fff}\n.btn-link{color:#de0000;font-weight:400;border-radius:0}\n.btn-link,.btn-link.active,.btn-link:active,.btn-link[disabled],fieldset[disabled] .btn-link{background-color:transparent;-webkit-box-shadow:none;box-shadow:none}\n.btn-link,.btn-link:active,.btn-link:focus,.btn-link:hover{border-color:transparent}\n.btn-link:focus,.btn-link:hover{color:#910000;text-decoration:underline;background-color:transparent}\n.btn-link[disabled]:focus,.btn-link[disabled]:hover,fieldset[disabled] .btn-link:focus,fieldset[disabled] .btn-link:hover{color:#777;text-decoration:none}\n.btn-group-lg>.btn,.btn-lg{padding:10px 16px;font-size:18px;line-height:1.3333333;border-radius:6px}\n.btn-group-sm>.btn,.btn-sm{padding:5px 10px;font-size:12px;line-height:1.5;border-radius:3px}\n.btn-group-xs>.btn,.btn-xs{padding:1px 5px;font-size:12px;line-height:1.5;border-radius:3px}\n.btn-block{display:block;width:100%}\n.btn-block+.btn-block{margin-top:5px}\ninput[type=button].btn-block,input[type=reset].btn-block,input[type=submit].btn-block{width:100%}\n.fade{opacity:0;-webkit-transition:opacity .15s linear;-o-transition:opacity .15s linear;transition:opacity .15s linear}\n.fade.in{opacity:1}\n.collapse{display:none}\n.collapse.in{display:block}\ntr.collapse.in{display:table-row}\ntbody.collapse.in{display:table-row-group}\n.collapsing{height:0;overflow:hidden;-webkit-transition-property:height,visibility;transition-property:height,visibility;-webkit-transition-duration:.35s;transition-duration:.35s;-webkit-transition-timing-function:ease;transition-timing-function:ease}\n.caret{display:inline-block;width:0;height:0;margin-left:2px;vertical-align:middle;border-top:4px dashed;border-top:4px solid\\9;border-right:4px solid transparent;border-left:4px solid transparent}\n.dropdown-toggle:focus{outline:0}\n.dropdown-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;min-width:160px;padding:5px 0;margin:2px 0 0;list-style:none;font-size:14px;text-align:left;background-color:#fff;border:1px solid #ccc;border:1px solid rgba(0,0,0,.15);border-radius:4px;-webkit-box-shadow:0 6px 12px rgba(0,0,0,.175);box-shadow:0 6px 12px rgba(0,0,0,.175);background-clip:padding-box}\n.btn-group>.btn-group:first-child:not(:last-child)>.btn:last-child,.btn-group>.btn-group:first-child:not(:last-child)>.dropdown-toggle,.btn-group>.btn:first-child:not(:last-child):not(.dropdown-toggle){border-bottom-right-radius:0;border-top-right-radius:0}\n.btn-group>.btn-group:last-child:not(:first-child)>.btn:first-child,.btn-group>.btn:last-child:not(:first-child),.btn-group>.dropdown-toggle:not(:first-child){border-bottom-left-radius:0;border-top-left-radius:0}\n.btn-group-vertical>.btn:not(:first-child):not(:last-child),.btn-group>.btn-group:not(:first-child):not(:last-child)>.btn,.btn-group>.btn:not(:first-child):not(:last-child):not(.dropdown-toggle){border-radius:0}\n.dropdown-header,.dropdown-menu>li>a{white-space:nowrap;padding:3px 20px;line-height:1.42857143}\n.dropdown-menu-right,.dropdown-menu.pull-right{left:auto;right:0}\n.dropdown-menu .divider{height:1px;margin:9px 0;overflow:hidden;background-color:#e5e5e5}\n.dropdown-menu>li>a{display:block;clear:both;font-weight:400;color:#333}\n.dropdown-menu>li>a:focus,.dropdown-menu>li>a:hover{text-decoration:none;color:#262626;background-color:#f5f5f5}\n.dropdown-menu>.active>a,.dropdown-menu>.active>a:focus,.dropdown-menu>.active>a:hover{color:#fff;text-decoration:none;outline:0;background-color:#de0000}\n.dropdown-menu>.disabled>a,.dropdown-menu>.disabled>a:focus,.dropdown-menu>.disabled>a:hover{color:#777}\n.dropdown-menu>.disabled>a:focus,.dropdown-menu>.disabled>a:hover{text-decoration:none;background-color:transparent;filter:progid:DXImageTransform.Microsoft.gradient(enabled=false);cursor:not-allowed}\n.open>.dropdown-menu{display:block}\n.open>a{outline:0}\n.dropdown-menu-left{left:0;right:auto}\n.dropdown-header{display:block;font-size:12px;color:#777}\n.dropdown-backdrop{position:fixed;left:0;right:0;bottom:0;top:0;z-index:990}\n.nav-justified>.dropdown .dropdown-menu,.nav-tabs.nav-justified>.dropdown .dropdown-menu{left:auto;top:auto}\n.pull-right>.dropdown-menu{right:0;left:auto}\n.dropup .caret,.navbar-fixed-bottom .dropdown .caret{border-top:0;border-bottom:4px dashed;border-bottom:4px solid\\9;content:\"\"}\n.dropup .dropdown-menu,.navbar-fixed-bottom .dropdown .dropdown-menu{top:auto;bottom:100%;margin-bottom:2px}\n@media (min-width:768px){.navbar-right .dropdown-menu{left:auto;right:0}\n.navbar-right .dropdown-menu-left{left:0;right:auto}\n}\n.btn-group,.btn-group-vertical{position:relative;display:inline-block;vertical-align:middle}\n.btn-group-vertical>.btn,.btn-group>.btn{position:relative;float:left}\n.btn-group-vertical>.btn.active,.btn-group-vertical>.btn:active,.btn-group-vertical>.btn:focus,.btn-group-vertical>.btn:hover,.btn-group>.btn.active,.btn-group>.btn:active,.btn-group>.btn:focus,.btn-group>.btn:hover{z-index:2}\n.btn-group .btn+.btn,.btn-group .btn+.btn-group,.btn-group .btn-group+.btn,.btn-group .btn-group+.btn-group{margin-left:-1px}\n.btn-toolbar{margin-left:-5px}\n.btn-toolbar>.btn,.btn-toolbar>.btn-group,.btn-toolbar>.input-group{margin-left:5px}\n.btn .caret,.btn-group>.btn:first-child{margin-left:0}\n.btn-group .dropdown-toggle:active,.btn-group.open .dropdown-toggle{outline:0}\n.btn-group>.btn+.dropdown-toggle{padding-left:8px;padding-right:8px}\n.btn-group>.btn-lg+.dropdown-toggle{padding-left:12px;padding-right:12px}\n.btn-group.open .dropdown-toggle{-webkit-box-shadow:inset 0 3px 5px rgba(0,0,0,.125);box-shadow:inset 0 3px 5px rgba(0,0,0,.125)}\n.btn-group.open .dropdown-toggle.btn-link{-webkit-box-shadow:none;box-shadow:none}\n.btn-lg .caret{border-width:5px 5px 0}\n.dropup .btn-lg .caret{border-width:0 5px 5px}\n.btn-group-vertical>.btn,.btn-group-vertical>.btn-group,.btn-group-vertical>.btn-group>.btn{display:block;float:none;width:100%;max-width:100%}\n.media-object.img-thumbnail,.nav>li>a>img{max-width:none}\n.btn-group-vertical>.btn-group>.btn{float:none}\n.btn-group-vertical>.btn+.btn,.btn-group-vertical>.btn+.btn-group,.btn-group-vertical>.btn-group+.btn,.btn-group-vertical>.btn-group+.btn-group{margin-top:-1px;margin-left:0}\n.btn-group-vertical>.btn:first-child:not(:last-child){border-radius:4px 4px 0 0}\n.btn-group-vertical>.btn:last-child:not(:first-child){border-radius:0 0 4px 4px}\n.btn-group-vertical>.btn-group:not(:first-child):not(:last-child)>.btn{border-radius:0}\n.btn-group-vertical>.btn-group:first-child:not(:last-child)>.btn:last-child,.btn-group-vertical>.btn-group:first-child:not(:last-child)>.dropdown-toggle{border-bottom-right-radius:0;border-bottom-left-radius:0}\n.btn-group-vertical>.btn-group:last-child:not(:first-child)>.btn:first-child{border-top-right-radius:0;border-top-left-radius:0}\n.btn-group-justified{display:table;width:100%;table-layout:fixed;border-collapse:separate}\n.btn-group-justified>.btn,.btn-group-justified>.btn-group{float:none;display:table-cell;width:1%}\n.btn-group-justified>.btn-group .btn{width:100%}\n.btn-group-justified>.btn-group .dropdown-menu{left:auto}\n[data-toggle=buttons]>.btn input[type=checkbox],[data-toggle=buttons]>.btn input[type=radio],[data-toggle=buttons]>.btn-group>.btn input[type=checkbox],[data-toggle=buttons]>.btn-group>.btn input[type=radio]{position:absolute;clip:rect(0,0,0,0);pointer-events:none}\n.input-group{position:relative;display:table;border-collapse:separate}\n.input-group[class*=col-]{float:none;padding-left:0;padding-right:0}\n.input-group .form-control{position:relative;z-index:2;float:left;width:100%;margin-bottom:0}\n.input-group .form-control:focus{z-index:3}\n.input-group-lg>.form-control,.input-group-lg>.input-group-addon,.input-group-lg>.input-group-btn>.btn{height:46px;padding:10px 16px;font-size:18px;line-height:1.3333333;border-radius:6px}\nselect.input-group-lg>.form-control,select.input-group-lg>.input-group-addon,select.input-group-lg>.input-group-btn>.btn{height:46px;line-height:46px}\nselect[multiple].input-group-lg>.form-control,select[multiple].input-group-lg>.input-group-addon,select[multiple].input-group-lg>.input-group-btn>.btn,textarea.input-group-lg>.form-control,textarea.input-group-lg>.input-group-addon,textarea.input-group-lg>.input-group-btn>.btn{height:auto}\n.input-group-sm>.form-control,.input-group-sm>.input-group-addon,.input-group-sm>.input-group-btn>.btn{height:30px;padding:5px 10px;font-size:12px;line-height:1.5;border-radius:3px}\nselect.input-group-sm>.form-control,select.input-group-sm>.input-group-addon,select.input-group-sm>.input-group-btn>.btn{height:30px;line-height:30px}\nselect[multiple].input-group-sm>.form-control,select[multiple].input-group-sm>.input-group-addon,select[multiple].input-group-sm>.input-group-btn>.btn,textarea.input-group-sm>.form-control,textarea.input-group-sm>.input-group-addon,textarea.input-group-sm>.input-group-btn>.btn{height:auto}\n.input-group .form-control,.input-group-addon,.input-group-btn{display:table-cell}\n.nav>li,.nav>li>a{position:relative;display:block}\n.input-group .form-control:not(:first-child):not(:last-child),.input-group-addon:not(:first-child):not(:last-child),.input-group-btn:not(:first-child):not(:last-child){border-radius:0}\n.input-group-addon,.input-group-btn{width:1%;white-space:nowrap;vertical-align:middle}\n.input-group-addon{padding:6px 12px;font-size:14px;font-weight:400;line-height:1;color:#555;text-align:center;background-color:#eee;border:1px solid #ccc;border-radius:4px}\n.input-group-addon.input-sm{padding:5px 10px;font-size:12px;border-radius:3px}\n.input-group-addon.input-lg{padding:10px 16px;font-size:18px;border-radius:6px}\n.input-group-addon input[type=checkbox],.input-group-addon input[type=radio]{margin-top:0}\n.input-group .form-control:first-child,.input-group-addon:first-child,.input-group-btn:first-child>.btn,.input-group-btn:first-child>.btn-group>.btn,.input-group-btn:first-child>.dropdown-toggle,.input-group-btn:last-child>.btn-group:not(:last-child)>.btn,.input-group-btn:last-child>.btn:not(:last-child):not(.dropdown-toggle){border-bottom-right-radius:0;border-top-right-radius:0}\n.input-group-addon:first-child{border-right:0}\n.input-group .form-control:last-child,.input-group-addon:last-child,.input-group-btn:first-child>.btn-group:not(:first-child)>.btn,.input-group-btn:first-child>.btn:not(:first-child),.input-group-btn:last-child>.btn,.input-group-btn:last-child>.btn-group>.btn,.input-group-btn:last-child>.dropdown-toggle{border-bottom-left-radius:0;border-top-left-radius:0}\n.input-group-addon:last-child{border-left:0}\n.input-group-btn{position:relative;font-size:0;white-space:nowrap}\n.input-group-btn>.btn{position:relative}\n.input-group-btn>.btn+.btn{margin-left:-1px}\n.input-group-btn>.btn:active,.input-group-btn>.btn:focus,.input-group-btn>.btn:hover{z-index:2}\n.input-group-btn:first-child>.btn,.input-group-btn:first-child>.btn-group{margin-right:-1px}\n.input-group-btn:last-child>.btn,.input-group-btn:last-child>.btn-group{z-index:2;margin-left:-1px}\n.nav{margin-bottom:0;padding-left:0;list-style:none}\n.nav>li>a{padding:10px 15px}\n.nav>li>a:focus,.nav>li>a:hover{text-decoration:none;background-color:#eee}\n.nav>li.disabled>a{color:#777}\n.nav>li.disabled>a:focus,.nav>li.disabled>a:hover{color:#777;text-decoration:none;background-color:transparent;cursor:not-allowed}\n.nav .open>a,.nav .open>a:focus,.nav .open>a:hover{background-color:#eee;border-color:#de0000}\n.nav .nav-divider{height:1px;margin:9px 0;overflow:hidden;background-color:#e5e5e5}\n.nav-tabs{border-bottom:1px solid #ddd}\n.nav-tabs>li{float:left;margin-bottom:-1px}\n.nav-tabs>li>a{margin-right:2px;line-height:1.42857143;border:1px solid transparent;border-radius:4px 4px 0 0}\n.nav-tabs>li>a:hover{border-color:#eee #eee #ddd}\n.nav-tabs>li.active>a,.nav-tabs>li.active>a:focus,.nav-tabs>li.active>a:hover{color:#555;background-color:#fff;border:1px solid #ddd;border-bottom-color:transparent;cursor:default}\n.nav-tabs.nav-justified{width:100%;border-bottom:0}\n.nav-tabs.nav-justified>li{float:none}\n.nav-tabs.nav-justified>li>a{text-align:center;margin-bottom:5px;margin-right:0;border-radius:4px}\n.nav-tabs.nav-justified>.active>a,.nav-tabs.nav-justified>.active>a:focus,.nav-tabs.nav-justified>.active>a:hover{border:1px solid #ddd}\n@media (min-width:768px){.nav-tabs.nav-justified>li{display:table-cell;width:1%}\n.nav-tabs.nav-justified>li>a{margin-bottom:0;border-bottom:1px solid #ddd;border-radius:4px 4px 0 0}\n.nav-tabs.nav-justified>.active>a,.nav-tabs.nav-justified>.active>a:focus,.nav-tabs.nav-justified>.active>a:hover{border-bottom-color:#fff}\n}\n.nav-pills>li{float:left}\n.nav-justified>li,.nav-stacked>li{float:none}\n.nav-pills>li>a{border-radius:4px}\n.nav-pills>li+li{margin-left:2px}\n.nav-pills>li.active>a,.nav-pills>li.active>a:focus,.nav-pills>li.active>a:hover{color:#fff;background-color:#de0000}\n.nav-stacked>li+li{margin-top:2px;margin-left:0}\n.nav-justified{width:100%}\n.nav-justified>li>a{text-align:center;margin-bottom:5px}\n.nav-tabs-justified{border-bottom:0}\n.nav-tabs-justified>li>a{margin-right:0;border-radius:4px}\n.nav-tabs-justified>.active>a,.nav-tabs-justified>.active>a:focus,.nav-tabs-justified>.active>a:hover{border:1px solid #ddd}\n@media (min-width:768px){.nav-justified>li{display:table-cell;width:1%}\n.nav-justified>li>a{margin-bottom:0}\n.nav-tabs-justified>li>a{border-bottom:1px solid #ddd;border-radius:4px 4px 0 0}\n.nav-tabs-justified>.active>a,.nav-tabs-justified>.active>a:focus,.nav-tabs-justified>.active>a:hover{border-bottom-color:#fff}\n}\n.tab-content>.tab-pane{display:none}\n.tab-content>.active{display:block}\n.nav-tabs .dropdown-menu{margin-top:-1px;border-top-right-radius:0;border-top-left-radius:0}\n.navbar{position:relative;min-height:50px;margin-bottom:20px;border:1px solid transparent}\n.navbar-collapse{overflow-x:visible;padding-right:15px;padding-left:15px;border-top:1px solid transparent;box-shadow:inset 0 1px 0 rgba(255,255,255,.1);-webkit-overflow-scrolling:touch}\n.navbar-collapse.in{overflow-y:auto}\n@media (min-width:768px){.navbar{border-radius:4px}\n.navbar-header{float:left}\n.navbar-collapse{width:auto;border-top:0;box-shadow:none}\n.navbar-collapse.collapse{display:block!important;height:auto!important;padding-bottom:0;overflow:visible!important}\n.navbar-collapse.in{overflow-y:visible}\n.navbar-fixed-bottom .navbar-collapse,.navbar-fixed-top .navbar-collapse,.navbar-static-top .navbar-collapse{padding-left:0;padding-right:0}\n}\n.carousel-inner,.embed-responsive,.modal,.modal-open,.progress{overflow:hidden}\n@media (max-device-width:480px) and (orientation:landscape){.navbar-fixed-bottom .navbar-collapse,.navbar-fixed-top .navbar-collapse{max-height:200px}\n}\n.container-fluid>.navbar-collapse,.container-fluid>.navbar-header,.container>.navbar-collapse,.container>.navbar-header{margin-right:-15px;margin-left:-15px}\n.navbar-static-top{z-index:1000;border-width:0 0 1px}\n.navbar-fixed-bottom,.navbar-fixed-top{position:fixed;right:0;left:0;z-index:1030}\n.navbar-fixed-top{top:0;border-width:0 0 1px}\n.navbar-fixed-bottom{bottom:0;margin-bottom:0;border-width:1px 0 0}\n.navbar-brand{float:left;padding:15px;font-size:18px;line-height:20px;height:50px}\n.navbar-brand:focus,.navbar-brand:hover{text-decoration:none}\n.navbar-brand>img{display:block}\n@media (min-width:768px){.container-fluid>.navbar-collapse,.container-fluid>.navbar-header,.container>.navbar-collapse,.container>.navbar-header{margin-right:0;margin-left:0}\n.navbar-fixed-bottom,.navbar-fixed-top,.navbar-static-top{border-radius:0}\n.navbar>.container .navbar-brand,.navbar>.container-fluid .navbar-brand{margin-left:-15px}\n}\n.navbar-toggle{position:relative;float:right;margin-right:15px;padding:9px 10px;margin-top:8px;margin-bottom:8px;background-color:transparent;border:1px solid transparent;border-radius:4px}\n.navbar-toggle:focus{outline:0}\n.navbar-toggle .icon-bar{display:block;width:22px;height:2px;border-radius:1px}\n.navbar-toggle .icon-bar+.icon-bar{margin-top:4px}\n.navbar-nav{margin:7.5px -15px}\n.navbar-nav>li>a{padding-top:10px;padding-bottom:10px;line-height:20px}\n@media (max-width:767px){.navbar-nav .open .dropdown-menu{position:static;float:none;width:auto;margin-top:0;background-color:transparent;border:0;box-shadow:none}\n.navbar-nav .open .dropdown-menu .dropdown-header,.navbar-nav .open .dropdown-menu>li>a{padding:5px 15px 5px 25px}\n.navbar-nav .open .dropdown-menu>li>a{line-height:20px}\n.navbar-nav .open .dropdown-menu>li>a:focus,.navbar-nav .open .dropdown-menu>li>a:hover{background-image:none}\n}\n.progress-bar-striped,.progress-striped .progress-bar,.progress-striped .progress-bar-danger,.progress-striped .progress-bar-info,.progress-striped .progress-bar-success,.progress-striped .progress-bar-warning{background-image:-webkit-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)}\n@media (min-width:768px){.navbar-toggle{display:none}\n.navbar-nav{float:left;margin:0}\n.navbar-nav>li{float:left}\n.navbar-nav>li>a{padding-top:15px;padding-bottom:15px}\n}\n.navbar-form{padding:10px 15px;border-top:1px solid transparent;border-bottom:1px solid transparent;-webkit-box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 1px 0 rgba(255,255,255,.1);box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 1px 0 rgba(255,255,255,.1);margin:8px -15px}\n@media (min-width:768px){.navbar-form .form-control-static,.navbar-form .form-group{display:inline-block}\n.navbar-form .control-label,.navbar-form .form-group{margin-bottom:0;vertical-align:middle}\n.navbar-form .form-control{display:inline-block;width:auto;vertical-align:middle}\n.navbar-form .input-group{display:inline-table;vertical-align:middle}\n.navbar-form .input-group .form-control,.navbar-form .input-group .input-group-addon,.navbar-form .input-group .input-group-btn{width:auto}\n.navbar-form .input-group>.form-control{width:100%}\n.navbar-form .checkbox,.navbar-form .radio{display:inline-block;margin-top:0;margin-bottom:0;vertical-align:middle}\n.navbar-form .checkbox label,.navbar-form .radio label{padding-left:0}\n.navbar-form .checkbox input[type=checkbox],.navbar-form .radio input[type=radio]{position:relative;margin-left:0}\n.navbar-form .has-feedback .form-control-feedback{top:0}\n}\n.btn .badge,.btn .label{position:relative;top:-1px}\n.breadcrumb>li,.pagination{display:inline-block}\n@media (max-width:767px){.navbar-form .form-group{margin-bottom:5px}\n.navbar-form .form-group:last-child{margin-bottom:0}\n}\n@media (min-width:768px){.navbar-form{width:auto;border:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;-webkit-box-shadow:none;box-shadow:none}\n}\n.navbar-nav>li>.dropdown-menu{margin-top:0;border-top-right-radius:0;border-top-left-radius:0}\n.navbar-fixed-bottom .navbar-nav>li>.dropdown-menu{margin-bottom:0;border-radius:4px 4px 0 0}\n.navbar-btn{margin-top:8px;margin-bottom:8px}\n.navbar-btn.btn-sm{margin-top:10px;margin-bottom:10px}\n.navbar-btn.btn-xs{margin-top:14px;margin-bottom:14px}\n.navbar-text{margin-top:15px;margin-bottom:15px}\n@media (min-width:768px){.navbar-text{float:left;margin-left:15px;margin-right:15px}\n.navbar-left{float:left!important}\n.navbar-right{float:right!important;margin-right:-15px}\n.navbar-right~.navbar-right{margin-right:0}\n}\n.navbar-default{background-color:#f8f8f8;border-color:#e7e7e7}\n.navbar-default .navbar-brand{color:#777}\n.navbar-default .navbar-brand:focus,.navbar-default .navbar-brand:hover{color:#5e5e5e;background-color:transparent}\n.navbar-default .navbar-nav>li>a,.navbar-default .navbar-text{color:#777}\n.navbar-default .navbar-nav>li>a:focus,.navbar-default .navbar-nav>li>a:hover{color:#333;background-color:transparent}\n.navbar-default .navbar-nav>.active>a,.navbar-default .navbar-nav>.active>a:focus,.navbar-default .navbar-nav>.active>a:hover{color:#555;background-color:#e7e7e7}\n.navbar-default .navbar-nav>.disabled>a,.navbar-default .navbar-nav>.disabled>a:focus,.navbar-default .navbar-nav>.disabled>a:hover{color:#ccc;background-color:transparent}\n.navbar-default .navbar-toggle{border-color:#ddd}\n.navbar-default .navbar-toggle:focus,.navbar-default .navbar-toggle:hover{background-color:#ddd}\n.navbar-default .navbar-toggle .icon-bar{background-color:#888}\n.navbar-default .navbar-collapse,.navbar-default .navbar-form{border-color:#e7e7e7}\n.navbar-default .navbar-nav>.open>a,.navbar-default .navbar-nav>.open>a:focus,.navbar-default .navbar-nav>.open>a:hover{background-color:#e7e7e7;color:#555}\n@media (max-width:767px){.navbar-default .navbar-nav .open .dropdown-menu>li>a{color:#777}\n.navbar-default .navbar-nav .open .dropdown-menu>li>a:focus,.navbar-default .navbar-nav .open .dropdown-menu>li>a:hover{color:#333;background-color:transparent}\n.navbar-default .navbar-nav .open .dropdown-menu>.active>a,.navbar-default .navbar-nav .open .dropdown-menu>.active>a:focus,.navbar-default .navbar-nav .open .dropdown-menu>.active>a:hover{color:#555;background-color:#e7e7e7}\n.navbar-default .navbar-nav .open .dropdown-menu>.disabled>a,.navbar-default .navbar-nav .open .dropdown-menu>.disabled>a:focus,.navbar-default .navbar-nav .open .dropdown-menu>.disabled>a:hover{color:#ccc;background-color:transparent}\n}\n.navbar-default .navbar-link{color:#777}\n.navbar-default .navbar-link:hover{color:#333}\n.navbar-default .btn-link{color:#777}\n.navbar-default .btn-link:focus,.navbar-default .btn-link:hover{color:#333}\n.navbar-default .btn-link[disabled]:focus,.navbar-default .btn-link[disabled]:hover,fieldset[disabled] .navbar-default .btn-link:focus,fieldset[disabled] .navbar-default .btn-link:hover{color:#ccc}\n.navbar-inverse{background-color:#222;border-color:#080808}\n.navbar-inverse .navbar-brand{color:#9d9d9d}\n.navbar-inverse .navbar-brand:focus,.navbar-inverse .navbar-brand:hover{color:#fff;background-color:transparent}\n.navbar-inverse .navbar-nav>li>a,.navbar-inverse .navbar-text{color:#9d9d9d}\n.navbar-inverse .navbar-nav>li>a:focus,.navbar-inverse .navbar-nav>li>a:hover{color:#fff;background-color:transparent}\n.navbar-inverse .navbar-nav>.active>a,.navbar-inverse .navbar-nav>.active>a:focus,.navbar-inverse .navbar-nav>.active>a:hover{color:#fff;background-color:#080808}\n.navbar-inverse .navbar-nav>.disabled>a,.navbar-inverse .navbar-nav>.disabled>a:focus,.navbar-inverse .navbar-nav>.disabled>a:hover{color:#444;background-color:transparent}\n.navbar-inverse .navbar-toggle{border-color:#333}\n.navbar-inverse .navbar-toggle:focus,.navbar-inverse .navbar-toggle:hover{background-color:#333}\n.navbar-inverse .navbar-toggle .icon-bar{background-color:#fff}\n.navbar-inverse .navbar-collapse,.navbar-inverse .navbar-form{border-color:#101010}\n.navbar-inverse .navbar-nav>.open>a,.navbar-inverse .navbar-nav>.open>a:focus,.navbar-inverse .navbar-nav>.open>a:hover{background-color:#080808;color:#fff}\n@media (max-width:767px){.navbar-inverse .navbar-nav .open .dropdown-menu>.dropdown-header{border-color:#080808}\n.navbar-inverse .navbar-nav .open .dropdown-menu .divider{background-color:#080808}\n.navbar-inverse .navbar-nav .open .dropdown-menu>li>a{color:#9d9d9d}\n.navbar-inverse .navbar-nav .open .dropdown-menu>li>a:focus,.navbar-inverse .navbar-nav .open .dropdown-menu>li>a:hover{color:#fff;background-color:transparent}\n.navbar-inverse .navbar-nav .open .dropdown-menu>.active>a,.navbar-inverse .navbar-nav .open .dropdown-menu>.active>a:focus,.navbar-inverse .navbar-nav .open .dropdown-menu>.active>a:hover{color:#fff;background-color:#080808}\n.navbar-inverse .navbar-nav .open .dropdown-menu>.disabled>a,.navbar-inverse .navbar-nav .open .dropdown-menu>.disabled>a:focus,.navbar-inverse .navbar-nav .open .dropdown-menu>.disabled>a:hover{color:#444;background-color:transparent}\n}\n.navbar-inverse .navbar-link{color:#9d9d9d}\n.navbar-inverse .navbar-link:hover{color:#fff}\n.navbar-inverse .btn-link{color:#9d9d9d}\n.navbar-inverse .btn-link:focus,.navbar-inverse .btn-link:hover{color:#fff}\n.navbar-inverse .btn-link[disabled]:focus,.navbar-inverse .btn-link[disabled]:hover,fieldset[disabled] .navbar-inverse .btn-link:focus,fieldset[disabled] .navbar-inverse .btn-link:hover{color:#444}\n.breadcrumb{padding:8px 15px;margin-bottom:20px;list-style:none;background-color:#f5f5f5;border-radius:4px}\n.breadcrumb>li+li:before{content:\"/\\00a0\";padding:0 5px;color:#ccc}\n.breadcrumb>.active{color:#777}\n.pagination{padding-left:0;margin:20px 0;border-radius:4px}\n.pager li,.pagination>li{display:inline}\n.pagination>li>a,.pagination>li>span{position:relative;float:left;padding:6px 12px;line-height:1.42857143;text-decoration:none;color:#de0000;background-color:#fff;border:1px solid #ddd;margin-left:-1px}\n.pagination>li:first-child>a,.pagination>li:first-child>span{margin-left:0;border-bottom-left-radius:4px;border-top-left-radius:4px}\n.pagination>li:last-child>a,.pagination>li:last-child>span{border-bottom-right-radius:4px;border-top-right-radius:4px}\n.pagination>li>a:focus,.pagination>li>a:hover,.pagination>li>span:focus,.pagination>li>span:hover{z-index:2;color:#910000;background-color:#eee;border-color:#ddd}\n.pagination>.active>a,.pagination>.active>a:focus,.pagination>.active>a:hover,.pagination>.active>span,.pagination>.active>span:focus,.pagination>.active>span:hover{z-index:3;color:#fff;background-color:#de0000;border-color:#de0000;cursor:default}\n.pagination>.disabled>a,.pagination>.disabled>a:focus,.pagination>.disabled>a:hover,.pagination>.disabled>span,.pagination>.disabled>span:focus,.pagination>.disabled>span:hover{color:#777;background-color:#fff;border-color:#ddd;cursor:not-allowed}\n.pagination-lg>li>a,.pagination-lg>li>span{padding:10px 16px;font-size:18px;line-height:1.3333333}\n.pagination-lg>li:first-child>a,.pagination-lg>li:first-child>span{border-bottom-left-radius:6px;border-top-left-radius:6px}\n.pagination-lg>li:last-child>a,.pagination-lg>li:last-child>span{border-bottom-right-radius:6px;border-top-right-radius:6px}\n.pagination-sm>li>a,.pagination-sm>li>span{padding:5px 10px;font-size:12px;line-height:1.5}\n.badge,.label{text-align:center;font-weight:700;line-height:1;white-space:nowrap}\n.pagination-sm>li:first-child>a,.pagination-sm>li:first-child>span{border-bottom-left-radius:3px;border-top-left-radius:3px}\n.pagination-sm>li:last-child>a,.pagination-sm>li:last-child>span{border-bottom-right-radius:3px;border-top-right-radius:3px}\n.pager{padding-left:0;margin:20px 0;list-style:none;text-align:center}\n.pager li>a,.pager li>span{display:inline-block;padding:5px 14px;background-color:#fff;border:1px solid #ddd;border-radius:15px}\n.pager li>a:focus,.pager li>a:hover{text-decoration:none;background-color:#eee}\n.pager .next>a,.pager .next>span{float:right}\n.pager .previous>a,.pager .previous>span{float:left}\n.pager .disabled>a,.pager .disabled>a:focus,.pager .disabled>a:hover,.pager .disabled>span{color:#777;background-color:#fff;cursor:not-allowed}\n.label{display:inline;padding:.2em .6em .3em;font-size:75%;color:#fff;border-radius:.25em}\na.label:focus,a.label:hover{color:#fff;text-decoration:none;cursor:pointer}\n.label:empty{display:none}\n.label-default{background-color:#777}\n.label-default[href]:focus,.label-default[href]:hover{background-color:#5e5e5e}\n.label-primary{background-color:#de0000}\n.label-primary[href]:focus,.label-primary[href]:hover{background-color:#ab0000}\n.label-success{background-color:#5cb85c}\n.label-success[href]:focus,.label-success[href]:hover{background-color:#449d44}\n.label-info{background-color:#5bc0de}\n.label-info[href]:focus,.label-info[href]:hover{background-color:#31b0d5}\n.label-warning{background-color:#f0ad4e}\n.label-warning[href]:focus,.label-warning[href]:hover{background-color:#ec971f}\n.label-danger{background-color:#d9534f}\n.label-danger[href]:focus,.label-danger[href]:hover{background-color:#c9302c}\n.badge{display:inline-block;min-width:10px;padding:3px 7px;font-size:12px;color:#fff;vertical-align:middle;background-color:#777;border-radius:10px}\n.badge:empty{display:none}\n.media-object,.thumbnail{display:block}\n.btn-group-xs>.btn .badge,.btn-xs .badge{top:0;padding:1px 5px}\na.badge:focus,a.badge:hover{color:#fff;text-decoration:none;cursor:pointer}\n.list-group-item.active>.badge,.nav-pills>.active>a>.badge{color:#de0000;background-color:#fff}\n.jumbotron,.jumbotron .h1,.jumbotron h1{color:inherit}\n.list-group-item>.badge{float:right}\n.list-group-item>.badge+.badge{margin-right:5px}\n.nav-pills>li>a>.badge{margin-left:3px}\n.jumbotron{padding-top:30px;padding-bottom:30px;margin-bottom:30px;background-color:#eee}\n.jumbotron p{margin-bottom:15px;font-size:21px;font-weight:200}\n.alert .alert-link,.close{font-weight:700}\n.alert,.thumbnail{margin-bottom:20px}\n.jumbotron>hr{border-top-color:#d5d5d5}\n.container .jumbotron,.container-fluid .jumbotron{border-radius:6px;padding-left:15px;padding-right:15px}\n.jumbotron .container{max-width:100%}\n@media screen and (min-width:768px){.jumbotron{padding-top:48px;padding-bottom:48px}\n.container .jumbotron,.container-fluid .jumbotron{padding-left:60px;padding-right:60px}\n.jumbotron .h1,.jumbotron h1{font-size:63px}\n}\n.thumbnail{padding:4px;line-height:1.42857143;background-color:#fff;border:1px solid #ddd;border-radius:4px;-webkit-transition:border .2s ease-in-out;-o-transition:border .2s ease-in-out;transition:border .2s ease-in-out}\n.thumbnail a>img,.thumbnail>img{margin-left:auto;margin-right:auto}\na.thumbnail.active,a.thumbnail:focus,a.thumbnail:hover{border-color:#de0000}\n.thumbnail .caption{padding:9px;color:#333}\n.alert{padding:15px;border:1px solid transparent;border-radius:4px}\n.alert h4{margin-top:0;color:inherit}\n.alert>p,.alert>ul{margin-bottom:0}\n.alert>p+p{margin-top:5px}\n.alert-dismissable,.alert-dismissible{padding-right:35px}\n.alert-dismissable .close,.alert-dismissible .close{position:relative;top:-2px;right:-21px;color:inherit}\n.modal,.modal-backdrop{right:0;bottom:0;left:0}\n.alert-success{background-color:#dff0d8;border-color:#d6e9c6;color:#3c763d}\n.alert-success hr{border-top-color:#c9e2b3}\n.alert-success .alert-link{color:#2b542c}\n.alert-info{background-color:#d9edf7;border-color:#bce8f1;color:#31708f}\n.alert-info hr{border-top-color:#a6e1ec}\n.alert-info .alert-link{color:#245269}\n.alert-warning{background-color:#fcf8e3;border-color:#faebcc;color:#8a6d3b}\n.alert-warning hr{border-top-color:#f7e1b5}\n.alert-warning .alert-link{color:#66512c}\n.alert-danger{background-color:#f2dede;border-color:#ebccd1;color:#a94442}\n.alert-danger hr{border-top-color:#e4b9c0}\n.alert-danger .alert-link{color:#843534}\n@-webkit-keyframes progress-bar-stripes{from{background-position:40px 0}\nto{background-position:0 0}\n}\n@keyframes progress-bar-stripes{from{background-position:40px 0}\nto{background-position:0 0}\n}\n.progress{height:20px;margin-bottom:20px;background-color:#f5f5f5;border-radius:4px;-webkit-box-shadow:inset 0 1px 2px rgba(0,0,0,.1);box-shadow:inset 0 1px 2px rgba(0,0,0,.1)}\n.progress-bar{float:left;width:0;height:100%;font-size:12px;line-height:20px;color:#fff;text-align:center;background-color:#de0000;-webkit-box-shadow:inset 0 -1px 0 rgba(0,0,0,.15);box-shadow:inset 0 -1px 0 rgba(0,0,0,.15);-webkit-transition:width .6s ease;-o-transition:width .6s ease;transition:width .6s ease}\n.progress-bar-striped,.progress-striped .progress-bar{background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-image:linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-size:40px 40px}\n.progress-bar.active,.progress.active .progress-bar{-webkit-animation:progress-bar-stripes 2s linear infinite;-o-animation:progress-bar-stripes 2s linear infinite;animation:progress-bar-stripes 2s linear infinite}\n.progress-bar-success{background-color:#5cb85c}\n.progress-striped .progress-bar-success{background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-image:linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)}\n.progress-bar-info{background-color:#5bc0de}\n.progress-striped .progress-bar-info{background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-image:linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)}\n.progress-bar-warning{background-color:#f0ad4e}\n.progress-striped .progress-bar-warning{background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-image:linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)}\n.progress-bar-danger{background-color:#d9534f}\n.progress-striped .progress-bar-danger{background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-image:linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)}\n.media{margin-top:15px}\n.media:first-child{margin-top:0}\n.media,.media-body{zoom:1;overflow:hidden}\n.media-body{width:10000px}\n.media-right,.media>.pull-right{padding-left:10px}\n.media-left,.media>.pull-left{padding-right:10px}\n.media-body,.media-left,.media-right{display:table-cell;vertical-align:top}\n.media-middle{vertical-align:middle}\n.media-bottom{vertical-align:bottom}\n.media-heading{margin-top:0;margin-bottom:5px}\n.media-list{padding-left:0;list-style:none}\n.list-group{margin-bottom:20px;padding-left:0}\n.list-group-item{position:relative;display:block;padding:10px 15px;margin-bottom:-1px;background-color:#fff;border:1px solid #ddd}\n.list-group-item:first-child{border-top-right-radius:4px;border-top-left-radius:4px}\n.list-group-item:last-child{margin-bottom:0;border-bottom-right-radius:4px;border-bottom-left-radius:4px}\na.list-group-item,button.list-group-item{color:#555}\na.list-group-item .list-group-item-heading,button.list-group-item .list-group-item-heading{color:#333}\na.list-group-item:focus,a.list-group-item:hover,button.list-group-item:focus,button.list-group-item:hover{text-decoration:none;color:#555;background-color:#f5f5f5}\nbutton.list-group-item{width:100%;text-align:left}\n.list-group-item.disabled,.list-group-item.disabled:focus,.list-group-item.disabled:hover{background-color:#eee;color:#777;cursor:not-allowed}\n.list-group-item.disabled .list-group-item-heading,.list-group-item.disabled:focus .list-group-item-heading,.list-group-item.disabled:hover .list-group-item-heading{color:inherit}\n.list-group-item.disabled .list-group-item-text,.list-group-item.disabled:focus .list-group-item-text,.list-group-item.disabled:hover .list-group-item-text{color:#777}\n.list-group-item.active,.list-group-item.active:focus,.list-group-item.active:hover{z-index:2;color:#fff;background-color:#de0000;border-color:#de0000}\n.list-group-item.active .list-group-item-heading,.list-group-item.active .list-group-item-heading>.small,.list-group-item.active .list-group-item-heading>small,.list-group-item.active:focus .list-group-item-heading,.list-group-item.active:focus .list-group-item-heading>.small,.list-group-item.active:focus .list-group-item-heading>small,.list-group-item.active:hover .list-group-item-heading,.list-group-item.active:hover .list-group-item-heading>.small,.list-group-item.active:hover .list-group-item-heading>small{color:inherit}\n.list-group-item.active .list-group-item-text,.list-group-item.active:focus .list-group-item-text,.list-group-item.active:hover .list-group-item-text{color:#ffabab}\n.list-group-item-success{color:#3c763d;background-color:#dff0d8}\na.list-group-item-success,button.list-group-item-success{color:#3c763d}\na.list-group-item-success .list-group-item-heading,button.list-group-item-success .list-group-item-heading{color:inherit}\na.list-group-item-success:focus,a.list-group-item-success:hover,button.list-group-item-success:focus,button.list-group-item-success:hover{color:#3c763d;background-color:#d0e9c6}\na.list-group-item-success.active,a.list-group-item-success.active:focus,a.list-group-item-success.active:hover,button.list-group-item-success.active,button.list-group-item-success.active:focus,button.list-group-item-success.active:hover{color:#fff;background-color:#3c763d;border-color:#3c763d}\n.list-group-item-info{color:#31708f;background-color:#d9edf7}\na.list-group-item-info,button.list-group-item-info{color:#31708f}\na.list-group-item-info .list-group-item-heading,button.list-group-item-info .list-group-item-heading{color:inherit}\na.list-group-item-info:focus,a.list-group-item-info:hover,button.list-group-item-info:focus,button.list-group-item-info:hover{color:#31708f;background-color:#c4e3f3}\na.list-group-item-info.active,a.list-group-item-info.active:focus,a.list-group-item-info.active:hover,button.list-group-item-info.active,button.list-group-item-info.active:focus,button.list-group-item-info.active:hover{color:#fff;background-color:#31708f;border-color:#31708f}\n.list-group-item-warning{color:#8a6d3b;background-color:#fcf8e3}\na.list-group-item-warning,button.list-group-item-warning{color:#8a6d3b}\na.list-group-item-warning .list-group-item-heading,button.list-group-item-warning .list-group-item-heading{color:inherit}\na.list-group-item-warning:focus,a.list-group-item-warning:hover,button.list-group-item-warning:focus,button.list-group-item-warning:hover{color:#8a6d3b;background-color:#faf2cc}\na.list-group-item-warning.active,a.list-group-item-warning.active:focus,a.list-group-item-warning.active:hover,button.list-group-item-warning.active,button.list-group-item-warning.active:focus,button.list-group-item-warning.active:hover{color:#fff;background-color:#8a6d3b;border-color:#8a6d3b}\n.list-group-item-danger{color:#a94442;background-color:#f2dede}\na.list-group-item-danger,button.list-group-item-danger{color:#a94442}\na.list-group-item-danger .list-group-item-heading,button.list-group-item-danger .list-group-item-heading{color:inherit}\na.list-group-item-danger:focus,a.list-group-item-danger:hover,button.list-group-item-danger:focus,button.list-group-item-danger:hover{color:#a94442;background-color:#ebcccc}\na.list-group-item-danger.active,a.list-group-item-danger.active:focus,a.list-group-item-danger.active:hover,button.list-group-item-danger.active,button.list-group-item-danger.active:focus,button.list-group-item-danger.active:hover{color:#fff;background-color:#a94442;border-color:#a94442}\n.panel-heading>.dropdown .dropdown-toggle,.panel-title,.panel-title>.small,.panel-title>.small>a,.panel-title>a,.panel-title>small,.panel-title>small>a{color:inherit}\n.list-group-item-heading{margin-top:0;margin-bottom:5px}\n.list-group-item-text{margin-bottom:0;line-height:1.3}\n.panel{margin-bottom:20px;background-color:#fff;border:1px solid transparent;border-radius:4px;-webkit-box-shadow:0 1px 1px rgba(0,0,0,.05);box-shadow:0 1px 1px rgba(0,0,0,.05)}\n.panel-title,.panel>.list-group,.panel>.panel-collapse>.list-group,.panel>.panel-collapse>.table,.panel>.table,.panel>.table-responsive>.table{margin-bottom:0}\n.panel-body{padding:15px}\n.panel-heading{padding:10px 15px;border-bottom:1px solid transparent;border-top-right-radius:3px;border-top-left-radius:3px}\n.panel-group .panel-heading,.panel>.table-bordered>tbody>tr:first-child>td,.panel>.table-bordered>tbody>tr:first-child>th,.panel>.table-bordered>tbody>tr:last-child>td,.panel>.table-bordered>tbody>tr:last-child>th,.panel>.table-bordered>tfoot>tr:last-child>td,.panel>.table-bordered>tfoot>tr:last-child>th,.panel>.table-bordered>thead>tr:first-child>td,.panel>.table-bordered>thead>tr:first-child>th,.panel>.table-responsive>.table-bordered>tbody>tr:first-child>td,.panel>.table-responsive>.table-bordered>tbody>tr:first-child>th,.panel>.table-responsive>.table-bordered>tbody>tr:last-child>td,.panel>.table-responsive>.table-bordered>tbody>tr:last-child>th,.panel>.table-responsive>.table-bordered>tfoot>tr:last-child>td,.panel>.table-responsive>.table-bordered>tfoot>tr:last-child>th,.panel>.table-responsive>.table-bordered>thead>tr:first-child>td,.panel>.table-responsive>.table-bordered>thead>tr:first-child>th{border-bottom:0}\n.panel-title{margin-top:0;font-size:16px}\n.panel-footer{padding:10px 15px;background-color:#f5f5f5;border-top:1px solid #ddd;border-bottom-right-radius:3px;border-bottom-left-radius:3px}\n.panel>.list-group .list-group-item,.panel>.panel-collapse>.list-group .list-group-item{border-width:1px 0;border-radius:0}\n.panel>.table-responsive:last-child>.table:last-child,.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child,.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child,.panel>.table:last-child,.panel>.table:last-child>tbody:last-child>tr:last-child,.panel>.table:last-child>tfoot:last-child>tr:last-child{border-bottom-right-radius:3px;border-bottom-left-radius:3px}\n.panel>.list-group:first-child .list-group-item:first-child,.panel>.panel-collapse>.list-group:first-child .list-group-item:first-child{border-top:0;border-top-right-radius:3px;border-top-left-radius:3px}\n.panel>.list-group:last-child .list-group-item:last-child,.panel>.panel-collapse>.list-group:last-child .list-group-item:last-child{border-bottom:0;border-bottom-right-radius:3px;border-bottom-left-radius:3px}\n.panel>.panel-heading+.panel-collapse>.list-group .list-group-item:first-child{border-top-right-radius:0;border-top-left-radius:0}\n.panel>.table-responsive:first-child>.table:first-child,.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child,.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child,.panel>.table:first-child,.panel>.table:first-child>tbody:first-child>tr:first-child,.panel>.table:first-child>thead:first-child>tr:first-child{border-top-right-radius:3px;border-top-left-radius:3px}\n.list-group+.panel-footer,.panel-heading+.list-group .list-group-item:first-child{border-top-width:0}\n.panel>.panel-collapse>.table caption,.panel>.table caption,.panel>.table-responsive>.table caption{padding-left:15px;padding-right:15px}\n.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child td:first-child,.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child th:first-child,.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child td:first-child,.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child th:first-child,.panel>.table:first-child>tbody:first-child>tr:first-child td:first-child,.panel>.table:first-child>tbody:first-child>tr:first-child th:first-child,.panel>.table:first-child>thead:first-child>tr:first-child td:first-child,.panel>.table:first-child>thead:first-child>tr:first-child th:first-child{border-top-left-radius:3px}\n.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child td:last-child,.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child th:last-child,.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child td:last-child,.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child th:last-child,.panel>.table:first-child>tbody:first-child>tr:first-child td:last-child,.panel>.table:first-child>tbody:first-child>tr:first-child th:last-child,.panel>.table:first-child>thead:first-child>tr:first-child td:last-child,.panel>.table:first-child>thead:first-child>tr:first-child th:last-child{border-top-right-radius:3px}\n.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child td:first-child,.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child th:first-child,.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child td:first-child,.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child th:first-child,.panel>.table:last-child>tbody:last-child>tr:last-child td:first-child,.panel>.table:last-child>tbody:last-child>tr:last-child th:first-child,.panel>.table:last-child>tfoot:last-child>tr:last-child td:first-child,.panel>.table:last-child>tfoot:last-child>tr:last-child th:first-child{border-bottom-left-radius:3px}\n.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child td:last-child,.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child th:last-child,.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child td:last-child,.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child th:last-child,.panel>.table:last-child>tbody:last-child>tr:last-child td:last-child,.panel>.table:last-child>tbody:last-child>tr:last-child th:last-child,.panel>.table:last-child>tfoot:last-child>tr:last-child td:last-child,.panel>.table:last-child>tfoot:last-child>tr:last-child th:last-child{border-bottom-right-radius:3px}\n.panel>.panel-body+.table,.panel>.panel-body+.table-responsive,.panel>.table+.panel-body,.panel>.table-responsive+.panel-body{border-top:1px solid #ddd}\n.panel>.table>tbody:first-child>tr:first-child td,.panel>.table>tbody:first-child>tr:first-child th{border-top:0}\n.panel>.table-bordered,.panel>.table-responsive>.table-bordered{border:0}\n.panel>.table-bordered>tbody>tr>td:first-child,.panel>.table-bordered>tbody>tr>th:first-child,.panel>.table-bordered>tfoot>tr>td:first-child,.panel>.table-bordered>tfoot>tr>th:first-child,.panel>.table-bordered>thead>tr>td:first-child,.panel>.table-bordered>thead>tr>th:first-child,.panel>.table-responsive>.table-bordered>tbody>tr>td:first-child,.panel>.table-responsive>.table-bordered>tbody>tr>th:first-child,.panel>.table-responsive>.table-bordered>tfoot>tr>td:first-child,.panel>.table-responsive>.table-bordered>tfoot>tr>th:first-child,.panel>.table-responsive>.table-bordered>thead>tr>td:first-child,.panel>.table-responsive>.table-bordered>thead>tr>th:first-child{border-left:0}\n.panel>.table-bordered>tbody>tr>td:last-child,.panel>.table-bordered>tbody>tr>th:last-child,.panel>.table-bordered>tfoot>tr>td:last-child,.panel>.table-bordered>tfoot>tr>th:last-child,.panel>.table-bordered>thead>tr>td:last-child,.panel>.table-bordered>thead>tr>th:last-child,.panel>.table-responsive>.table-bordered>tbody>tr>td:last-child,.panel>.table-responsive>.table-bordered>tbody>tr>th:last-child,.panel>.table-responsive>.table-bordered>tfoot>tr>td:last-child,.panel>.table-responsive>.table-bordered>tfoot>tr>th:last-child,.panel>.table-responsive>.table-bordered>thead>tr>td:last-child,.panel>.table-responsive>.table-bordered>thead>tr>th:last-child{border-right:0}\n.panel>.table-responsive{border:0;margin-bottom:0}\n.panel-group{margin-bottom:20px}\n.panel-group .panel{margin-bottom:0;border-radius:4px}\n.panel-group .panel+.panel{margin-top:5px}\n.panel-group .panel-heading+.panel-collapse>.list-group,.panel-group .panel-heading+.panel-collapse>.panel-body{border-top:1px solid #ddd}\n.panel-group .panel-footer{border-top:0}\n.panel-group .panel-footer+.panel-collapse .panel-body{border-bottom:1px solid #ddd}\n.panel-default{border-color:#ddd}\n.panel-default>.panel-heading{color:#333;background-color:#f5f5f5;border-color:#ddd}\n.panel-default>.panel-heading+.panel-collapse>.panel-body{border-top-color:#ddd}\n.panel-default>.panel-heading .badge{color:#f5f5f5;background-color:#333}\n.panel-default>.panel-footer+.panel-collapse>.panel-body{border-bottom-color:#ddd}\n.panel-primary{border-color:#de0000}\n.panel-primary>.panel-heading{color:#fff;background-color:#de0000;border-color:#de0000}\n.panel-primary>.panel-heading+.panel-collapse>.panel-body{border-top-color:#de0000}\n.panel-primary>.panel-heading .badge{color:#de0000;background-color:#fff}\n.panel-primary>.panel-footer+.panel-collapse>.panel-body{border-bottom-color:#de0000}\n.panel-success{border-color:#d6e9c6}\n.panel-success>.panel-heading{color:#3c763d;background-color:#dff0d8;border-color:#d6e9c6}\n.panel-success>.panel-heading+.panel-collapse>.panel-body{border-top-color:#d6e9c6}\n.panel-success>.panel-heading .badge{color:#dff0d8;background-color:#3c763d}\n.panel-success>.panel-footer+.panel-collapse>.panel-body{border-bottom-color:#d6e9c6}\n.panel-info{border-color:#bce8f1}\n.panel-info>.panel-heading{color:#31708f;background-color:#d9edf7;border-color:#bce8f1}\n.panel-info>.panel-heading+.panel-collapse>.panel-body{border-top-color:#bce8f1}\n.panel-info>.panel-heading .badge{color:#d9edf7;background-color:#31708f}\n.panel-info>.panel-footer+.panel-collapse>.panel-body{border-bottom-color:#bce8f1}\n.panel-warning{border-color:#faebcc}\n.panel-warning>.panel-heading{color:#8a6d3b;background-color:#fcf8e3;border-color:#faebcc}\n.panel-warning>.panel-heading+.panel-collapse>.panel-body{border-top-color:#faebcc}\n.panel-warning>.panel-heading .badge{color:#fcf8e3;background-color:#8a6d3b}\n.panel-warning>.panel-footer+.panel-collapse>.panel-body{border-bottom-color:#faebcc}\n.panel-danger{border-color:#ebccd1}\n.panel-danger>.panel-heading{color:#a94442;background-color:#f2dede;border-color:#ebccd1}\n.panel-danger>.panel-heading+.panel-collapse>.panel-body{border-top-color:#ebccd1}\n.panel-danger>.panel-heading .badge{color:#f2dede;background-color:#a94442}\n.panel-danger>.panel-footer+.panel-collapse>.panel-body{border-bottom-color:#ebccd1}\n.embed-responsive{position:relative;display:block;height:0;padding:0}\n.embed-responsive .embed-responsive-item,.embed-responsive embed,.embed-responsive iframe,.embed-responsive object,.embed-responsive video{position:absolute;top:0;left:0;bottom:0;height:100%;width:100%;border:0}\n.embed-responsive-16by9{padding-bottom:56.25%}\n.embed-responsive-4by3{padding-bottom:75%}\n.well{min-height:20px;padding:19px;margin-bottom:20px;background-color:#f5f5f5;border:1px solid #e3e3e3;border-radius:4px;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.05);box-shadow:inset 0 1px 1px rgba(0,0,0,.05)}\n.well blockquote{border-color:#ddd;border-color:rgba(0,0,0,.15)}\n.well-lg{padding:24px;border-radius:6px}\n.well-sm{padding:9px;border-radius:3px}\n.close{float:right;font-size:21px;line-height:1;color:#000;text-shadow:0 1px 0 #fff;opacity:.2;filter:alpha(opacity=20)}\n.popover,.tooltip{text-decoration:none;font-family:\"Helvetica Neue\",Helvetica,Arial,sans-serif;font-style:normal;font-weight:400;letter-spacing:normal;line-break:auto;line-height:1.42857143;text-shadow:none;text-transform:none;white-space:normal;word-break:normal;word-spacing:normal;word-wrap:normal}\n.close:focus,.close:hover{color:#000;text-decoration:none;cursor:pointer;opacity:.5;filter:alpha(opacity=50)}\nbutton.close{padding:0;cursor:pointer;background:0 0;border:0;-webkit-appearance:none}\n.modal-content,.popover{background-clip:padding-box}\n.modal{display:none;position:fixed;top:0;z-index:1050;-webkit-overflow-scrolling:touch;outline:0}\n.modal.fade .modal-dialog{-webkit-transform:translate(0,-25%);-ms-transform:translate(0,-25%);-o-transform:translate(0,-25%);transform:translate(0,-25%);-webkit-transition:-webkit-transform .3s ease-out;-moz-transition:-moz-transform .3s ease-out;-o-transition:-o-transform .3s ease-out;transition:transform .3s ease-out}\n.modal.in .modal-dialog{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);-o-transform:translate(0,0);transform:translate(0,0)}\n.modal-open .modal{overflow-x:hidden;overflow-y:auto}\n.modal-dialog{position:relative;width:auto;margin:10px}\n.modal-content{position:relative;background-color:#fff;border:1px solid #999;border:1px solid rgba(0,0,0,.2);border-radius:6px;-webkit-box-shadow:0 3px 9px rgba(0,0,0,.5);box-shadow:0 3px 9px rgba(0,0,0,.5);outline:0}\n.modal-backdrop{position:fixed;top:0;z-index:1040;background-color:#000}\n.modal-backdrop.fade{opacity:0;filter:alpha(opacity=0)}\n.modal-backdrop.in{opacity:.5;filter:alpha(opacity=50)}\n.modal-header{padding:15px;border-bottom:1px solid #e5e5e5}\n.tooltip.bottom .tooltip-arrow,.tooltip.bottom-left .tooltip-arrow,.tooltip.bottom-right .tooltip-arrow{top:0;border-width:0 5px 5px;border-bottom-color:#000}\n.modal-header .close{margin-top:-2px}\n.modal-title{margin:0;line-height:1.42857143}\n.modal-body{position:relative;padding:15px}\n.modal-footer{padding:15px;text-align:right;border-top:1px solid #e5e5e5}\n.modal-footer .btn+.btn{margin-left:5px;margin-bottom:0}\n.modal-footer .btn-group .btn+.btn{margin-left:-1px}\n.modal-footer .btn-block+.btn-block{margin-left:0}\n.modal-scrollbar-measure{position:absolute;top:-9999px;width:50px;height:50px;overflow:scroll}\n@media (min-width:768px){.modal-dialog{width:600px;margin:30px auto}\n.modal-content{-webkit-box-shadow:0 5px 15px rgba(0,0,0,.5);box-shadow:0 5px 15px rgba(0,0,0,.5)}\n.modal-sm{width:300px}\n}\n.tooltip.top-left .tooltip-arrow,.tooltip.top-right .tooltip-arrow{bottom:0;margin-bottom:-5px;border-width:5px 5px 0;border-top-color:#000}\n@media (min-width:992px){.modal-lg{width:900px}\n}\n.tooltip{position:absolute;z-index:1070;display:block;text-align:left;text-align:start;font-size:12px;opacity:0;filter:alpha(opacity=0)}\n.tooltip.in{opacity:.9;filter:alpha(opacity=90)}\n.tooltip.top{margin-top:-3px;padding:5px 0}\n.tooltip.right{margin-left:3px;padding:0 5px}\n.tooltip.bottom{margin-top:3px;padding:5px 0}\n.tooltip.left{margin-left:-3px;padding:0 5px}\n.tooltip-inner{max-width:200px;padding:3px 8px;color:#fff;text-align:center;background-color:#000;border-radius:4px}\n.tooltip-arrow{position:absolute;width:0;height:0;border-color:transparent;border-style:solid}\n.tooltip.top .tooltip-arrow{bottom:0;left:50%;margin-left:-5px;border-width:5px 5px 0;border-top-color:#000}\n.tooltip.top-left .tooltip-arrow{right:5px}\n.tooltip.top-right .tooltip-arrow{left:5px}\n.tooltip.right .tooltip-arrow{top:50%;left:0;margin-top:-5px;border-width:5px 5px 5px 0;border-right-color:#000}\n.tooltip.left .tooltip-arrow{top:50%;right:0;margin-top:-5px;border-width:5px 0 5px 5px;border-left-color:#000}\n.tooltip.bottom .tooltip-arrow{left:50%;margin-left:-5px}\n.tooltip.bottom-left .tooltip-arrow{right:5px;margin-top:-5px}\n.tooltip.bottom-right .tooltip-arrow{left:5px;margin-top:-5px}\n.popover{position:absolute;top:0;left:0;z-index:1060;display:none;max-width:276px;padding:1px;text-align:left;text-align:start;font-size:14px;background-color:#fff;border:1px solid #ccc;border:1px solid rgba(0,0,0,.2);border-radius:6px;-webkit-box-shadow:0 5px 10px rgba(0,0,0,.2);box-shadow:0 5px 10px rgba(0,0,0,.2)}\n.carousel-caption,.carousel-control{color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.6)}\n.popover.top{margin-top:-10px}\n.popover.right{margin-left:10px}\n.popover.bottom{margin-top:10px}\n.popover.left{margin-left:-10px}\n.popover-title{margin:0;padding:8px 14px;font-size:14px;background-color:#f7f7f7;border-bottom:1px solid #ebebeb;border-radius:5px 5px 0 0}\n.popover-content{padding:9px 14px}\n.popover>.arrow,.popover>.arrow:after{position:absolute;display:block;width:0;height:0;border-color:transparent;border-style:solid}\n.carousel,.carousel-inner{position:relative}\n.popover>.arrow{border-width:11px}\n.popover>.arrow:after{border-width:10px;content:\"\"}\n.popover.top>.arrow{left:50%;margin-left:-11px;border-bottom-width:0;border-top-color:#999;border-top-color:rgba(0,0,0,.25);bottom:-11px}\n.popover.top>.arrow:after{content:\" \";bottom:1px;margin-left:-10px;border-bottom-width:0;border-top-color:#fff}\n.popover.left>.arrow:after,.popover.right>.arrow:after{content:\" \";bottom:-10px}\n.popover.right>.arrow{top:50%;left:-11px;margin-top:-11px;border-left-width:0;border-right-color:#999;border-right-color:rgba(0,0,0,.25)}\n.popover.right>.arrow:after{left:1px;border-left-width:0;border-right-color:#fff}\n.popover.bottom>.arrow{left:50%;margin-left:-11px;border-top-width:0;border-bottom-color:#999;border-bottom-color:rgba(0,0,0,.25);top:-11px}\n.popover.bottom>.arrow:after{content:\" \";top:1px;margin-left:-10px;border-top-width:0;border-bottom-color:#fff}\n.popover.left>.arrow{top:50%;right:-11px;margin-top:-11px;border-right-width:0;border-left-color:#999;border-left-color:rgba(0,0,0,.25)}\n.popover.left>.arrow:after{right:1px;border-right-width:0;border-left-color:#fff}\n.carousel-inner{width:100%}\n.carousel-inner>.item{display:none;position:relative;-webkit-transition:.6s ease-in-out left;-o-transition:.6s ease-in-out left;transition:.6s ease-in-out left}\n.carousel-inner>.item>a>img,.carousel-inner>.item>img{line-height:1}\n@media all and (transform-3d),(-webkit-transform-3d){.carousel-inner>.item{-webkit-transition:-webkit-transform .6s ease-in-out;-moz-transition:-moz-transform .6s ease-in-out;-o-transition:-o-transform .6s ease-in-out;transition:transform .6s ease-in-out;-webkit-backface-visibility:hidden;-moz-backface-visibility:hidden;backface-visibility:hidden;-webkit-perspective:1000px;-moz-perspective:1000px;perspective:1000px}\n.carousel-inner>.item.active.right,.carousel-inner>.item.next{-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0);left:0}\n.carousel-inner>.item.active.left,.carousel-inner>.item.prev{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0);left:0}\n.carousel-inner>.item.active,.carousel-inner>.item.next.left,.carousel-inner>.item.prev.right{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0);left:0}\n}\n.carousel-inner>.active,.carousel-inner>.next,.carousel-inner>.prev{display:block}\n.carousel-inner>.active{left:0}\n.carousel-inner>.next,.carousel-inner>.prev{position:absolute;top:0;width:100%}\n.carousel-inner>.next{left:100%}\n.carousel-inner>.prev{left:-100%}\n.carousel-inner>.next.left,.carousel-inner>.prev.right{left:0}\n.carousel-inner>.active.left{left:-100%}\n.carousel-inner>.active.right{left:100%}\n.carousel-control{position:absolute;top:0;left:0;bottom:0;width:15%;opacity:.5;filter:alpha(opacity=50);font-size:20px;text-align:center;background-color:transparent}\n.carousel-control.left{background-image:-webkit-linear-gradient(left,rgba(0,0,0,.5) 0,rgba(0,0,0,.0001) 100%);background-image:-o-linear-gradient(left,rgba(0,0,0,.5) 0,rgba(0,0,0,.0001) 100%);background-image:linear-gradient(to right,rgba(0,0,0,.5) 0,rgba(0,0,0,.0001) 100%);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#80000000', endColorstr='#00000000', GradientType=1)}\n.carousel-control.right{left:auto;right:0;background-image:-webkit-linear-gradient(left,rgba(0,0,0,.0001) 0,rgba(0,0,0,.5) 100%);background-image:-o-linear-gradient(left,rgba(0,0,0,.0001) 0,rgba(0,0,0,.5) 100%);background-image:linear-gradient(to right,rgba(0,0,0,.0001) 0,rgba(0,0,0,.5) 100%);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#00000000', endColorstr='#80000000', GradientType=1)}\n.carousel-control:focus,.carousel-control:hover{outline:0;color:#fff;text-decoration:none;opacity:.9;filter:alpha(opacity=90)}\n.carousel-control .glyphicon-chevron-left,.carousel-control .glyphicon-chevron-right,.carousel-control .icon-next,.carousel-control .icon-prev{position:absolute;top:50%;margin-top:-10px;z-index:5;display:inline-block}\n.carousel-control .glyphicon-chevron-left,.carousel-control .icon-prev{left:50%;margin-left:-10px}\n.carousel-control .glyphicon-chevron-right,.carousel-control .icon-next{right:50%;margin-right:-10px}\n.carousel-control .icon-next,.carousel-control .icon-prev{width:20px;height:20px;line-height:1;font-family:serif}\n.carousel-control .icon-prev:before{content:'\\2039'}\n.carousel-control .icon-next:before{content:'\\203a'}\n.carousel-indicators{position:absolute;bottom:10px;left:50%;z-index:15;width:60%;margin-left:-30%;padding-left:0;list-style:none;text-align:center}\n.carousel-indicators li{display:inline-block;width:10px;height:10px;margin:1px;text-indent:-999px;border:1px solid #fff;border-radius:10px;cursor:pointer;background-color:#000\\9;background-color:transparent}\n.carousel-indicators .active{margin:0;width:12px;height:12px;background-color:#fff}\n.carousel-caption{position:absolute;left:15%;right:15%;bottom:20px;z-index:10;padding-top:20px;padding-bottom:20px;text-align:center}\n.carousel-caption .btn,.text-hide{text-shadow:none}\n@media screen and (min-width:768px){.carousel-control .glyphicon-chevron-left,.carousel-control .glyphicon-chevron-right,.carousel-control .icon-next,.carousel-control .icon-prev{width:30px;height:30px;margin-top:-10px;font-size:30px}\n.carousel-control .glyphicon-chevron-left,.carousel-control .icon-prev{margin-left:-10px}\n.carousel-control .glyphicon-chevron-right,.carousel-control .icon-next{margin-right:-10px}\n.carousel-caption{left:20%;right:20%;padding-bottom:30px}\n.carousel-indicators{bottom:20px}\n}\n.btn-group-vertical>.btn-group:after,.btn-group-vertical>.btn-group:before,.btn-toolbar:after,.btn-toolbar:before,.clearfix:after,.clearfix:before,.container-fluid:after,.container-fluid:before,.container:after,.container:before,.dl-horizontal dd:after,.dl-horizontal dd:before,.form-horizontal .form-group:after,.form-horizontal .form-group:before,.modal-footer:after,.modal-footer:before,.modal-header:after,.modal-header:before,.nav:after,.nav:before,.navbar-collapse:after,.navbar-collapse:before,.navbar-header:after,.navbar-header:before,.navbar:after,.navbar:before,.pager:after,.pager:before,.panel-body:after,.panel-body:before,.row:after,.row:before{content:\" \";display:table}\n.btn-group-vertical>.btn-group:after,.btn-toolbar:after,.clearfix:after,.container-fluid:after,.container:after,.dl-horizontal dd:after,.form-horizontal .form-group:after,.modal-footer:after,.modal-header:after,.nav:after,.navbar-collapse:after,.navbar-header:after,.navbar:after,.pager:after,.panel-body:after,.row:after{clear:both}\n.center-block{display:block;margin-left:auto;margin-right:auto}\n.pull-right{float:right!important}\n.pull-left{float:left!important}\n.hide{display:none!important}\n.show{display:block!important}\n.hidden,.visible-lg,.visible-lg-block,.visible-lg-inline,.visible-lg-inline-block,.visible-md,.visible-md-block,.visible-md-inline,.visible-md-inline-block,.visible-sm,.visible-sm-block,.visible-sm-inline,.visible-sm-inline-block,.visible-xs,.visible-xs-block,.visible-xs-inline,.visible-xs-inline-block{display:none!important}\n.invisible{visibility:hidden}\n.text-hide{font:0/0 a;color:transparent;background-color:transparent;border:0}\n.affix{position:fixed}\n@-ms-viewport{width:device-width}\n@media (max-width:767px){.visible-xs{display:block!important}\ntable.visible-xs{display:table!important}\ntr.visible-xs{display:table-row!important}\ntd.visible-xs,th.visible-xs{display:table-cell!important}\n.visible-xs-block{display:block!important}\n.visible-xs-inline{display:inline!important}\n.visible-xs-inline-block{display:inline-block!important}\n}\n@media (min-width:768px) and (max-width:991px){.visible-sm{display:block!important}\ntable.visible-sm{display:table!important}\ntr.visible-sm{display:table-row!important}\ntd.visible-sm,th.visible-sm{display:table-cell!important}\n.visible-sm-block{display:block!important}\n.visible-sm-inline{display:inline!important}\n.visible-sm-inline-block{display:inline-block!important}\n}\n@media (min-width:992px) and (max-width:1199px){.visible-md{display:block!important}\ntable.visible-md{display:table!important}\ntr.visible-md{display:table-row!important}\ntd.visible-md,th.visible-md{display:table-cell!important}\n.visible-md-block{display:block!important}\n.visible-md-inline{display:inline!important}\n.visible-md-inline-block{display:inline-block!important}\n}\n@media (min-width:1200px){.visible-lg{display:block!important}\ntable.visible-lg{display:table!important}\ntr.visible-lg{display:table-row!important}\ntd.visible-lg,th.visible-lg{display:table-cell!important}\n.visible-lg-block{display:block!important}\n.visible-lg-inline{display:inline!important}\n.visible-lg-inline-block{display:inline-block!important}\n}\n@media (max-width:767px){.hidden-xs{display:none!important}\n}\n@media (min-width:768px) and (max-width:991px){.hidden-sm{display:none!important}\n}\n@media (min-width:992px) and (max-width:1199px){.hidden-md{display:none!important}\n}\n@media (min-width:1200px){.hidden-lg{display:none!important}\n}\n.visible-print{display:none!important}\n@media print{.visible-print{display:block!important}\ntable.visible-print{display:table!important}\ntr.visible-print{display:table-row!important}\ntd.visible-print,th.visible-print{display:table-cell!important}\n}\n.visible-print-block{display:none!important}\n@media print{.visible-print-block{display:block!important}\n}\n.visible-print-inline{display:none!important}\n@media print{.visible-print-inline{display:inline!important}\n}\n.visible-print-inline-block{display:none!important}\n@media print{.visible-print-inline-block{display:inline-block!important}\n.hidden-print{display:none!important}\n}"; });
define('text!game/create.html', ['module'], function(module) { module.exports = "<template>\r\n    <h2>Spielcode tests: <span data-test-id=\"game-code\">${gameId}</span></h2>\r\n    <h2><span data-test-id=\"total-questions-no\">${questionsModel.length}</span> Fragen</h2>\r\n    <ul class=\"list-group\">\r\n        <li repeat.for=\"question of questionsModel\" class=\"list-group-item\">\r\n            <button click.trigger=\"question.editAction()\" type=\"button\" class=\"btn btn-default\" aria-label=\"Left Align\">\r\n                <span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n            </button>\r\n\r\n            <span> ${question.text}</span>\r\n\r\n            <input show.bind=\"question.editActive\" type=\"text\" placeholder=\"Frage...\" class=\"form-control\" value.bind=\"question.text\"></input>\r\n            <button show.bind=\"question.editActive\" click.trigger=\"question.updateAction(question)\" type=\"button\" class=\"btn btn-default\" aria-label=\"Left Align\">\r\n                <span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span>\r\n            </button>\r\n        </li>\r\n    </ul>\r\n\r\n    <form class=\"form-horizontal\">\r\n        <div class=\"form-group\">\r\n            <div class=\"col-sm-8\">\r\n                <input type=\"text\" class=\"form-control\" placeholder=\"neue Frage...\" value.bind=\"newQuestionText\">\r\n            </div>\r\n            <div class=\"col-sm-2\">\r\n                <button type=\"submit\" class=\"btn btn-primary\" click.trigger=\"addQuestion()\">Frage hinzufügen</button>\r\n            </div>\r\n        </div>\r\n    </form>\r\n\r\n    <hr />\r\n    <h2>Spieler:</h2>\r\n    <ul>\r\n        <li style=\"display: inline\" repeat.for=\"name of playerlist\">${name}, </li>\r\n    </ul>\r\n    <button class=\"btn btn-primary btn-lg\" click.trigger=\"startGame()\" data-test-id=\"start-game\">Spiel starten</button>\r\n</template>"; });
define('text!styles/styles.css', ['module'], function(module) { module.exports = ".top5 { margin-top:5px; }\r\n.top7 { margin-top:7px; }\r\n.top10 { margin-top:10px; }\r\n.top15 { margin-top:15px; }\r\n.top17 { margin-top:17px; }\r\n.top30 { margin-top:30px; }\r\n.handwriting, h1, h2{\r\n    font-family: 'Arizonia', cursive;\r\n}\r\n"; });
define('text!game/join.html', ['module'], function(module) { module.exports = "<template>\r\n    <row>\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <h2>Spiel beitreten</h2>\r\n        </div>\r\n    </row>\r\n    <row>\r\n        <div class=\"col-xs-4 col-sm-4 col-md-4 col-lg-4\">\r\n            <form>\r\n                <div class=\"form-group\">\r\n                    <label for=\"exampleInputName2\">Dein Name: </label>\r\n                    <input type=\"text\" class=\"form-control\" data-test-id=\"textbox-name\" value.bind=\"name\" placeholder=\"Name\">\r\n                </div>\r\n                <div class=\"form-group\">\r\n                    <label for=\"gameId\">Spiel Code: </label>\r\n                    <input type=\"text\" class=\"form-control\" id=\"gameId\" value.bind=\"gameId\" data-test-id=\"textbox-game-id\" placeholder=\"#af34w2s\">\r\n                </div>\r\n                <input type=\"submit\" class=\"btn btn-default\" data-test-id=\"join-game\" click.trigger=\"joinGame()\" value=\"Los!\"></input>\r\n            </form>\r\n        </div>\r\n    </row>\r\n    <row>\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <a href=\"\" click.trigger=\"showHighscore()\" data-test-id=\"show-highscore\">Nur highscore anzeigen</a>\r\n        </div>\r\n    </row>\r\n</template>"; });
define('text!highscore/highscore-table.html', ['module'], function(module) { module.exports = "<template>\r\n  <table class=\"table\" with.bind=\"model\">\r\n    <thead>\r\n      <tr>\r\n        <th>Platzierung</th>\r\n        <th>Name</th>\r\n        <th>Punkte</th>\r\n      </tr>\r\n    </thead>\r\n    <tbody>\r\n      <tr if.bind=\"entries.length > 0\">\r\n        <td>1.</td>\r\n        <td class=\"firstNames\">${entries[0].names}</td>\r\n        <td class=\"firstScore\">${entries[0].score}</td>\r\n      </tr>\r\n      <tr if.bind=\"entries.length > 1\">\r\n        <td>2.</td>\r\n        <td class=\"secondNames\">${entries[1].names}</td>\r\n        <td class=\"secondScore\">${entries[1].score}</td>\r\n      </tr>\r\n      <tr if.bind=\"entries.length > 2\">\r\n        <td>3.</td>\r\n        <td class=\"thirdNames\">${entries[2].names}</td>\r\n        <td class=\"thirdScore\">${entries[2].score}</td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n\r\n</template>"; });
define('text!highscore/highscore.html', ['module'], function(module) { module.exports = "<template bindable=\"highscoreModel\">\r\n    <require from=\"./highscore-table\"></require>\r\n    <h2 data-test-id=\"heading\">Übersicht</h2>\r\n\r\n    <div show.bind=\"game.state === 1\">\r\n        <div class=\"row\">\r\n            <div class=\"text-center\">\r\n                Aktuelle Frage: <span data-test-id=\"current-question\">${currentQuestion}</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"row top10\">\r\n            <div class=\"col-xs-6 \">\r\n                <button type=\"button\" class=\"btn btn-default btn-block\">Die Braut</button>\r\n            </div>\r\n            <div class=\"col-xs-1 \">\r\n                ${answerStatistics.mrs}\r\n            </div>\r\n            <div class=\"col-xs-5\">\r\n                <div class=\"progress\">\r\n                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"30\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: ${statsMrs}%;\">\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"row top10\">\r\n            <div class=\"col-xs-6 \">\r\n                <button type=\"button\" class=\"btn btn-default btn-block\">Der Bräutigam</button>\r\n            </div>\r\n            <div class=\"col-xs-1 \">\r\n                ${answerStatistics.mr}\r\n            </div>\r\n            <div class=\"col-xs-5\">\r\n                <div class=\"progress\">\r\n                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"50\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: ${statsMr}%;\">\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"row top10\">\r\n            <div class=\"col-xs-6 \">\r\n                <button type=\"button\" class=\"btn btn-default btn-block\">Beide</button>\r\n            </div>\r\n            <div class=\"col-xs-1 \">\r\n                ${answerStatistics.both}\r\n            </div>\r\n            <div class=\"col-xs-5\">\r\n                <div class=\"progress\">\r\n                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: ${statsBoth}%;\">\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <highscore-table model.bind=\"highscoreTableModel\"></highscore-table>\r\n</template>"; });
define('text!home/index.html', ['module'], function(module) { module.exports = "<template>\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <p>Einem bestehenden Spiel beitreten. Den Spielcode erfährst du von deinem Spielleiter.</p>\r\n            <p><a class=\"btn btn-primary btn-lg\" href=\"#/game/join\" role=\"button\" data-test-id=\"join-game\">Spiel beitreten</a></p>\r\n            <hr />\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <p>Jetzt ein neues Spiel erstellen und alle mitraten lassen. Spiele werden 14 Tage lang gespeichert.</p>\r\n            <p><a class=\"btn btn-primary btn-lg\" click.trigger=\"createGame()\" role=\"button\" data-test-id=\"create-game\">Spiel erstellen</a></p>\r\n            <hr />\r\n        </div>\r\n    </div>\r\n\r\n</template>"; });
define('text!lobby/lobby.html', ['module'], function(module) { module.exports = "<template>\r\n    <div class=\"jumbotron\">\r\n        <h2>Ela & Patrick (Lobby)</h2>\r\n        <p>Gäste: </p>\r\n\r\n        <ul>\r\n            <li repeat.for=\"name of playerlist\">${name}</li>\r\n        </ul>\r\n        <input type=\"button\" disabled=\"disabled\" class=\"btn btn-lg btn-default\" href=\"#\" role=\"button\" value=\"Warte auf Moderator...\"></input>\r\n\r\n    </div>\r\n</template>"; });
define('text!question/question.html', ['module'], function(module) { module.exports = "<template>\r\n    <div class=\"row breadcrumb\">\r\n        <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\" show.bind=\"isModerator\">\r\n            <span>Moderator</span>\r\n        </div>\r\n        <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\">\r\n            Frage <span data-test-id=\"current-question-number\">${questionIndex + 1}</span> von <span data-test-id=\"total-question-number\">${game.questions.length}</span>\r\n        </div>\r\n    </div>\r\n    <div class=\"row\">\r\n        <div class=\"text-center\" data-test-id=\"current-question\">\r\n            ${currentQuestion}\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 col-xs-offset-3\">\r\n            <button type=\"button\" class=\"btn btn-default btn-block ${selectedAnswer === 0 ? 'active' : ''}\" click.trigger=\"selectAnswer(0)\" data-test-id=\"select-mrs\">Die Braut</button>\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 col-xs-offset-3\">\r\n            <button type=\"button\" class=\"btn btn-default btn-block ${selectedAnswer === 1 ? 'active' : ''}\" click.trigger=\"selectAnswer(1)\" data-test-id=\"select-mr\">Der Bräutigam</button>\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 col-xs-offset-3\">\r\n            <button type=\"button\" class=\"btn btn-default btn-block ${selectedAnswer === 2 ? 'active' : ''}\" click.trigger=\"selectAnswer(2)\" data-test-id=\"select-both\">Beide</button>\r\n        </div>\r\n    </div>\r\n    <hr />\r\n    <div show.bind=\"isModerator && !isLastQuestion\">\r\n        <button type=\"button\" class=\"btn btn-primary\" click.trigger=\"nextQuestion()\" data-test-id=\"next-question\">Nächste Frage</button>\r\n    </div>\r\n    <div show.bind=\"isModerator && isLastQuestion\">\r\n        <button type=\"button\" class=\"btn btn-primary\" click.trigger=\"endGame()\" data-test-id=\"end-game\">Spiel beenden</button>\r\n    </div>\r\n    <div show.bind=\"!isModerator\">\r\n        <button type=\"button\" class=\"btn btn-primary\">Warten auf Moderator...</button>\r\n    </div>\r\n</template>"; });
//# sourceMappingURL=app-bundle.js.map