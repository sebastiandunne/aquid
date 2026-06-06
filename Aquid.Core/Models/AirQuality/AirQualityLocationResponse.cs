namespace Aquid.Core.Models.AirQuality;

public record AirQualityLocationResponse(
	AirQualityLocationMeta Meta,
	IReadOnlyList<AirQualityLocation> Results);

public record AirQualityLocationMeta(
	string Name,
	string Website,
	int Page,
	int Limit);

public record AirQualityLocation(
	long Id,
	string Name,
	string? Locality,
	string Timezone,
	AirQualityLocationCountry Country,
	AirQualityLocationOrganization Owner,
	AirQualityLocationOrganization Provider,
	bool IsMobile,
	bool IsMonitor,
	IReadOnlyList<AirQualityLocationInstrument> Instruments,
	IReadOnlyList<AirQualityLocationSensor> Sensors,
	AirQualityLocationCoordinates Coordinates,
	IReadOnlyList<AirQualityLocationLicense> Licenses,
	IReadOnlyList<double> Bounds,
	double? Distance,
	AirQualityLocationDateTime DateTimeFirst,
	AirQualityLocationDateTime DateTimeLast);

public record AirQualityLocationCountry(
	long Id,
	string Code,
	string Name);

public record AirQualityLocationOrganization(
	long Id,
	string Name);

public record AirQualityLocationInstrument(
	long Id,
	string Name);

public record AirQualityLocationSensor(
	long Id,
	string Name,
	AirQualityLocationParameter Parameter);

public record AirQualityLocationParameter(
	long Id,
	string Name,
	string Units,
	string? DisplayName);

public record AirQualityLocationCoordinates(
	double Latitude,
	double Longitude);

public record AirQualityLocationLicense(
	long Id,
	string Name,
	AirQualityLocationAttribution Attribution,
	DateTimeOffset DateFrom,
	DateTimeOffset? DateTo);

public record AirQualityLocationAttribution(
	string Name,
	string? Url);

public record AirQualityLocationDateTime(
	DateTimeOffset Utc,
	DateTimeOffset Local);
