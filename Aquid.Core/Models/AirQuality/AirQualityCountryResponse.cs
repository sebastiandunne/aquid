namespace Aquid.Core.Models.AirQuality;

public record AirQualityCountryResponse(IReadOnlyList<AirQualityCountry> Results);

public record AirQualityCountry(
    long Id,
    string Code,
    string Name,
    DateTimeOffset? DateTimeFirst,
    DateTimeOffset? DateTimeLast,
    IReadOnlyList<AirQualityParameter> Parameters);

public record AirQualityParameter(
    long Id,
    string Name,
    string Units,
    string? DisplayName);