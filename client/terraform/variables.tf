locals {
  content_types = {
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "text/javascript",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".webmanifest": "application/manifest+json"
  }
}

variable "service" {
  type        = string
  description = "The service name."
}

variable "aws_region" {
  type        = string
  description = "The region in which to create and manage resources."
  default     = "us-east-2"
}

variable "domain_name" {
  type        = string
  description = "The domain name that will be used for the web app."
}