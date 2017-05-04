import { StageComponent } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';
import { waitFor } from 'aurelia-testing';

describe('MyComponent', () => {
    let component;

    beforeEach(() => {
        component = StageComponent
            .withResources('highscore/highscore-table')
            .inView('<highscore-table model.bind="model"></highscore-table>')
            .boundTo({
                model: {
                    first: {
                        names: ["Peter", "Franz", "Olav"],
                        score: 15
                    }
                }
            });
    });

    it('should render first name', done => {
        component.create(bootstrap).then(() => {
            const nameElement = document.querySelector('.first');
            expect(nameElement.innerHTML).toBe("Peter,Franz,Olav");
            done();
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



