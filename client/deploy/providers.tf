terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 4.0"
      configuration_aliases = [aws.us-east-1]
    }
  }

  backend "s3" {
    bucket                  = "asdfz-client-terraform-state-bucket"
    key                     = "tfstate"
    region                  = "us-east-2"
    profile                 = "default"
    encrypt                 = "true"
    dynamodb_table          = "template-frontend-terraform-lock"
    shared_credentials_file = "$HOME/.aws/credentials"
  }
}