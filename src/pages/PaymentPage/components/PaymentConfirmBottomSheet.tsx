import { overlay } from 'overlay-kit';
import { Box, Divider, Grid, HStack } from 'styled-system/jsx';
import { BottomSheet } from '@/ui-lib/components/BottomSheet';
import { Button } from '@/ui-lib/components/Button';
import { Typography } from '@/ui-lib/components/Typography';

interface PaymentConfirmBottomSheetProps {
  isOpen: boolean;
  close: () => void;
}

export const openPaymentConfirmBottomSheet = () => {
  return overlay.open(({ isOpen, close }) => <PaymentConfirmBottomSheet isOpen={isOpen} close={close} />);
};

export const PaymentConfirmBottomSheet = ({ isOpen, close }: PaymentConfirmBottomSheetProps) => {
  return (
    <BottomSheet
      open={isOpen}
      onDimmerClick={close}
      header={<BottomSheet.Header>버스표 결제를 진행하시겠어요?</BottomSheet.Header>}
      cta={
        <HStack>
          <Button key="취소" color="secondary" fullWidth>
            취소
          </Button>
          <Button key="결제하기" fullWidth>
            결제하기
          </Button>
        </HStack>
      }
    >
      <Box p={5}>
        <PaymentSummary />
      </Box>
    </BottomSheet>
  );
};

const PaymentSummary = () => {
  return (
    <Grid
      borderRadius="xl"
      backgroundColor="background.neutral"
      p={5}
      gridTemplateColumns="auto auto 1fr"
      alignItems="center"
      gap={4}
      columnGap={2}
    >
      <SummaryRow label="노선" value="비키니항구 → 구-라군" />
      <SummaryRow label="출발 일시" value="2025년 00월 00일 (수) 00:00" />
      <SummaryRow label="소요 시간" value="총 00시간 00분" />
      <SummaryRow label="환승 횟수" value="3회" />
      <SummaryRow label="결제 금액" value="0,000원" />
    </Grid>
  );
};

interface SummaryRowProps {
  label: string;
  value: string;
}

const SummaryRow = ({ label, value }: SummaryRowProps) => {
  return (
    <>
      <Typography variant="B1_Bold" color="static.black">
        {label}
      </Typography>
      <Divider orientation="vertical" height="2.5" color="label.disable" />
      <Typography variant="B1_Regular" color="static.black">
        {value}
      </Typography>
    </>
  );
};
