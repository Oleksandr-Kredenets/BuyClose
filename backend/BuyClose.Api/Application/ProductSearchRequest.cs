namespace BuyClose.Api.Application;

/// <summary>Product search text and the user's geographic coordinates.</summary>
public sealed record ProductSearchRequest(string Title, UserLocation Location)
{
    public (string Key, string Error)? Validate()
    {
        if (string.IsNullOrWhiteSpace(Title))
        {
            return (nameof(Title), "A product title is required.");
        }

        if (Title.Length > 300)
        {
            return (nameof(Title), "The product title must not exceed 300 characters.");
        }

        if (Location is null)
        {
            return (nameof(Location), "A user location is required.");
        }

        if (Location.Latitude is < -90 or > 90)
        {
            return ("location.lat", "Latitude must be between -90 and 90.");
        }

        if (Location.Longitude is < -180 or > 180)
        {
            return ("location.lng", "Longitude must be between -180 and 180.");
        }

        return null;
    }
}

/// <summary>WGS84 coordinates received from the frontend.</summary>
public sealed record UserLocation(
    [property: System.Text.Json.Serialization.JsonPropertyName("lat")] double Latitude,
    [property: System.Text.Json.Serialization.JsonPropertyName("lng")] double Longitude);
