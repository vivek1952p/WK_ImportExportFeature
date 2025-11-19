var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS to allow requests from Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:4200",
            "https://localhost:4200",
            "http://localhost:5173",
            "https://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Don't redirect to HTTPS in development
}
else
{
    app.UseHttpsRedirection();
}

// Use the CORS policy BEFORE any other middleware
app.UseCors("AllowAngularApp");

// Map controllers (required for attribute-routed controllers)
app.MapControllers();

// Home page route
app.MapGet("/", () => new { message = "Import Export API", status = "Running" })
    .WithName("Home");

app.Run();
