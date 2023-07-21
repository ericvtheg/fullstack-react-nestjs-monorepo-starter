variable "stage" {
  type    = string
  description = "The stage of the service (e.g. prod, test, dev)."
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

variable "web_host_bucket_name" {
  type        = string
  description = "The name of the bucket without the www. prefix. Normally domain_name."
}