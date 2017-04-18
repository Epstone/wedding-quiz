namespace WeddingQuizConsole.Controllers
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public class JoinGameModel
    {
        [StringLength(60, MinimumLength = 1)]
        [Required]
        public string Username { get; set; }

        [StringLength(60, MinimumLength = 3)]
        [Required]
        public string GameId { get; set; }

        [StringLength(60, MinimumLength = 3)]
        [Required]
        public string  AccountKey { get; set; }
    }
}