import { Divider, HStack, VStack } from 'styled-system/jsx';
import { SwapRightOutlined } from '@/ui-lib/components/Icon';
import { Typography } from '@/ui-lib/components/Typography';

interface DepartureArrivalCardProps {
  date: string;
  departure: string;
  arrival: string;
  totalTime: string;
  transferCount: string;
}

export function DepartureArrivalCard({
  date,
  departure,
  arrival,
  totalTime,
  transferCount,
}: DepartureArrivalCardProps) {
  return (
    <VStack gap="3" p="5" backgroundColor="background.neutral" borderRadius="xl">
      <Typography variant="C2_Regular" color="label.normal">
        {date}
      </Typography>
      <HStack gap="6">
        <Typography variant="H1_Bold" color="label.normal">
          {departure}
        </Typography>
        <SwapRightOutlined />
        <Typography variant="H1_Bold" color="label.normal">
          {arrival}
        </Typography>
      </HStack>
      <HStack gap="1">
        <Typography variant="C2_Regular" color="label.normal">
          {totalTime}
        </Typography>
        <Divider orientation="vertical" height="2.5" color="line.normal" />

        <Typography variant="C2_Regular" color="label.normal">
          {transferCount}
        </Typography>
      </HStack>
    </VStack>
  );
}
