using Confluent.Kafka;
using System.Text.Json;
using static Confluent.Kafka.ConfigPropertyNames;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddProblemDetails();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add Kafka
// K-Producer
builder.AddKafkaProducer<string, string>("messaging");

// K-Consumer
builder.AddKafkaConsumer<string, string>("messaging", settings =>
{
	settings.Config.GroupId = "weather-inspector-group";
	settings.Config.AutoOffsetReset = Confluent.Kafka.AutoOffsetReset.Earliest;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}


string[] summaries = ["Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"];

var api = app.MapGroup("/api");
api.MapGet("weatherforecast", async (IProducer<string, string> producer) =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();

	// - Kafka publish
	// 1. Serialize the forecast array to JSON
	var messageValue = JsonSerializer.Serialize(forecast);

	// 2. Publish to the Kafka topic
	var message = new Message<string, string>
	{
		Key = Guid.NewGuid().ToString(), // Or a fixed key like "weather-update"
		Value = messageValue
	};

	// "weather-topics" is the name of the topic you are publishing to
	await producer.ProduceAsync("weather-topics", message);
	// - end Kafka publish

	return forecast;
})
.WithName("GetWeatherForecast");

api.MapGet("weatherforecast/all", (IConsumer<string, string> consumer) =>
{
	var topic = "weather-topics";
	var allValues = new List<JsonElement>();

	// 1. Subscribe to the topic
	consumer.Subscribe(topic);

	// 2. Poll briefly to trigger partition assignment
	var consumeResult = consumer.Consume(TimeSpan.FromSeconds(1));

	if (consumeResult != null)
	{
		// Parse and add the first message we caught during polling
		allValues.Add(JsonSerializer.Deserialize<JsonElement>(consumeResult.Message.Value));
	}

	// 3. Keep consuming until no new messages arrive within a short timeout window (meaning we reached the end of the log)
	while (true)
	{
		try
		{
			var cr = consumer.Consume(TimeSpan.FromMilliseconds(200));
			if (cr == null) break; // End of log reached

			var data = JsonSerializer.Deserialize<JsonElement>(cr.Message.Value);
			allValues.Add(data);
		}
		catch (ConsumeException)
		{
			break;
		}
	}

	// 4. Return the result explicitly as indented JSON
	return Results.Json(allValues, new JsonSerializerOptions { WriteIndented = true });
})
.WithName("GetAllWeatherForecastsFromKafka");

app.MapDefaultEndpoints();

app.UseFileServer();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
