using Aquid.Core.Clients;
using Microsoft.Extensions.Caching.Memory;

namespace Aquid.Application.Ultraviolet;

public class OpenUvApiClient : BaseApiClient
{
	public OpenUvApiClient(HttpClient httpClient, IMemoryCache cache, ILogger<OpenUvApiClient> logger)
		: base(httpClient, cache, logger)
	{
	}

	public async Task<T> GetJsonCachedAsync<T>(
		string relativePath,
		string cacheKey,
		CancellationToken cancellationToken,
		TimeSpan? cacheDuration = null)
	{
		return await base.GetJsonCachedAsync<T>(relativePath, cacheKey, "OpenUV", cancellationToken, cacheDuration);
	}
}
