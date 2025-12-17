using System;
using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extentions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService) : BaseApiController
{

    [HttpPost("register")]//api/account/register
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {

        var user = new AppUser
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            UserName = registerDto.Email,
            Member = new Member
            {
                DisplayName = registerDto.DisplayName,
                Gender = registerDto.Gender,
                DateOfBirth = registerDto.DateOfBirth,
                City = registerDto.City,
                Country = registerDto.Country
            }
        };

        var result = await userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("Identity", error.Description);
            }
            return ValidationProblem();
        }

        await userManager.AddToRoleAsync(user, "Member");

        await SetRefreshToken(user);

        return await user.ToDto(tokenService);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await userManager.FindByEmailAsync(loginDto.Email);

        if (user == null) return Unauthorized("Invalid email");

        var result = await userManager.CheckPasswordAsync(user, loginDto.Password);

        if (!result) return Unauthorized("Invalid password");

        await SetRefreshToken(user);

        return await user.ToDto(tokenService);
    }


    [HttpPost("refresh-token")]
    // if the refresh token is valid, extend refresh token expiry time
    public async Task<ActionResult<UserDto>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];

        if (refreshToken == null)
        {
            return NoContent();
        }

        var user = await userManager.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken && u.RefreshTokenExpiryTime > DateTime.UtcNow);

        if (user == null)
        {
            return Unauthorized("Invalid or expired refresh token");
        }

        await SetRefreshToken(user);

        return await user.ToDto(tokenService);
    }

    private async Task SetRefreshToken(AppUser user)
    {
        var refreshToken = tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

        await userManager.UpdateAsync(user);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,//https only
            SameSite = SameSiteMode.Strict,
            Expires = user.RefreshTokenExpiryTime
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await userManager.Users.Where(u => u.Id == User.GetMemberId())
        .ExecuteUpdateAsync(setters => setters
        .SetProperty(u => u.RefreshToken, _ => null)
        .SetProperty(u => u.RefreshTokenExpiryTime, _ => null)
        );

        Response.Cookies.Delete("refreshToken");
        return Ok();
    }

}