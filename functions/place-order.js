const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ULID = require("ulid");

const { PRODUCTS_TABLE, ORDERS_TABLE } = process.env;

module.exports.handler = async (event) => {
  const { username } = event.identity;
  const { orderItems, shippingId, shippingAddress, total, paymentId } =
    event.arguments.input;
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
    let transactItems = [
      {
        Put: {
          TableName: ORDERS_TABLE,
          Item: payload,
        },
      },
    ];

    if (orderItems.length) {
      for (const x of orderItems) {
        transactItems.push({
          Update: {
            TableName: PRODUCTS_TABLE,
            Key: {
              id: x.productId,
            },
            UpdateExpression: "ADD quantity :minusOne",
            ExpressionAttributeValues: {
              ":minusOne": -x.quantity,
            },
            ConditionExpression: "attribute_exists(id)",
          },
        });
      }
    }

    await dynamodb.transactWrite({ TransactItems: transactItems }).promise();
    return payload;
  } catch (error) {
    throw new Error(error.message);
  }
};
