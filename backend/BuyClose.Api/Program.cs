using BuyClose.Api.Application;
using BuyClose.Api.Infrastructure;
using Microsoft.AspNetCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://127.0.0.1:4000", "http://localhost:4000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.Configure<MapboxOptions>(
    builder.Configuration.GetSection(MapboxOptions.SectionName));
builder.Services.AddHttpClient<IStoreTypeClient, StoreTypeClient>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["Services:StoreTypeIdentifierBaseUrl"] ?? "http://127.0.0.1:4567");
    client.Timeout = TimeSpan.FromSeconds(15);
});
builder.Services.AddHttpClient<IMapboxSearchClient, MapboxSearchClient>(client =>
{
    client.BaseAddress = new Uri("https://api.mapbox.com/");
    client.Timeout = TimeSpan.FromSeconds(20);
});
builder.Services.AddHttpClient<IProductScraperClient, ProductScraperClient>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["Services:ProductScraperBaseUrl"] ?? "http://127.0.0.1:4568");
    client.Timeout = TimeSpan.FromSeconds(60);
});
builder.Services.AddScoped<ProductSearchService>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors("Frontend");

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Coordinates the search and returns the product list directly to the frontend caller.
app.MapPost("/api/products/search", async (
    ProductSearchRequest request,
    ProductSearchService searchService,
    CancellationToken cancellationToken) =>
{
    var validationError = request.Validate();
    if (validationError is not null)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [validationError.Value.Key] = [validationError.Value.Error]
        });
    }

    var products = await searchService.SearchAsync(request, cancellationToken);
    return Results.Ok(products);
});

app.Run();
