using Aquid.Core.Clients;
using Microsoft.Extensions.Caching.Memory;

namespace Aquid.Application.AirQuality;

public class OpenAqApiClient : BaseApiClient
{
    public OpenAqApiClient(HttpClient httpClient, IMemoryCache cache, ILogger<OpenAqApiClient> logger)
        : base(httpClient, cache, logger)
    {
    }

    public async Task<T> GetJsonCachedAsync<T>(
        string relativePath,
        string cacheKey,
        CancellationToken cancellationToken,
        TimeSpan? cacheDuration = null)
    {
        return await base.GetJsonCachedAsync<T>(relativePath, cacheKey, "OpenAQ", cancellationToken, cacheDuration);
    }
}