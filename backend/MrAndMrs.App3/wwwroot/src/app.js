export class App {
    constructor() {
        this.message = 'Hello World!';
    }

    configureRouter(config, router) {
        this.router = router;
        config.title = 'Mr & Mrs';
        config.map([
            { route: ['', 'home'], name: 'home', moduleId: 'home/index' },
            { route: ['/game/create'], name: 'gameCreation', moduleId: 'game/create' },
            { route: ['/game/join'], name: 'game', moduleId: 'game/join' },
            { route: ['/question/question'], name: 'question', moduleId: 'question/question' },
            { route: ['/highscore'], name: 'highscore', moduleId: 'highscore/highscore' },
            { route: ['/lobby'], name: 'lobby', moduleId: 'lobby/lobby' },
            { route: ['/impressum'], name: 'impressum', moduleId: 'home/impressum.html' },
            { route: ['/datenschutz'], name: 'datenschutz', moduleId: 'home/datenschutz.html' }
            // { route: 'users', name: 'users', moduleId: 'users/index', nav: true },
            // { route: 'users/:id/detail', name: 'userDetail', moduleId: 'users/detail' },
            // { route: 'files*path', name: 'files', moduleId: 'files/index', href: '#files', nav: true }
        ]);
    }
}
