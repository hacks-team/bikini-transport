import { ark } from '@ark-ui/react';
import { forwardRef } from 'react';
import { cva, type RecipeVariantProps } from 'styled-system/css';
import { type HTMLStyledProps, styled } from 'styled-system/jsx';

const progressBarRecipe = cva({
  base: {
    position: 'relative',
    w: 'full',
    overflow: 'hidden',
  },

  variants: {
    size: {
      small: {
        h: 1,
      },
      medium: {
        h: 1.5,
      },
      large: {
        h: 2,
      },
    },
  },

  defaultVariants: {
    size: 'medium',
  },
});

type ProgressBarVariantProps = RecipeVariantProps<typeof progressBarRecipe>;

type ProgressBarProps = {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * 진행률 (0 ~ 1 사이의 값)
   */
  value: number;
  /**
   * 배경색
   * @default 'background.alternative'
   */
  backgroundColor?: string;
  /**
   * 진행 바 색상
   * @default 'primary.normal'
   */
  progressColor?: string;
} & ProgressBarVariantProps &
  HTMLStyledProps<'div'>;

const ProgressBarContainer = styled(ark.div, progressBarRecipe);

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>((props, ref) => {
  const {
    value,
    size = 'medium',
    backgroundColor = 'background.alternative',
    progressColor = 'primary.normal',
    ...rest
  } = props;

  const clampedValue = Math.min(Math.max(value, 0), 1);
  const percentage = clampedValue * 100;

  return (
    <ProgressBarContainer ref={ref} size={size} backgroundColor={backgroundColor} {...rest}>
      <styled.div
        position="absolute"
        top={0}
        left={0}
        h="full"
        backgroundColor={progressColor}
        transition="width 0.3s ease-in-out"
        style={{
          width: `${percentage}%`,
        }}
      />
    </ProgressBarContainer>
  );
});

ProgressBar.displayName = 'ProgressBar';