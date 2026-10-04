using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using BuyClose.Api.Application;
using Microsoft.Extensions.Options;

namespace BuyClose.Api.Infrastructure;

/// <summary>Searches nearby points of interest with the Mapbox Search Box API.</summary>
public sealed class MapboxSearchClient(
    HttpClient httpClient,
    IOptions<MapboxOptions> options) : IMapboxSearchClient
{
    /// <summary>Finds nearby shops, mapping Mapbox POIs to the existing market contract.</summary>
    public async Task<IReadOnlyList<NearbyMarket>> FindNearbyMarketsAsync(
        string storeType,
        UserLocation location,
        CancellationToken cancellationToken)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.AccessToken))
        {
            throw new InvalidOperationException(
                "Mapbox access token is missing. Configure Mapbox:AccessToken.");
        }

        if (settings.RadiusMeters is <= 0 or > 50_000)
        {
            throw new InvalidOperationException(
                "Mapbox:RadiusMeters must be greater than 0 and no more than 50000.");
        }

        if (settings.Limit is < 1 or > 10)
        {
            throw new InvalidOperationException("Mapbox:Limit must be between 1 and 10.");
        }

        var proximity = string.Create(
            CultureInfo.InvariantCulture,
            $"{location.Longitude},{location.Latitude}");
        var query = string.Join("&",
            $"q={Uri.EscapeDataString(storeType)}",
            "types=poi",
            $"proximity={Uri.EscapeDataString(proximity)}",
            $"limit={settings.Limit}",
            $"country={Uri.EscapeDataString(settings.Country)}",
            $"language={Uri.EscapeDataString(settings.Language)}",
            $"access_token={Uri.EscapeDataString(settings.AccessToken)}");

        using var response = await httpClient.GetAsync(
            $"search/searchbox/v1/forward?{query}", cancellationToken);
        response.EnsureSuccessStatusCode();

        var results = await response.Content.ReadFromJsonAsync<MapboxSearchResponse>(
            cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException("Mapbox returned an empty response.");

        return results.Features
            .Select(feature => CreateNearbyMarket(feature, settings.WebsiteOverrides))
            .Where(market => market is not null
                && DistanceInMeters(location, market.Location) <= settings.RadiusMeters)
            .Select(market => market!)
            .OrderBy(market => DistanceInMeters(location, market.Location))
            .DistinctBy(market => (market.Name, market.Link), MarketIdentityComparer.Instance)
            .ToArray();
    }

    private static NearbyMarket? CreateNearbyMarket(
        MapboxFeature feature,
        IDictionary<string, string> websiteOverrides)
    {
        var name = feature.Properties.Name ?? feature.Properties.NamePreferred;
        var coordinates = feature.Geometry?.Coordinates;
        if (string.IsNullOrWhiteSpace(name)
            || coordinates is not { Length: >= 2 }
            || !double.IsFinite(coordinates[0])
            || !double.IsFinite(coordinates[1])
            || coordinates[0] is < -180 or > 180
            || coordinates[1] is < -90 or > 90)
        {
            return null;
        }

        var website = FindWebsite(feature.Properties)
            ?? FindWebsiteOverride(websiteOverrides, name)
            ?? FindWebsiteOverride(websiteOverrides, feature.Properties.NamePreferred);
        if (!Uri.TryCreate(website, UriKind.Absolute, out var websiteUri)
            || websiteUri.Scheme is not ("http" or "https"))
        {
            return null;
        }

        return new NearbyMarket(
            name.Trim(),
            websiteUri.ToString(),
            new GeographicLocation(coordinates[1], coordinates[0]));
    }

    private static string? FindWebsite(MapboxProperties properties)
    {
        if (IsWebsite(properties.Website))
        {
            return properties.Website;
        }

        if (properties.Metadata.ValueKind == JsonValueKind.Object
            && properties.Metadata.TryGetProperty("website", out var website)
            && website.ValueKind == JsonValueKind.String
            && IsWebsite(website.GetString()))
        {
            return website.GetString();
        }

        return null;
    }

    private static string? FindWebsiteOverride(
        IDictionary<string, string> overrides,
        string? marketName)
    {
        if (string.IsNullOrWhiteSpace(marketName))
        {
            return null;
        }

        foreach (var (name, website) in overrides)
        {
            if (string.Equals(name, marketName, StringComparison.OrdinalIgnoreCase)
                && IsWebsite(website))
            {
                return website;
            }
        }

        return null;
    }

    private static bool IsWebsite(string? value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && uri.Scheme is "http" or "https";

    private static double DistanceInMeters(UserLocation from, GeographicLocation to)
    {
        const double earthRadiusMeters = 6_371_000;
        var latitudeDifference = DegreesToRadians(to.Latitude - from.Latitude);
        var longitudeDifference = DegreesToRadians(to.Longitude - from.Longitude);
        var haversine = Math.Pow(Math.Sin(latitudeDifference / 2), 2)
            + Math.Cos(DegreesToRadians(from.Latitude))
            * Math.Cos(DegreesToRadians(to.Latitude))
            * Math.Pow(Math.Sin(longitudeDifference / 2), 2);
        return earthRadiusMeters * 2 * Math.Atan2(Math.Sqrt(haversine), Math.Sqrt(1 - haversine));
    }

    private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180;

    private sealed class MarketIdentityComparer : IEqualityComparer<(string Name, string Link)>
    {
        public static MarketIdentityComparer Instance { get; } = new();

        public bool Equals((string Name, string Link) left, (string Name, string Link) right) =>
            string.Equals(left.Name, right.Name, StringComparison.OrdinalIgnoreCase)
            && string.Equals(left.Link, right.Link, StringComparison.OrdinalIgnoreCase);

        public int GetHashCode((string Name, string Link) market) =>
            HashCode.Combine(
                StringComparer.OrdinalIgnoreCase.GetHashCode(market.Name),
                StringComparer.OrdinalIgnoreCase.GetHashCode(market.Link));
    }

    private sealed record MapboxSearchResponse
    {
        [JsonPropertyName("features")]
        public List<MapboxFeature> Features { get; init; } = [];
    }

    private sealed record MapboxFeature(
        [property: JsonPropertyName("geometry")] MapboxGeometry? Geometry,
        [property: JsonPropertyName("properties")] MapboxProperties Properties);

    private sealed record MapboxGeometry(
        [property: JsonPropertyName("coordinates")] double[]? Coordinates);

    private sealed record MapboxProperties(
        [property: JsonPropertyName("name")] string? Name,
        [property: JsonPropertyName("name_preferred")] string? NamePreferred,
        [property: JsonPropertyName("website")] string? Website,
        [property: JsonPropertyName("metadata")] JsonElement Metadata);
}

public sealed class MapboxOptions
{
    public const string SectionName = "Mapbox";

    public string? AccessToken { get; set; }

    public string Country { get; set; } = "UA";

    public string Language { get; set; } = "uk";

    public int Limit { get; set; } = 10;

    public double RadiusMeters { get; set; } = 5_000;

    public Dictionary<string, string> WebsiteOverrides { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
