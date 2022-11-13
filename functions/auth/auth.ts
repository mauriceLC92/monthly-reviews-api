import {
  APIGatewayEvent,
  CreateAuthChallengeTriggerEvent,
  DefineAuthChallengeTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from "aws-lambda";
import { v4 as uuid } from "uuid";
import { Client as CognitoClient } from "../../clients/cognito/cognito";

const cognitoClient = new CognitoClient();
const LINK_TIMEOUT = 30 * 60; // number of seconds the magic link should be valid

interface Login {
  email: string;
}
export const login = async (event: APIGatewayEvent) => {
  try {
    const { email } = JSON.parse(event.body as string) as Login;

    // Store challenge as a custom attribute in Cognito
    const authChallenge = uuid();
    await cognitoClient.adminUpdateUserAttributes({
      email,
      userAttributes: [
        {
          Name: "custom:authChallenge",
          Value: `${authChallenge},${Math.round(new Date().valueOf() / 1000)}`,
        },
      ],
    });

    const url = `${process.env.URL}/sign-in/${email},${authChallenge}`;
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        demoUrl: url,
      }),
    };
  } catch (e) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Sorry, we could not find your account.",
        errorDetail: e.message,
      }),
    };
  }
};

export const createAuthChallenge = async (
  event: CreateAuthChallengeTriggerEvent
) => {
  // This is sent back to the client app
  event.response.publicChallengeParameters = {
    email: event.request.userAttributes.email,
  };

  // Add the secret login code to the private challenge parameters
  // so it can be verified by the "Verify Auth Challenge Response" trigger
  event.response.privateChallengeParameters = {
    challenge: event.request.userAttributes["custom:authChallenge"],
  };

  return event;
};

export const defineAuthChallenge = async (
  event: DefineAuthChallengeTriggerEvent
) => {
  // Stop if user can't be found
  if (event.request.userNotFound) {
    event.response.failAuthentication = true;
    event.response.issueTokens = false;
    return event;
  }

  // Check result of last challenge
  if (
    event.request.session &&
    event.request.session.length &&
    event.request.session.slice(-1)[0].challengeResult === true
  ) {
    // The user provided the right answer - issue their tokens
    event.response.failAuthentication = false;
    event.response.issueTokens = true;
    return event;
  }

  // Present a new challenge if we haven't received a correct answer yet
  event.response.issueTokens = false;
  event.response.failAuthentication = false;
  event.response.challengeName = "CUSTOM_CHALLENGE";
  return event;
};

export const verifyAuthChallenge = async (
  event: VerifyAuthChallengeResponseTriggerEvent
) => {
  // Get challenge and timestamp from user attributes
  const [authChallenge, timestamp] = (
    event.request.privateChallengeParameters.challenge || ""
  ).split(",");

  // 1. Check if code is equal to what we expect...
  if (event.request.challengeAnswer === authChallenge) {
    // 2. And whether the link hasn't timed out...
    if (Number(timestamp) > new Date().valueOf() / 1000 - LINK_TIMEOUT) {
      event.response.answerCorrect = true;
      return event;
    }
  }

  // Fallback
  event.response.answerCorrect = false;
  return event;
};
