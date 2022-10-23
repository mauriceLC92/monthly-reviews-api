
export const userHello = async (event) => {
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
  