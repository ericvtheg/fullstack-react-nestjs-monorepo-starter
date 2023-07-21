resource "aws_s3_bucket" "beta-test-songs-frontend-bucket" {
  bucket = var.frontend_bucket_name
}