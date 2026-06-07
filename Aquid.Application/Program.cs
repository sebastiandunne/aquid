using Autofac;
using Autofac.Extensions.DependencyInjection;
using Aquid.Application.AirQuality;
using Aquid.Application.Ultraviolet;
using Aquid.Application.Weather;
using Microsoft.OpenApi;
using System.Net.Http.Headers;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

LoadDotEnv(Path.Combine(builder.Environment.ContentRootPath, ".env"));

var portValue = Environment.GetEnvironmentVariable("PORT")
                ?? throw new InvalidOperationException("PORT is not configured.");
if (!int.TryParse(portValue, out var port) || port is <= 0 or > 65535)
{
    throw new InvalidOperationException("PORT must be a valid integer between 1 and 65535.");
}

builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

builder.WebHost.UseSentry(options =>
{

    var sentryDsn = Environment.GetEnvironmentVariable("SENTRY_DSN");
    if (string.IsNullOrWhiteSpace(sentryDsn))
    {
        throw new InvalidOperationException("SENTRY_DSN is not configured.");
    }
    options.Dsn = sentryDsn;
    if (builder.Environment.IsDevelopment())
    {
        options.Debug = true;
    }
    options.TracesSampleRate = 1.0;
    options.AttachStacktrace = true;
});

builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());
builder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
{
    containerBuilder.RegisterType<WeatherService>().AsSelf().InstancePerLifetimeScope();
    containerBuilder.RegisterType<AirQualityService>().AsSelf().InstancePerLifetimeScope();
    containerBuilder.RegisterType<UltravioletService>().AsSelf().InstancePerLifetimeScope();
});

var openAqApiUrl = Environment.GetEnvironmentVariable("OPEN_AQ_API_URL")
                   ?? throw new InvalidOperationException("OPEN_AQ_API_URL is not configured.");
var openAqApiKey = Environment.GetEnvironmentVariable("OPEN_AQ_API_KEY")
                   ?? throw new InvalidOperationException("OPEN_AQ_API_KEY is not configured.");
var openUvApiUrl = Environment.GetEnvironmentVariable("OPEN_UV_API_URL")
                   ?? throw new InvalidOperationException("OPEN_UV_API_URL is not configured.");
var openUvApiKey = Environment.GetEnvironmentVariable("OPEN_UV_API_KEY")
                   ?? throw new InvalidOperationException("OPEN_UV_API_KEY is not configured.");

builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<OpenAqApiClient>(client =>
{
    client.BaseAddress = new Uri(openAqApiUrl.TrimEnd('/') + "/");
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    client.DefaultRequestHeaders.Add("X-API-Key", openAqApiKey);
});
builder.Services.AddHttpClient<OpenUvApiClient>(client =>
{
    client.BaseAddress = new Uri(openUvApiUrl.TrimEnd('/') + "/");
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    client.DefaultRequestHeaders.Add("x-access-token", openUvApiKey);
});
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.Strict;
    });
builder.Services.AddOpenApi(options =>
{
    options.AddSchemaTransformer((schema, _, _) =>
    {
        // Keep numeric schemas numeric-only in OpenAPI so generated TS types do not widen to number|string.
        if (schema.Type.HasValue)
        {
            if (schema.Type.Value.HasFlag(JsonSchemaType.Number) || schema.Type.Value.HasFlag(JsonSchemaType.Integer))
            {
                schema.Type = schema.Type.Value & ~JsonSchemaType.String;
            }
        }

        return Task.CompletedTask;
    });
});
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSentryTracing();

app.UseHttpsRedirection();
app.MapControllers();

app.Run();

return;

static void LoadDotEnv(string envFilePath)
{
    if (!File.Exists(envFilePath))
    {
        return;
    }

    foreach (var rawLine in File.ReadAllLines(envFilePath))
    {
        var line = rawLine.Trim();
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith('#'))
        {
            continue;
        }

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0)
        {
            continue;
        }

        var key = line[..separatorIndex].Trim();
        var value = line[(separatorIndex + 1)..].Trim();

        if (value.Length >= 2 &&
            ((value.StartsWith('"') && value.EndsWith('"')) ||
             (value.StartsWith('\'') && value.EndsWith('\''))))
        {
            value = value[1..^1];
        }

        if (string.IsNullOrWhiteSpace(key) || !string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
        {
            continue;
        }

        Environment.SetEnvironmentVariable(key, value);
    }
}