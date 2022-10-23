const AWS = require("aws-sdk");

AWS.config.region = "us-east-1";
const dynamodb = new AWS.DynamoDB.DocumentClient();

const cloudFormation = new AWS.CloudFormation();
const tableExportName = "monthly-reviews-table-dev";

const getTableName = async () => {
  const stackExports = await cloudFormation.listExports().promise();
  const tableExport = stackExports.Exports.find(
    (test) => test.Name === tableExportName
  );
  return tableExport.Value;
};

const monthlyReviews = [
  {
    email: "mauricelecordier@gmail.com",
  },
  {
    email: "mauricelecordier2@gmail.com",
  },
  {
    email: "mauricelecordier3@gmail.com",
  },
];

const seedDatabase = async () => {
  const tableName = await getTableName();
  console.log("monthlyReviews", monthlyReviews);
  console.log("tableName", tableName);
  const putReqs = monthlyReviews.map((x) => ({
    PutRequest: {
      Item: x,
    },
  }));

  const req = {
    RequestItems: {
      [tableName]: putReqs,
    },
  };
  dynamodb
    .batchWrite(req)
    .promise()
    .then(() => console.log("all done"))
    .catch((err) => console.error(err));
};

seedDatabase().then(() => console.log("Seeding complete!"));
