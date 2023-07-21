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