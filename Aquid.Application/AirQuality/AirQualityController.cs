using Aquid.Core.Models.AirQuality;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquid.Application.AirQuality;

[ApiController]
[AllowAnonymous]
[Route("api/[controller]")]
public class AirQualityController : ControllerBase
{
    private readonly ILogger<AirQualityController> _logger;
    private readonly AirQualityService _airQualityService;

    public AirQualityController(ILogger<AirQualityController> logger, AirQualityService airQualityService)
    {
        _logger = logger;
        _airQualityService = airQualityService;
    }

    [HttpGet("countries/{isoCountryCode}")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(AirQualityCountryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AirQualityCountryResponse>> GetCountryData(
        string isoCountryCode,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Air quality country request for {CountryCode}", isoCountryCode);
        var result = await _airQualityService.GetCountryDataAsync(isoCountryCode, cancellationToken);
        return Ok(result);
    }
}