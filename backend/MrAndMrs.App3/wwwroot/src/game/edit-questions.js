export class EditQuestions {
  activate(questions) {
    var self = this;
    self.questions = questions;

    for (var i = 0; i < self.questions.length; i++) {
      self.questionsModel.push({
        text: self.questions[i],
        editActive: false,
        editAction: self.changeEditState,
        updateAction: (question) => self.applyQuestionUpdate(self, question)
      });
    }
  }

  changeEditState() {
    this.editActive = !this.editActive;
  }

  addQuestion() {
    let self = this;
    let questionToCreate = {
      text: this.newQuestionText,
      editActive: false,
      editAction: this.changeEditState
    };

    this.questionsModel.push(questionToCreate);

    this.updateQuestions();
  }

  applyQuestionUpdate(parent, child) {
    child.editActive = false;
    parent.updateQuestions.apply(parent);
  }

}

