using System.Globalization;
using Aquid.Core.Models.Ultraviolet;

namespace Aquid.Application.Ultraviolet;

public class UltravioletService
{
    private readonly ILogger<UltravioletService> _logger;
    private readonly OpenUvApiClient _openUvApiClient;

    public UltravioletService(
        ILogger<UltravioletService> logger,
        OpenUvApiClient openUvApiClient)
    {
        _logger = logger;
        _openUvApiClient = openUvApiClient;
    }

    public async Task<UltravioletForecastResponse> GetUltravioletForecast(
        double lat,
        double lng,
        int? altitude,
        DateTimeOffset? datetime,
        CancellationToken cancellationToken)
    {
        var queryParts = new List<string>
        {
            $"lat={lat.ToString(CultureInfo.InvariantCulture)}",
            $"lng={lng.ToString(CultureInfo.InvariantCulture)}"
        };

        if (altitude.HasValue)
        {
            queryParts.Add($"alt={altitude.Value}");
        }

        if (datetime.HasValue)
        {
            // convert to ISO 8601 format, which is what OpenUV expects
            queryParts.Add($"dt={Uri.EscapeDataString(datetime.Value.ToString("o"))}");
        }

        var endpoint = $"v1/forecast?{string.Join("&", queryParts)}";
        var cacheKey = $"openuv:forecast:lat:{lat.ToString(CultureInfo.InvariantCulture)}:lng:{lng.ToString(CultureInfo.InvariantCulture)}:alt:{altitude?.ToString() ?? "none"}:dt:{datetime?.ToString("o") ?? "none"}";

        _logger.LogInformation("Requesting OpenUV forecast for lat {Latitude}, lng {Longitude}, alt {Altitude}, dt {DateTime}", lat, lng, altitude, datetime);

        return await _openUvApiClient.GetJsonCachedAsync<UltravioletForecastResponse>(
            endpoint,
            cacheKey,
            cancellationToken);
    }
}