import { ark } from '@ark-ui/react';
import { cva, type RecipeVariantProps } from 'styled-system/css';
import { Box, type HTMLStyledProps, styled } from 'styled-system/jsx';

const seatButtonRecipe = cva({
  base: {
    position: 'relative',
    display: 'inline-block',
    border: 'none',
    background: 'transparent',
    padding: 0,
    textStyle: 'B2_Regular',
  },
  variants: {
    size: {
      small: {
        width: '21px',
        height: '21px',
      },
      large: {
        width: '62px',
        height: '62px',
      },
    },
    status: {
      available: {
        cursor: 'pointer',
        color: 'label.normal',
      },
      disabled: {
        cursor: 'not-allowed',
        color: 'label.disable',
      },
      selected: {
        cursor: 'pointer',
        color: 'label.inverse',
      },
    },
  },

  defaultVariants: {
    size: 'large',
    status: 'available',
  },
});

const SeatButtonComponent = styled(ark.button, seatButtonRecipe);

type SeatButtonVariantProps = RecipeVariantProps<typeof seatButtonRecipe>;
type SeatButtonProps = SeatButtonVariantProps & {
  seatNumber?: string;
  onClick?: () => void;
};

export const SeatButton = ({ seatNumber, onClick, size, status, ...props }: SeatButtonProps) => {
  return (
    <SeatButtonComponent onClick={onClick} disabled={status === 'disabled'} size={size} status={status} {...props}>
      <SeatIcon size={size} status={status} />
      {seatNumber && (
        <Box position="absolute" top="43%" left="48%" transform="translate(-50%, -50%)" pointerEvents="none">
          {seatNumber}
        </Box>
      )}
    </SeatButtonComponent>
  );
};

const seatIconRecipe = cva({
  variants: {
    size: {
      small: {
        width: '21px',
        height: '21px',
      },
      large: {
        width: '62px',
        height: '62px',
      },
    },
    status: {
      available: {
        '& rect, & path': {
          fill: 'static.white',
          stroke: 'label.alternative',
        },
      },
      disabled: {
        '& rect, & path': {
          fill: 'background.alternative',
          stroke: '#CECECF',
        },
      },
      selected: {
        '& rect, & path': {
          fill: 'primary.normal',
          stroke: 'primary.heavy',
        },
      },
    },
  },
  defaultVariants: {
    size: 'large',
    status: 'available',
  },
});

const SeatIconComponent = styled(ark.svg, seatIconRecipe);
type SeatIconVariantProps = RecipeVariantProps<typeof seatIconRecipe>;

type SeatIconProps = SeatIconVariantProps & HTMLStyledProps<'svg'>;

const SeatIcon = (props: SeatIconProps) => {
  return (
    <SeatIconComponent viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect
        x="0.16129"
        y="-0.16129"
        width="13.6774"
        height="14.2608"
        transform="matrix(1 0 0 -1 2.9613 16.5051)"
        strokeWidth="0.322581"
      />
      <path
        d="M3.22743 0.161133H1.45164C0.739013 0.161133 0.161316 0.738831 0.161316 1.45146V15.9676C0.161316 18.2836 2.03883 20.1611 4.35486 20.1611H15.9678C18.2838 20.1611 20.1613 18.2836 20.1613 15.9676V1.45146C20.1613 0.738831 19.5836 0.161133 18.871 0.161133H17.2932C16.5806 0.161133 16.0029 0.738831 16.0029 1.45146V14.1019C16.0029 15.1709 15.1364 16.0374 14.0674 16.0374H6.45324C5.3843 16.0374 4.51775 15.1709 4.51775 14.1019V1.45146C4.51775 0.738831 3.94005 0.161133 3.22743 0.161133Z"
        strokeWidth="0.322581"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SeatIconComponent>
  );
};
