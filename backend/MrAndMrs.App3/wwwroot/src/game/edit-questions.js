export class EditQuestions {
  activate(questions) {
    var self = this;
    self.questions = questions;
    self.questionsModel = [];

    for (var i = 0; i < self.questions.length; i++) {
      self.questionsModel.push(new Question(self.questions[i]));
    }
  }

  addQuestion() {
    let self = this;
    let questionToCreate = new Question(this.newQuestionText);
    this.questionsModel.push(questionToCreate);
    this.updateQuestions();
  }

  applyQuestionUpdate(parent, child) {
    parent.updateQuestions.apply(parent);
  }

}

export class Question {
  constructor(text) {
    this.text = text;
    this.editActive = false;
  }

  changeEditState() {
    this.editActive = true;
  }

  updateQuestions() {
    this.editActive = false;
    debugger;
  }


}

