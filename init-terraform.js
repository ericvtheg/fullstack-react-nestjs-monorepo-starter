const yargsInteractive = require("yargs-interactive");
const fs = require("fs").promises;
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const options = {
  interactive: { default: true },
  service: { type: "input", describe: "Enter the name of your service" },
  region: {
    type: "input",
    default: "us-east-2",
    describe: "Enter the name of your preferred region",
    prompt: "always",
  },
  domain_name: {
    type: "input",
    describe: "What is the domain name you own and will use for your web app?",
  },
  deploy: {
    type: "confirm",
    describe:
      "An s3 bucket and DynamoDB table used to save terraform state will be created. Confirm?",
  },
};

const AWS_REGIONS = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "af-south-1",
  "ap-east-1",
  "ap-south-1",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-northeast-3",
  "ap-southeast-1",
  "ap-southeast-2",
  "ca-central-1",
  "cn-north-1",
  "cn-northwest-1",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-south-1",
  "eu-west-3",
  "eu-north-1",
  "me-south-1",
  "sa-east-1",
];

const buildBucketName = (service) => `${service}-client-terraform-state-bucket`;

const buildTableName = (service) =>
  `${service}-client-terraform-state-lock-table`;

const createS3Bucket = async (service, region) => {
  try {
    const { stdout, stderr } = await exec(
      `aws s3api create-bucket --bucket "${buildBucketName(
        service
      )}" --region ${region} \
        --create-bucket-configuration LocationConstraint="${region}"`
    );
    console.log(stdout);
    console.log(stderr);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const createDynamoDbTable = async (service, region) => {
  try {
    const { stdout, stderr } = await exec(`
      aws dynamodb create-table \
        --region ${region} \
        --table-name ${buildTableName(service)} \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1`);
    console.log(stdout);
    console.log(stderr);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const terraformInit = async () => {
  try {
    const { stdout, stderr } = await exec(
      "cd ./client/terraform && terraform init"
    );
    console.log(stdout);
    console.log(stderr);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const updateFileContents = async (path, match, replacement) => {
  const output = await fs.readFile(path, "utf8");
  const result = output.replace(match, replacement);
  await fs.writeFile(path, result, "utf8");
};

yargsInteractive()
  .usage("$0 <command>")
  .interactive(options)
  .then(async (result) => {
    const { service, region, domain_name } = result;

    if (service.includes(" ")) {
      console.error("Error: service name cannot contain spaces");
      return;
    }

    if (!AWS_REGIONS.includes(region)) {
      console.error("Error: invalid region");
      return;
    }

    console.log("Creating S3 client state bucket...");
    await createS3Bucket(service, region);

    console.log(
      "Updating providers.tf with new client state bucket name and DynamoDB table..."
    );
    await updateFileContents(
      "./client/terraform/providers.tf",
      "<TO_BE_REPLACED_STATE_BUCKET_NAME>",
      buildBucketName(service)
    );
    await updateFileContents(
      "./client/terraform/providers.tf",
      "<TO_BE_REPLACED_DDB_TABLE_NAME>",
      buildTableName(service)
    );

    console.log("Updating terraform.tfvars with correct variable values...");
    await updateFileContents(
      "./client/terraform/terraform.tfvars",
      "<TO_BE_REPLACED_SERVICE_VAR>",
      service
    );
    await updateFileContents(
      "./client/terraform/terraform.tfvars",
      "<TO_BE_REPLACED_AWS_REGION_VAR>",
      region
    );
    await updateFileContents(
      "./client/terraform/terraform.tfvars",
      "<TO_BE_REPLACED_DOMAIN_NAME_VAR>",
      domain_name
    );

    console.log("Create DynamoDB table for client...");
    await createDynamoDbTable(service, region);

    console.log("Running terraform init for client...");
    await terraformInit();
  });
// create s3 state bucket
// terraform init
