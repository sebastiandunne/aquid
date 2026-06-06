namespace Aquid.Core.Models.AirQuality;

public readonly record struct BoundingBox(
	double NorthEastLatitude,
	double NorthEastLongitude,
	double SouthWestLatitude,
	double SouthWestLongitude)
{
	public string ToOpenAqBboxQueryValue()
	{
		return string.Create(
			System.Globalization.CultureInfo.InvariantCulture,
			$"{SouthWestLatitude},{SouthWestLongitude},{NorthEastLatitude},{NorthEastLongitude}");
	}
}