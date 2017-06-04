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

            this.playerlist = ["Noch keine Spieler"];
            this.signalrService = signalrService;
            this.eventAggregator = eventAggregator;
            this.router = router;
            this.nameMr = "";
            this.nameMrs = "";
        }

        create.prototype.activate = function activate(params) {
            var _this = this;

            var self = this;
            this.gameId = params.gameId;
            window.localStorage.setItem("username", "moderator");
            window.localStorage.setItem("currentGame", this.gameId);
            window.localStorage.setItem("isModerator", true);

            this.signalrService.verifyConnected(this.gameId).then(function (game) {
                self.game = game;
                self.questions = game.questions;

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

        return create;
    }()) || _class);
});
define('game/edit-questions',['exports', 'services/signalr-service', 'aurelia-framework', './create'], function (exports, _signalrService, _aureliaFramework, _create) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Question = exports.EditQuestions = undefined;

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

  var _dec, _class;

  var EditQuestions = exports.EditQuestions = (_dec = (0, _aureliaFramework.inject)(_create.create, _signalrService.SignalrService), _dec(_class = function () {
    function EditQuestions(parentModel, signalrService) {
      _classCallCheck(this, EditQuestions);

      this.parentModel = parentModel;
      this.signalrService = signalrService;
      this.newQuestionText = "";
      this.buttonsDisabled = false;
    }

    EditQuestions.prototype.activate = function activate(questions) {
      var _this = this;

      this.questions = questions;
      this.questionsModel = [];

      for (var i = 0; i < this.questions.length; i++) {
        this.questionsModel.push(new Question(this.questions[i], function () {
          return _this.updateQuestions();
        }));
      }
    };

    EditQuestions.prototype.deleteQuestion = function deleteQuestion(question) {
      var index = this.questionsModel.indexOf(question);
      this.questionsModel.splice(index, 1);
      this.updateQuestions();
    };

    EditQuestions.prototype.addQuestion = function addQuestion() {
      var _this2 = this;

      var questionToCreate = new Question(this.newQuestionText, function () {
        return _this2.updateQuestions();
      });
      this.questionsModel.push(questionToCreate);
      this.updateQuestions();
      this.newQuestionText = "";
    };

    EditQuestions.prototype.moveUp = function moveUp(question) {
      console.log("move question up", question.text);
      var currentIndex = this.questionsModel.indexOf(question);
      this.move(question, currentIndex - 1);
    };

    EditQuestions.prototype.moveDown = function moveDown(question) {
      console.log("move question down", question.text);
      var currentIndex = this.questionsModel.indexOf(question);
      this.move(question, currentIndex + 1);
    };

    EditQuestions.prototype.move = function move(question, targetIndex) {
      var currentIndex = this.questionsModel.indexOf(question);
      var questionToMove = this.questionsModel[targetIndex];
      this.questionsModel.splice(targetIndex, 1, question);
      this.questionsModel.splice(currentIndex, 1, questionToMove);
      this.updateQuestions();
    };

    EditQuestions.prototype.updateQuestions = function updateQuestions() {
      var self = this;
      self.buttonsDisabled = true;
      var rawQuestions = this.questionsModel.map(function (question) {
        return question.text;
      });

      console.log("questions to update:", rawQuestions);

      this.signalrService.updateQuestions(rawQuestions).then(function () {
        console.log("questions updated on server");
        self.buttonsDisabled = false;
      });
    };

    _createClass(EditQuestions, [{
      key: 'lastQuestion',
      get: function get() {
        return this.questionsModel[this.questionsModel.length - 1];
      }
    }, {
      key: 'firstQuestion',
      get: function get() {
        return this.questionsModel[0];
      }
    }]);

    return EditQuestions;
  }()) || _class);

  var Question = exports.Question = function () {
    function Question(text, triggerUpdateCallback) {
      _classCallCheck(this, Question);

      this.text = text;
      this.editActive = false;
      this.triggerUpdateCallback = triggerUpdateCallback;
    }

    Question.prototype.changeEditState = function changeEditState() {
      this.editActive = true;
    };

    Question.prototype.updateText = function updateText() {
      this.editActive = false;
      this.triggerUpdateCallback();
    };

    return Question;
  }();
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

  var HighscoreTableCustomElement = exports.HighscoreTableCustomElement = (_class = function () {
    function HighscoreTableCustomElement() {
      _classCallCheck(this, HighscoreTableCustomElement);

      _initDefineProp(this, 'model', _descriptor, this);
    }

    HighscoreTableCustomElement.prototype.activate = function activate(questions) {
      debugger;
    };

    return HighscoreTableCustomElement;
  }(), (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'model', [_aureliaFramework.bindable], {
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

            this.previousQuestionIndex = -1;
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

                if (game.currentQuestionIndex !== self.previousQuestionIndex) {
                    self.answerStatistics.mr = 0;
                    self.answerStatistics.mrs = 0;
                    self.answerStatistics.both = 0;
                }
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
                    console.log("we should update playerlist now.");
                    console.log(updatedPlayerList);
                    self.playerlist = updatedPlayerList;
                });

                _this.eventAggregator.subscribe("gameStarted", function (game) {
                    self.router.navigateToRoute("question", {
                        isModerator: false,
                        gameId: game.gameId
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

    var _dec, _class;

    var question = exports.question = (_dec = (0, _aureliaFramework.inject)(_signalrService.SignalrService, _aureliaEventAggregator.EventAggregator, _aureliaRouter.Router), _dec(_class = function () {
        function question(signalrService, eventAggregator, router) {
            _classCallCheck(this, question);

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

        _createClass(question, [{
            key: 'nextQuestionButtonDisabled',
            get: function get() {
                return this.selectedAnswer === -1;
            }
        }]);

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
define('text!app.html', ['module'], function(module) { module.exports = "<template>\r\n    <require from=\"styles/bootstrap.min.css\"></require>\r\n    <require from='styles/styles.css'></require>\r\n    <div class=\"container\">\r\n        <div class=\"row\">\r\n            <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n                <h1 class=\"handwriting\">Mister & Misses</h1>\r\n                <hr />\r\n            </div>\r\n        </div>\r\n        <div class=\"row\">\r\n            <router-view class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"></router-view>\r\n        </div>\r\n    </div>\r\n</template>"; });
define('text!styles/bootstrap.min.css', ['module'], function(module) { module.exports = "/*! Generated by Live LESS Theme Customizer */\r\n.label,sub,sup{vertical-align:baseline}\r\nbody,figure{margin:0}\r\n.navbar-fixed-bottom .navbar-collapse,.navbar-fixed-top .navbar-collapse,.pre-scrollable{max-height:340px}\r\nhtml{font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;font-size:10px;-webkit-tap-highlight-color:transparent}\r\narticle,aside,details,figcaption,figure,footer,header,hgroup,main,menu,nav,section,summary{display:block}\r\naudio,canvas,progress,video{display:inline-block;vertical-align:baseline}\r\naudio:not([controls]){display:none;height:0}\r\n[hidden],template{display:none}\r\na{background-color:transparent}\r\na:active,a:hover{outline:0}\r\nb,optgroup,strong{font-weight:700}\r\ndfn{font-style:italic}\r\nh1{margin:.67em 0}\r\nmark{background:#ff0;color:#000}\r\nsub,sup{font-size:75%;line-height:0;position:relative}\r\nsup{top:-.5em}\r\nsub{bottom:-.25em}\r\nimg{border:0;vertical-align:middle}\r\nsvg:not(:root){overflow:hidden}\r\nhr{box-sizing:content-box;height:0}\r\npre,textarea{overflow:auto}\r\ncode,kbd,pre,samp{font-size:1em}\r\nbutton,input,optgroup,select,textarea{color:inherit;font:inherit;margin:0}\r\nbutton{overflow:visible}\r\nbutton,select{text-transform:none}\r\nbutton,html input[type=button],input[type=reset],input[type=submit]{-webkit-appearance:button;cursor:pointer}\r\nbutton[disabled],html input[disabled]{cursor:default}\r\nbutton::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}\r\ninput[type=checkbox],input[type=radio]{box-sizing:border-box;padding:0}\r\ninput[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{height:auto}\r\ninput[type=search]::-webkit-search-cancel-button,input[type=search]::-webkit-search-decoration{-webkit-appearance:none}\r\ntable{border-collapse:collapse;border-spacing:0}\r\ntd,th{padding:0}\r\n@media print{blockquote,img,pre,tr{page-break-inside:avoid}\r\n*,:after,:before{background:0 0!important;color:#000!important;box-shadow:none!important;text-shadow:none!important}\r\na,a:visited{text-decoration:underline}\r\na[href]:after{content:\" (\" attr(href) \")\"}\r\nabbr[title]:after{content:\" (\" attr(title) \")\"}\r\na[href^=\"javascript:\"]:after,a[href^=\"#\"]:after{content:\"\"}\r\nblockquote,pre{border:1px solid #999}\r\nthead{display:table-header-group}\r\nimg{max-width:100%!important}\r\nh2,h3,p{orphans:3;widows:3}\r\nh2,h3{page-break-after:avoid}\r\n.navbar{display:none}\r\n.btn>.caret,.dropup>.btn>.caret{border-top-color:#000!important}\r\n.label{border:1px solid #000}\r\n.table{border-collapse:collapse!important}\r\n.table td,.table th{background-color:#fff!important}\r\n.table-bordered td,.table-bordered th{border:1px solid #ddd!important}\r\n}\r\n.img-thumbnail,body{background-color:#fff}\r\n.btn,.btn-danger.active,.btn-danger:active,.btn-default.active,.btn-default:active,.btn-info.active,.btn-info:active,.btn-primary.active,.btn-primary:active,.btn-warning.active,.btn-warning:active,.btn.active,.btn:active,.dropdown-menu>.disabled>a:focus,.dropdown-menu>.disabled>a:hover,.form-control,.navbar-toggle,.open>.dropdown-toggle.btn-danger,.open>.dropdown-toggle.btn-default,.open>.dropdown-toggle.btn-info,.open>.dropdown-toggle.btn-primary,.open>.dropdown-toggle.btn-warning{background-image:none}\r\n@font-face{font-family:'Glyphicons Halflings';src:url(../fonts/glyphicons-halflings-regular.eot);src:url(../fonts/glyphicons-halflings-regular.eot?#iefix) format('embedded-opentype'),url(../fonts/glyphicons-halflings-regular.woff2) format('woff2'),url(../fonts/glyphicons-halflings-regular.woff) format('woff'),url(../fonts/glyphicons-halflings-regular.ttf) format('truetype'),url(../fonts/glyphicons-halflings-regular.svg#glyphicons_halflingsregular) format('svg')}\r\n.glyphicon{position:relative;top:1px;display:inline-block;font-family:'Glyphicons Halflings';font-style:normal;font-weight:400;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}\r\n.glyphicon-asterisk:before{content:\"\\002a\"}\r\n.glyphicon-plus:before{content:\"\\002b\"}\r\n.glyphicon-eur:before,.glyphicon-euro:before{content:\"\\20ac\"}\r\n.glyphicon-minus:before{content:\"\\2212\"}\r\n.glyphicon-cloud:before{content:\"\\2601\"}\r\n.glyphicon-envelope:before{content:\"\\2709\"}\r\n.glyphicon-pencil:before{content:\"\\270f\"}\r\n.glyphicon-glass:before{content:\"\\e001\"}\r\n.glyphicon-music:before{content:\"\\e002\"}\r\n.glyphicon-search:before{content:\"\\e003\"}\r\n.glyphicon-heart:before{content:\"\\e005\"}\r\n.glyphicon-star:before{content:\"\\e006\"}\r\n.glyphicon-star-empty:before{content:\"\\e007\"}\r\n.glyphicon-user:before{content:\"\\e008\"}\r\n.glyphicon-film:before{content:\"\\e009\"}\r\n.glyphicon-th-large:before{content:\"\\e010\"}\r\n.glyphicon-th:before{content:\"\\e011\"}\r\n.glyphicon-th-list:before{content:\"\\e012\"}\r\n.glyphicon-ok:before{content:\"\\e013\"}\r\n.glyphicon-remove:before{content:\"\\e014\"}\r\n.glyphicon-zoom-in:before{content:\"\\e015\"}\r\n.glyphicon-zoom-out:before{content:\"\\e016\"}\r\n.glyphicon-off:before{content:\"\\e017\"}\r\n.glyphicon-signal:before{content:\"\\e018\"}\r\n.glyphicon-cog:before{content:\"\\e019\"}\r\n.glyphicon-trash:before{content:\"\\e020\"}\r\n.glyphicon-home:before{content:\"\\e021\"}\r\n.glyphicon-file:before{content:\"\\e022\"}\r\n.glyphicon-time:before{content:\"\\e023\"}\r\n.glyphicon-road:before{content:\"\\e024\"}\r\n.glyphicon-download-alt:before{content:\"\\e025\"}\r\n.glyphicon-download:before{content:\"\\e026\"}\r\n.glyphicon-upload:before{content:\"\\e027\"}\r\n.glyphicon-inbox:before{content:\"\\e028\"}\r\n.glyphicon-play-circle:before{content:\"\\e029\"}\r\n.glyphicon-repeat:before{content:\"\\e030\"}\r\n.glyphicon-refresh:before{content:\"\\e031\"}\r\n.glyphicon-list-alt:before{content:\"\\e032\"}\r\n.glyphicon-lock:before{content:\"\\e033\"}\r\n.glyphicon-flag:before{content:\"\\e034\"}\r\n.glyphicon-headphones:before{content:\"\\e035\"}\r\n.glyphicon-volume-off:before{content:\"\\e036\"}\r\n.glyphicon-volume-down:before{content:\"\\e037\"}\r\n.glyphicon-volume-up:before{content:\"\\e038\"}\r\n.glyphicon-qrcode:before{content:\"\\e039\"}\r\n.glyphicon-barcode:before{content:\"\\e040\"}\r\n.glyphicon-tag:before{content:\"\\e041\"}\r\n.glyphicon-tags:before{content:\"\\e042\"}\r\n.glyphicon-book:before{content:\"\\e043\"}\r\n.glyphicon-bookmark:before{content:\"\\e044\"}\r\n.glyphicon-print:before{content:\"\\e045\"}\r\n.glyphicon-camera:before{content:\"\\e046\"}\r\n.glyphicon-font:before{content:\"\\e047\"}\r\n.glyphicon-bold:before{content:\"\\e048\"}\r\n.glyphicon-italic:before{content:\"\\e049\"}\r\n.glyphicon-text-height:before{content:\"\\e050\"}\r\n.glyphicon-text-width:before{content:\"\\e051\"}\r\n.glyphicon-align-left:before{content:\"\\e052\"}\r\n.glyphicon-align-center:before{content:\"\\e053\"}\r\n.glyphicon-align-right:before{content:\"\\e054\"}\r\n.glyphicon-align-justify:before{content:\"\\e055\"}\r\n.glyphicon-list:before{content:\"\\e056\"}\r\n.glyphicon-indent-left:before{content:\"\\e057\"}\r\n.glyphicon-indent-right:before{content:\"\\e058\"}\r\n.glyphicon-facetime-video:before{content:\"\\e059\"}\r\n.glyphicon-picture:before{content:\"\\e060\"}\r\n.glyphicon-map-marker:before{content:\"\\e062\"}\r\n.glyphicon-adjust:before{content:\"\\e063\"}\r\n.glyphicon-tint:before{content:\"\\e064\"}\r\n.glyphicon-edit:before{content:\"\\e065\"}\r\n.glyphicon-share:before{content:\"\\e066\"}\r\n.glyphicon-check:before{content:\"\\e067\"}\r\n.glyphicon-move:before{content:\"\\e068\"}\r\n.glyphicon-step-backward:before{content:\"\\e069\"}\r\n.glyphicon-fast-backward:before{content:\"\\e070\"}\r\n.glyphicon-backward:before{content:\"\\e071\"}\r\n.glyphicon-play:before{content:\"\\e072\"}\r\n.glyphicon-pause:before{content:\"\\e073\"}\r\n.glyphicon-stop:before{content:\"\\e074\"}\r\n.glyphicon-forward:before{content:\"\\e075\"}\r\n.glyphicon-fast-forward:before{content:\"\\e076\"}\r\n.glyphicon-step-forward:before{content:\"\\e077\"}\r\n.glyphicon-eject:before{content:\"\\e078\"}\r\n.glyphicon-chevron-left:before{content:\"\\e079\"}\r\n.glyphicon-chevron-right:before{content:\"\\e080\"}\r\n.glyphicon-plus-sign:before{content:\"\\e081\"}\r\n.glyphicon-minus-sign:before{content:\"\\e082\"}\r\n.glyphicon-remove-sign:before{content:\"\\e083\"}\r\n.glyphicon-ok-sign:before{content:\"\\e084\"}\r\n.glyphicon-question-sign:before{content:\"\\e085\"}\r\n.glyphicon-info-sign:before{content:\"\\e086\"}\r\n.glyphicon-screenshot:before{content:\"\\e087\"}\r\n.glyphicon-remove-circle:before{content:\"\\e088\"}\r\n.glyphicon-ok-circle:before{content:\"\\e089\"}\r\n.glyphicon-ban-circle:before{content:\"\\e090\"}\r\n.glyphicon-arrow-left:before{content:\"\\e091\"}\r\n.glyphicon-arrow-right:before{content:\"\\e092\"}\r\n.glyphicon-arrow-up:before{content:\"\\e093\"}\r\n.glyphicon-arrow-down:before{content:\"\\e094\"}\r\n.glyphicon-share-alt:before{content:\"\\e095\"}\r\n.glyphicon-resize-full:before{content:\"\\e096\"}\r\n.glyphicon-resize-small:before{content:\"\\e097\"}\r\n.glyphicon-exclamation-sign:before{content:\"\\e101\"}\r\n.glyphicon-gift:before{content:\"\\e102\"}\r\n.glyphicon-leaf:before{content:\"\\e103\"}\r\n.glyphicon-fire:before{content:\"\\e104\"}\r\n.glyphicon-eye-open:before{content:\"\\e105\"}\r\n.glyphicon-eye-close:before{content:\"\\e106\"}\r\n.glyphicon-warning-sign:before{content:\"\\e107\"}\r\n.glyphicon-plane:before{content:\"\\e108\"}\r\n.glyphicon-calendar:before{content:\"\\e109\"}\r\n.glyphicon-random:before{content:\"\\e110\"}\r\n.glyphicon-comment:before{content:\"\\e111\"}\r\n.glyphicon-magnet:before{content:\"\\e112\"}\r\n.glyphicon-chevron-up:before{content:\"\\e113\"}\r\n.glyphicon-chevron-down:before{content:\"\\e114\"}\r\n.glyphicon-retweet:before{content:\"\\e115\"}\r\n.glyphicon-shopping-cart:before{content:\"\\e116\"}\r\n.glyphicon-folder-close:before{content:\"\\e117\"}\r\n.glyphicon-folder-open:before{content:\"\\e118\"}\r\n.glyphicon-resize-vertical:before{content:\"\\e119\"}\r\n.glyphicon-resize-horizontal:before{content:\"\\e120\"}\r\n.glyphicon-hdd:before{content:\"\\e121\"}\r\n.glyphicon-bullhorn:before{content:\"\\e122\"}\r\n.glyphicon-bell:before{content:\"\\e123\"}\r\n.glyphicon-certificate:before{content:\"\\e124\"}\r\n.glyphicon-thumbs-up:before{content:\"\\e125\"}\r\n.glyphicon-thumbs-down:before{content:\"\\e126\"}\r\n.glyphicon-hand-right:before{content:\"\\e127\"}\r\n.glyphicon-hand-left:before{content:\"\\e128\"}\r\n.glyphicon-hand-up:before{content:\"\\e129\"}\r\n.glyphicon-hand-down:before{content:\"\\e130\"}\r\n.glyphicon-circle-arrow-right:before{content:\"\\e131\"}\r\n.glyphicon-circle-arrow-left:before{content:\"\\e132\"}\r\n.glyphicon-circle-arrow-up:before{content:\"\\e133\"}\r\n.glyphicon-circle-arrow-down:before{content:\"\\e134\"}\r\n.glyphicon-globe:before{content:\"\\e135\"}\r\n.glyphicon-wrench:before{content:\"\\e136\"}\r\n.glyphicon-tasks:before{content:\"\\e137\"}\r\n.glyphicon-filter:before{content:\"\\e138\"}\r\n.glyphicon-briefcase:before{content:\"\\e139\"}\r\n.glyphicon-fullscreen:before{content:\"\\e140\"}\r\n.glyphicon-dashboard:before{content:\"\\e141\"}\r\n.glyphicon-paperclip:before{content:\"\\e142\"}\r\n.glyphicon-heart-empty:before{content:\"\\e143\"}\r\n.glyphicon-link:before{content:\"\\e144\"}\r\n.glyphicon-phone:before{content:\"\\e145\"}\r\n.glyphicon-pushpin:before{content:\"\\e146\"}\r\n.glyphicon-usd:before{content:\"\\e148\"}\r\n.glyphicon-gbp:before{content:\"\\e149\"}\r\n.glyphicon-sort:before{content:\"\\e150\"}\r\n.glyphicon-sort-by-alphabet:before{content:\"\\e151\"}\r\n.glyphicon-sort-by-alphabet-alt:before{content:\"\\e152\"}\r\n.glyphicon-sort-by-order:before{content:\"\\e153\"}\r\n.glyphicon-sort-by-order-alt:before{content:\"\\e154\"}\r\n.glyphicon-sort-by-attributes:before{content:\"\\e155\"}\r\n.glyphicon-sort-by-attributes-alt:before{content:\"\\e156\"}\r\n.glyphicon-unchecked:before{content:\"\\e157\"}\r\n.glyphicon-expand:before{content:\"\\e158\"}\r\n.glyphicon-collapse-down:before{content:\"\\e159\"}\r\n.glyphicon-collapse-up:before{content:\"\\e160\"}\r\n.glyphicon-log-in:before{content:\"\\e161\"}\r\n.glyphicon-flash:before{content:\"\\e162\"}\r\n.glyphicon-log-out:before{content:\"\\e163\"}\r\n.glyphicon-new-window:before{content:\"\\e164\"}\r\n.glyphicon-record:before{content:\"\\e165\"}\r\n.glyphicon-save:before{content:\"\\e166\"}\r\n.glyphicon-open:before{content:\"\\e167\"}\r\n.glyphicon-saved:before{content:\"\\e168\"}\r\n.glyphicon-import:before{content:\"\\e169\"}\r\n.glyphicon-export:before{content:\"\\e170\"}\r\n.glyphicon-send:before{content:\"\\e171\"}\r\n.glyphicon-floppy-disk:before{content:\"\\e172\"}\r\n.glyphicon-floppy-saved:before{content:\"\\e173\"}\r\n.glyphicon-floppy-remove:before{content:\"\\e174\"}\r\n.glyphicon-floppy-save:before{content:\"\\e175\"}\r\n.glyphicon-floppy-open:before{content:\"\\e176\"}\r\n.glyphicon-credit-card:before{content:\"\\e177\"}\r\n.glyphicon-transfer:before{content:\"\\e178\"}\r\n.glyphicon-cutlery:before{content:\"\\e179\"}\r\n.glyphicon-header:before{content:\"\\e180\"}\r\n.glyphicon-compressed:before{content:\"\\e181\"}\r\n.glyphicon-earphone:before{content:\"\\e182\"}\r\n.glyphicon-phone-alt:before{content:\"\\e183\"}\r\n.glyphicon-tower:before{content:\"\\e184\"}\r\n.glyphicon-stats:before{content:\"\\e185\"}\r\n.glyphicon-sd-video:before{content:\"\\e186\"}\r\n.glyphicon-hd-video:before{content:\"\\e187\"}\r\n.glyphicon-subtitles:before{content:\"\\e188\"}\r\n.glyphicon-sound-stereo:before{content:\"\\e189\"}\r\n.glyphicon-sound-dolby:before{content:\"\\e190\"}\r\n.glyphicon-sound-5-1:before{content:\"\\e191\"}\r\n.glyphicon-sound-6-1:before{content:\"\\e192\"}\r\n.glyphicon-sound-7-1:before{content:\"\\e193\"}\r\n.glyphicon-copyright-mark:before{content:\"\\e194\"}\r\n.glyphicon-registration-mark:before{content:\"\\e195\"}\r\n.glyphicon-cloud-download:before{content:\"\\e197\"}\r\n.glyphicon-cloud-upload:before{content:\"\\e198\"}\r\n.glyphicon-tree-conifer:before{content:\"\\e199\"}\r\n.glyphicon-tree-deciduous:before{content:\"\\e200\"}\r\n.glyphicon-cd:before{content:\"\\e201\"}\r\n.glyphicon-save-file:before{content:\"\\e202\"}\r\n.glyphicon-open-file:before{content:\"\\e203\"}\r\n.glyphicon-level-up:before{content:\"\\e204\"}\r\n.glyphicon-copy:before{content:\"\\e205\"}\r\n.glyphicon-paste:before{content:\"\\e206\"}\r\n.glyphicon-alert:before{content:\"\\e209\"}\r\n.glyphicon-equalizer:before{content:\"\\e210\"}\r\n.glyphicon-king:before{content:\"\\e211\"}\r\n.glyphicon-queen:before{content:\"\\e212\"}\r\n.glyphicon-pawn:before{content:\"\\e213\"}\r\n.glyphicon-bishop:before{content:\"\\e214\"}\r\n.glyphicon-knight:before{content:\"\\e215\"}\r\n.glyphicon-baby-formula:before{content:\"\\e216\"}\r\n.glyphicon-tent:before{content:\"\\26fa\"}\r\n.glyphicon-blackboard:before{content:\"\\e218\"}\r\n.glyphicon-bed:before{content:\"\\e219\"}\r\n.glyphicon-apple:before{content:\"\\f8ff\"}\r\n.glyphicon-erase:before{content:\"\\e221\"}\r\n.glyphicon-hourglass:before{content:\"\\231b\"}\r\n.glyphicon-lamp:before{content:\"\\e223\"}\r\n.glyphicon-duplicate:before{content:\"\\e224\"}\r\n.glyphicon-piggy-bank:before{content:\"\\e225\"}\r\n.glyphicon-scissors:before{content:\"\\e226\"}\r\n.glyphicon-bitcoin:before,.glyphicon-btc:before,.glyphicon-xbt:before{content:\"\\e227\"}\r\n.glyphicon-jpy:before,.glyphicon-yen:before{content:\"\\00a5\"}\r\n.glyphicon-rub:before,.glyphicon-ruble:before{content:\"\\20bd\"}\r\n.glyphicon-scale:before{content:\"\\e230\"}\r\n.glyphicon-ice-lolly:before{content:\"\\e231\"}\r\n.glyphicon-ice-lolly-tasted:before{content:\"\\e232\"}\r\n.glyphicon-education:before{content:\"\\e233\"}\r\n.glyphicon-option-horizontal:before{content:\"\\e234\"}\r\n.glyphicon-option-vertical:before{content:\"\\e235\"}\r\n.glyphicon-menu-hamburger:before{content:\"\\e236\"}\r\n.glyphicon-modal-window:before{content:\"\\e237\"}\r\n.glyphicon-oil:before{content:\"\\e238\"}\r\n.glyphicon-grain:before{content:\"\\e239\"}\r\n.glyphicon-sunglasses:before{content:\"\\e240\"}\r\n.glyphicon-text-size:before{content:\"\\e241\"}\r\n.glyphicon-text-color:before{content:\"\\e242\"}\r\n.glyphicon-text-background:before{content:\"\\e243\"}\r\n.glyphicon-object-align-top:before{content:\"\\e244\"}\r\n.glyphicon-object-align-bottom:before{content:\"\\e245\"}\r\n.glyphicon-object-align-horizontal:before{content:\"\\e246\"}\r\n.glyphicon-object-align-left:before{content:\"\\e247\"}\r\n.glyphicon-object-align-vertical:before{content:\"\\e248\"}\r\n.glyphicon-object-align-right:before{content:\"\\e249\"}\r\n.glyphicon-triangle-right:before{content:\"\\e250\"}\r\n.glyphicon-triangle-left:before{content:\"\\e251\"}\r\n.glyphicon-triangle-bottom:before{content:\"\\e252\"}\r\n.glyphicon-triangle-top:before{content:\"\\e253\"}\r\n.glyphicon-console:before{content:\"\\e254\"}\r\n.glyphicon-superscript:before{content:\"\\e255\"}\r\n.glyphicon-subscript:before{content:\"\\e256\"}\r\n.glyphicon-menu-left:before{content:\"\\e257\"}\r\n.glyphicon-menu-right:before{content:\"\\e258\"}\r\n.glyphicon-menu-down:before{content:\"\\e259\"}\r\n.glyphicon-menu-up:before{content:\"\\e260\"}\r\n*,:after,:before{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}\r\nbody{font-family:\"Helvetica Neue\",Helvetica,Arial,sans-serif;font-size:14px;line-height:1.42857143;color:#333}\r\nbutton,input,select,textarea{font-family:inherit;font-size:inherit;line-height:inherit}\r\na{color:#de0000;text-decoration:none}\r\na:focus,a:hover{color:#910000;text-decoration:underline}\r\na:focus{outline:-webkit-focus-ring-color auto 5px;outline-offset:-2px}\r\n.carousel-inner>.item>a>img,.carousel-inner>.item>img,.img-responsive,.thumbnail a>img,.thumbnail>img{display:block;max-width:100%;height:auto}\r\n.img-rounded{border-radius:6px}\r\n.img-thumbnail{padding:4px;line-height:1.42857143;border:1px solid #ddd;border-radius:4px;-webkit-transition:all .2s ease-in-out;-o-transition:all .2s ease-in-out;transition:all .2s ease-in-out;display:inline-block;max-width:100%;height:auto}\r\n.img-circle{border-radius:50%}\r\nhr{margin-top:20px;margin-bottom:20px;border:0;border-top:1px solid #eee}\r\n.sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);border:0}\r\n.sr-only-focusable:active,.sr-only-focusable:focus{position:static;width:auto;height:auto;margin:0;overflow:visible;clip:auto}\r\n[role=button]{cursor:pointer}\r\n.h1,.h2,.h3,.h4,.h5,.h6,h1,h2,h3,h4,h5,h6{font-family:inherit;font-weight:500;line-height:1.1;color:inherit}\r\n.h1 .small,.h1 small,.h2 .small,.h2 small,.h3 .small,.h3 small,.h4 .small,.h4 small,.h5 .small,.h5 small,.h6 .small,.h6 small,h1 .small,h1 small,h2 .small,h2 small,h3 .small,h3 small,h4 .small,h4 small,h5 .small,h5 small,h6 .small,h6 small{font-weight:400;line-height:1;color:#777}\r\n.h1,.h2,.h3,h1,h2,h3{margin-top:20px;margin-bottom:10px}\r\n.h1 .small,.h1 small,.h2 .small,.h2 small,.h3 .small,.h3 small,h1 .small,h1 small,h2 .small,h2 small,h3 .small,h3 small{font-size:65%}\r\n.h4,.h5,.h6,h4,h5,h6{margin-top:10px;margin-bottom:10px}\r\n.h4 .small,.h4 small,.h5 .small,.h5 small,.h6 .small,.h6 small,h4 .small,h4 small,h5 .small,h5 small,h6 .small,h6 small{font-size:75%}\r\n.h1,h1{font-size:36px}\r\n.h2,h2{font-size:30px}\r\n.h3,h3{font-size:24px}\r\n.h4,h4{font-size:18px}\r\n.h5,h5{font-size:14px}\r\n.h6,h6{font-size:12px}\r\np{margin:0 0 10px}\r\n.lead{margin-bottom:20px;font-size:16px;font-weight:300;line-height:1.4}\r\naddress,blockquote .small,blockquote footer,blockquote small,dd,dt,pre{line-height:1.42857143}\r\ndt,kbd kbd,label{font-weight:700}\r\n@media (min-width:768px){.lead{font-size:21px}\r\n}\r\n.small,small{font-size:85%}\r\n.mark,mark{background-color:#fcf8e3;padding:.2em}\r\n.list-inline,.list-unstyled{list-style:none;padding-left:0}\r\n.text-left{text-align:left}\r\n.text-right{text-align:right}\r\n.btn,.text-center{text-align:center}\r\n.text-justify{text-align:justify}\r\n.text-nowrap{white-space:nowrap}\r\n.text-lowercase{text-transform:lowercase}\r\n.text-uppercase{text-transform:uppercase}\r\n.text-capitalize{text-transform:capitalize}\r\n.text-muted{color:#777}\r\n.text-primary{color:#de0000}\r\na.text-primary:focus,a.text-primary:hover{color:#ab0000}\r\n.text-success{color:#3c763d}\r\na.text-success:focus,a.text-success:hover{color:#2b542c}\r\n.text-info{color:#31708f}\r\na.text-info:focus,a.text-info:hover{color:#245269}\r\n.text-warning{color:#8a6d3b}\r\na.text-warning:focus,a.text-warning:hover{color:#66512c}\r\n.text-danger{color:#a94442}\r\na.text-danger:focus,a.text-danger:hover{color:#843534}\r\n.bg-primary{color:#fff;background-color:#de0000}\r\na.bg-primary:focus,a.bg-primary:hover{background-color:#ab0000}\r\n.bg-success{background-color:#dff0d8}\r\na.bg-success:focus,a.bg-success:hover{background-color:#c1e2b3}\r\n.bg-info{background-color:#d9edf7}\r\na.bg-info:focus,a.bg-info:hover{background-color:#afd9ee}\r\n.bg-warning{background-color:#fcf8e3}\r\na.bg-warning:focus,a.bg-warning:hover{background-color:#f7ecb5}\r\n.bg-danger{background-color:#f2dede}\r\na.bg-danger:focus,a.bg-danger:hover{background-color:#e4b9b9}\r\npre code,table{background-color:transparent}\r\n.page-header{padding-bottom:9px;margin:40px 0 20px;border-bottom:1px solid #eee}\r\ndl,ol,ul{margin-top:0}\r\nol,ul{margin-bottom:10px}\r\nol ol,ol ul,ul ol,ul ul{margin-bottom:0}\r\n.list-inline{margin-left:-5px}\r\n.list-inline>li{display:inline-block;padding-left:5px;padding-right:5px}\r\ndl{margin-bottom:20px}\r\ndd{margin-left:0}\r\n@media (min-width:768px){.dl-horizontal dt{float:left;width:160px;clear:left;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\r\n.dl-horizontal dd{margin-left:180px}\r\n}\r\nabbr[data-original-title],abbr[title]{cursor:help;border-bottom:1px dotted #777}\r\n.initialism{font-size:90%;text-transform:uppercase}\r\nblockquote{padding:10px 20px;margin:0 0 20px;font-size:17.5px;border-left:5px solid #eee}\r\nblockquote ol:last-child,blockquote p:last-child,blockquote ul:last-child{margin-bottom:0}\r\nblockquote .small,blockquote footer,blockquote small{display:block;font-size:80%;color:#777}\r\nblockquote .small:before,blockquote footer:before,blockquote small:before{content:'\\2014 \\00A0'}\r\n.blockquote-reverse,blockquote.pull-right{padding-right:15px;padding-left:0;border-right:5px solid #eee;border-left:0;text-align:right}\r\ncaption,th{text-align:left}\r\ncode,kbd{padding:2px 4px;font-size:90%}\r\n.blockquote-reverse .small:before,.blockquote-reverse footer:before,.blockquote-reverse small:before,blockquote.pull-right .small:before,blockquote.pull-right footer:before,blockquote.pull-right small:before{content:''}\r\n.blockquote-reverse .small:after,.blockquote-reverse footer:after,.blockquote-reverse small:after,blockquote.pull-right .small:after,blockquote.pull-right footer:after,blockquote.pull-right small:after{content:'\\00A0 \\2014'}\r\naddress{margin-bottom:20px;font-style:normal}\r\ncode,kbd,pre,samp{font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace}\r\ncode{color:#c7254e;background-color:#f9f2f4;border-radius:4px}\r\nkbd{color:#fff;background-color:#333;border-radius:3px;box-shadow:inset 0 -1px 0 rgba(0,0,0,.25)}\r\nkbd kbd{padding:0;font-size:100%;box-shadow:none}\r\npre{display:block;padding:9.5px;margin:0 0 10px;font-size:13px;word-break:break-all;word-wrap:break-word;color:#333;background-color:#f5f5f5;border:1px solid #ccc;border-radius:4px}\r\n.container,.container-fluid{margin-right:auto;margin-left:auto}\r\npre code{padding:0;font-size:inherit;color:inherit;white-space:pre-wrap;border-radius:0}\r\n.container,.container-fluid{padding-left:15px;padding-right:15px}\r\n.pre-scrollable{overflow-y:scroll}\r\n@media (min-width:768px){.container{width:750px}\r\n}\r\n@media (min-width:992px){.container{width:970px}\r\n}\r\n@media (min-width:1200px){.container{width:1170px}\r\n}\r\n.row{margin-left:-15px;margin-right:-15px}\r\n.col-lg-1,.col-lg-10,.col-lg-11,.col-lg-12,.col-lg-2,.col-lg-3,.col-lg-4,.col-lg-5,.col-lg-6,.col-lg-7,.col-lg-8,.col-lg-9,.col-md-1,.col-md-10,.col-md-11,.col-md-12,.col-md-2,.col-md-3,.col-md-4,.col-md-5,.col-md-6,.col-md-7,.col-md-8,.col-md-9,.col-sm-1,.col-sm-10,.col-sm-11,.col-sm-12,.col-sm-2,.col-sm-3,.col-sm-4,.col-sm-5,.col-sm-6,.col-sm-7,.col-sm-8,.col-sm-9,.col-xs-1,.col-xs-10,.col-xs-11,.col-xs-12,.col-xs-2,.col-xs-3,.col-xs-4,.col-xs-5,.col-xs-6,.col-xs-7,.col-xs-8,.col-xs-9{position:relative;min-height:1px;padding-left:15px;padding-right:15px}\r\n.col-xs-1,.col-xs-10,.col-xs-11,.col-xs-12,.col-xs-2,.col-xs-3,.col-xs-4,.col-xs-5,.col-xs-6,.col-xs-7,.col-xs-8,.col-xs-9{float:left}\r\n.col-xs-12{width:100%}\r\n.col-xs-11{width:91.66666667%}\r\n.col-xs-10{width:83.33333333%}\r\n.col-xs-9{width:75%}\r\n.col-xs-8{width:66.66666667%}\r\n.col-xs-7{width:58.33333333%}\r\n.col-xs-6{width:50%}\r\n.col-xs-5{width:41.66666667%}\r\n.col-xs-4{width:33.33333333%}\r\n.col-xs-3{width:25%}\r\n.col-xs-2{width:16.66666667%}\r\n.col-xs-1{width:8.33333333%}\r\n.col-xs-pull-12{right:100%}\r\n.col-xs-pull-11{right:91.66666667%}\r\n.col-xs-pull-10{right:83.33333333%}\r\n.col-xs-pull-9{right:75%}\r\n.col-xs-pull-8{right:66.66666667%}\r\n.col-xs-pull-7{right:58.33333333%}\r\n.col-xs-pull-6{right:50%}\r\n.col-xs-pull-5{right:41.66666667%}\r\n.col-xs-pull-4{right:33.33333333%}\r\n.col-xs-pull-3{right:25%}\r\n.col-xs-pull-2{right:16.66666667%}\r\n.col-xs-pull-1{right:8.33333333%}\r\n.col-xs-pull-0{right:auto}\r\n.col-xs-push-12{left:100%}\r\n.col-xs-push-11{left:91.66666667%}\r\n.col-xs-push-10{left:83.33333333%}\r\n.col-xs-push-9{left:75%}\r\n.col-xs-push-8{left:66.66666667%}\r\n.col-xs-push-7{left:58.33333333%}\r\n.col-xs-push-6{left:50%}\r\n.col-xs-push-5{left:41.66666667%}\r\n.col-xs-push-4{left:33.33333333%}\r\n.col-xs-push-3{left:25%}\r\n.col-xs-push-2{left:16.66666667%}\r\n.col-xs-push-1{left:8.33333333%}\r\n.col-xs-push-0{left:auto}\r\n.col-xs-offset-12{margin-left:100%}\r\n.col-xs-offset-11{margin-left:91.66666667%}\r\n.col-xs-offset-10{margin-left:83.33333333%}\r\n.col-xs-offset-9{margin-left:75%}\r\n.col-xs-offset-8{margin-left:66.66666667%}\r\n.col-xs-offset-7{margin-left:58.33333333%}\r\n.col-xs-offset-6{margin-left:50%}\r\n.col-xs-offset-5{margin-left:41.66666667%}\r\n.col-xs-offset-4{margin-left:33.33333333%}\r\n.col-xs-offset-3{margin-left:25%}\r\n.col-xs-offset-2{margin-left:16.66666667%}\r\n.col-xs-offset-1{margin-left:8.33333333%}\r\n.col-xs-offset-0{margin-left:0}\r\n@media (min-width:768px){.col-sm-1,.col-sm-10,.col-sm-11,.col-sm-12,.col-sm-2,.col-sm-3,.col-sm-4,.col-sm-5,.col-sm-6,.col-sm-7,.col-sm-8,.col-sm-9{float:left}\r\n.col-sm-12{width:100%}\r\n.col-sm-11{width:91.66666667%}\r\n.col-sm-10{width:83.33333333%}\r\n.col-sm-9{width:75%}\r\n.col-sm-8{width:66.66666667%}\r\n.col-sm-7{width:58.33333333%}\r\n.col-sm-6{width:50%}\r\n.col-sm-5{width:41.66666667%}\r\n.col-sm-4{width:33.33333333%}\r\n.col-sm-3{width:25%}\r\n.col-sm-2{width:16.66666667%}\r\n.col-sm-1{width:8.33333333%}\r\n.col-sm-pull-12{right:100%}\r\n.col-sm-pull-11{right:91.66666667%}\r\n.col-sm-pull-10{right:83.33333333%}\r\n.col-sm-pull-9{right:75%}\r\n.col-sm-pull-8{right:66.66666667%}\r\n.col-sm-pull-7{right:58.33333333%}\r\n.col-sm-pull-6{right:50%}\r\n.col-sm-pull-5{right:41.66666667%}\r\n.col-sm-pull-4{right:33.33333333%}\r\n.col-sm-pull-3{right:25%}\r\n.col-sm-pull-2{right:16.66666667%}\r\n.col-sm-pull-1{right:8.33333333%}\r\n.col-sm-pull-0{right:auto}\r\n.col-sm-push-12{left:100%}\r\n.col-sm-push-11{left:91.66666667%}\r\n.col-sm-push-10{left:83.33333333%}\r\n.col-sm-push-9{left:75%}\r\n.col-sm-push-8{left:66.66666667%}\r\n.col-sm-push-7{left:58.33333333%}\r\n.col-sm-push-6{left:50%}\r\n.col-sm-push-5{left:41.66666667%}\r\n.col-sm-push-4{left:33.33333333%}\r\n.col-sm-push-3{left:25%}\r\n.col-sm-push-2{left:16.66666667%}\r\n.col-sm-push-1{left:8.33333333%}\r\n.col-sm-push-0{left:auto}\r\n.col-sm-offset-12{margin-left:100%}\r\n.col-sm-offset-11{margin-left:91.66666667%}\r\n.col-sm-offset-10{margin-left:83.33333333%}\r\n.col-sm-offset-9{margin-left:75%}\r\n.col-sm-offset-8{margin-left:66.66666667%}\r\n.col-sm-offset-7{margin-left:58.33333333%}\r\n.col-sm-offset-6{margin-left:50%}\r\n.col-sm-offset-5{margin-left:41.66666667%}\r\n.col-sm-offset-4{margin-left:33.33333333%}\r\n.col-sm-offset-3{margin-left:25%}\r\n.col-sm-offset-2{margin-left:16.66666667%}\r\n.col-sm-offset-1{margin-left:8.33333333%}\r\n.col-sm-offset-0{margin-left:0}\r\n}\r\n@media (min-width:992px){.col-md-1,.col-md-10,.col-md-11,.col-md-12,.col-md-2,.col-md-3,.col-md-4,.col-md-5,.col-md-6,.col-md-7,.col-md-8,.col-md-9{float:left}\r\n.col-md-12{width:100%}\r\n.col-md-11{width:91.66666667%}\r\n.col-md-10{width:83.33333333%}\r\n.col-md-9{width:75%}\r\n.col-md-8{width:66.66666667%}\r\n.col-md-7{width:58.33333333%}\r\n.col-md-6{width:50%}\r\n.col-md-5{width:41.66666667%}\r\n.col-md-4{width:33.33333333%}\r\n.col-md-3{width:25%}\r\n.col-md-2{width:16.66666667%}\r\n.col-md-1{width:8.33333333%}\r\n.col-md-pull-12{right:100%}\r\n.col-md-pull-11{right:91.66666667%}\r\n.col-md-pull-10{right:83.33333333%}\r\n.col-md-pull-9{right:75%}\r\n.col-md-pull-8{right:66.66666667%}\r\n.col-md-pull-7{right:58.33333333%}\r\n.col-md-pull-6{right:50%}\r\n.col-md-pull-5{right:41.66666667%}\r\n.col-md-pull-4{right:33.33333333%}\r\n.col-md-pull-3{right:25%}\r\n.col-md-pull-2{right:16.66666667%}\r\n.col-md-pull-1{right:8.33333333%}\r\n.col-md-pull-0{right:auto}\r\n.col-md-push-12{left:100%}\r\n.col-md-push-11{left:91.66666667%}\r\n.col-md-push-10{left:83.33333333%}\r\n.col-md-push-9{left:75%}\r\n.col-md-push-8{left:66.66666667%}\r\n.col-md-push-7{left:58.33333333%}\r\n.col-md-push-6{left:50%}\r\n.col-md-push-5{left:41.66666667%}\r\n.col-md-push-4{left:33.33333333%}\r\n.col-md-push-3{left:25%}\r\n.col-md-push-2{left:16.66666667%}\r\n.col-md-push-1{left:8.33333333%}\r\n.col-md-push-0{left:auto}\r\n.col-md-offset-12{margin-left:100%}\r\n.col-md-offset-11{margin-left:91.66666667%}\r\n.col-md-offset-10{margin-left:83.33333333%}\r\n.col-md-offset-9{margin-left:75%}\r\n.col-md-offset-8{margin-left:66.66666667%}\r\n.col-md-offset-7{margin-left:58.33333333%}\r\n.col-md-offset-6{margin-left:50%}\r\n.col-md-offset-5{margin-left:41.66666667%}\r\n.col-md-offset-4{margin-left:33.33333333%}\r\n.col-md-offset-3{margin-left:25%}\r\n.col-md-offset-2{margin-left:16.66666667%}\r\n.col-md-offset-1{margin-left:8.33333333%}\r\n.col-md-offset-0{margin-left:0}\r\n}\r\n@media (min-width:1200px){.col-lg-1,.col-lg-10,.col-lg-11,.col-lg-12,.col-lg-2,.col-lg-3,.col-lg-4,.col-lg-5,.col-lg-6,.col-lg-7,.col-lg-8,.col-lg-9{float:left}\r\n.col-lg-12{width:100%}\r\n.col-lg-11{width:91.66666667%}\r\n.col-lg-10{width:83.33333333%}\r\n.col-lg-9{width:75%}\r\n.col-lg-8{width:66.66666667%}\r\n.col-lg-7{width:58.33333333%}\r\n.col-lg-6{width:50%}\r\n.col-lg-5{width:41.66666667%}\r\n.col-lg-4{width:33.33333333%}\r\n.col-lg-3{width:25%}\r\n.col-lg-2{width:16.66666667%}\r\n.col-lg-1{width:8.33333333%}\r\n.col-lg-pull-12{right:100%}\r\n.col-lg-pull-11{right:91.66666667%}\r\n.col-lg-pull-10{right:83.33333333%}\r\n.col-lg-pull-9{right:75%}\r\n.col-lg-pull-8{right:66.66666667%}\r\n.col-lg-pull-7{right:58.33333333%}\r\n.col-lg-pull-6{right:50%}\r\n.col-lg-pull-5{right:41.66666667%}\r\n.col-lg-pull-4{right:33.33333333%}\r\n.col-lg-pull-3{right:25%}\r\n.col-lg-pull-2{right:16.66666667%}\r\n.col-lg-pull-1{right:8.33333333%}\r\n.col-lg-pull-0{right:auto}\r\n.col-lg-push-12{left:100%}\r\n.col-lg-push-11{left:91.66666667%}\r\n.col-lg-push-10{left:83.33333333%}\r\n.col-lg-push-9{left:75%}\r\n.col-lg-push-8{left:66.66666667%}\r\n.col-lg-push-7{left:58.33333333%}\r\n.col-lg-push-6{left:50%}\r\n.col-lg-push-5{left:41.66666667%}\r\n.col-lg-push-4{left:33.33333333%}\r\n.col-lg-push-3{left:25%}\r\n.col-lg-push-2{left:16.66666667%}\r\n.col-lg-push-1{left:8.33333333%}\r\n.col-lg-push-0{left:auto}\r\n.col-lg-offset-12{margin-left:100%}\r\n.col-lg-offset-11{margin-left:91.66666667%}\r\n.col-lg-offset-10{margin-left:83.33333333%}\r\n.col-lg-offset-9{margin-left:75%}\r\n.col-lg-offset-8{margin-left:66.66666667%}\r\n.col-lg-offset-7{margin-left:58.33333333%}\r\n.col-lg-offset-6{margin-left:50%}\r\n.col-lg-offset-5{margin-left:41.66666667%}\r\n.col-lg-offset-4{margin-left:33.33333333%}\r\n.col-lg-offset-3{margin-left:25%}\r\n.col-lg-offset-2{margin-left:16.66666667%}\r\n.col-lg-offset-1{margin-left:8.33333333%}\r\n.col-lg-offset-0{margin-left:0}\r\n}\r\ncaption{padding-top:8px;padding-bottom:8px;color:#777}\r\n.table{width:100%;max-width:100%;margin-bottom:20px}\r\n.table>tbody>tr>td,.table>tbody>tr>th,.table>tfoot>tr>td,.table>tfoot>tr>th,.table>thead>tr>td,.table>thead>tr>th{padding:8px;line-height:1.42857143;vertical-align:top;border-top:1px solid #ddd}\r\n.table>thead>tr>th{vertical-align:bottom;border-bottom:2px solid #ddd}\r\n.table>caption+thead>tr:first-child>td,.table>caption+thead>tr:first-child>th,.table>colgroup+thead>tr:first-child>td,.table>colgroup+thead>tr:first-child>th,.table>thead:first-child>tr:first-child>td,.table>thead:first-child>tr:first-child>th{border-top:0}\r\n.table>tbody+tbody{border-top:2px solid #ddd}\r\n.table .table{background-color:#fff}\r\n.table-condensed>tbody>tr>td,.table-condensed>tbody>tr>th,.table-condensed>tfoot>tr>td,.table-condensed>tfoot>tr>th,.table-condensed>thead>tr>td,.table-condensed>thead>tr>th{padding:5px}\r\n.table-bordered,.table-bordered>tbody>tr>td,.table-bordered>tbody>tr>th,.table-bordered>tfoot>tr>td,.table-bordered>tfoot>tr>th,.table-bordered>thead>tr>td,.table-bordered>thead>tr>th{border:1px solid #ddd}\r\n.table-bordered>thead>tr>td,.table-bordered>thead>tr>th{border-bottom-width:2px}\r\n.table-striped>tbody>tr:nth-of-type(odd){background-color:#f9f9f9}\r\n.table-hover>tbody>tr:hover,.table>tbody>tr.active>td,.table>tbody>tr.active>th,.table>tbody>tr>td.active,.table>tbody>tr>th.active,.table>tfoot>tr.active>td,.table>tfoot>tr.active>th,.table>tfoot>tr>td.active,.table>tfoot>tr>th.active,.table>thead>tr.active>td,.table>thead>tr.active>th,.table>thead>tr>td.active,.table>thead>tr>th.active{background-color:#f5f5f5}\r\ntable col[class*=col-]{position:static;float:none;display:table-column}\r\ntable td[class*=col-],table th[class*=col-]{position:static;float:none;display:table-cell}\r\n.btn-group>.btn-group,.btn-toolbar .btn,.btn-toolbar .btn-group,.btn-toolbar .input-group,.dropdown-menu{float:left}\r\n.table-hover>tbody>tr.active:hover>td,.table-hover>tbody>tr.active:hover>th,.table-hover>tbody>tr:hover>.active,.table-hover>tbody>tr>td.active:hover,.table-hover>tbody>tr>th.active:hover{background-color:#e8e8e8}\r\n.table>tbody>tr.success>td,.table>tbody>tr.success>th,.table>tbody>tr>td.success,.table>tbody>tr>th.success,.table>tfoot>tr.success>td,.table>tfoot>tr.success>th,.table>tfoot>tr>td.success,.table>tfoot>tr>th.success,.table>thead>tr.success>td,.table>thead>tr.success>th,.table>thead>tr>td.success,.table>thead>tr>th.success{background-color:#dff0d8}\r\n.table-hover>tbody>tr.success:hover>td,.table-hover>tbody>tr.success:hover>th,.table-hover>tbody>tr:hover>.success,.table-hover>tbody>tr>td.success:hover,.table-hover>tbody>tr>th.success:hover{background-color:#d0e9c6}\r\n.table>tbody>tr.info>td,.table>tbody>tr.info>th,.table>tbody>tr>td.info,.table>tbody>tr>th.info,.table>tfoot>tr.info>td,.table>tfoot>tr.info>th,.table>tfoot>tr>td.info,.table>tfoot>tr>th.info,.table>thead>tr.info>td,.table>thead>tr.info>th,.table>thead>tr>td.info,.table>thead>tr>th.info{background-color:#d9edf7}\r\n.table-hover>tbody>tr.info:hover>td,.table-hover>tbody>tr.info:hover>th,.table-hover>tbody>tr:hover>.info,.table-hover>tbody>tr>td.info:hover,.table-hover>tbody>tr>th.info:hover{background-color:#c4e3f3}\r\n.table>tbody>tr.warning>td,.table>tbody>tr.warning>th,.table>tbody>tr>td.warning,.table>tbody>tr>th.warning,.table>tfoot>tr.warning>td,.table>tfoot>tr.warning>th,.table>tfoot>tr>td.warning,.table>tfoot>tr>th.warning,.table>thead>tr.warning>td,.table>thead>tr.warning>th,.table>thead>tr>td.warning,.table>thead>tr>th.warning{background-color:#fcf8e3}\r\n.table-hover>tbody>tr.warning:hover>td,.table-hover>tbody>tr.warning:hover>th,.table-hover>tbody>tr:hover>.warning,.table-hover>tbody>tr>td.warning:hover,.table-hover>tbody>tr>th.warning:hover{background-color:#faf2cc}\r\n.table>tbody>tr.danger>td,.table>tbody>tr.danger>th,.table>tbody>tr>td.danger,.table>tbody>tr>th.danger,.table>tfoot>tr.danger>td,.table>tfoot>tr.danger>th,.table>tfoot>tr>td.danger,.table>tfoot>tr>th.danger,.table>thead>tr.danger>td,.table>thead>tr.danger>th,.table>thead>tr>td.danger,.table>thead>tr>th.danger{background-color:#f2dede}\r\n.table-hover>tbody>tr.danger:hover>td,.table-hover>tbody>tr.danger:hover>th,.table-hover>tbody>tr:hover>.danger,.table-hover>tbody>tr>td.danger:hover,.table-hover>tbody>tr>th.danger:hover{background-color:#ebcccc}\r\n.table-responsive{overflow-x:auto;min-height:.01%}\r\n@media screen and (max-width:767px){.table-responsive{width:100%;margin-bottom:15px;overflow-y:hidden;-ms-overflow-style:-ms-autohiding-scrollbar;border:1px solid #ddd}\r\n.table-responsive>.table{margin-bottom:0}\r\n.table-responsive>.table>tbody>tr>td,.table-responsive>.table>tbody>tr>th,.table-responsive>.table>tfoot>tr>td,.table-responsive>.table>tfoot>tr>th,.table-responsive>.table>thead>tr>td,.table-responsive>.table>thead>tr>th{white-space:nowrap}\r\n.table-responsive>.table-bordered{border:0}\r\n.table-responsive>.table-bordered>tbody>tr>td:first-child,.table-responsive>.table-bordered>tbody>tr>th:first-child,.table-responsive>.table-bordered>tfoot>tr>td:first-child,.table-responsive>.table-bordered>tfoot>tr>th:first-child,.table-responsive>.table-bordered>thead>tr>td:first-child,.table-responsive>.table-bordered>thead>tr>th:first-child{border-left:0}\r\n.table-responsive>.table-bordered>tbody>tr>td:last-child,.table-responsive>.table-bordered>tbody>tr>th:last-child,.table-responsive>.table-bordered>tfoot>tr>td:last-child,.table-responsive>.table-bordered>tfoot>tr>th:last-child,.table-responsive>.table-bordered>thead>tr>td:last-child,.table-responsive>.table-bordered>thead>tr>th:last-child{border-right:0}\r\n.table-responsive>.table-bordered>tbody>tr:last-child>td,.table-responsive>.table-bordered>tbody>tr:last-child>th,.table-responsive>.table-bordered>tfoot>tr:last-child>td,.table-responsive>.table-bordered>tfoot>tr:last-child>th{border-bottom:0}\r\n}\r\nfieldset,legend{padding:0;border:0}\r\nfieldset{margin:0;min-width:0}\r\nlegend{display:block;width:100%;margin-bottom:20px;font-size:21px;line-height:inherit;color:#333;border-bottom:1px solid #e5e5e5}\r\nlabel{display:inline-block;max-width:100%;margin-bottom:5px}\r\ninput[type=search]{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;-webkit-appearance:none}\r\ninput[type=checkbox],input[type=radio]{margin:4px 0 0;margin-top:1px\\9;line-height:normal}\r\n.form-control,output{display:block;font-size:14px;line-height:1.42857143;color:#555}\r\ninput[type=file]{display:block}\r\ninput[type=range]{display:block;width:100%}\r\nselect[multiple],select[size]{height:auto}\r\ninput[type=file]:focus,input[type=checkbox]:focus,input[type=radio]:focus{outline:-webkit-focus-ring-color auto 5px;outline-offset:-2px}\r\noutput{padding-top:7px}\r\n.form-control{width:100%;height:34px;padding:6px 12px;background-color:#fff;border:1px solid #ccc;border-radius:4px;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);box-shadow:inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s;-o-transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s}\r\n.form-control:focus{border-color:#66afe9;outline:0;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6)}\r\n.form-control::-moz-placeholder{color:#999;opacity:1}\r\n.form-control:-ms-input-placeholder{color:#999}\r\n.form-control::-webkit-input-placeholder{color:#999}\r\n.has-success .checkbox,.has-success .checkbox-inline,.has-success .control-label,.has-success .form-control-feedback,.has-success .help-block,.has-success .radio,.has-success .radio-inline,.has-success.checkbox label,.has-success.checkbox-inline label,.has-success.radio label,.has-success.radio-inline label{color:#3c763d}\r\n.form-control::-ms-expand{border:0;background-color:transparent}\r\n.form-control[disabled],.form-control[readonly],fieldset[disabled] .form-control{background-color:#eee;opacity:1}\r\n.form-control[disabled],fieldset[disabled] .form-control{cursor:not-allowed}\r\ntextarea.form-control{height:auto}\r\n@media screen and (-webkit-min-device-pixel-ratio:0){input[type=date].form-control,input[type=time].form-control,input[type=datetime-local].form-control,input[type=month].form-control{line-height:34px}\r\n.input-group-sm input[type=date],.input-group-sm input[type=time],.input-group-sm input[type=datetime-local],.input-group-sm input[type=month],input[type=date].input-sm,input[type=time].input-sm,input[type=datetime-local].input-sm,input[type=month].input-sm{line-height:30px}\r\n.input-group-lg input[type=date],.input-group-lg input[type=time],.input-group-lg input[type=datetime-local],.input-group-lg input[type=month],input[type=date].input-lg,input[type=time].input-lg,input[type=datetime-local].input-lg,input[type=month].input-lg{line-height:46px}\r\n}\r\n.form-group{margin-bottom:15px}\r\n.checkbox,.radio{position:relative;display:block;margin-top:10px;margin-bottom:10px}\r\n.checkbox label,.radio label{min-height:20px;padding-left:20px;margin-bottom:0;font-weight:400;cursor:pointer}\r\n.checkbox input[type=checkbox],.checkbox-inline input[type=checkbox],.radio input[type=radio],.radio-inline input[type=radio]{position:absolute;margin-left:-20px;margin-top:4px\\9}\r\n.checkbox+.checkbox,.radio+.radio{margin-top:-5px}\r\n.checkbox-inline,.radio-inline{position:relative;display:inline-block;padding-left:20px;margin-bottom:0;vertical-align:middle;font-weight:400;cursor:pointer}\r\n.checkbox-inline+.checkbox-inline,.radio-inline+.radio-inline{margin-top:0;margin-left:10px}\r\n.checkbox-inline.disabled,.checkbox.disabled label,.radio-inline.disabled,.radio.disabled label,fieldset[disabled] .checkbox label,fieldset[disabled] .checkbox-inline,fieldset[disabled] .radio label,fieldset[disabled] .radio-inline,fieldset[disabled] input[type=checkbox],fieldset[disabled] input[type=radio],input[type=checkbox].disabled,input[type=checkbox][disabled],input[type=radio].disabled,input[type=radio][disabled]{cursor:not-allowed}\r\n.form-control-static{padding-top:7px;padding-bottom:7px;margin-bottom:0;min-height:34px}\r\n.form-control-static.input-lg,.form-control-static.input-sm{padding-left:0;padding-right:0}\r\n.form-group-sm .form-control,.input-sm{font-size:12px;padding:5px 10px;border-radius:3px}\r\n.input-sm{height:30px;line-height:1.5}\r\nselect.input-sm{height:30px;line-height:30px}\r\nselect[multiple].input-sm,textarea.input-sm{height:auto}\r\n.form-group-sm .form-control{height:30px;line-height:1.5}\r\n.form-group-sm select.form-control{height:30px;line-height:30px}\r\n.form-group-sm select[multiple].form-control,.form-group-sm textarea.form-control{height:auto}\r\n.form-group-sm .form-control-static{height:30px;min-height:32px;padding:6px 10px;font-size:12px;line-height:1.5}\r\n.form-group-lg .form-control,.input-lg{font-size:18px;padding:10px 16px;border-radius:6px}\r\n.input-lg{height:46px;line-height:1.3333333}\r\nselect.input-lg{height:46px;line-height:46px}\r\nselect[multiple].input-lg,textarea.input-lg{height:auto}\r\n.form-group-lg .form-control{height:46px;line-height:1.3333333}\r\n.form-group-lg select.form-control{height:46px;line-height:46px}\r\n.form-group-lg select[multiple].form-control,.form-group-lg textarea.form-control{height:auto}\r\n.form-group-lg .form-control-static{height:46px;min-height:38px;padding:11px 16px;font-size:18px;line-height:1.3333333}\r\n.has-feedback{position:relative}\r\n.has-feedback .form-control{padding-right:42.5px}\r\n.form-control-feedback{position:absolute;top:0;right:0;z-index:2;display:block;width:34px;height:34px;line-height:34px;text-align:center;pointer-events:none}\r\n.collapsing,.dropdown,.dropup{position:relative}\r\n.form-group-lg .form-control+.form-control-feedback,.input-group-lg+.form-control-feedback,.input-lg+.form-control-feedback{width:46px;height:46px;line-height:46px}\r\n.form-group-sm .form-control+.form-control-feedback,.input-group-sm+.form-control-feedback,.input-sm+.form-control-feedback{width:30px;height:30px;line-height:30px}\r\n.has-success .form-control{border-color:#3c763d;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);box-shadow:inset 0 1px 1px rgba(0,0,0,.075)}\r\n.has-success .form-control:focus{border-color:#2b542c;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #67b168;box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #67b168}\r\n.has-success .input-group-addon{color:#3c763d;border-color:#3c763d;background-color:#dff0d8}\r\n.has-warning .checkbox,.has-warning .checkbox-inline,.has-warning .control-label,.has-warning .form-control-feedback,.has-warning .help-block,.has-warning .radio,.has-warning .radio-inline,.has-warning.checkbox label,.has-warning.checkbox-inline label,.has-warning.radio label,.has-warning.radio-inline label{color:#8a6d3b}\r\n.has-warning .form-control{border-color:#8a6d3b;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);box-shadow:inset 0 1px 1px rgba(0,0,0,.075)}\r\n.has-warning .form-control:focus{border-color:#66512c;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #c0a16b;box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #c0a16b}\r\n.has-warning .input-group-addon{color:#8a6d3b;border-color:#8a6d3b;background-color:#fcf8e3}\r\n.has-error .checkbox,.has-error .checkbox-inline,.has-error .control-label,.has-error .form-control-feedback,.has-error .help-block,.has-error .radio,.has-error .radio-inline,.has-error.checkbox label,.has-error.checkbox-inline label,.has-error.radio label,.has-error.radio-inline label{color:#a94442}\r\n.has-error .form-control{border-color:#a94442;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);box-shadow:inset 0 1px 1px rgba(0,0,0,.075)}\r\n.has-error .form-control:focus{border-color:#843534;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #ce8483;box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 6px #ce8483}\r\n.has-error .input-group-addon{color:#a94442;border-color:#a94442;background-color:#f2dede}\r\n.has-feedback label~.form-control-feedback{top:25px}\r\n.has-feedback label.sr-only~.form-control-feedback{top:0}\r\n.help-block{display:block;margin-top:5px;margin-bottom:10px;color:#737373}\r\n@media (min-width:768px){.form-inline .form-control-static,.form-inline .form-group{display:inline-block}\r\n.form-inline .control-label,.form-inline .form-group{margin-bottom:0;vertical-align:middle}\r\n.form-inline .form-control{display:inline-block;width:auto;vertical-align:middle}\r\n.form-inline .input-group{display:inline-table;vertical-align:middle}\r\n.form-inline .input-group .form-control,.form-inline .input-group .input-group-addon,.form-inline .input-group .input-group-btn{width:auto}\r\n.form-inline .input-group>.form-control{width:100%}\r\n.form-inline .checkbox,.form-inline .radio{display:inline-block;margin-top:0;margin-bottom:0;vertical-align:middle}\r\n.form-inline .checkbox label,.form-inline .radio label{padding-left:0}\r\n.form-inline .checkbox input[type=checkbox],.form-inline .radio input[type=radio]{position:relative;margin-left:0}\r\n.form-inline .has-feedback .form-control-feedback{top:0}\r\n}\r\n.form-horizontal .checkbox,.form-horizontal .checkbox-inline,.form-horizontal .radio,.form-horizontal .radio-inline{margin-top:0;margin-bottom:0;padding-top:7px}\r\n.form-horizontal .checkbox,.form-horizontal .radio{min-height:27px}\r\n.form-horizontal .form-group{margin-left:-15px;margin-right:-15px}\r\n.form-horizontal .has-feedback .form-control-feedback{right:15px}\r\n@media (min-width:768px){.form-horizontal .control-label{text-align:right;margin-bottom:0;padding-top:7px}\r\n.form-horizontal .form-group-lg .control-label{padding-top:11px;font-size:18px}\r\n.form-horizontal .form-group-sm .control-label{padding-top:6px;font-size:12px}\r\n}\r\n.btn{display:inline-block;margin-bottom:0;font-weight:400;vertical-align:middle;touch-action:manipulation;cursor:pointer;border:1px solid transparent;white-space:nowrap;padding:6px 12px;font-size:14px;line-height:1.42857143;border-radius:4px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}\r\n.btn.active.focus,.btn.active:focus,.btn.focus,.btn:active.focus,.btn:active:focus,.btn:focus{outline:-webkit-focus-ring-color auto 5px;outline-offset:-2px}\r\n.btn.focus,.btn:focus,.btn:hover{color:#333;text-decoration:none}\r\n.btn.active,.btn:active{outline:0;-webkit-box-shadow:inset 0 3px 5px rgba(0,0,0,.125);box-shadow:inset 0 3px 5px rgba(0,0,0,.125)}\r\n.btn.disabled,.btn[disabled],fieldset[disabled] .btn{cursor:not-allowed;opacity:.65;filter:alpha(opacity=65);-webkit-box-shadow:none;box-shadow:none}\r\na.btn.disabled,fieldset[disabled] a.btn{pointer-events:none}\r\n.btn-default{color:#333;background-color:#fff;border-color:#ccc}\r\n.btn-default.focus,.btn-default:focus{color:#333;background-color:#e6e6e6;border-color:#8c8c8c}\r\n.btn-default.active,.btn-default:active,.btn-default:hover,.open>.dropdown-toggle.btn-default{color:#333;background-color:#e6e6e6;border-color:#adadad}\r\n.btn-default.active.focus,.btn-default.active:focus,.btn-default.active:hover,.btn-default:active.focus,.btn-default:active:focus,.btn-default:active:hover,.open>.dropdown-toggle.btn-default.focus,.open>.dropdown-toggle.btn-default:focus,.open>.dropdown-toggle.btn-default:hover{color:#333;background-color:#d4d4d4;border-color:#8c8c8c}\r\n.btn-default.disabled.focus,.btn-default.disabled:focus,.btn-default.disabled:hover,.btn-default[disabled].focus,.btn-default[disabled]:focus,.btn-default[disabled]:hover,fieldset[disabled] .btn-default.focus,fieldset[disabled] .btn-default:focus,fieldset[disabled] .btn-default:hover{background-color:#fff;border-color:#ccc}\r\n.btn-default .badge{color:#fff;background-color:#333}\r\n.btn-primary{color:#fff;background-color:#de0000;border-color:#c40000}\r\n.btn-primary.focus,.btn-primary:focus{color:#fff;background-color:#ab0000;border-color:#450000}\r\n.btn-primary.active,.btn-primary:active,.btn-primary:hover,.open>.dropdown-toggle.btn-primary{color:#fff;background-color:#ab0000;border-color:#870000}\r\n.btn-primary.active.focus,.btn-primary.active:focus,.btn-primary.active:hover,.btn-primary:active.focus,.btn-primary:active:focus,.btn-primary:active:hover,.open>.dropdown-toggle.btn-primary.focus,.open>.dropdown-toggle.btn-primary:focus,.open>.dropdown-toggle.btn-primary:hover{color:#fff;background-color:#870000;border-color:#450000}\r\n.btn-primary.disabled.focus,.btn-primary.disabled:focus,.btn-primary.disabled:hover,.btn-primary[disabled].focus,.btn-primary[disabled]:focus,.btn-primary[disabled]:hover,fieldset[disabled] .btn-primary.focus,fieldset[disabled] .btn-primary:focus,fieldset[disabled] .btn-primary:hover{background-color:#de0000;border-color:#c40000}\r\n.btn-primary .badge{color:#de0000;background-color:#fff}\r\n.btn-success{color:#fff;background-color:#5cb85c;border-color:#4cae4c}\r\n.btn-success.focus,.btn-success:focus{color:#fff;background-color:#449d44;border-color:#255625}\r\n.btn-success.active,.btn-success:active,.btn-success:hover,.open>.dropdown-toggle.btn-success{color:#fff;background-color:#449d44;border-color:#398439}\r\n.btn-success.active.focus,.btn-success.active:focus,.btn-success.active:hover,.btn-success:active.focus,.btn-success:active:focus,.btn-success:active:hover,.open>.dropdown-toggle.btn-success.focus,.open>.dropdown-toggle.btn-success:focus,.open>.dropdown-toggle.btn-success:hover{color:#fff;background-color:#398439;border-color:#255625}\r\n.btn-success.active,.btn-success:active,.open>.dropdown-toggle.btn-success{background-image:none}\r\n.btn-success.disabled.focus,.btn-success.disabled:focus,.btn-success.disabled:hover,.btn-success[disabled].focus,.btn-success[disabled]:focus,.btn-success[disabled]:hover,fieldset[disabled] .btn-success.focus,fieldset[disabled] .btn-success:focus,fieldset[disabled] .btn-success:hover{background-color:#5cb85c;border-color:#4cae4c}\r\n.btn-success .badge{color:#5cb85c;background-color:#fff}\r\n.btn-info{color:#fff;background-color:#5bc0de;border-color:#46b8da}\r\n.btn-info.focus,.btn-info:focus{color:#fff;background-color:#31b0d5;border-color:#1b6d85}\r\n.btn-info.active,.btn-info:active,.btn-info:hover,.open>.dropdown-toggle.btn-info{color:#fff;background-color:#31b0d5;border-color:#269abc}\r\n.btn-info.active.focus,.btn-info.active:focus,.btn-info.active:hover,.btn-info:active.focus,.btn-info:active:focus,.btn-info:active:hover,.open>.dropdown-toggle.btn-info.focus,.open>.dropdown-toggle.btn-info:focus,.open>.dropdown-toggle.btn-info:hover{color:#fff;background-color:#269abc;border-color:#1b6d85}\r\n.btn-info.disabled.focus,.btn-info.disabled:focus,.btn-info.disabled:hover,.btn-info[disabled].focus,.btn-info[disabled]:focus,.btn-info[disabled]:hover,fieldset[disabled] .btn-info.focus,fieldset[disabled] .btn-info:focus,fieldset[disabled] .btn-info:hover{background-color:#5bc0de;border-color:#46b8da}\r\n.btn-info .badge{color:#5bc0de;background-color:#fff}\r\n.btn-warning{color:#fff;background-color:#f0ad4e;border-color:#eea236}\r\n.btn-warning.focus,.btn-warning:focus{color:#fff;background-color:#ec971f;border-color:#985f0d}\r\n.btn-warning.active,.btn-warning:active,.btn-warning:hover,.open>.dropdown-toggle.btn-warning{color:#fff;background-color:#ec971f;border-color:#d58512}\r\n.btn-warning.active.focus,.btn-warning.active:focus,.btn-warning.active:hover,.btn-warning:active.focus,.btn-warning:active:focus,.btn-warning:active:hover,.open>.dropdown-toggle.btn-warning.focus,.open>.dropdown-toggle.btn-warning:focus,.open>.dropdown-toggle.btn-warning:hover{color:#fff;background-color:#d58512;border-color:#985f0d}\r\n.btn-warning.disabled.focus,.btn-warning.disabled:focus,.btn-warning.disabled:hover,.btn-warning[disabled].focus,.btn-warning[disabled]:focus,.btn-warning[disabled]:hover,fieldset[disabled] .btn-warning.focus,fieldset[disabled] .btn-warning:focus,fieldset[disabled] .btn-warning:hover{background-color:#f0ad4e;border-color:#eea236}\r\n.btn-warning .badge{color:#f0ad4e;background-color:#fff}\r\n.btn-danger{color:#fff;background-color:#d9534f;border-color:#d43f3a}\r\n.btn-danger.focus,.btn-danger:focus{color:#fff;background-color:#c9302c;border-color:#761c19}\r\n.btn-danger.active,.btn-danger:active,.btn-danger:hover,.open>.dropdown-toggle.btn-danger{color:#fff;background-color:#c9302c;border-color:#ac2925}\r\n.btn-danger.active.focus,.btn-danger.active:focus,.btn-danger.active:hover,.btn-danger:active.focus,.btn-danger:active:focus,.btn-danger:active:hover,.open>.dropdown-toggle.btn-danger.focus,.open>.dropdown-toggle.btn-danger:focus,.open>.dropdown-toggle.btn-danger:hover{color:#fff;background-color:#ac2925;border-color:#761c19}\r\n.btn-danger.disabled.focus,.btn-danger.disabled:focus,.btn-danger.disabled:hover,.btn-danger[disabled].focus,.btn-danger[disabled]:focus,.btn-danger[disabled]:hover,fieldset[disabled] .btn-danger.focus,fieldset[disabled] .btn-danger:focus,fieldset[disabled] .btn-danger:hover{background-color:#d9534f;border-color:#d43f3a}\r\n.btn-danger .badge{color:#d9534f;background-color:#fff}\r\n.btn-link{color:#de0000;font-weight:400;border-radius:0}\r\n.btn-link,.btn-link.active,.btn-link:active,.btn-link[disabled],fieldset[disabled] .btn-link{background-color:transparent;-webkit-box-shadow:none;box-shadow:none}\r\n.btn-link,.btn-link:active,.btn-link:focus,.btn-link:hover{border-color:transparent}\r\n.btn-link:focus,.btn-link:hover{color:#910000;text-decoration:underline;background-color:transparent}\r\n.btn-link[disabled]:focus,.btn-link[disabled]:hover,fieldset[disabled] .btn-link:focus,fieldset[disabled] .btn-link:hover{color:#777;text-decoration:none}\r\n.btn-group-lg>.btn,.btn-lg{padding:10px 16px;font-size:18px;line-height:1.3333333;border-radius:6px}\r\n.btn-group-sm>.btn,.btn-sm{padding:5px 10px;font-size:12px;line-height:1.5;border-radius:3px}\r\n.btn-group-xs>.btn,.btn-xs{padding:1px 5px;font-size:12px;line-height:1.5;border-radius:3px}\r\n.btn-block{display:block;width:100%}\r\n.btn-block+.btn-block{margin-top:5px}\r\ninput[type=button].btn-block,input[type=reset].btn-block,input[type=submit].btn-block{width:100%}\r\n.fade{opacity:0;-webkit-transition:opacity .15s linear;-o-transition:opacity .15s linear;transition:opacity .15s linear}\r\n.fade.in{opacity:1}\r\n.collapse{display:none}\r\n.collapse.in{display:block}\r\ntr.collapse.in{display:table-row}\r\ntbody.collapse.in{display:table-row-group}\r\n.collapsing{height:0;overflow:hidden;-webkit-transition-property:height,visibility;transition-property:height,visibility;-webkit-transition-duration:.35s;transition-duration:.35s;-webkit-transition-timing-function:ease;transition-timing-function:ease}\r\n.caret{display:inline-block;width:0;height:0;margin-left:2px;vertical-align:middle;border-top:4px dashed;border-top:4px solid\\9;border-right:4px solid transparent;border-left:4px solid transparent}\r\n.dropdown-toggle:focus{outline:0}\r\n.dropdown-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;min-width:160px;padding:5px 0;margin:2px 0 0;list-style:none;font-size:14px;text-align:left;background-color:#fff;border:1px solid #ccc;border:1px solid rgba(0,0,0,.15);border-radius:4px;-webkit-box-shadow:0 6px 12px rgba(0,0,0,.175);box-shadow:0 6px 12px rgba(0,0,0,.175);background-clip:padding-box}\r\n.btn-group>.btn-group:first-child:not(:last-child)>.btn:last-child,.btn-group>.btn-group:first-child:not(:last-child)>.dropdown-toggle,.btn-group>.btn:first-child:not(:last-child):not(.dropdown-toggle){border-bottom-right-radius:0;border-top-right-radius:0}\r\n.btn-group>.btn-group:last-child:not(:first-child)>.btn:first-child,.btn-group>.btn:last-child:not(:first-child),.btn-group>.dropdown-toggle:not(:first-child){border-bottom-left-radius:0;border-top-left-radius:0}\r\n.btn-group-vertical>.btn:not(:first-child):not(:last-child),.btn-group>.btn-group:not(:first-child):not(:last-child)>.btn,.btn-group>.btn:not(:first-child):not(:last-child):not(.dropdown-toggle){border-radius:0}\r\n.dropdown-header,.dropdown-menu>li>a{white-space:nowrap;padding:3px 20px;line-height:1.42857143}\r\n.dropdown-menu-right,.dropdown-menu.pull-right{left:auto;right:0}\r\n.dropdown-menu .divider{height:1px;margin:9px 0;overflow:hidden;background-color:#e5e5e5}\r\n.dropdown-menu>li>a{display:block;clear:both;font-weight:400;color:#333}\r\n.dropdown-menu>li>a:focus,.dropdown-menu>li>a:hover{text-decoration:none;color:#262626;background-color:#f5f5f5}\r\n.dropdown-menu>.active>a,.dropdown-menu>.active>a:focus,.dropdown-menu>.active>a:hover{color:#fff;text-decoration:none;outline:0;background-color:#de0000}\r\n.dropdown-menu>.disabled>a,.dropdown-menu>.disabled>a:focus,.dropdown-menu>.disabled>a:hover{color:#777}\r\n.dropdown-menu>.disabled>a:focus,.dropdown-menu>.disabled>a:hover{text-decoration:none;background-color:transparent;filter:progid:DXImageTransform.Microsoft.gradient(enabled=false);cursor:not-allowed}\r\n.open>.dropdown-menu{display:block}\r\n.open>a{outline:0}\r\n.dropdown-menu-left{left:0;right:auto}\r\n.dropdown-header{display:block;font-size:12px;color:#777}\r\n.dropdown-backdrop{position:fixed;left:0;right:0;bottom:0;top:0;z-index:990}\r\n.nav-justified>.dropdown .dropdown-menu,.nav-tabs.nav-justified>.dropdown .dropdown-menu{left:auto;top:auto}\r\n.pull-right>.dropdown-menu{right:0;left:auto}\r\n.dropup .caret,.navbar-fixed-bottom .dropdown .caret{border-top:0;border-bottom:4px dashed;border-bottom:4px solid\\9;content:\"\"}\r\n.dropup .dropdown-menu,.navbar-fixed-bottom .dropdown .dropdown-menu{top:auto;bottom:100%;margin-bottom:2px}\r\n@media (min-width:768px){.navbar-right .dropdown-menu{left:auto;right:0}\r\n.navbar-right .dropdown-menu-left{left:0;right:auto}\r\n}\r\n.btn-group,.btn-group-vertical{position:relative;display:inline-block;vertical-align:middle}\r\n.btn-group-vertical>.btn,.btn-group>.btn{position:relative;float:left}\r\n.btn-group-vertical>.btn.active,.btn-group-vertical>.btn:active,.btn-group-vertical>.btn:focus,.btn-group-vertical>.btn:hover,.btn-group>.btn.active,.btn-group>.btn:active,.btn-group>.btn:focus,.btn-group>.btn:hover{z-index:2}\r\n.btn-group .btn+.btn,.btn-group .btn+.btn-group,.btn-group .btn-group+.btn,.btn-group .btn-group+.btn-group{margin-left:-1px}\r\n.btn-toolbar{margin-left:-5px}\r\n.btn-toolbar>.btn,.btn-toolbar>.btn-group,.btn-toolbar>.input-group{margin-left:5px}\r\n.btn .caret,.btn-group>.btn:first-child{margin-left:0}\r\n.btn-group .dropdown-toggle:active,.btn-group.open .dropdown-toggle{outline:0}\r\n.btn-group>.btn+.dropdown-toggle{padding-left:8px;padding-right:8px}\r\n.btn-group>.btn-lg+.dropdown-toggle{padding-left:12px;padding-right:12px}\r\n.btn-group.open .dropdown-toggle{-webkit-box-shadow:inset 0 3px 5px rgba(0,0,0,.125);box-shadow:inset 0 3px 5px rgba(0,0,0,.125)}\r\n.btn-group.open .dropdown-toggle.btn-link{-webkit-box-shadow:none;box-shadow:none}\r\n.btn-lg .caret{border-width:5px 5px 0}\r\n.dropup .btn-lg .caret{border-width:0 5px 5px}\r\n.btn-group-vertical>.btn,.btn-group-vertical>.btn-group,.btn-group-vertical>.btn-group>.btn{display:block;float:none;width:100%;max-width:100%}\r\n.media-object.img-thumbnail,.nav>li>a>img{max-width:none}\r\n.btn-group-vertical>.btn-group>.btn{float:none}\r\n.btn-group-vertical>.btn+.btn,.btn-group-vertical>.btn+.btn-group,.btn-group-vertical>.btn-group+.btn,.btn-group-vertical>.btn-group+.btn-group{margin-top:-1px;margin-left:0}\r\n.btn-group-vertical>.btn:first-child:not(:last-child){border-radius:4px 4px 0 0}\r\n.btn-group-vertical>.btn:last-child:not(:first-child){border-radius:0 0 4px 4px}\r\n.btn-group-vertical>.btn-group:not(:first-child):not(:last-child)>.btn{border-radius:0}\r\n.btn-group-vertical>.btn-group:first-child:not(:last-child)>.btn:last-child,.btn-group-vertical>.btn-group:first-child:not(:last-child)>.dropdown-toggle{border-bottom-right-radius:0;border-bottom-left-radius:0}\r\n.btn-group-vertical>.btn-group:last-child:not(:first-child)>.btn:first-child{border-top-right-radius:0;border-top-left-radius:0}\r\n.btn-group-justified{display:table;width:100%;table-layout:fixed;border-collapse:separate}\r\n.btn-group-justified>.btn,.btn-group-justified>.btn-group{float:none;display:table-cell;width:1%}\r\n.btn-group-justified>.btn-group .btn{width:100%}\r\n.btn-group-justified>.btn-group .dropdown-menu{left:auto}\r\n[data-toggle=buttons]>.btn input[type=checkbox],[data-toggle=buttons]>.btn input[type=radio],[data-toggle=buttons]>.btn-group>.btn input[type=checkbox],[data-toggle=buttons]>.btn-group>.btn input[type=radio]{position:absolute;clip:rect(0,0,0,0);pointer-events:none}\r\n.input-group{position:relative;display:table;border-collapse:separate}\r\n.input-group[class*=col-]{float:none;padding-left:0;padding-right:0}\r\n.input-group .form-control{position:relative;z-index:2;float:left;width:100%;margin-bottom:0}\r\n.input-group .form-control:focus{z-index:3}\r\n.input-group-lg>.form-control,.input-group-lg>.input-group-addon,.input-group-lg>.input-group-btn>.btn{height:46px;padding:10px 16px;font-size:18px;line-height:1.3333333;border-radius:6px}\r\nselect.input-group-lg>.form-control,select.input-group-lg>.input-group-addon,select.input-group-lg>.input-group-btn>.btn{height:46px;line-height:46px}\r\nselect[multiple].input-group-lg>.form-control,select[multiple].input-group-lg>.input-group-addon,select[multiple].input-group-lg>.input-group-btn>.btn,textarea.input-group-lg>.form-control,textarea.input-group-lg>.input-group-addon,textarea.input-group-lg>.input-group-btn>.btn{height:auto}\r\n.input-group-sm>.form-control,.input-group-sm>.input-group-addon,.input-group-sm>.input-group-btn>.btn{height:30px;padding:5px 10px;font-size:12px;line-height:1.5;border-radius:3px}\r\nselect.input-group-sm>.form-control,select.input-group-sm>.input-group-addon,select.input-group-sm>.input-group-btn>.btn{height:30px;line-height:30px}\r\nselect[multiple].input-group-sm>.form-control,select[multiple].input-group-sm>.input-group-addon,select[multiple].input-group-sm>.input-group-btn>.btn,textarea.input-group-sm>.form-control,textarea.input-group-sm>.input-group-addon,textarea.input-group-sm>.input-group-btn>.btn{height:auto}\r\n.input-group .form-control,.input-group-addon,.input-group-btn{display:table-cell}\r\n.nav>li,.nav>li>a{position:relative;display:block}\r\n.input-group .form-control:not(:first-child):not(:last-child),.input-group-addon:not(:first-child):not(:last-child),.input-group-btn:not(:first-child):not(:last-child){border-radius:0}\r\n.input-group-addon,.input-group-btn{width:1%;white-space:nowrap;vertical-align:middle}\r\n.input-group-addon{padding:6px 12px;font-size:14px;font-weight:400;line-height:1;color:#555;text-align:center;background-color:#eee;border:1px solid #ccc;border-radius:4px}\r\n.input-group-addon.input-sm{padding:5px 10px;font-size:12px;border-radius:3px}\r\n.input-group-addon.input-lg{padding:10px 16px;font-size:18px;border-radius:6px}\r\n.input-group-addon input[type=checkbox],.input-group-addon input[type=radio]{margin-top:0}\r\n.input-group .form-control:first-child,.input-group-addon:first-child,.input-group-btn:first-child>.btn,.input-group-btn:first-child>.btn-group>.btn,.input-group-btn:first-child>.dropdown-toggle,.input-group-btn:last-child>.btn-group:not(:last-child)>.btn,.input-group-btn:last-child>.btn:not(:last-child):not(.dropdown-toggle){border-bottom-right-radius:0;border-top-right-radius:0}\r\n.input-group-addon:first-child{border-right:0}\r\n.input-group .form-control:last-child,.input-group-addon:last-child,.input-group-btn:first-child>.btn-group:not(:first-child)>.btn,.input-group-btn:first-child>.btn:not(:first-child),.input-group-btn:last-child>.btn,.input-group-btn:last-child>.btn-group>.btn,.input-group-btn:last-child>.dropdown-toggle{border-bottom-left-radius:0;border-top-left-radius:0}\r\n.input-group-addon:last-child{border-left:0}\r\n.input-group-btn{position:relative;font-size:0;white-space:nowrap}\r\n.input-group-btn>.btn{position:relative}\r\n.input-group-btn>.btn+.btn{margin-left:-1px}\r\n.input-group-btn>.btn:active,.input-group-btn>.btn:focus,.input-group-btn>.btn:hover{z-index:2}\r\n.input-group-btn:first-child>.btn,.input-group-btn:first-child>.btn-group{margin-right:-1px}\r\n.input-group-btn:last-child>.btn,.input-group-btn:last-child>.btn-group{z-index:2;margin-left:-1px}\r\n.nav{margin-bottom:0;padding-left:0;list-style:none}\r\n.nav>li>a{padding:10px 15px}\r\n.nav>li>a:focus,.nav>li>a:hover{text-decoration:none;background-color:#eee}\r\n.nav>li.disabled>a{color:#777}\r\n.nav>li.disabled>a:focus,.nav>li.disabled>a:hover{color:#777;text-decoration:none;background-color:transparent;cursor:not-allowed}\r\n.nav .open>a,.nav .open>a:focus,.nav .open>a:hover{background-color:#eee;border-color:#de0000}\r\n.nav .nav-divider{height:1px;margin:9px 0;overflow:hidden;background-color:#e5e5e5}\r\n.nav-tabs{border-bottom:1px solid #ddd}\r\n.nav-tabs>li{float:left;margin-bottom:-1px}\r\n.nav-tabs>li>a{margin-right:2px;line-height:1.42857143;border:1px solid transparent;border-radius:4px 4px 0 0}\r\n.nav-tabs>li>a:hover{border-color:#eee #eee #ddd}\r\n.nav-tabs>li.active>a,.nav-tabs>li.active>a:focus,.nav-tabs>li.active>a:hover{color:#555;background-color:#fff;border:1px solid #ddd;border-bottom-color:transparent;cursor:default}\r\n.nav-tabs.nav-justified{width:100%;border-bottom:0}\r\n.nav-tabs.nav-justified>li{float:none}\r\n.nav-tabs.nav-justified>li>a{text-align:center;margin-bottom:5px;margin-right:0;border-radius:4px}\r\n.nav-tabs.nav-justified>.active>a,.nav-tabs.nav-justified>.active>a:focus,.nav-tabs.nav-justified>.active>a:hover{border:1px solid #ddd}\r\n@media (min-width:768px){.nav-tabs.nav-justified>li{display:table-cell;width:1%}\r\n.nav-tabs.nav-justified>li>a{margin-bottom:0;border-bottom:1px solid #ddd;border-radius:4px 4px 0 0}\r\n.nav-tabs.nav-justified>.active>a,.nav-tabs.nav-justified>.active>a:focus,.nav-tabs.nav-justified>.active>a:hover{border-bottom-color:#fff}\r\n}\r\n.nav-pills>li{float:left}\r\n.nav-justified>li,.nav-stacked>li{float:none}\r\n.nav-pills>li>a{border-radius:4px}\r\n.nav-pills>li+li{margin-left:2px}\r\n.nav-pills>li.active>a,.nav-pills>li.active>a:focus,.nav-pills>li.active>a:hover{color:#fff;background-color:#de0000}\r\n.nav-stacked>li+li{margin-top:2px;margin-left:0}\r\n.nav-justified{width:100%}\r\n.nav-justified>li>a{text-align:center;margin-bottom:5px}\r\n.nav-tabs-justified{border-bottom:0}\r\n.nav-tabs-justified>li>a{margin-right:0;border-radius:4px}\r\n.nav-tabs-justified>.active>a,.nav-tabs-justified>.active>a:focus,.nav-tabs-justified>.active>a:hover{border:1px solid #ddd}\r\n@media (min-width:768px){.nav-justified>li{display:table-cell;width:1%}\r\n.nav-justified>li>a{margin-bottom:0}\r\n.nav-tabs-justified>li>a{border-bottom:1px solid #ddd;border-radius:4px 4px 0 0}\r\n.nav-tabs-justified>.active>a,.nav-tabs-justified>.active>a:focus,.nav-tabs-justified>.active>a:hover{border-bottom-color:#fff}\r\n}\r\n.tab-content>.tab-pane{display:none}\r\n.tab-content>.active{display:block}\r\n.nav-tabs .dropdown-menu{margin-top:-1px;border-top-right-radius:0;border-top-left-radius:0}\r\n.navbar{position:relative;min-height:50px;margin-bottom:20px;border:1px solid transparent}\r\n.navbar-collapse{overflow-x:visible;padding-right:15px;padding-left:15px;border-top:1px solid transparent;box-shadow:inset 0 1px 0 rgba(255,255,255,.1);-webkit-overflow-scrolling:touch}\r\n.navbar-collapse.in{overflow-y:auto}\r\n@media (min-width:768px){.navbar{border-radius:4px}\r\n.navbar-header{float:left}\r\n.navbar-collapse{width:auto;border-top:0;box-shadow:none}\r\n.navbar-collapse.collapse{display:block!important;height:auto!important;padding-bottom:0;overflow:visible!important}\r\n.navbar-collapse.in{overflow-y:visible}\r\n.navbar-fixed-bottom .navbar-collapse,.navbar-fixed-top .navbar-collapse,.navbar-static-top .navbar-collapse{padding-left:0;padding-right:0}\r\n}\r\n.carousel-inner,.embed-responsive,.modal,.modal-open,.progress{overflow:hidden}\r\n@media (max-device-width:480px) and (orientation:landscape){.navbar-fixed-bottom .navbar-collapse,.navbar-fixed-top .navbar-collapse{max-height:200px}\r\n}\r\n.container-fluid>.navbar-collapse,.container-fluid>.navbar-header,.container>.navbar-collapse,.container>.navbar-header{margin-right:-15px;margin-left:-15px}\r\n.navbar-static-top{z-index:1000;border-width:0 0 1px}\r\n.navbar-fixed-bottom,.navbar-fixed-top{position:fixed;right:0;left:0;z-index:1030}\r\n.navbar-fixed-top{top:0;border-width:0 0 1px}\r\n.navbar-fixed-bottom{bottom:0;margin-bottom:0;border-width:1px 0 0}\r\n.navbar-brand{float:left;padding:15px;font-size:18px;line-height:20px;height:50px}\r\n.navbar-brand:focus,.navbar-brand:hover{text-decoration:none}\r\n.navbar-brand>img{display:block}\r\n@media (min-width:768px){.container-fluid>.navbar-collapse,.container-fluid>.navbar-header,.container>.navbar-collapse,.container>.navbar-header{margin-right:0;margin-left:0}\r\n.navbar-fixed-bottom,.navbar-fixed-top,.navbar-static-top{border-radius:0}\r\n.navbar>.container .navbar-brand,.navbar>.container-fluid .navbar-brand{margin-left:-15px}\r\n}\r\n.navbar-toggle{position:relative;float:right;margin-right:15px;padding:9px 10px;margin-top:8px;margin-bottom:8px;background-color:transparent;border:1px solid transparent;border-radius:4px}\r\n.navbar-toggle:focus{outline:0}\r\n.navbar-toggle .icon-bar{display:block;width:22px;height:2px;border-radius:1px}\r\n.navbar-toggle .icon-bar+.icon-bar{margin-top:4px}\r\n.navbar-nav{margin:7.5px -15px}\r\n.navbar-nav>li>a{padding-top:10px;padding-bottom:10px;line-height:20px}\r\n@media (max-width:767px){.navbar-nav .open .dropdown-menu{position:static;float:none;width:auto;margin-top:0;background-color:transparent;border:0;box-shadow:none}\r\n.navbar-nav .open .dropdown-menu .dropdown-header,.navbar-nav .open .dropdown-menu>li>a{padding:5px 15px 5px 25px}\r\n.navbar-nav .open .dropdown-menu>li>a{line-height:20px}\r\n.navbar-nav .open .dropdown-menu>li>a:focus,.navbar-nav .open .dropdown-menu>li>a:hover{background-image:none}\r\n}\r\n.progress-bar-striped,.progress-striped .progress-bar,.progress-striped .progress-bar-danger,.progress-striped .progress-bar-info,.progress-striped .progress-bar-success,.progress-striped .progress-bar-warning{background-image:-webkit-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)}\r\n@media (min-width:768px){.navbar-toggle{display:none}\r\n.navbar-nav{float:left;margin:0}\r\n.navbar-nav>li{float:left}\r\n.navbar-nav>li>a{padding-top:15px;padding-bottom:15px}\r\n}\r\n.navbar-form{padding:10px 15px;border-top:1px solid transparent;border-bottom:1px solid transparent;-webkit-box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 1px 0 rgba(255,255,255,.1);box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 1px 0 rgba(255,255,255,.1);margin:8px -15px}\r\n@media (min-width:768px){.navbar-form .form-control-static,.navbar-form .form-group{display:inline-block}\r\n.navbar-form .control-label,.navbar-form .form-group{margin-bottom:0;vertical-align:middle}\r\n.navbar-form .form-control{display:inline-block;width:auto;vertical-align:middle}\r\n.navbar-form .input-group{display:inline-table;vertical-align:middle}\r\n.navbar-form .input-group .form-control,.navbar-form .input-group .input-group-addon,.navbar-form .input-group .input-group-btn{width:auto}\r\n.navbar-form .input-group>.form-control{width:100%}\r\n.navbar-form .checkbox,.navbar-form .radio{display:inline-block;margin-top:0;margin-bottom:0;vertical-align:middle}\r\n.navbar-form .checkbox label,.navbar-form .radio label{padding-left:0}\r\n.navbar-form .checkbox input[type=checkbox],.navbar-form .radio input[type=radio]{position:relative;margin-left:0}\r\n.navbar-form .has-feedback .form-control-feedback{top:0}\r\n}\r\n.btn .badge,.btn .label{position:relative;top:-1px}\r\n.breadcrumb>li,.pagination{display:inline-block}\r\n@media (max-width:767px){.navbar-form .form-group{margin-bottom:5px}\r\n.navbar-form .form-group:last-child{margin-bottom:0}\r\n}\r\n@media (min-width:768px){.navbar-form{width:auto;border:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;-webkit-box-shadow:none;box-shadow:none}\r\n}\r\n.navbar-nav>li>.dropdown-menu{margin-top:0;border-top-right-radius:0;border-top-left-radius:0}\r\n.navbar-fixed-bottom .navbar-nav>li>.dropdown-menu{margin-bottom:0;border-radius:4px 4px 0 0}\r\n.navbar-btn{margin-top:8px;margin-bottom:8px}\r\n.navbar-btn.btn-sm{margin-top:10px;margin-bottom:10px}\r\n.navbar-btn.btn-xs{margin-top:14px;margin-bottom:14px}\r\n.navbar-text{margin-top:15px;margin-bottom:15px}\r\n@media (min-width:768px){.navbar-text{float:left;margin-left:15px;margin-right:15px}\r\n.navbar-left{float:left!important}\r\n.navbar-right{float:right!important;margin-right:-15px}\r\n.navbar-right~.navbar-right{margin-right:0}\r\n}\r\n.navbar-default{background-color:#f8f8f8;border-color:#e7e7e7}\r\n.navbar-default .navbar-brand{color:#777}\r\n.navbar-default .navbar-brand:focus,.navbar-default .navbar-brand:hover{color:#5e5e5e;background-color:transparent}\r\n.navbar-default .navbar-nav>li>a,.navbar-default .navbar-text{color:#777}\r\n.navbar-default .navbar-nav>li>a:focus,.navbar-default .navbar-nav>li>a:hover{color:#333;background-color:transparent}\r\n.navbar-default .navbar-nav>.active>a,.navbar-default .navbar-nav>.active>a:focus,.navbar-default .navbar-nav>.active>a:hover{color:#555;background-color:#e7e7e7}\r\n.navbar-default .navbar-nav>.disabled>a,.navbar-default .navbar-nav>.disabled>a:focus,.navbar-default .navbar-nav>.disabled>a:hover{color:#ccc;background-color:transparent}\r\n.navbar-default .navbar-toggle{border-color:#ddd}\r\n.navbar-default .navbar-toggle:focus,.navbar-default .navbar-toggle:hover{background-color:#ddd}\r\n.navbar-default .navbar-toggle .icon-bar{background-color:#888}\r\n.navbar-default .navbar-collapse,.navbar-default .navbar-form{border-color:#e7e7e7}\r\n.navbar-default .navbar-nav>.open>a,.navbar-default .navbar-nav>.open>a:focus,.navbar-default .navbar-nav>.open>a:hover{background-color:#e7e7e7;color:#555}\r\n@media (max-width:767px){.navbar-default .navbar-nav .open .dropdown-menu>li>a{color:#777}\r\n.navbar-default .navbar-nav .open .dropdown-menu>li>a:focus,.navbar-default .navbar-nav .open .dropdown-menu>li>a:hover{color:#333;background-color:transparent}\r\n.navbar-default .navbar-nav .open .dropdown-menu>.active>a,.navbar-default .navbar-nav .open .dropdown-menu>.active>a:focus,.navbar-default .navbar-nav .open .dropdown-menu>.active>a:hover{color:#555;background-color:#e7e7e7}\r\n.navbar-default .navbar-nav .open .dropdown-menu>.disabled>a,.navbar-default .navbar-nav .open .dropdown-menu>.disabled>a:focus,.navbar-default .navbar-nav .open .dropdown-menu>.disabled>a:hover{color:#ccc;background-color:transparent}\r\n}\r\n.navbar-default .navbar-link{color:#777}\r\n.navbar-default .navbar-link:hover{color:#333}\r\n.navbar-default .btn-link{color:#777}\r\n.navbar-default .btn-link:focus,.navbar-default .btn-link:hover{color:#333}\r\n.navbar-default .btn-link[disabled]:focus,.navbar-default .btn-link[disabled]:hover,fieldset[disabled] .navbar-default .btn-link:focus,fieldset[disabled] .navbar-default .btn-link:hover{color:#ccc}\r\n.navbar-inverse{background-color:#222;border-color:#080808}\r\n.navbar-inverse .navbar-brand{color:#9d9d9d}\r\n.navbar-inverse .navbar-brand:focus,.navbar-inverse .navbar-brand:hover{color:#fff;background-color:transparent}\r\n.navbar-inverse .navbar-nav>li>a,.navbar-inverse .navbar-text{color:#9d9d9d}\r\n.navbar-inverse .navbar-nav>li>a:focus,.navbar-inverse .navbar-nav>li>a:hover{color:#fff;background-color:transparent}\r\n.navbar-inverse .navbar-nav>.active>a,.navbar-inverse .navbar-nav>.active>a:focus,.navbar-inverse .navbar-nav>.active>a:hover{color:#fff;background-color:#080808}\r\n.navbar-inverse .navbar-nav>.disabled>a,.navbar-inverse .navbar-nav>.disabled>a:focus,.navbar-inverse .navbar-nav>.disabled>a:hover{color:#444;background-color:transparent}\r\n.navbar-inverse .navbar-toggle{border-color:#333}\r\n.navbar-inverse .navbar-toggle:focus,.navbar-inverse .navbar-toggle:hover{background-color:#333}\r\n.navbar-inverse .navbar-toggle .icon-bar{background-color:#fff}\r\n.navbar-inverse .navbar-collapse,.navbar-inverse .navbar-form{border-color:#101010}\r\n.navbar-inverse .navbar-nav>.open>a,.navbar-inverse .navbar-nav>.open>a:focus,.navbar-inverse .navbar-nav>.open>a:hover{background-color:#080808;color:#fff}\r\n@media (max-width:767px){.navbar-inverse .navbar-nav .open .dropdown-menu>.dropdown-header{border-color:#080808}\r\n.navbar-inverse .navbar-nav .open .dropdown-menu .divider{background-color:#080808}\r\n.navbar-inverse .navbar-nav .open .dropdown-menu>li>a{color:#9d9d9d}\r\n.navbar-inverse .navbar-nav .open .dropdown-menu>li>a:focus,.navbar-inverse .navbar-nav .open .dropdown-menu>li>a:hover{color:#fff;background-color:transparent}\r\n.navbar-inverse .navbar-nav .open .dropdown-menu>.active>a,.navbar-inverse .navbar-nav .open .dropdown-menu>.active>a:focus,.navbar-inverse .navbar-nav .open .dropdown-menu>.active>a:hover{color:#fff;background-color:#080808}\r\n.navbar-inverse .navbar-nav .open .dropdown-menu>.disabled>a,.navbar-inverse .navbar-nav .open .dropdown-menu>.disabled>a:focus,.navbar-inverse .navbar-nav .open .dropdown-menu>.disabled>a:hover{color:#444;background-color:transparent}\r\n}\r\n.navbar-inverse .navbar-link{color:#9d9d9d}\r\n.navbar-inverse .navbar-link:hover{color:#fff}\r\n.navbar-inverse .btn-link{color:#9d9d9d}\r\n.navbar-inverse .btn-link:focus,.navbar-inverse .btn-link:hover{color:#fff}\r\n.navbar-inverse .btn-link[disabled]:focus,.navbar-inverse .btn-link[disabled]:hover,fieldset[disabled] .navbar-inverse .btn-link:focus,fieldset[disabled] .navbar-inverse .btn-link:hover{color:#444}\r\n.breadcrumb{padding:8px 15px;margin-bottom:20px;list-style:none;background-color:#f5f5f5;border-radius:4px}\r\n.breadcrumb>li+li:before{content:\"/\\00a0\";padding:0 5px;color:#ccc}\r\n.breadcrumb>.active{color:#777}\r\n.pagination{padding-left:0;margin:20px 0;border-radius:4px}\r\n.pager li,.pagination>li{display:inline}\r\n.pagination>li>a,.pagination>li>span{position:relative;float:left;padding:6px 12px;line-height:1.42857143;text-decoration:none;color:#de0000;background-color:#fff;border:1px solid #ddd;margin-left:-1px}\r\n.pagination>li:first-child>a,.pagination>li:first-child>span{margin-left:0;border-bottom-left-radius:4px;border-top-left-radius:4px}\r\n.pagination>li:last-child>a,.pagination>li:last-child>span{border-bottom-right-radius:4px;border-top-right-radius:4px}\r\n.pagination>li>a:focus,.pagination>li>a:hover,.pagination>li>span:focus,.pagination>li>span:hover{z-index:2;color:#910000;background-color:#eee;border-color:#ddd}\r\n.pagination>.active>a,.pagination>.active>a:focus,.pagination>.active>a:hover,.pagination>.active>span,.pagination>.active>span:focus,.pagination>.active>span:hover{z-index:3;color:#fff;background-color:#de0000;border-color:#de0000;cursor:default}\r\n.pagination>.disabled>a,.pagination>.disabled>a:focus,.pagination>.disabled>a:hover,.pagination>.disabled>span,.pagination>.disabled>span:focus,.pagination>.disabled>span:hover{color:#777;background-color:#fff;border-color:#ddd;cursor:not-allowed}\r\n.pagination-lg>li>a,.pagination-lg>li>span{padding:10px 16px;font-size:18px;line-height:1.3333333}\r\n.pagination-lg>li:first-child>a,.pagination-lg>li:first-child>span{border-bottom-left-radius:6px;border-top-left-radius:6px}\r\n.pagination-lg>li:last-child>a,.pagination-lg>li:last-child>span{border-bottom-right-radius:6px;border-top-right-radius:6px}\r\n.pagination-sm>li>a,.pagination-sm>li>span{padding:5px 10px;font-size:12px;line-height:1.5}\r\n.badge,.label{text-align:center;font-weight:700;line-height:1;white-space:nowrap}\r\n.pagination-sm>li:first-child>a,.pagination-sm>li:first-child>span{border-bottom-left-radius:3px;border-top-left-radius:3px}\r\n.pagination-sm>li:last-child>a,.pagination-sm>li:last-child>span{border-bottom-right-radius:3px;border-top-right-radius:3px}\r\n.pager{padding-left:0;margin:20px 0;list-style:none;text-align:center}\r\n.pager li>a,.pager li>span{display:inline-block;padding:5px 14px;background-color:#fff;border:1px solid #ddd;border-radius:15px}\r\n.pager li>a:focus,.pager li>a:hover{text-decoration:none;background-color:#eee}\r\n.pager .next>a,.pager .next>span{float:right}\r\n.pager .previous>a,.pager .previous>span{float:left}\r\n.pager .disabled>a,.pager .disabled>a:focus,.pager .disabled>a:hover,.pager .disabled>span{color:#777;background-color:#fff;cursor:not-allowed}\r\n.label{display:inline;padding:.2em .6em .3em;font-size:75%;color:#fff;border-radius:.25em}\r\na.label:focus,a.label:hover{color:#fff;text-decoration:none;cursor:pointer}\r\n.label:empty{display:none}\r\n.label-default{background-color:#777}\r\n.label-default[href]:focus,.label-default[href]:hover{background-color:#5e5e5e}\r\n.label-primary{background-color:#de0000}\r\n.label-primary[href]:focus,.label-primary[href]:hover{background-color:#ab0000}\r\n.label-success{background-color:#5cb85c}\r\n.label-success[href]:focus,.label-success[href]:hover{background-color:#449d44}\r\n.label-info{background-color:#5bc0de}\r\n.label-info[href]:focus,.label-info[href]:hover{background-color:#31b0d5}\r\n.label-warning{background-color:#f0ad4e}\r\n.label-warning[href]:focus,.label-warning[href]:hover{background-color:#ec971f}\r\n.label-danger{background-color:#d9534f}\r\n.label-danger[href]:focus,.label-danger[href]:hover{background-color:#c9302c}\r\n.badge{display:inline-block;min-width:10px;padding:3px 7px;font-size:12px;color:#fff;vertical-align:middle;background-color:#777;border-radius:10px}\r\n.badge:empty{display:none}\r\n.media-object,.thumbnail{display:block}\r\n.btn-group-xs>.btn .badge,.btn-xs .badge{top:0;padding:1px 5px}\r\na.badge:focus,a.badge:hover{color:#fff;text-decoration:none;cursor:pointer}\r\n.list-group-item.active>.badge,.nav-pills>.active>a>.badge{color:#de0000;background-color:#fff}\r\n.jumbotron,.jumbotron .h1,.jumbotron h1{color:inherit}\r\n.list-group-item>.badge{float:right}\r\n.list-group-item>.badge+.badge{margin-right:5px}\r\n.nav-pills>li>a>.badge{margin-left:3px}\r\n.jumbotron{padding-top:30px;padding-bottom:30px;margin-bottom:30px;background-color:#eee}\r\n.jumbotron p{margin-bottom:15px;font-size:21px;font-weight:200}\r\n.alert .alert-link,.close{font-weight:700}\r\n.alert,.thumbnail{margin-bottom:20px}\r\n.jumbotron>hr{border-top-color:#d5d5d5}\r\n.container .jumbotron,.container-fluid .jumbotron{border-radius:6px;padding-left:15px;padding-right:15px}\r\n.jumbotron .container{max-width:100%}\r\n@media screen and (min-width:768px){.jumbotron{padding-top:48px;padding-bottom:48px}\r\n.container .jumbotron,.container-fluid .jumbotron{padding-left:60px;padding-right:60px}\r\n.jumbotron .h1,.jumbotron h1{font-size:63px}\r\n}\r\n.thumbnail{padding:4px;line-height:1.42857143;background-color:#fff;border:1px solid #ddd;border-radius:4px;-webkit-transition:border .2s ease-in-out;-o-transition:border .2s ease-in-out;transition:border .2s ease-in-out}\r\n.thumbnail a>img,.thumbnail>img{margin-left:auto;margin-right:auto}\r\na.thumbnail.active,a.thumbnail:focus,a.thumbnail:hover{border-color:#de0000}\r\n.thumbnail .caption{padding:9px;color:#333}\r\n.alert{padding:15px;border:1px solid transparent;border-radius:4px}\r\n.alert h4{margin-top:0;color:inherit}\r\n.alert>p,.alert>ul{margin-bottom:0}\r\n.alert>p+p{margin-top:5px}\r\n.alert-dismissable,.alert-dismissible{padding-right:35px}\r\n.alert-dismissable .close,.alert-dismissible .close{position:relative;top:-2px;right:-21px;color:inherit}\r\n.modal,.modal-backdrop{right:0;bottom:0;left:0}\r\n.alert-success{background-color:#dff0d8;border-color:#d6e9c6;color:#3c763d}\r\n.alert-success hr{border-top-color:#c9e2b3}\r\n.alert-success .alert-link{color:#2b542c}\r\n.alert-info{background-color:#d9edf7;border-color:#bce8f1;color:#31708f}\r\n.alert-info hr{border-top-color:#a6e1ec}\r\n.alert-info .alert-link{color:#245269}\r\n.alert-warning{background-color:#fcf8e3;border-color:#faebcc;color:#8a6d3b}\r\n.alert-warning hr{border-top-color:#f7e1b5}\r\n.alert-warning .alert-link{color:#66512c}\r\n.alert-danger{background-color:#f2dede;border-color:#ebccd1;color:#a94442}\r\n.alert-danger hr{border-top-color:#e4b9c0}\r\n.alert-danger .alert-link{color:#843534}\r\n@-webkit-keyframes progress-bar-stripes{from{background-position:40px 0}\r\nto{background-position:0 0}\r\n}\r\n@keyframes progress-bar-stripes{from{background-position:40px 0}\r\nto{background-position:0 0}\r\n}\r\n.progress{height:20px;margin-bottom:20px;background-color:#f5f5f5;border-radius:4px;-webkit-box-shadow:inset 0 1px 2px rgba(0,0,0,.1);box-shadow:inset 0 1px 2px rgba(0,0,0,.1)}\r\n.progress-bar{float:left;width:0;height:100%;font-size:12px;line-height:20px;color:#fff;text-align:center;background-color:#de0000;-webkit-box-shadow:inset 0 -1px 0 rgba(0,0,0,.15);box-shadow:inset 0 -1px 0 rgba(0,0,0,.15);-webkit-transition:width .6s ease;-o-transition:width .6s ease;transition:width .6s ease}\r\n.progress-bar-striped,.progress-striped .progress-bar{background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-image:linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-size:40px 40px}\r\n.progress-bar.active,.progress.active .progress-bar{-webkit-animation:progress-bar-stripes 2s linear infinite;-o-animation:progress-bar-stripes 2s linear infinite;animation:progress-bar-stripes 2s linear infinite}\r\n.progress-bar-success{background-color:#5cb85c}\r\n.progress-striped .progress-bar-success{background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-image:linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)}\r\n.progress-bar-info{background-color:#5bc0de}\r\n.progress-striped .progress-bar-info{background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-image:linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)}\r\n.progress-bar-warning{background-color:#f0ad4e}\r\n.progress-striped .progress-bar-warning{background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-image:linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)}\r\n.progress-bar-danger{background-color:#d9534f}\r\n.progress-striped .progress-bar-danger{background-image:-o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);background-image:linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)}\r\n.media{margin-top:15px}\r\n.media:first-child{margin-top:0}\r\n.media,.media-body{zoom:1;overflow:hidden}\r\n.media-body{width:10000px}\r\n.media-right,.media>.pull-right{padding-left:10px}\r\n.media-left,.media>.pull-left{padding-right:10px}\r\n.media-body,.media-left,.media-right{display:table-cell;vertical-align:top}\r\n.media-middle{vertical-align:middle}\r\n.media-bottom{vertical-align:bottom}\r\n.media-heading{margin-top:0;margin-bottom:5px}\r\n.media-list{padding-left:0;list-style:none}\r\n.list-group{margin-bottom:20px;padding-left:0}\r\n.list-group-item{position:relative;display:block;padding:10px 15px;margin-bottom:-1px;background-color:#fff;border:1px solid #ddd}\r\n.list-group-item:first-child{border-top-right-radius:4px;border-top-left-radius:4px}\r\n.list-group-item:last-child{margin-bottom:0;border-bottom-right-radius:4px;border-bottom-left-radius:4px}\r\na.list-group-item,button.list-group-item{color:#555}\r\na.list-group-item .list-group-item-heading,button.list-group-item .list-group-item-heading{color:#333}\r\na.list-group-item:focus,a.list-group-item:hover,button.list-group-item:focus,button.list-group-item:hover{text-decoration:none;color:#555;background-color:#f5f5f5}\r\nbutton.list-group-item{width:100%;text-align:left}\r\n.list-group-item.disabled,.list-group-item.disabled:focus,.list-group-item.disabled:hover{background-color:#eee;color:#777;cursor:not-allowed}\r\n.list-group-item.disabled .list-group-item-heading,.list-group-item.disabled:focus .list-group-item-heading,.list-group-item.disabled:hover .list-group-item-heading{color:inherit}\r\n.list-group-item.disabled .list-group-item-text,.list-group-item.disabled:focus .list-group-item-text,.list-group-item.disabled:hover .list-group-item-text{color:#777}\r\n.list-group-item.active,.list-group-item.active:focus,.list-group-item.active:hover{z-index:2;color:#fff;background-color:#de0000;border-color:#de0000}\r\n.list-group-item.active .list-group-item-heading,.list-group-item.active .list-group-item-heading>.small,.list-group-item.active .list-group-item-heading>small,.list-group-item.active:focus .list-group-item-heading,.list-group-item.active:focus .list-group-item-heading>.small,.list-group-item.active:focus .list-group-item-heading>small,.list-group-item.active:hover .list-group-item-heading,.list-group-item.active:hover .list-group-item-heading>.small,.list-group-item.active:hover .list-group-item-heading>small{color:inherit}\r\n.list-group-item.active .list-group-item-text,.list-group-item.active:focus .list-group-item-text,.list-group-item.active:hover .list-group-item-text{color:#ffabab}\r\n.list-group-item-success{color:#3c763d;background-color:#dff0d8}\r\na.list-group-item-success,button.list-group-item-success{color:#3c763d}\r\na.list-group-item-success .list-group-item-heading,button.list-group-item-success .list-group-item-heading{color:inherit}\r\na.list-group-item-success:focus,a.list-group-item-success:hover,button.list-group-item-success:focus,button.list-group-item-success:hover{color:#3c763d;background-color:#d0e9c6}\r\na.list-group-item-success.active,a.list-group-item-success.active:focus,a.list-group-item-success.active:hover,button.list-group-item-success.active,button.list-group-item-success.active:focus,button.list-group-item-success.active:hover{color:#fff;background-color:#3c763d;border-color:#3c763d}\r\n.list-group-item-info{color:#31708f;background-color:#d9edf7}\r\na.list-group-item-info,button.list-group-item-info{color:#31708f}\r\na.list-group-item-info .list-group-item-heading,button.list-group-item-info .list-group-item-heading{color:inherit}\r\na.list-group-item-info:focus,a.list-group-item-info:hover,button.list-group-item-info:focus,button.list-group-item-info:hover{color:#31708f;background-color:#c4e3f3}\r\na.list-group-item-info.active,a.list-group-item-info.active:focus,a.list-group-item-info.active:hover,button.list-group-item-info.active,button.list-group-item-info.active:focus,button.list-group-item-info.active:hover{color:#fff;background-color:#31708f;border-color:#31708f}\r\n.list-group-item-warning{color:#8a6d3b;background-color:#fcf8e3}\r\na.list-group-item-warning,button.list-group-item-warning{color:#8a6d3b}\r\na.list-group-item-warning .list-group-item-heading,button.list-group-item-warning .list-group-item-heading{color:inherit}\r\na.list-group-item-warning:focus,a.list-group-item-warning:hover,button.list-group-item-warning:focus,button.list-group-item-warning:hover{color:#8a6d3b;background-color:#faf2cc}\r\na.list-group-item-warning.active,a.list-group-item-warning.active:focus,a.list-group-item-warning.active:hover,button.list-group-item-warning.active,button.list-group-item-warning.active:focus,button.list-group-item-warning.active:hover{color:#fff;background-color:#8a6d3b;border-color:#8a6d3b}\r\n.list-group-item-danger{color:#a94442;background-color:#f2dede}\r\na.list-group-item-danger,button.list-group-item-danger{color:#a94442}\r\na.list-group-item-danger .list-group-item-heading,button.list-group-item-danger .list-group-item-heading{color:inherit}\r\na.list-group-item-danger:focus,a.list-group-item-danger:hover,button.list-group-item-danger:focus,button.list-group-item-danger:hover{color:#a94442;background-color:#ebcccc}\r\na.list-group-item-danger.active,a.list-group-item-danger.active:focus,a.list-group-item-danger.active:hover,button.list-group-item-danger.active,button.list-group-item-danger.active:focus,button.list-group-item-danger.active:hover{color:#fff;background-color:#a94442;border-color:#a94442}\r\n.panel-heading>.dropdown .dropdown-toggle,.panel-title,.panel-title>.small,.panel-title>.small>a,.panel-title>a,.panel-title>small,.panel-title>small>a{color:inherit}\r\n.list-group-item-heading{margin-top:0;margin-bottom:5px}\r\n.list-group-item-text{margin-bottom:0;line-height:1.3}\r\n.panel{margin-bottom:20px;background-color:#fff;border:1px solid transparent;border-radius:4px;-webkit-box-shadow:0 1px 1px rgba(0,0,0,.05);box-shadow:0 1px 1px rgba(0,0,0,.05)}\r\n.panel-title,.panel>.list-group,.panel>.panel-collapse>.list-group,.panel>.panel-collapse>.table,.panel>.table,.panel>.table-responsive>.table{margin-bottom:0}\r\n.panel-body{padding:15px}\r\n.panel-heading{padding:10px 15px;border-bottom:1px solid transparent;border-top-right-radius:3px;border-top-left-radius:3px}\r\n.panel-group .panel-heading,.panel>.table-bordered>tbody>tr:first-child>td,.panel>.table-bordered>tbody>tr:first-child>th,.panel>.table-bordered>tbody>tr:last-child>td,.panel>.table-bordered>tbody>tr:last-child>th,.panel>.table-bordered>tfoot>tr:last-child>td,.panel>.table-bordered>tfoot>tr:last-child>th,.panel>.table-bordered>thead>tr:first-child>td,.panel>.table-bordered>thead>tr:first-child>th,.panel>.table-responsive>.table-bordered>tbody>tr:first-child>td,.panel>.table-responsive>.table-bordered>tbody>tr:first-child>th,.panel>.table-responsive>.table-bordered>tbody>tr:last-child>td,.panel>.table-responsive>.table-bordered>tbody>tr:last-child>th,.panel>.table-responsive>.table-bordered>tfoot>tr:last-child>td,.panel>.table-responsive>.table-bordered>tfoot>tr:last-child>th,.panel>.table-responsive>.table-bordered>thead>tr:first-child>td,.panel>.table-responsive>.table-bordered>thead>tr:first-child>th{border-bottom:0}\r\n.panel-title{margin-top:0;font-size:16px}\r\n.panel-footer{padding:10px 15px;background-color:#f5f5f5;border-top:1px solid #ddd;border-bottom-right-radius:3px;border-bottom-left-radius:3px}\r\n.panel>.list-group .list-group-item,.panel>.panel-collapse>.list-group .list-group-item{border-width:1px 0;border-radius:0}\r\n.panel>.table-responsive:last-child>.table:last-child,.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child,.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child,.panel>.table:last-child,.panel>.table:last-child>tbody:last-child>tr:last-child,.panel>.table:last-child>tfoot:last-child>tr:last-child{border-bottom-right-radius:3px;border-bottom-left-radius:3px}\r\n.panel>.list-group:first-child .list-group-item:first-child,.panel>.panel-collapse>.list-group:first-child .list-group-item:first-child{border-top:0;border-top-right-radius:3px;border-top-left-radius:3px}\r\n.panel>.list-group:last-child .list-group-item:last-child,.panel>.panel-collapse>.list-group:last-child .list-group-item:last-child{border-bottom:0;border-bottom-right-radius:3px;border-bottom-left-radius:3px}\r\n.panel>.panel-heading+.panel-collapse>.list-group .list-group-item:first-child{border-top-right-radius:0;border-top-left-radius:0}\r\n.panel>.table-responsive:first-child>.table:first-child,.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child,.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child,.panel>.table:first-child,.panel>.table:first-child>tbody:first-child>tr:first-child,.panel>.table:first-child>thead:first-child>tr:first-child{border-top-right-radius:3px;border-top-left-radius:3px}\r\n.list-group+.panel-footer,.panel-heading+.list-group .list-group-item:first-child{border-top-width:0}\r\n.panel>.panel-collapse>.table caption,.panel>.table caption,.panel>.table-responsive>.table caption{padding-left:15px;padding-right:15px}\r\n.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child td:first-child,.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child th:first-child,.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child td:first-child,.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child th:first-child,.panel>.table:first-child>tbody:first-child>tr:first-child td:first-child,.panel>.table:first-child>tbody:first-child>tr:first-child th:first-child,.panel>.table:first-child>thead:first-child>tr:first-child td:first-child,.panel>.table:first-child>thead:first-child>tr:first-child th:first-child{border-top-left-radius:3px}\r\n.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child td:last-child,.panel>.table-responsive:first-child>.table:first-child>tbody:first-child>tr:first-child th:last-child,.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child td:last-child,.panel>.table-responsive:first-child>.table:first-child>thead:first-child>tr:first-child th:last-child,.panel>.table:first-child>tbody:first-child>tr:first-child td:last-child,.panel>.table:first-child>tbody:first-child>tr:first-child th:last-child,.panel>.table:first-child>thead:first-child>tr:first-child td:last-child,.panel>.table:first-child>thead:first-child>tr:first-child th:last-child{border-top-right-radius:3px}\r\n.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child td:first-child,.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child th:first-child,.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child td:first-child,.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child th:first-child,.panel>.table:last-child>tbody:last-child>tr:last-child td:first-child,.panel>.table:last-child>tbody:last-child>tr:last-child th:first-child,.panel>.table:last-child>tfoot:last-child>tr:last-child td:first-child,.panel>.table:last-child>tfoot:last-child>tr:last-child th:first-child{border-bottom-left-radius:3px}\r\n.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child td:last-child,.panel>.table-responsive:last-child>.table:last-child>tbody:last-child>tr:last-child th:last-child,.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child td:last-child,.panel>.table-responsive:last-child>.table:last-child>tfoot:last-child>tr:last-child th:last-child,.panel>.table:last-child>tbody:last-child>tr:last-child td:last-child,.panel>.table:last-child>tbody:last-child>tr:last-child th:last-child,.panel>.table:last-child>tfoot:last-child>tr:last-child td:last-child,.panel>.table:last-child>tfoot:last-child>tr:last-child th:last-child{border-bottom-right-radius:3px}\r\n.panel>.panel-body+.table,.panel>.panel-body+.table-responsive,.panel>.table+.panel-body,.panel>.table-responsive+.panel-body{border-top:1px solid #ddd}\r\n.panel>.table>tbody:first-child>tr:first-child td,.panel>.table>tbody:first-child>tr:first-child th{border-top:0}\r\n.panel>.table-bordered,.panel>.table-responsive>.table-bordered{border:0}\r\n.panel>.table-bordered>tbody>tr>td:first-child,.panel>.table-bordered>tbody>tr>th:first-child,.panel>.table-bordered>tfoot>tr>td:first-child,.panel>.table-bordered>tfoot>tr>th:first-child,.panel>.table-bordered>thead>tr>td:first-child,.panel>.table-bordered>thead>tr>th:first-child,.panel>.table-responsive>.table-bordered>tbody>tr>td:first-child,.panel>.table-responsive>.table-bordered>tbody>tr>th:first-child,.panel>.table-responsive>.table-bordered>tfoot>tr>td:first-child,.panel>.table-responsive>.table-bordered>tfoot>tr>th:first-child,.panel>.table-responsive>.table-bordered>thead>tr>td:first-child,.panel>.table-responsive>.table-bordered>thead>tr>th:first-child{border-left:0}\r\n.panel>.table-bordered>tbody>tr>td:last-child,.panel>.table-bordered>tbody>tr>th:last-child,.panel>.table-bordered>tfoot>tr>td:last-child,.panel>.table-bordered>tfoot>tr>th:last-child,.panel>.table-bordered>thead>tr>td:last-child,.panel>.table-bordered>thead>tr>th:last-child,.panel>.table-responsive>.table-bordered>tbody>tr>td:last-child,.panel>.table-responsive>.table-bordered>tbody>tr>th:last-child,.panel>.table-responsive>.table-bordered>tfoot>tr>td:last-child,.panel>.table-responsive>.table-bordered>tfoot>tr>th:last-child,.panel>.table-responsive>.table-bordered>thead>tr>td:last-child,.panel>.table-responsive>.table-bordered>thead>tr>th:last-child{border-right:0}\r\n.panel>.table-responsive{border:0;margin-bottom:0}\r\n.panel-group{margin-bottom:20px}\r\n.panel-group .panel{margin-bottom:0;border-radius:4px}\r\n.panel-group .panel+.panel{margin-top:5px}\r\n.panel-group .panel-heading+.panel-collapse>.list-group,.panel-group .panel-heading+.panel-collapse>.panel-body{border-top:1px solid #ddd}\r\n.panel-group .panel-footer{border-top:0}\r\n.panel-group .panel-footer+.panel-collapse .panel-body{border-bottom:1px solid #ddd}\r\n.panel-default{border-color:#ddd}\r\n.panel-default>.panel-heading{color:#333;background-color:#f5f5f5;border-color:#ddd}\r\n.panel-default>.panel-heading+.panel-collapse>.panel-body{border-top-color:#ddd}\r\n.panel-default>.panel-heading .badge{color:#f5f5f5;background-color:#333}\r\n.panel-default>.panel-footer+.panel-collapse>.panel-body{border-bottom-color:#ddd}\r\n.panel-primary{border-color:#de0000}\r\n.panel-primary>.panel-heading{color:#fff;background-color:#de0000;border-color:#de0000}\r\n.panel-primary>.panel-heading+.panel-collapse>.panel-body{border-top-color:#de0000}\r\n.panel-primary>.panel-heading .badge{color:#de0000;background-color:#fff}\r\n.panel-primary>.panel-footer+.panel-collapse>.panel-body{border-bottom-color:#de0000}\r\n.panel-success{border-color:#d6e9c6}\r\n.panel-success>.panel-heading{color:#3c763d;background-color:#dff0d8;border-color:#d6e9c6}\r\n.panel-success>.panel-heading+.panel-collapse>.panel-body{border-top-color:#d6e9c6}\r\n.panel-success>.panel-heading .badge{color:#dff0d8;background-color:#3c763d}\r\n.panel-success>.panel-footer+.panel-collapse>.panel-body{border-bottom-color:#d6e9c6}\r\n.panel-info{border-color:#bce8f1}\r\n.panel-info>.panel-heading{color:#31708f;background-color:#d9edf7;border-color:#bce8f1}\r\n.panel-info>.panel-heading+.panel-collapse>.panel-body{border-top-color:#bce8f1}\r\n.panel-info>.panel-heading .badge{color:#d9edf7;background-color:#31708f}\r\n.panel-info>.panel-footer+.panel-collapse>.panel-body{border-bottom-color:#bce8f1}\r\n.panel-warning{border-color:#faebcc}\r\n.panel-warning>.panel-heading{color:#8a6d3b;background-color:#fcf8e3;border-color:#faebcc}\r\n.panel-warning>.panel-heading+.panel-collapse>.panel-body{border-top-color:#faebcc}\r\n.panel-warning>.panel-heading .badge{color:#fcf8e3;background-color:#8a6d3b}\r\n.panel-warning>.panel-footer+.panel-collapse>.panel-body{border-bottom-color:#faebcc}\r\n.panel-danger{border-color:#ebccd1}\r\n.panel-danger>.panel-heading{color:#a94442;background-color:#f2dede;border-color:#ebccd1}\r\n.panel-danger>.panel-heading+.panel-collapse>.panel-body{border-top-color:#ebccd1}\r\n.panel-danger>.panel-heading .badge{color:#f2dede;background-color:#a94442}\r\n.panel-danger>.panel-footer+.panel-collapse>.panel-body{border-bottom-color:#ebccd1}\r\n.embed-responsive{position:relative;display:block;height:0;padding:0}\r\n.embed-responsive .embed-responsive-item,.embed-responsive embed,.embed-responsive iframe,.embed-responsive object,.embed-responsive video{position:absolute;top:0;left:0;bottom:0;height:100%;width:100%;border:0}\r\n.embed-responsive-16by9{padding-bottom:56.25%}\r\n.embed-responsive-4by3{padding-bottom:75%}\r\n.well{min-height:20px;padding:19px;margin-bottom:20px;background-color:#f5f5f5;border:1px solid #e3e3e3;border-radius:4px;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.05);box-shadow:inset 0 1px 1px rgba(0,0,0,.05)}\r\n.well blockquote{border-color:#ddd;border-color:rgba(0,0,0,.15)}\r\n.well-lg{padding:24px;border-radius:6px}\r\n.well-sm{padding:9px;border-radius:3px}\r\n.close{float:right;font-size:21px;line-height:1;color:#000;text-shadow:0 1px 0 #fff;opacity:.2;filter:alpha(opacity=20)}\r\n.popover,.tooltip{text-decoration:none;font-family:\"Helvetica Neue\",Helvetica,Arial,sans-serif;font-style:normal;font-weight:400;letter-spacing:normal;line-break:auto;line-height:1.42857143;text-shadow:none;text-transform:none;white-space:normal;word-break:normal;word-spacing:normal;word-wrap:normal}\r\n.close:focus,.close:hover{color:#000;text-decoration:none;cursor:pointer;opacity:.5;filter:alpha(opacity=50)}\r\nbutton.close{padding:0;cursor:pointer;background:0 0;border:0;-webkit-appearance:none}\r\n.modal-content,.popover{background-clip:padding-box}\r\n.modal{display:none;position:fixed;top:0;z-index:1050;-webkit-overflow-scrolling:touch;outline:0}\r\n.modal.fade .modal-dialog{-webkit-transform:translate(0,-25%);-ms-transform:translate(0,-25%);-o-transform:translate(0,-25%);transform:translate(0,-25%);-webkit-transition:-webkit-transform .3s ease-out;-moz-transition:-moz-transform .3s ease-out;-o-transition:-o-transform .3s ease-out;transition:transform .3s ease-out}\r\n.modal.in .modal-dialog{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);-o-transform:translate(0,0);transform:translate(0,0)}\r\n.modal-open .modal{overflow-x:hidden;overflow-y:auto}\r\n.modal-dialog{position:relative;width:auto;margin:10px}\r\n.modal-content{position:relative;background-color:#fff;border:1px solid #999;border:1px solid rgba(0,0,0,.2);border-radius:6px;-webkit-box-shadow:0 3px 9px rgba(0,0,0,.5);box-shadow:0 3px 9px rgba(0,0,0,.5);outline:0}\r\n.modal-backdrop{position:fixed;top:0;z-index:1040;background-color:#000}\r\n.modal-backdrop.fade{opacity:0;filter:alpha(opacity=0)}\r\n.modal-backdrop.in{opacity:.5;filter:alpha(opacity=50)}\r\n.modal-header{padding:15px;border-bottom:1px solid #e5e5e5}\r\n.tooltip.bottom .tooltip-arrow,.tooltip.bottom-left .tooltip-arrow,.tooltip.bottom-right .tooltip-arrow{top:0;border-width:0 5px 5px;border-bottom-color:#000}\r\n.modal-header .close{margin-top:-2px}\r\n.modal-title{margin:0;line-height:1.42857143}\r\n.modal-body{position:relative;padding:15px}\r\n.modal-footer{padding:15px;text-align:right;border-top:1px solid #e5e5e5}\r\n.modal-footer .btn+.btn{margin-left:5px;margin-bottom:0}\r\n.modal-footer .btn-group .btn+.btn{margin-left:-1px}\r\n.modal-footer .btn-block+.btn-block{margin-left:0}\r\n.modal-scrollbar-measure{position:absolute;top:-9999px;width:50px;height:50px;overflow:scroll}\r\n@media (min-width:768px){.modal-dialog{width:600px;margin:30px auto}\r\n.modal-content{-webkit-box-shadow:0 5px 15px rgba(0,0,0,.5);box-shadow:0 5px 15px rgba(0,0,0,.5)}\r\n.modal-sm{width:300px}\r\n}\r\n.tooltip.top-left .tooltip-arrow,.tooltip.top-right .tooltip-arrow{bottom:0;margin-bottom:-5px;border-width:5px 5px 0;border-top-color:#000}\r\n@media (min-width:992px){.modal-lg{width:900px}\r\n}\r\n.tooltip{position:absolute;z-index:1070;display:block;text-align:left;text-align:start;font-size:12px;opacity:0;filter:alpha(opacity=0)}\r\n.tooltip.in{opacity:.9;filter:alpha(opacity=90)}\r\n.tooltip.top{margin-top:-3px;padding:5px 0}\r\n.tooltip.right{margin-left:3px;padding:0 5px}\r\n.tooltip.bottom{margin-top:3px;padding:5px 0}\r\n.tooltip.left{margin-left:-3px;padding:0 5px}\r\n.tooltip-inner{max-width:200px;padding:3px 8px;color:#fff;text-align:center;background-color:#000;border-radius:4px}\r\n.tooltip-arrow{position:absolute;width:0;height:0;border-color:transparent;border-style:solid}\r\n.tooltip.top .tooltip-arrow{bottom:0;left:50%;margin-left:-5px;border-width:5px 5px 0;border-top-color:#000}\r\n.tooltip.top-left .tooltip-arrow{right:5px}\r\n.tooltip.top-right .tooltip-arrow{left:5px}\r\n.tooltip.right .tooltip-arrow{top:50%;left:0;margin-top:-5px;border-width:5px 5px 5px 0;border-right-color:#000}\r\n.tooltip.left .tooltip-arrow{top:50%;right:0;margin-top:-5px;border-width:5px 0 5px 5px;border-left-color:#000}\r\n.tooltip.bottom .tooltip-arrow{left:50%;margin-left:-5px}\r\n.tooltip.bottom-left .tooltip-arrow{right:5px;margin-top:-5px}\r\n.tooltip.bottom-right .tooltip-arrow{left:5px;margin-top:-5px}\r\n.popover{position:absolute;top:0;left:0;z-index:1060;display:none;max-width:276px;padding:1px;text-align:left;text-align:start;font-size:14px;background-color:#fff;border:1px solid #ccc;border:1px solid rgba(0,0,0,.2);border-radius:6px;-webkit-box-shadow:0 5px 10px rgba(0,0,0,.2);box-shadow:0 5px 10px rgba(0,0,0,.2)}\r\n.carousel-caption,.carousel-control{color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.6)}\r\n.popover.top{margin-top:-10px}\r\n.popover.right{margin-left:10px}\r\n.popover.bottom{margin-top:10px}\r\n.popover.left{margin-left:-10px}\r\n.popover-title{margin:0;padding:8px 14px;font-size:14px;background-color:#f7f7f7;border-bottom:1px solid #ebebeb;border-radius:5px 5px 0 0}\r\n.popover-content{padding:9px 14px}\r\n.popover>.arrow,.popover>.arrow:after{position:absolute;display:block;width:0;height:0;border-color:transparent;border-style:solid}\r\n.carousel,.carousel-inner{position:relative}\r\n.popover>.arrow{border-width:11px}\r\n.popover>.arrow:after{border-width:10px;content:\"\"}\r\n.popover.top>.arrow{left:50%;margin-left:-11px;border-bottom-width:0;border-top-color:#999;border-top-color:rgba(0,0,0,.25);bottom:-11px}\r\n.popover.top>.arrow:after{content:\" \";bottom:1px;margin-left:-10px;border-bottom-width:0;border-top-color:#fff}\r\n.popover.left>.arrow:after,.popover.right>.arrow:after{content:\" \";bottom:-10px}\r\n.popover.right>.arrow{top:50%;left:-11px;margin-top:-11px;border-left-width:0;border-right-color:#999;border-right-color:rgba(0,0,0,.25)}\r\n.popover.right>.arrow:after{left:1px;border-left-width:0;border-right-color:#fff}\r\n.popover.bottom>.arrow{left:50%;margin-left:-11px;border-top-width:0;border-bottom-color:#999;border-bottom-color:rgba(0,0,0,.25);top:-11px}\r\n.popover.bottom>.arrow:after{content:\" \";top:1px;margin-left:-10px;border-top-width:0;border-bottom-color:#fff}\r\n.popover.left>.arrow{top:50%;right:-11px;margin-top:-11px;border-right-width:0;border-left-color:#999;border-left-color:rgba(0,0,0,.25)}\r\n.popover.left>.arrow:after{right:1px;border-right-width:0;border-left-color:#fff}\r\n.carousel-inner{width:100%}\r\n.carousel-inner>.item{display:none;position:relative;-webkit-transition:.6s ease-in-out left;-o-transition:.6s ease-in-out left;transition:.6s ease-in-out left}\r\n.carousel-inner>.item>a>img,.carousel-inner>.item>img{line-height:1}\r\n@media all and (transform-3d),(-webkit-transform-3d){.carousel-inner>.item{-webkit-transition:-webkit-transform .6s ease-in-out;-moz-transition:-moz-transform .6s ease-in-out;-o-transition:-o-transform .6s ease-in-out;transition:transform .6s ease-in-out;-webkit-backface-visibility:hidden;-moz-backface-visibility:hidden;backface-visibility:hidden;-webkit-perspective:1000px;-moz-perspective:1000px;perspective:1000px}\r\n.carousel-inner>.item.active.right,.carousel-inner>.item.next{-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0);left:0}\r\n.carousel-inner>.item.active.left,.carousel-inner>.item.prev{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0);left:0}\r\n.carousel-inner>.item.active,.carousel-inner>.item.next.left,.carousel-inner>.item.prev.right{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0);left:0}\r\n}\r\n.carousel-inner>.active,.carousel-inner>.next,.carousel-inner>.prev{display:block}\r\n.carousel-inner>.active{left:0}\r\n.carousel-inner>.next,.carousel-inner>.prev{position:absolute;top:0;width:100%}\r\n.carousel-inner>.next{left:100%}\r\n.carousel-inner>.prev{left:-100%}\r\n.carousel-inner>.next.left,.carousel-inner>.prev.right{left:0}\r\n.carousel-inner>.active.left{left:-100%}\r\n.carousel-inner>.active.right{left:100%}\r\n.carousel-control{position:absolute;top:0;left:0;bottom:0;width:15%;opacity:.5;filter:alpha(opacity=50);font-size:20px;text-align:center;background-color:transparent}\r\n.carousel-control.left{background-image:-webkit-linear-gradient(left,rgba(0,0,0,.5) 0,rgba(0,0,0,.0001) 100%);background-image:-o-linear-gradient(left,rgba(0,0,0,.5) 0,rgba(0,0,0,.0001) 100%);background-image:linear-gradient(to right,rgba(0,0,0,.5) 0,rgba(0,0,0,.0001) 100%);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#80000000', endColorstr='#00000000', GradientType=1)}\r\n.carousel-control.right{left:auto;right:0;background-image:-webkit-linear-gradient(left,rgba(0,0,0,.0001) 0,rgba(0,0,0,.5) 100%);background-image:-o-linear-gradient(left,rgba(0,0,0,.0001) 0,rgba(0,0,0,.5) 100%);background-image:linear-gradient(to right,rgba(0,0,0,.0001) 0,rgba(0,0,0,.5) 100%);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#00000000', endColorstr='#80000000', GradientType=1)}\r\n.carousel-control:focus,.carousel-control:hover{outline:0;color:#fff;text-decoration:none;opacity:.9;filter:alpha(opacity=90)}\r\n.carousel-control .glyphicon-chevron-left,.carousel-control .glyphicon-chevron-right,.carousel-control .icon-next,.carousel-control .icon-prev{position:absolute;top:50%;margin-top:-10px;z-index:5;display:inline-block}\r\n.carousel-control .glyphicon-chevron-left,.carousel-control .icon-prev{left:50%;margin-left:-10px}\r\n.carousel-control .glyphicon-chevron-right,.carousel-control .icon-next{right:50%;margin-right:-10px}\r\n.carousel-control .icon-next,.carousel-control .icon-prev{width:20px;height:20px;line-height:1;font-family:serif}\r\n.carousel-control .icon-prev:before{content:'\\2039'}\r\n.carousel-control .icon-next:before{content:'\\203a'}\r\n.carousel-indicators{position:absolute;bottom:10px;left:50%;z-index:15;width:60%;margin-left:-30%;padding-left:0;list-style:none;text-align:center}\r\n.carousel-indicators li{display:inline-block;width:10px;height:10px;margin:1px;text-indent:-999px;border:1px solid #fff;border-radius:10px;cursor:pointer;background-color:#000\\9;background-color:transparent}\r\n.carousel-indicators .active{margin:0;width:12px;height:12px;background-color:#fff}\r\n.carousel-caption{position:absolute;left:15%;right:15%;bottom:20px;z-index:10;padding-top:20px;padding-bottom:20px;text-align:center}\r\n.carousel-caption .btn,.text-hide{text-shadow:none}\r\n@media screen and (min-width:768px){.carousel-control .glyphicon-chevron-left,.carousel-control .glyphicon-chevron-right,.carousel-control .icon-next,.carousel-control .icon-prev{width:30px;height:30px;margin-top:-10px;font-size:30px}\r\n.carousel-control .glyphicon-chevron-left,.carousel-control .icon-prev{margin-left:-10px}\r\n.carousel-control .glyphicon-chevron-right,.carousel-control .icon-next{margin-right:-10px}\r\n.carousel-caption{left:20%;right:20%;padding-bottom:30px}\r\n.carousel-indicators{bottom:20px}\r\n}\r\n.btn-group-vertical>.btn-group:after,.btn-group-vertical>.btn-group:before,.btn-toolbar:after,.btn-toolbar:before,.clearfix:after,.clearfix:before,.container-fluid:after,.container-fluid:before,.container:after,.container:before,.dl-horizontal dd:after,.dl-horizontal dd:before,.form-horizontal .form-group:after,.form-horizontal .form-group:before,.modal-footer:after,.modal-footer:before,.modal-header:after,.modal-header:before,.nav:after,.nav:before,.navbar-collapse:after,.navbar-collapse:before,.navbar-header:after,.navbar-header:before,.navbar:after,.navbar:before,.pager:after,.pager:before,.panel-body:after,.panel-body:before,.row:after,.row:before{content:\" \";display:table}\r\n.btn-group-vertical>.btn-group:after,.btn-toolbar:after,.clearfix:after,.container-fluid:after,.container:after,.dl-horizontal dd:after,.form-horizontal .form-group:after,.modal-footer:after,.modal-header:after,.nav:after,.navbar-collapse:after,.navbar-header:after,.navbar:after,.pager:after,.panel-body:after,.row:after{clear:both}\r\n.center-block{display:block;margin-left:auto;margin-right:auto}\r\n.pull-right{float:right!important}\r\n.pull-left{float:left!important}\r\n.hide{display:none!important}\r\n.show{display:block!important}\r\n.hidden,.visible-lg,.visible-lg-block,.visible-lg-inline,.visible-lg-inline-block,.visible-md,.visible-md-block,.visible-md-inline,.visible-md-inline-block,.visible-sm,.visible-sm-block,.visible-sm-inline,.visible-sm-inline-block,.visible-xs,.visible-xs-block,.visible-xs-inline,.visible-xs-inline-block{display:none!important}\r\n.invisible{visibility:hidden}\r\n.text-hide{font:0/0 a;color:transparent;background-color:transparent;border:0}\r\n.affix{position:fixed}\r\n@-ms-viewport{width:device-width}\r\n@media (max-width:767px){.visible-xs{display:block!important}\r\ntable.visible-xs{display:table!important}\r\ntr.visible-xs{display:table-row!important}\r\ntd.visible-xs,th.visible-xs{display:table-cell!important}\r\n.visible-xs-block{display:block!important}\r\n.visible-xs-inline{display:inline!important}\r\n.visible-xs-inline-block{display:inline-block!important}\r\n}\r\n@media (min-width:768px) and (max-width:991px){.visible-sm{display:block!important}\r\ntable.visible-sm{display:table!important}\r\ntr.visible-sm{display:table-row!important}\r\ntd.visible-sm,th.visible-sm{display:table-cell!important}\r\n.visible-sm-block{display:block!important}\r\n.visible-sm-inline{display:inline!important}\r\n.visible-sm-inline-block{display:inline-block!important}\r\n}\r\n@media (min-width:992px) and (max-width:1199px){.visible-md{display:block!important}\r\ntable.visible-md{display:table!important}\r\ntr.visible-md{display:table-row!important}\r\ntd.visible-md,th.visible-md{display:table-cell!important}\r\n.visible-md-block{display:block!important}\r\n.visible-md-inline{display:inline!important}\r\n.visible-md-inline-block{display:inline-block!important}\r\n}\r\n@media (min-width:1200px){.visible-lg{display:block!important}\r\ntable.visible-lg{display:table!important}\r\ntr.visible-lg{display:table-row!important}\r\ntd.visible-lg,th.visible-lg{display:table-cell!important}\r\n.visible-lg-block{display:block!important}\r\n.visible-lg-inline{display:inline!important}\r\n.visible-lg-inline-block{display:inline-block!important}\r\n}\r\n@media (max-width:767px){.hidden-xs{display:none!important}\r\n}\r\n@media (min-width:768px) and (max-width:991px){.hidden-sm{display:none!important}\r\n}\r\n@media (min-width:992px) and (max-width:1199px){.hidden-md{display:none!important}\r\n}\r\n@media (min-width:1200px){.hidden-lg{display:none!important}\r\n}\r\n.visible-print{display:none!important}\r\n@media print{.visible-print{display:block!important}\r\ntable.visible-print{display:table!important}\r\ntr.visible-print{display:table-row!important}\r\ntd.visible-print,th.visible-print{display:table-cell!important}\r\n}\r\n.visible-print-block{display:none!important}\r\n@media print{.visible-print-block{display:block!important}\r\n}\r\n.visible-print-inline{display:none!important}\r\n@media print{.visible-print-inline{display:inline!important}\r\n}\r\n.visible-print-inline-block{display:none!important}\r\n@media print{.visible-print-inline-block{display:inline-block!important}\r\n.hidden-print{display:none!important}\r\n}"; });
define('text!game/create.html', ['module'], function(module) { module.exports = "<template>\r\n    <require from=\"./edit-questions\"></require>\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <h3>Spielcode: <span data-test-id=\"game-code\">${gameId}</span></h3>\r\n        </div>\r\n    </div>\r\n    <!--<div class=\"form-group row\">\r\n        <label for=\"nameMr\" class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2 col-form-label\">His name</label>\r\n        <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10\">\r\n            <input class=\"form-control\" type=\"text\" value.bind=\"nameMr\" id=\"nameMr\">\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"form-group row\">\r\n        <label for=\"nameMrs\" class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2 col-form-label\">Her name</label>\r\n        <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10\">\r\n            <input class=\"form-control\" type=\"text\" value.bind=\"nameMrs\" id=\"nameMrs\">\r\n        </div>\r\n    </div>-->\r\n\r\n    <h2><span data-test-id=\"total-questions-no\">${questionsModel.length}</span> Fragen</h2>\r\n    <compose view=\"./edit-questions.html\" model.bind=\"questions\" view-model=\"./edit-questions\"></compose>\r\n    <hr />\r\n    <h2>Spieler:</h2>\r\n    <ul>\r\n        <li style=\"display: inline\" repeat.for=\"name of playerlist\">${name}, </li>\r\n    </ul>\r\n    <button class=\"btn btn-primary btn-lg\" click.trigger=\"startGame()\" data-test-id=\"start-game\">Spiel starten</button>\r\n</template>"; });
define('text!styles/styles.css', ['module'], function(module) { module.exports = ".top5 { margin-top:5px; }\r\n.top7 { margin-top:7px; }\r\n.top10 { margin-top:10px; }\r\n.top15 { margin-top:15px; }\r\n.top17 { margin-top:17px; }\r\n.top30 { margin-top:30px; }\r\n.handwriting, h1, h2{\r\n    font-family: 'Arizonia', cursive;\r\n}\r\n"; });
define('text!game/edit-questions.html', ['module'], function(module) { module.exports = "<template>\r\n    <ul class=\"list-group\">\r\n        <li repeat.for=\"question of questionsModel\" class=\"list-group-item\">\r\n            \r\n            <button show.bind=\"(question !== firstQuestion)\" click.trigger=\"moveUp(question)\" type=\"button\" disabled.bind=\"buttonsDisabled\" class=\"btn btn-default $(buttonsDisabled ? 'disabled' : '')\" aria-label=\"Left Align\">\r\n                <span class=\"glyphicon glyphicon-arrow-up\" aria-hidden=\"true\"></span>\r\n            </button>\r\n\r\n            <button show.bind=\"(question !== lastQuestion)\" click.trigger=\"moveDown(question)\" type=\"button\" disabled.bind=\"buttonsDisabled\" class=\"btn btn-default $(buttonsDisabled ? 'disabled' : '')\" aria-label=\"Left Align\">\r\n                <span class=\"glyphicon glyphicon-arrow-down\" aria-hidden=\"true\"></span>\r\n            </button>\r\n           \r\n            <button click.trigger=\"question.changeEditState()\" type=\"button\" disabled.bind=\"buttonsDisabled\" class=\"btn btn-default $(buttonsDisabled ? 'disabled' : '')\" aria-label=\"Left Align\">\r\n                <span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n            </button>\r\n\r\n            <button click.trigger=\"deleteQuestion(question)\" type=\"button\" disabled.bind=\"buttonsDisabled\" class=\"btn btn-default $(buttonsDisabled ? 'disabled' : '')\" disabled.bind=\"buttonsDisabled\" aria-label=\"Left Align\">\r\n                <span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n            </button>\r\n            \r\n            <span> ${question.text}</span>\r\n            <input show.bind=\"question.editActive\" type=\"text\" placeholder=\"Frage...\" class=\"form-control\" value.bind=\"question.text\"></input>\r\n            <button show.bind=\"question.editActive\" click.trigger=\"question.updateText()\" type=\"button\" disabled.bind=\"buttonsDisabled\" class=\"btn btn-default $(buttonsDisabled ? 'disabled' : '')\" aria-label=\"Left Align\">\r\n                <span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span>\r\n            </button>\r\n        </li>\r\n    </ul>\r\n\r\n    <form class=\"form-horizontal\">\r\n        <div class=\"form-group\">\r\n            <div class=\"col-sm-8\">\r\n                <input type=\"text\" class=\"form-control\" placeholder=\"neue Frage...\" value.bind=\"newQuestionText\">\r\n            </div>\r\n            <div class=\"col-sm-2\">\r\n                <button class=\"btn btn-primary $(buttonsDisabled ? 'disabled' : '')\" disabled.bind=\"buttonsDisabled\" click.trigger=\"addQuestion()\">Frage hinzufügen</button>\r\n            </div>\r\n        </div>\r\n    </form>\r\n</template>"; });
define('text!game/join.html', ['module'], function(module) { module.exports = "<template>\r\n    <row>\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <h2>Spiel beitreten</h2>\r\n        </div>\r\n    </row>\r\n    <row>\r\n        <div class=\"col-xs-4 col-sm-4 col-md-4 col-lg-4\">\r\n            <form>\r\n                <div class=\"form-group\">\r\n                    <label for=\"exampleInputName2\">Dein Name: </label>\r\n                    <input type=\"text\" class=\"form-control\" data-test-id=\"textbox-name\" value.bind=\"name\" placeholder=\"Name\">\r\n                </div>\r\n                <div class=\"form-group\">\r\n                    <label for=\"gameId\">Spiel Code: </label>\r\n                    <input type=\"text\" class=\"form-control\" id=\"gameId\" value.bind=\"gameId\" data-test-id=\"textbox-game-id\" placeholder=\"af34w2s\">\r\n                </div>\r\n                <input type=\"submit\" class=\"btn btn-default\" data-test-id=\"join-game\" click.trigger=\"joinGame()\" value=\"Los!\"></input>\r\n            </form>\r\n        </div>\r\n    </row>\r\n    <row>\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <a href=\"\" click.trigger=\"showHighscore()\" data-test-id=\"show-highscore\">Nur highscore anzeigen</a>\r\n        </div>\r\n    </row>\r\n</template>"; });
define('text!highscore/highscore-table.html', ['module'], function(module) { module.exports = "<template>\r\n  <table class=\"table\" with.bind=\"model\">\r\n    <thead>\r\n      <tr>\r\n        <th>Platzierung</th>\r\n        <th>Name</th>\r\n        <th>Punkte</th>\r\n      </tr>\r\n    </thead>\r\n    <tbody>\r\n      <tr if.bind=\"entries.length > 0\">\r\n        <td>1.</td>\r\n        <td class=\"firstNames\">${entries[0].names}</td>\r\n        <td class=\"firstScore\">${entries[0].score}</td>\r\n      </tr>\r\n      <tr if.bind=\"entries.length > 1\">\r\n        <td>2.</td>\r\n        <td class=\"secondNames\">${entries[1].names}</td>\r\n        <td class=\"secondScore\">${entries[1].score}</td>\r\n      </tr>\r\n      <tr if.bind=\"entries.length > 2\">\r\n        <td>3.</td>\r\n        <td class=\"thirdNames\">${entries[2].names}</td>\r\n        <td class=\"thirdScore\">${entries[2].score}</td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n\r\n</template>"; });
define('text!highscore/highscore.html', ['module'], function(module) { module.exports = "<template bindable=\"highscoreModel\">\r\n    <require from=\"./highscore-table\"></require>\r\n    <h2 data-test-id=\"heading\">Übersicht</h2>\r\n\r\n    <div show.bind=\"game.state === 1\">\r\n        <div class=\"row\">\r\n            <div class=\"text-center\">\r\n                Aktuelle Frage: <span data-test-id=\"current-question\">${currentQuestion}</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"row top10\">\r\n            <div class=\"col-xs-6 \">\r\n                <button type=\"button\" class=\"btn btn-default btn-block\">Die Braut</button>\r\n            </div>\r\n            <div class=\"col-xs-1 \">\r\n                ${answerStatistics.mrs}\r\n            </div>\r\n            <div class=\"col-xs-5\">\r\n                <div class=\"progress\">\r\n                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"30\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: ${statsMrs}%;\">\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"row top10\">\r\n            <div class=\"col-xs-6 \">\r\n                <button type=\"button\" class=\"btn btn-default btn-block\">Der Bräutigam</button>\r\n            </div>\r\n            <div class=\"col-xs-1 \">\r\n                ${answerStatistics.mr}\r\n            </div>\r\n            <div class=\"col-xs-5\">\r\n                <div class=\"progress\">\r\n                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"50\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: ${statsMr}%;\">\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"row top10\">\r\n            <div class=\"col-xs-6 \">\r\n                <button type=\"button\" class=\"btn btn-default btn-block\">Beide</button>\r\n            </div>\r\n            <div class=\"col-xs-1 \">\r\n                ${answerStatistics.both}\r\n            </div>\r\n            <div class=\"col-xs-5\">\r\n                <div class=\"progress\">\r\n                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: ${statsBoth}%;\">\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <highscore-table model.bind=\"highscoreTableModel\"></highscore-table>\r\n</template>"; });
define('text!home/index.html', ['module'], function(module) { module.exports = "<template>\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <p>Einem bestehenden Spiel beitreten. Den Spielcode erfährst du von deinem Spielleiter.</p>\r\n            <p><a class=\"btn btn-primary btn-lg\" href=\"#/game/join\" role=\"button\" data-test-id=\"join-game\">Spiel beitreten</a></p>\r\n            <hr />\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n            <p>Jetzt ein neues Spiel erstellen und alle mitraten lassen. Spiele werden 14 Tage lang gespeichert.</p>\r\n            <p><a class=\"btn btn-primary btn-lg\" click.trigger=\"createGame()\" role=\"button\" data-test-id=\"create-game\">Spiel erstellen</a></p>\r\n            <hr />\r\n        </div>\r\n    </div>\r\n\r\n</template>"; });
define('text!lobby/lobby.html', ['module'], function(module) { module.exports = "<template>\r\n    <div class=\"jumbotron\">\r\n        <h2>Gäste in der Lobby</h2>\r\n        <ul>\r\n            <li repeat.for=\"name of playerlist\">${name}</li>\r\n        </ul>\r\n        <input type=\"button\" disabled=\"disabled\" class=\"btn btn-lg btn-default\" href=\"#\" role=\"button\" value=\"Warte auf Moderator...\"></input>\r\n\r\n    </div>\r\n</template>"; });
define('text!question/question.html', ['module'], function(module) { module.exports = "<template>\r\n    <div class=\"row breadcrumb\">\r\n        <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\" show.bind=\"isModerator\">\r\n            <span>Moderator</span>\r\n        </div>\r\n        <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\">\r\n            Frage <span data-test-id=\"current-question-number\">${questionIndex + 1}</span> von <span data-test-id=\"total-question-number\">${game.questions.length}</span>\r\n        </div>\r\n    </div>\r\n    <div class=\"row\">\r\n        <div class=\"text-center\" data-test-id=\"current-question\">\r\n            ${currentQuestion}\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 col-xs-offset-3\">\r\n            <button type=\"button\" class=\"btn btn-default btn-block ${selectedAnswer === 0 ? 'active' : ''}\" click.trigger=\"selectAnswer(0)\" data-test-id=\"select-mrs\">Die Braut</button>\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 col-xs-offset-3\">\r\n            <button type=\"button\" class=\"btn btn-default btn-block ${selectedAnswer === 1 ? 'active' : ''}\" click.trigger=\"selectAnswer(1)\" data-test-id=\"select-mr\">Der Bräutigam</button>\r\n        </div>\r\n    </div>\r\n    <div class=\"row top10\">\r\n        <div class=\"col-xs-6 col-xs-offset-3\">\r\n            <button type=\"button\" class=\"btn btn-default btn-block ${selectedAnswer === 2 ? 'active' : ''}\" click.trigger=\"selectAnswer(2)\" data-test-id=\"select-both\">Beide</button>\r\n        </div>\r\n    </div>\r\n    <hr />\r\n    <div show.bind=\"isModerator && !isLastQuestion\">\r\n        <button type=\"button\" class=\"btn btn-primary $(nextQuestionButtonDisabled ? 'disabled':'')\" click.trigger=\"nextQuestion()\" disabled.bind=\"nextQuestionButtonDisabled\" data-test-id=\"next-question\">Nächste Frage</button>\r\n    </div>\r\n    <div show.bind=\"isModerator && isLastQuestion\">\r\n        <button type=\"button\" class=\"btn btn-primary $(nextQuestionButtonDisabled ? 'disabled':'')\" click.trigger=\"endGame()\" disabled.bind=\"nextQuestionButtonDisabled\" data-test-id=\"end-game\">Spiel beenden</button>\r\n    </div>\r\n    <div show.bind=\"!isModerator\">\r\n        <button type=\"button\" class=\"btn disabled\" disabled=\"disabled\">Warte auf Moderator...</button>\r\n    </div>\r\n</template>"; });
//# sourceMappingURL=app-bundle.js.map