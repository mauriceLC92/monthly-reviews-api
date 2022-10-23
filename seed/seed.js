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
    somethingElse: {
      hey: "hi"
    }
  },
  {
    email: "mauricelecordier2@gmail.com",
    somethingElse: {
      hey: "hi"
    }
  },
  {
    email: "mauricelecordier3@gmail.com",
    somethingElse: {
      hey: "hi"
    }
  },
];

const seedDatabase = async () => {
  const tableName = await getTableName();
  console.log("tableName", tableName);
  const putReqs = monthlyReviews.map((x) => ({
    PutRequest: {
      Item: x,
    },
  }));
  console.log("putReqs", putReqs)
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

seedDatabase();
