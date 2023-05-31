import React, { ReactNode } from 'react';
import { ViewToken, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  WithTimingConfig,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export interface TimelineAnimationConfig {
  /**
   * minimum opacity
   * @default 0.2
   */
  minOpacity?: number;

  /**
   * translateY offset
   * @default -20
   */
  translateYFrom?: number;

  /**
   * opacity animation configuration
   */
  opacityWithTimingConfig?: WithTimingConfig;

  /**
   * translateY animation configuration
   */
  translateWithTimingConfig?: WithTimingConfig;
}

interface Props extends TimelineAnimationConfig {
  children?: ReactNode;
  sharedViewableItems: SharedValue<ViewToken[]>;
  index: number;
  height: number | undefined;
}

const AnimateWrapper = ({
  children,
  sharedViewableItems,
  index,
  opacityWithTimingConfig,
  minOpacity = 0.2,
  translateWithTimingConfig,
  translateYFrom = 40,
  height,
}: Props) => {
  const { width } = useWindowDimensions();

  const style = useAnimatedStyle(() => {
    const visible = sharedViewableItems.value.find((v) => {
      if (!v || typeof v.index !== 'number') return false;
      return v.isViewable && v.index >= index;
    });

    return {
      opacity: withTiming(
        visible ? 1 : minOpacity,
        opacityWithTimingConfig ?? {
          duration: 1000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
      ),
      transform: [
        {
          translateY: withTiming(
            visible ? 0 : translateYFrom,
            translateWithTimingConfig ?? {
              duration: 2000,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            },
          ),
        },
      ],
    };
  }, []);

  return (
    <Animated.View
      testID={`item-${index}`}
      style={[
        { width, flex: 1, flexDirection: 'row' },
        style,
        height ? { height } : undefined,
      ]}>
      {children}
    </Animated.View>
  );
};

export default React.memo(AnimateWrapper);
