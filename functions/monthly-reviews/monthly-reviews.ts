import { DocumentClient } from "aws-sdk/clients/dynamodb";

const dynamodb = new DocumentClient();
const tableName = process.env.MONTHLY_REVIEWS_TABLE as string;

const getMonthlyReviewById = async () => {
    const req = await dynamodb.get({
        TableName: tableName,
        Key: {
            email: 'mauricelecordier@gmail.com'
        }
    }).promise()

}

export const getReviewById = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "heeey!",
        input: event,
      },
      null,
      2
    ),
  };
};
