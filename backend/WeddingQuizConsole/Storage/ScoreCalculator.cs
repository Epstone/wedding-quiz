using System.Collections.Generic;

namespace WeddingQuizConsole.Storage
{
    internal class ScoreCalculator
    {
        private IEnumerable<AnswerEntity> answersCurrentGame;

        public ScoreCalculator(IEnumerable<AnswerEntity> answersCurrentGame)
        {
            this.answersCurrentGame = answersCurrentGame;
        }
    }
}