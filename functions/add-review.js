const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ULID = require("ulid");
const { getProductByID } = require("../lib/products");

const { PRODUCTS_TABLE, REVIEWS_TABLE } = process.env;

module.exports.handler = async (event) => {
  const { text, productId, ratings } = event.arguments;
  const { username } = event.identity;
  const reviewId = `${username}_${productId}`;

  const newReview = {
    id: reviewId,
    productId,
    userId: username,
    text,
    ratings,
  };

  try {
    const product = await getProductByID(productId);
    if (!product) {
      throw new Error("Product Not Found");
    }
    let reviews = [...product.reviews];
    reviews.push(reviewId);
    const transactItems = [
      {
        Put: {
          TableName: REVIEWS_TABLE,
          Item: newReview,
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
    return newReview;
  } catch (error) {
    console.log("Error", error);
  }
};
