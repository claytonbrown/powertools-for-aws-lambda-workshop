import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { getCount, incrementPersistCount, doSomething } from "./hello-world-common";

import { Tracer } from '@aws-lambda-powertools/tracer';
import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
// import { search } from '@aws-lambda-powertools/jmespath';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import middy from '@middy/core';
import AWS from 'aws-sdk';

const logger = new Logger();

type MyEvent = {
  foo: {
    bar: string;
  };
}

const tracer = new Tracer({ serviceName: process.env.FUNCTION_NAME });

// Instrument all AWS SDK clients created from this point onwards
tracer.captureAWS(AWS);

export const handler = middy( async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>  {
  await fetch("http://httpbin.org/status/500");
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    const result = await doSomething()
    // const result = search(event, 'foo.bar');
    // logger.info(result); // "baz"
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
}).use(captureLambdaHandler(tracer));

module.exports = { handler }