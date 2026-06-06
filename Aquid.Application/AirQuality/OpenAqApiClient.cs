using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace Aquid.Application.AirQuality;

public class OpenAqApiClient
{
    private static readonly TimeSpan DefaultCacheDuration = TimeSpan.FromMinutes(1);

    private static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<OpenAqApiClient> _logger;

    public OpenAqApiClient(HttpClient httpClient, IMemoryCache cache, ILogger<OpenAqApiClient> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
    }

    public async Task<T> GetJsonCachedAsync<T>(
        string relativePath,
        string cacheKey,
        CancellationToken cancellationToken,
        TimeSpan? cacheDuration = null)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
        {
            throw new ArgumentException("Relative path must be provided.", nameof(relativePath));
        }

        if (string.IsNullOrWhiteSpace(cacheKey))
        {
            throw new ArgumentException("Cache key must be provided.", nameof(cacheKey));
        }

        return await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = cacheDuration ?? DefaultCacheDuration;

            _logger.LogInformation("OpenAQ cache miss for {CacheKey}; requesting {RelativePath}", cacheKey, relativePath);
            
            const string flipDeRelPath = "v3/locations?bbox=2.200,50.282,8.883,53.752"; // lng lat lng lat (south first)
            using var response = await _httpClient.GetAsync(relativePath, cancellationToken);
            response.EnsureSuccessStatusCode();

            await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var payload = await JsonSerializer.DeserializeAsync<T>(responseStream, JsonSerializerOptions, cancellationToken);
            if (payload is null)
            {
                throw new JsonException($"Unable to deserialize OpenAQ response for '{relativePath}'.");
            }

            return payload;
        }) ?? throw new InvalidOperationException("Cached OpenAQ payload was unexpectedly null.");
    }
}