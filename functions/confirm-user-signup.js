const dynamodb = require("aws-sdk/clients/dynamodb");
const DocumentClient = new dynamodb.DocumentClient();

const { USERS_TABLE } = process.env;

module.exports.handler = async (event) => {
  if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
    const name = event.request.userAttributes["name"]; // it is defined in cognito schema in serverless.yml
    const user = {
      id: event.userName,
      name,
      createdAt: new Date().toJSON(),
    };

    await DocumentClient.put({
      TableName: USERS_TABLE,
      Item: user,
      ConditionExpression: "attribute_not_exists(id)",
    }).promise();

    return event;
  } else {
    return event;
  }
};
