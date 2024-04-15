
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const COUNTER_KEY = 'counter'

export async function doSomething() {
  console.log('Doing Something');
  return { 'did': 'something' };
}

export async function getCount(): Promise<number> {
  const data = await ddbDocClient.send(new GetCommand({
    TableName: process.env.DDB_TABLE_NAME,
    Key: {
      id: COUNTER_KEY
    }
  }));
  const currentCount = data?.Item?.count || 0
  return currentCount
}

export async function incrementPersistCount({ currentCount }: { currentCount: number }): Promise<number> {
  const newCount = currentCount + 1
  await ddbDocClient.send(new PutCommand({
    TableName: process.env.DDB_TABLE_NAME,
    Item: {
      id: COUNTER_KEY,
      count: newCount
    }
  }));
  return newCount
}
