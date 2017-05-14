namespace MrAndMrs.App3.Controllers
{
    using System.ComponentModel.DataAnnotations;

    public class JoinGameModel
    {
        private string gameId;

        [StringLength(60, MinimumLength = 1)]
        [Required]
        public string Username { get; set; }

        [StringLength(60, MinimumLength = 3)]
        [Required]
        public string GameId
        {
            get { return gameId; }
            set { gameId = value.ToLowerInvariant(); }
        }

        [StringLength(60, MinimumLength = 3)]
        [Required]
        public string  AccountKey { get; set; }
    }
}