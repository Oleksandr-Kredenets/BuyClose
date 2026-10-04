using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace BuyClose.Api.Infrastructure;

/// <summary>Calls the local product-category prediction service.</summary>
public sealed class StoreTypeClient(HttpClient httpClient) : IStoreTypeClient
{
    /// <summary>Gets the store category predicted for the requested product title.</summary>
    public async Task<string> PredictStoreTypeAsync(string title, CancellationToken cancellationToken)
    {
        var path = $"/predict?title={Uri.EscapeDataString(title)}";
        var response = await httpClient.GetFromJsonAsync<PredictionResponse>(path, cancellationToken);
        return response?.Prediction
            ?? throw new InvalidOperationException("The store type service response did not contain 'prediction'.");
    }

    private sealed record PredictionResponse(
        [property: JsonPropertyName("prediction")] string? Prediction);
}
