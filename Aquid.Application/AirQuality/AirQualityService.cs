using System.Net;
using Aquid.Core.Models.AirQuality;
using Microsoft.Extensions.Caching.Memory;

namespace Aquid.Application.AirQuality;

public class AirQualityService
{
    private const string IsoPathLookupSupportedCacheKey = "openaq:countries:path-iso-supported";

    private readonly ILogger<AirQualityService> _logger;
    private readonly OpenAqApiClient _openAqApiClient;
    private readonly IMemoryCache _memoryCache;

    public AirQualityService(
        ILogger<AirQualityService> logger,
        OpenAqApiClient openAqApiClient,
        IMemoryCache memoryCache)
    {
        _logger = logger;
        _openAqApiClient = openAqApiClient;
        _memoryCache = memoryCache;
    }

    public async Task<AirQualityCountryResponse> GetCountryDataAsync(string isoCountryCode, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(isoCountryCode))
        {
            throw new ArgumentException("ISO country code must be provided.", nameof(isoCountryCode));
        }

        var normalizedCode = isoCountryCode.Trim().ToUpperInvariant();
        var endpoint = $"v3/countries/{normalizedCode}";
        var directCacheKey = $"openaq:countries:by-code:{normalizedCode}";
        _logger.LogInformation("Requesting OpenAQ country data for {CountryCode}", normalizedCode);

        var shouldTryPathLookup = !_memoryCache.TryGetValue(IsoPathLookupSupportedCacheKey, out bool isPathLookupSupported)
                                  || isPathLookupSupported;

        if (shouldTryPathLookup)
        {
            try
            {
                return await _openAqApiClient.GetJsonCachedAsync<AirQualityCountryResponse>(
                    endpoint,
                    directCacheKey,
                    cancellationToken);
            }
            catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.UnprocessableEntity)
            {
                _memoryCache.Set(IsoPathLookupSupportedCacheKey, false, TimeSpan.FromMinutes(30));

                _logger.LogInformation(
                    "Path-based country lookup was rejected by OpenAQ. Falling back to list-filter lookup for {CountryCode}",
                    normalizedCode);
            }
        }

        var fallbackPayload = await _openAqApiClient.GetJsonCachedAsync<AirQualityCountryResponse>(
            "v3/countries",
            "openaq:countries:all",
            cancellationToken);
        var match = fallbackPayload.Results
            .FirstOrDefault(country => string.Equals(country.Code, normalizedCode, StringComparison.OrdinalIgnoreCase));

        return match is null
            ? new AirQualityCountryResponse(Array.Empty<AirQualityCountry>())
            : new AirQualityCountryResponse(new[] { match });
    }
}