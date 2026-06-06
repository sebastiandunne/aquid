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
    
    [HttpGet("locations")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(AirQualityLocationsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AirQualityLocationsResponse>> GetLocationsInBoundingBox(
        [FromQuery(Name = "ne_lat")] double neLat,
        [FromQuery(Name = "ne_lng")] double neLong,
        [FromQuery(Name = "sw_lat")] double swLat,
        [FromQuery(Name = "sw_lng")] double swLong,
        CancellationToken cancellationToken
    )
    {
        if (neLat < -90 || neLat > 90 || swLat < -90 || swLat > 90)
        {
            return BadRequest("Latitude values must be between -90 and 90.");
        }
        if (neLong < -180 || neLong > 180 || swLong < -180 || swLong > 180)
        {
            return BadRequest("Longitude values must be between -180 and 180.");
        }
        if (neLat <= swLat)        {
            return BadRequest("Northeast latitude must be greater than southwest latitude.");
        }
        if (neLong <= swLong)        {
            return BadRequest("Northeast longitude must be greater than southwest longitude.");
        }
        var boundingBox = new BoundingBox(neLat, neLong, swLat, swLong);
        var result = await _airQualityService.GetLocationsInBoundingBoxAsync(boundingBox, cancellationToken);

        return Ok(result);
    }
            
}