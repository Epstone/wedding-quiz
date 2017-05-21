import { SignalrService } from 'services/signalr-service';
import { inject } from 'aurelia-framework';
import { create } from './create';

@inject(create, SignalrService)
export class EditQuestions {
  constructor(parentModel, signalrService) {
    this.parentModel = parentModel;
    this.signalrService = signalrService;
    this.newQuestionText = "";

  }

  get lastQuestion() {
    return this.questionsModel[this.questionsModel.length - 1];
  }

  get firstQuestion() {
    return this.questionsModel[0];    
  }
  activate(questions) {
    this.questions = questions;
    this.questionsModel = [];

    for (var i = 0; i < this.questions.length; i++) {
      this.questionsModel.push(new Question(this.questions[i], () => this.updateQuestions()));
    }
  }

  addQuestion() {
    let questionToCreate = new Question(this.newQuestionText, () => this.updateQuestions());
    this.questionsModel.push(questionToCreate);
    this.updateQuestions();
    this.newQuestionText = "";
  }

  moveUp(question) {
    console.log("move question up", question.text);
    var currentIndex = this.questionsModel.indexOf(question);
    this.move(question, currentIndex - 1);
  }

  moveDown(question) {
    console.log("move question down", question.text);
    var currentIndex = this.questionsModel.indexOf(question);
    this.move(question, currentIndex + 1);
  }

  move(question, targetIndex) {
    var currentIndex = this.questionsModel.indexOf(question);
    var questionToMove = this.questionsModel[targetIndex];
    this.questionsModel.splice(targetIndex, 1, question);
    this.questionsModel.splice(currentIndex, 1, questionToMove);
    this.updateQuestions();
  }

  updateQuestions() {
    var rawQuestions = this.questionsModel.map(function (question) {
      return question.text;
    });

    console.log("questions to update:", rawQuestions);

    this.signalrService.updateQuestions(rawQuestions).then(() => {
      console.log("questions updated on server")
      self.newQuestionText = "";
    });

  }
}

export class Question {
  constructor(text, triggerUpdateCallback) {
    this.text = text;
    this.editActive = false;
    this.triggerUpdateCallback = triggerUpdateCallback;
  }

  changeEditState() {
    this.editActive = true;
  }

  updateText() {
    this.editActive = false;
    this.triggerUpdateCallback();
  }
}

