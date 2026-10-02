using System.Net.Http.Json;
using System.Text.Json.Serialization;
using BuyClose.Api.Application;
using Microsoft.Extensions.Options;

namespace BuyClose.Api.Infrastructure;

/// <summary>Uses Google Places Text Search to find nearby stores and their websites.</summary>
public sealed class GooglePlacesClient(
    HttpClient httpClient,
    IOptions<GooglePlacesOptions> options) : IGooglePlacesClient
{
    /// <summary>Searches within the configured radius, ranked by distance from the user.</summary>
    public async Task<IReadOnlyList<NearbyMarket>> FindNearbyMarketsAsync(
        string storeType,
        UserLocation location,
        CancellationToken cancellationToken)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.ApiKey))
        {
            throw new InvalidOperationException(
                "Google Places API key is missing. Configure GooglePlaces:ApiKey.");
        }

        if (settings.RadiusMeters is <= 0 or > 50_000)
        {
            throw new InvalidOperationException(
                "GooglePlaces:RadiusMeters must be greater than 0 and no more than 50000.");
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/places:searchText")
        {
            Content = JsonContent.Create(new PlacesSearchRequest(
                storeType,
                20,
                "DISTANCE",
                new LocationBias(new SearchCircle(
                    new SearchCoordinates(location.Latitude, location.Longitude),
                    settings.RadiusMeters))))
        };
        request.Headers.Add("X-Goog-Api-Key", settings.ApiKey);
        request.Headers.Add(
            "X-Goog-FieldMask",
            "places.displayName,places.location,places.websiteUri");

        using var response = await httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var results = await response.Content.ReadFromJsonAsync<PlacesSearchResponse>(
            cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException("Google Places returned an empty response.");

        return results.Places
            .Where(place => !string.IsNullOrWhiteSpace(place.DisplayName?.Text)
                && Uri.TryCreate(place.WebsiteUri, UriKind.Absolute, out _)
                && place.Location is not null)
            .Select(place => new NearbyMarket(
                place.DisplayName!.Text!,
                place.WebsiteUri!,
                new GeographicLocation(place.Location!.Latitude, place.Location.Longitude)))
            .ToArray();
    }

    private sealed record PlacesSearchRequest(
        [property: JsonPropertyName("textQuery")] string TextQuery,
        [property: JsonPropertyName("pageSize")] int PageSize,
        [property: JsonPropertyName("rankPreference")] string RankPreference,
        [property: JsonPropertyName("locationBias")] LocationBias LocationBias);

    private sealed record LocationBias([property: JsonPropertyName("circle")] SearchCircle Circle);

    private sealed record SearchCircle(
        [property: JsonPropertyName("center")] SearchCoordinates Center,
        [property: JsonPropertyName("radius")] double Radius);

    private sealed record SearchCoordinates(
        [property: JsonPropertyName("latitude")] double Latitude,
        [property: JsonPropertyName("longitude")] double Longitude);

    private sealed record PlacesSearchResponse
    {
        [JsonPropertyName("places")]
        public List<PlaceResult> Places { get; init; } = [];
    }

    private sealed record PlaceResult(
        [property: JsonPropertyName("displayName")] PlaceDisplayName? DisplayName,
        [property: JsonPropertyName("location")] PlaceCoordinates? Location,
        [property: JsonPropertyName("websiteUri")] string? WebsiteUri);

    private sealed record PlaceDisplayName([property: JsonPropertyName("text")] string? Text);

    private sealed record PlaceCoordinates(
        [property: JsonPropertyName("latitude")] double Latitude,
        [property: JsonPropertyName("longitude")] double Longitude);
}

public sealed class GooglePlacesOptions
{
    public const string SectionName = "GooglePlaces";

    public string? ApiKey { get; set; }

    public double RadiusMeters { get; set; } = 5_000;
}
