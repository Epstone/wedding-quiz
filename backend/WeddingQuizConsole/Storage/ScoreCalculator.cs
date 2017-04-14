namespace WeddingQuizConsole.Storage
{
    using System.Collections.Generic;
    using System.Linq;

    public class ScoreCalculator
    {
        private readonly IEnumerable<AnswerEntity> answersCurrentGame;

        public ScoreCalculator(IEnumerable<AnswerEntity> answersCurrentGame)
        {
            this.answersCurrentGame = answersCurrentGame;
        }

        public Dictionary<string, int> DoEvaluateScore()
        {
            Dictionary<string, int> resultScore = new Dictionary<string, int>();
            // foreach couple answer -> find matching user answers and increase score entity
            var couplesAnswers = answersCurrentGame.Where(x => x.Username == "couple").OrderBy(x => x.QuestionIndex);

            foreach (var couplesAnswer in couplesAnswers)
            {
                var answerWithCorrectUserAnswer = CorrectUserAnswers(answersCurrentGame, couplesAnswer);
                var answerWithIncorrectUserAnswer = InCorrectUserAnswer(answersCurrentGame, couplesAnswer);
                IncreaseScore(answerWithCorrectUserAnswer, resultScore);
                InitializeScoreValue(answerWithIncorrectUserAnswer, resultScore);
            }
            return resultScore;
        }

        private void InitializeScoreValue(IEnumerable<AnswerEntity> answerWithIncorrectUserAnswer, Dictionary<string, int> resultScore)
        {
            foreach (AnswerEntity answer in answerWithIncorrectUserAnswer)
            {
                if (!resultScore.ContainsKey(answer.Username))
                {
                    resultScore[answer.Username] = 0;
                }
            }
        }

        private void IncreaseScore(IEnumerable<AnswerEntity> answerWithCorrectUserAnswer, Dictionary<string, int> resultScore)
        {
            foreach (AnswerEntity answer in answerWithCorrectUserAnswer)
            {
                if (!resultScore.ContainsKey(answer.Username))
                {
                    resultScore[answer.Username] = 1;
                }
                else
                {
                    resultScore[answer.Username] = resultScore[answer.Username] + 1;
                }
            }
        }

        private IEnumerable<AnswerEntity> InCorrectUserAnswer(IEnumerable<AnswerEntity> answersCurrentGame, AnswerEntity couplesAnswer)
        {
            var answerWithInCorrectUserAnswer = answersCurrentGame.Where(x =>
                x.QuestionIndex == couplesAnswer.QuestionIndex
                && x.Username != "couple"
                && x.Answer != couplesAnswer.Answer);
            return answerWithInCorrectUserAnswer;
        }

        private IEnumerable<AnswerEntity> CorrectUserAnswers(IEnumerable<AnswerEntity> answers, AnswerEntity couplesAnswer)
        {
            var answerWithCorrectUserAnswer = answers.Where(x =>
                x.QuestionIndex == couplesAnswer.QuestionIndex
                && x.Username != "couple"
                && x.Answer == couplesAnswer.Answer);
            return answerWithCorrectUserAnswer;
        }
    }
}