using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WeddingQuiz.Controllers
{
    using Microsoft.AspNetCore.Mvc;

    public class GameController : Controller
    {
        [HttpPost]
        public ActionResult CreateGame()
        {
            return Ok(12345);
        }
    }
}
