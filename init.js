const yargsInteractive = require("yargs-interactive");
const { stdout } = require("process");
const fs = require("fs").promises;
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const options = {
  interactive: { default: true },
  service: { type: "input", describe: "Enter the name of your service" },
  env: {
    type: "input",
    default: "prod",
    describe: "Enter the name of your environment",
    prompt: "always",
  },
  region: {
    type: "input",
    default: "us-east-2",
    describe: "Enter the name of your preferred region",
    prompt: "always",
  },
  deploy: {
    type: "confirm",
    describe: "The infrastructure for your client will be deployed. Confirm?",
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

const buildBucketName = (service) => {
  return `${service}-client-terraform-state-bucket`;
};

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

const terraformInit = async () => {
  try {
    const { stdout, stderr } = await exec(
      "cd ./client/deploy && terraform init"
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
    const { service, region } = result;

    if (service.includes(" ")) {
      console.error("Error: service name cannot contain spaces");
      return;
    }

    if (!AWS_REGIONS.includes(region)) {
      console.error("Error: invalid region");
      return;
    }

    console.log("Creating S3 state bucket...");
    await createS3Bucket(service, region);

    console.log("Updating providers.tf with new state bucket name...");
    await updateFileContents(
      "./client/deploy/providers.tf",
      "<TO_BE_REPLACED_STATE_BUCKET_NAME>",
      buildBucketName(service)
    );

    console.log("Running terraform init for client...");
    await terraformInit();
  });
// create s3 state bucket
// terraform init
