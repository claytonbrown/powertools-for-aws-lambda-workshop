import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { getCount, incrementPersistCount, doSomething } from "./hello-world-common";

const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    const result = await doSomething()
    const currentCount = await getCount()
    const newCount = await incrementPersistCount({ currentCount: currentCount })
    const response =  {
        statusCode: 200,
        body: JSON.stringify({
            'count': newCount,
            'result': result
        }),
    };
    return response
};

module.exports = { handler }