using System.Text.Json.Serialization;
using BuyClose.Api.Application;

namespace BuyClose.Api.Infrastructure;

public interface IStoreTypeClient
{
    Task<string> PredictStoreTypeAsync(string title, CancellationToken cancellationToken);
}

public interface IGooglePlacesClient
{
    Task<IReadOnlyList<NearbyMarket>> FindNearbyMarketsAsync(
        string storeType,
        UserLocation location,
        CancellationToken cancellationToken);
}

public interface IProductScraperClient
{
    Task<IReadOnlyList<ScrapedProduct>> SearchAsync(
        string title,
        IReadOnlyList<MarketLink> links,
        CancellationToken cancellationToken);
}

public sealed record NearbyMarket(string Name, string Link, GeographicLocation Location);

public sealed record GeographicLocation(double Latitude, double Longitude);

public sealed record MarketLink(
    [property: JsonPropertyName("market")] string Market,
    [property: JsonPropertyName("link")] string Link);

public sealed record ScrapedProduct(
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("price")] decimal Price,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("imgUrl")] string ImgUrl,
    [property: JsonPropertyName("market")] string Market);
