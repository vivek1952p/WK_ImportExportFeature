using System.Data;
using Microsoft.Data.SqlClient;
using ImportExportApi.Repositories;
using ImportExportApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register IDbConnection as transient (new SqlConnection per request)
builder.Services.AddTransient<IDbConnection>(sp =>
    new SqlConnection(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register repository & service
builder.Services.AddScoped<ILoanRepository, LoanRepository>();
builder.Services.AddScoped<IImportService, ImportService>();

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

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

// Use the CORS policy BEFORE any other middleware
app.UseCors("AllowAngularApp");

// Map controllers
app.MapControllers();

app.Run();
