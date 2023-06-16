# react-native-awesome-timeline

> This project is for my side projects and very experimental
>
> Please use for production at least after v1.0.0 released

## Overview 👀

![gif](https://github.com/app-emotion/react-native-timeline-ui/assets/64301935/f4ccdfe6-303e-4bce-967a-57b6774ceb84)

Timeline UI with FlatList and animation

## Peer Deps ☝🏻

- react
- react-native
- react-native-reanimated (>=2.14.0)

## Next 🚀

- [ ] add inverted (horizontally inverted)
- [ ] documentation

![layout](https://github.com/jeongshin/react-native-awesome-timeline/assets/64301935/91b27cc4-03b4-444b-b225-e90a0c870cc0)

```ts
// timeline item used to flat-list
// item must include date property Date or string
// so that can be used to create Date object with new Date()
export interface TimelineItem {
  date: Date | string;
}

// when to add date divider
export type TimelineInjectDividerBy = 'never' | 'day' | 'month' | 'year';

// internally sort date
export type TimelineSortDateBy = 'desc' | 'asc';

// for rendering optimization ✨
// very recommended for large list
export interface TimelineItemSizeConfig {
  item: number;
  divider: number;
}

// <Timeline /> props
export interface TimelineProps<T extends TimelineItem>
  extends Omit<
      FlatListProps<T>,
      // listed flat-list props should be omitted
      | 'renderItem'
      | 'data'
      | 'horizontal'
      | 'viewabilityConfig'
      | 'keyExtractor'
      | 'getItemLayout'
    >,
    ViewabilityConfig {
  /**
   * item to render
   * typescript automatically infer `T` if it includes data property
   */
  data: T[];

  /**
   * sort data by date
   * @default 'desc'
   */
  sortDateBy?: TimelineSortDateBy;

  /**
   * when to inject divider comparing previous item
   * @default 'month'
   */
  injectDividerBy?: TimelineInjectDividerBy;

  /**
   * ref callback
   */
  refCallback?: (ref: FlatList<any>) => void;

  /**
   * renderDivider function
   *
   * **recommend pure function with useCallback**
   */
  renderDivider?: (date: Date) => ReactElement;

  /**
   * renderLabel function
   *
   * **recommend pure function with useCallback**
   */
  renderLabel?: (data: T) => ReactElement;

  /**
   * renderItem function
   *
   * **recommend pure function with useCallback**
   */
  renderItem: ListRenderItem<T>;

  /**
   * style for each item
   */
  itemContainerStyle?: StyleProp<ViewStyle>;

  /**
   * for rendering optimization
   * exact size of item & divider
   *
   * **recommend memoize with useMemo**
   */
  itemSizeForOptimization?: TimelineItemSizeConfig;

  /**
   * line color in hex
   * @default '#d8dee4'
   */
  lineColor?: string;

  /**
   * line thickness in px
   * @default 2px
   */
  lineThickness?: number;

  /**
   * label area contents width
   * @default '20%''
   */
  labelContentsWidth?: string | number;

  /**
   * label size
   *
   * @default '10%'
   */
  labelSize?: string | number;

  /**
   * label top offset in px
   */
  labelTopOffset?: number;

  /**
   * gap between label and item
   * @default 4px
   */
  labelPadding?: number;

  /**
   * label padding color
   * @default #ffffff
   */
  labelPaddingColor?: string;

  /**
   * label padding color
   * @default #888888
   */
  labelColor?: string;

  /**
   * flag to show horizontal line at divider
   * @default true
   */
  showsHorizontalDivider?: boolean;

  /**
   * horizontal divider thickness in px
   * @default 2px
   */
  horizontalDividerThickness?: number;

  /**
   * divider text style
   */
  dividerTextStyle?: StyleProp<TextStyle>;

  /**
   * format text rather than 2023-04-05 format
   *
   * **recommend pure function with useCallback**
   */
  dividerTextFormatter?: (date: Date) => string;

  /**
   * animation configuration
   *
   * **recommend memoize with useMemo**
   */
  animationConfig?: TimelineAnimationConfig;
}
```
