import { StageComponent } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';
import { waitFor } from 'aurelia-testing';

function getElement(cssSelector) {
    return document.querySelector(cssSelector);
}

describe('MyComponent', () => {
    let component;

    beforeEach(() => {
        component = StageComponent
            .withResources('highscore/highscore-table')
            .inView('<highscore-table model.bind="model"></highscore-table>')
            .boundTo({
                model: {
                    entries: [{
                        names: ["Peter", "Franz", "Olav"],
                        score: 15
                    },
                    {
                        names: ["Karl", "Gunter", "Heinz"],
                        score: 13
                    },
                    {
                        names: ["Heidi", "Georg", "Gunter"],
                        score: 10
                    }]
                }
            });
    });

    it('first place should be', done => {
        component.create(bootstrap).then(() => {
            var firstNames = getElement(".firstNames");
            var firstScore = getElement(".firstScore");
            expect(firstNames.innerHTML).toBe("Peter,Franz,Olav");
            expect(firstScore.innerHTML).toBe("15");
            return done();
        }).catch(e => { console.log(e.toString()) });
    });

    it('second place should be', done => {
        component.create(bootstrap).then(() => {
            var secondNames = getElement(".secondNames");
            var secondScore = getElement(".secondScore");
            expect(secondNames.innerHTML).toBe("Karl,Gunter,Heinz");
            expect(secondScore.innerHTML).toBe("13");
            return done();
        }).catch(e => { console.log(e.toString()) });
    });


    it('third place should be', done => {
        component.create(bootstrap).then(() => {
            var secondNames = getElement(".thirdNames");
            var secondScore = getElement(".thirdScore");
            expect(secondNames.innerHTML).toBe("Heidi,Georg,Gunter");
            expect(secondScore.innerHTML).toBe("10");
            return done();
        }).catch(e => { console.log(e.toString()) });
    });

    afterEach(() => {
        component.dispose();
    });
});


// describe('MyComponent', () => {
//     let component;

//     beforeEach(() => {
//         component = StageComponent
//             .withResources('highscore/highscore')
//             .inView('<highscore highscore-model.bind="highscoreInstance"></highscore>')
//             .boundTo({ currentQuestion: 'Wer wäscht ab?' });
//     });

//     it('should render first name', done => {

//         component.create(bootstrap).then(() => {
//             component.viewModel.activate({ gameId: "12345" });
//             const headingElement = document.querySelector("[data-test-id='heading']");
//             expect(headingElement.innerHTML).toBe('Übersicht');
//             api.instance.trigger("gameUpdated", game);

//             waitFor(() => {
//                 const currentQuestionElement = document.querySelector("[data-test-id='current-question']");
//                 if (currentQuestionElement.innerHTML == 'A') {
//                     return currentQuestionElement;
//                 }
//                 else {
//                     return null;
//                 }
//             }).then((questionElement) => {
//                   expect(nameElement.innerHTML).toBe('A');
//                 done();
//             });
//         }).catch(e => {
//             console.log(e.toString())
//         });
//     });

//     afterEach(() => {
//         component.dispose();
//     });
// });



