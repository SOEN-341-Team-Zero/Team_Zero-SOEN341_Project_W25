using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Models;
using UserModel.Models;
using System.Threading.Channels;

namespace ChatHaven.Controllers;

public class CreateTeamsController : Controller
{

    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}