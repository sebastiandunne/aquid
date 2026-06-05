using Aquid.Core.Models.Weather;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquid.Application.Weather;

[ApiController]
[AllowAnonymous]
[Route("api/[controller]")]
public class WeatherController : ControllerBase
{
    private readonly ILogger<WeatherController> _logger;
    private readonly WeatherService _weatherService;

    public WeatherController(ILogger<WeatherController> logger, WeatherService weatherService)
    {
        _logger = logger;
        _weatherService = weatherService;
    }

    [HttpGet("forecast")]
    public ActionResult<IEnumerable<WeatherForecast>> GetForecast()
    {
        _logger.LogInformation("Weather forecast requested.");
        return Ok(_weatherService.GetForecast());
    }
}