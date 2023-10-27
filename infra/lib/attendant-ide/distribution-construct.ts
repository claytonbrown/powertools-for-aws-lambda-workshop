import { CfnOutput, type StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  AllowedMethods,
  CacheCookieBehavior,
  CacheHeaderBehavior,
  CachePolicy,
  CacheQueryStringBehavior,
  CachedMethods,
  Distribution,
  OriginProtocolPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { environment } from '../constants';
import { customSecurityHeader, customSecurityHeaderValue } from './constants';

interface DistributionConstructProps extends StackProps {
  /**
   * The origin to use for the distribution.
   */
  origin: string;
}

export class DistributionConstruct extends Construct {
  public readonly ideUrl: string;
  public readonly healthCheckEndpoint: string;

  public constructor(
    scope: Construct,
    id: string,
    props: DistributionConstructProps
  ) {
    super(scope, id);

    const { origin } = props;

    const distribution = new Distribution(this, 'distribution', {
      defaultBehavior: {
        origin: new HttpOrigin(origin, {
          protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
          customHeaders: {
            [customSecurityHeader]: customSecurityHeaderValue,
          },
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        cachePolicy: new CachePolicy(this, 'ide-cache', {
          cachePolicyName: `ide-cache-${environment}`,
          minTtl: Duration.seconds(0),
          maxTtl: Duration.seconds(86400),
          defaultTtl: Duration.seconds(86400),
          cookieBehavior: CacheCookieBehavior.all(),
          headerBehavior: CacheHeaderBehavior.allowList(
            'Sec-Websocket-Extensions',
            'Accept',
            'Access-Control-Request-Method',
            'Access-Control-Request-Headers',
            'Sec-Websocket-Key',
            'Host',
            'Accept-Encoding',
            'Sec-WebSocket-Protocol',
            'Sec-Websocket-Version'
          ),
          queryStringBehavior: CacheQueryStringBehavior.all(),
        }),
      },
      enableIpv6: true,
      enabled: true,
    });

    this.ideUrl = `https://${distribution.distributionDomainName}/?folder=%2Fhome%2Fec2-user%2Fworkshop`;
    this.healthCheckEndpoint = `https://${distribution.distributionDomainName}/healthz`;

    new CfnOutput(this, 'IDEWorkspace', {
      value: this.ideUrl,
      description: 'The domain name where the web IDE is hosted',
    });
  }
}
