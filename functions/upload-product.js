const AWS = require("aws-sdk");
const ULID = require("ulid");

const { PRODUCTS_TABLE } = process.env;
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const { name, images, category, quantity } = event.arguments.input;
  const { username } = event.identity;

  const payload = {
    id: ULID.ulid(),
    name,
    images,
    reviews: [],
    category,
    quantity,
    available: true,
    uploader: username,
    created: new Date().toJSON(),
  };

  try {
    await dynamodb
      .put({
        TableName: PRODUCTS_TABLE,
        Item: payload,
        ConditionExpression: "attribute_not_exists(id)",
      })
      .promise();
    return payload;
  } catch (error) {
    console.log("error", error);
  }
};
