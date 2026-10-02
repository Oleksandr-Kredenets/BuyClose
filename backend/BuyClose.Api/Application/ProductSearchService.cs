using BuyClose.Api.Infrastructure;

namespace BuyClose.Api.Application;

/// <summary>Runs the full product discovery workflow across the configured services.</summary>
public sealed class ProductSearchService(
    IStoreTypeClient storeTypeClient,
    IGooglePlacesClient googlePlacesClient,
    IProductScraperClient productScraperClient)
{
    /// <summary>Finds nearby shops for a product and returns scraped results with shop locations.</summary>
    public async Task<IReadOnlyList<ProductResponse>> SearchAsync(
        ProductSearchRequest request,
        CancellationToken cancellationToken)
    {
        var storeType = await storeTypeClient.PredictStoreTypeAsync(
            request.Title.Trim(), cancellationToken);
        if (string.IsNullOrWhiteSpace(storeType))
        {
            throw new InvalidOperationException("The store type service returned an empty prediction.");
        }

        var nearbyMarkets = await googlePlacesClient.FindNearbyMarketsAsync(
            storeType, request.Location, cancellationToken);
        if (nearbyMarkets.Count == 0)
        {
            return [];
        }

        var scrapedProducts = await productScraperClient.SearchAsync(
            request.Title.Trim(),
            nearbyMarkets.Select(market => new MarketLink(market.Name, market.Link))
                .Distinct(MarketLinkComparer.Instance)
                .ToArray(),
            cancellationToken);

        return scrapedProducts.Select(product =>
        {
            var matchingMarkets = nearbyMarkets
                .Where(market => string.Equals(market.Name, product.Market, StringComparison.OrdinalIgnoreCase))
                .ToArray();
            if (matchingMarkets.Length == 0)
            {
                throw new InvalidOperationException(
                    $"The scraper returned market '{product.Market}', which was not included in the search.");
            }

            var nearestMarket = matchingMarkets
                .MinBy(market => DistanceInMeters(request.Location, market.Location))!;

            return new ProductResponse(
                Guid.NewGuid(),
                product.Title,
                product.Price,
                product.Description,
                product.ImgUrl,
                product.Market,
                new ProductLocation(nearestMarket.Location.Latitude, nearestMarket.Location.Longitude));
        }).ToArray();
    }

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

    private sealed class MarketLinkComparer : IEqualityComparer<MarketLink>
    {
        public static MarketLinkComparer Instance { get; } = new();

        public bool Equals(MarketLink? left, MarketLink? right) =>
            left is not null
            && right is not null
            && string.Equals(left.Market, right.Market, StringComparison.OrdinalIgnoreCase)
            && string.Equals(left.Link, right.Link, StringComparison.OrdinalIgnoreCase);

        public int GetHashCode(MarketLink link) =>
            HashCode.Combine(
                StringComparer.OrdinalIgnoreCase.GetHashCode(link.Market),
                StringComparer.OrdinalIgnoreCase.GetHashCode(link.Link));
    }
}

/// <summary>Product response contract consumed by the frontend.</summary>
public sealed record ProductResponse(
    Guid Id,
    string Title,
    decimal Price,
    string Description,
    string ImgUrl,
    string Market,
    ProductLocation Location);

/// <summary>Product coordinates; the JSON field "lag" preserves the requested API contract.</summary>
public sealed record ProductLocation(
    [property: System.Text.Json.Serialization.JsonPropertyName("lag")] double Latitude,
    [property: System.Text.Json.Serialization.JsonPropertyName("lng")] double Longitude);
