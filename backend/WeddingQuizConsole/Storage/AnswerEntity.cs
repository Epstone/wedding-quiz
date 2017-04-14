namespace WeddingQuizConsole.Storage
{
    using Microsoft.WindowsAzure.Storage.Table;

    public class AnswerEntity : TableEntity
    {
        public int Answer { get; set; }
        public int QuestionIndex { get; set; }
        public string Username { get; set; }

        public string GameId { get; set; }


    }
}