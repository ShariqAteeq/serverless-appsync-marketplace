const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ULID = require("ulid");
const { getProductByID } = require("../lib/products");

const { PRODUCTS_TABLE, ORDERS_TABLE } = process.env;

module.exports.handler = async (event) => {
  const { username } = event.identity;
  const { orderItems, shippingId, shippingAddress, total, paymentId } =
    event.arguments;
  const orderId = ULID.ulid();

  let payload = {
    id: orderId,
    total,
    paymentId,
    shippingAddress,
    creator: username,
    shippingId,
    status: "PENDING",
    created: new Date().toJSON(),
  };

  if (orderItems.length) {
    const items = orderItems.map((x) => ({ ...x, orderId }));
    payload["orderItems"] = items;
  }

  try {

    const product = await getProductByID(productId);
    if (!product) {
      throw new Error("Product Not Found");
    }

    const transactItems = [
      {
        Put: {
          TableName: ORDERS_TABLE,
          Item: payload,
        },
      },
      {
        Update: {
          TableName: PRODUCTS_TABLE,
          Key: {
            id: productId,
          },
          UpdateExpression: "SET reviews = :reviews",
          ExpressionAttributeValues: {
            ":reviews": reviews,
          },
          ConditionExpression: "attribute_exists(id)",
        },
      },
    ];

    await dynamodb.transactWrite({ TransactItems: transactItems }).promise();
    return payload;
  } catch (error) {
    throw new Error(error.message);
  }
};
