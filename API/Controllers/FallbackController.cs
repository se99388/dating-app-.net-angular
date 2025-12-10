using System;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class FallbackController : Controller
{
    // Serve the index.html file for any non-API routes to support client-side routing
    public ActionResult Index()
    {
        return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(),
            "wwwroot", "index.html"), "text/html");
    }
}
