import { Box, type BoxProps, Divider, Flex } from 'styled-system/jsx';
import { CircleOutlined } from '@/ui-lib/components/Icon';
import { Tag } from '@/ui-lib/components/Tag';
import { Typography } from '@/ui-lib/components/Typography';

type BusLineType = 'tour' | 'city' | 'suburb';

const RouteRoot = ({ children, ...props }: BoxProps) => {
  return (
    <Box
      p="5"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="line.neutral"
      borderRadius="xl"
      display="grid"
      gridTemplateColumns="auto 1fr"
      columnGap="3"
      {...props}
    >
      {children}
    </Box>
  );
};

interface RouteStationProps {
  line: {
    name: string;
    type: BusLineType;
  };
  stationName: string;
  travelTime: string;
  stopsCount: string;
  waitingTime?: string;
}

const RouteStation = ({ line, stationName, travelTime, stopsCount, waitingTime }: RouteStationProps) => {
  return (
    <>
      <Flex direction="column" alignItems="center">
        <Tag color={line.type}>{line.name}</Tag>
        <Divider orientation="vertical" height="100%" color="line.normal" />
      </Flex>
      <Flex direction="column" gap="1" pb="4">
        <Typography variant="B2_Bold" color="label.normal">
          {stationName}
        </Typography>
        <Flex alignItems="center" gap="1">
          <Typography variant="C2_Regular" color="label.alternative">
            {travelTime}
          </Typography>
          <Divider orientation="vertical" height="2.5" color="line.normal" />
          <Typography variant="C2_Regular" color="label.alternative">
            {stopsCount}
          </Typography>
        </Flex>
        {waitingTime && (
          <Typography variant="C2_Regular" color="status.destructive">
            {waitingTime}
          </Typography>
        )}
      </Flex>
    </>
  );
};

interface RouteArrivalStationProps {
  stationName: string;
  lineType: BusLineType;
}

const RouteArrivalStation = ({ stationName, lineType }: RouteArrivalStationProps) => {
  return (
    <>
      <Flex direction="column" alignItems="center">
        <Divider orientation="vertical" height="1.5" color="line.normal" />
        <CircleOutlined
          color={(() => {
            switch (lineType) {
              case 'tour':
                return 'bus.tour';
              case 'city':
                return 'bus.city';
              case 'suburb':
                return 'bus.suburb';
              default:
                return undefined;
            }
          })()}
        />
      </Flex>
      <Typography variant="B2_Bold" color="label.normal">
        {stationName}
      </Typography>
    </>
  );
};

export const RouteDetail = {
  Root: RouteRoot,
  Station: RouteStation,
  ArrivalStation: RouteArrivalStation,
};
