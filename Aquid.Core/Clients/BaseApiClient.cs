using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Aquid.Core.Clients;

public abstract class BaseApiClient
{
	private static readonly TimeSpan DefaultCacheDuration = TimeSpan.FromMinutes(1);

	private static readonly JsonSerializerOptions JsonSerializerOptions = new()
	{
		PropertyNameCaseInsensitive = true
	};

	private readonly HttpClient _httpClient;
	private readonly IMemoryCache _cache;
	private readonly ILogger _logger;

	protected BaseApiClient(HttpClient httpClient, IMemoryCache cache, ILogger logger)
	{
		_httpClient = httpClient;
		_cache = cache;
		_logger = logger;
	}

	protected async Task<T> GetJsonCachedAsync<T>(
		string relativePath,
		string cacheKey,
		string clientName,
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

			_logger.LogInformation("{ClientName} cache miss for {CacheKey}; requesting {RelativePath}", clientName, cacheKey, relativePath);

			using var response = await _httpClient.GetAsync(relativePath, cancellationToken);
			response.EnsureSuccessStatusCode();

			await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
			var payload = await JsonSerializer.DeserializeAsync<T>(responseStream, JsonSerializerOptions, cancellationToken);
			if (payload is null)
			{
				throw new JsonException($"Unable to deserialize {clientName} response for '{relativePath}'.");
			}

			return payload;
		}) ?? throw new InvalidOperationException($"Cached {clientName} payload was unexpectedly null.");
	}
}
