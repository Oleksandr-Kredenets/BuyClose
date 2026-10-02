using System.Net.Http.Json;
using BuyClose.Api.Application;

namespace BuyClose.Api.Infrastructure;

/// <summary>Posts product searches and nearby store websites to the local scraper.</summary>
public sealed class ProductScraperClient(HttpClient httpClient) : IProductScraperClient
{
    /// <summary>Returns all product results reported by the scraper.</summary>
    public async Task<IReadOnlyList<ScrapedProduct>> SearchAsync(
        string title,
        IReadOnlyList<MarketLink> links,
        CancellationToken cancellationToken)
    {
        using var response = await httpClient.PostAsJsonAsync(
            "/search",
            new ProductSearchPayload(title, links),
            cancellationToken);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<List<ScrapedProduct>>(
            cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException("The product scraper returned an empty response.");
    }

    private sealed record ProductSearchPayload(string Title, IReadOnlyList<MarketLink> Links);
}
