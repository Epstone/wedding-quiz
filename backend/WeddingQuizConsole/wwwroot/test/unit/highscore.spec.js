import { StageComponent } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';
import { SignalrService } from 'services/signalr-service';

export class MockApi {
    response = undefined;

    verifyConnected() {
        console.log("verify connected was called :)");

        var game = {
            currentQuestionIndex: 0,
            questions: ["A,B,C"],
            highscore: [
                { name: "Paul", score: 7 },
                { name: "Matthias", score: 5 },
                { name: "Arno", score: 3 },
            ]
        };

        return Promise.resolve(game);
    }
}

describe('MyComponent', () => {
    let component;
    let api = new MockApi();

    beforeEach(() => {
        component = StageComponent
            .withResources('highscore/highscore')
            .inView('<highscore highscore-model.bind="highscoreInstance"></highscore>')
            .boundTo({ currentQuestion: 'Wer wäscht ab?' });

        component.bootstrap(aurelia => {
            aurelia.use
                .standardConfiguration();

            aurelia.container.registerInstance(SignalrService, api);
        });
    });

    it('should render first name', done => {

        component.create(bootstrap).then(() => {
            component.viewModel.activate({ gameId: "12345" });
            const nameElement = document.querySelector("[data-test-id='heading']");
            expect(nameElement.innerHTML).toBe('Übersicht');
            done();
            return;
        }).catch(e => {
            console.log(e.toString())
        });
    });

    afterEach(() => {
        component.dispose();
    });
});

