var builder = DistributedApplication.CreateBuilder(args);

var kafka = builder.AddKafka("messaging");

var server = builder.AddProject<Projects.KafkaReact_Server>("server")
	.WithReference(kafka)
	.WithHttpHealthCheck("/health")
	.WithExternalHttpEndpoints();

var webfrontend = builder.AddViteApp("webfrontend", "../frontend")
	.WithReference(server)
	.WaitFor(server);

server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();
