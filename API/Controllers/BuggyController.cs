using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class BuggyController : BaseApiController
{

    [HttpGet("auth")]
    public IActionResult GetSecret()
    {
        return Unauthorized();
    }

    [HttpGet("not-found")]
    public IActionResult GetNotFound()
    {
        return NotFound();

    }

    [HttpGet("server-error")]
    public IActionResult GetServerError()
    {
        throw new Exception("This is a server error!");

    }

    [HttpGet("bad-request")]
    public IActionResult GetBadRequest()
    {
        return BadRequest("This is not a good request");

    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin-secret")]
    public IActionResult GetSecretAdmin()
    {
        return Ok("You are an admin, and only you can see it");

    }
}
