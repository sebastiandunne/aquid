using System.Text.Json.Serialization;

namespace Aquid.Core.Models.Ultraviolet;

public record UltravioletForecastResponse(
    [property: JsonPropertyName("result")] IReadOnlyList<UltravioletForecastResult> Result);

public record UltravioletForecastMetaResponse(
    [property: JsonPropertyName("result")] IReadOnlyList<UltravioletForecastResult> Result,
    [property: JsonPropertyName("meta")] UltravioletForecastMeta Meta)
{
    public static UltravioletForecastMetaResponse From(UltravioletForecastResponse result)
    {
        ArgumentNullException.ThrowIfNull(result);

        var max = result.Result.MaxBy(r => r.Uv);

        return new UltravioletForecastMetaResponse(
            result.Result,
            new UltravioletForecastMeta(max));
    }
}

public record UltravioletForecastMeta(
    [property: JsonPropertyName("max")] UltravioletForecastResult? Max);

public record UltravioletForecastResult(
    [property: JsonPropertyName("uv")] double Uv,
    [property: JsonPropertyName("uv_time")] DateTimeOffset UvTime,
    [property: JsonPropertyName("sun_position")] UltravioletSunPosition SunPosition);

public record UltravioletSunPosition(
    [property: JsonPropertyName("azimuth")] double Azimuth,
    [property: JsonPropertyName("altitude")] double Altitude);
