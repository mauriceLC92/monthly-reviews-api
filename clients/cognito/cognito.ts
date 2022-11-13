import { CognitoIdentityServiceProvider } from "aws-sdk";
const cognito = new CognitoIdentityServiceProvider();

export class Client implements CognitoClient {
  async adminUpdateUserAttributes(
    userAttribute: AdminUpdateUserAttribute
  ): Promise<void> {
    const { email, userAttributes } = userAttribute;
    await cognito
      .adminUpdateUserAttributes({
        UserAttributes: userAttributes,
        Username: email,
        UserPoolId: process.env.USER_POOL_ID as string,
      })
      .promise();
  }
}

interface AdminUpdateUserAttribute {
  userAttributes: {
    Name: string;
    Value: string;
  }[];
  email: string;
}
export interface CognitoClient {
  adminUpdateUserAttributes(
    userAttribute: AdminUpdateUserAttribute
  ): Promise<void>;
}
