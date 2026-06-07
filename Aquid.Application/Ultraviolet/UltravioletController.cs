using Aquid.Core.Models.Ultraviolet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquid.Application.Ultraviolet;

[ApiController]
[AllowAnonymous]
[Route("api/[controller]")]
public class UltravioletController : ControllerBase
{
    private readonly ILogger<UltravioletController> _logger;
    private readonly UltravioletService _ultravioletService;

    public UltravioletController(ILogger<UltravioletController> logger, UltravioletService ultravioletService)
    {
        _logger = logger;
        _ultravioletService = ultravioletService;
    }
    
    [HttpGet("forecast")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(UltravioletForecastMetaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UltravioletForecastMetaResponse>> GetUltravioletForecast(
        [FromQuery(Name = "lat")] double lat,
        [FromQuery(Name = "lng")] double lng,
        [FromQuery(Name = "alt")] int? altitude,
        [FromQuery(Name = "dt")] string? datetime,
        CancellationToken cancellationToken
    )
    {
        var parsedDateTime = (DateTimeOffset?)null;
        if (!string.IsNullOrWhiteSpace(datetime))
        {
            if (DateTimeOffset.TryParse(datetime, null, System.Globalization.DateTimeStyles.RoundtripKind, out var dt))
            {
                parsedDateTime = dt;
            }
            else
            {
                return BadRequest("Invalid datetime format. Please use ISO 8601 format.");
            }
        }

        // truncate lat and lng to 1 decimal place to reduce the number of unique forecasts and improve cache hit rates
        var roundedLat = Math.Round(lat, 1);
        var roundedLng = Math.Round(lng, 1);

        var result = await _ultravioletService.GetUltravioletForecast(roundedLat, roundedLng, altitude, parsedDateTime, cancellationToken);
    

        var resultMeta = UltravioletForecastMetaResponse.From(result);
        
        return Ok(resultMeta);
    }
            
}