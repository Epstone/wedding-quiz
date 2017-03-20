import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class signalrService {
  constructor(eventAggregator) {
    console.log("signalr service constructor created")
    this.eventAggregator = eventAggregator;
  }

  activate(params) {
    console.log("signalr service activated")

  }

  verifyConnected(username) {
    var self = this;

    var promise = new Promise(
      (resolve, reject) => {

        var gameHub = $.connection.hub.createHubProxy("postsHub");
        $.connection.hub.qs = 'username=' + username;
        $.connection.hub.logging = true;

        gameHub.on('playerListUpdated', function (updatedPlayerlist) {
          console.log("Received playerlist");
          console.log(updatedPlayerlist);
          self.eventAggregator.publish('playerListUpdated', updatedPlayerlist);
        });



        $.connection.hub.start().done(function () {
          resolve();
          console.log("hub is started now.");
          gameHub.invoke('updatePlayerList');
        });

      }
    );

    return promise;
  }

  startGame() {
    console.log("triggered game start");
  }
}

