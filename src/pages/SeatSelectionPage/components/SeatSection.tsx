import { Box, HStack, VStack } from 'styled-system/jsx';
import { CaretUpOutlined } from '@/ui-lib/components/Icon';
import { Typography } from '@/ui-lib/components/Typography';
import { SeatButton } from './SeatButton';

export const SeatSection = () => {
  return (
    <VStack gap="6">
      <SeatLegend />
      <SeatGrid />
    </VStack>
  );
};

const SeatLegend = () => {
  return (
    <HStack gap="5" justifyContent="center">
      <HStack gap="1">
        <SeatButton size="small" status="available" />
        <Typography>선택 가능</Typography>
      </HStack>
      <HStack gap="1">
        <SeatButton size="small" status="disabled" />
        <Typography>선택 불가</Typography>
      </HStack>
    </HStack>
  );
};

const SeatGrid = () => {
  return (
    <VStack gap="2">
      {/* Row 1 */}
      <Box display="grid" gridTemplateColumns="1fr 1fr 0.8fr 1fr 1fr" gap="2" alignItems="center">
        <SeatButton size="large" status="available" seatNumber="1A" />
        <SeatButton size="large" status="available" seatNumber="1B" />
        <Box width="15px" />
        <SeatButton size="large" status="available" seatNumber="1C" />
        <SeatButton size="large" status="available" seatNumber="1D" />
      </Box>

      {/* Row 2 */}
      <Box display="grid" gridTemplateColumns="1fr 1fr 0.8fr 1fr 1fr" gap="2" alignItems="center">
        <SeatButton size="large" status="available" seatNumber="2A" />
        <SeatButton size="large" status="disabled" seatNumber="2B" />
        <Box display="flex" justifyContent="center" alignItems="center">
          <CaretUpOutlined />
        </Box>
        <SeatButton size="large" status="available" seatNumber="2C" />
        <SeatButton size="large" status="available" seatNumber="2D" />
      </Box>

      {/* Row 3 */}
      <Box display="grid" gridTemplateColumns="1fr 1fr 0.8fr 1fr 1fr" gap="2" alignItems="center">
        <SeatButton size="large" status="available" seatNumber="3A" />
        <SeatButton size="large" status="available" seatNumber="3B" />
        <Box display="flex" justifyContent="center" alignItems="center">
          <CaretUpOutlined />
        </Box>
        <SeatButton size="large" status="selected" seatNumber="3C" />
        <SeatButton size="large" status="available" seatNumber="3D" />
      </Box>

      {/* Row 4 */}
      <Box display="grid" gridTemplateColumns="1fr 1fr 0.8fr 1fr 1fr" gap="2" alignItems="center">
        <SeatButton size="large" status="available" seatNumber="4A" />
        <SeatButton size="large" status="available" seatNumber="4B" />
        <Box display="flex" justifyContent="center" alignItems="center">
          <CaretUpOutlined />
        </Box>
        <SeatButton size="large" status="available" seatNumber="4C" />
        <SeatButton size="large" status="available" seatNumber="4D" />
      </Box>

      {/* Row 5 */}
      <Box display="grid" gridTemplateColumns="1fr 1fr 0.8fr 1fr 1fr" gap="2" alignItems="center">
        <SeatButton size="large" status="available" seatNumber="5A" />
        <SeatButton size="large" status="available" seatNumber="5B" />
        <Box display="flex" justifyContent="center" alignItems="center">
          <CaretUpOutlined />
        </Box>
        <SeatButton size="large" status="available" seatNumber="5C" />
        <SeatButton size="large" status="available" seatNumber="5D" />
      </Box>
    </VStack>
  );
};
// const SeatGrid = () => {
//   return (
//     <SeatLayout>
//       <SeatRow>
//         <SeatButton status="available" seatNumber="1A" />
//         <SeatButton status="available" seatNumber="1B" />
//         <Aisle />
//         <SeatButton status="available" seatNumber="1C" />
//         <SeatButton status="available" seatNumber="1D" />
//       </SeatRow>

//       <SeatRow>
//         <SeatButton status="available" seatNumber="2A" />
//         <SeatButton status="disabled" seatNumber="2B" />
//         <Aisle withIcon />
//         <SeatButton status="available" seatNumber="2C" />
//         <SeatButton status="available" seatNumber="2D" />
//       </SeatRow>
//       {/* TODO: 좌석 데이터로 매핑 */}
//     </SeatLayout>
//   );
// };

// const SeatLayout = ({ children }) => (
//   <VStack gap="2">{children}</VStack>
// );

// const SeatRow = ({ children }) => (
//   <Box display="grid" gridTemplateColumns="1fr 1fr 0.8fr 1fr 1fr" gap="2" alignItems="center">
//     {children}
//   </Box>
// );

// const Aisle = ({ withIcon = false }) => (
//   <Box display="flex" justifyContent="center" alignItems="center">
//     {withIcon ? <CaretUpOutlined /> : <Box width="15px" />}
//   </Box>
// );
