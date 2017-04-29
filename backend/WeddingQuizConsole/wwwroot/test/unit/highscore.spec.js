import { StageComponent } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';
import { GameHubSingleton } from 'services/game-hub-singleton';
import {Promise} from 'bluebird';
import { waitFor } from 'aurelia-testing';

export class GameHubSingletonMock {
    constructor() {
        var self = this;
        let onSubscriptions = {};
        this.isInstanceCreated = false;

        this.instanceMock = {
            on: function (subscriptionName, callback) {
                console.log("registered callback for - " + subscriptionName);
                onSubscriptions[subscriptionName] = callback;
            },
            trigger: function (subscriptionName, params) {
                console.log("triggering - " + subscriptionName, params);
                onSubscriptions[subscriptionName](params);
            }
        };
    }

    createGameHub() {
        this.isInstanceCreated = true;
        return this.instance;
    }

    get instance() {
        if (this.isInstanceCreated) {
            return this.instanceMock;
        } else {
            return null;
        }
    }
}




describe('MyComponent', () => {
    let component;
    let api = new GameHubSingletonMock();

    var game = {
        currentQuestionIndex: 0,
        questions: ["A", "B", "C"],
        highscore: [
            { name: "Paul", score: 7 },
            { name: "Matthias", score: 5 },
            { name: "Arno", score: 3 },
        ]
    };

    beforeEach(() => {
        component = StageComponent
            .withResources('highscore/highscore')
            .inView('<highscore highscore-model.bind="highscoreInstance"></highscore>')
            .boundTo({ currentQuestion: 'Wer wäscht ab?' });

        component.bootstrap(aurelia => {
            aurelia.use.standardConfiguration();
            aurelia.container.registerInstance(GameHubSingleton, api);
        });
    });

    it('should render first name', done => {

        component.create(bootstrap).then(() => {
            component.viewModel.activate({ gameId: "12345" });
            const headingElement = document.querySelector("[data-test-id='heading']");
            expect(headingElement.innerHTML).toBe('Übersicht');
            api.instance.trigger("gameUpdated", game);

            waitFor(() => {
                const currentQuestionElement = document.querySelector("[data-test-id='current-question']");
                if (currentQuestionElement.innerHTML == 'A') {
                    return currentQuestionElement;
                }
                else {
                    return null;
                }
            }).then((questionElement) => {
                  expect(nameElement.innerHTML).toBe('A');
                done();
            });
        }).catch(e => {
            console.log(e.toString())
        });
    });

    afterEach(() => {
        component.dispose();
    });
});



