using System.Text.Json;

namespace Aquid.Core.Models.AirQuality;

public record AirQualityMeasurementsResponse(
	AirQualityMeasurementMeta Meta,
	IReadOnlyList<AirQualityMeasurement> Results);

public record AirQualityMeasurementMeta(
	string Name,
	string Website,
	int Page,
	int Limit);

public record AirQualityMeasurement(
	double? Value,
	AirQualityMeasurementParameter Parameter,
	AirQualityMeasurementPeriod Period,
	AirQualityMeasurementCoordinates? Coordinates,
	JsonElement? Summary,
	AirQualityMeasurementCoverage Coverage
	);

public record AirQualityMeasurementParameter(
	long Id,
	string Name,
	string Units,
	string? DisplayName);

public record AirQualityMeasurementPeriod(
	string Label,
	string Interval,
	AirQualityMeasurementDateTime DateTimeFrom,
	AirQualityMeasurementDateTime DateTimeTo);

public record AirQualityMeasurementCoverage(
	int ExpectedCount,
	string ExpectedInterval,
	int ObservedCount,
	string ObservedInterval,
	double PercentComplete,
	double PercentCoverage,
	AirQualityMeasurementDateTime DateTimeFrom,
	AirQualityMeasurementDateTime DateTimeTo);

public record AirQualityMeasurementDateTime(
	DateTimeOffset Utc,
	DateTimeOffset Local);

public record AirQualityMeasurementCoordinates(
	double Latitude,
	double Longitude);
