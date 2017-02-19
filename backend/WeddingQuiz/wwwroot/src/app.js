export class App {
    constructor() {
        this.message = 'Hello World!';
    }

    configureRouter(config, router) {
        this.router = router;
        config.title = 'Aurelia';
        config.map([
            { route: ['', 'home'], name: 'home', moduleId: 'home/index' },
            { route: ['/game/create'], name: 'game', moduleId: 'game/create' },
            { route: ['/game/join'], name: 'game', moduleId: 'game/join' },
            { route: ['/question/answer'], name: 'question', moduleId: 'question/answer' },
            { route: ['/highscore'], name: 'highscore', moduleId: 'highscore/highscore' },
            { route: ['/lobby'], name: 'lobby', moduleId: 'lobby/lobby' }
            // { route: 'users', name: 'users', moduleId: 'users/index', nav: true },
            // { route: 'users/:id/detail', name: 'userDetail', moduleId: 'users/detail' },
            // { route: 'files*path', name: 'files', moduleId: 'files/index', href: '#files', nav: true }
        ]);
    }
}