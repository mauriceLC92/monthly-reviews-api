import { APIGatewayEvent } from "aws-lambda";

export const userHello = async (event: APIGatewayEvent) => {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Hello from user "Service"!',
          input: event,
        },
        null,
        2
      ),
    };
  }
  