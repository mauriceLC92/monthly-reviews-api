
export const hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Hello Sir!',
        input: event,
      },
      null,
      2
    ),
  };
}
