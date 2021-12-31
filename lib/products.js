const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

const { PRODUCTS_TABLE } = process.env;

const getProductByID = async (productId) => {
  const resp = await dynamodb
    .get({
      TableName: PRODUCTS_TABLE,
      Key: {
        id: productId,
      },
    })
    .promise();
  return resp.Item;
};

module.exports = {
    getProductByID
}