import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { getCount, incrementPersistCount, doSomething } from "./hello-world-common";

// import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// const ddbClient = new DynamoDBClient({});
// const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
// const COUNTER_KEY = 'counter'

// const getCount = async function getCounter(): Promise<number> {
//     const data = await ddbDocClient.send(new GetCommand({
//         TableName: process.env.DDB_TABLE_NAME,
//         Key: {
//             id: COUNTER_KEY
//         }
//     }));
//     const currentCount = data?.Item?.count || 0
//     return currentCount
// }

// const incrementPersistCount = async function saveCount({ currentCount }: { currentCount: number }): Promise<number> {
//     const newCount = currentCount + 1
//     await ddbDocClient.send(new PutCommand({
//         TableName: process.env.DDB_TABLE_NAME,
//         Item: {
//             id: COUNTER_KEY,
//             count: newCount
//         }
//     }));
//     return newCount
// }


const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    const currentCount = await getCount()
    const newCount = await incrementPersistCount({ currentCount: currentCount })
    const response =  {
        statusCode: 200,
        body: JSON.stringify({
            newCount,
        }),
    };
    return response
};

module.exports = { handler }