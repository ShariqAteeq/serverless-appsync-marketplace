const AWS = require("aws-sdk");

const { USERS_TABLE } = process.env;

const user_exists_in_UsersTable = async (id) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient();

  const resp = await dynamodb
    .get({
      TableName: USERS_TABLE,
      Key: {
        id,
      },
    })
    .promise();

  expect(resp.Item).toBeTruthy();

  return resp.Item;
};

module.exports = {
    user_exists_in_UsersTable
}